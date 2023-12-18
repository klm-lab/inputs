import {
  GetFile,
  GetValue,
  Input,
  InputStore,
  ObjectInputs,
  Unknown
} from "../../types";
import { validate, validateState } from "../validations";
import { setValue } from "./values";
import { parseFile } from "./files";
import { CHECKBOX, FILE, newSet, RADIO } from "../../util/helper";
import { setCRValues } from "./checkboxAndRadio";

export const initValue = (
  objKey: string,
  value: Unknown,
  store: InputStore,
  type: string,
  getFile?: GetFile
) => {
  // Clone inputs
  const input = store.get(`i.${objKey}`);
  if (type === FILE) {
    [value].flat().forEach((v: Unknown, index: number) => {
      input.files[index] = parseFile(objKey, store, v, !!getFile, {} as File);
      getFile &&
        getFile(v).then((r: Unknown) => {
          store.set((ref) => {
            const f = ref.i[objKey].files[index];
            f.fetching = false;
            f.file = r as File;
          });
        });
    });
  } else if (type === RADIO) {
    // Check right radio input
    setValue(input, input.value === value);
  } else if (type === CHECKBOX) {
    // Toggle the checkbox input
    const checked = value.length ? value.includes(input.value) : value;
    setValue(input, checked);
    if (checked && value.length) {
      store.ev[input.name].s = newSet(value);
    }
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
  entry[objKey].validationFailed = false;
  // we sync handlers
  syncChanges(
    store,
    setTouchedEm(entry, objKey, validate(store, entry, objKey, value))
  );
  // run after changes
  const r = store.ev[name].a;
  r &&
    r({
      value: (input as Input & GetValue).g(),
      //value: extractValues(store.get("i"))[name],
      input
    });
};

// Set touched, and error message and return the entry (inputs)
export const setTouchedEm = (
  entry: ObjectInputs<string>,
  objKey: string,
  em: Unknown
) => {
  entry[objKey].touched = true;
  entry[objKey].errorMessage = em;
  return entry;
};

export const syncChanges = (store: InputStore, data: ObjectInputs<string>) => {
  store.set((ref) => {
    // updated inputs
    ref.i = data;
    // isTouched
    ref.t = true;
    // new valid state
    ref.iv = validateState(data);
  });
};
