// also account for autocorrect, autocomplete, spellcheck, attributes etc.
const INPUT_TABLE = module.exports = {
  'name': {
    '_input': 'name',
    '_type': 'text',
    '_autocapitalize': 'on',
    '_autocomplete': 'name',
    '_autocorrect': 'off',
    '_spellcheck': 'off',
    '_xAutocompletetype': 'nume-full'
  },

  'text': {
    '_input': 'text',
    '_type': 'text'
  },

  'email': {
    '_input': 'email',
    '_type': 'text',
    // "_pattern": 'email validator',
    // "_placeholder": 'email@website.com',
    "_autocapitalize": "off",
    "_autocomplete": "email",
    "_autocorrect": "off",
    "spellcheck": "off",
    "xAutocompletetype": "email"
  },

  'url': {
    '_input': 'url',
    '_type': 'text',
    '_pattern': 'https://.*'
  },

  'number': {
    '_input': 'number',
    '_type': 'number',
    '_pattern': '[0-9]*'
  },

  'checkbox': {
    '_input': 'checkbox',
    '_type': 'boolean',
    "_value": false
  },

  'markdown': {
    '_input': 'markdown',
    '_type': 'text',
    "_pattern": 'markdown validator',
    "_placeholder": 'Enter markdown'
  },

  'select': {
    '_input': 'select',
    '_type': 'text'
  }

  // 'currency': {
  //   '_input': 'number',
  //   '_type': 'number',
  //   '_pattern': ''
  // }

  // 'phone': {
  //   '_type': 'tel',
  //   '_pattern': '[0-9]*'
  // },

  // 'credit-card': {
  //   '_type': 'text',
  //   '_pattern': '[0-9]*'
  // },
};
