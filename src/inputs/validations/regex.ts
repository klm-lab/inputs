import { Unknown, ValidateInput } from "../../types";

export const regex = (regex: RegExp & Unknown, em?: Unknown): ValidateInput => {
  return ({ va }) => (regex?.test(va) ? "" : em);
};
