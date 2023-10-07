import type {
  ArrayStateOutput,
  Input,
  ObjState,
  ObjStateOutput,
  StateType,
  StringStateOutput,
  ValuesType
} from "./types";
import {
  common,
  matchRules,
  resetState,
  stateIsValid,
  transform
} from "./util";
import { validate, validateAsync } from "./validation";
import { useCallback, useMemo, useState } from "react";
import { Helper } from "./util/helper";

const populate = (state: any, type: StateType): any => {
  const final = {} as ObjState;
  const helper = new Helper();
  for (const stateKey in state) {
    const parseKey = type === "object" ? stateKey : state[stateKey].id;
    const key = crypto.randomUUID();
    const v = {
      ...common(state[stateKey]),
      ...state[stateKey],
      ...(type === "object" ? { id: stateKey, key } : { key })
    };
    final[parseKey] = v;
    helper.state[parseKey] = { ...v };
  }
  const s = helper.clean(matchRules(final, helper));
  return [
    type === "object" ? s : transform(s, "array"),
    stateIsValid(s),
    helper
  ];
};

function inputs(initialState: any, type: StateType, selective?: string) {
  const [entry, valid, helper] = useMemo(
    () => populate(initialState, type),
    []
  );

  const [{ inputs, formIsValid }, setInputs] = useState({
    inputs: entry,
    formIsValid: valid
  });
  const setState = useCallback(function (input: Input, value: ValuesType) {
    return onChange(
      helper,
      selective ? inputs[selective] : input,
      selective ? input : value,
      setInputs,
      type
    );
  }, []);

  const reset = useCallback(function () {
    setInputs((prevState: any) => {
      return {
        inputs: resetState(prevState.inputs, type),
        formIsValid: false
      };
    });
  }, []);

  const formT = useCallback(
    function () {
      return transform(inputs, type === "object" ? "array" : "object");
    },
    [inputs]
  );

  return [
    selective ? inputs[selective] : inputs,
    setState,
    {
      isValid: formIsValid,
      reset,
      ...(type === "object" ? { toArray: formT } : { toObject: formT })
    }
  ];
}

function asyncChange(
  helper: Helper,
  input: Input,
  value: ValuesType,
  setState: any,
  type: StateType,
  toValidate: ObjState
) {
  validateAsync(
    helper,
    toValidate,
    input.id as string,
    value,
    ({ valid: asyncValid, errorMessage: asyncErrorMessage }: any) => {
      setState((prevState: any) => {
        const clonedData =
          type === "object"
            ? { ...prevState.inputs }
            : transform(prevState.inputs, "object");
        // revalidate input
        const { isValid, errorMessage } = validate(
          helper,
          clonedData,
          input.id as string,
          clonedData[input.id as string].value
        );

        clonedData[input.id as string].valid = isValid && asyncValid;
        clonedData[input.id as string].errorMessage = isValid
          ? asyncErrorMessage
          : errorMessage;
        clonedData[input.id as string].validating = false;
        return {
          inputs:
            type === "object" ? clonedData : transform(clonedData, "array"),
          formIsValid: stateIsValid(clonedData)
        };
      });
    }
  );
}

function onChange(
  helper: Helper,
  input: Input,
  value: ValuesType,
  setState: any,
  type: StateType
) {
  setState((prevState: any) => {
    const clonedData =
      type === "object"
        ? { ...prevState.inputs }
        : transform(prevState.inputs, "object");
    const { isValid, errorMessage } = validate(
      helper,
      clonedData,
      input.id as string,
      value
    );
    clonedData[input.id as string].value = value;
    clonedData[input.id as string].touched = true;
    clonedData[input.id as string].valid = input.validation?.async
      ? false
      : isValid;
    clonedData[input.id as string].errorMessage = errorMessage;
    /* if it is valid then if async is true, we set validating to true otherwise false
     * valid === false mean no need to call async,
     * valid === true means we can call async if async is set to true by the user.
     *
     * validating prop is responsible to show async validation loading
     * */
    clonedData[input.id as string].validating = isValid
      ? !!input.validation?.async
      : false;

    if (isValid && input.validation?.async) {
      asyncChange(helper, input, value, setState, type, clonedData);
    }

    return {
      formIsValid: stateIsValid(clonedData),
      inputs: type === "object" ? clonedData : transform(clonedData, "array")
    };
  });
}

function useInputs<S>(initialState: ObjState & S): ObjStateOutput<keyof S>;
function useInputs(initialState: Input[]): ArrayStateOutput;
function useInputs(initialState: (string | Input)[]): ArrayStateOutput;
function useInputs(initialState: string): StringStateOutput;

function useInputs(initialState: any): any {
  if (Array.isArray(initialState)) {
    return inputs(
      initialState.map((entry, i) =>
        typeof entry === "string"
          ? { id: entry }
          : entry.id
          ? entry
          : { id: `input_${i}`, ...entry }
      ),
      "array"
    );
  }
  if (typeof initialState === "string") {
    return inputs({ [initialState]: {} }, "object", initialState);
  }
  return inputs(initialState, "object");
}

export { useInputs };
