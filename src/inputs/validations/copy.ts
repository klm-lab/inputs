import { ValidateInput, ValidationStateType } from "../../types";
import { validate } from "./index";

export const copy = (
  name: string,
  omittedRules?: (keyof ValidationStateType)[]
): ValidateInput => {
  return ({ i, ok, st, va, omr }) =>
    validate(st, i!, st.ev[name].k, va, omittedRules ?? omr, ok);
};
