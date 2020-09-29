const chai = require('chai');
const chaiSubset = require('chai-subset');
chai.use(chaiSubset);

const { expect } = chai;
const { input, toFields } = require('../lib');

const mockOptions = [
  {
    label: 'Texas',
    value: 0
  },
  {
    label: 'Minnesota',
    value: 1
  },
  {
    label: 'New York',
    value: 2
  }
];

describe('Schema parsing', () => {
  it('expands input', () => {
    const actual = toFields({
      gender: 'radio'
    });

    expect(actual.gender).to.eql({
      _key: 'gender',
      _label: 'Gender',
      _help: null,
      _prefix: null,
      _format: null,
      _phrase: null,
      _error: null,
      _attributes: {
        id: 'gender',
        required: false,
        disabled: false,
        value: 'on',
        name: 'gender',
        type: 'checkbox',
        checked: false
      },
      _input: 'checkbox',
      _type: 'radio'
    });
  });

  it('expands shorthand', () => {
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
      amount: 'currencyRange'
    }, {
      name: 'Jack Black',
      email: 'jack@nacho.com',
      uno: {
        dos: {
          tres: 'nachooooooooooo'
        }
      },
      amount: {
        min: '$10.00',
        max: '$5,000.00',
        uno: {
          dos: {
            tres: 'tres is number three'
          }
        }
      }
    });

    expect(actual).to.containSubset({
      joe: {
        _key: 'joe',
        _label: 'Joe',
        _help: null,
        _prefix: null,
        _format: null,
        _phrase: null,
        _input: 'input',
        _attributes: {
          id: 'joe',
          disabled: false,
          value: undefined,
          name: 'joe',
          required: true,
          type: 'text',
          autocapitalize: 'on',
          autocomplete: 'name',
          autocorrect: 'off',
          spellcheck: 'off',
          xAutocompletetype: 'name-full'
        }
      },
      foo: {
        _key: 'foo',
        _label: 'Foo',
        _help: null,
        _prefix: null,
        _format: null,
        _phrase: null,
        _attributes: {
          id: 'foo',
          required: false,
          disabled: false,
          value: undefined,
          name: 'foo'
        },
        _input: 'hola'
      },
      name: {
        _key: 'name',
        _label: 'Name',
        _help: null,
        _prefix: null,
        _format: null,
        _phrase: null,
        _input: 'input',
        _attributes: {
          id: 'name',
          required: false,
          disabled: false,
          value: 'Jack Black',
          name: 'name',
          type: 'text',
          autocapitalize: null,
          autocomplete: null,
          autocorrect: null,
          spellcheck: null,
          xAutocompletetype: null
        }
      },
      email: {
        _key: 'email',
        _label: 'Email',
        _help: null,
        _prefix: null,
        _format: null,
        _phrase: null,
        _input: 'input',
        _attributes: {
          id: 'email',
          required: false,
          disabled: false,
          value: 'jack@nacho.com',
          name: 'email',
          type: 'email',
          autocapitalize: 'off',
          autocomplete: 'email',
          autocorrect: 'off',
          spellcheck: 'off',
          xAutocompletetype: 'email'
        }
      },
      uno: {
        _key: 'uno',
        _label: 'Uno',
        _help: null,
        _prefix: null,
        _format: null,
        _phrase: null,
        _attributes: {
          id: 'uno',
          required: false,
          disabled: false,
          value: {
            dos: {
              tres: "nachooooooooooo"
            }
          },
          name: 'uno'
        },
        _input: 'fieldset',
        dos: {
          _key: 'dos',
          _label: 'Dos',
          _help: null,
          _prefix: null,
          _format: null,
          _phrase: null,
          _attributes: {
            id: "dos",
            required: false,
            disabled: false,
            value: {
              tres: "nachooooooooooo"
            },
            name: "uno.dos"
          },
          _input: 'fieldset',
          tres: {
            _key: "tres",
            _label: "Tres",
            _help: null,
            _prefix: null,
            _format: null,
            _phrase: null,
            _input: "input",
            _attributes: {
              id: "tres",
              required: false,
              disabled: false,
              value: "nachooooooooooo",
              name: "uno.dos.tres",
              type: "text",
              autocapitalize: null,
              autocomplete: null,
              autocorrect: null,
              spellcheck: null,
              xAutocompletetype: null
            }
          }
        }
      },
      amount: {
        _key: 'amount',
        _label: 'Amount',
        _help: null,
        _prefix: null,
        _attributes: {
          id: 'amount',
          required: false,
          disabled: false,
          value: {
            min: "$10.00",
            max: "$5,000.00",
            uno: {
              dos: {
                tres: "tres is number three"
              }
            }
          },
          name: 'amount'
        },
        _css: 'FieldsetRow',
        _input: 'fieldset',
        min: {
          _key: 'min',
          _label: 'Min',
          _help: null,
          _phrase: null,
          _input: 'input',
          _prefix: '$',
          _attributes: {
            id: "min",
            required: false,
            disabled: false,
            value: "$10.00",
            name: "amount.min",
            type: "text",
            autocapitalize: "off",
            autocomplete: "off",
            autocorrect: "off",
            spellcheck: "off"
          }
        },
        max: {
          _key: 'max',
          _label: 'Max',
          _help: null,
          _phrase: null,
          _input: 'input',
          _prefix: '$',
          _attributes: {
            id: "max",
            required: false,
            disabled: false,
            value: "$5,000.00",
            name: "amount.max",
            type: "text",
            autocapitalize: "off",
            autocomplete: "off",
            autocorrect: "off",
            spellcheck: "off"
          }
        }
      }
    });
  });

  describe('Shorthand', () => {
    it('simple text field', () => {
      const actual = toFields({
        name: 'text'
      });

      expect(actual).to.eql({
        name: {
          _attributes: {
            autocapitalize: null,
            autocomplete: null,
            autocorrect: null,
            disabled: false,
            id: 'name',
            name: 'name',
            required: false,
            spellcheck: null,
            type: 'text',
            value: undefined,
            xAutocompletetype: null
          },
          _format: null,
          _help: null,
          _input: 'input',
          _key: 'name',
          _label: 'Name',
          _phrase: null,
          _prefix: null,
          _error: null
        }
      });
    });

    it('required email field', () => {
      const actual = toFields({
        email: '*email'
      });

      expect(actual).to.eql({
        email: {
          _attributes: {
            autocapitalize: 'off',
            autocomplete: 'email',
            autocorrect: 'off',
            disabled: false,
            id: 'email',
            name: 'email',
            required: true,
            spellcheck: 'off',
            type: 'email',
            value: undefined,
            xAutocompletetype: 'email'
          },
          _format: null,
          _help: null,
          _input: 'input',
          _key: 'email',
          _label: 'Email',
          _phrase: null,
          _prefix: null,
          _error: null
        }
      });
    });

    it('disabled text field', () => {
      const actual = toFields({
        status: '!*text'
      });

      expect(actual.status._attributes.disabled).to.equal(true);
    });

    it('required association using select', () => {
      const actual = toFields({
        author: '*select@Author'
      });

      expect(actual).to.eql({
        author: {
          _attributes: {
            disabled: false,
            id: 'author',
            name: 'author',
            required: false,
            value: undefined
          },
          _format: null,
          _help: null,
          _input: 'select',
          _key: 'author',
          _label: 'Author',
          _model: 'Author',
          _phrase: null,
          _prefix: null,
          _error: null,
          _type: 'option'
        }
      });
    });

    it('required url', () => {
      const actual = toFields({
        website: '*url'
      });

      expect(actual).to.eql({
        website: {
          _attributes: {
            disabled: false,
            id: 'website',
            name: 'website',
            pattern: 'https://.*',
            required: true,
            type: 'url',
            value: undefined,
          },
          _format: null,
          _help: null,
          _input: 'input',
          _key: 'website',
          _label: 'Website',
          _phrase: null,
          _prefix: null,
          _error: null
        }
      });
    });

    it.skip('multiple via association', () => {
      const actual = toFields({
        'tags': ['select@Tag']
      });

      expect(actual).to.eql({
        tags: {
          label: 'Tags',
          key: 'tags',
          placeholder: false,
          prefix: null,
          help: false,
          multiple: true,
          required: false,
          format: undefined,
          phrase: undefined,
          pattern: null,
          format: undefined,
          phrase: undefined,
          model: 'Tag',
          disabled: false,
          value: undefined,
          css: '',
          input: 'select',
          type: 'association',
          name: 'tags'
        }
      });
    });

    it('checkbox', () => {
      const actual = toFields({
        'member': 'checkbox'
      });

      expect(actual).to.eql({
        member: {
          _attributes: {
            checked: false,
            disabled: false,
            id: 'member',
            name: 'member',
            required: false,
            type: 'checkbox',
            value: 'on',
          },
          _format: null,
          _help: null,
          _input: 'checkbox',
          _key: 'member',
          _label: 'Member',
          _phrase: null,
          _prefix: null,
          _error: null,
          _type: 'default'
        }
      });
    });

    it('handles nested fields', () => {
      const actual = toFields({
        'address.full': 'textarea'
      });

      expect(actual).to.eql({
        'address.full': {
          _attributes: {
            autocapitalize: "off",
            autocomplete: "off",
            autocorrect: "off",
            disabled: false,
            id: 'address.full',
            name: 'address.full',
            required: false,
            spellcheck: "false",
            value: undefined,
          },
          _format: null,
          _help: null,
          _input: 'textarea',
          _key: 'address.full',
          _label: 'Address full',
          _phrase: null,
          _prefix: null,
          _error: null,
          _type: 'text'
        }
      });
    });

    describe('selects', () => {
      it('handles default data structure', () => {
        const actual = toFields({
          state: {
            _input: 'select',
            _options: mockOptions
          }
        },
        {
          state: 1
        });

        expect(actual.state._options).to.eql([
          {
            _key: "state",
            _label: 'Texas',
            _help: null,
            _prefix: null,
            _format: null,
            _phrase: null,
            _error: null,
            _input: "option",
            _attributes: {
              id: "state-0",
              required: false,
              value: 0,
              selected: false,
              disabled: false,
              tabindex: "0",
              name: "state"
            }
          },
          {
            _key: "state",
            _label: 'Minnesota',
            _help: null,
            _prefix: null,
            _format: null,
            _phrase: null,
            _error: null,
            _input: "option",
            _attributes: {
              id: "state-1",
              required: false,
              value: 1,
              selected: true,
              disabled: false,
              tabindex: "0",
              name: "state",
              checked: true
            }
          },
          {
            _key: "state",
            _label: 'New York',
            _help: null,
            _prefix: null,
            _format: null,
            _phrase: null,
            _error: null,
            _input: "option",
            _attributes: {
              id: "state-2",
              required: false,
              value: 2,
              selected: false,
              disabled: false,
              tabindex: "0",
              name: "state"
            }
          }
        ]);
      });

      it('handles pick:switches data structure', () => {
        const actual = toFields({
            state: input('*pick:switches', mockOptions)
          },
          {
            state: 1
          }
        );

        expect(actual.state).to.containSubset({
          _attributes: {
            required: true
          }
        });

        expect(actual.state._options).to.containSubset([
          {
            _type: "switch"
          },
          {
            _type: "switch"
          },
          {
            _type: "switch"
          }
        ]);
      });


      it('handles pick:radio data structure', () => {
        const actual = toFields({
          state: {
            _input: 'pick:radio',
            _options: mockOptions
          }
        },
        {
          state: 1
        });

        expect(actual.state._options).to.containSubset([
          {
            _type: "radio"
          },
          {
            _type: "radio"
          },
          {
            _type: "radio"
          }
        ]);
      });



      it('handles pick:chip data structure', () => {
        const actual = toFields({
          state: {
            _input: 'pick:chip',
            _options: mockOptions
          }
        },
        {
          state: 1
        });

        expect(actual.state._options).to.eql([
          {
            _key: "state",
            _label: 'Texas',
            _help: null,
            _prefix: null,
            _format: null,
            _phrase: null,
            _error: null,
            _attributes: {
              id: "state-0",
              required: false,
              disabled: false,
              value: 0,
              type: "checkbox",
              checked: false,
              tabindex: "0",
              name: "state"
            },
            _input: "checkbox",
            _type: "chip"
          },
          {
            _key: "state",
            _label: 'Minnesota',
            _help: null,
            _prefix: null,
            _format: null,
            _phrase: null,
            _error: null,
            _attributes: {
              id: "state-1",
              required: false,
              disabled: false,
              value: 1,
              type: "checkbox",
              checked: true,
              tabindex: "0",
              name: "state",
              selected: true
            },
            _input: "checkbox",
            _type: "chip"
          },
          {
            _key: "state",
            _label: 'New York',
            _help: null,
            _prefix: null,
            _format: null,
            _phrase: null,
            _error: null,
            _attributes: {
              id: "state-2",
              required: false,
              disabled: false,
              value: 2,
              type: "checkbox",
              checked: false,
              tabindex: "0",
              name: "state"
            },
            _input: "checkbox",
            _type: "chip"
          }
        ]);
      });
    });
  });

  describe('Longhand', () => {
    it('handles simple text field', () => {
      const actual = toFields({
        name: {
          _label: 'Name',
          _input: 'text',
          _attributes: {
            required: true,
          }
        }
      });

      expect(actual).to.eql({
        name: {
          _attributes: {
            autocapitalize: null,
            autocomplete: null,
            autocorrect: null,
            disabled: false,
            id: 'name',
            name: 'name',
            required: true,
            spellcheck: null,
            type: 'text',
            value: undefined,
            xAutocompletetype: null
          },
          _format: null,
          _help: null,
          _input: 'text',
          _key: 'name',
          _label: 'Name',
          _phrase: null,
          _prefix: null,
          _error: null
        }
      });
    });

    it('handles radios', () => {
      const actual = toFields({
        hasDonation: {
          _key: 'hasDonation',
          _label: 'Donor',
          _input: 'checkbox',
          _type: 'radio',
          _options: [
            {
              label: 'True',
              value: true
            },
            {
              label: 'False',
              value: false
            }
          ]
        }
      });

      expect(actual).to.eql({
        hasDonation: {
          _help: null,
          _prefix: null,
          _format: null,
          _phrase: null,
          _error: null,
          _attributes: {
            id: 'hasDonation',
            required: false,
            disabled: false,
            value: 'on',
            type: 'checkbox',
            checked: false,
            name: 'hasDonation'
          },
          _key: 'hasDonation',
          _label: 'Donor',
          _input: 'checkbox',
          _type: 'radio',
          _options: [
            {
              _key: 'hasDonation',
              _label: 'True',
              _help: null,
              _prefix: null,
              _format: null,
              _phrase: null,
              _error: null,
              _attributes: {
                id: 'hasDonation-0',
                required: false,
                disabled: false,
                value: true,
                type: 'checkbox',
                checked: false,
                tabindex: '0',
                name: 'hasDonation'
              },
              _input: 'checkbox',
              _type: 'radio'
            },
            {
              _key: 'hasDonation',
              _label: 'False',
              _help: null,
              _prefix: null,
              _format: null,
              _phrase: null,
              _error: null,
              _attributes: {
                id: 'hasDonation-1',
                required: false,
                disabled: false,
                value: false,
                type: 'checkbox',
                checked: false,
                tabindex: '0',
                name: 'hasDonation'
              },
              _input: 'checkbox',
              _type: 'radio'
            }
          ]
        }
      });
    });

    it('handles fieldset with no metas', () => {
      const actual = toFields({
        theme: {
          color: {
            _label: 'Color',
            _type: 'text',
            _input: 'color'
          }
        }
      });

      expect(actual).to.eql({
        theme: {
          _key: 'theme',
          _label: 'Theme',
          _help: null,
          _prefix: null,
          _format: null,
          _phrase: null,
          _error: null,
          _attributes: {
            id: 'theme',
            required: false,
            disabled: false,
            value: undefined,
            name: 'theme'
          },
          _input: 'fieldset',
          color: {
            _key: 'color',
            _help: null,
            _prefix: null,
            _format: null,
            _phrase: null,
            _error: null,
            _attributes: {
              id: 'color',
              required: false,
              disabled: false,
              value: undefined,
              name: 'theme.color'
            },
            _label: 'Color',
            _type: 'text',
            _input: 'color'
          }
        }
      });
    });


    it('handles fieldset with metas', () => {
      const actual = toFields({
        theme: {
          _label: 'Theme',
          _input: 'fieldset',
          color: {
            _label: 'Color',
            _type: 'text',
            _input: 'color'
          }
        }
      });

      expect(actual).to.eql({
        theme: {
          _key: 'theme',
          _label: 'Theme',
          _help: null,
          _prefix: null,
          _format: null,
          _phrase: null,
          _error: null,
          _attributes: {
            id: 'theme',
            required: false,
            disabled: false,
            value: undefined,
            name: 'theme'
          },
          _input: 'fieldset',
          color: {
            _key: 'color',
            _help: null,
            _prefix: null,
            _format: null,
            _phrase: null,
            _error: null,
            _attributes: {
              id: 'color',
              required: false,
              disabled: false,
              value: undefined,
              name: 'theme.color'
            },
            _label: 'Color',
            _type: 'text',
            _input: 'color'
          }
        }
      });
    });


    it('handles select with options', () => {
      const actual = toFields({
        title: {
          _label: 'Title',
          _input: 'select',
          _type: 'number',
          _options: [
            {
              label: 'Mr.',
              value: 1
            },
            {
              label: 'Mrs.',
              value: 2
            },
            {
              label: 'Dr.',
              value: 3
            }
          ]
        }
      });

      expect(actual).to.eql({
        title: {
          _key: 'title',
          _help: null,
          _prefix: null,
          _format: null,
          _phrase: null,
          _error: null,
          _attributes: {
            id: 'title',
            required: false,
            disabled: false,
            value: undefined,
            name: 'title'
          },
          _label: 'Title',
          _input: 'select',
          _type: 'number',
          _options: [
            {
              _key: 'title',
              _label: 'Mr.',
              _help: null,
              _prefix: null,
              _format: null,
              _phrase: null,
              _error: null,
              _input: 'input',
              _attributes: {
                id: 'title-0',
                required: false,
                disabled: false,
                value: 1,
                type: 'number',
                pattern: '[0-9]*',
                tabindex: '0',
                name: 'title'
              }
            },
            {
              _key: 'title',
              _label: 'Mrs.',
              _help: null,
              _prefix: null,
              _format: null,
              _phrase: null,
              _error: null,
              _input: 'input',
              _attributes: {
                id: 'title-1',
                required: false,
                disabled: false,
                value: 2,
                type: 'number',
                pattern: '[0-9]*',
                tabindex: '0',
                name: 'title'
              }
            },
            {
              _key: 'title',
              _label: 'Dr.',
              _help: null,
              _prefix: null,
              _format: null,
              _phrase: null,
              _error: null,
              _input: 'input',
              _attributes: {
                id: 'title-2',
                required: false,
                disabled: false,
                value: 3,
                type: 'number',
                pattern: '[0-9]*',
                tabindex: '0',
                name: 'title'
              }
            }
          ]
        }
      });
    });
  });


  describe('Mixed', () => {
    it('handles multiple via relationship', () => {
      const actual = toFields({
        tags: [{
          _label: 'Tags',
          _input: 'select',
          _type: 'association',
          _model: 'Tag'
        }]
      });

      expect(actual).to.eql({
        tags: {
          _key: 'tags',
          _label: 'Tags',
          _help: null,
          _prefix: null,
          _format: null,
          _phrase: null,
          _error: null,
          _attributes: {
            id: 'tags',
            required: false,
            disabled: false,
            name: 'tags',
            value: undefined
          },
          _input: 'set',
          _template: {
            _label: 'Tags',
            _input: 'select',
            _type: 'association',
            _model: 'Tag'
          },
          _items: []
        }
      });
    });

    it('handles multiple with multiple fields', () => {
      const actual = toFields({
        comments: [{
          user: 'text',
          date: 'text',
          comment: 'textarea'
        }]
      });

      expect(actual).to.eql({
        comments: {
          _key: 'comments',
          _label: 'Comments',
          _help: null,
          _prefix: null,
          _format: null,
          _phrase: null,
          _error: null,
          _input: 'set',
          _attributes: {
            id: 'comments',
            required: false,
            disabled: false,
            name: 'comments',
            value: undefined
          },
          _template: {
            user: {
              _key: 'user',
              _label: 'User',
              _help: null,
              _prefix: null,
              _format: null,
              _phrase: null,
              _input: 'input',
              _error: null,
              _attributes: {
                id: 'user',
                required: false,
                disabled: false,
                value: undefined,
                name: 'comments.$index.user',
                'data-template-name': 'comments.$index.user',
                type: 'text',
                autocapitalize: null,
                autocomplete: null,
                autocorrect: null,
                spellcheck: null,
                xAutocompletetype: null
              }
            },
            date: {
              _key: 'date',
              _label: 'Date',
              _help: null,
              _prefix: null,
              _format: null,
              _phrase: null,
              _input: 'input',
              _error: null,
              _attributes: {
                id: 'date',
                required: false,
                disabled: false,
                value: undefined,
                name: 'comments.$index.date',
                'data-template-name': 'comments.$index.date',
                type: 'text',
                autocapitalize: null,
                autocomplete: null,
                autocorrect: null,
                spellcheck: null,
                xAutocompletetype: null
              }
            },
            comment: {
              _key: 'comment',
              _label: 'Comment',
              _help: null,
              _prefix: null,
              _format: null,
              _phrase: null,
              _input: 'textarea',
              _type: 'text',
              _error: null,
              _attributes: {
                id: 'comment',
                required: false,
                disabled: false,
                value: undefined,
                name: 'comments.$index.comment',
                'data-template-name': 'comments.$index.comment',
                autocomplete: 'off',
                autocorrect: 'off',
                autocapitalize: 'off',
                spellcheck: 'false'
              }
            }
          },
          _items: [],
        }
      });
    });
  });
});
