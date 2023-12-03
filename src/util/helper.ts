import type { ComputeOnceOut, Helper } from "../types";

let key = -1;
const He = (): Helper => {
  // error message
  const em = {};
  // async delay
  const a = {};

  return {
    em,
    a,
    key: () => {
      key++;
      return `*_*_${key}`;
    }
  };
};

const persist = {} as { [k in string]: ComputeOnceOut };

const O = Object;

export { persist, He, O };
