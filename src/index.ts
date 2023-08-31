import type {
  ArrayInputStateType,
  Dispatch,
  InputArrayWithFormIsValid,
  InputObjectWithFormIsValid,
  InputType,
  ObjectInputStateType,
  SetStateAction,
  StateToolsType,
  ValuesType
} from "./types";
import {
  _checkFirstStateRoot,
  _verifiedArrayState,
  _verifiedObjectState,
  commonProperties,
  inputArrayToObject,
  inputObjectToArray,
  matchRulesAndCheckProperties,
  resetArrayState,
  resetObjectState,
  stateIsValid,
  validate
} from "./helpers/tools";
import { _UtilError } from "./helpers/error";
import { useCallback, useEffect, useMemo, useState } from "react";

function verifiedAndPatchObjectInputs(
  initialState: InputType
): [InputType, boolean] {
  process.env.NODE_ENV !== "production" && _verifiedObjectState(initialState);
  let finalInputs = {} as InputType;
  Object.keys(initialState).forEach((key) => {
    finalInputs = {
      ...finalInputs,
      [key]: {
        ...commonProperties(initialState[key]),
        ...initialState[key],
        target: key
      }
    };
  });
  const validatedState = matchRulesAndCheckProperties(finalInputs);
  return [validatedState, stateIsValid(validatedState)];
}

/**
 * @name reactObjectInputs
 * @param initialState
 * @description Create an object input state.
 * we explicitly define the function return type to avoid breaking autocomplete
 * [{ [k in key]: ObjectInputStateType },(target: string | undefined, value: any) => void,boolean]
 * @author Arnaud LITAABA.
 */
function reactObjectInputs<Obj extends InputType, key extends keyof Obj>(
  initialState: Obj
): [
  { [k in key]: ObjectInputStateType },
  (target: string | undefined, value: any) => void,
  StateToolsType
] {
  const [patchedInputs, initialFormIsValid] = useMemo(
    () => verifiedAndPatchObjectInputs(initialState),
    []
  );
  const [{ inputs, formIsValid }, setInputs] = useState({
    inputs: patchedInputs,
    formIsValid: initialFormIsValid
  });
  const setState = useCallback(function (
    target: string | undefined,
    value: ValuesType
  ) {
    return onObjectStateChange(target, value, setInputs);
  }, []);
  const reset = useCallback(function () {
    setInputs((prevState: InputObjectWithFormIsValid) => {
      return {
        inputs: resetObjectState(prevState.inputs),
        formIsValid: false
      };
    });
  }, []);
  useEffect(() => {
    process.env.NODE_ENV !== "production" &&
      setInputs({
        inputs: patchedInputs,
        formIsValid: initialFormIsValid
      });
  }, []);
  return [
    inputs as { [k in key]: ObjectInputStateType },
    setState,
    {
      isValid: formIsValid,
      reset
    }
  ];
}

function verifiedAndPatchArrayInputs(
  initialState: ArrayInputStateType[]
): [ArrayInputStateType[], boolean] {
  process.env.NODE_ENV !== "production" && _verifiedArrayState(initialState);
  const finalInputs: ArrayInputStateType[] = [];
  initialState.forEach((s) => {
    finalInputs.push({ ...commonProperties(s), ...s });
  });
  const validatedState = matchRulesAndCheckProperties(
    inputArrayToObject(finalInputs)
  );
  return [inputObjectToArray(validatedState), stateIsValid(validatedState)];
}

/**
 * @name reactArrayInputs
 * @param initialState
 * @description Create an array input state.
 * we explicitly define the function return type to avoid breaking autocomplete
 * [ArrayInputStateType[],(index: number, value: any) => void,boolean]
 * @author Arnaud LITAABA
 */
