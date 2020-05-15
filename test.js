const chai = require('chai');
const chaiSubset = require('chai-subset');
chai.use(chaiSubset);

const { expect } = chai;
const { toFields, mapFieldValues, toSentence } = require('./lib');

const expectToEqual = (actual, expected) => {
  expect(actual).to.deep.equal(expected);
}

describe.only('Parse schema', () => {
  it('Expand shorthand', () => {
    const actual = toFields({
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

    console.log(actual);

    console.log('\n\n\n');
    console.log('toSentence');
    console.log(toSentence(actual));
    // console.log(JSON.stringify(actual, null, 2));


    // const values = actual[1].values.map((obj) => obj[0].value);
    // expect(values).to.eql();
  });

  it('Simple hydration of multiple field', () => {
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
          name: 'practice'
        },
        {
          name: 'application'
        }
      ]
    });

    const values = actual.tags.map((tag) => tag.name._value);
    expect(values).to.eql([ 'theology', 'practice', 'application' ]);
  });

  it('handles simple errors', () => {
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
        "message": "Argument 'email' on InputObject 'AccountInput' is required. Expected type String!",
        "extensions": {
          "dotPath": "mutation.createAccount.input.email"
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
        "message": "Argument 'address.street' on InputObject 'createAddressInput' is required. Expected type String!",
        "extensions": {
          "dotPath": "mutation.createAddressInput.input.address.street"
        }
      }
    ]);

    expect(actual.address.street._error).to.equal("Argument 'address.street' on InputObject 'createAddressInput' is required. Expected type String!");
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
        "message": "Argument 'tag.name' on InputObject 'createTag' is too short. Expected a minimun length of 1.",
        "extensions": {
          "dotPath": "mutation.createTag.input.tags[1].name"
        }
      }
    ]);

    expect(actual.tags[1].name._error).to.equal("Argument 'tag.name' on InputObject 'createTag' is too short. Expected a minimun length of 1.");
  });

  it('handles select fields', () => {
    const actual = toFields({
      state: {
        _options: [
          {
            label: 'Texas',
            value: '0'
          },
          {
            label: 'Minnesota',
            value: '1'
          },
          {
            label: 'New York',
            value: '2'
          }
        ]
      }
    },
    {
      state: '1'
    });

    expect(actual.state._options[1].selected).to.be.true;
  });
});










describe('Hydrated fields', () => {
  it('Simple hydration of multiple field', () => {
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
          name: 'practice'
        },
        {
          name: 'application'
        }
      ]
    });

    const values = actual[1].values.map((obj) => obj[0].value);
    expect(values).to.eql([ 'theology', 'practice', 'application' ]);
  });

  it('Simple hydration of nested field', () => {
    const actual = toFields({
      address: {
        street: 'text'
      }
    }, {
      address: {
        street: '123 Sesame street'
      }
    });

    expect(actual[0].children[0]).to.deep.includes({
      value: '123 Sesame street'
    });
  });

  it('Simple hydration of fields', () => {
    const actual = toFields({
      name: 'text',
      email: 'text',
      address: {
        street: 'text'
      }
    }, {
      name: 'Joe Osburn'
    });

    expect(actual[0]).to.deep.include({
      name: 'name',
      value: 'Joe Osburn'
    });
  });
  describe('errors', () => {
    it('hydrates errors on simple fields', () => {
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
          "message": "Argument 'email' on InputObject 'AccountInput' is required. Expected type String!",
          "extensions": {
            "dotPath": "mutation.createAccount.input.email"
          }
        }
      ]);

      expect(actual[1].error).to.equal("Argument 'email' on InputObject 'AccountInput' is required. Expected type String!");
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
          "message": "Argument 'tag.name' on InputObject 'createTag' is too short. Expected a minimun length of 1.",
          "extensions": {
            "dotPath": "mutation.createTag.input.tags[1].name"
          }
        }
      ]);

      expect(actual[1].values[1][0].error).to.equal("Argument 'tag.name' on InputObject 'createTag' is too short. Expected a minimun length of 1.");
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
          "message": "Argument 'address.street' on InputObject 'createAddressInput' is required. Expected type String!",
          "extensions": {
            "dotPath": "mutation.createAddressInput.input.address.street"
          }
        }
      ]);

      expect(actual[0].children[0].error).to.equal("Argument 'address.street' on InputObject 'createAddressInput' is required. Expected type String!");
    });
  });
});

