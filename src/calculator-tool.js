import "./styles.css";
import "./shared.js";
import { calculatorBySlug } from "./calculator-catalog.js";
import { copyText, refreshIcons, showToast } from "./shared.js";

const calculator = calculatorBySlug.get(document.body.dataset.calculatorSlug);
const form = document.querySelector("[data-calculator-form]");
const fieldsRoot = document.querySelector("[data-calculator-fields]");
const resultRoot = document.querySelector("[data-calculator-result]");
const emptyRoot = document.querySelector("[data-calculator-empty]");
const errorRoot = document.querySelector("[data-calculator-error]");
const resetButton = document.querySelector("[data-calculator-reset]");
const copyButton = document.querySelector("[data-calculator-copy]");
const inputs = new Map();
let currentSummary = "";
let calculationFrame = 0;

function element(tagName, className, text) {
  const node = document.createElement(tagName);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function setError(message = "") {
  errorRoot.hidden = !message;
  errorRoot.querySelector("span").textContent = message;
}

function currentValues() {
  return Object.fromEntries([...inputs].map(([id, input]) => [id, input.value]));
}

function updateFieldVisibility() {
  const values = currentValues();
  calculator.fields.forEach((field) => {
    const wrapper = inputs.get(field.id)?.closest("[data-calculator-field]");
    if (!wrapper || !field.visibleWhen) return;
    const [dependency, allowedValues] = Object.entries(field.visibleWhen)[0];
    wrapper.hidden = !allowedValues.includes(values[dependency]);
  });
}

function fieldValue(field) {
  return field.valueProvider ? field.valueProvider() : field.value;
}

function createInput(field) {
  const wrapper = element("div", "form-field");
  wrapper.dataset.calculatorField = field.id;
  const inputId = `calculator-${field.id}`;
  const label = element("label", "", field.label);
  label.htmlFor = inputId;
  wrapper.append(label);

  let input;
  if (field.type === "select") {
    input = element("select", "select-input");
    field.options.forEach(([value, optionLabel]) => {
      const option = element("option", "", optionLabel);
      option.value = value;
      option.selected = String(value) === String(fieldValue(field));
      input.append(option);
    });
  } else {
    input = element("input", "text-input");
    input.type = field.type;
    input.value = fieldValue(field);
    if (field.type === "number") input.inputMode = "decimal";
    if (field.min !== undefined) input.min = String(field.min);
    if (field.max !== undefined) input.max = String(field.max);
    if (field.step !== undefined) input.step = String(field.step);
  }
  input.id = inputId;
  input.name = field.id;

  if (field.unit) {
    const inputWrapper = element("div", "input-with-unit");
    inputWrapper.append(input, element("span", "", field.unit));
    wrapper.append(inputWrapper);
  } else {
    wrapper.append(input);
  }

  if (field.help) {
    const helpId = `${inputId}-help`;
    const help = element("p", "field-hint", field.help);
    help.id = helpId;
    input.setAttribute("aria-describedby", helpId);
    wrapper.append(help);
  }

  inputs.set(field.id, input);
  return wrapper;
}

function clearResult() {
  resultRoot.hidden = true;
  emptyRoot.hidden = false;
  copyButton.disabled = true;
  currentSummary = "";
  setError();
}

function renderResult(calculation) {
  resultRoot.replaceChildren();
  const primary = element("div", "primary-result");
  primary.append(element("span", "", calculation.primaryLabel), element("strong", "", calculation.primaryValue));
  if (calculation.explanation) primary.append(element("p", "", calculation.explanation));
  resultRoot.append(primary);

  const metrics = element("div", "metric-grid calculator-metrics");
  calculation.metrics.forEach((item) => {
    const metricNode = element("div", `metric${item.tone === "accent" ? " metric--accent" : ""}`);
    metricNode.append(element("span", "", item.label), element("strong", "", item.value));
    metrics.append(metricNode);
  });
  resultRoot.append(metrics);
  resultRoot.hidden = false;
  emptyRoot.hidden = true;
  copyButton.disabled = false;
  currentSummary = `${calculation.primaryLabel}: ${calculation.primaryValue}. ${calculation.metrics.map((item) => `${item.label}: ${item.value}`).join(". ")}`;
}

function calculate(reportInvalid = false) {
  setError();
  try {
    const activeInputs = [...inputs.values()].filter((input) => !input.closest("[data-calculator-field]").hidden);
    const invalidInput = activeInputs.find((input) => !input.checkValidity());
    if (invalidInput) {
      if (reportInvalid) invalidInput.reportValidity();
      clearResult();
      return;
    }
    renderResult(calculator.calculate(currentValues()));
  } catch (error) {
    clearResult();
    setError(error instanceof Error ? error.message : "Die Rechnung konnte nicht ausgeführt werden.");
  }
}

function reset() {
  calculator.fields.forEach((field) => {
    inputs.get(field.id).value = fieldValue(field);
  });
  updateFieldVisibility();
  calculate();
}

function scheduleCalculation() {
  cancelAnimationFrame(calculationFrame);
  calculationFrame = requestAnimationFrame(() => calculate());
}

if (!calculator || !form || !fieldsRoot) {
  document.body.textContent = "Dieser Rechner konnte nicht geladen werden.";
} else {
  const regularFields = calculator.fields.filter((field) => !field.advanced);
  const advancedFields = calculator.fields.filter((field) => field.advanced);
  regularFields.forEach((field) => fieldsRoot.append(createInput(field)));
  if (advancedFields.length) {
    const details = element("details", "calculator-advanced");
    const summary = element("summary", "", "Weitere Einstellungen");
    const advancedGrid = element("div", "form-grid calculator-advanced__grid");
    advancedFields.forEach((field) => advancedGrid.append(createInput(field)));
    details.append(summary, advancedGrid);
    fieldsRoot.append(details);
  }
  updateFieldVisibility();

  inputs.forEach((input) => input.addEventListener("input", () => {
    updateFieldVisibility();
    scheduleCalculation();
  }));
  inputs.forEach((input) => input.addEventListener("change", scheduleCalculation));
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    calculate(true);
  });
  resetButton.addEventListener("click", reset);
  copyButton.addEventListener("click", async () => {
    await copyText(currentSummary);
    showToast("Ergebnis kopiert.");
  });
  calculate();
  refreshIcons();
}
