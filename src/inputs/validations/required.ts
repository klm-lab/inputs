import { Unknown, ValidateInput } from "../../types";

export const required = (errorMessage: Unknown): ValidateInput => {
  return ({ va }) =>
    !!va && (va.trim ? va.trim() !== "" : va.length > 0) ? "" : errorMessage;
};
