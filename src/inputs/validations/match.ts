import { Unknown, ValidateInput } from "../../types";
import { validate } from "./index";
import { getInput } from "../../util";

export const match = (name: string, em?: Unknown): ValidateInput => {
  return ({ i, ok, st, va }) => {
    const key = getInput(st, name).o;
    if (!key) {
      return { v: true, em: undefined };
    }
    // if (!entry![inputId].validation.match) {
    //   entry![inputId].validation.match = ({
    //     entry,
    //     value: V
    //   }: ValidateInputParams) => {
    //     const valid = entry![target].value === V;
    //     entry![target].valid = valid;
    //     return { valid, em: helper.em[inputId] };
    //   };
    // }
    const v = validate(st, i!, key, va, ["match"], ok);
    v.em = !v.em ? em : v.em;
    v.v = v.v && va === i![key].value;
    i![key].valid = v.v;
    i![key].errorMessage = v.v ? undefined : i![key].errorMessage;
    return { v: v.v, em: v.em };
  };
};
