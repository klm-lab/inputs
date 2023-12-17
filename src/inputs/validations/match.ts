import { Unknown, ValidateInput } from "../../types";
import { validate } from "./index";

export const match = (name: string, em?: Unknown): ValidateInput => {
  return ({ i, ok, st, va }) => {
    const objKey = st.ev[name].k;

    if (!objKey) {
      return "";
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

    const error = validate(st, i, objKey, va, ["match"], ok);
    const message = !error ? em : error;
    const valid = !error && va === i[objKey].value;
    i[objKey].valid = valid;
    i[objKey].errorMessage = valid ? "" : i[objKey].errorMessage;
    return valid ? "" : message;
  };
};
