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

interface CustomValidationType {
  (value: Unknown, setErrorMessage: (message: Unknown) => void): boolean;
}

interface CustomAsyncValidationType {
  (
    value: Unknown,
    setErrorMessage: (message: Unknown) => void
  ): Promise<boolean>;
}

type ValidateInputParams = {
  // entry of inputs
  i?: ObjectInputs<string>;
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
type ValidationResult = {
  em: Unknown;
  // valid
  v: boolean;
};
type AsyncValidateInput = (params: ValidateInputParams) => void;

interface ValidationStateType {
  required?: ValidateInput;
  email?: ValidateInput;
  number?: ValidateInput;
  min?: ValidateInput;
  max?: ValidateInput;
  minLength?: ValidateInput;
  minLengthWithoutSpace?: ValidateInput;
  maxLength?: ValidateInput;
  maxLengthWithoutSpace?: ValidateInput;
  match?: ValidateInput;
  startsWith?: ValidateInput;
  endsWith?: ValidateInput;
  regex?: ValidateInput;
  copy?: ValidateInput;
  custom?: ValidateInput;
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
  errorMessage?: Unknown;
  validation?: ValidationStateType;
  data?: Unknown;

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

type ValidateState = {
  // invalid
  iv: boolean;
  // invalid key
  ik: string | null;
};

// FOr some reason, Build-in Required doesn't work
interface InputProps {
  id: string;
  required: boolean;
  accept: string;
  name: string;
  min: number | string;
  max: number | string;
  type: HTMLInputTypeAttribute;
  value: Unknown;
  checked: boolean;
  multiple: boolean;
  placeholder: Unknown;

  onChange(event: Unknown): void;
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
    fileConfig?: FileConfig
  ): void;

  props: InputProps;
  data: Unknown;
}

interface FileConfig {
  getBlob?(url: string): Unknown;
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
  persistID?: string;
};

interface IsValid {
  isValid: boolean;
}

interface CommonForm {
  // toObject(): ObjectInputs<string> & IsValid;
  //
  // toArray(): ArrayInputs & IsValid;

  reset(): void;

  forEach(callback: ForEachCallback): void;

  map(callback: MapCallback): Unknown[];

  showError(): void;

  get(name: string): Input[];
}

interface ForEachCallback {
  (input: Input, index: number, array: ArrayInputs): void;
}

interface MapCallback {
  (input: Input, index: number, array: ArrayInputs): Unknown;
}

interface Form extends CommonForm {
  getValues(): Unknown;

  onSubmit(event: Event): void;
}
type IPS = {
  i: ObjectInputs<string>;
  iv: boolean;
  // helper: Helper;
  inv: boolean;
  // asyncDelay: number;
  c: InputConfig;
};
type InputStore = StoreType<IPS> & { h: HelperType; fc: FileConfig };
type AsyncValidationParams = {
  // valid
  v?: boolean;
  em?: Unknown;
  // objkey
  ok: string;
  //store
  st: InputStore;
  // failed
  f?: boolean;
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

interface HelperType {
  key(): string;

  a: { [k in string]: Unknown };
  ev: { [k in string]: { e: Unknown; v: ValidationStateType; c: number } };
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
  g(oldValue: Unknown, data?: ObjectInputs<string>): Unknown;
}

export type {
  InputsHook,
  GetValue,
  TrackInputs,
  HelperType,
  ObjStateOutput,
  ArrayStateOutput,
  InternalInput,
  Unknown,
  ValidationStateType,
  CustomValidationType,
  Form,
  InputConfig,
  Input,
  InputStore,
  AsyncValidationParams,
  ObjectInputs,
  Computed,
  ParsedFile,
  FileConfig,
  ForEachCallback,
  MapCallback,
  IsValid,
  CreateObjectInputs,
  ArrayInputs,
  CreateArrayInputs,
  InputProps,
  ValidateState,
  ValidateInput,
  AsyncValidateInput,
  ValidateInputParams,
  CustomAsyncValidationType,
  ValidationResult,
  IPS
};
