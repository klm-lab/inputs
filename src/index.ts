import type {
  ObjState,
  StateType,
  ValuesType,
  ObjStateOutput,
  ArrayStateOutput,
  StringStateOutput,
  Input
} from "./types";
import {
  common,
  transform,
  matchRules,
  resetState,
  stateIsValid
} from "./util";
import { validate } from "./validation";
import { useCallback, useMemo, useState } from "react";

const populate = (state: any, type: StateType): any => {
  const final = {} as ObjState;
  for (const stateKey in state) {
    const parseKey = type === "object" ? stateKey : state[stateKey].id;
    final[parseKey] = {
      ...common(state[stateKey]),
      ...state[stateKey],
      ...(type === "object" ? { id: stateKey } : {})
    };
  }

  const s = matchRules(final);
  return [type === "object" ? s : transform(s, "array"), stateIsValid(s)];
};

function inputs(initialState: any, type: StateType, selective?: string) {
  const [entry, valid] = useMemo(() => populate(initialState, type), []);

  const [{ inputs, formIsValid }, setInputs] = useState({
    inputs: entry,
    formIsValid: valid
  });
  const setState = useCallback(function (input: any, value: ValuesType) {
    return onChange(
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

  return [
    selective ? inputs[selective] : inputs,
    setState,
    { isValid: formIsValid, reset }
  ];
}

async function onChange(
  input: Input,
  value: ValuesType,
  setState: any,
  type: StateType
) {
  let toValidate = {};

  async function setValue() {
    setState((prevState: any) => {
      const clonedData =
        type === "object"
          ? { ...prevState.inputs }
          : transform(prevState.inputs, "object");
      clonedData[input.id as string].value = value;
      clonedData[input.id as string].touched = true;
      clonedData[input.id as string].validating = true;
      toValidate = clonedData;
      return {
        ...prevState,
        inputs: type === "object" ? clonedData : transform(clonedData, "array")
      };
    });
  }
  await setValue();
  const { validatedData, valid, errorMessage } = await validate(
    toValidate,
    input.id as string,
    value
  );
  console.warn(validatedData, valid, input.id);
  setState(() => {
    validatedData[input.id as string].valid = valid;
    validatedData[input.id as string].validating = false;
    validatedData[input.id as string].errorMessage = errorMessage;
    const formIsValid = stateIsValid(validatedData);
    return {
      inputs:
        type === "object" ? validatedData : transform(validatedData, "array"),
      formIsValid
    };
  });
}

function useInputs<S extends ObjState>(
  initialState: S
): ObjStateOutput<keyof S>;
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
