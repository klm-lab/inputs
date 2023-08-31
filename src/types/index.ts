type ValuesType = any;

type StateToolsType = {
  isValid: boolean;
  reset: () => void;
};
type CustomValidationType = (value: ValuesType) => boolean;
type InputObjectWithFormIsValid = {
  inputs: InputType;
  formIsValid: boolean;
};
type InputArrayWithFormIsValid = {
  inputs: ArrayInputStateType[];
  formIsValid: boolean;
};
type MatchResultType = {
  matchKeys: string[];
  lastMatched: string;
  validation?: ValidationStateType;
};
type ValidationClassResultType = {
  valid: boolean;
  errorMessage: string;
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
  trackingMatch?: string[];
};
type KlmUtilConstant = {
  [key in string]: any;
};
type WorkingState = {
  DEFAULT: string;
  PROCESSING: string;
  FAILED: string;
  SUCCESS: string;
};
type ValidationResultType = {
  validatedData: InputType;
  valid: boolean;
  errorMessage: string;
};
interface commonInputState {
  type?: string;
  label?: string;
  value?: ValuesType;
  resetValue?: ValuesType;
  valid?: boolean;
  touched?: boolean;
  placeholder?: string;
  errorMessage?: string;
  generateErrorMessage?: boolean;
  validation?: ValidationStateType;
}
interface ArrayInputStateType extends commonInputState {
  target: string;
}
interface ObjectInputStateType extends commonInputState {
  target?: string;
}
type InputType = {
  [key in string]: ObjectInputStateType;
};
type Dispatch<A> = (value: A) => void;
type SetStateAction<S> = S | ((prevState: S) => S);
type ErrorType = {
  name: string;
  message: string;
  stack?: string;
  matchKey?: string;
  state?: any;
};
export type {
  ObjectInputStateType,
  ValuesType,
  ValidationStateType,
  InputType,
  Dispatch,
  SetStateAction,
  ValidationResultType,
  ErrorType,
  KlmUtilConstant,
  WorkingState,
  CustomValidationType,
  ArrayInputStateType,
  MatchResultType,
  ValidationClassResultType,
  InputArrayWithFormIsValid,
  InputObjectWithFormIsValid,
  StateToolsType
};
