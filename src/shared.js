import {
  ArrowLeftRight,
  ArrowRight,
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
  ReceiptText,
  RotateCcw,
  Route,
  ScanSearch,
  Search,
  Scale,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  Trash2,
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
  ReceiptText,
  RotateCcw,
  Route,
  ScanSearch,
  Search,
  Scale,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  Trash2,
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
  if (!toggle || !navigation) return;

  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    navigation.dataset.open = String(!open);
    toggle.innerHTML = `<i data-lucide="${open ? "menu" : "x"}"></i><span class="sr-only">Menü ${open ? "öffnen" : "schließen"}</span>`;
    refreshIcons(toggle);
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
