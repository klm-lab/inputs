import { createInputs } from "../index";
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

// create the connection with input store
const connect = (computed: Computed) => {
  // st => store
  // cp => computedForm methods (forEach, map, get etc...)
  // a => isArray
  const { st, cp, a } = computed;
  // i => inputs
  // iv => initial valid state
  // t => any inputs isTouched
  const { i, iv, t } = st();
  const parsedInputs = a ? transformToArray(i) : i;
  (parsedInputs as typeof parsedInputs & IsValid).isValid = iv;
  (parsedInputs as typeof parsedInputs & IsValid).isTouched = t;
  return [parsedInputs, cp];
};

const useInputs: InputsHook = (
  initialState: Unknown,
  config: InputConfig = {}
): Unknown => {
  return connect(useMemo(() => createInputs(initialState, config), []));
};
const trackInputs: TrackInputs = (
  initialState: Unknown,
  config: InputConfig = {}
): Unknown => {
  const computed = createInputs(initialState, config);
  // external hook with form properties
  const h = () => connect(computed);
  const { cp, uv, iv } = computed;
  for (const key in cp) {
    (h as Unknown)[key] = (cp as Unknown)[key];
  }
  (h as Unknown).useValues = uv;
  (h as Unknown).isValid = iv;
  return h;
};

export { useInputs, trackInputs };
