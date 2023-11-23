import type {
  ArrayStateOutput,
  ComputeOnceOut,
  InputConfig,
  CreateArrayInput,
  CreateObjectInput,
  ForEachCallback,
  Helper,
  InitFileConfig,
  Input,
  InputStore,
  InternalInput,
  IsValid,
  MapCallback,
  Method,
  ObjectInput,
  ObjStateOutput,
  StateType,
  StringStateOutput
} from "../types";
import {
  commonProps,
  extractValues,
  lockProps,
  matchRules,
  parseValue,
  touchInput,
  transformToArray,
  validateState
} from "../util";
import { SyntheticEvent, useMemo } from "react";
import { He, persist } from "../util/helper";
import { createStore } from "aio-store/react";
import { retrieveBlob } from "./handlers/files";
import { inputChange } from "./handlers/changes";
import { validate } from "../util/validation";

const init = (
  input: Input,
  value: unknown,
  store: InputStore,
  config: InputConfig,
  fileConfig: InitFileConfig,
  helper: Helper
) => {
  // Clone inputs
  const clone = store.get("entry");
  const ID = input.id;

  const { valid } = validate(helper, clone, ID, value);

  /* Handle type file. It is async,
   * First, we send back an url
   * */
  if (input.type === "file") {
    retrieveBlob(value, store, clone, ID, config, fileConfig, valid, helper);
    return;
  }
  if (input.type === "radio") {
    // Check right radio input
    clone[ID].checked = clone[ID].value === value;
    clone[ID].props.checked = clone[ID].value === value;
  } else if (input.type === "checkbox") {
    // Toggle the checkbox input
    const cbV = (value as unknown[]).includes(clone[ID].value);
    clone[ID].checked = cbV;
    clone[ID].props.checked = cbV;
  } else {
    // Parse value if number
    clone[ID].value = parseValue(input, value);
    clone[ID].props.value = parseValue(input, value);
  }
  // Sync handlers
  store.set((ref) => {
    ref.entry[ID] = clone[ID];
    ref.entry[ID].valid = valid;
  });
};

const populate = (state: any, type: StateType, config: InputConfig) => {
  const final = {} as CreateObjectInput;
  const helper = He();
  for (const stateKey in state) {
    const parseKey = type === "object" ? stateKey : state[stateKey].id;
    const key = crypto.randomUUID();
    const v: Input = {
      ...commonProps(state[stateKey], stateKey),
      ...state[stateKey],
      ...(type === "object" ? { id: stateKey, key } : { key })
    };
    v.props = lockProps(v);
    final[parseKey] = v;
    helper.s[parseKey] = { ...v };
  }
  const entry = helper.clean(matchRules(final, helper)) as ObjectInput;
  const isValid = validateState(entry).isValid;
  return {
    entry,
    isValid,
    helper,
    initialValid: isValid,
    asyncDelay: config.asyncDelay ?? 800
  };
};

const computeOnce = (
  initialState: unknown,
  type: StateType,
  config: InputConfig
) => {
  if (config.persistID && persist[config.persistID]) {
    return persist[config.persistID];
  }

  const store = createStore(populate(initialState, type, config));

  const helper = store.get("helper");

  store.set((ref) => {
    const entry = ref.entry;
    for (const key in entry) {
      ref.entry[key].onChange = (value) =>
        inputChange(value, key, entry, store, config, helper);
      ref.entry[key].props.onChange = (value) =>
        inputChange(value, key, entry, store, config, helper);
      ref.entry[key].init = (value, fileConfig: InitFileConfig = {}) =>
        init(entry[key], value, store, config, fileConfig, helper);
      ref.entry[key].files = [];
    }
  });

  const initialForm = store.get("entry");

  const getValues = (name?: string) => {
    if (
      config.lockValuesOnError &&
      !validateState(store.get("entry")).isValid
    ) {
      return null;
    }
    const values = extractValues(store.get("entry"));
    return name ? values[name] : values;
  };

  const showError = () => {
    touchInput(store, helper);
  };
  const onSubmit = (event: SyntheticEvent) => {
    event.preventDefault();
    event.stopPropagation();
    showError();
  };

  const loop = (callback: ForEachCallback | MapCallback, method: Method) => {
    const entry = store.get("entry");
    const v = {
      i: 0,
      ar: transformToArray(entry),
      mapR: [] as unknown[]
    };
    for (const key in entry) {
      v.mapR.push(callback(entry[key], v.i, v.ar));
      v.i++;
    }
    if (method === "map") {
      return v.mapR;
    }
  };
  const forEach = (callback: ForEachCallback) => loop(callback, "forEach");

  const map = (callback: MapCallback) => loop(callback, "map") as unknown[];

  const toArray = (): Input[] & IsValid => {
    const r = transformToArray(store.get("entry")) as Input[] & IsValid;
    r.isValid = store.get("isValid");
    return r;
  };
  const toObject = (): ObjectInput & IsValid => {
    const r = store.get("entry") as ObjectInput & IsValid;
    r.isValid = store.get("isValid");
    return r;
  };
  const reset = () => {
    store.set((ref) => {
      ref.entry = initialForm;
      ref.isValid = store.get("initialValid");
    });
  };

  const length = Object.keys(initialForm).length;

  const result: ComputeOnceOut = {
    reset,
    getValues,
    store,
    toArray,
    toObject,
    forEach,
    map,
    length,
    onSubmit,
    showError
  };

  if (config.trackID && config.trackID.ID) {
    config.trackID.getValues = getValues;
    config.trackID.toArray = toArray;
    config.trackID.toObject = toObject;
    config.trackID.forEach = forEach;
    config.trackID.map = map;
    config.trackID.reset = reset;
    config.trackID.isValid = () => store.get("isValid");
    config.trackID.length = length;
    config.trackID.useValues = (name?: string) => {
      const entry = store("entry");
      const values = extractValues(entry);
      return name ? values[name] : values;
    };
  }

  if (config.persistID) {
    persist[config.persistID] = result;
  }
  return result;
};

const parsedInputs = (
  initialState: unknown,
  type: StateType,
  config: InputConfig,
  selective?: string
) => {
  const { store, ...rest } = useMemo(
    () => computeOnce(initialState, type, config),
    []
  );

  const { entry, isValid } = store();

  const inputs = selective ? entry[selective] : entry;

  const form = useMemo(() => rest, []);

  const parsedInputs =
    type === "object" ? inputs : transformToArray(inputs as ObjectInput);
  (parsedInputs as typeof parsedInputs & IsValid).isValid = isValid;
  return [parsedInputs, form];
};

function useInputs<S>(
  initialState: CreateObjectInput | S,
  config?: InputConfig
): ObjStateOutput<keyof S>;
function useInputs(
  initialState: CreateArrayInput,
  config?: InputConfig
): ArrayStateOutput;
function useInputs(
  initialState: (string | InternalInput)[],
  config?: InputConfig
): ArrayStateOutput;
function useInputs(
  initialState: string,
  config?: InputConfig
): StringStateOutput;

function useInputs(initialState: unknown, config: InputConfig = {}): unknown {
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
    );
  }
  if (typeof initialState === "string") {
    return parsedInputs({ [initialState]: {} }, "object", config, initialState);
  }
  return parsedInputs(initialState, "object", config);
}

export { useInputs };
