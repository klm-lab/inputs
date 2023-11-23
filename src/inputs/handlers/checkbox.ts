import type { ObjectInput } from "../../types";

export const createCheckboxValue = (
  clone: ObjectInput,
  ID: string,
  userChange = true
) => {
  const selected = [] as string[];
  userChange && !clone[ID].checked && selected.push(clone[ID].value);
  for (const key in clone) {
    if (
      clone[key].type === "checkbox" &&
      (userChange ? key !== ID : true) &&
      clone[key].name === clone[ID].name
    ) {
      clone[key].checked && selected.push(clone[key].value);
      if (userChange) {
        clone[key].valid = true;
      }
    }
  }
  return selected;
};
