import type { ErrorMessageType, ObjState, ValidationStateType } from "../types";

class H {
  get a(): { [k in string]: any } {
    return this._a;
  }

  set a(value: { [k in string]: any }) {
    this._a = value;
  }

  get tm(): { [k in string]: string[] } {
    return this._tm;
  }

  set tm(value: { [k in string]: string[] }) {
    this._tm = value;
  }

  get em(): { [k in string]: ErrorMessageType | undefined } {
    return this._em;
  }

  set em(value: { [k in string]: ErrorMessageType | undefined }) {
    this._em = value;
  }

  get s(): ObjState {
    return this._s;
  }

  set s(value: ObjState) {
    this._s = value;
  }

  get ok(): { [k in string]: Set<keyof ValidationStateType> } {
    return this._ok;
  }

  set ok(value: { [k in string]: Set<keyof ValidationStateType> }) {
    this._ok = value;
  }
  // Omitted keys
  private _ok: { [k in string]: Set<keyof ValidationStateType> };
  // Saved error message
  private _em: { [k in string]: ErrorMessageType | undefined };
  // tracking matching
  private _tm: { [k in string]: string[] };
  // cloned state
  private _s: ObjState;
  // async custom throttle
  private _a: { [k in string]: any };

  constructor() {
    this._ok = {};
    this._s = {};
    this._em = {};
    this._tm = {};
    this._a = {};
  }

  clean(s: ObjState) {
    this.ok = {};
    this.s = {};
    for (const sKey in s) {
      delete s[sKey].validation?.copy;
      delete s[sKey].validation?.match;
    }
    return s;
  }
}

export { H };
