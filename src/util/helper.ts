import type { ComputeOnceOut, Helper, CreateObjectInputs } from "../types";

const He = (): Helper => {
  // omitted keys
  const ok = {};
  //state
  const s = {};
  // error message
  const em = {};
  // tracking matching
  const tm = {};
  // async delay
  const a = {};

  const clean = (s: CreateObjectInputs<string>) => {
    for (const sKey in s) {
      delete s[sKey].validation?.copy;
      delete s[sKey].validation?.match;
    }
    return s;
  };
  return { ok, s, em, tm, a, clean };
};

const persist = {} as { [k in string]: ComputeOnceOut };
const getKey = () => {
  let i = -1;
  return {
    get new() {
      i++;
      return `*_*_${i}`;
    }
  };
};
const KEY = getKey();

export { persist, He, KEY };
