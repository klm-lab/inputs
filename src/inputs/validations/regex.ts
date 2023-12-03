import { Unknown, ValidateInput } from "../../types";

export const regex = (regex: RegExp & Unknown, em?: Unknown): ValidateInput => {
  return ({ value }) => {
    return {
      valid: regex?.test(value),
      em
    };
  };
};
