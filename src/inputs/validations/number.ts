import { Unknown, ValidateInput } from "../../types";

export const number = (em?: Unknown): ValidateInput => {
  return ({ va }) => (!!va && !isNaN(va) ? "" : em);
};

export const min = (min: number, em?: Unknown): ValidateInput => {
  return ({ va }) => (Number(va) >= min ? "" : em);
};

export const max = (max: number, em?: Unknown): ValidateInput => {
  return ({ va }) => (Number(va) <= max ? "" : em);
};
