import type {
  Config,
  Helper,
  InputStore,
  ParsedFile,
  RequiredInput,
  RequiredObjInput
} from "../../types";
import { AsyncValidationParams } from "../../types";
import { asyncValidation, validate } from "../../util/validation";
import { validateState } from "../../util";
import { createFiles } from "./files";
import { createSelectFiles } from "./select";
import { createCheckboxValue } from "./checkbox";

const asyncCallback = ({
  valid: asyncValid,
  em: asyncErrorMessage,
  entry,
  store,
  failed,
  helper
}: AsyncValidationParams) => {
  // Clone inputs
  const clone = store.get("entry");
  const ID = entry.id;

  if (failed) {
    clone[ID].validating = false;
    clone[ID].asyncValidationFailed = true;
    syncChanges(store, clone);
    return;
  }

  // Revalidate input, maybe a change occurs before server response
  const { valid, em } = validate(helper, clone, ID, clone[ID].value);
  // Add server validation only actual data is valid
  clone[ID].valid = valid && asyncValid;
  // Add server error message only actual data is valid else keep actual error Message
  clone[ID].errorMessage = valid ? asyncErrorMessage : em;
  // Finish calling server
  clone[ID].validating = false;
  // Sync handlers
  syncChanges(store, clone);
};

const onChange = (
  input: RequiredInput,
  element: HTMLInputElement | HTMLSelectElement,
  store: InputStore,
  config: Config,
  isEvent: boolean,
  helper: Helper
) => {
  // Clone inputs
  const clone = store.get("entry");
  const ID = input.id;
  // Get the value based on type
  const value =
    input.type === "file"
      ? createFiles(
          (element as HTMLInputElement).files,
          clone,
          ID,
          store,
          config,
          helper
        )
      : input.type === "select" && input.multiple
      ? createSelectFiles(isEvent, element as HTMLSelectElement, clone, ID)
      : element.value;

  const toValidate =
    input.type === "checkbox" ? createCheckboxValue(clone, ID) : value;

  // Validate inputs
  const { valid, em } = validate(helper, clone, ID, toValidate);
  // Handle type file
  if (input.type === "file") {
    clone[ID].files = value as ParsedFile[];
  } else if (input.type === "radio") {
    // Check right radio input
    for (const key in clone) {
      if (clone[key].type === "radio" && clone[key].name === clone[ID].name) {
        clone[key].checked = clone[key].value === value;
        clone[key].valid = true;
      }
    }
  } else if (input.type === "checkbox") {
    // Toggle the checkbox input
    clone[ID].checked = !clone[ID].checked;
  } else {
    // Parse value if valid and if number
    clone[ID].value = value;
  }
  // Touched input
  clone[ID].touched = true;
  // Set valid to false if async is present else keep validation result
  clone[ID].valid = (input.validation?.asyncCustom as unknown) ? false : valid;
  // Set errorMessage only if invalid if not keep the default errorMessage structure, Object or undefined
  clone[ID].errorMessage = !valid ? em : em instanceof Object ? {} : undefined;
  /* if it is valid then if async is true, we set validating to true otherwise false
   * valid === false mean no need to call async,
   * valid === true means we can call async if async is set to true by the user.
   *
   * validating prop is responsible to show async validation loading
   * */
  // If all change are valid and async is there, we set valid to false else true
  clone[ID].validating = valid ? !!input.validation?.asyncCustom : false;
  // asyncValidationFailed by default because call asyncCustom
  clone[ID].asyncValidationFailed = false;

  // if valid and async is there, we call async validation
  valid &&
    (input.validation?.asyncCustom as unknown) &&
    asyncValidation(store, helper, clone, ID, value, asyncCallback);
  // we sync handlers
  syncChanges(store, clone);
};

const syncChanges = (store: InputStore, data: RequiredObjInput) => {
  store.set((ref) => {
    ref.entry = data;
    ref.isValid = validateState(data);
  });
};

export const inputChange = (
  value: any,
  key: string,
  entry: RequiredObjInput,
  store: InputStore,
  config: Config,
  helper: Helper
) => {
  const isEvent =
    ["SyntheticBaseEvent", "SyntheticEvent"].includes(value.constructor.name) ||
    (!!value?.nativeEvent &&
      value.nativeEvent.constructor.name === "InputEvent");

  const element = {} as any;
  if (!isEvent) {
    if (entry[key].type === "file") {
      element.files = value;
    } else {
      element.value = value;
    }
  } else {
    element.value = value.target.value || value.nativeEvent.text || "";
    element.files = value.target.files || [];
    element.selectedOptions = value.target.selectedOptions || [];
  }
  onChange(entry[key], element, store, config, isEvent, helper);
};
