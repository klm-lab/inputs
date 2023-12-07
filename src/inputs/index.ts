import type {
  ComputeOnceOut,
  ForEachCallback,
  Input,
  InputConfig,
  IsValid,
  MapCallback,
  ObjectInputs,
  StateType,
  Unknown
} from "../types";
import {
  extractValues,
  finalizeInputs,
  touchInput,
  transformToArray
} from "../util";
import { O, persist } from "../util/helper";
import { validateState } from "./validations";

export const computeOnce = (
  initialState: Unknown,
  type: StateType,
  config: InputConfig
) => {
  if (config.persistID && persist[config.persistID]) {
    return persist[config.persistID];
  }
  const { store, helper, initialForm } = finalizeInputs(
    initialState,
    type,
    config
  );

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
    compForm: {
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
