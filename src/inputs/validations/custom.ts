import { CustomValidationType, Unknown, ValidateInput } from "../../types";

export const custom = (callback: CustomValidationType): ValidateInput => {
  return ({ value, helper, target }) => {
    let eM: Unknown = null;
    const valid = callback(value, (m: Unknown) => (eM = m));
    if ((typeof valid as unknown) !== "boolean") {
      throw TypeError("Your custom response is not a boolean");
    }
    return { valid, em: eM ?? helper.em[target] };
  };
};
