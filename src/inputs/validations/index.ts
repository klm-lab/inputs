import type {
  Helper,
  Input,
  ObjectInputs,
  Unknown,
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

export { validate };
