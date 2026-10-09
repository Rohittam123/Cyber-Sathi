import { CHECKLIST_ITEM_COUNT, CHECKLIST_STORAGE_KEY } from "./checklist.js";
import { QUIZ_SCORE_STORAGE_KEY } from "./phishing-quiz.js";

const container = document.querySelector("#awareness-score");

function readStoredValue(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch (error) {
    console.error(`Could not read ${key} from browser storage.`, error);
    return fallback;
  }
}

const quiz = readStoredValue(QUIZ_SCORE_STORAGE_KEY, null);
const storedChecklist = readStoredValue(CHECKLIST_STORAGE_KEY, null);
const hasChecklistProgress = Array.isArray(storedChecklist);
const checked = hasChecklistProgress ? storedChecklist : [];
const validChecked = Array.isArray(checked)
  ? [...new Set(checked.filter((index) => Number.isInteger(index) && index >= 0 && index < CHECKLIST_ITEM_COUNT))]
  : [];
const checklistPercent = hasChecklistProgress
  ? Math.round((validChecked.length / CHECKLIST_ITEM_COUNT) * 100)
  : null;
const quizPercent = Number.isInteger(quiz?.percentage) && quiz.percentage >= 0 && quiz.percentage <= 100
  ? quiz.percentage
  : null;
const availableScores = [quizPercent, checklistPercent].filter((score) => score !== null);
const overallPercent = availableScores.length
  ? Math.round(availableScores.reduce((sum, score) => sum + score, 0) / availableScores.length)
  : 0;
const overallDescription = availableScores.length === 0
  ? "Complete the quiz or checklist to start tracking your progress."
  : availableScores.length === 1
    ? "Based on the learning activity you have completed so far."
    : "A snapshot of your completed quiz and checklist.";

container.innerHTML = `
  <article class="score-card score-highlight">
    <div class="eyebrow eyebrow-light">OVERALL PROGRESS</div>
    <strong class="score-value">${overallPercent}<span>%</span></strong>
    <p>${overallDescription}</p>
    <div class="progress-track"><span style="width:${overallPercent}%"></span></div>
  </article>
  <article class="score-card">
    <div class="eyebrow eyebrow-light">PHISHING QUIZ</div>
    <strong class="score-value">${quizPercent === null ? "—" : `${quizPercent}<span>%</span>`}</strong>
    <p>${quizPercent === null ? "You haven't completed the quiz yet." : `You got ${quiz.score} of ${quiz.total} questions correct.`}</p>
    <a class="text-link" href="./phishing-quiz.html">${quizPercent === null ? "Take the quiz" : "Practice again"} <span aria-hidden="true">→</span></a>
  </article>
  <article class="score-card">
    <div class="eyebrow eyebrow-light">SAFETY CHECKLIST</div>
    <strong class="score-value">${hasChecklistProgress ? `${validChecked.length}<span>/${CHECKLIST_ITEM_COUNT}</span>` : "—"}</strong>
    <p>${validChecked.length === CHECKLIST_ITEM_COUNT && hasChecklistProgress ? "All checklist habits complete. Keep them up!" : hasChecklistProgress ? "Every checked habit is a step toward safer routines." : "Your checklist progress will appear here after your first selection."}</p>
    <a class="text-link" href="./checklist.html">Review checklist <span aria-hidden="true">→</span></a>
  </article>`;
