# Descriptive Master — Production Starter

## What is implemented

### Student authentication
- Mobile number validation
- Server-generated OTP
- OTP stored as a hash, with 5-minute expiry and verification-attempt limits
- Secure HttpOnly session cookie
- Persistent user account in PostgreSQL
- Profile persistence

### Exam engine
- 10 descriptive tests
- 30-minute duration
- Essay (15 marks) + Comprehension (10 marks)
- 5 individual comprehension questions
- Autosave through API
- Resume an unsubmitted attempt
- Server-side elapsed-time check on submission
- Auto-submit when the browser timer reaches zero
- Attempt records retained in PostgreSQL

### Important
This is a deploy-ready **starter**, not a live hosted service. `OTP_MODE=dev` returns the OTP from the API for development. Before public launch, connect a real SMS OTP provider and set `OTP_MODE=production` after implementing the provider adapter in `lib/otp.ts`.

## Run locally

1. Install Node.js 20+.
2. Create a PostgreSQL database.
3. Copy `.env.example` to `.env` and set:
   - `DATABASE_URL`
   - `SESSION_SECRET`
   - `OTP_PEPPER`
4. Run:
   `npm install`
   `npx prisma generate`
   `npx prisma migrate dev --name init`
   `node scripts/seed.mjs`
5. Start:
   `npm run dev`

Then open `http://localhost:3000`.

## Production hardening still required
- Real SMS OTP provider and production rate limiting
- CAPTCHA / abuse controls for public OTP endpoints
- HTTPS and production domain
- Database backups
- Admin CMS for editing/publishing tests
- Evaluator/scoring service
- Result/leaderboard APIs
- Monitoring and error reporting
- Legal/privacy/terms pages


## Admin panel

Open `/admin` using the phone number configured as `ADMIN_PHONE`.
The admin can:
- create Test 11, 12, 13...
- edit essay topic and comprehension passage
- edit all 5 comprehension questions
- publish/unpublish tests
- delete tests

For a public launch, replace single-number admin authorization with a dedicated admin-user role in the database and add audit logging.


## Evaluation + leaderboard

Added in this package:
- `Evaluation` records linked one-to-one with each submitted attempt
- Essay subscores for grammar, relevance and structure
- Comprehension score out of 10
- Total score out of 25
- Feedback object stored in PostgreSQL
- Per-test leaderboard entries with rank/percentile API
- Result page at `/results/<attemptId>`

### Important
The included evaluator is a **transparent heuristic demo**, not an LLM. It checks response length, structure signals and lexical overlap. For a production product, connect an AI provider through a server-side API and keep the same `Evaluation` data contract. Do not put an AI API key in browser code.
