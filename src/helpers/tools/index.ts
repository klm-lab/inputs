import type {
  ArrayInputStateType,
  ErrorType,
  InputType,
  MatchResultType,
  ObjectInputStateType,
  ValidationResultType,
  ValidationStateType,
  ValuesType
} from "../../types";
import {
  CheckDeepMatch,
  checkIfMatchKeyExists,
  Validation
} from "../validation";
import { RESERVED } from "../../constants/internal";
import {
  B_U,
  F_U,
  INPUT_KEYS,
  N_U,
  S_U,
  VALIDATIONS_KEYS
} from "../../constants/input";
import { _UtilError } from "../error";

/**
 * initValidAndTouch
 * @description Set valid and touched default value
 * @author Arnaud LITAABA
 * @param entry
 * @param resetValue
 */
function initValidAndTouch(
  entry: ObjectInputStateType | ArrayInputStateType,
  resetValue?: any
) {
  const validation = entry.validation;
  const value = entry.value;
  if (typeof validation === "undefined") {
    return true;
  }
  if (Object.keys(validation).length <= 0) {
    return true;
  }
  //If value are provided then input is valid by default
  return !["", 0, null, undefined].includes(resetValue ?? value);
}

/**
 * Reset Object state
 * @param formData
 * @author Arnaud LITAABA
 */
const resetObjectState = (formData: InputType): InputType => {
  const data = { ...formData };
  for (const key in data) {
    const result = data[key].resetValue
      ? initValidAndTouch(data[key], data[key].resetValue)
      : false;
    if (key in data) {
      data[key] = {
        ...data[key],
        value: data[key].resetValue ?? "",
        valid: result,
        touched: result
      };
    }
  }
  return data;
};

/**
 * Reset Array state
 * @param formData
 * @author Arnaud LITAABA
 */
const resetArrayState = (
  formData: ArrayInputStateType[]
): ArrayInputStateType[] => {
  const data = [...formData];
  formData.forEach((_, index) => {
    const result = data[index].resetValue
      ? initValidAndTouch(data[index], data[index].resetValue)
      : false;
    data[index].value = data[index].resetValue ?? "";
    data[index].valid = result;
    data[index].touched = result;
  });
  return data;
};

/**
 * populateCommonOptions
 * @description Populate input commons options
 * @author Arnaud LITAABA
 * @param entry
 */
function commonProperties(entry: ObjectInputStateType | ArrayInputStateType) {
  return {
    type: "",
    value: "",
    valid: initValidAndTouch(entry),
    touched: initValidAndTouch(entry),
    placeholder: "",
    errorMessage: ""
  };
}

/**
 * setTrackingMatching
 * @description Set trackingMatching property for validation
 * @author Arnaud LITAABA
 * @param entry
 * @param matchKey
 */
function setTrackingMatching(entry: ObjectInputStateType, matchKey: string[]) {
  if (entry.validation?.trackingMatch) {
    return [...new Set([...entry.validation.trackingMatch, ...matchKey])];
  } else {
    return matchKey;
  }
}

/**
 * matchInputValidation
 * @description Match input validation handler. It's allow matched properties to share validation rules
 * @author Arnaud LITAABA
 * @param state
 * @param target
 * @param matchKey
 * @param keyPath
 */
