import type {
  InputType,
  MatchResultType,
  ObjectInputStateType,
  ValidationClassResultType,
  ValidationResultType,
  ValidationStateType,
  ValuesType
} from "../../types";
import { updateErrorMessage, _UtilError } from "../error";

function validateEmail(email: string) {
  const re =
    /^(([^<>()\]\\.,;:\s@"]+(\.[^<>()\]\\.,;:\s@"]+)*)|(".+"))@(([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

function checkIfMatchKeyExists(
  state: InputType,
  target: string,
  matchKey: string
) {
  if (!(matchKey in state)) {
    throw _UtilError({
      name: "Validation Error",
      message: `'${matchKey}' does not exist in your state key`,
      stack: `${target}.validation.match = ${matchKey}`,
      state
    });
  }
}

class CheckDeepMatch {
  private matchKeys: string[] = [];
  private readonly state: InputType = {};
  private _lastMatched: string = "";
  private _result: MatchResultType = {
    matchKeys: [],
    lastMatched: this._lastMatched
  };

  constructor(state: InputType) {
    this.state = state;
  }

  get result(): MatchResultType {
    return this._result;
  }

  startMatching(matchKey: string, keyPath: keyof ValidationStateType) {
    if (
      typeof this.state[matchKey].validation !== "undefined" &&
      typeof this.state[matchKey].validation![keyPath] !== "undefined"
    ) {
      this.matchKeys.push(matchKey as string);
      const newMatchKey = this.state[matchKey].validation![keyPath];
      checkIfMatchKeyExists(this.state, matchKey, newMatchKey as string);
      this.startMatching(newMatchKey as string, keyPath);
    } else {
      this._lastMatched = matchKey;
      this._result = {
        lastMatched: this._lastMatched,
        matchKeys: this.matchKeys,
        validation: this.state[matchKey].validation
      };
    }
  }
}

class Validation {
  private readonly entry: ObjectInputStateType;
  private readonly state: InputType;
  private readonly target: string;
  private readonly rules: ValidationStateType;
  private readonly value: ValuesType = "";
  private isValid: boolean = true;
  private _result: ValidationClassResultType = {
    valid: this.isValid,
    errorMessage: ""
  };

  constructor(state: InputType, target: string, value: ValuesType) {
    if (typeof state[target] === "undefined") {
      throw _UtilError({
        name: "ValidationError",
        message: `Target is undefined`,
        state,
        stack: `state.${target} is undefined`
      });
    }
    this.state = state;
    this.target = target;
    this.entry = this.state[this.target];
    this.value = value;
    this.rules = this.entry.validation || {};
    this._result = {
      valid: this.isValid,
      errorMessage: this.entry.errorMessage as string
    };
  }

  get result(): ValidationResultType {
    return {
      ...this._result,
      validatedData: this.state
    };
  }

  validate() {
    this.checkRequired();
  }

  setResult(value: ValidationClassResultType) {
    if (this.entry.generateErrorMessage) {
      this._result = {
        ...value
      };
      return;
    }
    this._result = {
      valid: value.valid,
      errorMessage: this.entry.errorMessage as string
    };
  }

  private checkRequired() {
    if (
      typeof this.rules.required !== "undefined" &&
      typeof this.value === "string"
    ) {
      this.isValid = this.value.trim() !== "" && this.isValid;
    }
    if (!this.isValid) {
      this.setResult({
        valid: this.isValid,
        errorMessage: updateErrorMessage(this.entry, "est requise")
      });
      return;
    }
    this.checkMin();
  }

  private checkMin() {
    if (
      typeof this.rules.min !== "undefined" &&
      typeof this.value === "number"
    ) {
      this.isValid = this.value >= this.rules.min && this.isValid;
    }
    if (!this.isValid) {
      this.setResult({
        valid: this.isValid,
        errorMessage: updateErrorMessage(
          this.entry,
          `doit être supérieure ou égale à ${this.rules.min}`
        )
      });
      return;
    }
    this.checkMinLength();
  }

  private checkMinLength() {
    if (
      typeof this.rules.minLength !== "undefined" &&
      typeof this.value === "string"
    ) {
      this.isValid =
        this.value.trim().length >= this.rules.minLength && this.isValid;
    }
    if (!this.isValid) {
      this.setResult({
        valid: this.isValid,
        errorMessage: updateErrorMessage(
          this.entry,
          `doit avoir au minimum ${this.rules.minLength} caractères`
        )
      });
      return;
    }
    this.checkMinLengthWithoutSpace();
  }

  private checkMinLengthWithoutSpace() {
    if (
      typeof this.rules.minLengthWithoutSpace !== "undefined" &&
      typeof this.value === "string"
    ) {
      this.isValid =
        this.value.indexOf(" ") === -1 &&
        this.value.trim().length >= this.rules.minLengthWithoutSpace &&
        this.isValid;
    }
    if (!this.isValid) {
      this.setResult({
        valid: this.isValid,
        errorMessage: updateErrorMessage(
          this.entry,
          `doit avoir au minimum ${this.rules.minLengthWithoutSpace} caractères sans espaces`
        )
      });
      return;
    }
    this.checkMaxLength();
  }

  private checkMaxLength() {
    if (
      typeof this.rules.maxLength !== "undefined" &&
      typeof this.value === "string"
    ) {
      this.isValid =
        this.value.trim().length <= this.rules.maxLength && this.isValid;
    }
    if (!this.isValid) {
      this.setResult({
        valid: this.isValid,
        errorMessage: updateErrorMessage(
          this.entry,
          `doit avoir au maximum ${this.rules.maxLength} caractères`
        )
      });
      return;
    }
    this.checkMaxLengthWithoutSpace();
  }

  private checkMaxLengthWithoutSpace() {
    if (
      typeof this.rules.maxLengthWithoutSpace !== "undefined" &&
      typeof this.value === "string"
    ) {
      this.isValid =
        this.value.indexOf(" ") === -1 &&
        this.value.trim().length <= this.rules.maxLengthWithoutSpace &&
        this.isValid;
    }
    if (!this.isValid) {
      this.setResult({
        valid: this.isValid,
        errorMessage: updateErrorMessage(
          this.entry,
          `doit avoir au maximum ${this.rules.maxLengthWithoutSpace} caractères sans espaces`
        )
      });
      return;
    }
    this.checkMax();
  }

  private checkMax() {
    if (
      typeof this.rules.max !== "undefined" &&
      typeof this.value === "number"
    ) {
      this.isValid = this.value <= this.rules.max && this.isValid;
    }
    if (!this.isValid) {
      this.setResult({
        valid: this.isValid,
        errorMessage: updateErrorMessage(
          this.entry,
          `doit être inférieur ou égale à ${this.rules.max}`
        )
      });
      return;
    }
    this.checkNumber();
  }

  private checkNumber() {
    if (typeof this.rules.number !== "undefined") {
      this.isValid = typeof this.value === "number" && this.isValid;
    }
    if (!this.isValid) {
      this.setResult({
        valid: this.isValid,
        errorMessage: updateErrorMessage(this.entry, `doit être un nombre`)
      });
      return;
    }
    this.checkEmail();
  }

  private checkEmail() {
    if (
      typeof this.rules.email !== "undefined" &&
      typeof this.value === "string"
    ) {
      this.isValid = validateEmail(this.value) && this.isValid;
    }
    if (!this.isValid) {
      this.setResult({
        valid: this.isValid,
        errorMessage: updateErrorMessage(
          this.entry,
          `doit être un email valide`
        )
      });
      return;
    }
    this.checkStartWith();
  }

  private checkStartWith() {
    if (
      typeof this.rules?.startsWith !== "undefined" &&
      typeof this.value === "string"
    ) {
      this.isValid =
        this.value.length > 0 &&
        this.value.startsWith(this.rules.startsWith) &&
        this.isValid;
    }
    if (!this.isValid) {
      this.setResult({
        valid: this.isValid,
        errorMessage: updateErrorMessage(
          this.entry,
          `doit être commençer par ${this.rules.startsWith}`
        )
      });
      return;
    }
    this.checkStartEndWith();
  }

  private checkStartEndWith() {
    if (
      typeof this.rules?.endsWith !== "undefined" &&
      typeof this.value === "string"
    ) {
      this.isValid =
        this.value.length > 0 &&
        this.value.endsWith(this.rules.endsWith) &&
        this.isValid;
    }
    if (!this.isValid) {
      this.setResult({
        valid: this.isValid,
        errorMessage: updateErrorMessage(
          this.entry,
          `doit se terminer par ${this.rules.endsWith}`
        )
      });
      return;
    }
    this.checkEqualsTo();
  }

  private checkEqualsTo() {
    if (typeof this.rules?.equalsTo !== "undefined") {
      this.isValid = this.value === this.rules.equalsTo && this.isValid;
    }
    if (!this.isValid) {
      this.setResult({
        valid: this.isValid,
        errorMessage: updateErrorMessage(
          this.entry,
          `doit être égale à ${this.rules.equalsTo}`
        )
      });
      return;
    }
    this.checkRegex();
  }

  private checkRegex() {
    if (typeof this.rules.regex !== "undefined") {
      if (!((this.rules.regex as unknown) instanceof RegExp)) {
        throw _UtilError({
          name: "ValidationError",
          message: `Regex is a not a regex expression`,
          [this.target]: this.state[this.target],
          stack: `state.${this.target}.validation.regex = ${this.rules.regex}`
        });
      }

      this.isValid = this.rules.regex.test(this.value) && this.isValid;
    }
    if (!this.isValid) {
      this.setResult({
        valid: this.isValid,
        errorMessage: updateErrorMessage(this.entry, `est erronée`)
      });
      return;
    }
    this.checkCustom();
  }

  private checkCustom() {
    if (typeof this.rules.custom !== "undefined") {
      this.isValid = this.rules.custom(this.value);
    }
    if (!this.isValid) {
      this.setResult({
        valid: this.isValid,
        errorMessage: updateErrorMessage(this.entry, "comporte une erreur")
      });
      return;
    }
    this.checkMatch();
  }

  private checkMatch() {
    // we use trackingMatch instead of match because, it will allow us to revalidate all matched input
    if (typeof this.rules.trackingMatch !== "undefined") {
      /*  We get the match key here.
       * For example, if we are typing in password then matchKeys is confirmPassword
       * f we are typing in confirmPassword then matchKeys is password and so on
       */
      const matchKeys = this.rules.trackingMatch as string[];

      /*  We save the current valid value which comes from top functions with validation rules.*/
      let currentInputValidStatus = this.isValid;
      /*
       * We loop and check if typed value match all matched key value and break the loop.
       * But before breaking loop, we override the currentInputValidStatus status with the new one
       * */
      for (let i = 0; i < matchKeys.length; i++) {
        const m = matchKeys[i];
        // We validate only if input is touched
        if (this.state[m].touched) {
          /* we override the current valid status only if currentInputValidStatus  is true
           * and if this.value === this.state[m].value where m in one of matched key in loop.
           * If currentInputValidStatus === false, we revalidate current input find in the loop
           * with currentInputValidStatus, create an error message and break
           */
          currentInputValidStatus = this.value === this.state[m].value;
          // Revalidating current input find in the loop with currentInputValidStatus status
          this.state[m].valid = currentInputValidStatus;
          // currentInputValidStatus is false
          if (!currentInputValidStatus) {
            /*  We create error message based on matchKeys and set result */
            this.setResult({
              valid: currentInputValidStatus,
              errorMessage: updateErrorMessage(
                this.entry,
                `doit correspondre à la valeur ${this.state[m].label ?? m}`
              )
            });
            break;
          }
        }
      }
    }
  }
}

export { Validation, CheckDeepMatch, checkIfMatchKeyExists };
