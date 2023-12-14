import { ValidateInput, ValidationStateType } from "../../types";
import { validate } from "./index";
import { getInput } from "../../util";

export const copy = (
  name: string,
  omittedRules?: (keyof ValidationStateType)[]
): ValidateInput => {
  return ({ i, ok, st, va, omr }) => {
    const v = validate(
      st,
      i!,
      getInput(st, name).o,
      va,
      omittedRules ?? omr,
      ok
    );
    return {
      v: v.v,
      em: v.em
    };
  };
};
