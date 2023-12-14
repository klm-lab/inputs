import { Unknown, ValidateInput } from "../../types";

export const regex = (regex: RegExp & Unknown, em?: Unknown): ValidateInput => {
  return ({ va }) => {
    return {
      v: regex?.test(va),
      em
    };
  };
};
