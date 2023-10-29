<br />
<div align="center">
<a href="https://github.com/klm-lab/store/#readme" target="_blank">
     <img src="assets/icon.svg" alt="icon" width="120" height="120">

</a>
<div>
<a align="center" href="https://codesandbox.io/s/inputs-demo-28ztx4" target="_blank">View demo</a>
</div>

![version][version-shield]
![dependencies][dependencies-shield]
![size][size-shield]
![MIT License][license-shield]

</div>

# AIO-INPUTS

Input state management for React. It comes with useful common validations that are applied if you enabled them.<br>
It supports custom validation asynchronous or not, with dynamic error messages.<br/>

## Installation

```sh
  npm install aio-inputs
  ```

<!-- USAGE EXAMPLES -->

## Usage

##### First import useInputs

```js
import {useInputs} from "aio-inputs";
```

There are five different ways to use it.

* **Passing a string**
* **Passing an array of string**.
* **Passing a mix of array of string and object**.
* **Passing an array of objects**.
* **Passing an object**.

### Passing a string

This is useful if you want a single input that doesn't require validation.

```js
const [input, setInput] = useInputs("name")
```

This gives you access to an input object with the following properties<br>
`input.touched`<br>
`input.valid`<br>
`input.value`<br>
`input.placeholder`<br>
and many other ready-to-use properties listed here <a href="#input-properties">INPUT PROPERTIES</a>.

### Passing an array of string

Give you access to an array of inputs with ready-to-use properties listed here <a href="#input-properties">INPUT
PROPERTIES</a>.

```js
const [input, setInput] = useInputs(["name", "firstname"])
```

### Passing a mix of array of string and object

Useful when you want to keep validation on certain entries. For those who don't need validation, simply pass a
string.<br>
For example, name doesn't require validation, when another input does.

```js
const [input, setInput] = useInputs(["name", {validation: {minLength: 3}}])
```
You can also name your inputs with the `name` property

```js
const [input, setInput] = useInputs(["name", {name: "myInputName",validation: {minLength: 3}}])
```

For available properties, JUMP here <a href="#input-properties">INPUT PROPERTIES</a>.

### Passing an array of objects

```js
const [input, setInput] = useInputs([{}, {}])
```

Flow or Typescript user who want to define the inputs data in an external file, can import this built-in type for autocomplete support.

```js
import type {Input} from "aio-inputs";

const myInputsArray: Input[] = [{id: "", label: ""}] // and so on,

// Create your inputs
const [inputs, setInputs] = useInputs(myInputsArray)
```

### Passing an object

Object that doesn't require validation.<br>

```js
const [input, setInput] = useInputs({name: {}, contact: {}})
```

Object with validation

```js
const [input, setInput] = useInputs(
    {
        name: {validation: {minLength: 3}},
        contact: {validation: {required: true}},
    }
)
```

JUMP here for all properties <a href="#input-properties">INPUT PROPERTIES</a>.

Flow or Typescript user who want to define the inputs data in an external file, can import this built-in type for autocomplete support.

```js
import type {ObjInput} from "aio-inputs";

const myInputsObject: ObjInput = {name: {id: "", label: ""}} // and so on,

// Create your inputs
const [inputs, setInputs] = useInputs(myInputsObject)
```

### Binding htmlInputElements

Let's bind some htmlInputElements to your input state. For example

```js
const [inputState, setInputState] = useInputs("name");

<input value={inputState.value}/>
```

More example with some validation rules. When you add validation don't forget to provide a general error message.<br>
An Error message, specific or not can be set as a string or map of string / object for internationalization support

* General error message as a string

```js
const [inputState, setInputState] = useInputs({
    name: {
        errorMessage: "my error message",
        validation: {
            minLength: 3
        }
    }
});
```

* General error message as object

```js
const language = getLanguageFromSomewhere()

const [inputState, setInputState] = useInputs({
    name: {
        errorMessage: {
            fr: "Some fr error",
            en: "Some en error"
        },
        validation: {
            minLength: 3
        }
    }
});
<span>{inputState.name.errorMessage[language]}</span>
```

Error message can also be specific to each validation.
> [!NOTE]<br>
> Specific error message has a priority on general error message.<br>
> If we found a specific error message, it will be used otherwise, we fall back to the general error message if it
> exists.

