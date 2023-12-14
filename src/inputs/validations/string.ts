import { Unknown, ValidateInput } from "../../types";

export const startsWith = (
  startsWith: Unknown,
  em?: Unknown
): ValidateInput => {
  return ({ va }) => {
    return {
      v: va.startsWith(startsWith),
      em
    };
  };
};

export const endsWith = (endsWith: Unknown, em?: Unknown): ValidateInput => {
  return ({ va }) => {
    return {
      v: va.endsWith(endsWith),
      em
    };
  };
};
