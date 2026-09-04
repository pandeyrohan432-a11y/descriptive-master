const MODEL = process.env.GEMINI_EVAL_MODEL || "gemini-3.7-flash";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, Number(n) || 0));
}

function normalise(result) {
  const essay = result?.essay || {};
  const comp = Array.isArray(result?.comprehension) ? result.comprehension : [];
  const essayScore = clamp(essay.score, 0, 15);
  const comprehensionScore = clamp(comp.slice(0, 5).reduce((sum, x) => sum + clamp(x.score, 0, 2), 0), 0, 10);
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
    overallFeedback: result?.overallFeedback || "",
    keyImprovements: Array.isArray(result?.keyImprovements) ? result.keyImprovements : []
  };
}

const responseSchema = {
  type: "OBJECT",
  properties: {
    essay: {
      type: "OBJECT",
      properties: {
        score: { type: "NUMBER" },
        breakdown: {
          type: "OBJECT",
          properties: {
            relevance: { type: "NUMBER" },
            structure: { type: "NUMBER" },
            arguments: { type: "NUMBER" },
            grammar: { type: "NUMBER" },
            vocabulary: { type: "NUMBER" }
          },
          required: ["relevance", "structure", "arguments", "grammar", "vocabulary"]
        },
        whatWasGood: { type: "ARRAY", items: { type: "STRING" } },
        whatWasWrong: { type: "ARRAY", items: { type: "STRING" } },
        improvements: { type: "ARRAY", items: { type: "STRING" } },
        modelAnswer: { type: "STRING" }
      },
      required: ["score", "breakdown", "whatWasGood", "whatWasWrong", "improvements", "modelAnswer"]
    },
    comprehension: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          score: { type: "NUMBER" },
          studentAnswer: { type: "STRING" },
          whatWasRight: { type: "STRING" },
          whatWasWrong: { type: "STRING" },
          idealAnswer: { type: "STRING" },
          wordCount: { type: "NUMBER" },
          wordLimitStatus: { type: "STRING" }
        },
        required: ["score", "studentAnswer", "whatWasRight", "whatWasWrong", "idealAnswer", "wordCount", "wordLimitStatus"]
      }
    },
    overallFeedback: { type: "STRING" },
    keyImprovements: { type: "ARRAY", items: { type: "STRING" } }
  },
  required: ["essay", "comprehension", "overallFeedback", "keyImprovements"]
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({
      error: "Free AI evaluation is not configured. Add GEMINI_API_KEY in the Vercel server environment."
    });
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

  const prompt = `You are the senior evaluator for an IBPS PO Mains descriptive test. Evaluate strictly but fairly, like an experienced banking-exam descriptive examiner.

The test is 25 marks: Essay 15 + Comprehension 10.
Essay rubric: relevance 4, structure/coherence 3, arguments/depth 3, grammar/language 3, vocabulary/expression 2. These five components must add to the essay score out of 15.
Comprehension has exactly 5 questions, each out of 2. Judge semantic correctness, relevance, completeness and clarity; never award marks merely because wording overlaps the passage.
Each comprehension answer has a target of 30-40 words. Mention word-count problems, but do not let word count alone decide correctness.

For the essay provide: score, rubric breakdown, what was good, what was wrong, concrete improvements, and a useful model answer of about 250-300 words.
For EVERY comprehension question provide: score, the student's answer, what was correct, what was missing/wrong, and an ideal answer of 30-40 words.
Also provide overall feedback and key improvements.

Be specific and educational. Do not invent facts outside the supplied material when evaluating comprehension. Return only JSON matching the supplied response schema.

TEST DATA:
${JSON.stringify(payload)}`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema,
          temperature: 0.2,
          maxOutputTokens: 7000
        }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("Gemini evaluation failed", data);
      return res.status(response.status).json({
        error: data?.error?.message || "Gemini evaluation failed."
      });
    }

    const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("").trim();
    if (!text) return res.status(502).json({ error: "AI returned no evaluation." });

    const evaluation = normalise(JSON.parse(text));
    return res.status(200).json({ evaluation, model: MODEL, provider: "Google Gemini Free Tier" });
  } catch (error) {
    console.error("Gemini evaluation error", error);
    return res.status(500).json({ error: "Unable to evaluate this attempt right now." });
  }
}
