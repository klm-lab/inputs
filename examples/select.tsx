/* eslint-disable */
// @ts-nocheck
import { useInputs } from "aio-inputs";

// Select input example
const SelectInputs1 = () => {
  const [inputs] = useInputs({
    country: {
      type: "select",
      validation: {
        required: true
      }
    }
  });

  const { country } = inputs;

  return (
    <div>
      <select onChange={country.onChange}>
        <option value="Country 1">Country 1</option>
        <option value="Country 2">Country 2</option>
      </select>
    </div>
  );
};

// Custom Select input example
const CustomSelectInputs = () => {
  const [inputs] = useInputs({
    country: {
      type: "select",
      validation: {
        required: true
      }
    }
  });

  const { country } = inputs;

  return (
    <div>
      <div onClick={() => country.onChange("Country 1")}>Country 1</div>
      <div onClick={() => country.onChange("Country 2")}>Country 2</div>
    </div>
  );
};

// Multiple Select input example
const MultipleSelectInputs = () => {
  const [inputs] = useInputs({
    country: {
      type: "select",
      multiple: true,
      validation: {
        required: true
      }
    }
  });

  const { country } = inputs;

  return (
    <div>
      <select
        multiple={country.multiple}
        name={country.name}
        onChange={country.onChange}
      >
        <option value="Country 1">Country 1</option>
        <option value="Country 2">Country 2</option>
      </select>
    </div>
  );
};
