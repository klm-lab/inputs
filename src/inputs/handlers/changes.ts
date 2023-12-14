import {
  Input,
  InputStore,
  InternalInput,
  ObjectInputs,
  Unknown
} from "../../types";
import { validate, validateState } from "../validations";
import { createCheckboxValue } from "./checkbox";
import { extractValues, setValue } from "./values";
import { retrieveFile } from "./files";

export const initValue = (
  objKey: string,
  value: Unknown,
  store: InputStore,
  type: string
) => {
  // Clone inputs
  const input = store.get(`i.${objKey}`);

  if (type === "file") {
    [value].flat().forEach((v: Unknown, index: number) => {
      retrieveFile(v, store, objKey, index);
    });
    return;
  }
  if (type === "radio") {
    // Check right radio input
    setValue(input, input.value === value);
  } else if (type === "checkbox") {
    // Toggle the checkbox input
    setValue(input, value.length ? value.includes(input.value) : value);
  } else {
    setValue(input, value, false);
  }
  // Sync handlers
  store.set((ref) => {
    ref.i[objKey] = input;
    ref.i[objKey].valid = true;
  });
};

export const nextChange = (
  value: Unknown,
  store: InputStore,
  entry: ObjectInputs<string>,
  input: Input,
  objKey: string,
  type: string
  // isEvent: boolean
) => {
  if (type === "radio") {
    // Check right radio input
    for (const key in entry) {
      const inp = entry[key];
      if (inp.type === "radio" && inp.name === entry[objKey].name) {
        setValue(inp, inp.value === value);
        inp.valid = true;
      }
    }
  } else if (type === "checkbox") {
    // Toggle the checkbox input
    setValue(entry[objKey], !entry[objKey].checked);
    value = createCheckboxValue(entry, objKey);
  } else {
    setValue(entry[objKey], value, false);
  }

  const { v, em } = validate(store, entry, objKey, value);
  // we sync handlers
  syncChanges(store, tem(entry, objKey, v, em));
  // run after changes
  const r = (input as InternalInput).afterChange;
  r &&
    r({
      value: extractValues(store.get("i"))[input.name],
      input
    });
};

// Set touch, valid and error message
export const tem = (
  entry: ObjectInputs<string>,
  objKey: string,
  valid: boolean,
  em: Unknown
) => {
  entry[objKey].touched = true;
  entry[objKey].valid = valid;
  entry[objKey].errorMessage = em;
  return entry;
};

export const syncChanges = (store: InputStore, data: ObjectInputs<string>) => {
  store.set((ref) => {
    ref.i = data;
    ref.iv = validateState(data).iv;
  });
};
