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
  keys,
  matchType,
  newKey,
  newSet,
  RADIO,
  SELECT,
  STRING
} from "./helper";
import { createStore } from "aio-store/react";
import {
  initValue,
  nextChange,
  setValidAndEm
} from "../inputs/handlers/changes";
import { cleanFiles, createFiles } from "../inputs/handlers/files";
import { createSelectFiles } from "../inputs/handlers/select";

const createInput = (
  entry: Unknown,
  store: InputStore,
  // input
  inp: Unknown,
  objKey: string
) => {
  const key = newKey();
  const isString = matchType(inp, STRING);
  const { id, multiple, type, checked, validation = {} } = inp;
  const fIp = {
    id: id ?? key,
    name: isString ? inp : key,
    value: type === SELECT && multiple ? [] : type === RADIO ? objKey : "",
    files: [],
    checked: false,
    valid: checked ? true : !keys(validation).length,
    ...(isString ? {} : inp),
    key
  } as Input & GetValue;

  fIp.g = function (oldValue, touching) {
    const { type, value, files, checked, name } = this;
    const ev = store.ev[name];
    if (type === FILE) {
      return cleanFiles(files);
    }
    if (type === RADIO) {
      return touching ? "" : checked ? value : oldValue ?? "";
    }
    if (type === CHECKBOX) {
      // multiple checkbox
      if (touching || ev.c > 1) {
        return [...ev.s];
      }
      // unique checkbox
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
        isEvent ? newSet(value.target.files) : value,
        store,
        objKey,
        input
      );
    }

    const values =
      type === SELECT
        ? multiple
          ? createSelectFiles(
              isEvent ? newSet(value.target.selectedOptions) : value,
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
  fIp.set = (prop, value, getFile) => {
    store.set((ref) => {
      const input = ref.i[objKey];
      if (prop === "value") {
        initValue(objKey, value, store, input.type, getFile);
      }
      if (prop === "type") {
        input.type = value;
        input.props.type = value;
      }
      if (prop === "data") {
        input[prop] = value;
        // save data to original inputs to let reset keep the data
        entry[objKey].data = value;
      }
    });
  };
  fIp.props = {
    id: fIp.id,
    accept: fIp.accept,
    name: fIp.name,
    min: fIp.min,
    max: fIp.max,
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
    // save validations
    v: ev.v ?? fIp.validation,
    // count inputs name
    c: ev.c ? ev.c + 1 : 1,
    // track selected value
    s: checked
      ? ev.s
        ? ev.s.add(fIp.value)
        : newSet().add(fIp.value)
      : ev.s ?? newSet(),
    // save object keys for form.get, checkbox and radio value changes
    o: [...(ev.o ?? []), objKey],
    // save common objKey for copy and match validation
    k: objKey
  };

  // save all name for reset function
  store.n = [...(store.n ?? []), name];
  // assign the final input
  entry[objKey] = fIp;
  // Reset errorMessage
  entry[objKey].errorMessage = "";
  return entry[objKey].valid;
};

export const finalizeInputs = (initialState: Unknown, config: InputConfig) => {
  // create initial inputs
  const ip = {} as ObjectInputs<string>;
  // create an empty store populated by createInput
  const st = createStore({}) as unknown as InputStore;
  let isValid = true;
  // init extra variables, validation, counter, objKey and checkbox values
  st.ev = {};
  // timeout async keys, used in asyncCustom to save avery async request timeout with the input key
  st.a = {};
  if (matchType(initialState, STRING)) {
    createInput(ip, st, initialState, initialState);
  } else {
    for (const stateKey in initialState) {
      const iv = createInput(ip, st, initialState[stateKey], stateKey);
      isValid = isValid && iv;
    }
  }
  st.set((ref) => {
    // all inputs
    ref.i = ip;
    // initial valid state
    ref.inv = isValid;
    // first valid state
    ref.iv = isValid;
    ref.c = config;
    // isTouched
    ref.t = false;
  });
  return { st, ip };
};

const touchInput = (store: InputStore) => {
  const data = store.get("i");
  // invalid key
  const ik = validateState(data).ik;
  if (ik) {
    const input = data[ik] as Input & GetValue;
    store.set((ref) =>
      setValidAndEm(
        ref.i,
        ik,
        validate(store, data, ik, input.g(input.value, true))
      )
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

export { transformToArray, touchInput };
