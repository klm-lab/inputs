import type {
  ForEachCallback,
  IDTrackUtil,
  MapCallback,
  TrackUtil
} from "../types";
import { O } from "../util";

const TRACKING_KEYS = O.freeze([
  "getValues",
  "reset",
  "isValid",
  "toArray",
  "toObject",
  "forEach",
  "map",
  "length",
  "useValues"
]);

export const trackInputs = <S extends string>(trackingID: S[]) => {
  const track = {} as any;
  trackingID.forEach((a) => {
    track[a] = {
      ID: a
    };
  });

  track.length = () => {
    let l = 0;
    for (const t in track) {
      if (!TRACKING_KEYS.includes(t) && track[t] && track[t].length) {
        l += track[t].length;
      }
    }
    return l;
  };

  track.toArray = () => {
    const arr = [] as any;
    for (const t in track) {
      if (!TRACKING_KEYS.includes(t) && track[t] && track[t].toArray) {
        arr.push(...track[t].toArray());
      }
    }
    return arr;
  };

  ["getValues", "toObject", "useValues"].forEach((func) => {
    track[func] = () => {
      let result = {} as any;
      for (const t in track) {
        if (!TRACKING_KEYS.includes(t) && track[t] && track[t][func]) {
          result = {
            ...result,
            ...track[t][func]()
          };
        }
      }
      return result;
    };
  });

  ["forEach", "map"].forEach((func) => {
    track[func] = (callback: ForEachCallback | MapCallback) => {
      for (const t in track) {
        if (!TRACKING_KEYS.includes(t) && track[t] && track[t][func]) {
          return track[t][func](callback);
        }
      }
    };
  });

  track.reset = () => {
    for (const t in track) {
      if (!TRACKING_KEYS.includes(t) && track[t] && track[t].reset) {
        track[t].reset();
      }
    }
  };

  track.isValid = () => {
    let isValid = true;
    for (const t in track) {
      if (!TRACKING_KEYS.includes(t) && track[t] && track[t].isValid) {
        isValid = isValid && track[t].isValid();
      }
    }
    return isValid;
  };

  return track as TrackUtil & { [k in S]: IDTrackUtil<S> };
};
