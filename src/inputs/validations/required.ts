import { Unknown, ValidateInput } from "../../types";

export const required = (em?: Unknown): ValidateInput => {
  return ({ va }) =>
    !!va && va.indexOf(" ") === -1 && va.length > 0 ? null : em;
};
