import { Unknown, ValidateInput } from "../../types";

export const email = (errorMessage: Unknown): ValidateInput => {
  return ({ va }) =>
    /^(([^<>()\]\\.,;:\s@"]+(\.[^<>()\]\\.,;:\s@"]+)*)|(".+"))@(([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      va?.toLowerCase()
    )
      ? ""
      : errorMessage;
};
