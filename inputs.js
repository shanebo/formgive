const dayjs = require('dayjs');
const { toCurrency } = require('./utils');

// also account for autocorrect, autocomplete, spellcheck, attributes etc.
const INPUT_TABLE = module.exports = {
  name: {
    _input: 'name',
    _type: 'text',
    _autocapitalize: 'on',
    _autocomplete: 'name',
    _autocorrect: 'off',
    _spellcheck: 'off',
    _xAutocompletetype: 'nume-full'
  },

  text: {
    _input: 'text',
    _type: 'text',
    _autocapitalize: false,
    _autocomplete: false,
    _autocorrect: false,
    _spellcheck: false,
    _xAutocompletetype: false
  },

  selectsearch: {
    _input: 'selectsearch'
  },

  association: {
    _input: 'association'
  },

  date: {
    _input: 'date',
    _type: 'text',
    _autocapitalize: false,
    _autocomplete: false,
    _autocorrect: false,
    _spellcheck: false,
    _xAutocompletetype: false,
    _pattern: /./,
    _format: (d) => dayjs(d).format('MM/DD/YYYY') // allow a default date format at the global level

    // _formatter: (val) => formatDate(val)
  },

  email: {
    _input: 'email',
    _type: 'email',
    _autocapitalize: 'off',
    _autocomplete: 'email',
    _autocorrect: 'off',
    _spellcheck: 'off',
    _xAutocompletetype: 'email'
    // pattern: 'email validator',
    // placeholder: 'email@website.com',
  },

  url: {
    _input: 'url',
    _type: 'text',
    _pattern: 'https://.*'
  },

  number: {
    _input: 'number',
    _type: 'number',
    _pattern: '[0-9]*'
  },

  checkbox: {
    _input: 'checkbox',
    _type: 'boolean',
    _value: false
  },

  textarea: {
    _input: 'textarea',
    _type: 'text'
  },

  currency: {
    _input: 'currency',
    _type: 'text',
    _prefix: '$',
    _autocapitalize: false,
    _autocomplete: false,
    _autocorrect: false,
    _spellcheck: false,
    _format: toCurrency,
    _xAutocompletetype: false
  },

  markdown: {
    _input: 'markdown',
    _type: 'text',
    _pattern: 'markdown validator',
    _placeholder: 'Enter markdown'
  },

  select: {
    _input: 'select'
  },

  switch: {
    _input: 'switch',
    _type: 'boolean',
    _checked: false,
    _value: false
  },

  radio: {
    _input: 'radio',
    _type: 'text'
  },

  radiogroup: {
    _input: 'radiogroup',
    _type: 'text'
  },

  fieldset: {
    _input: 'fieldset'
    // ,
    // _legend: undefined
  },

  password: {
    _input: 'text',
    _type: 'password',
    _autocapitalize: false,
    _autocomplete: false,
    _autocorrect: false,
    _spellcheck: false,
    _xAutocompletetype: false
  }

  // 'phone': {
  //   'type': 'tel',
  //   'pattern': '[0-9]*'
  // },

  // 'credit-card': {
  //   'type': 'text',
  //   'pattern': '[0-9]*'
  // },
};
