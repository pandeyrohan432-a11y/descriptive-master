# Descriptive Master — Production Starter

## Current evaluation system

The descriptive evaluation layer now uses a server-side OpenAI Responses API route at `POST /api/ai-evaluate`.

It evaluates the complete 25-mark paper:
- Essay: 15 marks — relevance 4, structure/coherence 3, arguments/depth 3, grammar/language 3, vocabulary/expression 2.
- Comprehension: 5 questions × 2 marks.
- Each comprehension answer is judged semantically against the passage, not by keyword overlap.
- Word-count compliance is checked separately.
- Every comprehension question returns the student's answer, marks, what was correct, what was wrong/missing, and an ideal 30–40 word answer.
- The essay returns marks, detailed strengths, weaknesses, concrete improvements and a 250–300 word model answer.
- The result view is designed to show question-wise evaluation plus complete solutions.

## AI configuration

Set these server-side environment variables in Vercel/production:
- `OPENAI_API_KEY` — required; never expose this in browser code.
- `OPENAI_EVAL_MODEL` — optional; defaults to `gpt-5.6-luna`.

The evaluator is intentionally server-side so students cannot inspect or obtain the API key from the client.

## Existing exam platform

- 10 descriptive tests
- 30-minute duration
- Essay (15) + Comprehension (10)
- 5 individual comprehension questions
- Autosave/resume architecture
- Scheduled test releases
- Admin/test architecture

## Student authentication

The repository also contains the OTP/session starter. Development OTP mode is still separate from production SMS delivery and must be connected to a real SMS provider before public launch.
