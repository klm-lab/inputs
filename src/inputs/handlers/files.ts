import type { Input, InputStore, IPS, ParsedFile, Unknown } from "../../types";
import { validate, validateState } from "../validations";

export const createFiles = (
  value: Unknown,
  store: InputStore,
  objKey: string,
  input: Input
) => {
  const parsed: ParsedFile[] = input.merge ? [...input.files] : [];
  if (!input.merge) {
    input.files.forEach((p) => URL.revokeObjectURL(p.url));
  }
  value.forEach((f: Unknown) => {
    parsed.push(parseFile(objKey, store, URL.createObjectURL(f), false, f));
  });
  return parsed;
};

// return result in r and files in f
const filterOrFindIndex = (
  ref: IPS,
  objKey: string,
  cb: Unknown,
  ac: string = "findIndex"
) => {
  const f = ref.i[objKey].files;
  const r = (f as Unknown)[ac](cb);
  return { f, r };
};

export const parseFile = (
  objKey: string,
  store: InputStore,
  url: string,
  fetching: boolean,
  file: File
): ParsedFile => {
  const key = store.h.key();
  return {
    fetching,
    file,
    key,
    url,
    update: null,
    loaded: false,
    onLoad: () => {
      !store.get("c").persistID && URL.revokeObjectURL(url);
      store.set((ref) => {
        // const index = ref.i[objKey].files.findIndex((f) => f.key === key);
        const { r } = filterOrFindIndex(
          ref,
          objKey,
          (f: ParsedFile) => f.key === key
        );
        ref.i[objKey].files[r].loaded = true;
      });
    },
    selfUpdate: (data: Unknown) => {
      store.set((ref) => {
        const { f, r } = filterOrFindIndex(
          ref,
          objKey,
          (f: ParsedFile) => f.key === key
        );
        // const files = ref.i[objKey].files;
        // const index = files.findIndex((f) => f.key === key);
        f[r].update = data;
        ref.i[objKey].files = f;
      });
    },
    selfRemove: () => {
      store.set((ref) => {
        const entry = store.get("i");
        const input = ref.i[objKey];
        // const files = ref.i[objKey].files;
        // const newFiles = files.filter((f) => f.key !== key);
        const { r } = filterOrFindIndex(
          ref,
          objKey,
          (f: ParsedFile) => f.key !== key,
          "filter"
        );
        // Validate input
        const { v, em } = validate(store, entry, objKey, r);
        input.files = r;
        input.valid = v;
        input.errorMessage = em;
        // Validate form
        ref.iv = validateState(ref.i).iv;
      });
    }
  };
};

export const retrieveFile = (
  value: Unknown,
  store: InputStore,
  id: string,
  index: number
) => {
  const fileConfig = store.fc;
  store.set((ref) => {
    ref.i[id].files[index] = parseFile(
      id,
      store,
      value,
      !!fileConfig.getBlob, // true is getBlob is present
      {} as File
    );
    ref.i[id].valid = true;
  });
  if (fileConfig.getBlob) {
    Promise.resolve(fileConfig.getBlob(value)).then((r) => {
      store.set((ref) => {
        const f = ref.i[id].files[index];
        f.fetching = false;
        f.file = r as File;
      });
    });
  }
};

export const cleanFiles = (files: ParsedFile[]) => {
  // Set type to any to break the contract type
  return files.map((f: any) => {
    [
      "selfRemove",
      "selfUpdate",
      "key",
      "fetching",
      "loaded",
      "url",
      "onLoad"
    ].forEach((k) => {
      delete f[k];
    });
    return f;
  });
};
