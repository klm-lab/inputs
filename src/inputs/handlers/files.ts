import type {
  Config,
  InitFileConfig,
  InputStore,
  ParsedFile,
  RequiredObjInput
} from "../../types";
import { validate } from "../../util/validation";
import { validateState } from "../../util";

export const createFiles = (
  files: FileList | null,
  clone: RequiredObjInput,
  ID: string,
  store: InputStore,
  config: Config
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
          files[i]
        )
      );
      //  dataTransfer.items.add(files[i]);
    }
  }
  return parsed;
};

export const parseFile = (
  clone: RequiredObjInput,
  ID: string,
  store: InputStore,
  config: Config,
  url: string,
  gettingFile: boolean,
  file: File
): ParsedFile => {
  const key = crypto.randomUUID();
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
        const { valid, em } = validate(
          store.get("helper"),
          clone,
          ID,
          newFiles
        );
        ref.entry[ID].files = newFiles;
        ref.entry[ID].valid = valid;
        ref.entry[ID].errorMessage = em;
        // Validate form
        ref.isValid = validateState(ref.entry);
      });
    }
  };
};

export const getFile = async (url: string, fileConfig: InitFileConfig) => {
  const URL = fileConfig.useDefaultProxyUrl
    ? "cors-anywhere.herokuapp.com/" + url
    : fileConfig.proxyUrl
    ? fileConfig.proxyUrl + "/" + url
    : url;
  const blob = await fetch(URL).then((r) => r.blob());
  const fileName = url.match(/([a-z0-9_-]+\.\w+)(?!.*\/)/gi);
  const name = fileName ? fileName[0] : "";
  return new File([blob], name, {
    type: blob.type
  });
};

export const blobStringJob = (
  value: any,
  store: InputStore,
  clone: RequiredObjInput,
  ID: string,
  config: Config,
  fileConfig: InitFileConfig,
  index: number
) => {
  store.set((ref) => {
    ref.entry[ID].files = [
      ...ref.entry[ID].files,
      parseFile(clone, ID, store, config, value, true, {} as File)
    ];
  });
  getFile(value, fileConfig).then((file) => {
    store.set((ref) => {
      ref.entry[ID].files[index].gettingFile = false;
      ref.entry[ID].files[index].file = file;
    });
  });
};

export const retrieveBlob = (
  value: any,
  store: InputStore,
  clone: RequiredObjInput,
  ID: string,
  config: Config,
  fileConfig: InitFileConfig
) => {
  switch (fileConfig.entryFormat) {
    case "url": {
      blobStringJob(value, store, clone, ID, config, fileConfig, 0);
      break;
    }
    case "url[]": {
      (value as string[]).forEach((v, index) => {
        blobStringJob(v, store, clone, ID, config, fileConfig, index);
      });
      break;
    }
    //todo add more case based on use cases
    default: {
      throw Error(
        "EntryFormat is missing or incorrect in InitFileConfig on file " +
          JSON.stringify(value),
        {
          cause: fileConfig
        }
      );
    }
  }
};
