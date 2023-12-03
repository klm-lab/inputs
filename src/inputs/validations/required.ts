import { InternalInput, Unknown, ValidateInput } from "../../types";

export const required = (em?: Unknown): ValidateInput => {
  return ({ input, value }) => {
    let valid: boolean = true;
    if (
      ((input as InternalInput).type === "select" &&
        (input as InternalInput).multiple) ||
      (input as InternalInput).type === "file" ||
      (input as InternalInput).type === "checkbox"
    ) {
      valid = value !== null && value.length > 0;
    }
    valid =
      valid && typeof value === "string" ? value.trim() !== "" : value !== null;
    return {
      valid,
      em
    };
  };
};
