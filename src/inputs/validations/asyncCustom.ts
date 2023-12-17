import {
  AsyncValidateInput,
  CustomAsyncValidationType,
  Unknown
} from "../../types";
import { syncChanges } from "../handlers/changes";

export const asyncCustom = (
  callback: CustomAsyncValidationType
): AsyncValidateInput => {
  return ({ i, va, ip, ok, st }) => {
    const timeoutKeys = st.a;
    // clear previous task
    clearTimeout(timeoutKeys[ip.key]);
    // new task with the input key
    timeoutKeys[ip.key] = setTimeout(
      () => {
        // Save the time because, changes can happen before response
        const ST = timeoutKeys[ip.key];
        const onError = () => {
          i[ok].validating = false;
          i[ok].validationFailed = true;
          syncChanges(st, i);
        };

        const onSuccess = (errorMessage: Unknown) => {
          /* we check if time match the request id time
           * If not, that means, another request has been sent.
           * So we wait for that response
           * */
          if (ST === timeoutKeys[ip.key]) {
            // sync with latest inputs state
            i = st.get(`i`);
            // Get latest input errorMessage
            const em = i[ok].errorMessage;
            // Add server validation because it is always false before calling server
            i[ok].valid = !errorMessage;
            // Add server error message only if actual data is valid else keep actual error Message
            // '' ?? 'not empty' is a js bug and will return '', so we go the other way
            //i[ok].errorMessage = em ?? errorMessage;
            i[ok].errorMessage = !em ? errorMessage : em;
            i[ok].validating = false;
            syncChanges(st, i);
          }
        };
        callback(va, onSuccess, onError);
      },
      st.get("c.asyncDelay") ?? 800
    );
  };
};
