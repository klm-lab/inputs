<br />
<div align="center">
<a href="https://github.com/klm-lab/store/#readme" target="_blank">
     <img src="assets/icon.svg" alt="icon" width="120" height="120">

</a>

![version][version-shield]
![size][size-shield]
![MIT License][license-shield]

<div>
<a align="center" href="https://codesandbox.io/s/inputs-demo-28ztx4" target="_blank">View demo</a>
</div>
</div>

# AIO-INPUTS

Input state management for React. It comes with useful common validations that are applied if you enabled them.<br>
It supports custom validation asynchronous or not, with dynamic error messages.<br/>

**ALL EXAMPLES 👉** [HERE][example-links]

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
const [input] = useInputs("name")
```

This gives you access to an input object with the following properties<br>
`input.touched`<br>
`input.valid`<br>
`input.value`<br>
`input.placeholder`<br>
`input.onChange`<br>
and many other ready-to-use properties listed here <a href="#input-properties">INPUT PROPERTIES</a>.

### Passing an array of string

Give you access to an array of inputs with ready-to-use properties listed here <a href="#input-properties">INPUT
PROPERTIES</a>.

```js
const [inputs] = useInputs(["name", "firstname"])
```

### Passing a mix of array of string and object

Useful when you want to keep validation on certain entries. For those who don't need validation, simply pass a
string.<br>
For example, name doesn't require validation, when another input does.

```js
const [inputs] = useInputs(["name", {validation: {minLength: 3}}])
```
You can also name your inputs with the `name` property

```js
const [inputs] = useInputs(["name", {name: "myInputName",validation: {minLength: 3}}])
```

For available properties, JUMP here <a href="#input-properties">INPUT PROPERTIES</a>.

### Passing an array of objects

```js
const [inputs] = useInputs([{}, {}])
```

Flow or Typescript user who want to define the inputs data in an external file, can import this built-in type for autocomplete support.

```js
import type {Input} from "aio-inputs";

const myInputsArray: Input[] = [{id: "", label: ""}] // and so on,