```js
// As a string
const [inputState, setInputState] = useInputs({
    name: {
        validation: {
            required: {
                message: "This field is required"
            },
            minLength: {
                value: 3,
                message: "At least 3 characters"
            }
        }
    }
});

// As an object
const [inputState, setInputState] = useInputs({
    name: {
        validation: {
            required: {
                message: {
                    fr: "Cette valeur est requise",
                    en: "This field is required"
                }
            },
            minLength: {
                value: 3,
                message: {
                    fr: "Au moins 3 caractères",
                    en: "At least 3 characters"
                }
            }
        }
    }
});
```

## Share validation

You can share validation rules across your inputs with the `copy` keyword.

* **With object as entry**

```js
const [inputState, setInputState] = useInputs({
    homePhone: {
        validation: {
            required: true,
            minLength: 10,
            startsWith: "+"
        }
    },
    officePhone: {
        validation: {
            copy: "homePhone",
            //... add those intended only for officePhone if you wish
        }
    }
});
```

* **With array as entry**

You need to provide `id` for the input you want to copy. Make sure it is unique otherwise, Same id on inputs merge those
inputs into one Input.<br>
ID need to be unique in the current component not in your app.<br>
`Component1 inputs => id => "test` ✅<br>
`Component2 inputs => id => "test` ✅<br>
`Component1 inputs => id => "test` ❌ <br>
`Component1 inputs => id => "test` ❌ <br>

```js
const [inputState, setInputState] = useInputs([
    {
        // id here
        id: "homePhone",
        validation: {
            required: true,
            minLength: 10,
            startsWith: "+"
        }
    },
    {
        validation: {
            // We copy
            copy: "homePhone",
            //... add those intended only for officePhone if you wish
        }
    }
]);
```

There is no limit when you copy validation. But you must follow one rule.<br>

> [!IMPORTANT]<br>
> He who is copied must not copy himself or one of those who copy him**

This is an example that leads to an infinite copy

```js
const [inputState, setInputState] = useInputs({
    homePhone: {
        validation: {
            required: true,
            minLength: 10,
            startsWith: "+",
            copy: "officePhone"
        }
    },
    officePhone: {
        validation: {
            regex: /..../,
            copy: "homePhone"
        }
    }
});
```

Here `officePhone` copy `homePhone` which copy `officePhone` and so on leading to an infinite copy.<br>
If you want `homePhone` to copy `regex` validation from `officePhone` while `officePhone` copy validation
from `homePhone`,<br>
you can do it that way because at the end, they will share same validation rules.

```js
const [inputState, setInputState] = useInputs({
    homePhone: {
        validation: {
            required: true,
            minLength: 10,
            startsWith: "+",
            // Move regex here
            regex: /.../,
        }
    },
    officePhone: {
        validation: {
            // we copy here
            copy: "homePhone"
        }
    }
});
```

You can copy as many as you want as long as you comply with the above rule. Here for example, `username`
copy `firstname` who copy `name`, when `grandPa` copy `firstname` and so on . The order doesn't matter

```js
const [inputState, setInputState] = useInputs({
    name: {
        validation: {
            required: true,
            minLength: 5,
            maxLength: 100
        }
    },
    firstname: {
        validation: {
            copy: "username"
        }
    },
    username: {
        validation: {
            copy: "name", // or copy name
            regex: /..../ // only for username
        }
    },
    grandPa: {
        validation: {
            copy: "firstname", // or copy name, it doesn't matter
        }
    }
});
```

You can also omit some validation from the copied one
```js
const [inputState, setInputState] = useInputs({
    name: {
        validation: {
            required: true,
            minLength: 5,
            maxLength: 100,
            startWith: "🤷‍♀️",
            custom: (value) => true
        }
    },
    firstname: {
        validation: {
            copy: {
              value: "name",
              omit: ["startsWith","custom"]
            }
        }
    },
});
```

`match` key works the same in a little different way. Instead of only copy validation, it makes sure that inputs share
the same validation and the same value.<br>
It is very useful for example password validation.<br>
>[!WARNING]<br>
> `match` gives priority to the last matched validation among matched inputs. This is the purpose of **matching**. (Share strictly the same validation).<br>
> But `match` allows you in case validation with specific errorMessage to override the errorMessage and only the errorMessage. Any value found when overriding the errorMessage will simply be ignored.

Let's take an example.

* **Ignored validation when using `match`**

```js
const [inputState, setInputState] = useInputs({
    password: {
        validation: {
            required: true,
            minLength: 8,
        }
    },
    confirmPassword: {
        validation: {
            match: "password",
          // ❌ Ignored
          otherValidation: ...
          // ❌ Ignored
          otherValidation: ...
          // ❌ Ignored
          otherValidation: ...
        }
    }
});
```
* **Overriding message when using `match`**

