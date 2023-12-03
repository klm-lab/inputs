import type { ObjectInputs } from "../../types";

export const createCheckboxValue = (
  entry: ObjectInputs<string>,
  ID: string,
  userChange = true
) => {
  const selected = [] as string[];
  userChange && !entry[ID].checked && selected.push(entry[ID].value);
  for (const key in entry) {
    if (
      entry[key].type === "checkbox" &&
      (userChange ? key !== ID : true) &&
      entry[key].name === entry[ID].name
    ) {
      entry[key].checked && selected.push(entry[key].value);
      if (userChange) {
        entry[key].valid = true;
      }
    }
  }
  return selected;
};
