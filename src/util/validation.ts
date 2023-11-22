import type {
  AsyncCallback,
  CopyKeyObjType,
  CopyType,
  ErrorMessageType,
  InputStore,
  MatchResultType,
  CreateObjectInput,
  Input,
  ObjectInput,
  ValidationStateType,
  Unknown,
  Helper
} from "../types";

const validateEmail = (email: string) => {
  const re =
    /^(([^<>()\]\\.,;:\s@"]+(\.[^<>()\]\\.,;:\s@"]+)*)|(".+"))@(([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

// Parse copy key
const parseCopy = (
  key: CopyType | undefined | string,
  keyPath: keyof ValidationStateType
): CopyKeyObjType => {
  if (keyPath === "match") {
    return {
      value: "",
      omit: new Set()
    };
  }
  if (key?.constructor.name === "Object") {
    return {
      value: (key as CopyType).value,
      omit: (key as CopyType).omit ? new Set((key as CopyType).omit) : new Set()
    };
  }
  return {
    value: key as string,
    omit: new Set()
  };
};

// Deep match
const deepMatch = (
  helper: Helper,
  state: CreateObjectInput,
  stateKey: string,
  matchKey: string,
  keyPath: keyof ValidationStateType
) => {
  const matchKeys: string[] = [];
  let result = {} as MatchResultType;
  helper.ok[stateKey] = parseCopy(
    state[stateKey].validation?.copy,
    keyPath
  ).omit;

  const match = (matchKey: string, keyPath: keyof ValidationStateType) => {
    // We get omitted path from user
    const userOmit = parseCopy(state[stateKey].validation?.copy, keyPath).omit;

    if (
      // state[matchKey] exists
      state[matchKey] &&
      // state[matchKey].validation exists
      typeof state[matchKey].validation !== "undefined" &&
      // state[matchKey].validation contains a match or copy key
      typeof state[matchKey].validation![keyPath] !== "undefined" &&
      // Input don't want the copied part
      !userOmit.has("copy")
    ) {
      new Set([
        // We get omitted path from matchedKey and merge it with userOmit.
        /*
         * If an input omit a validation and match another input who omit another validation,
         * then both omit same validations
         *  */
        ...parseCopy(state[matchKey].validation?.copy, keyPath).omit,
        ...userOmit
      ]).forEach((k) => {
        // We save omitted path for the current key
        helper.ok[stateKey].add(k);
      });
      matchKeys.push(matchKey);
      // Next round with a new matchKey
      match(getValue(state[matchKey].validation![keyPath]), keyPath);
    } else {
      // By default, validation is the original validation of the last matched key
      let validation: ValidationStateType | undefined = {
        ...helper.s[matchKey].validation
      };
      /* If we want the copied part or the matched part, we override the validation with
       * the validation of the last matched found already updated while looping
       */
      if (!userOmit.has("copy") && !userOmit.has("match")) {
        validation = state[matchKey] ? state[matchKey].validation : {};
      }
      result = { lm: matchKey, mk: matchKeys, v: validation };
    }
  };

  // We start the matching process
  match(matchKey, keyPath);
  return result;
};

const getErrorMessage = (helper: Helper, rule: any, target: string) => {
  if (rule && rule?.constructor.name === "Object") {
    return rule.message ?? helper.em[target];
  }
  return helper.em[target];
};

// Can be any rules
const getValue = (rule: any) => {
  return rule?.constructor.name === "Object" ? rule.value : rule;
};

// V is validate
const validate = (
  helper: Helper,
  state: ObjectInput,
  target: string,
  value: Unknown
) => {
  const entry: Input = state[target];
  const rules: ValidationStateType = entry.validation || {};
  let valid: boolean = true;
  const em: ErrorMessageType | undefined = helper.em[target];
  // Required
  if (typeof rules.required !== "undefined") {
    if (
      (entry.type === "select" && entry.multiple) ||
      entry.type === "file" ||
      entry.type === "checkbox"
    ) {
      valid = value !== null && value.length > 0 && valid;
    }
    valid =
      typeof value === "string"
        ? value.trim() !== "" && valid
        : value !== null && valid;
  }
  if (!valid) {
    return {
      valid,
      em: getErrorMessage(helper, rules.required, target)
    };
  }

  // Number
  if (typeof rules.number !== "undefined") {
    valid = !isNaN(value) && valid;
  }
  if (!valid) {
    return {
      valid,
      em: getErrorMessage(helper, rules.number, target)
    };
  }

  // Min
  if (typeof rules.min !== "undefined") {
    valid = Number(value) >= getValue(rules.min) && valid;
  }
  if (!valid) {
    return {
      valid,
      em: getErrorMessage(helper, rules.min, target)
    };
  }

  // Max
  if (typeof rules.max !== "undefined") {
    valid = Number(value) <= getValue(rules.max) && valid;
  }
  if (!valid) {
    return {
      valid,
      em: getErrorMessage(helper, rules.max, target)
    };
  }

  // Starts with
  if (typeof rules?.startsWith !== "undefined" && typeof value === "string") {
    valid =
      value.length > 0 && value.startsWith(getValue(rules.startsWith)) && valid;
  }
  if (!valid) {
    return {
      valid,
      em: getErrorMessage(helper, rules.startsWith, target)
    };
  }

  // MinLength
  if (typeof rules.minLength !== "undefined") {
    valid = value?.length >= getValue(rules.minLength) && valid;
  }
  if (!valid) {
    return {
      valid,
      em: getErrorMessage(helper, rules.minLength, target)
    };
  }

  // MinLengthWithoutSpace
  if (
    typeof rules.minLengthWithoutSpace !== "undefined" &&
    typeof value === "string"
  ) {
    valid =
      value.indexOf(" ") === -1 &&
      value.trim().length >= getValue(rules.minLengthWithoutSpace) &&
      valid;
  }
  if (!valid) {
    return {
      valid,
      em: getErrorMessage(helper, rules.minLengthWithoutSpace, target)
    };
  }

  // MaxLength
  if (typeof rules.maxLength !== "undefined") {
    valid = value?.length <= getValue(rules.maxLength) && valid;
  }
  if (!valid) {
    return {
      valid,
      em: getErrorMessage(helper, rules.maxLength, target)
    };
  }

  // MaxLengthWithoutSpace
  if (
    typeof rules.maxLengthWithoutSpace !== "undefined" &&
    typeof value === "string"
  ) {
    valid =
      value.indexOf(" ") === -1 &&
      value.trim().length <= getValue(rules.maxLengthWithoutSpace) &&
      valid;
  }
  if (!valid) {
    return {
      valid,
      em: getErrorMessage(helper, rules.maxLengthWithoutSpace, target)
    };
  }

  // Email
  if (typeof rules.email !== "undefined" && typeof value === "string") {
    valid = validateEmail(value) && valid;
  }
  if (!valid) {
    return {
      valid,
      em: getErrorMessage(helper, rules.email, target)
    };
  }

  // Regex
  if (typeof rules.regex !== "undefined") {
    valid = getValue(rules.regex)?.test(value) && valid;
  }
  if (!valid) {
    return {
      valid,
      em: getErrorMessage(helper, rules.regex, target)
    };
  }

  // ends with
  if (typeof rules?.endsWith !== "undefined" && typeof value === "string") {
    valid =
      value.length > 0 && value.endsWith(getValue(rules.endsWith)) && valid;
  }
  if (!valid) {
    return {
      valid,
      em: getErrorMessage(helper, rules.endsWith, target)
    };
  }

  // if (typeof rules.__ !== "undefined") {
  if (typeof helper.tm[target] !== "undefined") {
    /*  We get the match key here.
     * For example, if we are typing in password, then matchKeys is confirmPassword
     * f we are typing in confirmPassword then matchKeys is password and so on
     */
    const matchKeys = helper.tm[target];

    /*  We save the current valid value which comes from top functions with validation rules.*/
    let currentInputValidStatus: boolean = valid;
    /*
     * We loop and check if typed value match all matched key value and break the loop.
     * But before breaking loop, we override the currentInputValidStatus status with the new one
     * */
    for (let i = 0; i < matchKeys.length; i++) {
      const m = matchKeys[i];
      // We validate only if input is touched
      if (state[m].touched) {
        /* we override the current valid status only if currentInputValidStatus  is true
         * and if value === state[m].value where m in one of matched key in loop.
         * If currentInputValidStatus === false, we revalidate current input find in the loop
         * with currentInputValidStatus, create an error message and break
         */
        currentInputValidStatus =
          currentInputValidStatus && value === state[m].value;
        // Revalidating current input found in the loop with currentInputValidStatus status
        state[m].valid = currentInputValidStatus;
        // currentInputValidStatus is false
        if (!currentInputValidStatus) {
          break;
        }
      }
    }
    if (!currentInputValidStatus) {
      return {
        valid: currentInputValidStatus,
        em: getErrorMessage(helper, rules.match, target)
      };
    }
  }
  if (!entry.validation?.asyncCustom && typeof rules.custom !== "undefined") {
    let eM: ErrorMessageType | null = null;
    valid = rules.custom(value, (m: ErrorMessageType) => (eM = m));
    if ((typeof valid as unknown) !== "boolean") {
      throw TypeError("Your custom response is not a boolean");
    }
    if (!valid) {
      return { valid, em: eM ?? helper.em[target] };
    }
  }
  return { valid, em };
};

// Async validation
const asyncValidation = (
  store: InputStore,
  helper: Helper,
  state: ObjectInput,
  target: string,
  value: unknown,
  callback: AsyncCallback
) => {
  const entry: Input = state[target];
  clearTimeout(helper.a[entry.key]);
  helper.a[entry.key] = setTimeout(() => {
    // Save the time
    const ST = helper.a[entry.key];
    const rules: Required<ValidationStateType> = entry.validation;
    let eM: ErrorMessageType | null = null;
    Promise.resolve(rules.asyncCustom(value, (m: ErrorMessageType) => (eM = m)))
      .then((value) => {
        if (typeof value !== "boolean") {
          throw TypeError("Your custom response is not a boolean");
        }
        /* we check if time match the request id time
         * If not, that means, another request has been sent.
         * So we wait for that response
         * */
        if (ST === helper.a[entry.key]) {
          callback({
            valid: value,
            em: eM ?? helper.em[target],
            entry,
            store,
            helper
          });
        }
      })
      .catch((error) => {
        console.error(error);
        callback({
          valid: false,
          failed: true,
          entry,
          store,
          helper
        });
      });
  }, store.get("asyncDelay"));
};

export { validate, deepMatch, asyncValidation, getValue, parseCopy };
