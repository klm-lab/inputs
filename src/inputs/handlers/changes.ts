import type {
  Helper,
  Input,
  InputStore,
  ObjectInputs,
  ParsedFile,
  Unknown
} from "../../types";
import { AsyncValidationParams } from "../../types";
import { validate } from "../validations";
import { validateState } from "../../util";
import { createFiles } from "./files";
import { createSelectFiles } from "./select";
import { createCheckboxValue } from "./checkbox";

const asyncCallback = ({
  valid: asyncValid,
  em: asyncErrorMessage,
  input,
  store,
  failed,
  helper
}: AsyncValidationParams) => {
  // Clone inputs
  const entry = store.get("entry");
  const id = input.id;

  if (failed) {
    entry[id].validating = false;
    entry[id].asyncValidationFailed = true;
    syncChanges(store, entry);
    return;
  }

  // Revalidate input, maybe a change occurs before server response
  const { valid, em } = validate(helper, entry, id, entry[id].value);
  // Add server validation only actual data is valid
  entry[id].valid = valid && asyncValid;
  // Add server error message only actual data is valid else keep actual error Message
  entry[id].errorMessage = valid ? asyncErrorMessage : em;
  // Finish calling server
  entry[id].validating = false;
  // Sync handlers
  syncChanges(store, entry);
};

const onChange = (
  element: (HTMLInputElement | HTMLSelectElement) & { ip: Input },
  store: InputStore,
  helper: Helper
) => {
  // Clone inputs
  const entry = store.get("entry");
  const id = element.ip.id;
  const input = element.ip;
  // Get the value based on type
  const value =
    input.type === "file"
      ? createFiles(element as Unknown, store, helper)
      : input.type === "select"
      ? input.multiple
        ? createSelectFiles(element as Unknown)
        : element.value !== "" && element.value !== entry[id].placeholder
        ? element.value
        : ""
      : element.value;

  // Handle type file
  if (input.type === "file") {
    entry[id].files = value as ParsedFile[];
  } else if (input.type === "radio") {
    // Check right radio input
    for (const key in entry) {
      if (entry[key].type === "radio" && entry[key].name === entry[id].name) {
        entry[key].checked = entry[key].value === value;
        entry[key].props.checked = entry[key].value === value;
        entry[key].valid = true;
      }
    }
  } else if (input.type === "checkbox") {
    // Toggle the checkbox input
    entry[id].checked = !entry[id].checked;
    entry[id].props.checked = !entry[id].props.checked;
  } else {
    entry[id].value = value;
    entry[id].props.value = value;
  }

  const toValidate =
    input.type === "checkbox" ? createCheckboxValue(entry, id) : value;

  const { valid, em } = validate(helper, entry, id, toValidate);

  // Touched input
  entry[id].touched = true;
  // Set valid to false if async is present else keep validation result
  entry[id].valid = (input.validation?.asyncCustom as unknown) ? false : valid;
  // Set errorMessage only if invalid if not keep the default errorMessage structure, Object or undefined
  entry[id].errorMessage = !valid ? em : em instanceof Object ? {} : undefined;

  entry[id].validating = valid ? !!input.validation?.asyncCustom : false;
  // asyncValidationFailed by default because call asyncCustom
  entry[id].asyncValidationFailed = false;

  // if valid and async is there, we call async validation
  valid &&
    (input.validation?.asyncCustom as unknown) &&
    input.validation?.asyncCustom({
      store,
      helper,
      input,
      target: id,
      value,
      asyncCallback
    });
  // we sync handlers
  syncChanges(store, entry);
};

const syncChanges = (store: InputStore, data: ObjectInputs<string>) => {
  store.set((ref) => {
    ref.entry = data;
    ref.isValid = validateState(data).isValid;
  });
};

export const inputChange = (
  value: Unknown,
  input: Input,
  store: InputStore,
  helper: Helper
) => {
  const isEvent = typeof value.preventDefault === "function";
  const element = {} as Unknown;
  if (!isEvent) {
    if (input.type === "file") {
      element.files = value;
    } else {
      element.value = value;
    }
  } else {
    element.value = value.target.value || value.nativeEvent.text || "";
    element.files = value.target.files || [];
    element.selectedOptions = value.target.selectedOptions || [];
  }
  element.isEvent = isEvent;
  element.ip = input;
  onChange(element, store, helper);
};
