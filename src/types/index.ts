
// __ => help us validate matched keys
// ___ => help us save original errorMessage

type ValuesType = any;

interface Form {
    isValid: boolean;

    reset(): void;
}

type ObjType = {
    [k in string]: string;
};

interface CustomValidationType {
    (value: ValuesType,
     setErrorMessage?: (message: string | ObjType) => void
    ): boolean | Promise<boolean>
}

type MatchResultType = {
    matchKeys: string[];
    lastMatched: string;
    validation?: ValidationStateType;
};

type StringOrMap =
    | string
    | { value: string; message: ErrorMessageType }

type BooleanOrMap =
    | boolean
    | { value?: boolean; message: ErrorMessageType }

type NumberOrMap =
    | number
    | { value: number; message: ErrorMessageType }

type AnyOrMap =
    | any
    | { value: any; message: ErrorMessageType }

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
    match?: StringOrMap;
    startsWith?: StringOrMap;
    endsWith?: StringOrMap;
    equalsTo?: AnyOrMap;
    regex?: RegExp;
    copy?: StringOrMap;
    custom?: CustomValidationType;
    __?: string[];
}

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
    Form
];
type StringStateOutput = [Input, (value: any) => void, Form];
type ArrayStateOutput = [
    Input[],
    (input: Input, value: any) => void,
    Form
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
    ObjType,
    StringOrMap,
    ErrorMessageType
};
