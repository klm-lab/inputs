import type { RequiredObjInput } from "../../types";

export const createSelectFiles = (
  isEvent: boolean,
  element: HTMLSelectElement,
  clone: RequiredObjInput,
  ID: string
) => {
  let selected = [] as string[];
  if (isEvent) {
    const els = element.selectedOptions;
    for (let i = 0; i < els.length; i++) {
      selected.push(els[i].value);
    }
  } else {
    // Not need to clone, we keep the same reference safely
    selected = clone[ID].value;
    if (selected.includes(element.value)) {
      selected = selected.filter((v: any) => v !== element.value);
    } else {
      selected.push(element.value);
    }
  }
  return selected;
};