function matchInputValidation(
  state: InputType,
  target: string,
  matchKey: string,
  keyPath: keyof ValidationStateType
) {
  checkIfMatchKeyExists(state, target, matchKey);
  /*
   * We create a match result with default value.
   * all matchKeys = [], lastMatched = current matchKey
   * validation: current MatchKey validation
   * */
  let matchResult: MatchResultType = {
    matchKeys: [],
    lastMatched: matchKey,
    validation: state[matchKey].validation
  };

  /*
   * We check if the matched input also match someone until find the last one who does have a match property
   * and use last not matched validation to match all input in the hierarchy.
   * We add trackingMatch for validation tool. See Class validation in ../validation.CheckMatch()
   * */
  try {
    const checkDeepMatch = new CheckDeepMatch(state);
    checkDeepMatch.startMatching(matchKey, keyPath);
    matchResult = checkDeepMatch.result;
  } catch (_) {
    throw _UtilError({
      name: "Matching Error",
      message: `It seems that we have infinite match here. Please make sure that the last matched input does not match anyone`,
      state: state
    });
  }

  /*
   * For every matched key , We set two properties.
   * - lastMatched input validation
   * - trackingMatching.
   * The input validation is the validation defined by the user (We just want to keep the match key of the user)
   * We add our result validation and for trackMatching, we put the current target,
   * all matchKeys found without the value itself and the last matched.
   * For example. if name match firstname and firstname match username and username match something,
   * the result of the matchKeys on target name are ["firstname", "username"] and lastMatched is something.
   * We loop through the result and set trackMatching to ["name",custom,"something"]
   * custom  = username if one of the result is firstname and firstname the one the result if username.
   * We don't want an input to match himself.
   *
   * For copy, we not add tracking, but we merge resultValidation with current validation
   * */
  matchResult.matchKeys.forEach((v) => {
    /* state[v] at first position for match and matchResult at first position for copy
     * therefore, we override everything on match and merge on copy
     * */
    state[v].validation = {
      ...(keyPath === "match"
        ? {
            ...state[v].validation,
            ...matchResult.validation,
            trackingMatch: setTrackingMatching(state[v], [
              target,
              ...matchResult.matchKeys.filter((v) => v !== v),
              matchResult.lastMatched
            ])
          }
        : {
            ...matchResult.validation,
            ...state[v].validation
          })
    };
  });

  /*
   * trackMatching for the target itself is the result and the last matched
   * ["firstname","username","something"]. For copy, we not add tracking
   * but we merge resultValidation with current validation
   * */
  state[target].validation = {
    ...matchResult.validation,
    ...(keyPath === "match"
      ? {
          match: matchKey,
          trackingMatch: setTrackingMatching(state[target], [
            ...matchResult.matchKeys,
            matchResult.lastMatched
          ])
        }
      : {
          ...state[target].validation,
          copy: matchKey
        })
  };

  /*
   * trackMatching for the lastMatched is the target and result
   * ["name","firstname","username"]. For copy, we not add tracking
   * */
  state[matchResult.lastMatched].validation = {
    ...matchResult.validation,
    ...(keyPath === "match"
      ? {
          trackingMatch: setTrackingMatching(state[matchResult.lastMatched], [
            target,
            ...matchResult.matchKeys
          ])
        }
      : {})
  };

  return state;
}

/**
 * checkMatchValidationAndAllProperties
 * @param state
 * @description We check suspicious validation key and match key which is a typical scenario for password and confirm Password
 * The validation system for matched values need them to both have the validation options.
 * For exemple, a user enter
 * {
 *    password: {
 *      validation: {
 *        minLength: 4
 *      }
 *    },
 *    confirmPassword: {match: {validation: {match: "password"}}}
 * }.
 * We need to copy all validation from password and paste it to confirmPassword. We need also to add
 * match: "confirmPassword" to the password key. So the validation system can run the same validation of both target
 * @author Arnaud LITAABA
 *
 */
function matchRulesAndCheckProperties(state: InputType) {
  let mappedState: InputType = { ...state };

  for (const stateKey in state) {
    if (stateKey in state) {
      /*
       * We check if state properties are ok in separate loop. Maybe we will add reserved key property
       * if checkStateProperty found it, it will throw and error
       */
      checkStateProperty(state[stateKey], state);
    }
  }

  for (const stateKey in state) {
    if (stateKey in state) {
      /*
       * We check if user want custom errorMessage and make validation unable to generate error message
       * */
      const errorMessage = state[stateKey].errorMessage;
      mappedState[stateKey].generateErrorMessage = !(
        errorMessage !== "undefined" &&
        errorMessage !== "" &&
        errorMessage !== null
      );

      /*  We are trying to see
       *  for example if an input want to match its validation with another
       **/
      const copyKey = state[stateKey].validation?.copy as string;

      /* we check if validation and key to match exist else we throw error
       * For example, we check if state.confirmPassword.validation exists, and we check if matchKey
       * state.confirmPassword.validation.copy exists
       */
      if (state[stateKey].validation && copyKey) {
        mappedState = matchInputValidation(state, stateKey, copyKey, "copy");
      }

      /*  We get the key to match with, we are trying to see
       *  for example if confirmPassword want to match validation
       *  from password
       **/
      const matchKey = state[stateKey].validation?.match as string;

      /* we check if validation and key to match exist else we throw error
       * For example, we check if state.confirmPassword.validation exists, and we check if matchKey
       * state.confirmPassword.validation.match exists
       */
      if (state[stateKey].validation && matchKey) {
        mappedState = matchInputValidation(state, stateKey, matchKey, "match");
      }
    }
  }
  return { ...mappedState };
}

