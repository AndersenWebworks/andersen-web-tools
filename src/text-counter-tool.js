import "./styles.css";
import { copyText, downloadBlob, refreshIcons, showToast } from "./shared.js";

const elements = {
  text: document.querySelector("[data-counter-text]"),
  words: document.querySelector("[data-counter-words]"),
  characters: document.querySelector("[data-counter-characters]"),
  charactersNoSpaces: document.querySelector("[data-counter-characters-no-spaces]"),
  sentences: document.querySelector("[data-counter-sentences]"),
  paragraphs: document.querySelector("[data-counter-paragraphs]"),
  lines: document.querySelector("[data-counter-lines]"),
  readingTime: document.querySelector("[data-counter-reading-time]"),
  speakingTime: document.querySelector("[data-counter-speaking-time]"),
  copy: document.querySelector("[data-counter-copy]"),
  download: document.querySelector("[data-counter-download]"),
  clear: document.querySelector("[data-counter-clear]")
};

const wordSegmenter = "Segmenter" in Intl ? new Intl.Segmenter("de", { granularity: "word" }) : null;
const sentenceSegmenter = "Segmenter" in Intl ? new Intl.Segmenter("de", { granularity: "sentence" }) : null;
const graphemeSegmenter = "Segmenter" in Intl ? new Intl.Segmenter("de", { granularity: "grapheme" }) : null;

function countFallbackWords(text) {
  let words = 0;
  let insideWord = false;
  for (const character of text) {
    const whitespace = character.trim() === "";
    if (!whitespace && !insideWord) words += 1;
    insideWord = !whitespace;
  }
  return words;
}

function countWords(text) {
  if (!wordSegmenter) return countFallbackWords(text);
  let count = 0;
  for (const segment of wordSegmenter.segment(text)) {
    if (segment.isWordLike) count += 1;
  }
  return count;
}

function countSentences(text) {
  if (!text.trim()) return 0;
  if (sentenceSegmenter) return [...sentenceSegmenter.segment(text)].filter((segment) => segment.segment.trim()).length;
  let count = 0;
  let hasContent = false;
  for (const character of text) {
    if (character.trim()) hasContent = true;
    if (hasContent && [".", "!", "?"].includes(character)) {
      count += 1;
      hasContent = false;
    }
  }
  return count + (hasContent ? 1 : 0);
}

function countParagraphs(text) {
  let count = 0;
  let insideParagraph = false;
  for (const line of text.split("\n")) {
    if (line.trim()) {
      if (!insideParagraph) count += 1;
      insideParagraph = true;
    } else {
      insideParagraph = false;
    }
  }
  return count;
}

function formatDuration(minutes) {
  if (minutes <= 0) return "0 Min.";
  if (minutes < 1) return "unter 1 Min.";
  return `${Math.ceil(minutes)} Min.`;
}

function updateCounts() {
  const text = elements.text.value;
  const words = countWords(text);
  const graphemes = graphemeSegmenter ? [...graphemeSegmenter.segment(text)].length : [...text].length;
  let charactersNoSpaces = 0;
  for (const character of text) {
    if (character.trim()) charactersNoSpaces += 1;
  }

  elements.words.textContent = String(words);
  elements.characters.textContent = String(graphemes);
  elements.charactersNoSpaces.textContent = String(charactersNoSpaces);
  elements.sentences.textContent = String(countSentences(text));
  elements.paragraphs.textContent = String(countParagraphs(text));
  elements.lines.textContent = text ? String(text.split("\n").length) : "0";
  elements.readingTime.textContent = formatDuration(words / 200);
  elements.speakingTime.textContent = formatDuration(words / 130);
  elements.copy.disabled = !text;
  elements.download.disabled = !text;
}

elements.text.addEventListener("input", updateCounts);
elements.clear.addEventListener("click", () => {
  elements.text.value = "";
  elements.text.focus();
  updateCounts();
});
elements.copy.addEventListener("click", async () => {
  await copyText(elements.text.value);
  showToast("Text kopiert.");
});
elements.download.addEventListener("click", () => {
  downloadBlob(new Blob([elements.text.value], { type: "text/plain;charset=utf-8" }), "text.txt");
});

updateCounts();
refreshIcons();
