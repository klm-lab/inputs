import type {
    ArrayStateOutput,
    Input,
    ObjState,
    ObjStateOutput,
    StateType,
    StringStateOutput,
    ValuesType
} from "./types";
import {common, matchRules, resetState, stateIsValid, transform} from "./util";
import {validate, validateAsync} from "./validation";
import {useCallback, useMemo, useState} from "react";

const populate = (state: any, type: StateType): any => {
    const final = {} as ObjState;
    for (const stateKey in state) {
        const parseKey = type === "object" ? stateKey : state[stateKey].id;
        final[parseKey] = {
            ...common(state[stateKey]),
            ...state[stateKey],
            ...(type === "object" ? {id: stateKey} : {})
        };
    }

    const s = matchRules(final);
    return [type === "object" ? s : transform(s, "array"), stateIsValid(s)];
};

function inputs(initialState: any, type: StateType, selective?: string) {
    const [entry, valid] = useMemo(() => populate(initialState, type), []);

    const [{inputs, formIsValid}, setInputs] = useState({
        inputs: entry,
        formIsValid: valid
    });
    const setState = useCallback(function (input: any, value: ValuesType) {
        return onChange(
            selective ? inputs[selective] : input,
            selective ? input : value,
            setInputs,
            type
        );
    }, []);
    const reset = useCallback(function () {
        setInputs((prevState: any) => {
            return {
                inputs: resetState(prevState.inputs, type),
                formIsValid: false
            };
        });
    }, []);

    return [
        selective ? inputs[selective] : inputs,
        setState,
        {isValid: formIsValid, reset}
    ];
}

function asyncChange
(input: Input,
 value: ValuesType,
 setState: any,
 type: StateType, toValidate: ObjState) {
    validateAsync(
        toValidate,
        input.id as string,
        value,
        ({isValid, errorMessage}: any) => {
            setState((prevState: any) => {
                const clonedData =
                    type === "object"
                        ? {...prevState.inputs}
                        : transform(prevState.inputs, "object");
                clonedData[input.id as string].valid = clonedData[input.id as string].valid && isValid;
                clonedData[input.id as string].errorMessage = errorMessage;
                clonedData[input.id as string].validating = false;
                return {
                    inputs:
                        type === "object" ? clonedData : transform(clonedData, "array"),
                    formIsValid: stateIsValid(clonedData)
                };
            });
        }
    );
}

function onChange(
    input: Input,
    value: ValuesType,
    setState: any,
    type: StateType
) {
    setState((prevState: any) => {
        const clonedData =
            type === "object"
                ? {...prevState.inputs}
                : transform(prevState.inputs, "object");
        const {isValid, errorMessage} = validate(
            clonedData,
            input.id as string,
            value
        );

        clonedData[input.id as string].value = value;
        clonedData[input.id as string].touched = true;
        clonedData[input.id as string].valid = isValid;
        clonedData[input.id as string].errorMessage = errorMessage;
        /* if it is valid then if async is true, we set validating to true otherwise false
        * valid === false mean no need to call async,
        * valid === true means we can call async if async is set to true by the user.
        *
        * validating prop is responsible to show async validation loading
        * */
        clonedData[input.id as string].validating = isValid ? !!input.validation?.async : false;

        if (isValid && input.validation?.async) {
            asyncChange(input, value, setState, type, clonedData);
        }
        /* form can only be valid if everything is valid.
        *
        * If async will be called, then we keep formIsvalid at it was.
        * We let async update it after his validation.
        * And if there is no async validation , we validate the form here
        * */
        return {
            formIsValid: input.validation?.async ? prevState.formIsValid : stateIsValid(clonedData),
            inputs: type === "object" ? clonedData : transform(clonedData, "array")
        };
    });
}

function useInputs<S extends ObjState>(
    initialState: S
): ObjStateOutput<keyof S>;
function useInputs(initialState: Input[]): ArrayStateOutput;
function useInputs(initialState: (string | Input)[]): ArrayStateOutput;
function useInputs(initialState: string): StringStateOutput;

function useInputs(initialState: any): any {
    if (Array.isArray(initialState)) {
        return inputs(
            initialState.map((entry, i) =>
                typeof entry === "string"
                    ? {id: entry}
                    : entry.id
                        ? entry
                        : {id: `input_${i}`, ...entry}
            ),
            "array"
        );
    }
    if (typeof initialState === "string") {
        return inputs({[initialState]: {}}, "object", initialState);
    }
    return inputs(initialState, "object");
}

export {useInputs};
