/* eslint-disable */
// @ts-nocheck
import { useInputs } from "aio-inputs";

// Checkbox input example.
// Value is an array of selected
const CheckboxInputs = () => {
  const [inputs, form] = useInputs([
    {
      name: "framework",
      value: "react",
      type: "checkbox"
    },
    {
      name: "framework",
      value: "vue",
      type: "checkbox"
    },
    {
      name: "framework",
      value: "angular",
      type: "checkbox"
    },
    {
      name: "framework",
      value: "svelte",
      type: "checkbox"
    }
  ]);

  console.log(form.getValues());
};
