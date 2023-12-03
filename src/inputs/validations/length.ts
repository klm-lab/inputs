import { Unknown, ValidateInput } from "../../types";

export const minLength = (minLength: number, em?: Unknown): ValidateInput => {
  return ({ value }) => {
    return { valid: value?.length >= minLength, em };
  };
};

export const maxLength = (maxLength: number, em?: Unknown): ValidateInput => {
  return ({ value }) => {
    return { valid: value?.length <= maxLength, em };
  };
};

export const minLengthWithoutSpace = (
  minLengthWithoutSpace: number,
  em?: Unknown
): ValidateInput => {
  return ({ value }) => {
    return {
      valid:
        value?.indexOf(" ") === -1 &&
        value?.trim().length >= minLengthWithoutSpace,
      em
    };
  };
};

export const maxLengthWithoutSpace = (
  maxLengthWithoutSpace: number,
  em?: Unknown
): ValidateInput => {
  return ({ value }) => {
    return {
      valid:
        value?.indexOf(" ") === -1 &&
        value?.trim().length <= maxLengthWithoutSpace,
      em
    };
  };
};
