import { Unknown, ValidateInput } from "../../types";
import { validate } from "./index";

export const match = (name: string, em?: Unknown): ValidateInput => {
  return ({ i, ok, st, va }) => {
    const key = st.ev[name].k;

    if (!key) {
      return null;
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

    const error = validate(st, i!, key, va, ["match"], ok);
    const message = !error ? em : error;
    const valid = !error && va === i![key].value;
    i![key].valid = valid;
    i![key].errorMessage = valid ? null : i![key].errorMessage;
    return valid ? null : message;
  };
};
