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
import { useInputs } from "aio-inputs";
```

There are five different ways to use it.
* **Passing a string**
* **Passing an array of string**.
* **Passing a mix of array of string and object**.
* **Passing an array of objects**.
* **Passing an object**.


### String
This is useful if you want a single input that doesn't require validation.
```js
const [input,setInput] = useInputs("name")
```
This gives you access to an input object with the following properties<br>
`input.valid`<br>
`input.value`<br>
`input.placeholder`<br>
`input.id` which is `name` because you type **name**<br>
and many other ready-to-use properties listed here <a href="#input-properties">INPUT PROPERTIES</a>.


### Array of string
Give you access to an array of inputs with ready-to-use properties listed here <a href="#input-properties">INPUT PROPERTIES</a>.
```js
const [input,setInput] = useInputs(["name","firstname"])
```
### Mix of array of string and object
Useful when you want to keep validation on certain entries. For those who don't need validation, simply pass a string.<br>
For example, name doesn't require validation, when firstName does.

```js
const [input, setInput] = useInputs(["name", {validation: {minLength: 3} }])
```
You can also add an id to your inputs
```js
const [input, setInput] = useInputs(["name", {id: "firstname", validation: {minLength: 3} }])
```
For available properties, JUMP here <a href="#input-properties">INPUT PROPERTIES</a>.

### Array of objects

```js
const [input, setInput] = useInputs([{ id: "name" }, { id: "firstname" }])
```

### Object
Object that doesn't require validation
```js
const [input,setInput] = useInputs({name: {},firstname: {}})
```
Object with validation
```js
const [input,setInput] = useInputs({name: {validation : {required: true}}})
```
JUMP here for all properties <a href="#input-properties">INPUT PROPERTIES</a>.

### Binding htmlInputElements
Now you are ready to bind some htmlInputElements to your input state. For example
```js
const [inputState,setInputState] = useInputs("name");
         
<div>
  <input value={inputState.value}/>
