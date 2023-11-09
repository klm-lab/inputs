import type { StoreType } from "aio-store/react";
import type { H } from "../util/helper";
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

type ValuesType = any | any[];

interface CustomValidationType {
  (
    value: ValuesType,
    setErrorMessage?: (message: ErrorMessageType) => void
  ): boolean;
}

interface CustomAsyncValidationType {
  (
    value: ValuesType,
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
  regex?: RegExp & any;
  copy?: CopyType;
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
  regex: RegExp & any;
  copy: CopyType;
  asyncCustom: CustomAsyncValidationType;
  custom: CustomValidationType;
}

type StringOrObj = string | { [k in string]: string };
type ErrorMessageType = StringOrObj;

interface Input {
  id?: string;
  name?: string;
  type?: HTMLInputTypeAttribute;
  label?: StringOrObj;
  value?: ValuesType;
  checked?: boolean;
  multiple?: boolean;
  mergeChanges?: boolean;
  valid?: boolean;
  touched?: boolean;
  placeholder?: StringOrObj;
  errorMessage?: ErrorMessageType;
  validation?: ValidationStateType;
}

interface ParsedFile {
  file: File;
  key: string;
  url: string;
  gettingFile: boolean;
  fileUpdate: any;

  selfRemove(): void;

  onLoad(): void;

  selfUpdate(data: any): void;
}

// FOr some reason, Build-in Required doesn't work
interface RequiredInput {
  id: string;
  name: string;
  type: HTMLInputTypeAttribute;
  label: StringOrObj;
  value: ValuesType;
  files: ParsedFile[];
  checked: boolean;
  multiple: boolean;
  mergeChanges: boolean;
  valid: boolean;
  touched: boolean;
  placeholder: StringOrObj;
  errorMessage: ErrorMessageType;
  key: string;
  validation: RequiredValidationStateType;
  validating: boolean;
  asyncValidationFailed: boolean;

  onChange(event: SyntheticEvent<HTMLElement>): void;

  onChange(value: any): void;

  init(value: any, initFileConfig?: InitFileConfig): void;
}

interface InitFileConfig {
  entryFormat?: "url" | "url[]";
  proxyUrl?: string;
  useDefaultProxyUrl?: boolean;
}

type ObjInput = {
  [key in string]: Input;
};

type RequiredObjInput = {
  [key in string]: RequiredInput;
};

type ObjStateOutput<Key> = [
  { [k in Key & string]: RequiredInput } & IsValid,
  Form
];
type StringStateOutput = [RequiredInput & IsValid, Form];
type ArrayStateOutput = [RequiredInput[] & IsValid, Form];

type StateType = "object" | "array";

type Config = {
  asyncDelay?: number;
  persistID?: string;
  trackID?: IDTrackUtil<string>;
};

interface IsValid {
  isValid: boolean;
}

interface CommonForm {
  getValues(name?: string): any;

  getValues(): { [k in string]: any };

  toObject(): RequiredObjInput & IsValid;

  toArray(): RequiredInput[] & IsValid;

  reset(): void;

  forEach(callback: ForEachCallback): void;

  map(callback: MapCallback): unknown[];
}

type Method = "forEach" | "map";

interface ForEachCallback {
  (input: RequiredInput, index: number, array: RequiredInput[]): void;
}

interface MapCallback {
  (input: RequiredInput, index: number, array: RequiredInput[]): unknown;
}

interface Form extends CommonForm {
  length: number;
}

interface IDTrackUtil<S> extends CommonForm {
  ID: S;
  length: number;

  isValid(): boolean;

  // todo, typing result
  // useInputs(): any;
}

interface TrackUtil extends CommonForm {
  isValid(): boolean;

  length(): number;
}

type InputStore = StoreType<{
  entry: RequiredObjInput;
  isValid: boolean;
  helper: H;
  initialValid: boolean;
  asyncDelay: number;
}>;
type AsyncValidationParams = {
  valid: boolean;
  em?: ErrorMessageType;
  entry: RequiredInput;
  store: InputStore;
  failed?: boolean;
};
type AsyncCallback = (params: AsyncValidationParams) => void;

interface ComputeOnceOut extends CommonForm {
  store: InputStore;
  length: number;
}

export type {
  TrackUtil,
  ObjStateOutput,
  ArrayStateOutput,
  StringStateOutput,
  Input,
  ValuesType,
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
  Config,
  RequiredInput,
  IDTrackUtil,
  InputStore,
  AsyncCallback,
  AsyncValidationParams,
  RequiredObjInput,
  ComputeOnceOut,
  ParsedFile,
  InitFileConfig,
  ForEachCallback,
  MapCallback,
  Method,
  IsValid,
  ObjInput
};
