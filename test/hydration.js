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
      date: 'dateRange'
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
      }
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

    const values = actual.foo.tags.map((tag) => tag.name._attributes.value);
    expect(values).to.eql([ 'theology', 'practice', 'application' ]);
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

    it.skip('hydrates errors on multiple fields', () => {
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

      expect(actual.tags[1].name._error).to.equal("Argument 'tag.name' on InputObject 'createTag' is too short. Expected a minimun length of 1.");
    });
  });
});
