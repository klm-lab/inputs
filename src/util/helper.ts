import { Computed, Unknown } from "../types";

let key = -1;
export const newKey = (): string => {
  key++;
  return `*_*_${key}`;
};
export const newSet = (p?: Unknown): Set<Unknown> => new Set(p);

export const persist = {} as { [k in string]: Computed };

export const keys = Object.keys;
export const CHECKBOX = "checkbox";
export const RADIO = "radio";
export const STRING = "string";
export const SELECT = "select";
export const FILE = "file";
export const { revokeObjectURL: R, createObjectURL: C } = URL;
export const matchType = (v: Unknown, type: string) => typeof v === type;
