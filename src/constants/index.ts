import type {
  ObjectInputStateType,
  KlmUtilConstant,
  WorkingState
} from "../types";

const NAME_DATA: ObjectInputStateType = {
  target: "name",
  value: "",
  valid: false,
  touched: false,
  placeholder: "Entrez le nom",
  validation: {
    required: true,
    minLength: 3
  }
};

const NUMBER_DATA: ObjectInputStateType = {
  target: "number",
  value: 0,
  valid: false,
  touched: false,
  validation: {
    required: true,
    number: true
  }
};

const EMAIL_DATA: ObjectInputStateType = {
  target: "email",
  value: "",
  valid: false,
  touched: false,
  placeholder: "Entrez votre email",
  validation: {
    required: true,
    email: true
  }
};

const PASSWORD_DATA: ObjectInputStateType = {
  target: "password",
  value: "",
  valid: false,
  touched: false,
  placeholder: "* * * * * * * *",
  validation: {
    required: true,
    minLength: 8
  }
};

const CONFIRM_PASSWORD_DATA: ObjectInputStateType = {
  target: "confirmPassword",
  value: "",
  touched: false,
  valid: false,
  validation: {
    match: "password"
  }
};

const DESCRIPTION_DATA: ObjectInputStateType = {
  target: "description",
  value: "",
  touched: true,
  valid: true
};

const NAME = {
  name: NAME_DATA
};
const NUMBER = {
  number: NUMBER_DATA
};
const EMAIL = {
  email: EMAIL_DATA
};
const PASSWORD = {
  password: PASSWORD_DATA
};
const CONFIRM_PASSWORD = {
  confirmPassword: CONFIRM_PASSWORD_DATA
};
const DESCRIPTION = {
  description: DESCRIPTION_DATA
};

const STATE = {
  NAME,
  NUMBER,
  EMAIL,
  PASSWORD,
  CONFIRM_PASSWORD,
  DESCRIPTION
};

const VALIDATIONS_KEYS = [
  "required",
  "email",
  "number",
  "min",
  "max",
  "minLength",
  "minLengthWithoutSpace",
  "maxLength",
  "maxLengthWithoutSpace",
  "match",
  "startsWith",
  "endsWith",
  "equalsTo",
  "regex",
  "copy",
  "custom"
];

const RESERVED = ["trackingMatch", "generateErrorMessage"];

const INPUT_KEYS = [
  "target",
  "type",
  "label",
  "value",
  "resetValue",
  "valid",
  "touched",
  "placeholder",
  "errorMessage",
  "validation"
];

const WORKING_STATE: WorkingState = {
  DEFAULT: "default",
  PROCESSING: "processing",
  FAILED: "failed",
  SUCCESS: "success"
};

const GLOBAL: KlmUtilConstant = {
  NOT_SET: "not_set"
};

const B_U = Object.freeze(["boolean", "undefined"]);
const S_U = Object.freeze(["string", "undefined"]);
const N_U = Object.freeze(["number", "undefined"]);
const F_U = Object.freeze(["function", "undefined"]);

const KLM_LAB_UTIL = Object.freeze({
  STATE,
  WORKING_STATE,
  GLOBAL
});

export {
  KLM_LAB_UTIL,
  B_U,
  S_U,
  N_U,
  F_U,
  VALIDATIONS_KEYS,
  INPUT_KEYS,
  RESERVED
};
