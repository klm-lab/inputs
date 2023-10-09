// __ => help us validate matched keys
// ___ => help us save original errorMessage

type HTMLInputTypeAttribute =
  | "button"
  | "checkbox"
  | "color"
  | "date"
  | "datetime-local"
  | "email"
  | "file"
  //| "hidden"
  //| "image"
  | "month"
  | "number"
  | "password"
  | "radio"
  | "range"
  //| "reset"
  | "search"
  //| "submit"
  | "tel"
  | "text"
  | "time"
  | "url"
  | "week"
  | string;

type ValuesType = any;

interface SpreadReactType {
  id: string;
  value: any;
  type: HTMLInputTypeAttribute;
  name?: string;
  label?: string;
  placeholder: StringOrObj;
}

interface Form {
  isValid: boolean;

  reset(): void;
}

interface ArrayForm extends Form {
  toObject(): ObjState;
}

interface ObjectForm extends Form {
  toArray(): Input[];
}

interface CustomValidationType {
  (
    value: ValuesType,
    set?: (message: ErrorMessageType) => void
  ): boolean | Promise<boolean>;
}

type MatchResultType = {
  // matched keys
  mk: string[];
  // Last matched
  lm: string;
  // validation
  v?: ValidationStateType;
};

type MergeType = {
  omit?: Set<keyof ValidationStateType>;
  keyPath?: keyof ValidationStateType;
};

type StringOrMap = string | { value: string; message: ErrorMessageType };

type BooleanOrMap = boolean | { value?: boolean; message: ErrorMessageType };

type NumberOrMap = number | { value: number; message: ErrorMessageType };

type CopyKeyObjType = { value: string; omit: Set<keyof ValidationStateType> };
type CopyType = { value: string; omit: (keyof ValidationStateType)[] };

interface ValidationStateType {
  required?: BooleanOrMap;
  async?: boolean;
  email?: BooleanOrMap;
  number?: BooleanOrMap;
  min?: NumberOrMap;
  max?: NumberOrMap;
  minLength?: NumberOrMap;
  minLengthWithoutSpace?: NumberOrMap;
  maxLength?: NumberOrMap;
  maxLengthWithoutSpace?: NumberOrMap;
  match?: string;
  startsWith?: StringOrMap;
  endsWith?: StringOrMap;
  regex?: RegExp & any;
  copy?: CopyType;
  custom?: CustomValidationType;
}

type StringOrObj = string | { [k in string]: string };
type ErrorMessageType = StringOrObj;

interface Input {
  id?: string;
  name?: StringOrObj;
  type?: HTMLInputTypeAttribute;
  label?: StringOrObj;
  value?: ValuesType;
  resetValue?: ValuesType;
  valid?: boolean;
  touched?: boolean;
  placeholder?: StringOrObj;
  errorMessage?: ErrorMessageType;
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
  ObjectForm
];
type StringStateOutput = [Input, (value: any) => void, ObjectForm];
type ArrayStateOutput = [
  Input[],
  (input: Input, value: any) => void,
  ArrayForm
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
  Form,
  StringOrMap,
  ErrorMessageType,
  CopyKeyObjType,
  MergeType,
  CopyType,
  SpreadReactType
};
