import { CustomValidationType, Unknown, ValidateInput } from "../../types";

export const custom = (callback: CustomValidationType): ValidateInput => {
  return ({ va }) => {
    let eM: Unknown = null;
    const valid = callback(va, (em: Unknown) => (eM = em));
    return { v: valid, em: eM };
  };
};