function reactArrayInputs(
  initialState: ArrayInputStateType[]
): [
  ArrayInputStateType[],
  (index: number, value: any) => void,
  StateToolsType
] {
  const [patchedInputs, initialFormIsValid] = useMemo(
    () => verifiedAndPatchArrayInputs(initialState),
    []
  );
  const [{ inputs, formIsValid }, setInputs] = useState({
    inputs: patchedInputs,
    formIsValid: initialFormIsValid
  });

  const setState = useCallback(function (index: number, value: ValuesType) {
    return onArrayStateChange(index, value, setInputs);
  }, []);

  const reset = useCallback(function () {
    setInputs((prevState: InputArrayWithFormIsValid) => {
      return {
        inputs: resetArrayState(prevState.inputs),
        formIsValid: false
      };
    });
  }, []);
  useEffect(() => {
    process.env.NODE_ENV !== "production" &&
      setInputs({
        inputs: patchedInputs,
        formIsValid: initialFormIsValid
      });
  }, []);
  return [inputs, setState, { isValid: formIsValid, reset }];
}

/**
 * @name onObjectStateChange
 * @param target
 * @param value
 * @param setState
 * @description Change and validate state
 * @author Arnaud LITAABA
 */

function onObjectStateChange(
  target: string | undefined,
  value: ValuesType,
  setState: Dispatch<SetStateAction<InputObjectWithFormIsValid>>
) {
  setState((prevState: InputObjectWithFormIsValid) => {
    if (
      typeof target === "string" &&
      typeof prevState.inputs[target] !== "undefined"
    ) {
      const clonedData = { ...prevState.inputs };
      const inputEl = {
        ...clonedData[target]
      };
      inputEl.value = value;
      inputEl.touched = true;
      const { validatedData, valid, errorMessage } = validate(
        clonedData,
        target,
        value
      );
      inputEl.valid = valid;
      inputEl.errorMessage = errorMessage;
      const updatedState = {
        ...validatedData,
        [target]: { ...inputEl }
      };
      const formIsValid = stateIsValid(updatedState);
      return {
        inputs: updatedState,
        formIsValid
      };
    }
    throw _UtilError({
      name: "State update Error",
      message: `The target '${target}' is not present in the state`
    });
  });
  return;
}

/**
 * @name onArrayStateChange
 * @param index
 * @param value
 * @param setState
 * @description Change and validate state
 * @author Arnaud LITAABA
 */
function onArrayStateChange(
  index: number,
  value: ValuesType,
  setState: Dispatch<SetStateAction<InputArrayWithFormIsValid>>
) {
  if ((typeof index as unknown) !== "number") {
    throw _UtilError({
      name: "State update Error",
      message: "Index is not a number",
      stack: `${index}`
    });
  }
  setState((prevState: InputArrayWithFormIsValid) => {
    if (typeof prevState.inputs[index] === "undefined") {
      throw _UtilError({
        name: "State update Error",
        message: `Wrong index provided '${index}'`,
        stack: `'${index}'`
      });
    }
    const clonedData = [...prevState.inputs];
    const inputEl = clonedData[index];
    inputEl.value = value;
    inputEl.touched = true;
    const { validatedData, valid, errorMessage } = validate(
      inputArrayToObject(clonedData),
      inputEl.target,
      value
    );
    inputEl.valid = valid;
    inputEl.errorMessage = errorMessage;
    const result = inputObjectToArray(validatedData);
    result[index] = inputEl;
    const formIsValid = stateIsValid(validatedData);
    return { inputs: result, formIsValid };
  });
}

function useInputs<Obj extends InputType, key extends keyof Obj>(
  initialState: Obj
): [
  {
    [k in key]: ObjectInputStateType;
  },
  (target: string | undefined, value: any) => void,
  StateToolsType
];
function useInputs(
  initialState: ArrayInputStateType[]
): [ArrayInputStateType[], (index: number, value: any) => void, StateToolsType];
function useInputs(
  initialState: (string | ArrayInputStateType)[]
): [ArrayInputStateType[], (index: number, value: any) => void, StateToolsType];
function useInputs<key extends string>(
  initialState: key
): [
  {
    [k in key]: ObjectInputStateType;
  },
  (target: string | undefined, value: any) => void,
  StateToolsType
];

function useInputs(initialState: any) {
  useMemo(() => {
    process.env.NODE_ENV !== "production" && _checkFirstStateRoot(initialState);
  }, []);
  if (Array.isArray(initialState)) {
    return reactArrayInputs(
      initialState.map((target) =>
        typeof target === "string" ? { target } : target
      )
    );
  }
  if (typeof initialState === "string") {
    return reactObjectInputs({ [initialState]: {} });
  }
  return reactObjectInputs(initialState);
}

export { useInputs };
