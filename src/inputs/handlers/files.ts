import type { Input, InputStore, IPS, ParsedFile, Unknown } from "../../types";
import { validate, validateState } from "../validations";
import { C, newKey, R } from "../../util/helper";

export const createFiles = (
  value: Unknown,
  store: InputStore,
  objKey: string,
  input: Input
) => {
  const parsed: ParsedFile[] = input.merge ? [...input.files] : [];
  if (!input.merge) {
    // revoke preview file url
    input.files.forEach((p) => R(p.url));
  }
  value.forEach((f: Unknown) => {
    // parse and add new file
    parsed.push(parseFile(objKey, store, C(f), false, f));
  });
  return parsed;
};

// export const createFiles = (
//   value: Unknown,
//   store: InputStore,
//   objKey: string,
//   input: Input
// ) => {
//   const parsed: Unknown = input.merge ? { ...input.files } : {};
//   if (!input.merge) {
//     // revoke preview file url
//     keys(input.files).forEach(R);
//   }
//   value.forEach((f: Unknown) => {
//     // parse and add new file
//     const url = C(f);
//     parsed[url] = parseFile(objKey, store, url, false, f);
//   });
//   return parsed;
// };

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
) => {
  const key = newKey();
  return {
    fetching,
    file,
    key,
    url,
    // update: null,
    // loaded: false,
    onLoad: () => {
      !store.get("c").pid && R(url);
      store.set((ref) => {
        // const index = ref.i[objKey].files.findIndex((f) => f.key === key);
        const index = filterOrFindIndex(
          ref,
          objKey,
          (f: ParsedFile) => f.key === key
        ).r;
        ref.i[objKey].files[index].loaded = true;
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
        const em = validate(store, entry, objKey, r);
        input.files = r;
        input.valid = !em;
        input.errorMessage = em;
        // Validate form
        ref.iv = validateState(ref.i);
      });
    }
  } as ParsedFile;
};
// Remove useless tools for db
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