```js
const [inputState, setInputState] = useInputs({
    password: {
        errorMessage: "Differ from confirmation",
        validation: {
            required: {
              // Specific error message
                message: "The password is required"
            },
            minLength: {
                value: 8,
              // Specific error message
                message: "The password must have at least 8 characters"
            },
        }
    },
    confirmPassword: {
      errorMessage: "Differ from password",
        validation: {
            match: "password",
            required: {
              //✅ Overriding error message. Will be kept
              message: "Confirmation is required" 
            },
            minLength: {
               // ❌ Ignored
                value: 10,
              //✅ Overriding error message. Will be kept
              message: "Confirmation must have at least 8 characters"
            }
        }
    }
});
```

You can match as many as you want, as long as you comply with this rule.<br>

> [!IMPORTANT]<br>
> He who is matched must not match himself or one of those who matched him.

You cannot copy or match an input that doesn't exist. If you do so, you will get this error.<br>
`TypeError: Cannot read properties of undefined reading 'validation'`<br>

```js
const [inputState, setInputState] = useInputs({
    password: {
        validation: {
            required: true,
            minLength: 8,
        }
    },
    confirmPassword: {
        validation: {
            // ❌ We match something that doesn't exist
            match: "sdhslhdlhsdl"
        }
    }
});
```

> [!NOTE]<br>
> `copy` and `match` are basically the same. But copy gives priority to defined validation over copied validation.<br>
> `match` differs from `copy` by checking also if all matched inputs share the same value and strictly share the same validation rules except errorMessage.<br>
> It is important to understand the difference between them and use them accordingly

Common use case example with a custom error message for both inputs.

```js
const [inputState, setInputState] = useInputs({
    password: {
        errorMessage: "Differ from password confirmation",
        validation: {
            required: true,
            minLength: 8,
        }
    },
    confirmPassword: {
        // We keep this message for error on confirmPassword and share validation with password
        errorMessage: "Differ from password",
        validation: {
            match: "password"
        }
    }
});
```

## Handle input changes

* **String update** <br>If you pass a string, handle change like this, and we will take care of all other stuff

```js
const [inputState, setInputState] = useInputs("name");

<input value={inputState.value} onChange={(e) => setInputState(e.target.value)}/>
```

Just pass the value and you are done.

* **Array of string update** <br>If you pass an array of string, handle change like this, and we will take care of all
  other stuff

```js
const [inputState, setInputState] = useInputs(["name", "firstname"]);

<div>
    {inputState.map((input) => {
        return <input key={input.key} value={input.value} onChange={e => setInputState(input, e.target.value)}/>
    })}
</div>
```

Just pass the input and the value, and you are done.

* **Object update** <br>If you pass an object, handle change like this, and we will take care of all other stuff

```js
const [inputState, setInputState] = useInputs({
    contact: {},
    description: {
        validation: {
            minLength: 10,
        }
    },
    extra: {},
});

const {description} = inputState;

<input value={description.value} onChange={e => setInputState(description, e.target.value)}/>
```

Just pass the input you are updating and the value, and you are done.

If you are using object and do not want validation, Generate your inputs like this

```js
const [inputState, setInputState] = useInputs({
    name: {},
    optional: {},
    tag: {}
})
```

But if you really do not need validation, we recommend you to use the array instead. It is shorter.

```js
useInputs(["name", "optional", "tag"])
```

## Validation

Validation properties are listed here <a href="#input-properties">INPUT PROPERTIES</a>.<br>
But let's talk about a special one, **YOURS**. You can add a custom synchronous or asynchronous validation.<br>
And to do so, you need to follow one rule.
> [!IMPORTANT]<br>
> Your custom validation must return a boolean, `true` or `false`. Nothing else

* **Synchronous custom validation**

```js
const [myInputs, setMyInputs] = useInputs({
    name: {
        validation: {
            //  set is optionnal. But you can use it to update the error message
            custom: (value, set) => {
                // we will give you the value entered by the user and a function to update the error message if you want
                // validate it like you want but at the end tell us if it is valid or not
                // After doing your validation
              
              // Update the errorMessage in Javascript,
              set(myErrorMessage)
              // Update the errorMessage in Typescript,
              // Since Set is an optionalprams, we need to tell typecript that it is not undefined by addin a `!`
              set!(myErrorMessage)
              
              return true
            }
        }
    }
})
```

