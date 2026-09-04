export type EvaluationInput = {
  essayTopic: string;
  essay: string;
  passage: string;
  questions: string[];
  compAnswers: string[];
};

/**
 * The production evaluator lives in pages/api/ai-evaluate.js so the AI key
 * never reaches the browser. This module documents the contract used by the
 * AI evaluation service and can be imported by typed server code later.
 */
export type EvaluationResult = {
  essayScore: number;
  comprehensionScore: number;
  totalScore: number;
  essay: {
    score: number;
    breakdown: {
      relevance: number;
      structure: number;
      arguments: number;
      grammar: number;
      vocabulary: number;
    };
    whatWasGood: string[];
    whatWasWrong: string[];
    improvements: string[];
    modelAnswer: string;
  };
  comprehension: Array<{
    questionNo: number;
    score: number;
    studentAnswer: string;
    whatWasRight: string;
    whatWasWrong: string;
    idealAnswer: string;
    wordCount: number;
    wordLimitStatus: string;
  }>;
  overallFeedback: string;
  keyImprovements: string[];
};
