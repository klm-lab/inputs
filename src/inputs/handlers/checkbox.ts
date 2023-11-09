import type { RequiredObjInput } from "../../types";

export const createCheckboxValue = (clone: RequiredObjInput, ID: string) => {
  const selected = [] as string[];
  !clone[ID].checked && selected.push(clone[ID].value);
  for (const key in clone) {
    if (
      clone[key].type === "checkbox" &&
      key !== ID &&
      clone[key].name === clone[ID].name
    ) {
      clone[key].checked && selected.push(clone[key].value);
      clone[key].valid = true;
    }
  }
  return selected;
};
