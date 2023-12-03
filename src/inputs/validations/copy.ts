import { ValidateInput, ValidationStateType } from "../../types";
import { validate } from "./index";

export const INFINITE_MC =
  "It seems that an ID is missing or we have infinite match here. Please make sure that the copied or matched input has an id and the last matched or copied input does not match or copy anyone";

export const copy = (
  inputId: string,
  omittedRules?: (keyof ValidationStateType)[]
): ValidateInput => {
  return ({ helper, entry, target, value, omittedRules: or }) => {
    let v = { valid: true, em: helper.em[target] };
    try {
      v = validate(helper, entry!, inputId, value, omittedRules ?? or);
    } catch (_) {
      throw Error(INFINITE_MC);
    }
    return {
      valid: v.valid,
      em: helper.em[target] ?? v.em
    };
  };
};
