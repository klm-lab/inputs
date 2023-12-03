import type {
  ArrayStateOutput,
  ComputeOnceOut,
  CreateArrayInputs,
  CreateObjectInputs,
  FileConfig,
  ForEachCallback,
  Helper,
  Input,
  InputConfig,
  InputStore,
  IsValid,
  MapCallback,
  ObjectInputs,
  ObjStateOutput,
  StateType,
  StringStateOutput,
  Unknown
} from "../types";
import {
  commonProps,
  extractValues,
  syncRCAndValid,
  touchInput,
  transformToArray,
  validateState
} from "../util";
import { useMemo } from "react";
import { He, O, persist } from "../util/helper";
import { createStore } from "aio-store/react";
import { retrieveBlob } from "./handlers/files";
import { inputChange } from "./handlers/changes";
import { validate } from "./validations";

const initValue = (
  input: Input,
  value: Unknown,
  store: InputStore,
  fileConfig: FileConfig,
  helper: Helper
) => {
  // Clone inputs
  const entry = store.get("entry");
  const id = input.id;

  const { valid } = validate(helper, entry, id, value);

  if (input.type === "file") {
    retrieveBlob(value, store, id, fileConfig, valid, helper);
    return;
  }
  if (input.type === "radio") {
    // Check right radio input
    entry[id].checked = entry[id].value === value;
    entry[id].props.checked = entry[id].value === value;
  } else if (input.type === "checkbox") {
    // Toggle the checkbox input
    const cbV = (value as Unknown[]).includes(entry[id].value);
    entry[id].checked = cbV;
    entry[id].props.checked = cbV;
  } else {
    // Parse value if number
    entry[id].value = value;
    entry[id].props.value = value;
  }
  // Sync handlers
  store.set((ref) => {
    ref.entry[id] = entry[id];
    ref.entry[id].valid = valid;
  });
};

const populate = (state: Unknown, type: StateType, config: InputConfig) => {
  const final = {} as ObjectInputs<string>;
  const helper = He();
  for (const stateKey in state) {
    const parseKey = type === "object" ? stateKey : state[stateKey].id;
    const key = helper.key();
    final[parseKey] = {
      ...commonProps(state[stateKey], stateKey),
      ...state[stateKey],
      ...(type === "object" ? { id: stateKey, key } : { key })
    };
  }
  const { entry, isValid } = syncRCAndValid(final, helper);
  return {
    entry,
    isValid,
    helper,
    initialValid: isValid,
    config
    //asyncDelay: config.asyncDelay ?? 800
  };
};

const computeOnce = (
  initialState: Unknown,
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
      // onChange
      ref.entry[key].onChange = (value) =>
        inputChange(value, entry[key], store, helper);
      // Props onChange
      ref.entry[key].props.onChange = (value) =>
        inputChange(value, entry[key], store, helper);
      // set
      ref.entry[key].set = (prop, value, fileConfig: FileConfig = {}) => {
        store.set((ref) => {
          if (prop === "value") {
            initValue(entry[key], value, store, fileConfig, helper);
          }
          if (prop === "type") {
            ref.entry[key].type = value;
            ref.entry[key].props.type = value;
          }
          if (prop === "extraData") {
            ref.entry[key][prop] = value;
          }
        });
      };
      // files
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
  const onSubmit = (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
    showError();
  };

  const loop = (callback: ForEachCallback | MapCallback) => {
    const entry = store.get("entry");
    const v = {
      i: 0,
      ar: transformToArray(entry),
      mapR: [] as Unknown[]
    };
    for (const key in entry) {
      v.mapR.push(callback(entry[key], v.i, v.ar));
      v.i++;
    }
    return v.mapR;
  };

  const toArray = (): Input[] & IsValid => {
    const r = transformToArray(store.get("entry")) as Input[] & IsValid;
    r.isValid = store.get("isValid");
    return r;
  };
  const toObject = (): ObjectInputs<string> & IsValid => {
    const r = store.get("entry") as ObjectInputs<string> & IsValid;
    r.isValid = store.get("isValid");
    return r;
  };
  const reset = () => {
    store.set((ref) => {
      const entry = ref.entry;
      const rForm: ObjectInputs<string> = {};
      O.keys(initialForm).forEach((k) => {
        rForm[k] = {
          ...initialForm[k],
          extraData: entry[k].extraData
        };
      });
      ref.entry = rForm;
      ref.isValid = store.get("initialValid");
    });
  };

  const getInputById = (id: string) => {
    return store.get(`entry.${id}`);
  };

  const getInputsByName = (name: string) => {
    const entry = store.get("entry");
    const r: Input[] = [];
    O.keys(entry).forEach((k) => {
      entry[k].name === name && r.push(entry[k]);
    });
    return r;
  };

  const length = O.keys(initialForm).length;

  const result: ComputeOnceOut = {
    CompForm: {
      reset,
      getValues,
      toArray,
      toObject,
      forEach: loop,
      map: loop,
      length,
      onSubmit,
      showError,
      getInputById,
      getInputsByName
    },
    store
  };

  if (config.trackID && config.trackID.ID) {
    config.trackID.getValues = getValues;
    config.trackID.showError = showError;
    config.trackID.getInputById = getInputById;
    config.trackID.getInputsByName = getInputsByName;
    config.trackID.toArray = toArray;
    config.trackID.toObject = toObject;
    config.trackID.forEach = loop;
    config.trackID.map = loop;
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
  initialState: Unknown,
  type: StateType,
  config: InputConfig,
  selective?: string
) => {
  const { store, CompForm } = useMemo(
    () => computeOnce(initialState, type, config),
    []
  );

  const { entry, isValid } = store();

  const inputs = selective ? entry[selective] : entry;

  const parsedInputs =
    type === "object"
      ? inputs
      : transformToArray(inputs as ObjectInputs<string>);
  (parsedInputs as typeof parsedInputs & IsValid).isValid = isValid;
  return [parsedInputs, CompForm];
};

// External declaration support (Dynamic infer)
function useInputs<I>(
  initialState: I extends Array<Unknown>
    ? CreateArrayInputs | I
    : CreateObjectInputs<keyof I> | I,
  config?: InputConfig
): I extends Array<Unknown> ? ArrayStateOutput : ObjStateOutput<I>;
// Internal declaration object
function useInputs<I extends CreateObjectInputs<keyof I>>(
  initialState: CreateObjectInputs<keyof I> | I,
  config?: InputConfig
): ObjStateOutput<I>;
// Internal declaration Array
function useInputs<I extends CreateArrayInputs>(
  initialState: CreateArrayInputs | I,
  config?: InputConfig
): ArrayStateOutput;
// string
function useInputs(
  initialState: string,
  config?: InputConfig
): StringStateOutput;

function useInputs(initialState: Unknown, config: InputConfig = {}): Unknown {
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
