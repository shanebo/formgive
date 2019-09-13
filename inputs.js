// also account for autocorrect, autocomplete, spellcheck, attributes etc.
const INPUT_TABLE = module.exports = {
  name: {
    input: 'name',
    type: 'text',
    autocapitalize: 'on',
    autocomplete: 'name',
    autocorrect: 'off',
    spellcheck: 'off',
    xAutocompletetype: 'nume-full'
  },

  text: {
    input: 'text',
    type: 'text',
    autocapitalize: false,
    autocomplete: false,
    autocorrect: false,
    spellcheck: false,
    xAutocompletetype: false
  },

  email: {
    input: 'email',
    type: 'text',
    autocapitalize: 'off',
    autocomplete: 'email',
    autocorrect: 'off',
    spellcheck: 'off',
    xAutocompletetype: 'email'
    // pattern: 'email validator',
    // placeholder: 'email@website.com',
  },

  'url': {
    'input': 'url',
    'type': 'text',
    'pattern': 'https://.*'
  },

  'number': {
    'input': 'number',
    'type': 'number',
    'pattern': '[0-9]*'
  },

  'checkbox': {
    'input': 'checkbox',
    'type': 'boolean',
    'value': false
  },

  'markdown': {
    'input': 'markdown',
    'type': 'text',
    'pattern': 'markdown validator',
    'placeholder': 'Enter markdown'
  },

  select: {
    input: 'select',
    type: 'text'
  },

  'switch': {
    'input': 'switch',
    'type': 'boolean',
    'value': false
  },

  'radio': {
    'input': 'radio',
    'type': 'text'
  }

  // 'currency': {
  //   'input': 'number',
  //   'type': 'number',
  //   'pattern': ''
  // }

  // 'phone': {
  //   'type': 'tel',
  //   'pattern': '[0-9]*'
  // },

  // 'credit-card': {
  //   'type': 'text',
  //   'pattern': '[0-9]*'
  // },
};
