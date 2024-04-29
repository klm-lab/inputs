import { Unknown, ValidateInput } from "../../types";

export const required = (errorMessage: Unknown): ValidateInput => {
  return ({ va }) => (va && /\S/.test(va)) ? "": errorMessage;
};
