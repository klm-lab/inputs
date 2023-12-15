import {
  Input,
  InputStore,
  ObjectInputs,
  Unknown,
  ValidateInputParams,
  ValidateState,
  ValidationResult
} from "../../types";
import { keys } from "../../util/helper";

const validate = (
  st: InputStore,
  i: ObjectInputs<string>,
  ok: string,
  va: Unknown,
  omr = ["asyncCustom"],
  o = ok
): ValidationResult => {
  const ip: Input = i[ok];
  const rules = st.ev[ip?.name].v;
  let em: Unknown = null;
  if (!rules) {
    return em;
  }
  const params = { i, st, ip, ok: o, va, omr } as ValidateInputParams;

  new Set(keys(rules)).forEach((r: Unknown) => {
    if (em) {
      return;
    }
    if (!omr.includes(r)) {
      const f = (rules as Unknown)[r];
      em = r === "custom" ? f(va) : f(params);
    }
  });

  if (!em && rules.asyncCustom) {
    i[ok].validating = true;
    rules.asyncCustom(params);
  }

  return em;
};

// Validate the state
const validateState = (data: ObjectInputs<string>): ValidateState => {
  let iv = true;
  let ik = null;
  for (const formKey in data) {
    if (!iv) {
      break;
    }
    iv = data[formKey].valid;
    ik = formKey;
  }
  return { iv, ik };
};

export { validate, validateState };
