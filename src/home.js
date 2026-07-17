import "./styles.css";
import "./shared.js";

const filterButtons = document.querySelectorAll("[data-tool-filter]");
const toolCards = document.querySelectorAll("[data-tool-category]");
const resultCount = document.querySelector("[data-tool-count]");

function applyFilter(category) {
  let visible = 0;

  toolCards.forEach((card) => {
    const show = category === "all" || card.dataset.toolCategory === category;
    card.hidden = !show;
    if (show) visible += 1;
  });

  filterButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.toolFilter === category));
  });

  if (resultCount) {
    resultCount.textContent = `${visible} ${visible === 1 ? "Werkzeug" : "Werkzeuge"}`;
  }
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => applyFilter(button.dataset.toolFilter));
});
