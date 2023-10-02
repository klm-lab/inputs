import type {
  Input,
  MatchResultType,
  ObjState,
  StateType,
  ValidationStateType
} from "../types";
import { deepMatch } from "../validation";

function initValidAndTouch(entry: Input, resetValue?: any) {
  const validation = entry.validation;
  const value = entry.value;
  if (typeof validation === "undefined") {
    return true;
  }
  if (!Object.keys(validation).length) {
    return true;
  }
  //If value is provided then input is valid by default
  return !["", 0, null, undefined].includes(resetValue ?? value);
}

const resetState = (formData: any, type: StateType): any => {
  const data = type === "object" ? { ...formData } : [...formData];
  for (const key in data) {
    const result = data[key].resetValue
      ? initValidAndTouch(data[key], data[key].resetValue)
      : false;
    data[key] = {
      ...data[key],
      value: data[key].resetValue ?? "",
      valid: result,
      touched: result
    };
  }
  return data;
};

function common(entry: Input) {
  return {
    id: entry.id,
    name: entry.name ?? "",
    type: "",
    value: "",
    valid: initValidAndTouch(entry),
    touched: initValidAndTouch(entry),
    placeholder: "",
    errorMessage: undefined,
    validating: false
  };
}

const setTrackingMatching = (entry: Input, matchKey: string[]) => {
  if (entry.validation?.__) {
    return [...new Set([...entry.validation.__, ...matchKey])];
  } else {
    return matchKey;
  }
};

// Loop validation
const lV = (state: ValidationStateType, data: ValidationStateType) => {
  for (const dataKey in data) {
    const key = dataKey as keyof ValidationStateType;
    if (
      state[key] &&
      state[key].constructor.name === "Object" &&
      data[key].constructor.name === "Object"
    ) {
      state[key] = {
        ...state[key],
        ...data[key]
      };
    } else {
      state[key] = data[key];
    }
  }
  return state;
};

// Match and copy input validation
const mcv = (
  state: ObjState,
  stateKey: string,
  matchOrCopyKey: string,
  keyPath: keyof ValidationStateType
) => {
  /*
   * We create a match result with default value.
   * All matchKeys = [], lastMatched = current matchKey
   * validation: current MatchKey validation
   * */
  let matchResult = {} as MatchResultType;

  /*
   * We check if the matched input also match someone until find the last one who does have a match property
   * and use last not matched validation to match all input in the hierarchy.
   * We add __ for validation tool. See validate function in validation folder
   * */
  try {
    matchResult = deepMatch(state, matchOrCopyKey, keyPath);
  } catch (_) {
    throw Error(
      "It seems that we have infinite match here. Please make sure that the last matched or copied input does not match or copy anyone"
    );
  }

  /*
   * For every matched key , We set two properties with deepMatch
   * - lastMatched input validation
   * - __. this is the tracking matching property
   * The input validation is the validation defined by the user (We just want to keep the match key of the user)
   * We add our result validation and for trackMatching, we put the current matched input, all matchKeys found without the value itself and the last matched.
   * For example. if an input match firstname and firstname match username and username match something,
   * the result of the matchKeys for that input is ["firstname", "username"] and lastMatched is something.
   * We loop through the result and set trackMatching to ["current matched",custom,"something"]
   * custom is username if one of the result is firstname and firstname if one the result is username.
   * We don't want an input to match himself.
   *
   * For copy, we not add tracking, but we merge resultValidation with current validation
   * */
  matchResult.matchKeys.forEach((v) => {
    state[v].validation = {
      ...lV(
        { ...matchResult.validation },
        state[v].validation as ValidationStateType
      ),
      ...(keyPath === "match"
        ? {
            __: setTrackingMatching(state[v], [
              stateKey,
              ...matchResult.matchKeys.filter((value) => value !== v),
              matchResult.lastMatched
            ])
          }
        : {
            // ...state[v].validation
          })
    };
  });

  /*
   * For the current input, we populate our __ (tracking matching) and keep it own validation
   * ["firstname","username","something"]. For copy, we not add tracking
   * but we merge resultValidation with current validation
   * */
  state[stateKey].validation = {
    ...lV(
      lV(
        { ...matchResult.validation },
        state[matchOrCopyKey].validation as ValidationStateType
      ),
      state[stateKey].validation as ValidationStateType
    ),
    ...(keyPath === "match"
      ? {
          match: matchOrCopyKey,
          __: setTrackingMatching(state[stateKey], [
            ...matchResult.matchKeys,
            matchResult.lastMatched
          ])
        }
      : {
          copy: matchOrCopyKey
        })
  };

  // we use ___ because, the errorMessage is dynamic, and we need to fall back to the original if needed
  state[stateKey].___ =
    state[stateKey].errorMessage ??
    state[matchOrCopyKey].errorMessage ??
    state[matchResult.lastMatched].errorMessage;

  /*
   * For the last matched, we keep his validation and add out trackingMatching prop __
   * */
  state[matchResult.lastMatched].validation = {
    ...matchResult.validation,
    ...(keyPath === "match"
      ? {
          __: setTrackingMatching(state[matchResult.lastMatched], [
            stateKey,
            ...matchResult.matchKeys
          ])
        }
      : {})
  };

  return state;
};

/**
 * We check suspicious validation key and match key which is a typical scenario for password and confirm Password
 * The validation system for matched values need them to both have the validation options.
 * For example, a user enter
 * {
 *    password: {
 *      validation: {
 *        minLength: 4
 *      }
 *    },
 *    confirmPassword: {validation: {match: "password"}}
 * }.
 * We need to copy all validation from password and paste it to confirmPassword. We need also to add
 * match: "confirmPassword" to the password key. So the validation system can run the same validate of both id
 *
 */
const matchRules = (state: ObjState) => {
  let mappedState: ObjState = { ...state };

  for (const stateKey in state) {
    // we save the error message
    mappedState[stateKey].___ = state[stateKey].errorMessage;
    // We create an input key
    mappedState[stateKey].key = crypto.randomUUID();

    /*  We are trying to see
     *  for example if an input want to copy validation from another input
     **/
    const copyKey = state[stateKey].validation?.copy;

    if (copyKey) {
      mappedState = mcv(state, stateKey, copyKey, "copy");
    }

    /*  We get the key to match with, we are trying to see
     *  for example if confirmPassword want to match validate
     *  from password
     **/
    const matchKey = state[stateKey].validation?.match;

    /* we check if validate and key to match exist else we throw error
     * For example, we check if state.confirmPassword.validate exists, and we check if matchKey
     * state.confirmPassword.validate.match exists
     */
    if (matchKey) {
      mappedState = mcv(state, stateKey, matchKey, "match");
    }
  }
  return { ...mappedState };
};

const stateIsValid = (data: ObjState) => {
  let valid = true;
  for (const formKey in data) {
    valid = valid && (data[formKey].valid ?? true);
    if (!valid) {
      break;
    }
  }
  return valid;
};
const transform = (state: any, type: StateType) => {
  const result = type === "object" ? {} : ([] as any);
  for (const key in state) {
    if (type === "array") {
      result.push(state[key]);
    } else {
      result[state[key].id] = {
        ...state[key]
      };
    }
  }
  return result;
};

export { common, stateIsValid, resetState, matchRules, transform };
