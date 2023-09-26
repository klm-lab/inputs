import type {
  ObjState,
  MatchResultType,
  Input,
  ValidationResult,
  ValidationStateType,
  ValuesType,
  ObjType
} from "../types";

let asyncId: any = {};

const updateErrorMessage = (entry: Input, message: any, exact = false) => {
  return exact
    ? message
    : (entry.errorMessage as unknown) instanceof Object
    ? entry.errorMessage
    : entry.label
    ? `La valeur "${entry.label}" ${message}`
    : `Cette valeur ${message}`;
};
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
  let lastMatched: string = "";
  let result: MatchResultType = {
    matchKeys: [],
    lastMatched
  };

  function match(matchKey: string, keyPath: keyof ValidationStateType) {
    if (
      state[matchKey] &&
      typeof state[matchKey].validation !== "undefined" &&
      typeof state[matchKey].validation![keyPath] !== "undefined"
    ) {
      matchKeys.push(matchKey as string);
      const newMatchKey = state[matchKey].validation![keyPath];
      match(newMatchKey as string, keyPath);
    } else {
      lastMatched = matchKey;
      result = {
        lastMatched,
        matchKeys,
        validation: state[matchKey] ? state[matchKey].validation : {}
      };
    }
  }

  match(matchKey, keyPath);
  return result;
};

const getResult = (
  entry: Input,
  validatedData: ObjState,
  value: ValidationResult,
  override = false
) => {
  if (entry._) {
    return { ...value, validatedData };
  }
  return {
    valid: value.valid,
    errorMessage: override ? value.errorMessage : entry.___, //?? entry.errorMessage,
    validatedData
  };
};