* **Asynchronous custom validation**<br>
  For performance purpose, you need to pass `async` property to `true`.
  Do not worry about multiple calls to the server. We make sure to call the server only when user stops typing.<br>
  By default we delay async request by `800` ms. But you can override that value by overriding, your inputs options in `useInputs`. The type is number.

```js
const [myInputs, setMyInputs] = useInputs({
    name: {
        validation: {
            async: true,
            //  set is optionnal. But you can use it to update the error message
            custom: async (value, set) => {
                const r = await someting;
                !r.valid && set("Not available")
                return r.valid
            }
        }
    }
    // async delay value => 2000
},{asyncDelay: 2000})
```

**What happen if I didn't set `async` property with custom asynchronous validation ?**<br>
Well, your custom asynchronous validation will not be triggered. Or if triggered, will be treated as a synchronous
function<br>
So, do not forget to set `async` to true when using asynchronous validation.
**What happen if I didn't set `asyncDelay` argument ?**<br>
The default value will be used. The default value is `800` ms

> [!NOTE]<br>
> Remove async property if your custom validation is not asynchronous, otherwise, you will notice a delay when
> validation occurs

* **Asynchronous custom validation with Promise**

```js
const [myInputs, setMyInputs] = useInputs({
    name: {
        validation: {
            async: true,
            custom: (value) => new Promise(resolve => {
                resolve(true)
            })
        }
    }
})
```

* **Asynchronous indicator**<br>
  You can show some loader when doing asynchronous validation.<br>
  For example, we want username to be unique, so we call our server to check if user choice is available or already taken.<br>
  You can use the `validating` property for that

```js

const [myInputs, setMyInputs, form] = useInputs({
    username: {
        validation: {
            async: true,
            custom: async (value) => {
                // some stuff
                return false
            }
        }
    }
})

// Later
myInputs.username.validating && <span>Validating your username ....</span>
```

## Form object

In the `form` object, you have access some useful properties. <br>

* `reset` let you reset a form when you successfully submit<br>
* `getValues` Return an object version of your inputs values.<br>
* `isValid` tell you if the whole form is valid, if all your inputs are valid<br>

### Reset

```js
const [myInputs, setMyInputs, form] = useInputs(...)

// Reset your form
form.reset()
```

### GetValues

```js
const [myInputs, setMyInputs, form] = useInputs(...)

const submit = () => {
    if (form.isValid) {
       const values = form.getValues();
       // Your stuff
    }
}

<button className={form.isValid ? validClass : invalidClass} onClick={submit}>Submit</button>
```

### IsValid

```js
const [myInputs, setMyInputs, form] = useInputs(...)

const submit = () => {
    if (form.isValid) {
        // Submit
    }
}

<button className={form.isValid ? validClass : invalidClass} onClick={submit}>Submit</button>
```

## Global Inputs

Useful if you want to Handle your inputs data step by step. First import `trackInputs` and use it like below <br>

### Setup trackID

Setup tracking id by calling `trackInputs` with an array of id.
>[!NOTE]<br>
> `trackID` doesn't need to be unique.

```js
import {trackInputs} from "aio-inputs";

// Using ID STEP_1 and STEP_2, export a track utility
export const track = trackInputs(["STEP_1","STEP_2","..."]);

const ComponentStep1 = () => {
  const [myInputs, setMyInputs] = useInputs(..., {trackID: track.STEP_1})
    
    return ...
}

const ComponentStep2 = () => {
  const [myInputs, setMyInputs] = useInputs(..., {trackID: track.STEP_2})

  return ...
}

```

### Add persistID

You can persist data on component unmount with a `persistID`.
>[!IMPORTANT]<br>
> `persistID` must be unique throughout your application, and must not change during the component's lifetime.<br>

```js
import {trackInputs} from "aio-inputs";

const ComponentStep1 = () => {
  const [myInputs, setMyInputs] = useInputs(..., {persistID: "ComponentStep1_ID"})
    
    return ...
}
```

### Manage tracked data

```js
// Import the track you created
import {track} from "someWhere";

// Get values
const STEP_1_DATA = track.STEP_1.getValues()

const STEP_2_DATA = track.STEP_2.getValues()

// ❗Merge all inputs value into one Object, Use with caution
const ALL_DATA = track.getValues()

// Get valid status
const STEP_1_VALID =  track.STEP_1.isValid()

const STEP_2_VALID =  track.STEP_2.isValid()

const IS_ALL_VALID = track.isValid();

// Reset all inputs
track.reset()

// Reset values
track.STEP_1.reset()

track.STEP_2.reset()

// Reset all inputs
track.reset()

```

