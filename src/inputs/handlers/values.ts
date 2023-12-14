import { type GetValue, Input, ObjectInputs, type Unknown } from "../../types";

export const extractValues = (state: ObjectInputs<string>) => {
  const result = {} as { [k in string]: Unknown };
  for (const key in state) {
    const input = state[key] as Input & GetValue;
    result[input.name] = input.g(result[input.name]);
  }
  return result;
};

export const setValue = (input: Input, value: Unknown, cr: boolean = true) => {
  if (cr) {
    input.checked = value;
    input.props.checked = value;
  } else {
    input.value = value;
    input.props.value = value;
  }
};
