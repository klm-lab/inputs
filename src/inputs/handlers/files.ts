import type {
  Helper,
  FileConfig,
  Input,
  InputStore,
  ParsedFile,
  Unknown
} from "../../types";
import { validate } from "../validations";
import { validateState } from "../../util";

export const createFiles = (
  element: HTMLInputElement & { ip: Input },
  store: InputStore,
  helper: Helper
) => {
  const id = element.ip.id;
  const files = element.files;
  const input = element.ip;
  const parsed: ParsedFile[] = input.mergeChanges ? [...input.files] : [];
  //  const dataTransfer = new DataTransfer();
  if (!input.mergeChanges) {
    input.files.forEach((p) => URL.revokeObjectURL(p.url));
  }
  if (files) {
    for (let i = 0; i < files.length; i++) {
      parsed.push(
        parseFile(
          id,
          store,
          URL.createObjectURL(files[i]),
          false,
          files[i],
          helper
        )
      );
      //  dataTransfer.items.add(files[i]);
    }
  }
  return parsed;
};

export const parseFile = (
  id: string,
  store: InputStore,
  url: string,
  gettingFile: boolean,
  file: File,
  helper: Helper
): ParsedFile => {
  const key = helper.key();
  return {
    gettingFile,
    file,
    key,
    url,
    fileUpdate: null,
    loaded: false,
    onLoad: () => {
      !store.get("config").persistID && URL.revokeObjectURL(url);
      store.set((ref) => {
        const index = ref.entry[id].files.findIndex((f) => f.key === key);
        ref.entry[id].files[index].loaded = true;
      });
    },
    selfUpdate: (data: Unknown) => {
      store.set((ref) => {
        const files = ref.entry[id].files;
        const index = files.findIndex((f) => f.key === key);
        files[index].fileUpdate = data;
        ref.entry[id].files = files;
      });
    },
    selfRemove: () => {
      store.set((ref) => {
        const entry = store.get("entry");
        const files = ref.entry[id].files;
        const newFiles = files.filter((f) => f.key !== key);
        // Validate input
        const { valid, em } = validate(helper, entry, id, newFiles);
        ref.entry[id].files = newFiles;
        ref.entry[id].valid = valid;
        ref.entry[id].errorMessage = em;
        // Validate form
        ref.isValid = validateState(ref.entry).isValid;
      });
    }
  };
};

const getFile = (url: string, blob: Blob) => {
  const fileName = url.match(/([a-z0-9_-]+\.\w+)(?!.*\/)/gi);
  return new File([blob], fileName ? fileName[0] : "", {
    type: blob.type
  });
};

export const blobStringJob = (
  value: Unknown,
  store: InputStore,
  id: string,
  fileConfig: FileConfig,
  index: number,
  valid: boolean,
  helper: Helper
) => {
  store.set((ref) => {
    ref.entry[id].files[index] = parseFile(
      id,
      store,
      value,
      !!fileConfig.getBlob, // true is getBlob is present
      {} as File,
      helper
    );
    ref.entry[id].valid = valid;
  });
  if (fileConfig.getBlob) {
    Promise.resolve(fileConfig.getBlob(value)).then((blob) => {
      store.set((ref) => {
        ref.entry[id].files[index].gettingFile = false;
        ref.entry[id].files[index].file = getFile(value, blob);
      });
    });
  }
};

export const retrieveBlob = (
  value: Unknown,
  store: InputStore,
  id: string,
  fileConfig: FileConfig,
  valid: boolean,
  helper: Helper
) => {
  if (value instanceof Array) {
    value.forEach((v, index) => {
      blobStringJob(v, store, id, fileConfig, index, valid, helper);
    });
    return;
  }
  if (typeof value === "string") {
    blobStringJob(value, store, id, fileConfig, 0, valid, helper);
    return;
  }
  throw Error(
    "Format must be a string or an array of string for this file " +
      JSON.stringify(value)
  );
};
