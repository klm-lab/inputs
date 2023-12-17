import { Unknown, ValidateInput } from "../../types";

export const startsWith = (
  startsWith: Unknown,
  errorMessage: Unknown
): ValidateInput => {
  return ({ va }) => (va.startsWith(startsWith) ? "" : errorMessage);
};

export const endsWith = (
  endsWith: Unknown,
  errorMessage: Unknown
): ValidateInput => {
  return ({ va }) => (va.endsWith(endsWith) ? "" : errorMessage);
};
