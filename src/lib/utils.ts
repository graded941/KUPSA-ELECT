import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Registration Number format validator:
 * Accepts formats starting with:
 * - PHARM/M
 * - PHARM/MK
 * - PHARM/MG
 * - PHARM/MS
 * (also accepts PHAM for backwards compatibility)
 * followed by a slash, four digits, another slash, the month, and the year.
 *
 * Supports month as 1-2 digits (01-12 or 1-12) or 3-letter month code (e.g. SEP, JAN).
 * Supports year as 2 digits (e.g. 24, 25, 26) or 4 digits (e.g. 2024, 2025, 2026).
 * Accepts optional slash or hyphen between month and year (e.g. /09/24, /09/2024, /0924).
 */
export const KUPSA_REG_NO_REGEX =
  /^PHAR?M\s*\/\s*(M|MK|MG|MS)\s*\/\s*\d{4}\s*\/\s*(0?[1-9]|1[0-2]|[A-Za-z]{3,9}|\d{1,2})\s*[\/-]?\s*(\d{2}|\d{4})$/i;

export function isValidPharmacyRegNo(regNo: string): boolean {
  if (!regNo) return false;
  return KUPSA_REG_NO_REGEX.test(regNo.trim());
}

/**
 * Extracts the prefix and admission year from a valid registration number.
 */
export function parseRegNoDetails(regNo: string): { prefix: string; yearNumber: number } | null {
  const match = regNo.trim().match(KUPSA_REG_NO_REGEX);
  if (!match) return null;

  const prefix = match[1].toUpperCase();
  const rawYear = match[3];
  const yearNumber = rawYear.length === 4 ? parseInt(rawYear, 10) : 2000 + parseInt(rawYear, 10);

  return { prefix, yearNumber };
}

/**
 * Returns the valid cohort years of study for a given registration number.
 * Accommodates standard B.Pharm progression and cohort intakes:
 * - MS prefix -> Masters
 * - 2026 intake -> Year 1
 * - 2025 intake -> Year 1, Year 2
 * - 2024 intake -> Year 1, Year 2, Year 3
 * - 2023 intake -> Year 2, Year 3, Year 4
 * - 2022 intake -> Year 3, Year 4, Year 5
 * - <= 2021 intake -> Year 4, Year 5
 */
export function getValidCohortYears(regNo: string): string[] {
  const parsed = parseRegNoDetails(regNo);
  if (!parsed) return [];

  if (parsed.prefix === 'MS') {
    return ['Masters'];
  }

  switch (parsed.yearNumber) {
    case 2026:
      return ['Year 1'];
    case 2025:
      return ['Year 1', 'Year 2'];
    case 2024:
      return ['Year 1', 'Year 2', 'Year 3'];
    case 2023:
      return ['Year 2', 'Year 3', 'Year 4'];
    case 2022:
      return ['Year 3', 'Year 4', 'Year 5'];
    case 2021:
      return ['Year 4', 'Year 5'];
    default:
      if (parsed.yearNumber < 2021) return ['Year 5'];
      return ['Year 1'];
  }
}

/**
 * Returns the primary recommended year of study for auto-alignment.
 */
export function getPrimaryCohortYear(regNo: string): string | null {
  const valid = getValidCohortYears(regNo);
  if (valid.length === 0) return null;

  const parsed = parseRegNoDetails(regNo);
  if (parsed?.prefix === 'MS') return 'Masters';

  // For 2024, Year 1 is standard admission cohort (and also fits Year 3)
  if (parsed?.yearNumber === 2024) return 'Year 1';
  if (parsed?.yearNumber === 2026) return 'Year 1';
  if (parsed?.yearNumber === 2025) return 'Year 2';
  if (parsed?.yearNumber === 2023) return 'Year 3';
  if (parsed?.yearNumber === 2022) return 'Year 4';
  if (parsed && parsed.yearNumber <= 2021) return 'Year 5';

  return valid[0];
}

/**
 * Checks whether the chosen year of study aligns with the cohort year based on registration number.
 */
export function isYearOfStudyAligned(regNo: string, yearOfStudy: string): boolean {
  if (!regNo || !yearOfStudy) return false;
  const valid = getValidCohortYears(regNo);
  return valid.includes(yearOfStudy);
}
