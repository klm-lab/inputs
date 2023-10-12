import type {
  Input,
  MatchResultType,
  MergeType,
  ObjInput,
  StateType,
  ValidationStateType
} from "../types";
import { dp, pc } from "./validation";
import type { H } from "./helper";

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

// reset state
const rs = (formData: any, type: StateType): any => {
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

// Spread common props
function cm(entry: Input) {
  return {
    id: entry.id,
    name: entry.name ?? entry.id,
    label: entry.label ?? entry.name ?? entry.id,
    type: entry.type ?? "text",
    value: "",
    valid: initValidAndTouch(entry),
    touched: initValidAndTouch(entry),
    placeholder: "",
    errorMessage: undefined,
    validating: false
  };
}

const setTrackingMatching = (helper: H, target: string, matchKey: string[]) => {
  if (helper.tm[target]) {
    return [...new Set([...helper.tm[target], ...matchKey])];
  } else {
    return matchKey;
  }
};

/*
 * Loop validation and merge.
 * Merge help preserve value that present in the state and not in the data
 * */
const merge = (
  state: ValidationStateType,
  data: ValidationStateType,
  mergeProps?: MergeType
) => {
  const { omit, keyPath } = mergeProps || {
    omit: new Set<keyof ValidationStateType>()
  };
  for (const key in data) {
    // We give priority to the data
    if (keyPath === "copy") {
      if (
        state[key as keyof ValidationStateType]?.constructor.name ===
          "Object" &&
        data[key as keyof ValidationStateType]?.constructor.name === "Object"
      ) {
        state[key as keyof ValidationStateType] = {
          ...state[key as keyof ValidationStateType],
          ...data[key as keyof ValidationStateType]
        };
      } else {
        state[key as keyof ValidationStateType] =
          data[key as keyof ValidationStateType];
      }
    }
    // We give priority to the last matched result
    if (keyPath === "match" && state[key as keyof ValidationStateType]) {
      if (
        state[key as keyof ValidationStateType]?.constructor.name ===
          "Object" &&
        data[key as keyof ValidationStateType]?.constructor.name === "Object"
      ) {
        state[key as keyof ValidationStateType] = {
          value: state[key as keyof ValidationStateType].value,
          message:
            data[key as keyof ValidationStateType].message ??
            state[key as keyof ValidationStateType].message
        };
      }
      if (
        state[key as keyof ValidationStateType]?.constructor.name !==
          "Object" &&
        data[key as keyof ValidationStateType]?.constructor.name === "Object"
      ) {
        state[key as keyof ValidationStateType] = {
          value: state[key as keyof ValidationStateType],
          message: data[key as keyof ValidationStateType].message
        };
      }
    }
  }

  omit?.forEach((k: keyof ValidationStateType) => {
    delete state[k];
  });

  return state;
};

// Match and copy input validation
const mcv = (
  helper: H,
  state: ObjInput,
  stateKey: string,
  matchOrCopyKey: string,
  keyPath: keyof ValidationStateType
) => {
  let matchResult = {} as MatchResultType;
  /*
   * We check if the matched input also match someone until find the last one who doesn't have a match property
   * and use last not matched validation to match all input in the hierarchy.
   * We add trackMatching for validation tool. See validate function in validation folder
   * */
  try {
    matchResult = dp(helper, state, stateKey, matchOrCopyKey, keyPath);
  } catch (_) {
    throw Error(
      "It seems that we have infinite match here. Please make sure that the last matched or copied input does not match or copy anyone"
    );
  }

  /*
   * Mmv is merge matched validation
   * We merge resultValidation with all matched validation
   * */
  let mmv: ValidationStateType = {};

  matchResult.mk.forEach((v) => {
    mmv = merge(mmv, helper.s[v].validation as ValidationStateType, {
      keyPath
    });

    // We updated every matched input found with the appropriate validation
    state[v].validation = {
      ...merge(
        { ...matchResult.v },
        state[v].validation as ValidationStateType,
        { omit: helper.ok[v], keyPath }
      )
    };

    if (keyPath === "match") {
      // Setting the trackMatching for every matched key
      helper.tm[v] = setTrackingMatching(helper, v, [
        stateKey,
        ...matchResult.mk.filter((value) => value !== v),
        matchResult.lm
      ]);
    }
  });

  // We updated the current input with the appropriate validation
  state[stateKey].validation = {
    ...merge(
      merge({ ...matchResult.v }, mmv, {
        omit: helper.ok[stateKey],
        keyPath
      }),
      state[stateKey].validation as ValidationStateType,
      {
        keyPath
      }
    ),
    ...(keyPath === "match"
      ? {
          match: matchOrCopyKey
        }
      : {
          copy: helper.s[stateKey].validation?.copy
        })
  } as ValidationStateType;

  if (keyPath === "match") {
    // Setting the trackMatching for current key
    helper.tm[stateKey] = setTrackingMatching(helper, stateKey, [
      ...matchResult.mk,
      matchResult.lm
    ]);
    // Setting the trackMatching for last matched
    helper.tm[matchResult.lm] = setTrackingMatching(helper, matchResult.lm, [
      stateKey,
      ...matchResult.mk
    ]);
  }

  // We save the error message because, the errorMessage is dynamic, and we need to fall back to the original if needed
  helper.em[stateKey] =
    state[stateKey].errorMessage ??
    state[matchOrCopyKey].errorMessage ??
    state[matchResult.lm].errorMessage;

  return state;
};

/**
 *  Mr is matching rules
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
 *
 */
const mr = (state: ObjInput, helper: H) => {
  for (const stateKey in state) {
    // we save the error message
    helper.em[stateKey] = state[stateKey].errorMessage;
    // If an input want to copy validation from another input
    const copyKey = state[stateKey].validation?.copy;

    if (copyKey) {
      state = mcv(helper, state, stateKey, pc(copyKey, "copy").value, "copy");
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
      state = mcv(helper, state, stateKey, matchKey, "match");
    }
  }
  return state;
};

// Validate the state
// Set form is valid
const vs = (data: ObjInput) => {
  let valid = true;
  for (const formKey in data) {
    valid =
      valid && !data[formKey].validating && (data[formKey].valid as boolean);
    if (!valid) {
      break;
    }
  }
  return valid;
};
// T transform array to object and vice versa
const t = (state: any, type: StateType) => {
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

export { cm, vs, rs, mr, t };