## Input properties

These are automatically added to your state when your call `useInputs`. You can override their value by passing them.

* `id` input id. `<-- overridable` only if you deal with object as entry
* `key` A crypto-based key for your input. `<-- not overridable`
* `name` Input name. `<-- overridable` as string or ({en: "", fr: "", ...}).
* `type` Html input element type. `<-- overridable`
* `label` Input label. `<-- overridable` as string or ({en: "", fr: "", ...}).
* `value` Input value. `<-- overridable but will change on user input`
* `resetValue` The value to put when you reset the input. `<-- overridable`
* `valid` Tell you if input is valid or not. `<-- overridable but can change on user input based on validation`
* `touched` Tell you if input is touched or not. `<-- overridable but will change on user input`
* `placeholder` Input placeholder. `<-- overridable` as string or ({en: "", fr: "", ...}).
* `errorMessage` General error message when input is invalid. `<-- overridable` as string or ({en: "", fr: "", ...}).
* `validating` Tell you if an asynchronous validation is in processing state
* `validation` Validation options. See the validation properties <a href="#validation-properties">HERE</a> `<-- overridable`

### Validation properties

* `required` Make the value required. `<-- boolean`
* `async` Enable asynchronous validation. `<-- boolean`
* `email` Treat the value as email `<-- boolean`
* `number` Treat the value as a number. `<-- boolean`
* `min` The minimum acceptable value. `<-- number`
* `max` The maximum acceptable value. `<-- number`
* `minLength` The minimum length of the value. `<-- number`
* `minLengthWithoutSpace` The minimum length of trimmed value with no space at all. `<-- number`
* `maxLength` The maximum length of the value. `<-- number`
* `maxLengthWithoutSpace` The maximum length of trimmed value with no space at all. `<-- number`
* `match` The matched input name. `<-- string`
* `copy` The copied input name. `<-- string | {value: string, omit: (Validation properties)[]}`
* `startsWith` The input will start with that value. `<-- string`
* `endsWith` The input will end with that value. `<-- string`
* `regex` Your regex validation. `<-- regex`
* `custom` A function that return a boolean. `<-- (value, set) => boolean or Promise<boolean>`.

### Validation properties with specific error message

* `required` Make the value required. `<-- {value: boolean, message: string or object }`
* `email` Treat the value as email `<-- {value: boolean, message: string or object }`
* `number` Treat the value as a number. `<-- {value: number, message: string or object }`
* `min` The minimum acceptable value. `<-- {value: number, message: string or object }`
* `max` The maximum acceptable value. `<-- {value: number, message: string or object }`
* `minLength` The minimum length of the value. `<-- {value: number, message: string or object }`
* `minLengthWithoutSpace` The minimum length of trimmed value with no space at
  all. `<-- {value: number, message: string or object }`
* `maxLength` The maximum length of the value. `<-- {value: number, message: string or object }`
* `maxLengthWithoutSpace` The maximum length of trimmed value with no space at
  all. `<-- {value: number, message: string or object }`
* `startsWith` The input will start with that value. `<-- {value: string, message: string or object }`
* `endsWith` The input will end with that value. `<-- {value: string, message: string or object }`
* `regex` Your regex validation. `<-- {value: regex, message: string or object }`

#### In case of validation with specific message, if it is a boolean, you can omit the value.<br>

For example

```js
validation: {
    required: {
        message: "It is required"
    },
    email: {
        message: "Not a valid email"
    }
}
```

#### Not a boolean case,

```js
validation: {
    regex: {
        value: /my regex/
        message: "my error message based on regex"
    },
    endsWith: {
        value: "end"
        message: "Must end with end"
    }
}
```

## License

[MIT][license-url]


[size-shield]: https://img.shields.io/bundlephobia/minzip/aio-inputs/1.1.7?style=for-the-badge

[dependencies-shield]: https://img.shields.io/badge/dependencies-0-green?style=for-the-badge

[license-shield]: https://img.shields.io/github/license/klm-lab/inputs?style=for-the-badge

[version-shield]: https://img.shields.io/npm/v/aio-inputs?style=for-the-badge


[license-url]: https://choosealicense.com/licenses/mit/
