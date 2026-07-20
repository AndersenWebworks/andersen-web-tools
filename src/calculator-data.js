export const calculationData2026 = Object.freeze({
  verifiedOn: "2026-07-18",
  health: {
    generalRate: 14.6,
    averageAdditionalRate: 2.9,
    monthlyCeiling: 5812.5
  },
  care: {
    baseRate: 3.6,
    employerRate: 1.8,
    childlessSurcharge: 0.6,
    childReduction: 0.25,
    monthlyCeiling: 5812.5
  },
  pension: {
    employeeRate: 9.3,
    employerRate: 9.3,
    monthlyCeiling: 8450
  },
  unemployment: {
    employeeRate: 1.3,
    employerRate: 1.3,
    monthlyCeiling: 8450
  },
  minijob: {
    monthlyLimit: 603,
    minimumWage: 13.9,
    employeePensionRate: 3.6
  },
  commuterAllowance: 0.38,
  incomeTax: {
    basicAllowance: 12348,
    firstZoneEnd: 17799,
    secondZoneEnd: 69878,
    fourthZoneEnd: 277825,
    employeeLumpSum: 1230,
    soliThresholdSingle: 20350
  }
});

function careEmployeeRate(children, saxony = false, childlessSurchargeApplies = true) {
  const employerRate = saxony ? 1.3 : calculationData2026.care.employerRate;
  const childCount = Math.max(0, Math.min(5, Number(children) || 0));
  const childless = childCount === 0 && childlessSurchargeApplies ? calculationData2026.care.childlessSurcharge : 0;
  const reduction = childCount >= 2 ? (childCount - 1) * calculationData2026.care.childReduction : 0;
  return Math.max(0, calculationData2026.care.baseRate - employerRate + childless - reduction);
}

export function socialContributions2026(monthlyGross, options = {}) {
  const gross = Math.max(0, Number(monthlyGross) || 0);
  const additionalRate = Math.max(0, Number(options.additionalRate ?? calculationData2026.health.averageAdditionalRate));
  const healthBase = Math.min(gross, calculationData2026.health.monthlyCeiling);
  const pensionBase = Math.min(gross, calculationData2026.pension.monthlyCeiling);
  const health = healthBase * (calculationData2026.health.generalRate + additionalRate) / 200;
  const careRate = careEmployeeRate(options.children, options.saxony, options.childlessSurcharge !== false && options.childlessSurcharge !== "no");
  const care = healthBase * careRate / 100;
  const pension = pensionBase * calculationData2026.pension.employeeRate / 100;
  const unemployment = pensionBase * calculationData2026.unemployment.employeeRate / 100;
  return {
    total: health + care + pension + unemployment,
    health,
    care,
    pension,
    unemployment,
    careRate
  };
}

export function employerSocialContributions2026(monthlyGross, additionalRate = calculationData2026.health.averageAdditionalRate) {
  const gross = Math.max(0, Number(monthlyGross) || 0);
  const healthBase = Math.min(gross, calculationData2026.health.monthlyCeiling);
  const pensionBase = Math.min(gross, calculationData2026.pension.monthlyCeiling);
  const health = healthBase * (calculationData2026.health.generalRate + Number(additionalRate)) / 200;
  const care = healthBase * calculationData2026.care.employerRate / 100;
  const pension = pensionBase * calculationData2026.pension.employerRate / 100;
  const unemployment = pensionBase * calculationData2026.unemployment.employerRate / 100;
  return { total: health + care + pension + unemployment, health, care, pension, unemployment };
}

export function incomeTax2026(taxableIncome, splitting = false) {
  const divisor = splitting ? 2 : 1;
  const income = Math.floor(Math.max(0, Number(taxableIncome) || 0) / divisor);
  let tax;
  if (income <= calculationData2026.incomeTax.basicAllowance) tax = 0;
  else if (income <= calculationData2026.incomeTax.firstZoneEnd) {
    const y = (income - calculationData2026.incomeTax.basicAllowance) / 10000;
    tax = (914.51 * y + 1400) * y;
  } else if (income <= calculationData2026.incomeTax.secondZoneEnd) {
    const z = (income - calculationData2026.incomeTax.firstZoneEnd) / 10000;
    tax = (173.1 * z + 2397) * z + 1034.87;
  } else if (income <= calculationData2026.incomeTax.fourthZoneEnd) {
    tax = 0.42 * income - 11135.63;
  } else {
    tax = 0.45 * income - 19470.38;
  }
  return Math.floor(Math.max(0, tax)) * divisor;
}

export function estimatePayroll2026(monthlyGross, options = {}) {
  const gross = Math.max(0, Number(monthlyGross) || 0);
  const social = socialContributions2026(gross, options);
  const annualTaxable = Math.max(0, gross * 12 - social.total * 12 - calculationData2026.incomeTax.employeeLumpSum);
  const splitting = options.taxClass === "3";
  const annualIncomeTax = incomeTax2026(annualTaxable, splitting);
  const soliThreshold = calculationData2026.incomeTax.soliThresholdSingle * (splitting ? 2 : 1);
  const annualSoli = annualIncomeTax <= soliThreshold
    ? 0
    : Math.min(annualIncomeTax * 0.055, (annualIncomeTax - soliThreshold) * 0.119);
  const churchRate = Math.max(0, Number(options.churchRate) || 0);
  const annualChurchTax = annualIncomeTax * churchRate / 100;
  const monthlyTaxes = (annualIncomeTax + annualSoli + annualChurchTax) / 12;
  return {
    net: gross - social.total - monthlyTaxes,
    social,
    monthlyIncomeTax: annualIncomeTax / 12,
    monthlySoli: annualSoli / 12,
    monthlyChurchTax: annualChurchTax / 12,
    annualTaxable
  };
}

export function currentLocalDate() {
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
  return parts;
}
