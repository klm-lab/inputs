import { compute } from "../index";
import type {
  Computed,
  InputConfig,
  InputsHook,
  IsValid,
  TrackInputs,
  Unknown
} from "../../types";
import { useMemo } from "react";
import { transformToArray } from "../../util";

const next = (computed: Computed) => {
  const { st, cp, a } = computed;
  const { i, iv } = st();
  const parsedInputs = a ? transformToArray(i) : i;
  (parsedInputs as typeof parsedInputs & IsValid).isValid = iv;
  return [parsedInputs, cp];
};

const useInputs: InputsHook = (
  initialState: Unknown,
  config: InputConfig = {}
): Unknown => {
  return next(useMemo(() => compute(initialState, config), []));
};
const trackInputs: TrackInputs = (
  initialState: Unknown,
  config: InputConfig = {}
): Unknown => {
  const computed = compute(initialState, config);
  const h = () => next(computed);
  const { cp, uv, iv } = computed;
  for (const key in cp) {
    (h as Unknown)[key] = (cp as Unknown)[key];
  }
  (h as Unknown).useValues = uv;
  (h as Unknown).isValid = iv;
  return h;
};

export { useInputs, trackInputs };
