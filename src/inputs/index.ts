import type {
  ArrayStateOutput,
  ComputeOnceOut,
  Config,
  ForEachCallback,
  InitFileConfig,
  Input,
  InputStore,
  IsValid,
  MapCallback,
  Method,
  ObjInput,
  ObjStateOutput,
  RequiredInput,
  RequiredObjInput,
  StateType,
  StringStateOutput
} from "../types";
import {
  commonProps,
  extractValues,
  matchRules,
  parseValue,
  transformToArray,
  validateState
} from "../util";
import { useMemo } from "react";
import { He, persist } from "../util/helper";
import { createStore } from "aio-store/react";
import { retrieveBlob } from "./handlers/files";
import { inputChange } from "./handlers/changes";
import { validate } from "../util/validation";

const init = (
  input: RequiredInput,
  value: unknown,
  store: InputStore,
  config: Config,
  fileConfig: InitFileConfig
) => {
  // Clone inputs
  const clone = store.get("entry");
  const ID = input.id;

  const { valid } = validate(store.get("helper"), clone, ID, value);

  /* Handle type file. It is async,
   * First, we send back an url
   * */
  if (input.type === "file") {
    retrieveBlob(value, store, clone, ID, config, fileConfig, valid);
    return;
  }
  if (input.type === "radio") {
    // Check right radio input
    clone[ID].checked = clone[ID].value === value;
  } else if (input.type === "checkbox") {
    // Toggle the checkbox input
    clone[ID].checked = (value as unknown[]).includes(clone[ID].value);
  } else {
    // Parse value if number
    clone[ID].value = parseValue(input, value);
  }
  // Sync handlers
  store.set((ref) => {
    ref.entry[ID] = clone[ID];
    ref.entry[ID].valid = valid;
  });
};

const populate = (state: any, type: StateType, config: Config) => {
  const final = {} as ObjInput;
  const helper = He();
  for (const stateKey in state) {
    const parseKey = type === "object" ? stateKey : state[stateKey].id;
    const key = crypto.randomUUID();
    const v = {
      ...commonProps(state[stateKey], stateKey),
      ...state[stateKey],
      ...(type === "object" ? { id: stateKey, key } : { key })
    };
    final[parseKey] = v;
    helper.s[parseKey] = { ...v };
  }
  const entry = helper.clean(matchRules(final, helper)) as RequiredObjInput;
  const isValid = validateState(entry);
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
  config: Config
) => {
  if (config.persistID && persist[config.persistID]) {
    return persist[config.persistID];
  }

  const store = createStore(populate(initialState, type, config));

  store.set((ref) => {
    const entry = ref.entry;
    for (const key in entry) {
      ref.entry[key].onChange = (value) =>
        inputChange(value, key, entry, store, config);
      ref.entry[key].init = (value, fileConfig: InitFileConfig = {}) =>
        init(entry[key], value, store, config, fileConfig);
      ref.entry[key].files = [];
    }
  });

  const initialForm = store.get("entry");

  const getValues = (name?: string) => {
    const values = extractValues(store.get("entry"));
    return name ? values[name] : values;
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

  const toArray = (): RequiredInput[] & IsValid => {
    const r = transformToArray(store.get("entry")) as RequiredInput[] & IsValid;
    r.isValid = store.get("isValid");
    return r;
  };
  const toObject = (): RequiredObjInput & IsValid => {
    const r = store.get("entry") as RequiredObjInput & IsValid;
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
    length
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
  config: Config,
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
    type === "object" ? inputs : transformToArray(inputs as RequiredObjInput);
  (parsedInputs as typeof parsedInputs & IsValid).isValid = isValid;
  return [parsedInputs, form];
};

function useInputs<S>(
  initialState: ObjInput | S,
  config?: Config
): ObjStateOutput<keyof S>;
function useInputs(initialState: Input[], config?: Config): ArrayStateOutput;
function useInputs(
  initialState: (string | Input)[],
  config?: Config
): ArrayStateOutput;
function useInputs(initialState: string, config?: Config): StringStateOutput;

function useInputs(initialState: unknown, config: Config = {}): unknown {
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
