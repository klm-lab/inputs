import type { StoreType } from "aio-store/react";
import type { SyntheticEvent } from "react";

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
  (
    value: Unknown,
    setErrorMessage?: (message: ErrorMessageType) => void
  ): boolean;
}

interface CustomAsyncValidationType {
  (
    value: Unknown,
    setErrorMessage?: (message: ErrorMessageType) => void
  ): Promise<boolean>;
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

// type CustomNumber = "only" | "not-allowed" | "allowed";
//
// type CustomNumberOrMap =
//   | CustomNumber
//   | { value?: CustomNumber; message: ErrorMessageType };

type NumberOrMap = number | { value: number; message: ErrorMessageType };

type CopyKeyObjType = { value: string; omit: Set<keyof ValidationStateType> };
type CopyType = { value: string; omit: (keyof ValidationStateType)[] };

interface ValidationStateType {
  required?: BooleanOrMap;
  email?: BooleanOrMap;
  number?: BooleanOrMap;
  // negativeNumber?: CustomNumberOrMap;
  // expoNumber?: CustomNumberOrMap;
  // floatingNumber?: CustomNumberOrMap;
  min?: NumberOrMap;
  max?: NumberOrMap;
  minLength?: NumberOrMap;
  minLengthWithoutSpace?: NumberOrMap;
  maxLength?: NumberOrMap;
  maxLengthWithoutSpace?: NumberOrMap;
  match?: string;
  startsWith?: StringOrMap;
  endsWith?: StringOrMap;
  regex?: RegExp & Unknown;
  copy?: string | CopyType;
  custom?: CustomValidationType;
  asyncCustom?: CustomAsyncValidationType;
}

interface RequiredValidationStateType {
  required: BooleanOrMap;
  email: BooleanOrMap;
  number: BooleanOrMap;
  // negativeNumber: CustomNumberOrMap;
  // expoNumber: CustomNumberOrMap;
  // floatingNumber: CustomNumberOrMap;
  min: NumberOrMap;
  max: NumberOrMap;
  minLength: NumberOrMap;
  minLengthWithoutSpace: NumberOrMap;
  maxLength: NumberOrMap;
  maxLengthWithoutSpace: NumberOrMap;
  match: string;
  startsWith: StringOrMap;
  endsWith: StringOrMap;
  regex: RegExp & Unknown;
  copy: string | CopyType;
  asyncCustom: CustomAsyncValidationType;
  custom: CustomValidationType;
}

// type StringOrObj = string | { [k in string]: string };
type ErrorMessageType = Unknown;

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
}

interface ParsedFile {
  file: File;
  key: string;
  url: string;
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
  type: HTMLInputTypeAttribute;
  value: Unknown;
  checked: boolean;
  multiple: boolean;
  placeholder: Unknown;

  onChange(event: SyntheticEvent<HTMLElement>): void;

  onChange(value: Unknown): void;
}
interface Input extends InputProps {
  key: string;
  label: Unknown;
  files: ParsedFile[];
  mergeChanges: boolean;
  errorMessage: ErrorMessageType;
  validation: RequiredValidationStateType;
  validating: boolean;
  asyncValidationFailed: boolean;
  valid: boolean;
  touched: boolean;

  initValue(value: Unknown, initFileConfig?: InitFileConfig): void;
  setExtraData(data: Unknown): void;
  props: InputProps;
  extraData: Unknown;
}

interface InitFileConfig {
  // entryFormat?: "url" | "url[]";
  // proxyUrl?: string;
  // useDefaultProxyUrl?: boolean;
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
}

type Method = "forEach" | "map";

interface ForEachCallback {
  (input: Input, index: number, array: ArrayInputs): void;
}

interface MapCallback {
  (input: Input, index: number, array: ArrayInputs): Unknown;
}

interface Form extends CommonForm {
  length: number;

  getValues(name?: string): Unknown;

  onSubmit(event: SyntheticEvent): void;
  showError(): void;
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
  helper: Helper;
  initialValid: boolean;
  asyncDelay: number;
}>;
type AsyncValidationParams = {
  valid: boolean;
  em?: ErrorMessageType;
  entry: Input;
  store: InputStore;
  failed?: boolean;
  helper: Helper;
};
type AsyncCallback = (params: AsyncValidationParams) => void;

interface ComputeOnceOut extends CommonForm {
  store: InputStore;
  length: number;

  getValues(name?: string): Unknown;

  onSubmit(event: SyntheticEvent): void;
  showError(): void;
}

interface Helper {
  ok: { [k in string]: Set<keyof ValidationStateType> };
  s: CreateObjectInputs<string>;
  em: { [k in string]: ErrorMessageType | undefined };
  tm: { [k in string]: string[] };
  a: { [k in string]: Unknown };

  clean(s: CreateObjectInputs<string>): CreateObjectInputs<string>;
}

export type {
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
  MatchResultType,
  Form,
  StringOrMap,
  ErrorMessageType,
  CopyKeyObjType,
  MergeType,
  CopyType,
  InputConfig,
  Input,
  IDTrackUtil,
  InputStore,
  AsyncCallback,
  AsyncValidationParams,
  ObjectInputs,
  ComputeOnceOut,
  ParsedFile,
  InitFileConfig,
  ForEachCallback,
  MapCallback,
  Method,
  IsValid,
  CreateObjectInputs,
  ArrayInputs,
  CreateArrayInputs,
  InputProps,
  ValidateState
};
