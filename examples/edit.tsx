/* eslint-disable */
// @ts-nocheck
import { useInputs } from "aio-inputs";
import { useEffect } from "react"; // Edit input example.

// Edit input example.

const dataFromServer = {
  subject: "Test",
  chosenColor: "color",
  frameworks: ["react", "vue", "angular"],
  avatar: "https://link.to/avatar.jpg",
  otherPic: ["https://link.to/pic1.jpg", "https://link.to/pic2.jpg"],
  age: 18,
  country: "country",
  multipleSelect: ["v1", "v2"]
};

// This example is valid when the name of your inputs matches the key of the dataFromServer

const Inputs1 = () => {
  const [inputs, form] = useInputs([
    {
      name: "subject",
      errorMessage: "required",
      validation: {
        required: true
      }
    },
    {
      name: "age",
      errorMessage: "Min 18 years old",
      validation: {
        min: 18
      }
    },
    // radio
    {
      name: "chosenColor",
      value: "color",
      type: "radio"
    },
    {
      name: "chosenColor",
      value: "color1",
      type: "radio"
    },
    // Checkbox
    {
      name: "frameworks",
      value: "react",
      type: "checkbox"
    },
    {
      name: "frameworks",
      value: "vue",
      type: "checkbox"
    },
    {
      name: "frameworks",
      value: "angular",
      type: "checkbox"
    },
    //country
    {
      name: "country",
      type: "select"
    },
    //multiple Select
    {
      name: "multipleSelect",
      type: "select",
      multiple: true
    },
    // avatar
    {
      name: "avatar",
      type: "file"
    },
    // Other pics
    {
      name: "otherPic",
      type: "file",
      multiple: true
    }
  ]);

  useEffect(() => {
    // Load your data for edit.
    // This example is valid when the name of your inputs matches the key of the dataFromServer
    form.forEach((inp) => {
      // ✅ No files (images etc...) in your inputs
      inp.init(dataFromServer[inp.name]);

      // ✅ Files (images etc...) in your inputs with an url like avatar
      inp.init(dataFromServer[inp.name], { entryFormat: "url" });

      // ✅ Files (images etc...) in your inputs with an array of url
      inp.init(dataFromServer[inp.name], { entryFormat: "url[]" });

      // ✅ Files (images etc...) in your inputs with proxyUrl to fix cors origin while retrieving blob file for edit
      // DefaultProxyUrl is "cors-anywhere.herokuapp.com"
      inp.init(dataFromServer[inp.name], { useDefaultProxyUrl: true });

      // ✅ Custom proxyUrl
      inp.init(dataFromServer[inp.name], { proxyUrl: true });
    });
  }, [form]);

  // render your inputs
};
