import { Unknown, ValidateInput } from "../../types";

export const startsWith = (
  startsWith: Unknown,
  em?: Unknown
): ValidateInput => {
  return ({ value }) => {
    return {
      valid: value.length > 0 && value.startsWith(startsWith),
      em
    };
  };
};

export const endsWith = (endsWith: Unknown, em?: Unknown): ValidateInput => {
  return ({ value }) => {
    return {
      valid: value.length > 0 && value.endsWith(endsWith),
      em
    };
  };
};
