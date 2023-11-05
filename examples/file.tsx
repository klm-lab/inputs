/* eslint-disable */
// @ts-nocheck
import { useInputs } from "aio-inputs";

// File input example 1
// Value is in files array
const FilesInputs1 = () => {
  const [inputs, form] = useInputs({
    photo: {
      type: "file",
      // Merge all uploaded files
      mergeChanges: true,
      multiple: true
    }
  });

  // To get the form value
  console.log(form.getValues());

  // To get the uploaded files
  console.log(inputs.photo.files);

  return (
    <div>
      <input type={inputs.photo.type} onChange={inputs.photo.onChange} />
      {inputs.photo.files.map((f) => {
        return (
          <div key={f.key}>
            <img src={f.url} onLoad={f.onLoad} alt={f.file.name} />
            <span onClick={f.selfRemove}>X</span>
          </div>
        );
      })}
    </div>
  );
};

// File input example 2
// Value is in files array
const FilesInputs12 = () => {
  const [inputs, form] = useInputs([
    {
      name: "photo",
      type: "file",
      // Merge all uploaded files
      mergeChanges: true,
      multiple: true
    },
    {
      name: "others",
      type: "file",
      // Merge all uploaded files
      mergeChanges: true,
      multiple: true
    }
  ]);

  // To get the form value
  console.log(form.getValues());

  // To get the uploaded files
  console.log(inputs[0].files);

  return (
    <div>
      {inputs.map((inp) => {
        return (
          <div key={inp.key}>
            <input type={inp.type} onChange={inp.onChange} />
            {inp.files.map((f) => {
              return (
                <div key={f.key}>
                  <img src={f.url} onLoad={f.onLoad} alt={f.file.name} />
                  <span onClick={f.selfRemove}>X</span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
