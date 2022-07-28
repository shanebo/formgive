# Select
<select name="foo">
  <option value="foo">label</option>
  <option value="foo2" selected>label</option>
</select>

# Input type = text, email, url, ...
<input name="foo" value="value">

# Input type = checkbox, radio
<input type="checkbox" name="foo" value="value" checked>

<input type="checkbox" name="foo" value="uno">
<input type="checkbox" name="foo" value="dos" checked>
<input type="checkbox" name="foo" value="tres" checked>

<input type="radio" name="foo" value="uno">
<input type="radio" name="foo" value="dos" checked>
<input type="radio" name="foo" value="tres">

{
  _type: 'checkbox',
  _label: 'Foo',
  _attributes: {
    type: 'checkbox' || 'radio',
    checked: false,
    name: 'foo',
    id: 'foo',
    value: 'uno',
    tabindex: '0'
  }
}


# Textarea
<textarea name="foo">content</textarea>

# datalist
needs research

# radiogroup || multiselect (via checkboxes with same name attrs)





We need a hook to communicate the type of field
- input:text
- input:url
- input:checkbox
- input:radio
- select




{
  _type: 'checkbox',
  _attributes: {
    type: 'checkbox',
    checked: false,
    name: 'foo',
    id: 'foo',
    value: 'uno',
    tabindex: '0'
  }
}



elements = input, select, datalist, textarea
element type = checkbox, text, radio



{
  gender: {
    _input: 'select',
    _options: [
      ... grab an option structure and hydrate with these below options
      {
        label: 'Male',
        value: 'MALE'
      },
      {
        label: 'Female',
        value: 'FEMALE'
      },
      {
        label: 'Unknown',
        value: 'UNKNOWN'
      }

      // {
      //   label: 'Male',
      //   value: 'MALE',
      //   name: 'gender',
      //   id: 'gender-{Date.now()}-{i}'
      // },
      // {
      //   label: 'Female',
      //   value: 'FEMALE'
      //   name: 'gender',
      //   id: 'gender-{Date.now()}-{i}'
      // },
      // {
      //   label: 'Unknown',
      //   value: 'UNKNOWN'
      //   name: 'gender',
      //   id: 'gender-{Date.now()}-{i}'
      // }
    ]
  }
}




{
  gender: {
    _input: 'radiogroup',
    _options: [
      ... grab a radio input structure and hydrate with these below options as the doc
      {
        label: 'Male',
        value: 'MALE',
        _attributes: {
        }
      },
      {
        label: 'Female',
        value: 'FEMALE'
      },
      {
        label: 'Unknown',
        value: 'UNKNOWN'
      }

      // {
      //   label: 'Male',
      //   value: 'MALE',
      //   name: 'gender',
      //   id: 'gender-{Date.now()}-{i}'
      // },
      // {
      //   label: 'Female',
      //   value: 'FEMALE'
      //   name: 'gender',
      //   id: 'gender-{Date.now()}-{i}'
      // },
      // {
      //   label: 'Unknown',
      //   value: 'UNKNOWN'
      //   name: 'gender',
      //   id: 'gender-{Date.now()}-{i}'
      // }
    ]
  }
}


form elements / field

options = mix between values and arguably fields

options = mix between values and arguably fields



{
  _type: 'checkbox',
  _attributes: {
    type: 'checkbox',
    checked: false,
    name: 'foo',
    id: 'foo',
    value: 'uno',
    tabindex: '0'
  }
}








// email: {
//   _input: 'email',
//   _label: 'Email',
//   _key: 'email',
//   _help: null,
//   _prefix: null,
//   _format: null,
//   _phrase: null,
//   _model: null,
//   _multiple: null,
//   _css: '',
//   _attributes: {
//     placeholder: false,
//     required: false,
//     disabled: false,
//     pattern: null,
//     value: 'jack@nacho.com',
//     type: 'email',
//     autocapitalize: 'off',
//     autocomplete: 'email',
//     autocorrect: 'off',
//     spellcheck: 'off',
//     xAutocompletetype: 'email'
//   }
// }









// 1. schema
// 2. expand schema
// 3. expanded schema are fields
// 4. fields are used for forms, fitlers, and quicklinks
// 5. fields can have formatters and phrases
// 6. some field inputs should have format and phrase responsibilities at the input level even if they have children fields
// 7. fields should be hydrated with a doc and/or errors when applicable
// 8. ideally hydration would structure the format/phrase use case when fields have values or not accordingly




// [
//   {
//     _input: 'daterange',
//     _format: () => 'foo',
//     _phrase: () => 'foo',
//     key: 'select',
//     start: 'date',
//     end: 'date'
//   }
// ]


// [
//   {
//     _input: 'daterange',
//     _format: () => 'foo',
//     _phrase: () => 'foo',
//     _attributes: {
//       value: daterangeobj
//     }
//   }
// ]


// [
//   {
//     _input: 'key'
//   }

//   {
//     _input: 'start'
//   }

//   {
//     _input: 'start'
//   }
// ]






/*
IDEAS
--> fields --> hydrateFields --> filters

name: '*text',
givenAt: '*datetime',
amount: '!currency',
type: formgive.input.select(res.locals.types.enumValues)
date: formgive.input.dateRange(res.locals.dateKeys.enumValues)

type: formgive.input.text({
  placeholder: '50 char max',
  require: true
})

date: {
  _input: 'dateRange',
  _options: data
}
formgive.input.dateRange(res.locals.dateKeys.enumValues)

date: formgive.input.dateRange(res.locals.dateKeys.enumValues)
*/
