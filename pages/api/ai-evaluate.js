const PRIMARY_MODEL = process.env.GEMINI_EVAL_MODEL || "gemini-3.6-flash";
const FALLBACK_MODELS = [PRIMARY_MODEL, "gemini-2.5-flash", "gemini-2.5-flash-lite"].filter((v, i, a) => v && a.indexOf(v) === i);

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, Number(n) || 0));
}

function normalise(result, submittedAnswers = []) {
  const essay = result?.essay || {};
  const rawComp = Array.isArray(result?.comprehension) ? result.comprehension : [];
  const comp = Array.from({ length: 5 }, (_, i) => rawComp[i] || {});
  const essayScore = clamp(essay.score, 0, 15);
  const comprehensionScore = clamp(comp.reduce((sum, x) => sum + clamp(x.score, 0, 2), 0), 0, 10);
  const totalScore = Number((essayScore + comprehensionScore).toFixed(1));
  return {
    essayScore: Number(essayScore.toFixed(1)), comprehensionScore: Number(comprehensionScore.toFixed(1)), totalScore,
    passed: totalScore >= 10,
    resultLabel: totalScore >= 10 ? "PASS" : "FAIL",
    remark: totalScore >= 22 ? "Excellent — very strong descriptive performance." : totalScore >= 18 ? "Very Good — strong performance, keep polishing accuracy." : totalScore >= 14 ? "Good — keep improving consistency and language accuracy." : totalScore >= 10 ? "Keep Improving — you have crossed the target, now work on weak areas." : "Needs Improvement — focus on fundamentals and regular timed practice.",
    essay: {
      score: Number(essayScore.toFixed(1)),
      breakdown: { relevance: clamp(essay.breakdown?.relevance, 0, 4), structure: clamp(essay.breakdown?.structure, 0, 3), arguments: clamp(essay.breakdown?.arguments, 0, 3), grammar: clamp(essay.breakdown?.grammar, 0, 3), vocabulary: clamp(essay.breakdown?.vocabulary, 0, 2) },
      whatWasGood: Array.isArray(essay.whatWasGood) ? essay.whatWasGood : [],
      whatWasWrong: Array.isArray(essay.whatWasWrong) ? essay.whatWasWrong : [],
      improvements: Array.isArray(essay.improvements) ? essay.improvements : [],
      languageErrors: Array.isArray(essay.languageErrors) ? essay.languageErrors : [],
      modelAnswer: essay.modelAnswer || "",
      suggestedStructure: essay.suggestedStructure || ""
    },
    comprehension: comp.map((x, i) => ({
      questionNo: i + 1,
      score: Number(clamp(x.score, 0, 2).toFixed(1)),
      studentAnswer: x.studentAnswer || submittedAnswers[i] || "",
      whatWasRight: x.whatWasRight || "",
      whatWasWrong: x.whatWasWrong || (rawComp[i] ? "" : "This question was not returned by the evaluator."),
      idealAnswer: x.idealAnswer || "",
      wordCount: Number(x.wordCount) || 0,
      wordLimitStatus: x.wordLimitStatus || ""
    })),
    overallFeedback: result?.overallFeedback || "", keyImprovements: Array.isArray(result?.keyImprovements) ? result.keyImprovements : []
  };
}

const responseSchema = { type: "OBJECT", properties: {
  essay: { type: "OBJECT", properties: {
    score: { type: "NUMBER" },
    breakdown: { type: "OBJECT", properties: { relevance: { type: "NUMBER" }, structure: { type: "NUMBER" }, arguments: { type: "NUMBER" }, grammar: { type: "NUMBER" }, vocabulary: { type: "NUMBER" } }, required: ["relevance", "structure", "arguments", "grammar", "vocabulary"] },
    whatWasGood: { type: "ARRAY", items: { type: "STRING" } },
    whatWasWrong: { type: "ARRAY", items: { type: "STRING" } },
    improvements: { type: "ARRAY", items: { type: "STRING" } },
    languageErrors: { type: "ARRAY", items: { type: "OBJECT", properties: { original: { type: "STRING" }, correction: { type: "STRING" }, type: { type: "STRING" }, explanation: { type: "STRING" } }, required: ["original", "correction", "type", "explanation"] } },
    suggestedStructure: { type: "STRING" },
    modelAnswer: { type: "STRING" }
  }, required: ["score", "breakdown", "whatWasGood", "whatWasWrong", "improvements", "languageErrors", "suggestedStructure", "modelAnswer"] },
  comprehension: { type: "ARRAY", items: { type: "OBJECT", properties: { score: { type: "NUMBER" }, studentAnswer: { type: "STRING" }, whatWasRight: { type: "STRING" }, whatWasWrong: { type: "STRING" }, idealAnswer: { type: "STRING" }, wordCount: { type: "NUMBER" }, wordLimitStatus: { type: "STRING" } }, required: ["score", "studentAnswer", "whatWasRight", "whatWasWrong", "idealAnswer", "wordCount", "wordLimitStatus"] } },
  overallFeedback: { type: "STRING" }, keyImprovements: { type: "ARRAY", items: { type: "STRING" } }
}, required: ["essay", "comprehension", "overallFeedback", "keyImprovements"] };

