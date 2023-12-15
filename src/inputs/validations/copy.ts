import { ValidateInput, ValidationStateType } from "../../types";
import { validate } from "./index";
import { getInput } from "../../util";

export const copy = (
  name: string,
  omittedRules?: (keyof ValidationStateType)[]
): ValidateInput => {
  return ({ i, ok, st, va, omr }) => {
    return validate(st, i!, getInput(st, name).o, va, omittedRules ?? omr, ok);
  };
};
