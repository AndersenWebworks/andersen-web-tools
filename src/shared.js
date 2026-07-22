import {
  ArrowLeftRight,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BadgeDollarSign,
  BadgePercent,
  Banknote,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CalendarRange,
  Calculator,
  Car,
  ChartNoAxesCombined,
  ChartSpline,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CircleCheck,
  CircleX,
  Clock3,
  Code2,
  Coins,
  Contact,
  Contrast,
  Copy,
  createIcons,
  CreditCard,
  Download,
  Eraser,
  ExternalLink,
  FileArchive,
  FileDown,
  FileImage,
  FileSignature,
  FileText,
  FileUp,
  Files,
  Fuel,
  Globe2,
  GripVertical,
  HandCoins,
  Heart,
  HeartPulse,
  ImageDown,
  ImagePlus,
  Images,
  Info,
  Landmark,
  Link,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Menu,
  Monitor,
  MousePointer2,
  Phone,
  Percent,
  PiggyBank,
  Plus,
  QrCode,
  RefreshCw,
  Repeat2,
  ReceiptText,
  RotateCcw,
  Route,
  ScanSearch,
  Search,
  Scale,
  ShieldCheck,
  Signature,
  SlidersHorizontal,
  Smartphone,
  Trash2,
  TextCursorInput,
  Type,
  Upload,
  UserRound,
  WalletCards,
  WalletMinimal,
  Wifi,
  Zap,
  X
} from "lucide";

const iconSet = {
  ArrowLeftRight,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BadgeDollarSign,
  BadgePercent,
  Banknote,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CalendarRange,
  Calculator,
  Car,
  ChartNoAxesCombined,
  ChartSpline,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CircleCheck,
  CircleX,
  Clock3,
  Code2,
  Coins,
  Contact,
  Contrast,
  Copy,
  CreditCard,
  Download,
  Eraser,
  ExternalLink,
  FileArchive,
  FileDown,
  FileImage,
  FileSignature,
  FileText,
  FileUp,
  Files,
  Fuel,
  Globe2,
  GripVertical,
  HandCoins,
  Heart,
  HeartPulse,
  ImageDown,
  ImagePlus,
  Images,
  Info,
  Landmark,
  Link,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Menu,
  Monitor,
  MousePointer2,
  Phone,
  Percent,
  PiggyBank,
  Plus,
  QrCode,
  RefreshCw,
  Repeat2,
  ReceiptText,
  RotateCcw,
  Route,
  ScanSearch,
  Search,
  Scale,
  ShieldCheck,
  Signature,
  SlidersHorizontal,
  Smartphone,
  Trash2,
  TextCursorInput,
  Type,
  Upload,
  UserRound,
  WalletCards,
  WalletMinimal,
  Wifi,
  Zap,
  X
};

export function refreshIcons(root = document) {
  createIcons({
    icons: iconSet,
    attrs: {
      "aria-hidden": "true",
      "stroke-width": 1.8
    },
    root
  });
}

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return "–";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function sanitizeFileStem(value) {
  const source = String(value || "datei").normalize("NFKD");
  let output = "";
  let previousDash = false;

  for (const character of source) {
    const code = character.charCodeAt(0);
    const isDigit = code >= 48 && code <= 57;
    const isUppercase = code >= 65 && code <= 90;
    const isLowercase = code >= 97 && code <= 122;

    if (isDigit || isUppercase || isLowercase) {
      output += character.toLowerCase();
      previousDash = false;
    } else if (!previousDash && output.length > 0) {
      output += "-";
      previousDash = true;
    }
  }

  while (output.endsWith("-")) output = output.slice(0, -1);
  return output || "datei";
}

export function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function copyText(value) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

