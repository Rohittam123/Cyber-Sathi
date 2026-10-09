const checklist = [
  "Use a unique password for every important account.",
  "Turn on two-step verification where it is available.",
  "Never share an OTP, PIN, password, or UPI PIN with anyone.",
  "Check the full website address before entering personal details.",
  "Verify urgent requests using an official app or contact number.",
  "Keep your phone, apps, and browser updated.",
];
export const CHECKLIST_STORAGE_KEY = "cybersaathi-checklist-v1";
export const CHECKLIST_ITEM_COUNT = checklist.length;

export function initChecklist(container, progressText, progressBar) {
  let checked = [];
  try {
    const stored = JSON.parse(localStorage.getItem(CHECKLIST_STORAGE_KEY) || "[]");
    if (Array.isArray(stored)) checked = stored.filter((index) => Number.isInteger(index) && index >= 0 && index < checklist.length);
  } catch (error) {
    console.warn("Could not load the saved checklist.", error);
  }

  function update() {
    const count = checked.length;
    progressText.textContent = `${count} of ${checklist.length} complete`;
    progressBar.style.width = `${(count / checklist.length) * 100}%`;
  }

  container.innerHTML = checklist.map((item, index) => `
    <label class="check-item">
      <input type="checkbox" data-check="${index}" ${checked.includes(index) ? "checked" : ""} />
      <span>${item}</span>
    </label>`).join("");

  container.querySelectorAll("[data-check]").forEach((input) => {
    input.addEventListener("change", () => {
      const index = Number(input.dataset.check);
      checked = input.checked ? [...new Set([...checked, index])] : checked.filter((savedIndex) => savedIndex !== index);
      try {
        localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(checked));
      } catch (error) {
        console.error("Could not save checklist progress to this browser.", error);
      }
      update();
    });
  });
  update();
}

const checklistContainer = document.querySelector("#checklist-items");
if (checklistContainer) {
  initChecklist(
    checklistContainer,
    document.querySelector("#checklist-progress-text"),
    document.querySelector("#checklist-progress-bar"),
  );
}
