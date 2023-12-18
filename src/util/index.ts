import type {
  GetValue,
  Input,
  InputConfig,
  InputStore,
  ObjectInputs,
  Unknown
} from "../types";
import { validate } from "../inputs/validations";
import {
  CHECKBOX,
  FILE,
  keys,
  matchType,
  newKey,
  newSet,
  RADIO,
  RESERVED,
  SELECT,
  STRING
} from "./helper";
import { createStore } from "aio-store/react";
import {
  initValue,
  nextChange,
  setTouchedEm
} from "../inputs/handlers/changes";
import { createFiles } from "../inputs/handlers/files";
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
  const { id, multiple, type, afterChange, validation } = inp;
  const fIp = {
    id: id ?? key,
    name: isString ? inp : key,
    value: type === SELECT && multiple ? [] : type === RADIO ? objKey : "",
    files: [],
    checked: false,
    ...(isString ? {} : inp),
    key,
    props: {}
  } as Input & GetValue;

  fIp.g = function (previousValue, touching) {
    const { type, value, files, checked, name } = this;
    const ev = store.ev[name];
    if (type === FILE) {
      return files.map((f) => ({ file: f.file, update: f.update }));
    }
    if (type === RADIO) {
      return touching ? "" : checked ? value : previousValue ?? "";
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
    let values = isEvent
      ? value.target.value || value.nativeEvent.text || ""
      : value !== placeholder
      ? value
      : "";

    if (type === FILE) {
      const files = createFiles(
        isEvent ? newSet(value.target.files) : value,
        store,
        objKey,
        input
      );
      entry[objKey].files = files;
      values = files;
    }

    values =
      type === SELECT
        ? multiple
          ? createSelectFiles(
              isEvent ? newSet(value.target.selectedOptions) : value,
              input,
              isEvent
            )
          : values
        : values;

    nextChange(values, store, entry, input, objKey);
  };
  // Let user set value, type and data
  fIp.set = (prop, value, getFile) => {
    // console.log(this);
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

  keys(fIp).forEach((k) => {
    if (!RESERVED.has(k)) {
      fIp.props[k] = fIp[k];
    }
  });

  const { name, checked, value } = fIp;
  // we save the validation
  const ev = store.ev[name] || {};
  const initialSelection = checked
    ? ev.s
      ? ev.s.add(value)
      : newSet().add(value)
    : ev.s ?? newSet();
  store.ev[name] = {
    // save afterChange
    a: afterChange,
    // save validations
    v: ev.v ?? validation,
    // count inputs name
    c: ev.c ? ev.c + 1 : 1,
    // track selected value
    s: initialSelection,
    i: newSet(initialSelection),
    // save object keys for form.get, checkbox and radio value changes
    o: [...(ev.o ?? []), objKey],
    // save common objKey for copy and match validation
    k: objKey
  };

  // save all name for reset function
  store.n = [...(store.n ?? []), name];
  // assign the final input
  entry[objKey] = fIp;
  // validate input, maybe some default value has been set
  fIp.valid = checked
    ? true
    : validation?.match || validation?.asyncCustom
    ? false
    : !validate(
        store,
        entry,
        objKey,
        [RADIO, CHECKBOX].includes(type) ? [...store.ev[name].s] : value
      );
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
  for (const key in data) {
    if (!data[key].valid) {
      store.set((ref) =>
        setTouchedEm(
          ref.i,
          key,
          validate(
            store,
            data,
            key,
            //  (data[key] as Input & GetValue).g(data[key].value, true)
            (data[key] as Input & GetValue).g("", true)
          )
        )
      );
      break;
    }
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
