import type {Input, MatchResultType, ObjState, StateType, StringOrMap, ValidationStateType} from "../types";
import {deepMatch, getValue} from "../validation";

function initValidAndTouch(entry: Input, resetValue?: any) {
    const validation = entry.validation;
    const value = entry.value;
    if (typeof validation === "undefined") {
        return true;
    }
    if (Object.keys(validation).length <= 0) {
        return true;
    }
    //If value is provided then input is valid by default
    return !["", 0, null, undefined].includes(resetValue ?? value);
}

const resetState = (formData: any, type: StateType): any => {
    const data = type === "object" ? {...formData} : [...formData];
    for (const key in data) {
        const result = data[key].resetValue
            ? initValidAndTouch(data[key], data[key].resetValue)
            : false;
        data[key] = {
            ...data[key],
            value: data[key].resetValue ?? "",
            valid: result,
            touched: result
        };
    }
    return data;
};

function common(entry: Input) {
    return {
        id: entry.id,
        name: entry.name ?? entry.id,
        type: "",
        value: "",
        valid: initValidAndTouch(entry),
        touched: initValidAndTouch(entry),
        placeholder: "",
        errorMessage: "",
        validating: false
    };
}

const setTrackingMatching = (entry: Input, matchKey: string[]) => {
    if (entry.validation?.__) {
        return [...new Set([...entry.validation.__, ...matchKey])];
    } else {
        return matchKey;
    }
};

const matchInputValidation = (
    state: ObjState,
    stateKey: string,
    matchOrCopyKey: StringOrMap,
    keyPath: keyof ValidationStateType
) => {
    const matchKey = getValue(matchOrCopyKey)
    /*
     * We create a match result with default value.
     * All matchKeys = [], lastMatched = current matchKey
     * validate: current MatchKey validate
     * */
    let matchResult: MatchResultType = {
        matchKeys: [],
        lastMatched: matchKey,
        validation: state[matchKey].validation
    };

    /*
     * We check if the matched input also match someone until find the last one who does have a match property
     * and use last not matched validate to match all input in the hierarchy.
     * We add __ for validate tool. See Class validate in ../validate.CheckMatch()
     * */
    try {
        matchResult = deepMatch(state, matchKey, keyPath);
    } catch (_) {
        throw Error(
            "It seems that we have infinite match here. Please make sure that the last matched or copied input does not match or copy anyone"
        );
    }

    /*
     * For every matched key , We set two properties.
     * - lastMatched input validate
     * - trackingMatching.
     * The input validate is the validate defined by the user (We just want to keep the match key of the user)
     * We add our result validate and for trackMatching, we put the current id,
     * all matchKeys found without the value itself and the last matched.
     * For example. if id match firstname and firstname match username and username match something,
     * the result of the matchKeys on id id are ["firstname", "username"] and lastMatched is something.
     * We loop through the result and set trackMatching to ["id",custom,"something"]
     * custom  = username if one of the result is firstname and firstname the one the result if username.
     * We don't want an input to match himself.
     *
     * For copy, we not add tracking, but we merge resultValidation with current validate
     * */
    matchResult.matchKeys.forEach((v) => {
        /* state[v] at first position for match and matchResult at first position for copy
         * therefore, we override everything on match and merge on copy
         * */
        state[v].validation = {
            ...(keyPath === "match"
                ? {
                    ...state[v].validation,
                    ...matchResult.validation,
                    __: setTrackingMatching(state[v], [
                        stateKey,
                        ...matchResult.matchKeys.filter((v) => v !== v),
                        matchResult.lastMatched
                    ])
                }
                : {
                    ...matchResult.validation,
                    ...state[v].validation
                })
        };
    });

    /*
     * trackMatching for the id itself is the result and the last matched
     * ["firstname","username","something"]. For copy, we not add tracking
     * but we merge resultValidation with current validate
     * */
    state[stateKey].validation = {
        ...matchResult.validation,
        ...(keyPath === "match"
            ? {
                match: matchOrCopyKey,
                __: setTrackingMatching(state[stateKey], [
                    ...matchResult.matchKeys,
                    matchResult.lastMatched
                ])
            }
            : {
                ...state[stateKey].validation,
                copy: matchOrCopyKey
            })
    };

    /*
     * trackMatching for the lastMatched is the id and result
     * ["id","firstname","username"]. For copy, we not add tracking
     * */
    state[matchResult.lastMatched].validation = {
        ...matchResult.validation,
        ...(keyPath === "match"
            ? {
                __: setTrackingMatching(state[matchResult.lastMatched], [
                    stateKey,
                    ...matchResult.matchKeys
                ])
            }
            : {})
    };

    return state;
};

/**
 * We check suspicious validate key and match key which is a typical scenario for password and confirm Password
 * The validate system for matched values need them to both have the validate options.
 * For example, a user enter
 * {
 *    password: {
 *      validate: {
 *        minLength: 4
 *      }
 *    },
 *    confirmPassword: {match: {validate: {match: "password"}}}
 * }.
 * We need to copy all validate from password and paste it to confirmPassword. We need also to add
 * match: "confirmPassword" to the password key. So the validate system can run the same validate of both id
 *
 */
const matchRules = (state: ObjState) => {
    let mappedState: ObjState = {...state};

    for (const stateKey in state) {
        if (stateKey in state) {
            // we save the error message because, custom validator can override them
            mappedState[stateKey].___ = state[stateKey].errorMessage;
            // We create an input key
            mappedState[stateKey].key = crypto.randomUUID();

            /*  We are trying to see
             *  for example if an input want to match its validate with another
             **/
            const copyKey = state[stateKey].validation?.copy;

            /* we check if validate and key to match exist else we throw error
             * For example, we check if state.confirmPassword.validate exists, and we check if matchKey
             * state.confirmPassword.validate.copy exists
             */
            if (state[stateKey].validation && copyKey) {
                mappedState = matchInputValidation(state, stateKey, copyKey, "copy");
            }

            /*  We get the key to match with, we are trying to see
             *  for example if confirmPassword want to match validate
             *  from password
             **/
            const matchKey = state[stateKey].validation?.match;

            /* we check if validate and key to match exist else we throw error
             * For example, we check if state.confirmPassword.validate exists, and we check if matchKey
             * state.confirmPassword.validate.match exists
             */
            if (state[stateKey].validation && matchKey) {
                mappedState = matchInputValidation(state, stateKey, matchKey, "match");
            }
        }
    }
    return {...mappedState};
};

const stateIsValid = (data: ObjState) => {
    let valid = true;
    for (const formKey in data) {
        valid = valid && (data[formKey].valid ?? true);
        if (!valid) {
            break;
        }
    }
    return valid;
};
const transform = (state: any, type: StateType) => {
    const result = type === "object" ? {} : ([] as any);
    for (const key in state) {
        if (type === "array") {
            result.push(state[key]);
        } else {
            result[state[key].id] = {
                ...state[key]
            };
        }
    }
    return result;
};

export {common, stateIsValid, resetState, matchRules, transform};
