import { Unknown, ValidateInput } from "../../types";

export const minLength = (minLength: number, em?: Unknown): ValidateInput => {
  return ({ va }) => (va?.length >= minLength ? null : em);
};

export const maxLength = (maxLength: number, em?: Unknown): ValidateInput => {
  return ({ va }) => (va?.length <= maxLength ? null : em);
};

export const minLengthWithoutSpace = (
  minLengthWithoutSpace: number,
  em?: Unknown
): ValidateInput => {
  return ({ va }) =>
    va?.indexOf(" ") === -1 && va?.trim().length >= minLengthWithoutSpace
      ? null
      : em;
};

export const maxLengthWithoutSpace = (
  maxLengthWithoutSpace: number,
  em?: Unknown
): ValidateInput => {
  return ({ va }) =>
    va?.indexOf(" ") === -1 && va?.trim().length <= maxLengthWithoutSpace
      ? null
      : em;
};
