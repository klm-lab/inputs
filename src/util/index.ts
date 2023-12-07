import type {
  FileConfig,
  Helper,
  Input,
  InputConfig,
  InputProps,
  InputStore,
  InternalInput,
  ObjectInputs,
  ParsedFile,
  StateType,
  Unknown
} from "../types";
import { validate, validateState } from "../inputs/validations";
import { createCheckboxValue } from "../inputs/handlers/checkbox";
import { radioIsChecked } from "../inputs/handlers/radio";
import { He, O } from "./helper";
import { inputChange } from "../inputs/handlers/changes";
import { createStore } from "aio-store/react";
import { initValue } from "../inputs/handlers/init";

const parseValue = (input: Input, value: Unknown) =>
  input.type === "number" || (input.validation?.number as unknown)
    ? !isNaN(Number(value))
      ? Number(value)
      : value
    : value;

// Spread common props
const commonProps = (entry: InternalInput, id: string) => {
  const defaultID = entry.id ?? id;
  return {
    id,
    name: defaultID,
    label: entry.name ?? defaultID,
    type: entry.type ?? "text",
    value:
      entry.type === "select" && entry.multiple
        ? []
        : ["radio", "checkbox"].includes(entry.type as string)
        ? entry.label ?? defaultID
        : "",
    files: [],
    checked: false,
    multiple: false,
    valid: entry.checked ? true : !O.keys(entry.validation ?? {}).length,
    touched: false,
    placeholder: entry.name ?? defaultID,
    errorMessage: undefined,
    validating: false,
    extraData: null
  };
};

export const finalizeInputs = (
  initialState: Unknown,
  type: StateType,
  config: InputConfig
) => {
  const entry = {} as ObjectInputs<string>;
  const store = createStore({}) as unknown as InputStore;
  let isValid = true;
  const helper = He();
  for (const stateKey in initialState) {
    const id = type === "object" ? stateKey : initialState[stateKey].id;
    const key = helper.key();
    entry[id] = {
      ...commonProps(initialState[stateKey], stateKey),
      ...initialState[stateKey],
      ...(type === "object" ? { id, key } : { key })
    };
    entry[id].props = {
      id: id,
      name: entry[id].name,
      type: entry[id].type,
      value: entry[id].value,
      checked: entry[id].checked,
      multiple: entry[id].multiple,
      placeholder: entry[id].placeholder
    } as InputProps;

    // we save the error message
    helper.em[id] = entry[id].errorMessage;

    // Validating form to get initial valid state
    isValid = isValid && !entry[id].validating && entry[id].valid;

    // onChange
    entry[id].onChange = (value: Unknown) =>
      inputChange(value, entry[id], store, helper);
    // Props onChange
    entry[id].props.onChange = (value: Unknown) =>
      inputChange(value, entry[id], store, helper);
    // set
    entry[id].set = (
      prop: keyof Input,
      value: Unknown,
      fileConfig: FileConfig = {}
    ) => {
      store.set((ref) => {
        if (prop === "value") {
          initValue(entry[id], value, store, fileConfig, helper);
        }
        if (prop === "type") {
          ref.entry[id].type = value;
          ref.entry[id].props.type = value;
        }
        if (prop === "extraData") {
          ref.entry[id][prop] = value;
        }
      });
    };
    // files
    entry[id].files = [];
  }

  syncRCAndValid(entry, helper);
  store.set((ref) => {
    ref.entry = entry;
    ref.initialValid = isValid;
    ref.isValid = isValid;
    ref.config = config;
  });
  return { helper, store, initialForm: entry };
};

// Sync checkbox and radio input and validate the form to get initial valid state
const syncRCAndValid = (entry: ObjectInputs<string>, helper: Helper) => {
  const patch = {
    checkbox: {
      tab: []
    },
    radio: {
      tab: []
    }
  } as Unknown;

  for (const stateKey in entry) {
    const i = entry[stateKey];
    if (i.type === "checkbox" || i.type === "radio") {
      patch[i.type].tab.push(stateKey);
      if (!i.valid && !patch[i.type].fv) {
        patch[i.type][i.name as string] = {
          validation: i.validation,
          errorMessage: i.errorMessage
        };
        // Found validation
        patch[i.type].fv = true;
      }
    }
  }

  O.keys(patch).forEach((o) => {
    if (patch[o].fv) {
      patch[o].tab.forEach((id: string) => {
        // we get the name
        const name = entry[id].name as string;
        // define errorMessage
        const errorMessage =
          entry[id].errorMessage ?? patch[o][name].errorMessage;
        // we save the error message
        helper.em[id] = errorMessage;
        // define validation
        entry[id].validation = !entry[id].valid
          ? entry[id].validation
          : patch[o][name].validation;
        // set errorMessage
        entry[id].errorMessage = errorMessage;
        // set valid
        entry[id].valid = patch[o][name].validation ? false : entry[id].valid;
      });
    }
  });
};

const touchInput = (store: InputStore, helper: Helper) => {
  const data = store.get("entry");
  const { isValid, invalidKey } = validateState(data);
  if (invalidKey) {
    const input = data[invalidKey];
    const value =
      input.type === "file"
        ? input.files
        : input.type === "checkbox"
        ? createCheckboxValue(data, invalidKey, false)
        : input.value;

    const radioValid = radioIsChecked(data, invalidKey);

    const { em } = validate(
      helper,
      data,
      invalidKey,
      input.type === "radio" ? (radioValid ? value : null) : value
    );

    store.set((ref) => {
      ref.entry[invalidKey].touched = true;
      ref.entry[invalidKey].valid = false;
      ref.entry[invalidKey].errorMessage = em;
    });
  }
  return isValid;
};

// T transform array to object and vice versa
const transformToArray = (state: ObjectInputs<string>) => {
  const result: Input[] = [];
  for (const key in state) {
    result.push(state[key]);
  }
  return result;
};

const cleanFiles = (files: ParsedFile[]) => {
  // Set type to any to break the contract type
  return files.map((f: any) => {
    delete f.selfRemove;
    delete f.selfUpdate;
    delete f.key;
    return f;
  });
};

const extractValues = (state: ObjectInputs<string>) => {
  const result = {} as { [k in string]: Unknown };
  for (const key in state) {
    const K = state[key].name;
    if (state[key].type === "radio") {
      if (state[key].checked) {
        result[K] = state[key].value;
      } else if (!result[K]) {
        result[K] = "";
      }
    } else if (state[key].type === "checkbox") {
      if (!result[K]) {
        result[K] = [];
      }
      if (state[key].checked) {
        result[K].push(state[key].value);
      }
    } else {
      result[K] =
        state[key].type === "file"
          ? cleanFiles(state[key].files)
          : parseValue(state[key], state[key].value);
    }
  }
  return result;
};

export {
  commonProps,
  syncRCAndValid,
  transformToArray,
  extractValues,
  parseValue,
  touchInput
};
