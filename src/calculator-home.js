import "./styles.css";
import "./shared.js";

const filterButtons = document.querySelectorAll("[data-calculator-filter]");
const cards = document.querySelectorAll("[data-calculator-category]");
const resultCount = document.querySelector("[data-calculator-count]");

function applyFilter(filter) {
  let visible = 0;
  cards.forEach((card) => {
    const show = filter === "all" || card.dataset.calculatorCategory === filter;
    card.hidden = !show;
    if (show) visible += 1;
  });
  filterButtons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.calculatorFilter === filter)));
  if (resultCount) resultCount.textContent = `${visible} ${visible === 1 ? "Rechner" : "Rechner"}`;
}

filterButtons.forEach((button) => button.addEventListener("click", () => applyFilter(button.dataset.calculatorFilter)));

document.querySelectorAll("[data-category-jump]").forEach((link) => {
  link.addEventListener("click", () => {
    applyFilter(link.dataset.categoryJump);
    window.requestAnimationFrame(() => document.querySelector("[data-calculator-category]:not([hidden])")?.focus());
  });
});
