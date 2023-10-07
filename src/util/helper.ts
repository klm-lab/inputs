import type { ErrorMessageType, ObjState, ValidationStateType } from "../types";

class Helper {
  get asyncId(): { [k in string]: any } {
    return this._asyncId;
  }

  set asyncId(value: { [k in string]: any }) {
    this._asyncId = value;
  }

  get trackingMatch(): { [k in string]: string[] } {
    return this._trackingMatch;
  }

  set trackingMatch(value: { [k in string]: string[] }) {
    this._trackingMatch = value;
  }

  get errorMessage(): { [k in string]: ErrorMessageType | undefined } {
    return this._errorMessage;
  }

  set errorMessage(value: { [k in string]: ErrorMessageType | undefined }) {
    this._errorMessage = value;
  }

  get state(): ObjState {
    return this._state;
  }

  set state(value: ObjState) {
    this._state = value;
  }

  get omittedKeys(): { [k in string]: Set<keyof ValidationStateType> } {
    return this._omittedKeys;
  }

  set omittedKeys(value: { [k in string]: Set<keyof ValidationStateType> }) {
    this._omittedKeys = value;
  }

  private _omittedKeys: { [k in string]: Set<keyof ValidationStateType> };
  private _errorMessage: { [k in string]: ErrorMessageType | undefined };
  private _trackingMatch: { [k in string]: string[] };
  private _state: ObjState;
  private _asyncId: { [k in string]: any };

  constructor() {
    this._omittedKeys = {};
    this._state = {};
    this._errorMessage = {};
    this._trackingMatch = {};
    this._asyncId = {};
  }

  clean(s: ObjState) {
    this.omittedKeys = {};
    this.state = {};
    for (const sKey in s) {
      delete s[sKey].validation?.copy;
      delete s[sKey].validation?.match;
    }
    return s;
  }
}

export { Helper };
