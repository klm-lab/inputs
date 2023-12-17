import { Input, InputStore, ObjectInputs, Unknown } from "../../types";

export const setCRValues = (
  store: InputStore,
  entry: ObjectInputs<string>,
  name: string,
  fn?: (I: Input) => Unknown
) => {
  store.ev[name].o.forEach((c: string) => {
    fn && fn(entry[c]);
    entry[c].valid = true;
    entry[c].errorMessage = "";
  });
};
