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
import { createCheckboxValue } from "../inputs/handlers/checkbox";
import { Helper, keys, matchType } from "./helper";
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
  const key = store.h.key();
  const isString = matchType(inp, "string");
  const { id, multiple, type, checked, validation = {} } = inp;
  const fIp = {
    id: id ?? key,
    name: isString ? inp : key,
    value:
      type === "select" && multiple
        ? []
        : ["radio", "checkbox"].includes(type)
        ? objKey
        : "",
    files: [],
    checked: false,
    valid: checked ? true : !keys(validation).length,
    required: !!validation?.required,
    ...(isString ? {} : inp),
    key
  } as Input & GetValue;

  fIp.g = function (oldValue, data) {
    const { type, value, files, checked, name } = this;
    if (type === "file") {
      return cleanFiles(files);
    }
    if (type === "radio") {
      return data ? "" : checked ? value : oldValue ?? "";
    }
    if (type === "checkbox") {
      if (data) {
        return createCheckboxValue(data, objKey, false);
      }
      if (store.h.ev[name].c > 1) {
        const v = oldValue || [];
        checked && v.push(value);
        return v;
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

    if (type === "file") {
      entry[objKey].files = createFiles(
        isEvent ? new Set(value.target.files) : value,
        store,
        objKey,
        input
      );
    }

    const values =
      type === "select"
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

    nextChange(values, store, entry, input, objKey, type);
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
    name: fIp.name,
    type: fIp.type,
    value: fIp.value,
    checked: fIp.checked,
    multiple: fIp.multiple,
    placeholder: fIp.placeholder,
    required: fIp.required,
    onChange: fIp.onChange
  } as InputProps;

  const { name, errorMessage } = fIp;
  // we save the error message and validation
  const ev = store.h.ev[name] || {};
  store.h.ev[name] = {
    e: ev.e ?? errorMessage,
    v: ev.v ?? fIp.validation,
    // count inputs name
    c: ev.c ? ev.c + 1 : 1
  };
  entry[objKey] = fIp;
  // Reset errorMessage
  entry[objKey].errorMessage = errorMessage instanceof Object ? {} : undefined;

  return entry[objKey].valid;
};

export const finalizeInputs = (initialState: Unknown, config: InputConfig) => {
  const inf = {} as ObjectInputs<string>;
  const st = createStore({}) as unknown as InputStore;
  let isValid = true;
  st.h = Helper();
  if (matchType(initialState, "string")) {
    createInput(inf, st, initialState, initialState);
  } else {
    for (const stateKey in initialState) {
      const iv = createInput(inf, st, initialState[stateKey], stateKey);
      isValid = isValid && iv;
    }
  }
  st.set((ref) => {
    ref.i = inf;
    ref.inv = isValid;
    ref.iv = isValid;
    ref.c = config;
  });
  return { st, inf };
};

const touchInput = (store: InputStore) => {
  const data = store.get("i");
  const ik = validateState(data).ik;
  if (ik) {
    const input = data[ik] as Input & GetValue;
    const { em } = validate(store, data, ik, input.g(input.value, data));
    store.set((ref) => tem(ref.i, ik, false, em));
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