/**
 * validate
 * @description Validate user input
 * @author Arnaud LITAABA
 * @param dataToValidate
 * @param target
 * @param value
 */
function validate(
  dataToValidate: InputType,
  target: string,
  value: ValuesType
): ValidationResultType {
  const validator = new Validation(dataToValidate, target, value);
  validator.validate();
  return validator.result;
}

/**
 * stateIsValid
 * @description Check if the whole state is valid
 * @author Arnaud LITAABA
 * @param data
 */
function stateIsValid(data: InputType) {
  let valid = true;
  for (const formKey in data) {
    if (formKey in data) {
      valid = valid && (data[formKey].valid ?? true);
    }
  }
  return valid;
}

function checkFirstStateRoot(state: any) {
  if ((state === null || state?.constructor?.name) === "String") {
    return;
  }
  if (
    (state === null || state?.constructor?.name) !== "Object" &&
    (state === null || state?.constructor?.name) !== "Array"
  ) {
    throw _UtilError({
      name: "StateError",
      message: "The state need to be an Array or an Object",
      state: state
    });
  }
}

/**
 * checkStateObjectAndTargetUndefinedOrValid
 * @description Check if state is an object and if target property is undefined
 * or if specified, is valid
 * @author Arnaud LITAABA
 * @param state
 */
function verifiedObjectState(state: InputType) {
  if (state?.constructor.name !== "Object") {
    throw _UtilError({
      name: "StateError",
      message: "The state is not an object",
      state: state
    });
  }
  Object.keys(state).forEach((k) => {
    if (state[k]?.constructor.name !== "Object") {
      throw _UtilError({
        name: "StateError",
        message: "The first state property need to be an object.",
        state,
        stack: `state.${k} = ${state[k]} is not valid and need to be an object; Ex: state.${k} = {}`
      });
    }
    if (typeof state[k].target !== "undefined" && state[k].target !== k) {
      throw _UtilError({
        name: "StateError",
        message: `The target does not match ${k} input state. Fix it ot remove it`,
        [k]: state[k],
        stack: JSON.stringify(state[k])
      });
    }
  });
}

/**
 * checkStateArrayAndInputObjectAndTargetValid
 * @description Check if state is an array and if target property is present and valid
 * @author Arnaud LITAABA
 * @param state
 */
function verifiedArrayState(state: ArrayInputStateType[]) {
  if (state?.constructor.name !== "Array") {
    throw _UtilError({
      name: "StateError",
      message: "The state is not an array",
      state: state
    });
  }
  const unique: string[] = [];
  state.forEach((s) => {
    if (s?.constructor.name !== "Object") {
      throw _UtilError({
        name: "StateError",
        message: "Array entry is not an object",
        stack: JSON.stringify(s)
      });
    }
    if ((typeof s.target as unknown) !== "string" || s.target === "") {
      throw _UtilError({
        name: "StateError",
        message:
          "Array entry need a property target not empty with type string",
        stack: JSON.stringify(state)
      });
    }
    if (unique.includes(s.target)) {
      throw _UtilError({
        name: "CreateState Error",
        message:
          "We found two inputs with same key. Every key should be unique",
        stack: s.target
      });
    }
    unique.push(s.target);
  });
}

/**
 * createTypeError
 * @author Arnaud LITAABA
 * @description create Properties Type error
 * @param stack
 * @param validationKey
 * @param expectedType
 * @param message
 */
