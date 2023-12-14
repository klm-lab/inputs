import type { ObjectInputs } from "../../types";

export const createCheckboxValue = (
  entry: ObjectInputs<string>,
  ID: string,
  userChange = true
) => {
  const selected = [] as string[];
  for (const key in entry) {
    const input = entry[key];
    if (input.type === "checkbox" && input.name === entry[ID].name) {
      input.checked && selected.push(entry[key].value);
      if (userChange) {
        input.valid = true;
        input.errorMessage = undefined;
      }
    }
  }
  return selected;
};
