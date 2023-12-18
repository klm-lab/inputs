import type { Input, InputStore, IPS, ParsedFile, Unknown } from "../../types";
import { validate, validateState } from "../validations";
import { C, newKey, R } from "../../util/helper";

export const createFiles = (
  value: Unknown,
  store: InputStore,
  objKey: string,
  { files, merge }: Input
) => {
  const parsed: ParsedFile[] = merge ? [...files] : [];
  if (!merge) {
    // revoke preview file url
    files.forEach((p) => R(p.url));
  }
  value.forEach((f: File) => {
    // parse and add new file
    parsed.push(parseFile(objKey, store, C(f), false, f));
  });
  return parsed;
};

export const parseFile = (
  objKey: string,
  store: InputStore,
  url: string,
  fetching: boolean,
  file: File
) => {
  const key = newKey();
  const filterOrFindIndex = (
    ref: IPS,
    cb: Unknown,
    ac: string = "findIndex"
  ) => {
    const f = ref.i[objKey].files;
    // return result in r and files in f
    return { f, r: (f as Unknown)[ac](cb) };
  };
  return {
    fetching,
    file,
    key,
    url,
    onLoad: () => {
      !store.get(`c.pid`) && R(url);
      store.set((ref) => {
        // const index = ref.i[objKey].files.findIndex((f) => f.key === key);
        ref.i[objKey].files[
          filterOrFindIndex(ref, (f: ParsedFile) => f.key === key).r
        ].loaded = true;
      });
    },
    selfUpdate: (data: Unknown) => {
      store.set((ref) => {
        const { f, r } = filterOrFindIndex(
          ref,
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
        const files = filterOrFindIndex(
          ref,
          (f: ParsedFile) => f.key !== key,
          "filter"
        ).r;
        // Validate input
        const em = validate(store, entry, objKey, files);
        input.files = files;
        input.valid = !em;
        input.errorMessage = em;
        // Validate form
        ref.iv = validateState(ref.i);
      });
    }
  } as ParsedFile;
};
