import type {
  Helper,
  InitFileConfig,
  InputConfig,
  InputStore,
  ObjectInputs,
  ParsedFile
} from "../../types";
import { validate } from "../../util/validation";
import { validateState } from "../../util";
import { KEY } from "../../util/helper";

export const createFiles = (
  files: FileList | null,
  clone: ObjectInputs<string>,
  ID: string,
  store: InputStore,
  config: InputConfig,
  helper: Helper
) => {
  const entry = clone[ID];
  const parsed: ParsedFile[] = entry.mergeChanges ? [...entry.files] : [];
  //  const dataTransfer = new DataTransfer();
  if (!entry.mergeChanges) {
    entry.files.forEach((p) => URL.revokeObjectURL(p.url));
  }
  if (files) {
    for (let i = 0; i < files.length; i++) {
      parsed.push(
        parseFile(
          clone,
          ID,
          store,
          config,
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
  clone: ObjectInputs<string>,
  ID: string,
  store: InputStore,
  config: InputConfig,
  url: string,
  gettingFile: boolean,
  file: File,
  helper: Helper
): ParsedFile => {
  const key = KEY.new;
  return {
    gettingFile,
    file,
    key,
    url,
    fileUpdate: null,
    onLoad: () => {
      !config.persistID && URL.revokeObjectURL(url);
    },
    selfUpdate: (data: any) => {
      store.set((ref) => {
        const files = ref.entry[ID].files;
        const index = files.findIndex((f) => f.key === key);
        files[index].fileUpdate = data;
        ref.entry[ID].files = files;
      });
    },
    selfRemove: () => {
      store.set((ref) => {
        const files = ref.entry[ID].files;
        const newFiles = files.filter((f) => f.key !== key);
        // Validate input
        const { valid, em } = validate(helper, clone, ID, newFiles);
        ref.entry[ID].files = newFiles;
        ref.entry[ID].valid = valid;
        ref.entry[ID].errorMessage = em;
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
  value: any,
  store: InputStore,
  clone: ObjectInputs<string>,
  ID: string,
  config: InputConfig,
  fileConfig: InitFileConfig,
  index: number,
  valid: boolean,
  helper: Helper
) => {
  store.set((ref) => {
    ref.entry[ID].files[index] = parseFile(
      clone,
      ID,
      store,
      config,
      value,
      !!fileConfig.getBlob, // true is getBlob is present
      {} as File,
      helper
    );
    ref.entry[ID].valid = valid;
  });
  if (fileConfig.getBlob) {
    Promise.resolve(fileConfig.getBlob(value)).then((blob) => {
      store.set((ref) => {
        ref.entry[ID].files[index].gettingFile = false;
        ref.entry[ID].files[index].file = getFile(value, blob);
      });
    });
  }
};

export const retrieveBlob = (
  value: any,
  store: InputStore,
  clone: ObjectInputs<string>,
  ID: string,
  config: InputConfig,
  fileConfig: InitFileConfig,
  valid: boolean,
  helper: Helper
) => {
  if (value instanceof Array) {
    value.forEach((v, index) => {
      blobStringJob(
        v,
        store,
        clone,
        ID,
        config,
        fileConfig,
        index,
        valid,
        helper
      );
    });
    return;
  }
  if (typeof value === "string") {
    blobStringJob(
      value,
      store,
      clone,
      ID,
      config,
      fileConfig,
      0,
      valid,
      helper
    );
    return;
  }
  throw Error(
    "Format must be a string or an array of string for this file " +
      JSON.stringify(value)
  );
};
