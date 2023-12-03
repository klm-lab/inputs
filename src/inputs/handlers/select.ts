import type { Input, Unknown } from "../../types";

export const createSelectFiles = (
  element: HTMLSelectElement & { ip: Input }
) => {
  const input = element.ip;
  let selected: string[] = [];
  if ((element as Unknown).isEvent) {
    const els = element.selectedOptions;
    for (let i = 0; i < els.length; i++) {
      els[i].value !== "" &&
        els[i].value !== input.placeholder &&
        selected.push(els[i].value);
    }
  } else {
    // Not need to clone, we keep the same reference safely
    selected = input.value;
    if (selected.includes(element.value)) {
      selected = selected.filter((v) => v !== element.value);
    } else {
      element.value !== "" &&
        element.value !== input.placeholder &&
        selected.push(element.value);
    }
  }
  return selected;
};
