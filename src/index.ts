import type {
  ArrayStateOutput,
  AsyncValidationParams,
  ComputeOnceOut,
  Config,
  IDTrackUtil,
  Input,
  InputStore,
  ObjInput,
  ObjStateOutput,
  ParsedFiles,
  RequiredInput,
  RequiredObjInput,
  StateType,
  StringStateOutput,
  TrackUtil
} from "./types";
import {
  commonProps,
  extractValues,
  matchRules,
  TRACKING_KEYS,
  transform,
  validateState
} from "./util";
import { asyncValidation, validate } from "./util/validation";
import { useMemo } from "react";
import { H, persist } from "./util/helper";
import { createStore } from "aio-store/react";

const populate = (state: any, type: StateType, config: Config) => {
  const final = {} as ObjInput;
  const helper = new H();
  for (const stateKey in state) {
    const parseKey = type === "object" ? stateKey : state[stateKey].id;
    const key = crypto.randomUUID();
    const v = {
      ...commonProps(state[stateKey]),
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

const computeOnce = (initialState: any, type: StateType, config: Config) => {
  if (config.persistID && persist.p[config.persistID]) {
    return persist.p[config.persistID];
  }

  const store = createStore(populate(initialState, type, config));

  const initialForm = store.get("entry");

  store.set((ref) => {
    for (const key in initialForm) {
      ref.entry[key].onChange = (event) => {
        return onChange(
          initialForm[key],
          event.nativeEvent.target as HTMLInputElement,
          store as InputStore,
          config
        );
      };
      ref.entry[key].files = [];
    }
  });
  const getValues = (name?: string) => {
    const values = extractValues(store.get("entry"));
    return name ? values[name] : values;
  };
  const reset = () => {
    store.set((ref) => {
      ref.entry = initialForm;
      ref.isValid = store.get("initialValid");
    });
  };

  if (config.trackID && config.trackID.id) {
    config.trackID.getValues = getValues;
    config.trackID.reset = reset;
    config.trackID.isValid = () => store.get("isValid");
  }
  const result: ComputeOnceOut = { reset, getValues, store };
  if (config.persistID) {
    persist.p[config.persistID] = result;
  }
  return result;
};

const initInputs = (
  initialState: any,
  type: StateType,
  config: Config,
  selective?: string
) => {
  const { store, reset, getValues } = useMemo(
    () => computeOnce(initialState, type, config),
    []
  );

  const { entry, isValid } = store();

  const inputs = selective ? entry[selective] : entry;

  return [
    type === "object" ? inputs : transform(inputs, "array"),
    { isValid, reset, getValues }
  ];
};

const asyncCallback = ({
  valid: asyncValid,
  em: asyncErrorMessage,
  entry,
  store
}: AsyncValidationParams) => {
  // Clone inputs
  const clone = store.get("entry");
  const ID = entry.id;
  // Revalidate input, maybe a change occurs before server response
  const { valid, em } = validate(
    store.get("helper"),
    clone,
    ID,
    clone[ID].value
  );
  // Add server validation only actual data is valid
  clone[ID].valid = valid && asyncValid;
  // Add server error message only actual data is valid else keep actual error Message
  clone[ID].errorMessage = valid ? asyncErrorMessage : em;
  // Finish calling server
  clone[ID].validating = false;
  // Sync changes
  syncChanges(store, clone);
};

const createFiles = (
  files: FileList | null,
  clone: RequiredObjInput,
  ID: string,
  store: InputStore,
  config: Config
) => {
  const entry = clone[ID];
  const parsed: ParsedFiles[] = entry.mergeChanges ? [...entry.files] : [];
  //  const dataTransfer = new DataTransfer();
  if (!entry.mergeChanges) {
    entry.files.forEach((p) => URL.revokeObjectURL(p.url));
  }
  if (files) {
    for (let i = 0; i < files.length; i++) {
      const file: ParsedFiles = {
        url: URL.createObjectURL(files[i]),
        key: crypto.randomUUID(),
        file: files[i],
        onLoad: () => {
          !config.persistID && URL.revokeObjectURL(file.url);
        },
        selfRemove: () => {
          store.set((ref) => {
            const files = ref.entry[entry.id].files;
            const newFiles = files.filter((f) => f.key !== file.key);
            // Validate input
            const { valid, em } = validate(
              store.get("helper"),
              clone,
              ID,
              newFiles
            );
            ref.entry[entry.id].files = newFiles;
            ref.entry[entry.id].valid = valid;
            ref.entry[entry.id].errorMessage = em;
            // Validate form
            ref.isValid = validateState(ref.entry);
          });
        },
        selfUpdate: (data: any) => {
          store.set((ref) => {
            const files = ref.entry[entry.id].files;
            const index = files.findIndex((f) => f.key === file.key);
            files[index].updatedFile = data;
            ref.entry[entry.id].files = files;
          });
        },
        updatedFile: null
      };
      parsed.push(file);
      //  dataTransfer.items.add(files[i]);
    }
  }
  return parsed;
};

const onChange = (
  input: RequiredInput,
  element: HTMLInputElement,
  store: InputStore,
  config: Config
) => {
  // Clone inputs
  const clone = store.get("entry");
  const ID = input.id;
  // Get the value based on type
  const value =
    input.type === "file"
      ? createFiles(element.files, clone, ID, store, config)
      : element.value;

  // Validate inputs
  const { valid, em } = validate(store.get("helper"), clone, ID, value);
  // Handle type file
  if (input.type === "file") {
    clone[ID].files = value as ParsedFiles[];
  } else if (input.type === "radio") {
    // Check right radio input
    for (const key in clone) {
      if (clone[key].type === "radio") {
        clone[key].checked = clone[key].value === value;
      }
    }
  } else if (input.type === "checkbox") {
    // Toggle the checkbox input
    clone[ID].checked = !clone[ID].checked;
  } else {
    // Parse value if valid and if number
    clone[ID].value = valid
      ? input.type === "number" ||
        input.validation?.number ||
        input.validation?.min ||
        input.validation?.max
        ? Number(value)
        : value
      : value;
  }
  // Touched input
  clone[ID].touched = true;
  // Set valid to false if async is present else keep validation result
  clone[ID].valid = (input.validation?.asyncCustom as unknown) ? false : valid;
  // Set errorMessage only if invalid if not keep the default errorMessage structure, Object or undefined
  clone[ID].errorMessage = !valid ? em : em instanceof Object ? {} : undefined;
  /* if it is valid then if async is true, we set validating to true otherwise false
   * valid === false mean no need to call async,
   * valid === true means we can call async if async is set to true by the user.
   *
   * validating prop is responsible to show async validation loading
   * */
  // If all change are valid and async is there, we set valid to false else true
  clone[ID].validating = valid ? !!input.validation?.asyncCustom : false;

  // if valid and async is there, we call async validation
  valid &&
    (input.validation?.asyncCustom as unknown) &&
    asyncValidation(store, clone, ID, value, asyncCallback);
  // we sync changes
  syncChanges(store, clone);
};

const syncChanges = (store: InputStore, data: RequiredObjInput) => {
  store.set((ref) => {
    ref.entry = data;
    ref.isValid = validateState(data);
  });
};

function useInputs<S>(
  initialState: ObjInput & S,
  config?: Config
): ObjStateOutput<keyof S>;
function useInputs(initialState: Input[], config?: Config): ArrayStateOutput;
function useInputs(
  initialState: (string | Input)[],
  config?: Config
): ArrayStateOutput;
function useInputs(initialState: string, config?: Config): StringStateOutput;

function useInputs(initialState: any, config: Config = {}): any {
  if (Array.isArray(initialState)) {
    return initInputs(
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
    return initInputs({ [initialState]: {} }, "object", config, initialState);
  }
  return initInputs(initialState, "object", config);
}

function trackInputs<S extends string>(trackingID: S[]) {
  const track = {} as any;
  trackingID.forEach((a) => {
    track[a] = {
      id: a
    };
  });

  track.getValues = () => {
    let values = {} as any;
    for (const t in track) {
      if (!TRACKING_KEYS.includes(t) && track[t] && track[t].getValues) {
        values = {
          ...values,
          ...track[t].getValues()
        };
      }
    }
    return values;
  };
  track.reset = () => {
    for (const t in track) {
      if (!TRACKING_KEYS.includes(t) && track[t] && track[t].reset) {
        track[t].reset();
      }
    }
  };

  track.isValid = () => {
    let isValid = true;
    for (const t in track) {
      if (!TRACKING_KEYS.includes(t) && track[t] && track[t].isValid) {
        isValid = isValid && track[t].isValid();
      }
    }
    return isValid;
  };

  return track as TrackUtil & { [k in S]: IDTrackUtil<S> };
}

export { useInputs, trackInputs };
