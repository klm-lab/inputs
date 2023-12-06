import { ValidateInput, ValidationStateType } from "../../types";
import { validate } from "./index";

export const copy = (
  inputId: string,
  omittedRules?: (keyof ValidationStateType)[]
): ValidateInput => {
  return ({ helper, entry, target, value, omittedRules: or }) => {
    if (!entry![inputId]) {
      throw Error("Missing input id");
    }
    const v = validate(helper, entry!, inputId, value, omittedRules ?? or);
    return {
      valid: v.valid,
      em: v.em ?? helper.em[target]
    };
  };
};
