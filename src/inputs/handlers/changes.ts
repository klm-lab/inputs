import {
  Input,
  InputStore,
  InternalInput,
  ObjectInputs,
  Unknown
} from "../../types";
import { validate, validateState } from "../validations";
import { extractValues, setValue } from "./values";
import { retrieveFile } from "./files";
import { CHECKBOX, FILE, RADIO } from "../../util/helper";
import { setCRValues } from "./checkboxAndRadio";

export const initValue = (
  objKey: string,
  value: Unknown,
  store: InputStore,
  type: string
) => {
  // Clone inputs
  const input = store.get(`i.${objKey}`);

  if (type === FILE) {
    [value].flat().forEach((v: Unknown, index: number) => {
      retrieveFile(v, store, objKey, index);
    });
    return;
  }
  if (type === RADIO) {
    // Check right radio input
    setValue(input, input.value === value);
  } else if (type === CHECKBOX) {
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
  objKey: string
) => {
  const { name, checked, type } = input;
  if (type === RADIO) {
    // Check right radio input and make other valid
    setCRValues(store, entry, name, (i) => setValue(i, i.value === value));
  } else if (type === CHECKBOX) {
    // Toggle the checkbox input
    setValue(input, !checked);
    // Keep only selected checkbox
    store.ev[name].s[!checked ? "add" : "delete"](value);
    // Make checkbox valid and clear errorMessage
    setCRValues(store, entry, name);
    // Selected checkbox that can be validated
    value = [...store.ev[name].s];
  } else {
    setValue(input, value, false);
  }
  // we sync handlers
  syncChanges(store, tem(entry, objKey, validate(store, entry, objKey, value)));
  // run after changes
  const r = (input as InternalInput).afterChange;
  r &&
    r({
      value: extractValues(store.get("i"))[name],
      input
    });
};

// Set touch, valid and error message
export const tem = (
  entry: ObjectInputs<string>,
  objKey: string,
  em: Unknown
) => {
  entry[objKey].touched = true;
  entry[objKey].valid = !em;
  entry[objKey].errorMessage = em;
  return entry;
};

export const syncChanges = (store: InputStore, data: ObjectInputs<string>) => {
  store.set((ref) => {
    ref.i = data;
    ref.t = true;
    ref.iv = validateState(data).iv;
  });
};