describe('toSentence', () => {
  it('Sentence of values with currency', () => {
    const fields = toFields({
      amount: {
        min: 'currency',
        max: 'currency'
      }
    });

    const fieldsWithValues = mapFieldValues(fields, {
      amount: {
        min: 30,
        max: 1000
      }
    });

    const actual = toSentence(fieldsWithValues);
    const expected = '$30.00 $1,000.00';

    expectToEqual(actual, expected);
  });

  it('Sentence of values', () => {
    const fields = toFields({
      name: 'name',
      email: 'email'
    });

    const fieldsWithValues = mapFieldValues(fields, {
      name: 'joe osburn',
      email: 'joe@jnodev.com'
    });

    const actual = toSentence(fieldsWithValues);
    const expected = 'joe osburn joe@jnodev.com';

    expectToEqual(actual, expected);
  });

  it('Sentence of values with some phrases', () => {
    const fields = toFields({
      name: {
        _input: 'name',
        _phrase: (val, field) => `My name is ${val}`
      },
      email: 'email'
    });

    const fieldsWithValues = mapFieldValues(fields, {
      name: 'joe osburn',
      email: 'joe@jnodev.com'
    });

    const actual = toSentence(fieldsWithValues);
    const expected = 'My name is joe osburn joe@jnodev.com';

    expectToEqual(actual, expected);
  });

  it('Sentence of values with some phrases', () => {
    const fields = toFields({
      name: {
        _input: 'name',
        _format: (val, field) => val.toUpperCase(),
        _phrase: (val, field) => `My name is ${val}`
      },
      email: 'email'
    });

    const fieldsWithValues = mapFieldValues(fields, {
      name: 'joe osburn'
    });

    const actual = toSentence(fieldsWithValues);
    const expected = 'My name is JOE OSBURN';

    expectToEqual(actual, expected);
  });


  it('Sentence with nested fields', () => {
    const fields = toFields({
      name: 'name',
      address: {
        zip: 'text',
        state: 'text',
        country: 'text'
      },
      phone: 'text'
    });

    const fieldsWithValues = mapFieldValues(fields, {
      name: 'joe osburn',
      address: {
        zip: '76177',
        state: 'TX',
        country: 'US'
      },
      phone: '817-945-6101'
    });

    const actual = toSentence(fieldsWithValues);
    const expected = 'joe osburn 76177 TX US 817-945-6101';

    expectToEqual(actual, expected);
  });


  it('Sentence with nested fields with formats and phrases', () => {
    const fields = toFields({
      name: 'name',
      address: {
        state: {
          _input: 'text',
          _phrase: (val, field) => `lives in ${val}`
        }
      },
      phone: {
        _input: 'text',
        _format: (val, field) => val.replace(/\s/g, '-'),
        _phrase: (val, field) => `and can be reached at ${val}`
      }
    });

    const fieldsWithValues = mapFieldValues(fields, {
      name: 'joe osburn',
      address: {
        zip: '76177',
        state: 'TX',
        country: 'US'
      },
      phone: '817 945 6101'
    });

    const actual = toSentence(fieldsWithValues);
    const expected = 'joe osburn lives in TX and can be reached at 817-945-6101';

    expectToEqual(actual, expected);
  });


});