function createTypeError(
  stack: any,
  validationKey:
    | keyof ValidationStateType
    | keyof ObjectInputStateType
    | keyof ArrayInputStateType,
  expectedType?: any,
  message?: string
) {
  if (stack !== undefined) {
    return {
      name: "CreateState Error",
      message:
        message ??
        `${validationKey} type is not ${expectedType} but ${typeof stack}`,
      stack: `Received value ${stack}`
    } as ErrorType;
  }
  return {} as ErrorType;
}

/**
 * checkStateProperty
 * @author Arnaud LITAABA
 * @description Check state properties to see if they are valid
 * @param entry
 * @param state
 */
function checkStateProperty(
  entry: ObjectInputStateType | ArrayInputStateType,
  state: any
) {
  const ENTRY_KEYS = Object.keys(entry);
  if (RESERVED.some((r: string) => ENTRY_KEYS.includes(r))) {
    throw _UtilError({
      name: "StateError",
      message: `We found one of our reserved word, [${RESERVED.join(
        " , "
      )}]. Do not use it. It is internal reserved key`
    });
  }
  let VALID: any[];
  VALID = ENTRY_KEYS.filter((k) => !INPUT_KEYS.includes(k));
  if (VALID.length !== 0) {
    throw _UtilError({
      name: "StateError",
      message: `Please remove these properties from state object '${VALID.join(
        " , "
      )}' . They are not supported yet.`,
      state
    });
  }
  if (
    typeof entry.validation !== "undefined" &&
    entry.validation?.constructor.name !== "Object"
  ) {
    throw _UtilError({
      name: "StateError",
      message: `If you want validation make sure it is an object`,
      state,
      stack: `validation = ${entry.validation} is not valid`
    });
  }

  if (typeof entry.validation !== "undefined") {
    const INPUT_V_KEYS = Object.keys(entry.validation);
    if (RESERVED.some((r: string) => INPUT_V_KEYS.includes(r))) {
      throw _UtilError({
        name: "StateError",
        message: `We found one of our reserved word, [${RESERVED.join(
          " , "
        )}]. Do not use it. It is internal reserved key`
      });
    }

    VALID = Object.keys(entry.validation as object).filter(
      (k) => !VALIDATIONS_KEYS.includes(k)
    );
    if (VALID.length !== 0) {
      throw _UtilError({
        name: "StateError",
        message: `Please remove these properties from validation object '${VALID.join(
          " , "
        )}' . They are not supported yet.`,
        state
      });
    }
  }
  // check if all input property type are ok
  checkInputPropertyType(entry);
}

/**
 * checkInputPropertyType
 * @param input
 * @description Check if input property and their type are valid
 * @author Arnaud LITAABA
 */
