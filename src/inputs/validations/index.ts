import type {
  Helper,
  Input,
  ObjectInputs,
  Unknown,
  ValidateState,
  ValidationResult,
  ValidationStateType
} from "../../types";
import { O } from "../../util/helper";

const validate = (
  helper: Helper,
  entry: ObjectInputs<string>,
  target: string,
  value: Unknown,
  omittedRules: (keyof ValidationStateType)[] = []
): ValidationResult => {
  const input: Input = entry[target];
  const rules: ValidationStateType = input.validation || {};
  const result = {
    valid: true,
    em: helper.em[target]
  };
  const rulesKeys = O.keys(rules);
  for (let i = 0; i < rulesKeys.length; i++) {
    if (
      rulesKeys[i] !== "asyncCustom" &&
      !omittedRules.includes(rulesKeys[i] as keyof ValidationStateType)
    ) {
      const v = (rules[rulesKeys[i] as keyof ValidationStateType] as Unknown)({
        entry,
        helper,
        input,
        target,
        value,
        omittedRules
      });
      result.valid = result.valid && v.valid;
      result.em = v.em ?? result.em;
    }
    if (!result.valid) {
      break;
    }
  }
  return result;
};

// Validate the state
const validateState = (data: ObjectInputs<string>): ValidateState => {
  let isValid = true;
  let invalidKey = null;
  for (const formKey in data) {
    isValid = isValid && !data[formKey].validating && data[formKey].valid;
    if (!isValid) {
      invalidKey = formKey;
      break;
    }
  }
  return { isValid, invalidKey };
};

export { validate, validateState };
