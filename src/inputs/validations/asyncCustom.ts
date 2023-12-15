import {
  AsyncValidateInput,
  AsyncValidationParams,
  CustomAsyncValidationType
} from "../../types";
import { syncChanges } from "../handlers/changes";

const asyncCallback = ({ em, ok, st, f }: AsyncValidationParams) => {
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
  entry[ok].valid = input.errorMessage ? false : !em;
  // Add server error message only actual data is valid else keep actual error Message
  entry[ok].errorMessage = input.errorMessage ?? em;

  // Sync handlers
  syncChanges(st, entry);
};

export const asyncCustom = (
  callback: CustomAsyncValidationType
): AsyncValidateInput => {
  return ({ va, ip, ok, st }) => {
    const timeoutKeys = st.a;
    clearTimeout(timeoutKeys[ip.key]);
    timeoutKeys[ip.key] = setTimeout(
      () => {
        // Save the time
        const ST = timeoutKeys[ip.key];
        Promise.resolve(callback(va))
          .then((em) => {
            /* we check if time match the request id time
             * If not, that means, another request has been sent.
             * So we wait for that response
             * */
            if (ST === timeoutKeys[ip.key]) {
              asyncCallback({ em, ok, st });
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
