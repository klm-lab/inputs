/* eslint-disable */
// @ts-nocheck
import { useInputs } from "aio-inputs";

// Only one input with no validation
const OneInput = () => {
  const [name] = useInputs("name");

  return <input value={name.value} onChange={name.onChange} />;
};

// Array inputs with no validation
const ArrayInputsNoVal = () => {
  const [inputs] = useInputs(["name", "firstname"]);

  return inputs.map((inp) => (
    <input key={inp.key} value={inp.value} onChange={inp.onChange} />
  ));
};

// Object inputs with no validation
const ObjectInputs = () => {
  const [inputs] = useInputs({
    name: {},
    firstName: {}
  });

  const { name, firstname } = inputs;

  return (
    <>
      <input value={name.value} onChange={name.onChange} />
      <input value={firstname.value} onChange={firstname.onChange} />
    </>
  );
};

// Array inputs with validation
const ArrayInputs = () => {
  const [inputs] = useInputs([
    "name",
    {
      name: "firstname",
      errorMessage: "At least 3 char",
      validation: {
        minLength: 3
      }
    }
  ]);

  return (
    <div>
      {inputs.map((inp) => {
        return (
          <div key={inp.key}>
            <input value={inp.value} onChange={inp.onChange} />
            {inp.touched && !inp.valid && <span>{inp.errorMessage}</span>}
          </div>
        );
      })}
      <button disabled={!inputs.isValid}>Submit</button>
    </div>
  );
};

// Object inputs with validation
const ObjectInputs = () => {
  const [inputs] = useInputs({
    name: {
      errorMessage: "At least 3 char",
      validation: {
        minLength: 3
      }
    }
  });

  const { name } = inputs;

  return (
    <>
      <input value={name.value} onChange={name.onChange} />
      {name.touched && !name.valid && <span>{name.errorMessage}</span>}
      <button disabled={!inputs.isValid}>Submit</button>
    </>
  );
};

// Multiple Object inputs with validation
const ObjectInputs = () => {
  const [inputs, form] = useInputs({
    name: {
      errorMessage: "At least 3 char",
      validation: {
        minLength: 3
      }
    },
    contact: {
      validation: {
        required: {
          message: "Field required"
        }
      }
    }
  });

  return (
    <>
      {form.map((inp) => {
        return <input value={inp.value} onChange={inp.onChange} />;
      })}
      <button disabled={!inputs.isValid}>Submit</button>
    </>
  );
};

// Multiple validation and specific errorMessage
const ArrayInputs = () => {
  const [inputs] = useInputs([
    {
      name: "name",
      validation: {
        minLength: {
          message: "Name must have at least 3 char",
          value: 3
        }
      }
    },
    {
      name: "firstname",
      validation: {
        maxLength: {
          message: "firstname must have a max of 9 char",
          value: 9
        }
      }
    }
  ]);
};

// Password example
const PasswordInputs = () => {
  const [inputs] = useInputs([
    {
      id: "password",
      name: "password",
      errorMessage: "Must match the confirmation",
      validation: {
        minLength: {
          message: "Your password must have at least 8 char",
          value: 8
        }
      }
    },
    {
      name: "confirmPassword",
      errorMessage: "Must match the password",
      validation: {
        maxLength: {
          match: "password"
        }
      }
    }
  ]);
};

// Sharing validation example
const SharingInputs = () => {
  const [inputs] = useInputs([
    {
      id: "name",
      name: "name",
      validation: {
        minLength: {
          message: "Must have at least 3 char",
          value: 3
        },
        maxLength: {
          message: "Must have a max of 100 char",
          value: 100
        }
      }
    },
    {
      name: "firstname",
      validation: {
        copy: "name"
      }
    },
    {
      name: "username",
      validation: {
        copy: {
          value: "name",
          omit: ["maxLength"]
        },
        asyncCustom: async (value) => true
      }
    }
  ]);
};
