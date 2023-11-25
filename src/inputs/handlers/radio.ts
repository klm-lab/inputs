import type { ObjectInputs } from "../../types";

export const radioIsChecked = (clone: ObjectInputs<string>, ID: string) => {
  let isSelected = false;
  for (const key in clone) {
    if (
      !isSelected &&
      clone[key].name === clone[ID].name &&
      clone[key].checked
    ) {
      isSelected = clone[key].checked;
    }
  }
  return isSelected;
};
