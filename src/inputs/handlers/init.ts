import type {
  FileConfig,
  Helper,
  Input,
  InputStore,
  Unknown
} from "../../types";
import { validate } from "../validations";
import { retrieveBlob } from "./files";

export const initValue = (
  input: Input,
  value: Unknown,
  store: InputStore,
  fileConfig: FileConfig,
  helper: Helper
) => {
  // Clone inputs
  const entry = store.get("entry");
  const id = input.id;

  const { valid } = validate(helper, entry, id, value);

  if (input.type === "file") {
    retrieveBlob(value, store, id, fileConfig, valid, helper);
    return;
  }
  if (input.type === "radio") {
    // Check right radio input
    entry[id].checked = entry[id].value === value;
    entry[id].props.checked = entry[id].value === value;
  } else if (input.type === "checkbox") {
    // Toggle the checkbox input
    const cbV = (value as Unknown[]).includes(entry[id].value);
    entry[id].checked = cbV;
    entry[id].props.checked = cbV;
  } else {
    // Parse value if number
    entry[id].value = value;
    entry[id].props.value = value;
  }
  // Sync handlers
  store.set((ref) => {
    ref.entry[id] = entry[id];
    ref.entry[id].valid = valid;
  });
};
