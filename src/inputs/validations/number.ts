import { Unknown, ValidateInput } from "../../types";

export const number = (em?: Unknown): ValidateInput => {
  return ({ va }) => (!!va && !isNaN(va) ? null : em);
};

export const min = (min: number, em?: Unknown): ValidateInput => {
  return ({ va }) => (Number(va) >= min ? null : em);
};

export const max = (max: number, em?: Unknown): ValidateInput => {
  return ({ va }) => (Number(va) <= max ? null : em);
};
