const MODEL = process.env.OPENAI_EVAL_MODEL || "gpt-5.6-luna";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, Number(n) || 0));
}

function normalise(result) {
  const essay = result.essay || {};
  const comp = Array.isArray(result.comprehension) ? result.comprehension : [];
  const essayScore = clamp(essay.score, 0, 15);
  const comprehensionScore = clamp(comp.reduce((sum, x) => sum + clamp(x.score, 0, 2), 0), 0, 10);
  return {
    essayScore: Number(essayScore.toFixed(1)),
    comprehensionScore: Number(comprehensionScore.toFixed(1)),
    totalScore: Number((essayScore + comprehensionScore).toFixed(1)),
    essay: {
      score: Number(essayScore.toFixed(1)),
      breakdown: {
        relevance: clamp(essay.breakdown?.relevance, 0, 4),
        structure: clamp(essay.breakdown?.structure, 0, 3),
        arguments: clamp(essay.breakdown?.arguments, 0, 3),
        grammar: clamp(essay.breakdown?.grammar, 0, 3),
        vocabulary: clamp(essay.breakdown?.vocabulary, 0, 2)
      },
      whatWasGood: Array.isArray(essay.whatWasGood) ? essay.whatWasGood : [],
      whatWasWrong: Array.isArray(essay.whatWasWrong) ? essay.whatWasWrong : [],
      improvements: Array.isArray(essay.improvements) ? essay.improvements : [],
      modelAnswer: essay.modelAnswer || ""
    },
    comprehension: comp.slice(0, 5).map((x, i) => ({
      questionNo: i + 1,
      score: Number(clamp(x.score, 0, 2).toFixed(1)),
      studentAnswer: x.studentAnswer || "",
      whatWasRight: x.whatWasRight || "",
      whatWasWrong: x.whatWasWrong || "",
      idealAnswer: x.idealAnswer || "",
      wordCount: Number(x.wordCount) || 0,
      wordLimitStatus: x.wordLimitStatus || ""
    })),
    overallFeedback: result.overallFeedback || "",
    keyImprovements: Array.isArray(result.keyImprovements) ? result.keyImprovements : []
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ error: "AI evaluation is not configured. Add OPENAI_API_KEY in the server environment." });
  }

  const { essayTopic, essay, passage, questions, compAnswers } = req.body || {};
  if (!essayTopic || !passage || !Array.isArray(questions) || !Array.isArray(compAnswers)) {
    return res.status(400).json({ error: "Missing evaluation input." });
  }

  const payload = {
    essayTopic,
    essay: essay || "",
    passage,
    questions: questions.slice(0, 5),
    compAnswers: compAnswers.slice(0, 5)
  };

  const system = `You are the senior evaluator for an IBPS PO Mains descriptive test. Evaluate strictly but fairly, like an experienced banking-exam descriptive examiner. The test is 25 marks: Essay 15 + Comprehension 10. Never award marks merely because the student's wording overlaps the passage. Judge meaning, accuracy, relevance, completeness, reasoning, language and clarity. Do not invent facts that are not needed to answer a passage question.

Essay rubric: relevance 4, structure/coherence 3, arguments/depth 3, grammar/language 3, vocabulary/expression 2. The five components must add to the essay score out of 15.
Comprehension: exactly 5 questions, each out of 2. A strong answer directly answers the question using the passage's meaning in the student's own words. Penalise missing key points, factual distortion, irrelevant material and serious lack of clarity. Word target is 30-40 words per answer; mention the word-count issue but do not let word count alone decide correctness.

For every comprehension question provide: marks, the student's answer, what was correct, what was missing/wrong, and an ideal 30-40 word answer. For the essay provide what was good, what was wrong, concrete improvements, and a useful model answer of about 250-300 words. The model answer is a learning solution, not something the student must reproduce verbatim.

Return only JSON matching the supplied schema.`;

  const schema = {
    type: "object",
    additionalProperties: false,
    properties: {
      essay: {
        type: "object", additionalProperties: false,
        properties: {
          score: { type: "number" },
          breakdown: { type: "object", additionalProperties: false, properties: { relevance: {type:"number"}, structure:{type:"number"}, arguments:{type:"number"}, grammar:{type:"number"}, vocabulary:{type:"number"}}, required:["relevance","structure","arguments","grammar","vocabulary"] },
          whatWasGood: { type:"array", items:{type:"string"} },
          whatWasWrong: { type:"array", items:{type:"string"} },
          improvements: { type:"array", items:{type:"string"} },
          modelAnswer: { type:"string" }
        }, required:["score","breakdown","whatWasGood","whatWasWrong","improvements","modelAnswer"]
      },
      comprehension: { type:"array", minItems:5, maxItems:5, items:{ type:"object", additionalProperties:false, properties:{ score:{type:"number"}, studentAnswer:{type:"string"}, whatWasRight:{type:"string"}, whatWasWrong:{type:"string"}, idealAnswer:{type:"string"}, wordCount:{type:"number"}, wordLimitStatus:{type:"string"} }, required:["score","studentAnswer","whatWasRight","whatWasWrong","idealAnswer","wordCount","wordLimitStatus"] } },
      overallFeedback:{type:"string"},
      keyImprovements:{type:"array",items:{type:"string"}}
    },
    required:["essay","comprehension","overallFeedback","keyImprovements"]
  };

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: MODEL,
        input: [
          { role: "system", content: [{ type: "input_text", text: system }] },
          { role: "user", content: [{ type: "input_text", text: JSON.stringify(payload) }] }
        ],
        text: { format: { type: "json_schema", name: "descriptive_evaluation", strict: true, schema } },
        max_output_tokens: 7000
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data?.error?.message || "OpenAI evaluation failed." });

    const text = data.output?.flatMap(x => x.content || []).find(x => x.type === "output_text")?.text;
    if (!text) return res.status(502).json({ error: "AI returned no evaluation." });

    const evaluation = normalise(JSON.parse(text));
    return res.status(200).json({ evaluation, model: MODEL });
  } catch (error) {
    console.error("AI evaluation error", error);
    return res.status(500).json({ error: "Unable to evaluate this attempt right now." });
  }
}
