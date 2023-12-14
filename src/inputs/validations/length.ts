import { Unknown, ValidateInput } from "../../types";

export const minLength = (minLength: number, em?: Unknown): ValidateInput => {
  return ({ va }) => {
    return { v: va?.length >= minLength, em };
  };
};

export const maxLength = (maxLength: number, em?: Unknown): ValidateInput => {
  return ({ va }) => {
    return { v: va?.length <= maxLength, em };
  };
};

export const minLengthWithoutSpace = (
  minLengthWithoutSpace: number,
  em?: Unknown
): ValidateInput => {
  return ({ va }) => {
    return {
      v: va?.indexOf(" ") === -1 && va?.trim().length >= minLengthWithoutSpace,
      em
    };
  };
};

export const maxLengthWithoutSpace = (
  maxLengthWithoutSpace: number,
  em?: Unknown
): ValidateInput => {
  return ({ va }) => {
    return {
      v: va?.indexOf(" ") === -1 && va?.trim().length <= maxLengthWithoutSpace,
      em
    };
  };
};
