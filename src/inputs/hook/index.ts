import { computeOnce } from "../index";
import type {
  InputConfig,
  InputsHook,
  IsValid,
  ObjectInputs,
  StateType,
  Unknown
} from "../../types";
import { useMemo } from "react";
import { transformToArray } from "../../util";

const parsedInputs = (
  initialState: Unknown,
  type: StateType,
  config: InputConfig,
  // hookType: HookType,
  selective?: string
) => {
  const { store, compForm } = useMemo(
    () => computeOnce(initialState, type, config),
    []
  );

  const { entry, isValid } = store();

  const inputs = selective ? entry[selective] : entry;

  const parsedInputs =
    type === "object"
      ? inputs
      : transformToArray(inputs as ObjectInputs<string>);
  (parsedInputs as typeof parsedInputs & IsValid).isValid = isValid;
  return [parsedInputs, compForm];
};

// // External declaration support (Dynamic infer)
// function useInputs<I>(
//   initialState: I extends Array<Unknown>
//     ? CreateArrayInputs | I
//     : CreateObjectInputs<keyof I> | I,
//   config?: InputConfig
// ): I extends Array<Unknown> ? ArrayStateOutput : ObjStateOutput<I>;
// // Internal declaration object
// function useInputs<I extends CreateObjectInputs<keyof I>>(
//   initialState: CreateObjectInputs<keyof I> | I,
//   config?: InputConfig
// ): ObjStateOutput<I>;
// // Internal declaration Array
// function useInputs<I extends CreateArrayInputs>(
//   initialState: CreateArrayInputs | I,
//   config?: InputConfig
// ): ArrayStateOutput;
// // string
// function useInputs(
//   initialState: string,
//   config?: InputConfig
// ): StringStateOutput;

const useInputs: InputsHook = (
  initialState: Unknown,
  config = {}
  //  type
): Unknown => {
  if (initialState instanceof Array) {
    return parsedInputs(
      initialState.map((entry, i) =>
        typeof entry === "string"
          ? { id: entry }
          : entry.id
          ? entry
          : { id: `input_${i}`, ...entry }
      ),
      "array",
      config
      //  type
    );
  }
  if (typeof initialState === "string") {
    return parsedInputs(
      { [initialState]: {} },
      "object",
      config,
      // type,
      initialState
    );
  }
  return parsedInputs(initialState, "object", config);
};

export { useInputs };
