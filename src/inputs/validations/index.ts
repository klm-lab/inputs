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
  const { e, v: rules } = st.h.ev[ip?.name] || {};
  const result: ValidationResult = {
    v: true,
    em: rules ? e : undefined
  };
  if (!rules) {
    return result;
  }
  const params = { i, st, ip, ok: o, va, omr } as ValidateInputParams;

  new Set(keys(rules)).forEach((r: Unknown) => {
    if (!result.v) {
      return;
    }
    if (!omr.includes(r)) {
      const v = (rules as Unknown)[r](params) as ValidationResult;
      result.v = result.v && v.v;
      // em = errorMessage
      // after validation if em, then em else saved em
      result.em = result.v ? undefined : v.em ?? e;
    }
  });

  if (result.v && rules.asyncCustom) {
    i[ok].validating = true;
    result.v = false;
    rules.asyncCustom(params);
  }

  return result;
};

// Validate the state
const validateState = (data: ObjectInputs<string>): ValidateState => {
  let iv = true;
  let ik = null;
  for (const formKey in data) {
    iv = iv && data[formKey].valid;
    if (!iv) {
      ik = formKey;
      break;
    }
  }
  return { iv, ik };
};

export { validate, validateState };
