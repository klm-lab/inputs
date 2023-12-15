import { Input, InputStore, ObjectInputs, Unknown } from "../../types";

export const setCRValues = (
  store: InputStore,
  entry: ObjectInputs<string>,
  name: string,
  fn?: (I: Input) => Unknown
) => {
  store.ev[name].o.forEach((c: string) => {
    const inp = entry[c];
    fn && fn(inp);
    inp.valid = true;
    inp.errorMessage = null;
  });
};
