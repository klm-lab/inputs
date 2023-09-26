// _ => tell us if a user has a custom error Message
// __ => help us validate matched keys
// ___ => help us save original errorMessage
// key => help us manage and transform state from array to object and so on

type ValuesType = any;

interface StateToolsType {
  isValid: boolean;

  reset(): void;
}

type ObjType = {
  [k in string]: string;
};

type CustomValidationType =
  | ((value: ValuesType) => boolean)
  | ((
      value: ValuesType,
      setErrorMessage: (message: string | ObjType) => void
    ) => boolean)
  | ((value: ValuesType) => Promise<boolean>)
  | ((
      value: ValuesType,
      setErrorMessage: (message: string | ObjType) => void
    ) => Promise<boolean>);

type MatchResultType = {
  matchKeys: string[];
  lastMatched: string;
  validation?: ValidationStateType;
};
type ValidationResult = {
  valid: boolean;
  errorMessage?: ErrorMessageType;
};
type ValidationStateType = {
  required?: boolean;
  email?: boolean;
  number?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  minLengthWithoutSpace?: number;
  maxLength?: number;
  maxLengthWithoutSpace?: number;
  match?: string;
  startsWith?: string;
  endsWith?: string;
  equalsTo?: any;
  regex?: RegExp;
  copy?: string;
  custom?: CustomValidationType;
  __?: string[];
};

type ErrorMessageType =
  | string
  | {
      [k in string]: string;
    };

interface Input {
  id?: string;
  name?: string;
  type?: string;
  label?: string;
  value?: ValuesType;
  resetValue?: ValuesType;
  valid?: boolean;
  touched?: boolean;
  placeholder?: string;
  errorMessage?: ErrorMessageType;
  _?: boolean;
  ___?: ErrorMessageType;
  key?: string;
  validation?: ValidationStateType;
  validating?: boolean;
}

type ObjState = {
  [key in string]: Input;
};

type ObjStateOutput<Key> = [
  { [k in Key & string]: Input },
  (input: Input, value: any) => void,
  StateToolsType
];
type StringStateOutput = [Input, (value: any) => void, StateToolsType];
type ArrayStateOutput = [
  Input[],
  (input: Input, value: any) => void,
  StateToolsType
];

type StateType = "object" | "array";

export type {
  ObjStateOutput,
  ArrayStateOutput,
  StringStateOutput,
  Input,
  ValuesType,
  ValidationStateType,
  ObjState,
  StateType,
  CustomValidationType,
  MatchResultType,
  ValidationResult,
  StateToolsType,
  ObjType
};