export function showToast(message, tone = "success") {
  let region = document.querySelector("[data-toast-region]");
  if (!region) {
    region = document.createElement("div");
    region.className = "toast-region";
    region.dataset.toastRegion = "";
    region.setAttribute("aria-live", "polite");
    document.body.append(region);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast--${tone}`;
  toast.textContent = message;
  region.append(toast);

  window.setTimeout(() => {
    toast.classList.add("toast--leaving");
    window.setTimeout(() => toast.remove(), 220);
  }, 3200);
}

export function setButtonLoading(button, loading, label) {
  if (!button) return;
  if (loading) {
    button.dataset.originalLabel = button.innerHTML;
    button.disabled = true;
    button.innerHTML = `<i data-lucide="loader-circle" class="spin"></i><span>${label}</span>`;
    refreshIcons(button);
  } else {
    button.disabled = false;
    if (button.dataset.originalLabel) button.innerHTML = button.dataset.originalLabel;
    delete button.dataset.originalLabel;
    refreshIcons(button);
  }
}

function initNavigation() {
  const toggle = document.querySelector("[data-nav-toggle]");
  const navigation = document.querySelector("[data-navigation]");
  const toolsToggle = document.querySelector("[data-tools-menu-toggle]");
  const toolDirectory = document.querySelector("[data-tool-directory]");
  if (!toggle || !navigation) return;

  const mobileNavigation = window.matchMedia("(max-width: 780px)");

  function setToolDirectoryOpen(open, focusFirstLink = false) {
    if (!toolsToggle || !toolDirectory) return;
    toolsToggle.setAttribute("aria-expanded", String(open));
    navigation.dataset.menuOpen = String(open);
    toolsToggle.querySelector("svg")?.setAttribute("data-lucide", open ? "chevron-up" : "chevron-down");
    refreshIcons(toolsToggle);
    if (open && focusFirstLink) {
      window.requestAnimationFrame(() => toolDirectory.querySelector("a")?.focus());
    }
  }

  function setMobileNavigationOpen(open) {
    toggle.setAttribute("aria-expanded", String(open));
    navigation.dataset.open = String(open);
    document.documentElement.classList.toggle("has-open-navigation", open && mobileNavigation.matches);
    toggle.innerHTML = `<i data-lucide="${open ? "x" : "menu"}"></i><span class="sr-only">Menü ${open ? "schließen" : "öffnen"}</span>`;
    refreshIcons(toggle);
    if (!open) setToolDirectoryOpen(false);
  }

  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    setMobileNavigationOpen(!open);
  });

  toolsToggle?.addEventListener("click", () => {
    const open = toolsToggle.getAttribute("aria-expanded") === "true";
    setToolDirectoryOpen(!open);
  });

  toolsToggle?.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowDown") return;
    event.preventDefault();
    setToolDirectoryOpen(true, true);
  });

  navigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      setToolDirectoryOpen(false);
      setMobileNavigationOpen(false);
    });
  });

  document.addEventListener("click", (event) => {
    if (navigation.contains(event.target) || toggle.contains(event.target)) return;
    setToolDirectoryOpen(false);
    if (mobileNavigation.matches) setMobileNavigationOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    const toolMenuWasOpen = toolsToggle?.getAttribute("aria-expanded") === "true";
    const mobileMenuWasOpen = toggle.getAttribute("aria-expanded") === "true";
    setToolDirectoryOpen(false);
    setMobileNavigationOpen(false);
    if (toolMenuWasOpen) toolsToggle?.focus();
    else if (mobileMenuWasOpen) toggle.focus();
  });

  mobileNavigation.addEventListener("change", () => {
    setToolDirectoryOpen(false);
    setMobileNavigationOpen(false);
  });
}

function initFooterYear() {
  const year = new Intl.DateTimeFormat("de-DE", {
    year: "numeric",
    timeZone: "Europe/Berlin"
  }).format(new Date());
  document.querySelectorAll("[data-current-year]").forEach((element) => {
    element.textContent = year;
  });
}

document.documentElement.classList.add("js");
initNavigation();
initFooterYear();
refreshIcons();