describe('Schema Parser', () => {
  describe('Shorthand', () => {
    it('simple text field', () => {
      const actual = toFields({
        name: 'text'
      });

      const expected = [{
        label: 'Name',
        key: 'name',
        placeholder: false,
        prefix: null,
        help: false,
        multiple: false,
        required: false,
        format: undefined,
        phrase: undefined,
        pattern: null,
        model: false,
        disabled: false,
        autocapitalize: false,
        autocomplete: false,
        autocorrect: false,
        spellcheck: false,
        xAutocompletetype: false,
        value: undefined,
        css: '',
        input: 'text',
        type: 'text',
        name: 'name'
      }];

      expectToEqual(actual, expected);
    });

    it('required email field', () => {
      const actual = toFields({
        email: '*email'
      });

      const expected = [{
        label: 'Email',
        key: 'email',
        placeholder: false,
        prefix: null,
        help: false,
        multiple: false,
        required: true,
        pattern: null,
        model: false,
        format: undefined,
        phrase: undefined,
        disabled: false,
        autocapitalize: 'off',
        autocomplete: 'email',
        autocorrect: 'off',
        spellcheck: 'off',
        xAutocompletetype: 'email',
        value: undefined,
        css: '',
        input: 'email',
        type: 'email',
        name: 'email'
      }];

      expectToEqual(actual, expected);
    });

    it('disabled text field', () => {
      const actual = toFields({
        status: '!*text@Donation'
      });

      expect(actual[0]).to.containSubset({
        disabled: true,
        input: 'text'
      });
    });

    it('required association using select', () => {
      const actual = toFields({
        author: '*select@Author'
      });

      const expected = [{
        label: 'Author',
        key: 'author',
        placeholder: false,
        prefix: null,
        help: false,
        multiple: false,
        required: true,
        format: undefined,
        phrase: undefined,
        pattern: null,
        model: 'Author',
        disabled: false,
        value: undefined,
        css: '',
        input: 'select',
        type: 'association',
        name: 'author'
      }];

      expectToEqual(actual, expected);
    });

    it('required url', () => {
      const actual = toFields({
        website: '*url'
      });

      const expected = [{
        label: 'Website',
        key: 'website',
        placeholder: false,
        prefix: null,
        help: false,
        multiple: false,
        format: undefined,
        phrase: undefined,
        required: true,
        pattern: 'https://.*',
        model: false,
        disabled: false,
        value: undefined,
        css: '',
        input: 'url',
        type: 'text',
        name: 'website'
      }];

      expectToEqual(actual, expected);
    });

    it('multiple via association', () => {
      const actual = toFields({
        'tags': ['select@Tag']
      });

      const expected = [{
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
      }];

      expectToEqual(actual, expected);
    });

    it('checkbox', () => {
      const actual = toFields({
        'member': 'checkbox'
      });

      const expected = [{
        label: 'Member',
        key: 'member',
        placeholder: false,
        prefix: null,
        help: false,
        multiple: false,
        required: false,
        format: undefined,
        phrase: undefined,
        pattern: null,
        model: false,
        disabled: false,
        value: false,
        checked: false,
        css: '',
        input: 'checkbox',
        type: '',
        name: 'member'
      }];

      expectToEqual(actual, expected);
    });
  });

  describe('Longhand', () => {
    it('radio', () => {
      const actual = toFields({
        hasDonation: {
          '_key': 'hasDonation',
          '_label': 'Donor',
          '_input': 'radio',
          '_options': [
            {
              'label': 'True',
              'value': true
            },
            {
              'label': 'False',
              'value': false
            }
          ]
        }
      });

      const expected = [{
        label: 'Donor',
        key: 'hasDonation',
        placeholder: false,
        prefix: null,
        help: false,
        multiple: false,
        required: false,
        pattern: null,
        model: false,
        disabled: false,
        format: undefined,
        phrase: undefined,
        value: undefined,
        css: '',
        type: 'text',
        input: 'radio',
        name: 'hasDonation',
        options: [
          {
            label: "True",
            value: true
          },
          {
            label: "False",
            value: false
          }
        ]
      }];

      expectToEqual(actual, expected);
    });


    it('simple text field', () => {
      const actual = toFields({
        name: {
          _label: 'Name',
          _type: 'text',
          _required: true,
          _input: 'text'
        }
      });

      const expected = [{
        label: 'Name',
        key: 'name',
        placeholder: false,
        prefix: null,
        help: false,
        multiple: false,
        required: true,
        pattern: null,
        model: false,
        disabled: false,
        format: undefined,
        phrase: undefined,
        value: undefined,
        css: '',
        type: 'text',
        input: 'text',
        autocapitalize: false,
        autocomplete: false,
        autocorrect: false,
        spellcheck: false,
        xAutocompletetype: false,
        name: 'name'
      }];

      expectToEqual(actual, expected);
    });


    it('fieldset with no metas', () => {
      const actual = toFields({
        theme: {
          color: {
            _label: 'Color',
            _type: 'text',
            _input: 'color'
          }
        }
      });

      const expected = [{
        css: '',
        disabled: false,
        value: undefined,
        placeholder: false,
        prefix: null,
        help: false,
        multiple: false,
        required: false,
        pattern: null,
        format: undefined,
        phrase: undefined,
        model: false,
        label: 'Theme',
        key: 'theme',
        input: 'fieldset',
        children: [{
          css: '',
          disabled: false,
          value: undefined,
          placeholder: false,
          prefix: null,
          help: false,
          format: undefined,
          phrase: undefined,
          multiple: false,
          required: false,
          pattern: null,
          model: false,
          label: 'Color',
          type: 'text',
          input: 'color',
          name: 'theme.color',
          key: 'color'
        }]
      }];

      expectToEqual(actual, expected);
    });


    it('fieldset with metas', () => {
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

      const expected = [{
        css: '',
        disabled: false,
        value: undefined,
        placeholder: false,
        prefix: null,
        help: false,
        multiple: false,
        required: false,
        pattern: null,
        format: undefined,
        phrase: undefined,
        model: false,
        label: 'Theme',
        input: 'fieldset',
        key: 'theme',
        children: [{
          css: '',
          disabled: false,
          value: undefined,
          placeholder: false,
          prefix: null,
          format: undefined,
          phrase: undefined,
          help: false,
          multiple: false,
          required: false,
          pattern: null,
          model: false,
          label: 'Color',
          type: 'text',
          input: 'color',
          name: 'theme.color',
          key: 'color'
        }]
      }];

      expectToEqual(actual, expected);
    });


    it('select with options', () => {
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

      const expected = [{
        css: '',
        disabled: false,
        value: undefined,
        placeholder: false,
        prefix: null,
        help: false,
        multiple: false,
        required: false,
        format: undefined,
        phrase: undefined,
        pattern: null,
        model: false,
        label: 'Title',
        name: 'title',
        input: 'select',
        type: 'number',
        key: 'title',
        options: [
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
      }];

      expectToEqual(actual, expected);
    });
  });


  describe('Mixed', () => {
    it('multiple via relationship', () => {
      const actual = toFields({
        tags: [{
          _label: 'Tags',
          _input: 'select',
          _type: 'association',
          _model: 'Tag'
        }]
      });

      const expected = [{
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
        model: 'Tag',
        disabled: false,
        value: undefined,
        css: '',
        input: 'select',
        type: 'association',
        name: 'tags'
      }];

      expectToEqual(actual, expected);
    });

    it('multiple with multiple fields', () => {
      const actual = toFields({
        comments: [{
          user: 'text',
          date: 'text',
          comment: 'textarea'
        }]
      });

      const expected = [{
        children: [
          {
            help: false,
            input: 'text',
            label: 'User',
            model: false,
            multiple: false,
            key: 'user',
            pattern: null,
            placeholder: false,
            prefix: null,
            css: '',
            name: 'comments.user',
            required: false,
            disabled: false,
            format: undefined,
            phrase: undefined,
            format: undefined,
            phrase: undefined,
            autocapitalize: false,
            autocomplete: false,
            autocorrect: false,
            spellcheck: false,
            xAutocompletetype: false,
            value: undefined,
            type: 'text'
          },
          {
            help: false,
            input: 'text',
            label: 'Date',
            model: false,
            multiple: false,
            key: 'date',
            css: '',
            pattern: null,
            placeholder: false,
            prefix: null,
            name: 'comments.date',
            disabled: false,
            format: undefined,
            phrase: undefined,
            autocapitalize: false,
            autocomplete: false,
            autocorrect: false,
            spellcheck: false,
            xAutocompletetype: false,
            value: undefined,
            required: false,
            type: 'text'
          },
          {
            help: false,
            input: 'textarea',
            label: 'Comment',
            model: false,
            multiple: false,
            disabled: false,
            css: '',
            value: undefined,
            format: undefined,
            phrase: undefined,
            key: 'comment',
            placeholder: false,
            prefix: null,
            name: 'comments.comment',
            pattern: null,
            required: false,
            type: 'text'
          }
        ],
        help: false,
        label: 'Comments',
        model: false,
        multiple: true,
        key: 'comments',
        format: undefined,
        phrase: undefined,
        disabled: false,
        css: '',
        value: undefined,
        pattern: null,
        placeholder: false,
        prefix: null,
        required: false,
        input: 'fieldset'
      }];

      expectToEqual(actual, expected);
    });

  });


  describe('Doc Validation', () => {
  //   { _type: 'Post',
  // title: 'Post title',
  // body: 'Hi body of post',
  // comments:
  //  [ { user: 'shanebo', date: 'today', comment: 'comment goes here' } ] }


  // const model = {
  //     id: 'Person',
  //     fields: toFields({
  //       title: 'text',
  //       body: 'textarea',
  //       comments: [
  //         {
  //           user: 'text',
  //           date: 'text',
  //           comment: 'textarea'
  //         }
  //       ]
  //     })
  //   };

    // it.only('first pass', () => {
    //   const udoc = {
    //     _type: 'Post',
    //     title: 'Post title',
    //     body: 'Hi body of post',
    //     comments: [{
    //       user: 'shanebo',
    //       date: 'today',
    //       comment: 'comment goes here'
    //     }]
    //   };

    //   const actual = toValidDoc(udoc, model);
    //   console.log({ actual });


    //   const t = arrayToObject([{_title: 'im a title'}, false, { _body: 'im a body' }]);
    //   console.log({ t });



    //   const expected = '';
    //   expectToEqual(actual, expected);
    // });

    // it.only('first pass', () => {
    //   const doc = {
    //     name: 'Shane Thacker',
    //     slogans: [
    //       "It's all gonna burn",
    //       "Hi there buddy"
    //     ],
    //     about: {
    //       region: {
    //         texan: 'true'
    //       }
    //     }
    //   };


    //   const actual = toValidDoc(doc, model);
    //   console.log(actual);
    //   const expected = '';
    //   expectToEqual(actual, expected);
    // });

  });

});
