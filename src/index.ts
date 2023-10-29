import type {
  ArrayStateOutput,
  Config,
  IDTrackUtil,
  Input,
  ObjInput,
  ObjStateOutput,
  StateType,
  StringStateOutput,
  TrackUtil,
  ValuesType
} from "./types";
import { cm, e, mr, rs, t, TRACKING_KEYS, vs } from "./util";
import { v, va } from "./util/validation";
import { useEffect, useMemo } from "react";
import { H, persist } from "./util/helper";
import { createStore } from "aio-store/react";

const populate = (state: any, type: StateType): any => {
  const final = {} as ObjInput;
  const helper = new H();
  for (const stateKey in state) {
    const parseKey = type === "object" ? stateKey : state[stateKey].id;
    const key = crypto.randomUUID();
    const v = {
      ...cm(state[stateKey]),
      ...state[stateKey],
      ...(type === "object" ? { id: stateKey, key } : { key })
    };
    final[parseKey] = v;
    helper.s[parseKey] = { ...v };
  }
  const entry = helper.clean(mr(final, helper));
  const isValid = vs(entry);
  helper.iv = isValid;
  return { entry, isValid, helper };
};

const inputs = (
  initialState: any,
  type: StateType,
  config: Config,
  selective?: string
) => {
  const {
    store: inputsStore,
    set,
    reset,
    getValues
  } = useMemo(() => {
    if (config.persistID && persist.p[config.persistID]) {
      return persist.p[config.persistID];
    }

    const store = createStore(populate(initialState, type));
    const en = store.get("entry");
    const getValues = () => e(store.get("entry"));

    const reset = () => {
      store.set((ref) => {
        ref.entry = rs({ ...en });
        ref.isValid = store.get("helper").iv;
      });
    };

    if (config.trackID && config.trackID.id) {
      config.trackID.getValues = getValues;
      config.trackID.reset = reset;
      config.trackID.isValid = () => store.get("isValid");
    }
    const result = {
      set: (input: Input, value: ValuesType) => {
        return onChange(
          // entry is used to get id so, no need to add it as dependency
          selective ? en[selective] : input,
          selective ? input : value,
          store,
          config.asyncDelay as number
        );
      },
      reset,
      getValues,
      store
    };
    if (config.persistID) {
      persist.p[config.persistID as string] = result;
    }
    return result;
  }, []);

  const { entry, isValid } = inputsStore();

  const inputs = selective ? entry[selective] : entry;

  useEffect(() => {
    return () => {
      !config.persistID && reset();
    };
  }, [config.persistID, reset]);

  return [
    type === "object" ? inputs : t(inputs, "array"),
    set,
    { isValid, reset, getValues }
  ];
};

const asyncCallback = ({
  valid: asyncValid,
  em: asyncErrorMessage,
  entry,
  inputStores
}: any) => {
  inputStores.set((ref: any) => {
    const clonedData = { ...ref.entry };
    // revalidate input
    const { valid, em } = v(
      inputStores,
      clonedData,
      entry.id as string,
      clonedData[entry.id as string].value
    );
    clonedData[entry.id as string].valid = valid && asyncValid;
    clonedData[entry.id as string].errorMessage = valid
      ? asyncErrorMessage
      : em;
    clonedData[entry.id as string].validating = false;
    ref.entry = clonedData;
    ref.isValid = vs(clonedData);
  });
};

const onChange = (
  input: Input,
  value: ValuesType,
  inputStores: any,
  asyncDelay: number
) => {
  inputStores.set((ref: any) => {
    const clonedData = { ...ref.entry };
    const { valid, em } = v(inputStores, clonedData, input.id as string, value);
    clonedData[input.id as string].value = value;
    clonedData[input.id as string].touched = true;
    clonedData[input.id as string].valid = input.validation?.async
      ? false
      : valid;
    clonedData[input.id as string].errorMessage = em;
    /* if it is valid then if async is true, we set validating to true otherwise false
     * valid === false mean no need to call async,
     * valid === true means we can call async if async is set to true by the user.
     *
     * validating prop is responsible to show async validation loading
     * */
    clonedData[input.id as string].validating = valid
      ? !!input.validation?.async
      : false;

    if (valid && input.validation?.async) {
      va(
        inputStores,
        clonedData,
        input.id as string,
        value,
        asyncDelay,
        asyncCallback
      );
    }

    ref.entry = clonedData;
    ref.isValid = vs(clonedData);
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

function useInputs(
  initialState: any,
  config: Config = { asyncDelay: 800 }
): any {
  if (Array.isArray(initialState)) {
    return inputs(
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
    return inputs({ [initialState]: {} }, "object", config, initialState);
  }
  return inputs(initialState, "object", config);
}

function trackInputs<const S extends string>(trackingID: S[]) {
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
