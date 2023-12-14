import {
  Computed,
  ForEachCallback,
  InputConfig,
  MapCallback,
  Unknown
} from "../types";
import {
  finalizeInputs,
  getInput,
  touchInput,
  transformToArray
} from "../util";
import { persist } from "../util/helper";
import { extractValues } from "./handlers/values";

export const compute = (initialState: Unknown, config: InputConfig) => {
  if (config.persistID && persist[config.persistID]) {
    return persist[config.persistID];
  }
  const { st, inf } = finalizeInputs(initialState, config);

  const onSubmit = (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
    touchInput(st);
  };

  const loop = (callback: ForEachCallback | MapCallback) => {
    const entry = st.get("i");
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

  // const toArray = (): Input[] & IsValid => {
  //   const r = loop((i) => i) as Input[] & IsValid;
  //   r.isValid = store.get("iv");
  //   return r;
  // };
  // const toObject = (): ObjectInputs<string> & IsValid => {
  //   const r = store.get("i") as ObjectInputs<string> & IsValid;
  //   r.isValid = store.get("iv");
  //   return r;
  // };
  const reset = () => {
    st.set((ref) => {
      for (const key in ref.i) {
        ref.i[key] = {
          ...inf[key],
          data: ref.i[key].data
        };
      }
      ref.iv = st.get("inv");
    });
  };

  const result: Computed = {
    cp: {
      reset,
      getValues: () => extractValues(st.get("i")),
      // toArray,
      // toObject,
      forEach: loop,
      map: loop,
      onSubmit,
      showError: () => touchInput(st),
      get: (name: string) => getInput(st, name).r
    },
    a: initialState instanceof Array,
    st: st,
    uv: () => extractValues(st("i")),
    iv: () => st.get("iv")
  };

  if (config.persistID) {
    persist[config.persistID] = result;
  }
  return result;
};
