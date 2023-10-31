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

type NumberOrMap = number | { value: number; message: ErrorMessageType };

type CopyKeyObjType = { value: string; omit: Set<keyof ValidationStateType> };
type CopyType = { value: string; omit: (keyof ValidationStateType)[] };

interface ValidationStateType {
  required?: BooleanOrMap;
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
  asyncCustom?: CustomAsyncValidationType;
}

interface RequiredValidationStateType {
  required: BooleanOrMap;
  email: BooleanOrMap;
  number: BooleanOrMap;
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

interface ParsedFiles {
  file: File;
  key: string;
  url: string;
  updatedFile: any;

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
  files: ParsedFiles[];
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

  onChange(event: SyntheticEvent<HTMLInputElement>): void;
}

type ObjInput = {
  [key in string]: Input;
};

type RequiredObjInput = {
  [key in string]: RequiredInput;
};

type ObjStateOutput<Key> = [{ [k in Key & string]: RequiredInput }, Form];
type StringStateOutput = [RequiredInput, Form];
type ArrayStateOutput = [RequiredInput[], Form];

type StateType = "object" | "array";

type Config = {
  asyncDelay?: number;
  persistID?: string;
  trackID?: IDTrackUtil<string>;
};

interface CommonForm {
  getValues(name?: string): any;

  getValues(): { [k in string]: any };

  reset(): void;
}

interface Form extends CommonForm {
  isValid: boolean;
}

interface IDTrackUtil<S> extends CommonForm {
  id: S;

  isValid(): boolean;
}

interface TrackUtil extends CommonForm {
  isValid(): boolean;
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
};
type AsyncCallback = (params: AsyncValidationParams) => void;

interface ComputeOnceOut extends CommonForm {
  store: InputStore;
}

export type {
  TrackUtil,
  ObjStateOutput,
  ArrayStateOutput,
  StringStateOutput,
  Input,
  ValuesType,
  ValidationStateType,
  ObjInput,
  StateType,
  CustomValidationType,
  MatchResultType,
  Form,
  StringOrMap,
  ErrorMessageType,
  CopyKeyObjType,
  MergeType,
  CopyType,
  SpreadReactType,
  Config,
  RequiredInput,
  IDTrackUtil,
  InputStore,
  AsyncCallback,
  AsyncValidationParams,
  RequiredObjInput,
  ComputeOnceOut,
  ParsedFiles
};
