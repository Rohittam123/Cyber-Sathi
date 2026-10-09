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
- `js/auth.js` — Firebase email/password authentication UI.
- `js/firebase.js` and `js/firebase-config.js` — Firebase initialization and Firestore save helper/configuration.
- `js/cyber-chat.js` — site-wide AI cyber-safety chat interface; conversation history stays in memory for the current page session.
- `functions/index.js` — Firebase callable function that securely calls DeepSeek through OpenRouter without exposing the API key to the browser.
- `firestore.rules` — per-user rules for saved detailed reports, including the original message only after explicit user consent.

## Run locally

Serve this folder with a local static web server; shared header/footer partials, ES modules, and Firebase require an HTTP origin and do not work from a `file://` URL. For example, use the Live Server extension in VS Code or run `npx serve .` from this folder. Navigation between pages uses regular links and full-page loads.

## Enable Firebase

1. Create a Firebase project and register a Web app in the Firebase console.
2. Enable **Email/Password** under Authentication → Sign-in method.
3. Create a Cloud Firestore database.
4. Copy the web app configuration into `js/firebase-config.js`.
5. Publish `firestore.rules` to your Firestore database with `firebase deploy --only firestore:rules`. The current rules permit only the signed-in owner to read or write their own detailed report documents.

Local analysis, quiz, checklist, and awareness-score features remain usable without Firebase. Message analysis runs in the browser. The original message is not persisted unless the user explicitly checks the consent box and saves a detailed report while signed in. That report stores the checked message, type, risk level, summary, detected warning signs, recommended actions, and server timestamp in that user's Firestore subcollection. Account history loads only the authenticated user's Firestore documents; signed-out users see no account or browser-local analysis records. Firestore rules restrict each account to its own reports. Older summary-only records remain visible but cannot produce a message-specific PDF because their source text was never saved. Previously saved device-only records remain in browser storage but are intentionally excluded from My Account.

On the checker and account report, **Print / Save as PDF** opens a print-ready version of that specific report. Choose **Save as PDF** in the browser's print dialog to create a PDF file. No PDF library or report upload is used.

## Enable the AI cyber-safety chat

The chat generates responses from each question and recent context using `deepseek/deepseek-chat` through OpenRouter, rather than selecting answers from a predefined FAQ; responses may sometimes repeat. The conversation is sent to the callable function only while the page is open; it is not written to Firestore or local storage. The assistant is an educational aid, can make mistakes, and must not be given passwords, OTPs, recovery codes, or payment details.

The OpenRouter key must remain a Firebase Functions secret; never paste it into HTML or JavaScript.

1. Ensure `js/firebase-config.js` points to the Firebase project you intend to use. Install and sign in to the Firebase CLI if needed.
2. From this project folder, select that Firebase project with `firebase use <project-id>`.
3. Set the key as a secret (Firebase prompts for it; do not add it to source files): `firebase functions:secrets:set OPENROUTER_API_KEY`
4. Deploy the callable function: `firebase deploy --only functions`
5. Use the site from its normal HTTP(S) origin (Live Server works for local testing). The chat button is added to every page by `js/main.js`.

Cloud Functions deployment may require the Firebase project to be on the Blaze billing plan. OpenRouter usage can incur separate costs. The function bounds message size, context length, output size, and applies a basic per-instance request limit; monitor usage in Firebase and OpenRouter, and configure stronger abuse protection/App Check before wide public deployment.

The detector is a learning aid, not a security verdict. A message flagged as low risk may still be fraudulent, and the rules may miss new scam tactics.
