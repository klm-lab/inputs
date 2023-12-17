import { Unknown, ValidateInput } from "../../types";

export const number = (errorMessage: Unknown): ValidateInput => {
  return ({ va }) => (!!va && !isNaN(va) ? "" : errorMessage);
};

export const min = (
  min: number,
  errorMessage: Unknown,
  number?: boolean
): ValidateInput => {
  return ({ va }) =>
    (number ? Number(va) : va.length) >= min ? "" : errorMessage;
};

export const max = (
  max: number,
  errorMessage: Unknown,
  number?: boolean
): ValidateInput => {
  return ({ va }) =>
    (number ? Number(va) : va.length) <= max ? "" : errorMessage;
};
