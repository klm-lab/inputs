import { Unknown, ValidateInput } from "../../types";

export const required = (em?: Unknown): ValidateInput => {
  return ({ va }) => {
    return {
      v: !!va && va.indexOf(" ") === -1 && va.length > 0,
      em
    };
  };
};
