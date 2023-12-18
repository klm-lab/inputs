import type { StoreType } from "aio-store/react";

type HTMLInputTypeAttribute =
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
  | "select"
  //| "submit"
  | "tel"
  | "text"
  | "time"
  | "url"
  | "week";

type Unknown = any;

interface CustomAsyncValidationType {
  (value: Unknown, onSuccess: (em: Unknown) => void, onError: () => void): void;
}

type ValidateInputParams = {
  // entry of inputs
  i: ObjectInputs<string>;
  // input
  ip: Input;
  // objkey
  ok: string;
  // value
  va: Unknown;
  // omittedRules
  omr?: (keyof ValidationStateType)[];
  // store
  st: InputStore;
};
type ValidateInput = (params: ValidateInputParams) => ValidationResult;
type ValidationResult = Unknown;
type AsyncValidateInput = (params: ValidateInputParams) => void;

interface ValidationStateType {
  required?: ValidateInput;
  email?: ValidateInput;
  number?: ValidateInput;
  min?: ValidateInput;
  max?: ValidateInput;
  match?: ValidateInput;
  // copy?: ValidateInput;
  custom?: (value: Unknown) => Unknown;
  asyncCustom?: ValidateInput;
}

interface InternalInput {
  id?: string;
  accept?: string;
  name?: string;
  type?: HTMLInputTypeAttribute;
  label?: Unknown;
  value?: Unknown;
  checked?: boolean;
  multiple?: boolean;
  merge?: boolean;
  valid?: boolean;
  touched?: boolean;
  placeholder?: Unknown;
  validation?: ValidationStateType;
  data?: Unknown;
  [k: string]: Unknown;

  afterChange?(params: { value: Unknown; input: Input }): void;
}

interface ParsedFile {
  file: File;
  key: string;
  url: string;
  loaded: boolean;
  fetching: boolean;
  update: Unknown;

  selfRemove(): void;

  onLoad(): void;

  selfUpdate(data: Unknown): void;
}

// FOr some reason, Build-in Required doesn't work
interface InputProps {
  id: string;
  accept: string;
  name: string;
  type: HTMLInputTypeAttribute;
  value: Unknown;
  checked: boolean;
  multiple: boolean;
  placeholder: Unknown;

  onChange(event: Unknown): void;
  [k: string]: Unknown;
}

interface Input extends InputProps {
  key: string;
  label: Unknown;
  files: ParsedFile[];
  merge: boolean;
  errorMessage: Unknown;
  validation: Required<ValidationStateType>;
  validating: boolean;
  validationFailed: boolean;
  valid: boolean;
  touched: boolean;

  set<P extends "data" | "type" | "value">(
    prop: P,
    value: Input[P],
    getFile?: GetFile
  ): void;

  props: InputProps;
  data: Unknown;
}

interface GetFile {
  (url: string): Unknown;
}

type CreateObjectInputs<K> = {
  [key in K & string]: InternalInput;
};

type ObjectInputs<K> = {
  [key in K & string]: Input;
};

type ArrayInputs = Input[];
type CreateArrayInputs = (string | InternalInput)[];

type ObjStateOutput<I> = [{ [k in keyof I & string]: Input } & IsValid, Form];
type ArrayStateOutput = [ArrayInputs & IsValid, Form];

type InputConfig = {
  asyncDelay?: number;
  pid?: string;
};

interface IsValid {
  isValid: boolean;
  isTouched: boolean;
}

interface CommonForm {
  reset(): void;

  each(callback: EachCallback): Unknown[];

  showError(): void;

  get(name: string): Input[];
}

interface EachCallback {
  (input: Input, index: number, array: ArrayInputs): Unknown;
}

interface Form extends CommonForm {
  getValues(): Unknown;

  onSubmit(event: Event): void;
}
type IPS = {
  i: ObjectInputs<string>;
  //touched
  t: boolean;
  iv: boolean;
  // helper: Helper;
  inv: boolean;
  // asyncDelay: number;
  c: InputConfig;
};
type InputStore = StoreType<IPS> & {
  fc: GetFile;
  // async Delay key
  a: { [k in string]: Unknown };
  // extra variables, validation, counter, objKey and checkbox values
  ev: {
    [k in string]: {
      a?: (params: { value: Unknown; input: Input }) => void;
      v: ValidationStateType;
      c: number;
      // Initial selected values
      i: Set<Unknown>;
      // A set of selected value
      s: Set<Unknown>;
      // objkey bind to name
      o: Unknown[];
      // common objKey
      k: string;
      // parsed Value
      p?: Unknown;
    };
  };
  // all inputs name
  n: Unknown[];
};

interface CompForm extends CommonForm {
  getValues(): Unknown;

  onSubmit(event: Event): void;
}

interface Computed {
  // store
  st: InputStore;
  cp: CompForm;
  // useValues
  uv(): Unknown;
  // is valid
  iv(): boolean;
  // array
  a: boolean;
}

interface InputsHook {
  // External declaration support (Dynamic infer)
  <I>(
    initialState: I extends Array<Unknown>
      ? CreateArrayInputs | I
      : CreateObjectInputs<keyof I> | I,
    config?: InputConfig
  ): I extends string
    ? ObjStateOutput<CreateObjectInputs<I>>
    : I extends Array<Unknown>
    ? ArrayStateOutput
    : ObjStateOutput<I>;

  // Internal declaration object
  <I extends CreateObjectInputs<keyof I>>(
    initialState: CreateObjectInputs<keyof I> | I,
    config?: InputConfig
  ): ObjStateOutput<I>;

  // Internal declaration Array
  <I extends CreateArrayInputs>(
    initialState: CreateArrayInputs | I,
    config?: InputConfig
  ): ArrayStateOutput;

  // string
  <I extends string>(
    initialState: I,
    config?: InputConfig
  ): ObjStateOutput<CreateObjectInputs<I>>;
}

interface Inputs<I> extends CompForm {
  (): I extends string
    ? ObjStateOutput<CreateObjectInputs<I>>
    : I extends Array<Unknown>
    ? ArrayStateOutput
    : ObjStateOutput<I>;
  isValid(): boolean;
  useValues(): Unknown;
}

interface TrackInputs {
  <I>(
    initialState: I extends Array<Unknown>
      ? CreateArrayInputs | I
      : CreateObjectInputs<keyof I> | I,
    config?: InputConfig
  ): Inputs<I>;
}

interface GetValue {
  g(oldValue: Unknown, touching?: boolean): Unknown;
}

export type {
  InputsHook,
  GetValue,
  TrackInputs,
  ObjStateOutput,
  ArrayStateOutput,
  InternalInput,
  Unknown,
  ValidationStateType,
  Form,
  InputConfig,
  Input,
  InputStore,
  ObjectInputs,
  Computed,
  ParsedFile,
  GetFile,
  EachCallback,
  IsValid,
  CreateObjectInputs,
  ArrayInputs,
  CreateArrayInputs,
  InputProps,
  ValidateInput,
  AsyncValidateInput,
  ValidateInputParams,
  CustomAsyncValidationType,
  ValidationResult,
  IPS
};