</div>;
```
More example with some validation rules. When you add validation don't forget to provide a general error message.<br>
Error message, specific or not can be set as a string or map of string / object for internationalization support
* General error message as a string
```js
const [inputState,setInputState] = useInputs({
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

const [inputState,setInputState] = useInputs({
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
>![NOTE]<br>
> Specific error message has a priority on general error message.<br> If we found a specific error message, it will be used otherwise, we fall back to the general error message if it exists
```js
// As a string
const [inputState,setInputState] = useInputs({
  name: {
    validation: {
        required: {
            message: "This fied is required"
        },
        minLength: {
          value: 3,
          message: "At least 3 characters"
        }
    }
  }
});

// As an object
const [inputState,setInputState] = useInputs({
  name: {
    validation: {
        required: {
            message: {
                fr: "Cette valeur est requise",
                en: "This fied is required"
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
 * With object as entry

```js
const [inputState,setInputState] = useInputs({
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
* With array as entry

You need to provide `id` for the input you want to copy
```js
const [inputState,setInputState] = useInputs([
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
### ❗ He who is copied must not copy himself or one of those who copy him**
This is an example that leads to an infinite copy
```js
const [inputState,setInputState] = useInputs({
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
If you want `homePhone` to copy `regex` validation from `officePhone` while `officePhone` copy validation from `homePhone`,<br>
you can do it that way because at the end, they will share same validation rules.

```js
const [inputState,setInputState] = useInputs({
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
You can copy as many as you want as long as you comply with the above rule. Here for example, `username` copy `firstname` who copy `name`
```js
const [inputState,setInputState] = useInputs({
  name: {
    validation: {
      required: true,
      minLength: 5,
      maxLength: 100
    }
  },
  firstname: {
    validation: {
      copy: "name"
    }
  },
  username: {
    validation: {
      copy: "firstname", // or copy name, it doesn't matter
      regex: /..../ // only for username
    }
  }
});
```

`match` key works the same in a little different way. Instead of only coping validation, it makes sure that inputs share the same validation and the same value.<br>
It is very useful for example password validation.
```js
const [inputState,setInputState] = useInputs({
  password: {
    validation: {
      required: true,
      minLength: 8,
    }
  },
  confirmPassword: {
    validation: {
      match: "password"
    }
  }
});
```
You can match as many as you want, as long as you comply with the above rule.<br>
Let me remember it for you <br>
### ❗ He who is matched must not match himself or one of those who match him**

>![WARNING]<br>
> You cannot copy or match an input that doesn't exist. If you do so, you will get this error
> 
>`TypeError: Cannot read properties of undefined reading 'validation'`<br>

```js
const [inputState,setInputState] = useInputs({
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

## Handle input changes

* **String update** <br>If you pass a string, handle change like this, and we will take care of all other stuff
```js
const [inputState,setInputState] = useInputs("name");

<input value={inputState.value} onChange={(e)=> setInputState(e.target.value)}/>
```
Just pass the value and you are done.

* **Array of string update** <br>If you pass an array of string, handle change like this, and we will take care of all other stuff
```js
const [inputState,setInputState] = useInputs(["name","firstname"]);

<div>
  {inputState.map((input) => {
    return <input key={input.key} value={input.value} onChange={e=> setInputState(input,e.target.value)}/>
  })}
</div>
```
Just pass the input and the value, and you are done.
* **Object update** <br>If you pass an object, handle change like this, and we will take care of all other stuff
```js
const [inputState,setInputState] = useInputs({
  contact: {},
  description: {
    validation: {
      minLength: 10,
    }
  },
  extra: {},
});

const {description} = inputState;

<input value={description.value} onChange={e=> setInputState(description,e.target.value)}/>
```
Just pass the input and the value, and you are done.

If you are using object and do not want validation, Generate your input like this
```js
const [inputState,setInputState] = useInputs({
  name: {},
  optional: {},
  tag: {}
})
```
But if you really do not need validation, we recommend you to use the array instead. It is shorter.
```js
useInputs(["name","optional","tag"])
```

## Validation 
Validation properties are listed here <a href="#input-properties">INPUT PROPERTIES</a>.<br>
But let's talk about a special one, **YOURS**. You can add a custom synchronous or asynchronous validation.<br>
And to do so, you need to follow one rule.
>![IMPORTANT]<br>
> Your custom validation must return a boolean, `true` or `false`. Nothing else

* Synchronous custom validation
```js
const [myInputs,setMyInputs] = useInputs({
  name: {
    validation: {
      //  setErrorMessage is optionnal. But you can use it to update the error message
      custom: (value,setErrorMessage) => {
        // we will give you the value entered by the user and a function to update the error message if you want
        // validate it like you want but at the end tell us if it is valid or not
        // After doing your validation
        return true or false
      }
    }
  }
})
```

* Asynchronous custom validation<br>
For performance purpose, you need to pass `async` property to `true`.
Do not worry about multiple calls to the server. We make sure to call the server only when user stops typing.

```js
const [myInputs,setMyInputs] = useInputs({
  name: {
    validation: {
        async: true,
      //  setErrorMessage is optionnal. But you can use it to update the error message
        custom: async (value, setErrorMessage) => {
            await someting
            return true or false
        }
    }
  }
})
```
**What happen if I didn't set `async` property with custom asynchronous validation ?**<br>
Well, your custom asynchronous validation will not be triggered. Or if triggered, will be treated as a synchronous function<br>
So, do not forget to set `async` to true when using asynchronous validation

* Asynchronous custom validation with Promise
```js
const [myInputs,setMyInputs] = useInputs({
  name: {
    validation: {
        async: true,
      //  setErrorMessage is optionnal. But you can use it to update the error message
        custom: (value,setErrorMessage) => new Promise(resolve => {
        // we will give the value entered by the user.
        // validation it like you want but at the end tell us if it is valid or not
        // After doing your validation
            resolve(true or false)
        })
    }
  }
})
```

* Asynchronous indicator<br>
You can show some loader when doing asynchronous validation.<br>
For example, we want username to be unique, so we call our server to check if user choice is available or already taken.<br>
you can use the `validating` property for that
```js

const [myInputs, setMyInputs, form] = useInputs({
  username: {
    validation: {
        async: true,
        custom: async (value) => {
            return true or false
        }
    }
  }
})

{myInputs.username.validating && <span>Validating your username ....</span>}
```
## Form object
In the `form` object, you have access to a `reset` method and a `isValid` property. <br>
 * `reset` let you reset a form when you successfully submit<br>
 * `isValid` tell you if the whole form is valid, if all your inputs are valid<br>


### Reset
```js
const [myInputs,setMyInputs,form] = useInputs(...)

// Reset your form
form.reset()
```
### isValid
```js
const [myInputs, setMyInputs, form] = useInputs(...)

const submit = () => {
    if(form.isValid) {
     // Submit
    }
}

<button className={form.isValid ? validClass : invalidClass} onClick={submit}>Submit</button>
```

## Input properties

These are automatically added to your state when your call `useInputs`. You can override their value by passing them. Except two internal used keys
`__`, `___`. Those keys are used internally. You can't override them

* `type` Html input element type. `<-- overridable`
* `label` Input label. `<-- overridable`
* `value` Input value. `<-- overridable but will change on user input`
* `resetValue` The value to put when you reset the input. `<-- overridable`
* `valid` Tell you if input is valid or not. `<-- overridable but can change on user input based on validation`
* `touched` Tell you if input is touched or not. `<-- overridable but will change on user input`
* `placeholder` Input placeholder. `<-- overridable`
* `errorMessage` General error message when input is invalid. `<-- overridable`
* `validating` Tell you if an asynchronous validation in processing state `<-- overridable but will change when processing an asynchronous validation`
* `validation` Validation options. See the validation properties <a href="#validation-properties">HERE</a> `<-- overridable`
* `__` Internal key. `<-- not overridable`
* `___` Internal key. `<-- not overridable`


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
* `copy` The copied input name. `<-- string`
* `startsWith` The input will start with that value. `<-- string`
* `endsWith` The input will end with that value. `<-- string`
* `equalsTo` The input will be strictly equal to that value. `<-- any`
* `regex` Your regex validation. `<-- regex`
* `custom` A function that return a boolean. `<-- (value, setErrorMessage) => boolean or Promise<boolean>`.

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
* `equalsTo` The input will be strictly equal to that value. `<-- {value: any, message: string or object }`
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
        message: "Must en with end"
    }
}
```

## License

[MIT][license-url]


[size-shield]: https://img.shields.io/bundlephobia/minzip/aio-inputs/2.4.0?style=for-the-badge
[dependencies-shield]: https://img.shields.io/badge/dependencies-0-green?style=for-the-badge
[license-shield]: https://img.shields.io/github/license/klm-lab/store?style=for-the-badge
[version-shield]: https://img.shields.io/npm/v/aio-inputs?style=for-the-badge


[license-url]: https://choosealicense.com/licenses/mit/
