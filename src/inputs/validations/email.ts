import { Unknown, ValidateInput } from "../../types";

export const email = (em?: Unknown): ValidateInput => {
  return ({ value }) => {
    return {
      valid:
        /^(([^<>()\]\\.,;:\s@"]+(\.[^<>()\]\\.,;:\s@"]+)*)|(".+"))@(([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
          value?.toLowerCase()
        ),
      em
    };
  };
};
