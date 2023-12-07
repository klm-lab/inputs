import type { ObjectInputs } from "../../types";

export const createCheckboxValue = (
  entry: ObjectInputs<string>,
  ID: string,
  userChange = true
) => {
  const selected = [] as string[];
  for (const key in entry) {
    if (entry[key].type === "checkbox" && entry[key].name === entry[ID].name) {
      entry[key].checked && selected.push(entry[key].value);
      if (userChange) {
        entry[key].valid = true;
      }
    }
  }
  return selected;
};
