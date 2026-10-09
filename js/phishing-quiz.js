const questions = [
  {
    question: "A text says your bank account will be blocked in 10 minutes and includes a sign-in link. What should you do?",
    answers: [
      "Tap the link quickly so the account stays open",
      "Open your bank’s official app or call the number on your card",
      "Reply with your account number to confirm your identity",
    ],
    correct: 1,
    explanation: "Urgency and an unexpected sign-in link are warning signs. Contact the bank through a channel you find independently.",
  },
  {
    question: "A caller says they need the one-time password sent to your phone to stop a suspicious transaction. What is safest?",
    answers: [
      "Share it if the caller knows your name",
      "Share only the first few digits",
      "Never share it; hang up and contact your bank directly",
    ],
    correct: 2,
    explanation: "Never share an OTP with a caller. End the call and reach your bank using its official app or published number.",
  },
  {
    question: "Someone sends you a QR code and says scanning it will let them send you money. What should you remember?",
    answers: [
      "A QR code can open a link or initiate a payment; check carefully before proceeding",
      "QR codes can only receive money",
      "It is safe if the code arrived from a familiar profile",
    ],
    correct: 0,
    explanation: "A QR code can direct you to a site or payment flow. Check the details on your screen and never enter a UPI PIN to receive money.",
  },
  {
    question: "A delivery message asks for a small fee through a link to release a parcel you weren't expecting. What should you do?",
    answers: [
      "Pay the small amount; it is probably harmless",
      "Use the courier’s official website or app to check the delivery",
      "Send your card details to ask whether the fee is real",
    ],
    correct: 1,
    explanation: "Unexpected delivery-fee messages can be phishing. Check delivery status using the courier’s official site or app.",
  },
  {
    question: "You already shared bank details on a website you now suspect was fake. What is the best next step?",
    answers: [
      "Wait to see whether anything happens",
      "Delete the message and do nothing",
      "Contact your bank through an official channel immediately and secure your account",
    ],
    correct: 2,
    explanation: "Act quickly: contact your bank using official details, secure affected accounts, and report suspected cyber financial fraud.",
  },
];

export const QUIZ_SCORE_STORAGE_KEY = "cybersaathi-quiz-score-v1";

export function renderQuiz(container, onComplete = () => {}) {
  let current = 0;
  let score = 0;
  let selected = null;

  function render() {
    const question = questions[current];
    const complete = current >= questions.length;
    if (complete) {
      const percent = Math.round((score / questions.length) * 100);
      let persistenceWarning = "";
      try {
        onComplete({ score, total: questions.length, percentage: percent, completedAt: new Date().toISOString() });
      } catch (error) {
        console.error("Could not save the quiz result in this browser.", error);
        persistenceWarning = '<p class="storage-warning">Your result is shown, but browser storage was unavailable and the score could not be saved.</p>';
      }
      container.innerHTML = `
        <div class="quiz-meta"><span>QUIZ COMPLETE</span><strong>${score} / ${questions.length} correct</strong></div>
        <div class="quiz-progress"><span style="width:100%"></span></div>
        <h3 class="quiz-question">${percent >= 80 ? "Great awareness—you know how to pause and verify." : "Good practice. Every red flag you learn can help."}</h3>
        <div class="quiz-feedback">You answered ${score} of ${questions.length} correctly. Review the explanations as you go, and remember: when in doubt, verify directly.</div>
        ${persistenceWarning}
        <div class="quiz-controls"><span>Try again to practice once more.</span><button class="button button-primary" type="button" data-restart>Try again ↻</button></div>`;
      container.querySelector("[data-restart]").addEventListener("click", () => {
        current = 0;
        score = 0;
        selected = null;
        render();
      });
      return;
    }

    container.innerHTML = `
      <div class="quiz-meta"><span>QUESTION ${current + 1} OF ${questions.length}</span><strong>${score} CORRECT</strong></div>
      <div class="quiz-progress"><span style="width:${(current / questions.length) * 100}%"></span></div>
      <h3 class="quiz-question">${question.question}</h3>
      <div class="quiz-options">${question.answers.map((answer, index) => `
        <button type="button" class="quiz-option" data-answer="${index}" ${selected !== null ? "disabled" : ""}>
          <span class="option-letter">${String.fromCharCode(65 + index)}</span>${answer}
        </button>`).join("")}</div>
      ${selected !== null ? `<div class="quiz-feedback">${question.explanation}</div><div class="quiz-controls"><span>${selected === question.correct ? "That’s right." : "Not quite—here’s why."}</span><button class="button button-primary" type="button" data-next>${current === questions.length - 1 ? "See results" : "Next question"} →</button></div>` : ""}`;

    container.querySelectorAll("[data-answer]").forEach((button) => {
      button.addEventListener("click", () => {
        selected = Number(button.dataset.answer);
        if (selected === question.correct) score += 1;
        container.querySelectorAll("[data-answer]").forEach((option) => {
          option.disabled = true;
          const answerIndex = Number(option.dataset.answer);
          if (answerIndex === question.correct) option.classList.add("correct");
          else if (answerIndex === selected) option.classList.add("incorrect");
        });
        render();
      });
    });
    container.querySelector("[data-next]")?.addEventListener("click", () => {
      current += 1;
      selected = null;
      render();
    });
  }

  render();
}

const quizContainer = document.querySelector("#quiz-container");
if (quizContainer) {
  renderQuiz(quizContainer, (result) => {
    localStorage.setItem(QUIZ_SCORE_STORAGE_KEY, JSON.stringify(result));
  });
}
