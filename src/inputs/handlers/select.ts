import type { Input, Unknown } from "../../types";
import { newSet } from "../../util/helper";

export const createSelectFiles = (
  value: Unknown,
  input: Input,
  isEvent: boolean
) => {
  const selected: Set<string> = newSet(isEvent ? "" : input.value);
  if (isEvent) {
    value.forEach((o: Unknown) => selected.add(o.value));
  } else {
    selected[selected.has(value) ? "delete" : "add"](value);
  }
  selected.delete("");
  selected.delete(input.placeholder);
  return [...selected];
};
