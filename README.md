# CyberSaathi — Scam & Phishing Awareness Assistant

A multi-page HTML, CSS, and JavaScript awareness app. Each main feature has its own URL. The message checker uses local, rule-based pattern matching; the quiz and checklist work without a Firebase project. Firebase Authentication and Firestore are optional until configured.

## Pages and modules

- `index.html` — home page.
- `scam-checker.html` — message analyzer.
- `phishing-quiz.html` — awareness quiz.
- `scam-library.html` — scam types and red flags.
- `safety-guide.html` — practical response and reporting guidance.
- `incident-response.html` — private, interactive recovery planner for suspicious messages, clicked links, exposed credentials, payments, remote access, and account takeovers.
- `checklist.html` — browser-saved cyber-safety checklist.
- `awareness-score.html` — quiz and checklist progress.
- `account.html` — signed-in user’s private detailed scam-check reports and report PDF controls.
- `about.html` — purpose, privacy, and limitations.
- `partials/header.html` and `partials/footer.html` — shared site navigation and footer loaded by `js/main.js`.
- `css/styles.css` — shared responsive styles.
- `js/main.js` — shared navigation, active link, mobile menu, authentication, and chat initialization.
- `js/scam-checker.js` — message checker page behavior.
- `js/scam-detector.js` — rule-based scam pattern matching.
- `js/phishing-quiz.js` — awareness quiz and locally saved result.
- `js/checklist.js` — checklist and browser-local progress.
- `js/incident-response.js` — scenario-specific response steps and in-page checklist progress; answers are not persisted.
- `js/awareness-score.js` — reads quiz and checklist progress.
- `js/account.js` — loads only the signed-in user’s Firestore reports, with per-message details and print/PDF controls.
- `js/report-pdf.js` — renders a specific report in a print-ready page so the user can save it as a PDF.
- `js/auth.js` — Firebase email/password authentication UI, email verification, and password reset.
- `js/firebase.js` and `js/firebase-config.js` — Firebase initialization and Firestore helpers.
- `js/ask-sathi.js` — Vercel API client for Ask Saathi.
- `js/cyber-chat.js` — site-wide Ask Saathi chat with predefined safety guides and AI-generated defensive threat-intelligence answers for typed questions.
- `api/ask-sathi.js` — Vercel serverless OpenRouter endpoint; reads the API key from the server environment and preserves reasoning context between turns.
- `functions/index.js` — legacy Firebase callable OpenRouter integration; the website chat uses the Vercel API instead.
- `firestore.rules` — per-user rules for saved reports, with the original message optional and stored only after explicit user consent.

## Run locally

Serve this folder with a local static web server; shared header/footer partials, ES modules, and Firebase require an HTTP origin and do not work from a `file://` URL. For example, use the Live Server extension in VS Code or run `npx serve .` from this folder. Navigation between pages uses regular links and full-page loads.

## Enable Firebase

1. Create a Firebase project and register a Web app in the Firebase console.
2. Enable **Email/Password** under Authentication → Sign-in method. Firebase sends a verification email during registration; unverified accounts cannot access saved reports.
3. Create a Cloud Firestore database.
4. Copy the web app configuration into `js/firebase-config.js`.
5. Publish `firestore.rules` to your Firestore database with `firebase deploy --only firestore:rules`. The current rules permit only the signed-in owner to read or write their own detailed report documents.
6. Deploy the site to Vercel. In **Project → Settings → Environment Variables**, add `OPENROUTER_API_KEY` with your OpenRouter key for Production (and Preview/Development if needed), then redeploy. Never put the key in frontend code or commit it. The Vercel function uses `nvidia/nemotron-3-ultra-550b-a55b:free` with reasoning enabled. Confirm the model is currently available to your OpenRouter account.
7. For local Vercel development, create `.env.local` in the project root with `OPENROUTER_API_KEY=your-key`, then run `vercel dev`. `.env.local` is ignored by Git; do not share or commit it.

Local analysis, quiz, checklist, and awareness-score features remain usable without Firebase. Message analysis runs in the browser. New accounts receive a verification email; users must verify their address before account access is enabled. Signing in with an unverified account sends a fresh verification link. Password reset is available from the sign-in form. When a verified user is signed in, a scam-check report is automatically saved to that user's Firestore subcollection with the message type, risk level, summary, warning signs, recommended actions, and server timestamp. The original message is excluded unless the user opts in on the checker before analyzing it. Signed-out checks are not saved; if the user signs in while a result is open, that report is saved then. Account history loads only the verified authenticated user's Firestore documents; signed-out or unverified users see no account or browser-local analysis records. Firestore rules restrict each account to its own reports and require verified email for access. Reports saved without their source text can display the full assessment, but cannot produce a message-specific PDF. Older summary-only records remain visible but cannot produce a message-specific PDF because their source text was never saved. Previously saved device-only records remain in browser storage but are intentionally excluded from My Account.

On the checker and account report, **Print / Save as PDF** opens a print-ready version of that specific report. Choose **Save as PDF** in the browser's print dialog to create a PDF file. No PDF library or report upload is used.

## CyberSaathi help chat

The site-wide chat provides curated Basic and Intermediate cyber-safety guides and AI-generated answers to typed questions. Typed questions are sent to the Vercel serverless endpoint, which calls OpenRouter using the server-side `OPENROUTER_API_KEY` environment variable. The model's reasoning context is retained for follow-up questions but is not displayed as an answer. Do not submit passwords, OTPs, recovery codes, private keys, or confidential internal data. Threat-intelligence answers are educational analysis, may be incomplete or out of date, and do not verify live indicators or attribute activity with certainty. Confirm important findings with trusted, current sources. The API applies input limits and a best-effort per-instance rate limit; configure additional abuse controls if exposing the endpoint publicly.

The detector is a learning aid, not a security verdict. A message flagged as low risk may still be fraudulent, and the rules may miss new scam tactics.
