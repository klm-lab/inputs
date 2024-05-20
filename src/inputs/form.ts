import {
  Computed,
  EachCallback,
  type Input,
  InputConfig,
  Unknown
} from "../types";
import { finalizeInputs, touchInput, transformToArray } from "../util";
import { newSet, persist } from "../util/helper";
import { extractValues } from "./handlers/values";

export const createForm = (initialState: Unknown, config: InputConfig) => {
  // pid => persistID to persist data on component unmount
  const pid = config.pid;
  if (pid && persist[pid]) {
    return persist[pid];
  }
  // st => store
  // ip => initial Inputs
  const { st, ip } = finalizeInputs(initialState, config);

  const onSubmit = (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
    touchInput(st);
  };

  const each = (callback: EachCallback) => {
    const entry = st.get("i");
    const v = {
      // index
      i: 0,
      // Inputs array
      a: transformToArray(entry),
      // each result
      l: [] as Unknown[]
    };
    for (const key in entry) {
      v.l.push(callback(entry[key], v.i, v.a));
      v.i++;
    }
    return v.l;
  };

  const reset = () => {
    // clear possibly checkbox value
    // st.n => contains all inputs names
    // st.i => contains all initial selected value
    // st.ev => contains all inputs extra data and validation like total of inputs, selected inputs etc...
    st.n.forEach((n: string) => (st.ev[n].s = newSet(st.ev[n].i)));
    // reset with initial value
    st.set((ref) => {
      // ref.i => is the inputs
      ref.i = ip;
      // ref.iv => is initial valid state
      ref.iv = st.get("inv");
      // ref.t => inputs is touched
      ref.t = false;
      // Reset erroneous key
      ref.e = ''
    });
  };

  const result: Computed = {
    f: {
      reset,
      getValues: () => extractValues(st.get("i")),
      each,
      onSubmit,
      showError: () => touchInput(st),
      getErroneousInput: () => st.get(`i.${st.get("e")}`),
      get: (name: string) => {
        const r: Input[] = [];
        st.ev[name].o.forEach((k) => {
          r.push(st.get(`i.${k}`));
        });
        return r;
      }
    },
    a: initialState instanceof Array,
    st,
    // useValues
    uv: () => extractValues(st("i")),
    // isValid
    iv: () => st.get("iv")
  };

  if (pid) {
    persist[pid] = result;
  }
  return result;
};