function isTemporaryCapacityError(status, data) {
  if (![429, 500, 502, 503, 504].includes(status)) return false;
  const msg = String(data?.error?.message || "").toLowerCase();
  return status !== 429 || /high demand|overload|capacity|temporar|resource.?exhausted|unavailable|quota/.test(msg);
}

async function callGemini(model, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`;
  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json", responseSchema, temperature: 0.15, maxOutputTokens: 9000 } }) });
    const data = await response.json();
    if (response.ok) return { data, model };
    if (!isTemporaryCapacityError(response.status, data) || attempt === 1) return { error: data?.error?.message || "Gemini evaluation failed.", status: response.status };
    await new Promise(resolve => setTimeout(resolve, 1200));
  }
  return { error: "Gemini evaluation failed.", status: 503 };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!process.env.GEMINI_API_KEY) return res.status(503).json({ error: "Free AI evaluation is not configured. Add GEMINI_API_KEY in the Vercel server environment." });
  const { essayTopic, essay, passage, questions, compAnswers } = req.body || {};
  if (!essayTopic || !passage || !Array.isArray(questions) || !Array.isArray(compAnswers)) return res.status(400).json({ error: "Missing evaluation input." });
  const payload = { essayTopic, essay: essay || "", passage, questions: questions.slice(0, 5), compAnswers: compAnswers.slice(0, 5) };
  const prompt = `You are a strict but fair senior evaluator for an IBPS PO Mains descriptive test. Evaluate the student's ACTUAL writing, not just give generic feedback.

MARKING: Total 25 = Essay 15 + Comprehension 10. Essay rubric: relevance 4, structure/coherence 3, arguments/depth 3, grammar/language 3, vocabulary/expression 2. Comprehension: 5 questions, 2 marks each. Award partial marks where appropriate.

ESSAY CHECK — do a meticulous language audit. Read the essay sentence by sentence and identify EVERY clear spelling error, grammar error, wrong word/phrase, punctuation problem that materially affects correctness, awkward/inappropriate expression, and repeated language issue. Do not invent errors: if a phrase is acceptable, do not flag it. For every real issue give the exact original text, corrected version, error type and a short explanation. Also assess topic relevance, introduction, paragraph structure, argument depth, examples, conclusion, coherence and vocabulary. Give concrete positives and concrete weaknesses. Provide a suggested structure for this exact topic and then write a strong model answer of about 250-300 words that directly answers the selected topic. The model answer is a reference solution, not the student's answer.

COMPREHENSION CHECK — for each of the 5 questions compare the student's answer directly with the passage. Award marks for the actual information present. State what is correct, what is missing/wrong, and give an ideal answer based ONLY on the supplied passage. Count the student's words and state whether the target 30-40 words was met; do not deduct merely because an answer is short unless the missing detail affects correctness.

FINAL FEEDBACK — give a concise overall diagnosis and 3-5 priority improvements. Do not make claims about actual exam selection probability. The app will determine PASS/FAIL: total score >= 10 is PASS and below 10 is FAIL.

Return only JSON matching the supplied schema. TEST DATA: ${JSON.stringify(payload)}`;
  try {
    for (const model of FALLBACK_MODELS) {
      const result = await callGemini(model, prompt);
      if (result.data) {
        const text = result.data?.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("").trim();
        if (!text) continue;
        try {
          const parsed = JSON.parse(text);
          if (!Array.isArray(parsed.comprehension) || parsed.comprehension.length < 5) continue;
          return res.status(200).json({ evaluation: normalise(parsed, compAnswers.slice(0, 5)), model, provider: "Google Gemini" });
        } catch (parseError) {
          continue;
        }
      }
    }
    return res.status(503).json({ error: "Gemini is temporarily busy. Please try the evaluation again in a few seconds." });
  } catch (error) {
    console.error("Gemini evaluation error", error);
    return res.status(500).json({ error: "Unable to evaluate this attempt right now. Please try again." });
  }
}
