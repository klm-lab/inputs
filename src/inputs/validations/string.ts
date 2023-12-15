import { Unknown, ValidateInput } from "../../types";

export const startsWith = (
  startsWith: Unknown,
  em?: Unknown
): ValidateInput => {
  return ({ va }) => (va.startsWith(startsWith) ? null : em);
};

export const endsWith = (endsWith: Unknown, em?: Unknown): ValidateInput => {
  return ({ va }) => (va.endsWith(endsWith) ? null : em);
};