function checkInputPropertyType(input: ObjectInputStateType) {
  //check if defaultValue is valid
  // if (
  //   !["", 0, null, undefined].includes(input.resetValue) &&
  //   !["", 0, null, undefined].includes(input.value) &&
  //   input.resetValue !== input.value
  // ) {
  //   throw UtilError({
  //     name: "InputField error",
  //     message:
  //       "Default value should match value if you specified it. You can specified one of them, but if you want both, they should match"
  //   });
  // }
  // boolean check
  if (!B_U.includes(typeof input.valid)) {
    throw createTypeError(input.valid, "valid", B_U[0]);
  }
  if (!B_U.includes(typeof input.touched)) {
    throw createTypeError(input.touched, "touched", B_U[0]);
  }
  if (!B_U.includes(typeof input.validation?.required)) {
    throw createTypeError(input.validation?.required, "required", B_U[0]);
  }
  if (!B_U.includes(typeof input.validation?.email)) {
    throw createTypeError(input.validation?.email, "email", B_U[0]);
  }
  if (!B_U.includes(typeof input.validation?.number)) {
    throw createTypeError(input.validation?.number, "number", B_U[0]);
  }
  // string check
  if (!S_U.includes(typeof input.type)) {
    throw createTypeError(input.type, "type", S_U[0]);
  }
  if (!S_U.includes(typeof input.label)) {
    throw createTypeError(input.label, "label", S_U[0]);
  }
  if (!S_U.includes(typeof input.errorMessage)) {
    throw createTypeError(input.errorMessage, "errorMessage", S_U[0]);
  }
  if (!S_U.includes(typeof input.placeholder)) {
    throw createTypeError(input.placeholder, "placeholder", S_U[0]);
  }
  if (!S_U.includes(typeof input.validation?.match)) {
    throw createTypeError(input.validation?.match, "match", S_U[0]);
  }
  if (!S_U.includes(typeof input.validation?.copy)) {
    throw createTypeError(input.validation?.copy, "copy", S_U[0]);
  }
  if (!S_U.includes(typeof input.validation?.startsWith)) {
    throw createTypeError(input.validation?.startsWith, "startsWith", S_U[0]);
  }
  if (!S_U.includes(typeof input.validation?.endsWith)) {
    throw createTypeError(input.validation?.endsWith, "endsWith", S_U[0]);
  }
  // nnumber check
  if (!N_U.includes(typeof input.validation?.min)) {
    throw createTypeError(input.validation?.min, "min", N_U[0]);
  }
  if (!N_U.includes(typeof input.validation?.minLength)) {
    throw createTypeError(input.validation?.minLength, "minLength", N_U[0]);
  }
  if (!N_U.includes(typeof input.validation?.minLengthWithoutSpace)) {
    throw createTypeError(
      input.validation?.minLengthWithoutSpace,
      "minLengthWithoutSpace",
      N_U[0]
    );
  }
  if (!N_U.includes(typeof input.validation?.max)) {
    throw createTypeError(input.validation?.max, "max", N_U[0]);
  }
  if (!N_U.includes(typeof input.validation?.maxLength)) {
    throw createTypeError(input.validation?.maxLength, "maxLength", N_U[0]);
  }
  if (!N_U.includes(typeof input.validation?.maxLengthWithoutSpace)) {
    throw createTypeError(
      input.validation?.maxLengthWithoutSpace,
      "maxLengthWithoutSpace",
      N_U[0]
    );
  }
  //regex check
  if (
    typeof input.validation?.regex !== "undefined" &&
    !((input.validation.regex as unknown) instanceof RegExp)
  ) {
    throw createTypeError(input.validation.regex, "regex", "Regex expression");
  }

  // Custom validation check
  if (!F_U.includes(typeof input.validation?.custom)) {
    throw createTypeError(input.validation?.custom, "custom", F_U[0]);
  }

  function customValidationNextAction() {
    throw createTypeError(
      input.validation?.custom,
      "custom",
      "boolean",
      "This function should return boolean not an error."
    );
  }

  if (typeof input.validation?.custom !== "undefined") {
    let customValidationResult;
    try {
      customValidationResult = input.validation?.custom(input.value);
      if (typeof customValidationResult !== "boolean") {
        customValidationNextAction();
      }
    } catch (_) {
      customValidationNextAction();
    }
  }
}

/**
 * InputObjectState to Array
 * @param value The InputObjectState and transform to array
 * @description Transform InputObject to an Array
 * @author Arnaud LITAABA
 */
function inputObjectToArray(value: InputType): ArrayInputStateType[] {
  const finalArray: ArrayInputStateType[] = [];

  for (const valueKey in value) {
    if (valueKey in value) {
      finalArray.push(<ArrayInputStateType>value[valueKey]);
    }
  }

  return finalArray;
}

/**
 * inputArrayToObject
 * @param value The InputArrayState array and transform to object
 * @description Transform array input to Object
 * @author Arnaud LITAABA
 */
function inputArrayToObject<Obj extends InputType, key extends keyof Obj>(
  value: ArrayInputStateType[]
) {
  const res = {} as { [k in key]: ObjectInputStateType };

  value.forEach((v) => {
    res[v.target as key] = v;
  });

  return res;
}

export {
  commonProperties,
  stateIsValid,
  resetObjectState,
  resetArrayState,
  validate,
  matchRulesAndCheckProperties,
  inputObjectToArray,
  inputArrayToObject
};
export const _checkFirstStateRoot =
  process.env.NODE_ENV !== "production" ? checkFirstStateRoot : () => void 0;
export const _verifiedArrayState =
  process.env.NODE_ENV !== "production" ? verifiedArrayState : () => void 0;
export const _verifiedObjectState =
  process.env.NODE_ENV !== "production" ? verifiedObjectState : () => void 0;
