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
  },

  password: {
    _input: 'text',
    _type: 'password',
    _autocapitalize: false,
    _autocomplete: false,
    _autocorrect: false,
    _spellcheck: false,
    _xAutocompletetype: false
  },

  option: {
    _input: 'combobox',
    _type: 'option',
    _mode: 'default',
    _search: false,
    _remote: false,
    _single: true
  },

  multioption: {
    _input: 'combobox',
    _type: 'multioption',
    _mode: 'default',
    _search: true,
    _remote: false,
    _single: false
  },

  tags: {
    _input: 'combobox',
    _type: 'tags',
    _mode: 'tags',
    _search: true,
    _single: false,
    _remote: false,
  },

  selectsearch: {
    _input: 'combobox',
    _mode: 'default',
    _remote: false,
    _single: true
  },

  association: {
    _input: 'combobox',
    _type: 'association',
    _mode: 'search',
    _remote: true,
    _search: false,
    _single: true
  },

  associations: {
    _input: 'combobox',
    _type: 'associations',
    _mode: 'search',
    _remote: true,
    _search: false,
    _single: false
  },

  combobox: {
    _input: 'combobox',
    _type: 'tags',
    _mode: 'tags',
    _remote: false,
    _search: true,
    _single: false
  },

  phone: {
    _input: 'phone',
    _type: 'tel',
    _pattern: '[0-9]*',
    _autocapitalize: 'off',
    _autocomplete: 'phone',
    _autocorrect: 'off',
    _spellcheck: 'off',
    _xAutocompletetype: 'phone'
  },

  ccnumber: {
    _input: 'ccnumber',
    _type: 'tel',
    _autocapitalize: 'off',
    _autocomplete: 'ccnumber',
    _autocorrect: 'off',
    _spellcheck: 'off',
    _xAutocompletetype: 'ccnumber'
  }
};
