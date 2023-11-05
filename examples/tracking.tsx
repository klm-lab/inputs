/* eslint-disable */
// @ts-nocheck
import { trackInputs, useInputs } from "aio-inputs";

const track = trackInputs(["STEP_1", "STEP_2"]);

const ComponentStep1 = () => {
  const [name] = useInputs("name", {
    trackID: track.STEP_1,
    persistID: "ComponentStep1_ID"
  });

  return <input value={name.value} onChange={name.onChange} />;
};

const ComponentStep2 = () => {
  const [inputs] = useInputs(["age", "gender"], {
    trackID: track.STEP_2,
    persistID: "ComponentStep2_ID"
  });

  return inputs.map((inp) => (
    <input key={inp.key} value={inp.value} onChange={inp.onChange} />
  ));
};

// Manage tracked data
const STEP_1_DATA = track.STEP_1.getValues();

const STEP_2_DATA = track.STEP_2.getValues();

// ❗Merge all inputs value into one Object, Use with caution
const ALL_DATA = track.getValues();

// Get valid status
const STEP_1_VALID = track.STEP_1.isValid();

const STEP_2_VALID = track.STEP_2.isValid();

const IS_ALL_VALID = track.isValid();

// Reset all inputs
track.reset();

// Reset values
track.STEP_1.reset();

track.STEP_2.reset();
