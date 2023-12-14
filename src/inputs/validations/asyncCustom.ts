import {
  AsyncValidateInput,
  AsyncValidationParams,
  CustomAsyncValidationType,
  Unknown
} from "../../types";
import { syncChanges } from "../handlers/changes";

const asyncCallback = ({ v, em, ok, st, f }: AsyncValidationParams) => {
  // Clone inputs
  const entry = st.get("i");
  const input = entry[ok];
  // Finish calling server
  entry[ok].validating = false;
  entry[ok].validationFailed = !!f;

  if (f) {
    syncChanges(st, entry);
    return;
  }

  // Add server validation only actual data is valid
  entry[ok].valid = input.errorMessage ? false : !!v;

  // Add server error message only actual data is valid else keep actual error Message
  entry[ok].errorMessage = input.errorMessage ?? em;

  // Sync handlers
  syncChanges(st, entry);
};

export const asyncCustom = (
  callback: CustomAsyncValidationType
): AsyncValidateInput => {
  return ({ va, ip, ok, st }) => {
    const helper = st.h;
    clearTimeout(helper.a[ip.key]);
    helper.a[ip.key] = setTimeout(
      () => {
        // Save the time
        const ST = helper.a[ip.key];
        let em = helper.ev[ip.name].e;
        Promise.resolve(callback(va, (m: Unknown) => (em = m)))
          .then((v) => {
            /* we check if time match the request id time
             * If not, that means, another request has been sent.
             * So we wait for that response
             * */
            if (ST === helper.a[ip.key]) {
              asyncCallback({ v, em, ok, st });
            }
          })
          .catch((error) => {
            console.error(error);
            asyncCallback({ f: true, ok, st });
          });
      },
      st.get("c.asyncDelay") ?? 800
    );
  };
};
