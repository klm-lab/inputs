import { ValidateInput, ValidateInputParams } from "../../types";
import { validate } from "./index";

export const match = (inputId: string): ValidateInput => {
  return ({ helper, entry, target, value }) => {
    let v = { valid: true, em: helper.em[target] };
    if (!entry![inputId]) {
      throw Error("Missing input id");
    }
    if (!entry![inputId].validation.match) {
      entry![inputId].validation.match = ({
        entry,
        value: V
      }: ValidateInputParams) => {
        const valid = entry![target].value === V;
        entry![target].valid = valid;
        return { valid, em: helper.em[inputId] };
      };
    }
    v = validate(helper, entry!, inputId, value, ["match"]);
    v.em = v.valid ? helper.em[target] : v.em;
    v.valid = v.valid && value === entry![inputId].value;
    entry![inputId].valid = v.valid;
    return { valid: v.valid, em: v.em };
  };
};
