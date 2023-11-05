/* eslint-disable */
// @ts-nocheck
import { useInputs } from "aio-inputs";

// Radio input example
const RadioInputs = () => {
  const [inputs, form] = useInputs([
    {
      name: "framework",
      value: "react",
      type: "radio"
    },
    {
      name: "framework",
      value: "vue",
      type: "radio"
    },
    {
      name: "framework",
      value: "angular",
      type: "radio"
    },
    {
      name: "framework",
      value: "svelte",
      type: "radio"
    }
  ]);

  console.log(form.getValues());
};
