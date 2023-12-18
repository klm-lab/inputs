import {
  AsyncValidateInput,
  CustomAsyncValidationType,
  ObjectInputs,
  Unknown
} from "../../types";
import { syncChanges } from "../handlers/changes";

export const asyncCustom = (
  callback: CustomAsyncValidationType
): AsyncValidateInput => {
  return ({ va, ip, ok, st }) => {
    let latestInputsState = {} as ObjectInputs<string>;
    const timeoutKeys = st.a;
    // clear previous task
    clearTimeout(timeoutKeys[ip.key]);
    // new task with the input key
    timeoutKeys[ip.key] = setTimeout(
      () => {
        // Save the time because, changes can happen before response
        const ST = timeoutKeys[ip.key];
        const onError = () => {
          // sync latest inputs state
          latestInputsState = st.get(`i`);
          latestInputsState[ok].validating = false;
          latestInputsState[ok].validationFailed = true;
          syncChanges(st, latestInputsState);
        };

        const onSuccess = (errorMessage: Unknown) => {
          /* we check if time match the request id time
           * If not, that means, another request has been sent.
           * So we wait for that response
           * */
          if (ST === timeoutKeys[ip.key]) {
            // get latest inputs state
            latestInputsState = st.get(`i`);
            // Get latest input errorMessage
            const em = latestInputsState[ok].errorMessage;
            // Add server validation because it is always false before calling server
            latestInputsState[ok].valid = !errorMessage;
            // Add server error message only if actual data is valid else keep actual error Message
            // '' ?? 'not empty' is a js bug and will return '', so we go the other way
            //i[ok].errorMessage = em ?? errorMessage;
            latestInputsState[ok].errorMessage = !em ? errorMessage : em;
            latestInputsState[ok].validating = false;
            syncChanges(st, latestInputsState);
          }
        };
        callback(va, onSuccess, onError);
      },
      st.get("c.asyncDelay") ?? 800
    );
  };
};
