import "./styles.css";
import "./shared.js";
import { calculators } from "./calculator-catalog.js";
import { browserTools } from "./tool-catalog.js";

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

const baseUrl = import.meta.env.BASE_URL;
const searchEntries = [
  ...browserTools.map((tool) => ({
    title: tool.title,
    description: tool.description,
    href: `${baseUrl}${tool.slug}/`
  })),
  ...calculators.map((calculator) => ({
    title: calculator.title,
    description: calculator.description,
    href: `${baseUrl}rechner/${calculator.slug}/`
  }))
];
const titleComparer = new Intl.Collator("de-DE", { sensitivity: "base", usage: "search" });
const searchForm = document.querySelector("[data-tool-search-form]");
const searchInput = document.querySelector("[data-tool-search]");
const searchOptions = document.querySelector("[data-tool-search-options]");
const searchClear = document.querySelector("[data-tool-search-clear]");

function selectedEntry() {
  const value = searchInput?.value.trim() || "";
  return searchEntries.find((entry) => titleComparer.compare(entry.title, value) === 0);
}

if (searchOptions) {
  searchEntries.forEach((entry) => {
    const option = document.createElement("option");
    option.value = entry.title;
    option.label = entry.description;
    searchOptions.append(option);
  });
}

searchInput?.addEventListener("input", () => {
  searchClear.hidden = searchInput.value.length === 0;
});

searchInput?.addEventListener("change", () => {
  const entry = selectedEntry();
  if (entry) window.location.assign(entry.href);
});

searchClear?.addEventListener("click", () => {
  searchInput.value = "";
  searchClear.hidden = true;
  searchInput.focus();
});

searchForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const entry = selectedEntry();
  window.location.assign(entry?.href || `${baseUrl}alle-werkzeuge/`);
});
