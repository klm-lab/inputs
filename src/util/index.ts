import type {
  GetValue,
  Input,
  InputConfig,
  InputProps,
  InputStore,
  ObjectInputs,
  Unknown
} from "../types";
import { validate, validateState } from "../inputs/validations";
import {
  CHECKBOX,
  FILE,
  newKey,
  keys,
  matchType,
  RADIO,
  SELECT,
  STRING
} from "./helper";
import { createStore } from "aio-store/react";
import { initValue, nextChange, tem } from "../inputs/handlers/changes";
import { cleanFiles, createFiles } from "../inputs/handlers/files";
import { createSelectFiles } from "../inputs/handlers/select";

const createInput = (
  entry: Unknown,
  store: InputStore,
  inp: Unknown,
  objKey: string
) => {
  const key = newKey();
  const isString = matchType(inp, STRING);
  const { id, multiple, type, checked, validation = {} } = inp;
  const fIp = {
    id: id ?? key,
    name: isString ? inp : key,
    value:
      type === SELECT && multiple
        ? []
        : [RADIO, CHECKBOX].includes(type)
        ? objKey
        : "",
    files: [],
    checked: false,
    valid: checked ? true : !keys(validation).length,
    ...(isString ? {} : inp),
    key
  } as Input & GetValue;

  fIp.g = function (oldValue, data) {
    const { type, value, files, checked, name } = this;
    const ev = store.ev[name];
    if (type === FILE) {
      return cleanFiles(files);
    }
    if (type === RADIO) {
      return data ? "" : checked ? value : oldValue ?? "";
    }
    if (type === CHECKBOX) {
      if (data || ev.c > 1) {
        return [...ev.s];
      }
      return checked;
    }
    return value;
  };

  fIp.onChange = (value) => {
    const isEvent = matchType(value.preventDefault, "function");
    const entry = store.get("i");
    const input = entry[objKey];
    const { type, placeholder, multiple } = input;
    const targetValue = isEvent
      ? value.target.value || value.nativeEvent.text || ""
      : value;

    if (type === FILE) {
      entry[objKey].files = createFiles(
        isEvent ? new Set(value.target.files) : value,
        store,
        objKey,
        input
      );
    }

    const values =
      type === SELECT
        ? multiple
          ? createSelectFiles(
              isEvent ? new Set(value.target.selectedOptions) : value,
              input,
              isEvent
            )
          : targetValue !== "" && targetValue !== placeholder
          ? targetValue
          : ""
        : targetValue;

    nextChange(values, store, entry, input, objKey);
  };
  // Let user set value, type and data
  fIp.set = (prop, value, fileConfig = {}) => {
    store.set((ref) => {
      const input = ref.i[objKey];
      if (prop === "value") {
        store.fc = fileConfig;
        initValue(objKey, value, store, input.type);
      }
      if (prop === "type") {
        input.type = value;
        input.props.type = value;
      }
      if (prop === "data") {
        input[prop] = value;
      }
    });
  };
  fIp.props = {
    id: fIp.id,
    accept: fIp.accept,
    name: fIp.name,
    type: fIp.type,
    value: fIp.value,
    checked: fIp.checked,
    multiple: fIp.multiple,
    placeholder: fIp.placeholder,
    onChange: fIp.onChange
  } as InputProps;

  const { name } = fIp;
  // we save the validation
  const ev = store.ev[name] || {};
  store.ev[name] = {
    v: ev.v ?? fIp.validation,
    // count inputs name
    c: ev.c ? ev.c + 1 : 1,
    s: new Set(),
    o: ev.o ? ev.o.add(objKey) : new Set().add(objKey)
  };
  entry[objKey] = fIp;
  // Reset errorMessage
  entry[objKey].errorMessage = null;
  return entry[objKey].valid;
};

export const finalizeInputs = (initialState: Unknown, config: InputConfig) => {
  // create initial form
  const inf = {} as ObjectInputs<string>;
  // create an empty store populated by createInput
  const st = createStore({}) as unknown as InputStore;
  let isValid = true;
  // init extra variables, validation, counter, objKey and checkbox values
  st.ev = {};
  // timeout async keys
  st.a = {};
  if (matchType(initialState, STRING)) {
    createInput(inf, st, initialState, initialState);
  } else {
    for (const stateKey in initialState) {
      const iv = createInput(inf, st, initialState[stateKey], stateKey);
      isValid = isValid && iv;
    }
  }
  st.set((ref) => {
    // all inputs
    ref.i = inf;
    ref.inv = isValid;
    // initial valid state
    ref.iv = isValid;
    ref.c = config;
    // isTouched
    ref.t = false;
  });
  return { st, inf };
};

const touchInput = (store: InputStore) => {
  const data = store.get("i");
  // invalid key
  const ik = validateState(data).ik;
  if (ik) {
    const input = data[ik] as Input & GetValue;
    store.set((ref) =>
      tem(ref.i, ik, validate(store, data, ik, input.g(input.value, data)))
    );
  }
};

// T transform array to object and vice versa
const transformToArray = (state: ObjectInputs<string>) => {
  const result: Input[] = [];
  for (const key in state) {
    result.push(state[key]);
  }
  return result;
};

export const getInput = (
  store: InputStore,
  name: string
): { r: Input[]; o: string } => {
  const entry = store.get("i");
  const r: Input[] = [];
  // o = objkey
  let o = "";
  keys(entry).forEach((k) => {
    if (entry[k].name === name) {
      r.push(entry[k]);
      o = k;
    }
  });
  return { r, o };
};

export { transformToArray, touchInput };
