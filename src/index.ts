import type {
  ArrayStateOutput,
  Input,
  ObjInput,
  ObjStateOutput,
  StateType,
  StringStateOutput,
  ValuesType
} from "./types";
import { cm, mr, rs, t, vs } from "./util";
import { v, va } from "./util/validation";
import { useCallback, useMemo, useState } from "react";
import { H } from "./util/helper";

const populate = (state: any, type: StateType): any => {
  const final = {} as ObjInput;
  const helper = new H();
  for (const stateKey in state) {
    const parseKey = type === "object" ? stateKey : state[stateKey].id;
    const key = crypto.randomUUID();
    const v = {
      ...cm(state[stateKey]),
      ...state[stateKey],
      ...(type === "object" ? { id: stateKey, key } : { key })
    };
    final[parseKey] = v;
    helper.s[parseKey] = { ...v };
  }
  const s = helper.clean(mr(final, helper));
  return [type === "object" ? s : t(s, "array"), vs(s), helper];
};

const inputs = (
  initialState: any,
  type: StateType,
  asyncDelay: number,
  selective?: string
) => {
  const [entry, valid, helper] = useMemo(
    () => populate(initialState, type),
    []
  );

  // Fv is form is valid
  // 'i' is inputs
  const [{ i, fv }, setInputs] = useState({ i: entry, fv: valid });
  const setState = useCallback((input: Input, value: ValuesType) => {
    return onChange(
      helper,
      selective ? i[selective] : input,
      selective ? input : value,
      setInputs,
      type,
      asyncDelay
    );
  }, []);

  const reset = useCallback(() => {
    setInputs((prevState: any) => {
      return { i: rs(prevState.i, type), fv: false };
    });
  }, []);

  const formT = useCallback(() => {
    return t(i, type === "object" ? "array" : "object");
  }, [i]);

  return [
    selective ? i[selective] : i,
    setState,
    {
      isValid: fv,
      reset,
      ...(type === "object" ? { toArray: formT } : { toObject: formT })
    }
  ];
};

function asyncChange(
  helper: H,
  input: Input,
  value: ValuesType,
  setState: any,
  type: StateType,
  toValidate: ObjInput,
  asyncDelay: number
) {
  va(
    helper,
    toValidate,
    input.id as string,
    value,
    asyncDelay,
    ({ valid: asyncValid, em: asyncErrorMessage }: any) => {
      setState((prevState: any) => {
        const clonedData =
          type === "object" ? { ...prevState.i } : t(prevState.i, "object");
        // revalidate input
        const { valid, em } = v(
          helper,
          clonedData,
          input.id as string,
          clonedData[input.id as string].value
        );
        clonedData[input.id as string].valid = valid && asyncValid;
        clonedData[input.id as string].errorMessage = valid
          ? asyncErrorMessage
          : em;
        clonedData[input.id as string].validating = false;
        return {
          i: type === "object" ? clonedData : t(clonedData, "array"),
          fv: vs(clonedData)
        };
      });
    }
  );
}

function onChange(
  helper: H,
  input: Input,
  value: ValuesType,
  setState: any,
  type: StateType,
  asyncDelay: number
) {
  setState((prevState: any) => {
    const clonedData =
      type === "object" ? { ...prevState.i } : t(prevState.i, "object");
    const { valid, em } = v(helper, clonedData, input.id as string, value);
    clonedData[input.id as string].value = value;
    clonedData[input.id as string].touched = true;
    clonedData[input.id as string].valid = input.validation?.async
      ? false
      : valid;
    clonedData[input.id as string].errorMessage = em;
    /* if it is valid then if async is true, we set validating to true otherwise false
     * valid === false mean no need to call async,
     * valid === true means we can call async if async is set to true by the user.
     *
     * validating prop is responsible to show async validation loading
     * */
    clonedData[input.id as string].validating = valid
      ? !!input.validation?.async
      : false;

    if (valid && input.validation?.async) {
      asyncChange(helper, input, value, setState, type, clonedData, asyncDelay);
    }

    return {
      fv: vs(clonedData),
      i: type === "object" ? clonedData : t(clonedData, "array")
    };
  });
}

function useInputs<S>(
  initialState: ObjInput & S,
  asyncDelay?: number
): ObjStateOutput<keyof S>;
function useInputs(
  initialState: Input[],
  asyncDelay?: number
): ArrayStateOutput;
function useInputs(
  initialState: (string | Input)[],
  asyncDelay?: number
): ArrayStateOutput;
function useInputs(
  initialState: string,
  asyncDelay?: number
): StringStateOutput;

function useInputs(initialState: any, asyncDelay: number = 800): any {
  if (Array.isArray(initialState)) {
    return inputs(
      initialState.map((entry, i) =>
        typeof entry === "string"
          ? { id: entry }
          : entry.id
          ? entry
          : { id: `input_${i}`, ...entry }
      ),
      "array",
      asyncDelay
    );
  }
  if (typeof initialState === "string") {
    return inputs({ [initialState]: {} }, "object", asyncDelay, initialState);
  }
  return inputs(initialState, "object", asyncDelay);
}

export { useInputs };
