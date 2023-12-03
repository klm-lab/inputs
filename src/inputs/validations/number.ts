import { Unknown, ValidateInput } from "../../types";

export const number = (em?: Unknown): ValidateInput => {
  return ({ value }) => {
    return { valid: !isNaN(value), em };
  };
};

export const min = (min: number, em?: Unknown): ValidateInput => {
  return ({ value }) => {
    return { valid: Number(value) >= min, em };
  };
};

export const max = (max: number, em?: Unknown): ValidateInput => {
  return ({ value }) => {
    return { valid: Number(value) <= max, em };
  };
};
