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
  helper: Helper;
  entry?: ObjectInputs<string>;
  input: Input;
  target: string;
  value: Unknown;
  omittedRules?: (keyof ValidationStateType)[];
  store?: InputStore;
  asyncCallback?: AsyncCallback;
};
type ValidateInput = (params: ValidateInputParams) => ValidationResult;
type ValidationResult = { em: Unknown; valid: boolean };
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
  mergeChanges?: boolean;
  valid?: boolean;
  touched?: boolean;
  placeholder?: Unknown;
  errorMessage?: Unknown;
  validation?: ValidationStateType;
  extraData?: Unknown;
  runOnChange?(value?: Unknown): void;
  runOnValid?(value?: Unknown): void;
}

interface ParsedFile {
  file: File;
  key: string;
  url: string;
  loaded: boolean;
  gettingFile: boolean;
  fileUpdate: Unknown;

  selfRemove(): void;

  onLoad(): void;

  selfUpdate(data: Unknown): void;
}

type ValidateState = {
  isValid: boolean;
  invalidKey: string | null;
};

// FOr some reason, Build-in Required doesn't work
interface InputProps {
  id: string;
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
  mergeChanges: boolean;
  errorMessage: Unknown;
  validation: Required<ValidationStateType>;
  validating: boolean;
  asyncValidationFailed: boolean;
  valid: boolean;
  touched: boolean;

  // initValue(value: Unknown, initFileConfig?: FileConfig): void;

  set<P extends "extraData" | "type" | "value">(
    prop: P,
    value: Input[P],
    fileConfig?: FileConfig
  ): void;

  props: InputProps;
  extraData: Unknown;
}

interface FileConfig {
  getBlob?(url: string): Blob | Promise<Blob>;
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
type StringStateOutput = [Input & IsValid, Form];
type ArrayStateOutput = [ArrayInputs & IsValid, Form];

type StateType = "object" | "array";

type InputConfig = {
  asyncDelay?: number;
  persistID?: string;
  trackID?: IDTrackUtil<string>;
  lockValuesOnError?: boolean;
};

interface IsValid {
  isValid: boolean;
}

interface CommonForm {
  toObject(): ObjectInputs<string> & IsValid;

  toArray(): ArrayInputs & IsValid;

  reset(): void;

  forEach(callback: ForEachCallback): void;

  map(callback: MapCallback): Unknown[];

  showError(): void;

  getInputById(id: string): Input;

  getInputsByName(name: string): Input[];
}

interface ForEachCallback {
  (input: Input, index: number, array: ArrayInputs): void;
}

interface MapCallback {
  (input: Input, index: number, array: ArrayInputs): Unknown;
}

interface Form extends CommonForm {
  length: number;

  getValues(name?: string): Unknown;

  onSubmit(event: Event): void;
}

interface IDTrackUtil<I> extends CommonForm {
  ID: I;
  length: number;

  isValid(): boolean;

  getValues(name?: string): Unknown;

  // Todo, typing result
  // useInputs(): Unknown;
  useValues(name?: string): Unknown;
}

interface TrackUtil extends CommonForm {
  isValid(): boolean;

  getValues(): Unknown;

  length(): number;

  useValues(): Unknown;
}

type InputStore = StoreType<{
  entry: ObjectInputs<string>;
  isValid: boolean;
  // helper: Helper;
  initialValid: boolean;
  // asyncDelay: number;
  config: InputConfig;
}>;
type AsyncValidationParams = {
  valid: boolean;
  em?: Unknown;
  input: Input;
  store: InputStore;
  failed?: boolean;
  helper: Helper;
};
type AsyncCallback = (params: AsyncValidationParams) => void;

interface CompForm extends CommonForm {
  length: number;

  getValues(name?: string): Unknown;

  onSubmit(event: Event): void;

  showError(): void;
}

interface ComputeOnceOut {
  store: InputStore;
  compForm: CompForm;
}

interface Helper {
  key(): string;
  em: { [k in string]: Unknown };
  a: { [k in string]: Unknown };
}

interface InputsHook {
  // External declaration support (Dynamic infer)
  <I>(
    initialState: I extends string
      ? I
      : I extends Array<Unknown>
      ? CreateArrayInputs | I
      : CreateObjectInputs<keyof I> | I,
    config?: InputConfig
  ): I extends string
    ? StringStateOutput
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
  <I extends string>(initialState: I, config?: InputConfig): StringStateOutput;
}

type HookType = "file" | "textBased" | "radio" | "checkbox";

interface InternalInputsHook {
  (initialState: Unknown, config: Unknown, type: HookType): Unknown;
}

export type {
  InputsHook,
  InternalInputsHook,
  HookType,
  Helper,
  TrackUtil,
  ObjStateOutput,
  ArrayStateOutput,
  StringStateOutput,
  InternalInput,
  Unknown,
  ValidationStateType,
  StateType,
  CustomValidationType,
  Form,
  InputConfig,
  Input,
  IDTrackUtil,
  InputStore,
  AsyncCallback,
  AsyncValidationParams,
  ObjectInputs,
  ComputeOnceOut,
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
  ValidationResult
};
