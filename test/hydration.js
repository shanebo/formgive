const chai = require('chai');
const chaiSubset = require('chai-subset');
chai.use(chaiSubset);

const { expect } = chai;
const { toFields, toHydratedFields } = require('../lib');

describe('toHydratedFields', () => {
  it('hydrates fields', () => {
    const today = new Date();

    const actual = toFields({
      joe: '*name',
      foo: {
        _input: 'hola'
      },
      name: 'text',
      email: 'email',
      uno: {
        dos: {
          tres: 'text'
        }
      },
      amount: 'currencyRange',
      date: 'dateRange',
      gifts: {
        _input: 'checkbox',
        _attributes: {
          value: 'on'
        }
      },
      help: {
        _input: 'checkbox',
        _attributes: {
          value: 'on'
        }
      }
    },
    {
      name: 'Jack Black',
      email: 'jack@nacho.com',
      uno: {
        dos: {
          tres: 'nachooooooooooo'
        }
      },
      amount: {
        min: 100,
        max: 5000,
        uno: {
          dos: {
            tres: 'tres is number three'
          }
        }
      },
      date: {
        key: 'TODAY',
        start: today
      },
      gifts: 'on'
    });

    const hydratedFields = toHydratedFields(actual);

    expect(hydratedFields).to.eql([
      {
        key: 'Name',
        value: 'Jack Black',
        valueFormatted: 'Jack Black',
        valuePhrased: 'Jack Black',
        name: 'name',
        hidden: undefined
      },
      {
        key: 'Email',
        value: 'jack@nacho.com',
        valueFormatted: 'jack@nacho.com',
        valuePhrased: 'jack@nacho.com',
        name: 'email',
        hidden: undefined
      },
      {
        key: 'Tres',
        value: 'nachooooooooooo',
        valueFormatted: 'nachooooooooooo',
        valuePhrased: 'nachooooooooooo',
        name: 'uno.dos.tres',
        hidden: undefined
      },
      {
        key: 'Amount',
        value: {
          min: 100,
          max: 5000,
          uno: {
            dos: {
              tres: "tres is number three"
            }
          }
        },
        valueFormatted: '$100.00–$5,000.00',
        valuePhrased: '$100.00–$5,000.00',
        name: 'amount',
        hidden: undefined
      },
      {
        key: 'Date',
        value: { key: 'TODAY', start: today },
        valueFormatted: 'Today',
        valuePhrased: 'Today',
        name: 'date',
        hidden: undefined
      },
      {
        hidden: undefined,
        key: "Gifts",
        name: "gifts",
        value: "on",
        valueFormatted: "on",
        valuePhrased: "on"
      }
    ]);
  });
});

