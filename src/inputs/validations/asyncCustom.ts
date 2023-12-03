import {
  AsyncCallback,
  AsyncValidateInput,
  CustomAsyncValidationType,
  InputStore,
  Unknown
} from "../../types";

export const asyncCustom = (
  callback: CustomAsyncValidationType
): AsyncValidateInput => {
  return ({ value, helper, target, input, store, asyncCallback }) => {
    clearTimeout(helper.a[input.key]);
    helper.a[input.key] = setTimeout(
      () => {
        // Save the time
        const ST = helper.a[input.key];
        let eM: Unknown = null;
        Promise.resolve(callback(value, (m: Unknown) => (eM = m)))
          .then((value) => {
            if (typeof value !== "boolean") {
              throw TypeError("Your custom response is not a boolean");
            }
            /* we check if time match the request id time
             * If not, that means, another request has been sent.
             * So we wait for that response
             * */
            if (ST === helper.a[input.key]) {
              (asyncCallback as AsyncCallback)({
                valid: value,
                em: eM ?? helper.em[target],
                input,
                store: store as InputStore,
                helper
              });
            }
          })
          .catch((error) => {
            console.error(error);
            (asyncCallback as AsyncCallback)({
              valid: false,
              failed: true,
              input,
              store: store as InputStore,
              helper
            });
          });
      },
      store!.get("config.asyncDelay") ?? 800
    );
  };
};
