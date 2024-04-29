import {
  Input,
  InputStore,
  ObjectInputs,
  Unknown,
  ValidateInputParams,
  ValidationResult
} from "../../types";
import { keys, newSet } from "../../util/helper";

const validate = (
  st: InputStore,
  i: ObjectInputs<string>,
  // objectKey to find the input name and validation
  defaultObjKey: string,
  // value
  va: Unknown,
  // omitted rules
  omr: string[] = [],
  // objectKey to write the valid status
  realObjKey = defaultObjKey
): ValidationResult => {
  const ip: Input = i[defaultObjKey];
  const rules = st.ev[ip.name].v;
  let em: Unknown = "";
  if (!rules) {
    return em;
  }
  const params = { i, st, ip, ok: realObjKey, va, omr } as ValidateInputParams;

  newSet(keys(rules)).forEach((r: Unknown) => {
    if (em) {
      return;
    }
    // always exclude asyncCustom
    //  if (!["asyncCustom", ...omr].includes(r)) {
    if (!omr.includes(r)) {
      const f = (rules as Unknown)[r];
      em = va ? r === "custom" ? f(va) : f(params) : rules.required ? f(params) : "";
    }
  });
  // set the valid status
  i[realObjKey].valid = !em;

  if (!em && rules.asyncCustom) {
    // make it invalid because an async validation is present
    i[realObjKey].valid = false;
    i[realObjKey].validating = true;
    //  rules.asyncCustom(params);
  }

  return em;
};

// Validate the state
const validateState = (data: ObjectInputs<string>) => {
  let valid = true;
  for (const formKey in data) {
    if (!valid) {
      break;
    }
    valid = data[formKey].valid;
  }
  return valid;
};

export { validate, validateState };
