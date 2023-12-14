import { Computed, HelperType, Unknown } from "../types";

let key = -1;
export const Helper = (): HelperType => {
  // async delay
  const a = {};
  // errorMessage, validation and name count
  const ev = {};

  return {
    a,
    ev,
    key: () => {
      key++;
      return `*_*_${key}`;
    }
  };
};

export const persist = {} as { [k in string]: Computed };

export const keys = Object.keys;
export const matchType = (v: Unknown, type: string) => typeof v === type;
