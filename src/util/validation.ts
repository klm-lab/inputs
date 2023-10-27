import type {
  CopyType,
  ErrorMessageType,
  Input,
  MatchResultType,
  ObjInput,
  ValidationStateType,
  ValuesType,
  CopyKeyObjType
} from "../types";
import type { H } from "./helper";

const validateEmail = (email: string) => {
  const re =
    /^(([^<>()\]\\.,;:\s@"]+(\.[^<>()\]\\.,;:\s@"]+)*)|(".+"))@(([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

// Pc is parse copy
const pc = (
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
const dp = (
  helper: H,
  state: ObjInput,
  stateKey: string,
  matchKey: string,
  keyPath: keyof ValidationStateType
) => {
  const matchKeys: string[] = [];
  let result = {} as MatchResultType;
  helper.ok[stateKey] = pc(state[stateKey].validation?.copy, keyPath).omit;

  const match = (matchKey: string, keyPath: keyof ValidationStateType) => {
    // We get omitted path from user
    const userOmit = pc(state[stateKey].validation?.copy, keyPath).omit;

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
        ...pc(state[matchKey].validation?.copy, keyPath).omit,
        ...userOmit
      ]).forEach((k) => {
        // We save omitted path for the current key
        helper.ok[stateKey].add(k);
        // if custom is omitted, then we remove async to avoid delay on validation
        k === "custom" && helper.ok[stateKey].add("async");
      });
      matchKeys.push(matchKey as string);
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

const getErrorMessage = (helper: H, rule: any, target: string) => {
  if (rule && rule?.constructor.name === "Object") {
    return rule.message ?? helper.em[target];
  }
  return helper.em[target];
};

const getValue = (rule: any) => {
  return rule?.constructor.name === "Object" ? rule.value : rule;
};

// V is validate
const v = (helper: H, state: ObjInput, target: string, value: ValuesType) => {
  const entry: Input = state[target];
  const rules: ValidationStateType = entry.validation || {};
  let valid: boolean = true;
  const em: ErrorMessageType | undefined = helper.em[target];

  // Required
  if (typeof rules.required !== "undefined") {
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

  // Min
  if (typeof rules.min !== "undefined" && typeof value === "number") {
    valid = value >= getValue(rules.min) && valid;
  }
  if (!valid) {
    return {
      valid,
      em: getErrorMessage(helper, rules.min, target)
    };
  }

  // MinLength
  if (typeof rules.minLength !== "undefined" && value) {
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
  if (typeof rules.maxLength !== "undefined" && value) {
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

  // Max
  if (typeof rules.max !== "undefined" && typeof value === "number") {
    valid = value <= getValue(rules.max) && valid;
  }
  if (!valid) {
    return {
      valid,
      em: getErrorMessage(helper, rules.max, target)
    };
  }

  // Number
  if (typeof rules.number !== "undefined") {
    valid = typeof value === "number" && valid;
  }
  if (!valid) {
    return {
      valid,
      em: getErrorMessage(helper, rules.number, target)
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
  if (!entry.validation?.async && typeof rules.custom !== "undefined") {
    let eM: ErrorMessageType | null = null;
    valid = rules.custom(value, (m: ErrorMessageType) => (eM = m)) as boolean;
    if ((typeof valid as unknown) !== "boolean") {
      throw Error("Your custom response is not a boolean");
    }
    if (!valid) {
      return { valid, em: eM ?? helper.em[target] };
    }
  }
  return { valid, em };
};

// Async validation
const va = (
  helper: H,
  state: any,
  target: string,
  value: any,
  asyncDelay: number,
  callback: any
) => {
  const entry: Input = state[target];
  clearTimeout(helper.a[entry.key as string]);
  helper.a[entry.key as string] = setTimeout(() => {
    // Save the time
    const ST = helper.a[entry.key as string];
    const rules: ValidationStateType = entry.validation || {};
    if (typeof rules.custom !== "undefined") {
      let eM: ErrorMessageType | null = null;
      Promise.resolve(
        rules.custom && rules.custom(value, (m: ErrorMessageType) => (eM = m))
      )
        .then((value) => {
          if (typeof value !== "boolean") {
            throw Error("Your custom response is not a boolean");
          }
          /* we check if time match the request id time
           * If not, that means, another request has been sent.
           * So we wait for that response
           * */
          if (ST === helper.a[entry.key as string]) {
            callback({
              valid: value as boolean,
              em: eM ?? helper.em[target]
            });
          }
        })
        .catch((error: any) => {
          console.error(error);
        });
    } else {
      callback(entry);
    }
  }, asyncDelay);
};

export { v, dp, va, getValue, pc };