describe('Hydating doc' , () => {
  it('hydrates values', () => {
    const actual = toFields({
      name: 'text',
      email: 'text',
      address: {
        street: 'text'
      }
    }, {
      name: 'Shane Thacker'
    });

    expect(actual.name).to.containSubset({
      _attributes: {
        value: 'Shane Thacker'
      }
    });
  });

  it('hydrates multiple field values', () => {
    const actual = toFields({
      type: 'text',
      foo: {
        tags: [{
          name: 'text',
          color: 'text'
        }]
      }
    }, {
      type: 'RESOURCE',
      foo: {
          tags: [
          {
            name: 'theology'
          },
          {
            name: 'practice'
          },
          {
            name: 'application'
          }
        ]
      }
    });

    expect(actual.foo).to.eql(
      {
        _key: 'foo',
        _label: 'Foo',
        _help: null,
        _prefix: null,
        _format: null,
        _phrase: null,
        _error: null,
        _attributes: {
          id: 'foo',
          required: false,
          disabled: false,
          value: {
            tags: [
              {
                name: 'theology'
              },
              {
                name: 'practice'
              },
              {
                name: 'application'
              }
            ]
          },
          name: 'foo'
        },
        _input: 'fieldset',
        tags: {
          _key: 'tags',
          _label: 'Tags',
          _help: null,
          _prefix: null,
          _format: null,
          _phrase: null,
          _error: null,
          _input: 'set',
          _attributes: {
            id: 'tags',
            required: false,
            disabled: false,
            name: 'foo.tags',
            value: [
              {
                name: 'theology'
              },
              {
                name: 'practice'
              },
              {
                name: 'application'
              }
            ]
          },
          _template: {
            name: {
              _key: 'name',
              _label: 'Name',
              _help: null,
              _prefix: null,
              _format: null,
              _phrase: null,
              _error: null,
              _input: 'input',
              _attributes: {
                id: 'name',
                required: false,
                disabled: false,
                value: undefined,
                'data-template-name': 'foo.tags.$index.name',
                name: 'foo.tags.$index.name',
                type: 'text',
                autocapitalize: null,
                autocomplete: null,
                autocorrect: null,
                spellcheck: null,
                xAutocompletetype: null
              }
            },
            color: {
              _key: 'color',
              _label: 'Color',
              _help: null,
              _prefix: null,
              _format: null,
              _phrase: null,
              _error: null,
              _input: 'input',
              _attributes: {
                id: 'color',
                required: false,
                disabled: false,
                value: undefined,
                'data-template-name': 'foo.tags.$index.color',
                name: 'foo.tags.$index.color',
                type: 'text',
                autocapitalize: null,
                autocomplete: null,
                autocorrect: null,
                spellcheck: null,
                xAutocompletetype: null
              }
            }
          },
          _items: [
            {
              name: {
                _key: 'name',
                _label: 'Name',
                _help: null,
                _prefix: null,
                _format: null,
                _phrase: null,
                _error: null,
                _input: 'input',
                _attributes: {
                  id: 'name',
                  required: false,
                  disabled: false,
                  value: 'theology',
                  'data-template-name': 'foo.tags.$index.name',
                  name: 'foo.tags.0.name',
                  type: 'text',
                  autocapitalize: null,
                  autocomplete: null,
                  autocorrect: null,
                  spellcheck: null,
                  xAutocompletetype: null
                }
              },
              color: {
                _key: 'color',
                _label: 'Color',
                _help: null,
                _prefix: null,
                _format: null,
                _phrase: null,
                _error: null,
                _input: 'input',
                _attributes: {
                  id: 'color',
                  required: false,
                  disabled: false,
                  value: undefined,
                  'data-template-name': 'foo.tags.$index.color',
                  name: 'foo.tags.0.color',
                  type: 'text',
                  autocapitalize: null,
                  autocomplete: null,
                  autocorrect: null,
                  spellcheck: null,
                  xAutocompletetype: null
                }
              }
            },
            {
              name: {
                _key: 'name',
                _label: 'Name',
                _help: null,
                _prefix: null,
                _format: null,
                _phrase: null,
                _error: null,
                _input: 'input',
                _attributes: {
                  id: 'name',
                  required: false,
                  disabled: false,
                  value: 'practice',
                  'data-template-name': 'foo.tags.$index.name',
                  name: 'foo.tags.1.name',
                  type: 'text',
                  autocapitalize: null,
                  autocomplete: null,
                  autocorrect: null,
                  spellcheck: null,
                  xAutocompletetype: null
                }
              },
              color: {
                _key: 'color',
                _label: 'Color',
                _help: null,
                _prefix: null,
                _format: null,
                _phrase: null,
                _error: null,
                _input: 'input',
                _attributes: {
                  id: 'color',
                  required: false,
                  disabled: false,
                  value: undefined,
                  'data-template-name': 'foo.tags.$index.color',
                  name: 'foo.tags.1.color',
                  type: 'text',
                  autocapitalize: null,
                  autocomplete: null,
                  autocorrect: null,
                  spellcheck: null,
                  xAutocompletetype: null
                }
              }
            },
            {
              name: {
                _key: 'name',
                _label: 'Name',
                _help: null,
                _prefix: null,
                _format: null,
                _phrase: null,
                _error: null,
                _input: 'input',
                _attributes: {
                  id: 'name',
                  required: false,
                  disabled: false,
                  value: 'application',
                  'data-template-name': 'foo.tags.$index.name',
                  name: 'foo.tags.2.name',
                  type: 'text',
                  autocapitalize: null,
                  autocomplete: null,
                  autocorrect: null,
                  spellcheck: null,
                  xAutocompletetype: null
                }
              },
              color: {
                _key: 'color',
                _label: 'Color',
                _help: null,
                _prefix: null,
                _format: null,
                _phrase: null,
                _error: null,
                _input: 'input',
                _attributes: {
                  id: 'color',
                  required: false,
                  disabled: false,
                  value: undefined,
                  'data-template-name': 'foo.tags.$index.color',
                  name: 'foo.tags.2.color',
                  type: 'text',
                  autocapitalize: null,
                  autocomplete: null,
                  autocorrect: null,
                  spellcheck: null,
                  xAutocompletetype: null
                }
              }
            }
          ]
        }
      }
    );
  });

  it('hydrates nested field values', () => {
    const actual = toFields({
      address: {
        street: 'text'
      }
    }, {
      address: {
        street: '123 Sesame street'
      }
    });

    expect(actual.address.street).to.containSubset({
      _attributes: {
        value: '123 Sesame street'
      }
    });
  });

  it('hydrates checkboxes', () => {
    const actual = toFields({
      help: 'switch',
      foo: 'radio',
      boo: 'chip',
      gifts: {
        _input: 'checkbox',
        _attributes: {
          value: 'true'
        }
      }
    }, {
      help: 'on',
      boo: 'on',
      gifts: 'true'
    });

    expect(actual.help._attributes.checked).to.equal(true);
    expect(actual.foo._attributes.checked).to.equal(false);
    expect(actual.boo._attributes.checked).to.equal(true);
    expect(actual.gifts._attributes.checked).to.equal(true);
  });

  it('hydrates key that is an "Id" association', () => {
    const actual = toFields({
      officerId: {
        _input: 'select',
        _options: [
          {
            label: 'John',
            value: 1
          },
          {
            label: 'Peter',
            value: 2
          },
          {
            label: 'Sam',
            value: 3
          }
        ]
      }
    }, {
      officerId: 2
    });

    expect(actual.officerId._options).to.containSubset([{
      _attributes: {
        value: 2,
        selected: true,
        checked: true
      }
    }]);
  });

  it('sets select default option', () => {
    const actual = toFields({
      type: {
        _input: 'select',
        _options: [
          {
            label: 'Individual',
            value: 1
          },
          {
            label: 'Company',
            value: 2,
            default: true
          },
          {
            label: 'Church',
            value: 3
          }
        ]
      }
    });

    expect(actual.type._options).to.containSubset([{
      _attributes: {
        value: 2,
        selected: true,
        checked: true
      }
    }]);
  });

  it('sets select default option with hydration', () => {
    const actual = toFields({
      type: {
        _input: 'select',
        _options: [
          {
            label: 'Individual',
            value: 1
          },
          {
            label: 'Company',
            value: 2,
            default: true
          },
          {
            label: 'Church',
            value: 3
          }
        ]
      }
    }, {
      type: 1
    });

    expect(actual.type._options).to.not.containSubset([{
      _attributes: {
        value: 2,
        selected: true,
        checked: true
      }
    }]);

    expect(actual.type._options).to.containSubset([{
      _attributes: {
        value: 1,
        selected: true,
        checked: true
      }
    }]);
  });

  it('hydrates key that has "Id" in it that is not an "Id" association', () => {
    const actual = toFields({
      totalIdiot: {
        _input: 'select',
        _options: [
          {
            label: 'John',
            value: 1
          },
          {
            label: 'Peter',
            value: 2
          },
          {
            label: 'Sam',
            value: 3
          }
        ]
      }
    }, {
      totalIdiot: 2
    });

    expect(actual.totalIdiot._options).to.containSubset([{
      _attributes: {
        value: 2,
        selected: true,
        checked: true
      }
    }]);
  });

  it('hydrates an "Id" association', () => {
    const actual = toFields({
      officerId: {
        _input: 'select',
        _options: [
          {
            label: 'John',
            value: 1
          },
          {
            label: 'Peter',
            value: 2
          },
          {
            label: 'Sam',
            value: 3
          }
        ]
      }
    }, {
      officer: {
        value: 2,
        label: 'Peter'
      }
    });

    expect(actual.officerId._options).to.containSubset([{
      _attributes: {
        value: 2,
        selected: true,
        checked: true
      }
    }]);
  });

  it('hydrates pick multiple values', () => {
    const actual = toFields({
      flags: {
        _input: 'pick',
        _type: 'chips',
        _multiple: true,
        _options: [
          {
            label: 'Uno',
            value: 'UNO'
          },
          {
            label: 'Dos',
            value: 'DOS'
          },
          {
            label: 'Tres',
            value: 'TRES'
          }
        ]
      }
    }, {
      flags: ['UNO', 'TRES']
    });

    expect(actual.flags._options).to.containSubset([{
      _attributes: {
        value: 'UNO',
        checked: true
      }
    }]);

    expect(actual.flags._options).to.containSubset([{
      _attributes: {
        value: 'TRES',
        checked: true
      }
    }]);
  });

  describe('errors', () => {
    it('hydrates simple errors', () => {
      const actual = toFields({
        name: 'text',
        email: 'text',
        address: {
          street: 'text'
        }
      }, {
        name: 'Joe Osburn'
      },
      [
        {
          message: "Argument 'email' on InputObject 'AccountInput' is required. Expected type String!",
          extensions: {
            dotPath: "mutation.createAccount.input.email"
          }
        }
      ]);

      expect(actual.email._error).to.equal("Argument 'email' on InputObject 'AccountInput' is required. Expected type String!");
    });

    it('hydrates errors on nested fields', () => {
      const actual = toFields({
        address: {
          street: 'text'
        }
      }, {
        address: {
          street: ''
        }
      },
      [
        {
          message: "Argument 'address.street' on InputObject 'createAddressInput' is required. Expected type String!",
          extensions: {
            dotPath: "mutation.createAddressInput.input.address.street"
          }
        }
      ]);

      expect(actual.address.street._error).to.equal("Argument 'address.street' on InputObject 'createAddressInput' is required. Expected type String!");
    });

    it('hydrates errors on fieldsets', () => {
      const actual = toFields({
        account: {
          name: 'text',
          address: {
            street: 'text'
          }
        }
      }, {
        account: {
          name: 'John'
        }
      },
      [
        {
          message: "Argument 'address' on InputObject 'createAccountInput' is required.",
          extensions: {
            dotPath: "mutation.createAccountInput.input.account.address"
          }
        }
      ]);

      expect(actual.account.address._error).to.equal("Argument 'address' on InputObject 'createAccountInput' is required.");
    });

    it('hydrates errors base object', () => {
      const actual = toFields({
        name: 'text',
        email: 'text'
      }, {
        name: 'John',
        email: 'john@email.com'
      },
      [
        {
          message: 'The name and email address combination must be unique.',
          extensions: {
            dotPath: 'mutation.createAccountInput.input'
          }
        }
      ]);

      expect(actual._error).to.equal('The name and email address combination must be unique.');
    });

    it('hydrates errors with no extensions', () => {
      const actual = toFields({
        name: 'text',
        email: 'text'
      }, {
        name: 'John',
        email: 'john@email.com'
      },
        [
          {
            message: 'The name and email address combination must be unique.',
          }
        ]);

      expect(actual._error).to.equal('The name and email address combination must be unique.');
    });

    it('hydrates errors with no dotPath', () => {
      const actual = toFields({
        name: 'text',
        email: 'text'
      }, {
        name: 'John',
        email: 'john@email.com'
      },
        [
          {
            message: 'The name and email address combination must be unique.',
            extensions: {}
          }
        ]);

      expect(actual._error).to.equal('The name and email address combination must be unique.');
    });

    it('hydrates errors on multiple fields', () => {
      const actual = toFields({
        type: 'text',
        tags: [{
          name: 'text'
        }]
      }, {
        type: 'RESOURCE',
        tags: [
          {
            name: 'theology'
          },
          {
            name: ""
          }
        ]
      },
      [
        {
          message: "Argument 'tag.name' on InputObject 'createTag' is too short. Expected a minimun length of 1.",
          extensions: {
            dotPath: "mutation.createTag.input.tags[1].name"
          }
        }
      ]);

      expect(actual.tags._items[0].name._error).to.equal(null);
      expect(actual.tags._items[1].name._error).to.equal("Argument 'tag.name' on InputObject 'createTag' is too short. Expected a minimun length of 1.");
    });
  });
});
