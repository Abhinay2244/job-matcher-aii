# AI Job Scraper & Resume Matcher

An AI-powered tool that matches a resume (pasted as text or uploaded as a PDF) against live job listings, using Google's Gemini API to score and explain each match.

**Live demo:** https://job-matcher-aii.onrender.com
**Note:** hosted on Render's free tier — the first request may take 30-60 seconds if the instance has spun down from inactivity.

## Approach

The core idea: fetch real, live job listings, do a fast local pre-filter to narrow down to plausibly relevant jobs, then use an LLM to actually reason about fit between the resume and each job — rather than relying on simple keyword matching alone for the final decision.

**Pipeline:**
1. Fetch live job listings from RemoteOK's free public API (no auth required)
2. Pre-filter jobs locally using a skill-to-tag mapping (fast, zero API cost) — this avoids sending every job to the LLM, which would be slow and wasteful
3. If tag-based filtering finds no candidates (RemoteOK's live feed is not always tech-heavy — see Known Limitations below), fall back to a small sample of jobs so the AI itself can judge relevance
4. Send each candidate job + the resume to Gemini, which returns a 0-100 match score and a short explanation
5. Return results to the frontend, which displays them as ranked cards

Resume input supports both pasted text and PDF upload (parsed server-side with `pdf-parse`).

## Tech Stack

- **Backend:** Node.js, Express
- **AI:** Google Gemini API (`gemini-3.5-flash-lite`, via `@google/generative-ai`)
- **PDF parsing:** `pdf-parse`
- **File uploads:** `multer` (in-memory storage — files are never written to disk)
- **Job data:** RemoteOK public API
- **Frontend:** Plain HTML/CSS/JavaScript (no framework — kept intentionally simple)
- **Deployment:** Render (free tier)

## Architecture Decisions

- **Tag pre-filtering before LLM calls** — filtering ~100+ jobs down to a relevant subset locally (free, instant) before spending API calls only on likely-relevant jobs, rather than scoring every job with the LLM.
- **Parallel Gemini calls** (`Promise.all`) rather than sequential — cut response time from ~4 minutes to ~1-2 minutes on the free-tier instance.
- **Shared matching function** (`matchResumeToJobs`) used by both the text-input route (`/match-all`) and the PDF-upload route (`/match-pdf`) — avoids duplicating the core logic across two endpoints.
- **In-memory file storage for uploads** — PDFs are parsed for text and immediately discarded, never written to disk. This also matches Render's free-tier filesystem behavior (not guaranteed persistent between requests).

## Known Limitations

- **RemoteOK's live feed varies in content.** At several points during development and testing, the live batch of jobs was dominated by non-technical roles (hospitality, retail, trades) with very few software/tech-tagged postings. This isn't a bug in the matching logic — it's a real characteristic of pulling from a live, third-party job feed. `test-high-match.js` (see Testing below) demonstrates the scoring logic works correctly when a genuinely matching job is available.
- **Prompt injection partially mitigated, not fully solved.** Some job descriptions on RemoteOK contain hidden text designed to manipulate AI screening tools (a documented anti-scraper tactic). The prompt explicitly instructs Gemini to treat the job description as data only and ignore embedded instructions — this prevents the injected text from changing scores, but Gemini occasionally still references the injected text in its explanation. A more complete fix would sanitize job descriptions before they reach the prompt; out of scope for this MVP's timeline.
- **Free-tier cold starts.** The Render free instance spins down after inactivity; the first request after idle time takes 30-60+ seconds before processing even begins.

## Testing

- `test-filter.js` — isolated, zero-API-cost test of the tag-filtering and synonym-mapping logic, used to debug filtering bugs (substring-matching false positives, tag sparsity) without burning API calls.
- `test-high-match.js` — validates that the scoring logic correctly produces high scores against a genuinely matching job description, since RemoteOK's live feed didn't always contain a real matching job during testing.

## Running Locally

```bash
git clone https://github.com/Abhinay2244/job-matcher-aii.git
cd job-matcher-aii
npm install
```

Create a `.env` file in the project root:
```
GEMINI_API_KEY=your_key_here
```

Start the server:
```bash
npm start
```

Visit `http://localhost:3000`.

## Project Structure

```
job-matcher-ai/
├── index.js            # Express server, all routes
├── public/
│   └── index.html      # Frontend (resume input, results display)
├── test-filter.js      # Local filter-logic test (no API calls)
├── test-high-match.js  # Mock high-match validation test
├── package.json
└── .env                 # (not committed — see .gitignore)
```