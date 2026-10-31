import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Registration Number format validator:
 * Starts with PHARM/M, PHARM/MK, PHARM/MG, or PHARM/MS (also accepts PHAM for compatibility),
 * followed by a slash, four digits, another slash, the month, and the year.
 * Examples:
 * - PHARM/M/1042/09/24
 * - PHARM/MK/3821/01/23
 * - PHARM/MG/4901/09/22
 * - PHARM/MS/5120/09/25
 * - PHARM/M/1042/09/2024
 */
export const KUPSA_REG_NO_REGEX = /^PHAR?M\/(M|MK|MG|MS)\/\d{4}\/(0[1-9]|1[0-2]|\d{2})\/(\d{2}|\d{4})$/i;

export function isValidPharmacyRegNo(regNo: string): boolean {
  if (!regNo) return false;
  return KUPSA_REG_NO_REGEX.test(regNo.trim());
}

/**
 * Derives the expected Year of Study based on the registration number cohort.
 * For the 2026/2027 Academic Year:
 * - 2026 intake -> Year 1
 * - 2025 intake -> Year 2
 * - 2024 intake -> Year 3
 * - 2023 intake -> Year 4
 * - 2022 intake -> Year 5
 * - <= 2021 intake -> Year 5
 * - Prefix 'MS' -> Masters
 */
export function getExpectedYearOfStudy(regNo: string): string | null {
  const match = regNo.trim().match(KUPSA_REG_NO_REGEX);
  if (!match) return null;

  const prefix = match[1].toUpperCase();
  if (prefix === 'MS') {
    return 'Masters';
  }

  const rawYear = match[3];
  const admissionYear = rawYear.length === 4 ? parseInt(rawYear, 10) : 2000 + parseInt(rawYear, 10);

  switch (admissionYear) {
    case 2026:
      return 'Year 1';
    case 2025:
      return 'Year 2';
    case 2024:
      return 'Year 3';
    case 2023:
      return 'Year 4';
    case 2022:
      return 'Year 5';
    default:
      if (admissionYear < 2022) return 'Year 5';
      if (admissionYear > 2026) return 'Year 1';
      return null;
  }
}