// Create your inputs
const [inputs] = useInputs(myInputsArray)
```

### Passing an object

Object that doesn't require validation.<br>

```js
const [inputs] = useInputs({name: {}, contact: {}})
```

Object with validation

```js
const [inputs] = useInputs(
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
const [input] = useInputs("name");

<input value={input.value}/>
```

More example with some validation rules. When you add validation don't forget to provide a general error message.<br>
An Error message, specific or not can be set as a string or map of string / object for internationalization support

* General error message as a string

```js
const [inputs] = useInputs({
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

const [inputs] = useInputs({
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
<span>{inputs.name.errorMessage[language]}</span>
```

Error message can also be specific to each validation.
> [!NOTE]<br>
> Specific error message has a priority on general error message.<br>
> If we found a specific error message, it will be used otherwise, we fall back to the general error message if it
> exists.

```js
// As a string
const [inputs] = useInputs({
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
const [inputs] = useInputs({
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
const [inputs] = useInputs({
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
const [inputs] = useInputs([
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

You can copy as many as you want as long as you comply with the above rule. Here for example, `username`
copy `firstname` who copy `name`, when `grandPa` copy `firstname` and so on . The order doesn't matter

```js
const [inputs] = useInputs({
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
const [inputs] = useInputs({
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
const [inputs] = useInputs({
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
const [inputs] = useInputs({
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
const [inputs] = useInputs({
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
const [inputs] = useInputs({
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

Your can handle change with `input.onChange`.It accepts event from native input or any custom value.

* **String update** <br>If you pass a string, handle change like this.

```js
const [input] = useInputs("name");

<input value={input.value} onChange={input.onChange}/>
```

* **Array of string update** <br>If you pass an array of string, handle change like this.

```js
const [inputs] = useInputs(["name", "firstname"]);

<div>
    {inputs.map((inp) => {
        return <input key={inp.key} value={inp.value} onChange={inp.onChange}/>
    })}
</div>
```

* **Object update** <br>If you pass an object, handle change like this.

```js
const [inputs] = useInputs({
    contact: {},
    description: {
        validation: {
            minLength: 10,
        }
    },
    extra: {},
});

const {description} = inputs;

<input value={description.value} onChange={description.onChange}/>
```

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
const [inputs] = useInputs({
    name: {
        validation: {
            //  setErrorMessage is optionnal. But you can use it to update the error message
            custom: (value, setErrorMessage) => {
                // we will give you the value entered by the user and a function to update the error message if you want
                // validate it like you want but at the end tell us if it is valid or not
                // After doing your validation
              
              // Update the errorMessage in Javascript,
              setErrorMessage(myErrorMessage)
              // Update the errorMessage in Typescript,
              // Since Set is an optionalprams, we need to tell typecript that it is not undefined by addin a `!`
              setErrorMessage!(myErrorMessage)
              
              return true
            }
        }
    }
})
```

* **Asynchronous custom validation**<br>
  Do not worry about multiple calls to the server. We make sure to call the server only when user stops typing.<br>
  By default we delay async request by `800` ms. But you can override that value in `useInputs` options. The type is number.

```js
const [inputs] = useInputs({
  name: {
    validation: {
      //  setErrorMessage is optionnal. But you can use it to update the error message
      asyncCustom: async (value, setErrorMessage) => {
        const r = await someting;
        !r.valid && setErrorMessage("Not available")
        return r.valid
      }
    }
  }
  // async delay value => 2000
}, {asyncDelay: 2000})
```

* **Asynchronous indicator**<br>
  You can show some loader when doing asynchronous validation.<br>
  For example, we want username to be unique, so we call our server to check if user choice is available or already taken.<br>
  You can use the `validating` property for that

```js

const [inputs] = useInputs({
  username: {
    validation: {
      asyncCustom: async (value) => {
        // some stuff
        return false
      }
    }
  }
})

// Later
inputs.username.validating && <span>Validating your username ....</span>
```

## IsValid

To know if all your inputs are valid, use the `isValid` property bound to your inputs.

```js
const [inputs] = useInputs(...)

const submit = () => {
    if (inputs.isValid) {
        // Submit
    }
}

<button className={inputs.isValid ? validClass : invalidClass} onClick={submit}>Submit</button>
```

## Form object

The form object is immutable. It will never change once created. You can safely use it in `useEffect`.<br>
In the `form` object, you have access to some useful properties. <br>
* `reset` let you reset a form when you successfully submit<br>
* `getValues` Return an object version of your inputs values.<br>
* `toObject` Return an object version of your inputs.
* `toArray` Return an array version of your inputs.
* `forEach` Loop through each input.
* `map` Loop through each input with return capabilities.
* `length` inputs length.


### Reset

```js
const [inputs, form] = useInputs(...)

// Reset your form
form.reset()
```
### ToArray

```js
const [myInputs, setMyInputs, form] = useInputs({...})


const myArrayFrom = form.toArray()
```

### ToObject
It is a good practice to always add an `id` to your inputs. The `id` property is used when you transform your inputs.
If `id` is not found, we use a generated one. So if you do not provide `id`, do a console.log(...) to see your transformed inputs.

```js
const [myInputs, setMyInputs, form] = useInputs([...])


const myObjectFrom = form.toObject()
```


### GetValues

`getValues` take an optional argument that match the `name` of your inputs to proper handle radio and checkbox if they are present<br>
>[!NOTE]<br>
> When using an array of string, Every string in that array is a `name`.<br>
> When the array contains object, the name is generated if not provided.<br>
> When using plain object, the name is the key of the object if not provided.<br>
> * In `useInputs("username")`, name is `username`
> * In `useInputs(["phone","age"])`, name are `phone` and `age`
> * In `useInputs(["phone",{validation: ...}])`, name are `phone` and a generated one
> * In `useInputs(["phone",{name: "age",validation: ...}])`, name are `phone` and `age`
> * In `useInputs({contact : {}})`, name is `contact`
> * In `useInputs({contact : {name: "customName"}})`, name is `customName`
 
Now get your values


```js
const [inputs, form] = useInputs(...)

const submit = () => {
    if (inputs.isValid) {
       const allValues = form.getValues();
       // Your stuff

      const photoValues = form.getValues("photo");
      // Your stuff

      const radioValues = form.getValues("radio");
      // Your stuff
    }
}

<button className={inputs.isValid ? validClass : invalidClass} onClick={submit}>Submit</button>
```

## Global Inputs

Useful if you want to Handle your inputs data step by step or access your inputs data outside a component. First import `trackInputs` and use it like below <br>.

### Setup trackID

Setup tracking id by calling `trackInputs` with an array of id.

```js
import {trackInputs} from "aio-inputs";

// Using ID STEP_1 and STEP_2
export const track = trackInputs(["STEP_1", "STEP_2"]);

const ComponentStep1 = () => {
    const [inputs] = useInputs(..., {trackID: track.STEP_1})
...
}

const ComponentStep2 = () => {
    const [inputs] = useInputs(..., {trackID: track.STEP_2})
...
}

```

### Add persistID

You can persist data on component unmount with a `persistID`.
> [!IMPORTANT]<br>
> `persistID` must be unique throughout your application, and must not change during the component's lifetime.<br>

```js

const ComponentStep1 = () => {
  const [inputs] = useInputs(..., {persistID: "ComponentStep1_ID"})
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

```

## Load data for edit

Use the `init` function of your inputs to load data for an edit.<br>
If your inputs contains a file, your need to specify the entryFormat plus some optional configurations.

### Configuration for a file (image etc...)
* `entryFormat` : required. type => `url` | `url[]`,
* `useDefaultProxyUrl`: Optional, type => `boolean`,
* `proxyUrl`: Optional, type => `string`,

When retrieving a blob from your url, if you see a cors error,<br>
set up a proxyUrl or use the default one `cors-anywhere.herokuapp.com` by setting `useDefaultProxyUrl` to true.<br>

**Look at this example 👉** [HERE][edit-link]

## Input properties

These are automatically added to your state when your call `useInputs`. You can override some of them.<br>
You can also add any custom property that fits your need

* `id` input id. `<-- overridable` as string
* `key` A crypto-based key for your input. `<-- not overridable`
* `name` Input name. `<-- overridable` as string.
* `type` Html input element type and `select` for select HtmlInputElement. `<-- overridable`
* `label` Input label. `<-- overridable` as string or ({en: "", fr: "", ...}).
* `value` Input value. `<-- overridable but will change on user input`, Can be an array if `multiple` is true
* `files` File Input files. `<-- not overridable`. Check his properties <a href="#files-properties">HERE</a>
* `checked` Input check state. `<-- overridable but will change on user input`, for radio and checkbox
* `multiple` File input multiple upload or multiple select. `<-- overridable`, as boolean
* `mergeChanges` If file input should merge uploaded files. `<-- overridable`, as boolean
* `valid` Tell you if input is valid or not. `<-- overridable but can change on user input based on validation`
* `touched` Tell you if input is touched or not. `<-- overridable but will change on user input`
* `placeholder` Input placeholder. `<-- overridable` as string or ({en: "", fr: "", ...}).
* `errorMessage` General error message when input is invalid. `<-- overridable` as string or ({en: "", fr: "", ...}).
* `validating` Tell you if an asynchronous validation is in processing state
* `asyncValidationFailed` Tell you if an asynchronous validation failed
* `validation` Validation options. See the validation properties <a href="#validation-properties">HERE</a> `<-- overridable`
* `onChange` Input changes handler `<-- not overridable`, take an Event<HtmlElement> or a value of your choice as argument
* `init` `<-- not overridable`, use this function to init your inputs with data for an edit for example. More <a href="#load-data-for-edit">HERE</a>


### Files properties
Files is an array of file with following properties

* `file` The original uploaded file. `<-- File`
* `url` An unique url to preview the file. `<-- string>`.
* `gettingFile` True is trying to retrieve a blob File from an url `<-- boolean>`.
* `key` A crypto-based key for the file `<-- string`
* `fileUpdate` This is where you place any update that happens on the file.(Edit on canvas and so on) `<-- any`
* `selfRemove` A function that remove the file. `<-- () => void`
* `selfUpdate` A function that update the file. `<-- (yourUpdate: any) => void`
* `onLoad` A function that revoke the file url after preview load. This happens only if no `persistID` is found. `<-- () => void`

### Validation properties

* `required` Make the value required. `<-- boolean`
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
* `custom` A function that must return a boolean. `<-- (value, setErrorMessage?) => boolean`.
* `asyncCustom` A function that must return a Promise<boolean>. `<-- (value, setErrorMessage?) => Promise<boolean>`.

### Validation properties with specific error message

* `required` Make the value required. `<-- {value: boolean, message: string or object }`
* `email` Treat the value as email `<-- {value: boolean, message: string or object }`
* `number` Treat the value as a number. `<-- {value: number, message: string or object }`
* `min` The minimum acceptable value. `<-- {value: number, message: string or object }`
* `max` The maximum acceptable value. `<-- {value: number, message: string or object }`
* `minLength` The minimum length of the value. `<-- {value: number, message: string or object }`
* `minLengthWithoutSpace` The minimum length of trimmed value with no space at all. `<-- {value: number, message: string or object }`
* `maxLength` The maximum length of the value. `<-- {value: number, message: string or object }`
* `maxLengthWithoutSpace` The maximum length of trimmed value with no space at all. `<-- {value: number, message: string or object }`
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

**ALL EXAMPLES 👉** [HERE][example-links]
## License

[MIT][license-url]


[size-shield]: https://img.shields.io/bundlephobia/minzip/aio-inputs/2.0.0?style=for-the-badge

[license-shield]: https://img.shields.io/github/license/klm-lab/inputs?style=for-the-badge

[version-shield]: https://img.shields.io/npm/v/aio-inputs?style=for-the-badge
[example-links]: https://github.com/klm-lab/inputs/tree/dev/examples#readme
[edit-link]: https://github.com/klm-lab/inputs/blob/dev/examples/edit.tsx


[license-url]: https://choosealicense.com/licenses/mit/
