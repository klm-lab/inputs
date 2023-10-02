import type {
  ErrorMessageType,
  Input,
  MatchResultType,
  ObjState,
  ValidationStateType,
  ValuesType
} from "../types";

const asyncId: any = {};
const validateEmail = (email: string) => {
  const re =
    /^(([^<>()\]\\.,;:\s@"]+(\.[^<>()\]\\.,;:\s@"]+)*)|(".+"))@(([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

const deepMatch = (
  state: ObjState,
  matchKey: string,
  keyPath: keyof ValidationStateType
) => {
  const matchKeys: string[] = [];
  let result = {} as MatchResultType;

  function match(matchKey: string, keyPath: keyof ValidationStateType) {
    if (
      state[matchKey] &&
      typeof state[matchKey].validation !== "undefined" &&
      typeof state[matchKey].validation![keyPath] !== "undefined"
    ) {
      matchKeys.push(matchKey as string);
      const newMatchKey = getValue(state[matchKey].validation![keyPath]);
      match(newMatchKey, keyPath);
    } else {
      result = {
        lastMatched: matchKey,
        matchKeys,
        validation: state[matchKey] ? state[matchKey].validation : {}
      };
    }
  }

  match(matchKey, keyPath);
  return result;
};

const getErrorMessage = (rule: any, entry: Input) => {
  if (rule && rule?.constructor.name === "Object") {
    return rule.message ?? entry.___;
  }
  return entry.___;
};

const getValue = (rule: any) => {
  return rule?.constructor.name === "Object" ? rule.value : rule;
};

const validate = (state: ObjState, target: string, value: ValuesType) => {
  const entry: Input = state[target];
  const rules: ValidationStateType = entry.validation || {};
  let isValid: boolean = true;
  const errorMessage: ErrorMessageType | undefined = entry.___;

  // Required
  if (typeof rules.required !== "undefined" && typeof value === "string") {
    isValid = value.trim() !== "" && isValid;
  }
  if (!isValid) {
    return { isValid, errorMessage: getErrorMessage(rules.required, entry) };
  }

  // Starts with
  if (typeof rules?.startsWith !== "undefined" && typeof value === "string") {
    isValid =
      value.length > 0 &&
      value.startsWith(getValue(rules.startsWith)) &&
      isValid;
  }
  if (!isValid) {
    return { isValid, errorMessage: getErrorMessage(rules.startsWith, entry) };
  }

  // Min
  if (typeof rules.min !== "undefined" && typeof value === "number") {
    isValid = value >= getValue(rules.min) && isValid;
  }
  if (!isValid) {
    return { isValid, errorMessage: getErrorMessage(rules.min, entry) };
  }

  // MinLength
  if (typeof rules.minLength !== "undefined" && value) {
    isValid = value?.length >= getValue(rules.minLength) && isValid;
  }
  if (!isValid) {
    return { isValid, errorMessage: getErrorMessage(rules.minLength, entry) };
  }

  // MinLengthWithoutSpace
  if (
    typeof rules.minLengthWithoutSpace !== "undefined" &&
    typeof value === "string"
  ) {
    isValid =
      value.indexOf(" ") === -1 &&
      value.trim().length >= getValue(rules.minLengthWithoutSpace) &&
      isValid;
  }
  if (!isValid) {
    return {
      isValid,
      errorMessage: getErrorMessage(rules.minLengthWithoutSpace, entry)
    };
  }

  // MaxLength
  if (typeof rules.maxLength !== "undefined" && value) {
    isValid = value?.length <= getValue(rules.maxLength) && isValid;
  }
  if (!isValid) {
    return { isValid, errorMessage: getErrorMessage(rules.maxLength, entry) };
  }

  // MaxLengthWithoutSpace
  if (
    typeof rules.maxLengthWithoutSpace !== "undefined" &&
    typeof value === "string"
  ) {
    isValid =
      value.indexOf(" ") === -1 &&
      value.trim().length <= getValue(rules.maxLengthWithoutSpace) &&
      isValid;
  }
  if (!isValid) {
    return {
      isValid,
      errorMessage: getErrorMessage(rules.maxLengthWithoutSpace, entry)
    };
  }

  // Max
  if (typeof rules.max !== "undefined" && typeof value === "number") {
    isValid = value <= getValue(rules.max) && isValid;
  }
  if (!isValid) {
    return { isValid, errorMessage: getErrorMessage(rules.max, entry) };
  }

  // Number
  if (typeof rules.number !== "undefined") {
    isValid = typeof value === "number" && isValid;
  }
  if (!isValid) {
    return { isValid, errorMessage: getErrorMessage(rules.number, entry) };
  }

  // Email
  if (typeof rules.email !== "undefined" && typeof value === "string") {
    isValid = validateEmail(value) && isValid;
  }
  if (!isValid) {
    return { isValid, errorMessage: getErrorMessage(rules.email, entry) };
  }

  // Equals to
  if (typeof rules?.equalsTo !== "undefined") {
    isValid = value === getValue(rules.equalsTo) && isValid;
  }
  if (!isValid) {
    return { isValid, errorMessage: getErrorMessage(rules.equalsTo, entry) };
  }

  // Regex
  if (typeof rules.regex !== "undefined") {
    isValid = getValue(rules.regex)?.test(value) && isValid;
  }
  if (!isValid) {
    return { isValid, errorMessage: getErrorMessage(rules.regex, entry) };
  }

  // ends with
  if (typeof rules?.endsWith !== "undefined" && typeof value === "string") {
    isValid =
      value.length > 0 && value.endsWith(getValue(rules.endsWith)) && isValid;
  }
  if (!isValid) {
    return { isValid, errorMessage: getErrorMessage(rules.endsWith, entry) };
  }

  if (typeof rules.__ !== "undefined") {
    /*  We get the match key here.
     * For example, if we are typing in password, then matchKeys is confirmPassword
     * f we are typing in confirmPassword then matchKeys is password and so on
     */
    const matchKeys = rules.__ as string[];

    /*  We save the current valid value which comes from top functions with validation rules.*/
    let currentInputValidStatus: boolean = isValid;
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
        isValid: currentInputValidStatus,
        errorMessage: getErrorMessage(rules.match, entry)
      };
    }
  }
  if (!entry.validation?.async && typeof rules.custom !== "undefined") {
    let eM: ErrorMessageType | null = null;
    isValid = rules.custom(value, (m: ErrorMessageType) => (eM = m)) as boolean;
    if (!isValid) {
      return { isValid, errorMessage: eM ?? entry.___ };
    }
  }
  return { isValid, errorMessage };
};

const validateAsync = (
  state: any,
  target: string,
  value: any,
  callback: any
) => {
  const entry: Input = state[target];
  clearTimeout(asyncId[entry.key as string]);
  asyncId[entry.key as string] = setTimeout(() => {
    const rules: ValidationStateType = entry.validation || {};
    if (typeof rules.custom !== "undefined") {
      let eM: ErrorMessageType | null = null;
      Promise.resolve(
        rules.custom && rules.custom(value, (m: ErrorMessageType) => (eM = m))
      )
        .then((value) => {
          callback({
            valid: value as boolean,
            errorMessage: eM ?? entry.___
          });
        })
        .catch((error: any) => {
          console.error(error);
        });
    } else {
      callback(entry);
    }
  }, 800);
};

export { validate, deepMatch, validateAsync, getValue };
