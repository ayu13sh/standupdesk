"use strict";

const storageKey = "page-experience-sprint-checklist-v1";
const taskInputs = Array.from(document.querySelectorAll(".task-row input[type='checkbox']"));
const progressBar = document.getElementById("progress-bar");
const progressFill = document.getElementById("progress-fill");
const progressNumber = document.getElementById("progress-number");
const progressStatus = document.getElementById("progress-status");
const copyStatus = document.getElementById("copy-status");

function readSavedTasks() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(storageKey) || "{}");
    return saved && typeof saved === "object" ? saved : {};
  } catch {
    return {};
  }
}

function saveTasks() {
  try {
    const saved = Object.fromEntries(taskInputs.map((input) => [input.dataset.task, input.checked]));
    window.localStorage.setItem(storageKey, JSON.stringify(saved));
  } catch {
    progressStatus.textContent = "Progress is visible for this visit but could not be saved.";
  }
}

function updateProgress() {
  const complete = taskInputs.filter((input) => input.checked).length;
  const percentage = taskInputs.length ? Math.round((complete / taskInputs.length) * 100) : 0;
  progressBar.setAttribute("aria-valuenow", String(percentage));
  progressFill.style.width = `${percentage}%`;
  progressNumber.textContent = `${percentage}%`;
  progressStatus.textContent = `${complete} of ${taskInputs.length} steps complete`;
}

const savedTasks = readSavedTasks();
taskInputs.forEach((input) => {
  input.checked = savedTasks[input.dataset.task] === true;
  input.addEventListener("change", () => {
    saveTasks();
    updateProgress();
  });
});
updateProgress();

document.getElementById("reset-checklist").addEventListener("click", () => {
  if (!taskInputs.some((input) => input.checked)) return;
  if (!window.confirm("Clear all saved checkmarks?")) return;
  taskInputs.forEach((input) => { input.checked = false; });
  saveTasks();
  updateProgress();
  copyStatus.textContent = "Checkmarks cleared.";
});

document.getElementById("copy-brief").addEventListener("click", async () => {
  const brief = [
    "Page Experience Sprint",
    "Baseline: review field data, run a mobile Lighthouse audit, and prioritize key pages.",
    "Loading: identify the LCP element, optimize images, and trim render-blocking work.",
    "Interaction: find long tasks and audit third-party scripts.",
    "Stability & access: reserve media space and test keyboard navigation.",
    "Verify: review page metadata, ship changes, and repeat the same tests."
  ].join("\n");

  try {
    await navigator.clipboard.writeText(brief);
    copyStatus.textContent = "Sprint brief copied to clipboard.";
  } catch {
    copyStatus.textContent = "Clipboard access is unavailable in this browser context.";
  }
});