const validate = async (state: ObjState, target: string, value: ValuesType) => {
  clearTimeout(asyncId[target]);
  const entry: Input = state[target];
  const rules: ValidationStateType = entry.validation || {};
  let isValid: boolean = true;

  if (typeof rules.required !== "undefined" && typeof value === "string") {
    isValid = value.trim() !== "" && isValid;
  }
  if (!isValid) {
    return getResult(entry, state, {
      valid: isValid,
      errorMessage: updateErrorMessage(entry, "est requise")
    });
  }

  if (typeof rules.min !== "undefined" && typeof value === "number") {
    isValid = value >= rules.min && isValid;
  }
  if (!isValid) {
    return getResult(entry, state, {
      valid: isValid,
      errorMessage: updateErrorMessage(
        entry,
        `doit être supérieure ou égale à ${rules.min}`
      )
    });
  }

  if (typeof rules.minLength !== "undefined" && typeof value === "string") {
    isValid = value.trim().length >= rules.minLength && isValid;
  }
  if (!isValid) {
    return getResult(entry, state, {
      valid: isValid,
      errorMessage: updateErrorMessage(
        entry,
        `doit avoir au minimum ${rules.minLength} caractères`
      )
    });
  }

  if (
    typeof rules.minLengthWithoutSpace !== "undefined" &&
    typeof value === "string"
  ) {
    isValid =
      value.indexOf(" ") === -1 &&
      value.trim().length >= rules.minLengthWithoutSpace &&
      isValid;
  }
  if (!isValid) {
    return getResult(entry, state, {
      valid: isValid,
      errorMessage: updateErrorMessage(
        entry,
        `doit avoir au minimum ${rules.minLengthWithoutSpace} caractères sans espaces`
      )
    });
  }

  if (typeof rules.maxLength !== "undefined" && typeof value === "string") {
    isValid = value.trim().length <= rules.maxLength && isValid;
  }
  if (!isValid) {
    return getResult(entry, state, {
      valid: isValid,
      errorMessage: updateErrorMessage(
        entry,
        `doit avoir au maximum ${rules.maxLength} caractères`
      )
    });
  }

  if (
    typeof rules.maxLengthWithoutSpace !== "undefined" &&
    typeof value === "string"
  ) {
    isValid =
      value.indexOf(" ") === -1 &&
      value.trim().length <= rules.maxLengthWithoutSpace &&
      isValid;
  }
  if (!isValid) {
    return getResult(entry, state, {
      valid: isValid,
      errorMessage: updateErrorMessage(
        entry,
        `doit avoir au maximum ${rules.maxLengthWithoutSpace} caractères sans espaces`
      )
    });
  }

  if (typeof rules.max !== "undefined" && typeof value === "number") {
    isValid = value <= rules.max && isValid;
  }
  if (!isValid) {
    return getResult(entry, state, {
      valid: isValid,
      errorMessage: updateErrorMessage(
        entry,
        `doit être inférieur ou égale à ${rules.max}`
      )
    });
  }

  if (typeof rules.number !== "undefined") {
    isValid = typeof value === "number" && isValid;
  }
  if (!isValid) {
    return getResult(entry, state, {
      valid: isValid,
      errorMessage: updateErrorMessage(entry, `doit être un nombre`)
    });
  }

  if (typeof rules.email !== "undefined" && typeof value === "string") {
    isValid = validateEmail(value) && isValid;
  }
  if (!isValid) {
    return getResult(entry, state, {
      valid: isValid,
      errorMessage: updateErrorMessage(entry, `doit être un email valide`)
    });
  }

  if (typeof rules?.startsWith !== "undefined" && typeof value === "string") {
    isValid = value.length > 0 && value.startsWith(rules.startsWith) && isValid;
  }
  if (!isValid) {
    return getResult(entry, state, {
      valid: isValid,
      errorMessage: updateErrorMessage(
        entry,
        `doit être commençer par ${rules.startsWith}`
      )
    });
  }

  if (typeof rules?.endsWith !== "undefined" && typeof value === "string") {
    isValid = value.length > 0 && value.endsWith(rules.endsWith) && isValid;
  }
  if (!isValid) {
    return getResult(entry, state, {
      valid: isValid,
      errorMessage: updateErrorMessage(
        entry,
        `doit se terminer par ${rules.endsWith}`
      )
    });
  }

  if (typeof rules?.equalsTo !== "undefined") {
    isValid = value === rules.equalsTo && isValid;
  }
  if (!isValid) {
    return getResult(entry, state, {
      valid: isValid,
      errorMessage: updateErrorMessage(
        entry,
        `doit être égale à ${rules.equalsTo}`
      )
    });
  }

  if (typeof rules.regex !== "undefined") {
    isValid = rules.regex?.test(value) && isValid;
  }
  if (!isValid) {
    return getResult(entry, state, {
      valid: isValid,
      errorMessage: updateErrorMessage(entry, `est erronée`)
    });
  }

  if (typeof rules.__ !== "undefined") {
    /*  We get the match key here.
     * For example, if we are typing in password, then matchKeys is confirmPassword
     * f we are typing in confirmPassword then matchKeys is password and so on
     */
    const matchKeys = rules.__ as string[];

    /*  We save the current valid value which comes from top functions with validation rules.*/
    let currentInputValidStatus: boolean = isValid;
    let invalidTarget: string = "";
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
        currentInputValidStatus = value === state[m].value;
        // Revalidating current input find in the loop with currentInputValidStatus status
        state[m].valid = currentInputValidStatus;
        // currentInputValidStatus is false
        if (!currentInputValidStatus) {
          invalidTarget = m;
          break;
        }
      }
    }
    if (!currentInputValidStatus) {
      /*  We create an error message based on matchKeys and set result */
      return getResult(entry, state, {
        valid: currentInputValidStatus,
        errorMessage: updateErrorMessage(
          entry,
          `doit correspondre à la valeur ${
            state[invalidTarget].label ?? invalidTarget
          }`
        )
      });
    }
  }

  if (typeof rules.custom !== "undefined") {
    let eM = "comporte une erreur";
    let isOverrided = false;

    const setEM = (message: string | ObjType) => {
      eM = message as string;
      isOverrided = true;
    };
    const task = () =>
      new Promise((resolve) => {
        clearTimeout(asyncId[target]);
        asyncId[target] = setTimeout(() => {
          Promise.resolve(rules.custom && rules.custom(value, setEM))
            .then((value) => {
              isValid = value as boolean;
              resolve(true);
            })
            .catch((error: any) => {
              console.error(error);
              isValid = false;
            });
        }, 800);
      });
    await task();
    if (!isValid) {
      return getResult(
        entry,
        state,
        {
          valid: isValid,
          errorMessage: updateErrorMessage(entry, eM, true)
        },
        isOverrided
      );
    }
  }
  return getResult(entry, state, {
    valid: isValid,
    errorMessage: entry.errorMessage
  });
};

export { validate, deepMatch };
