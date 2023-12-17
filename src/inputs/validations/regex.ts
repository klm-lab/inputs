import { Unknown, ValidateInput } from "../../types";

export const regex = (
  regex: RegExp & Unknown,
  errorMessage: Unknown
): ValidateInput => {
  return ({ va }) => (regex?.test(va) ? "" : errorMessage);
};
