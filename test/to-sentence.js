const chai = require('chai');

const { expect } = chai;
const { toFields, toSentence } = require('../lib');


describe('toSentence', () => {
  it('formats values', () => {
    const fields = toFields({
      name: 'name',
      email: 'email'
    },
    {
      name: 'shane thacker',
      email: 'shane@steadymade.com'
    });

    const actual = toSentence(fields);
    expect(actual).to.equal('shane thacker shane@steadymade.com');
  });

  it('formats values with currency', () => {
    const fields = toFields({
      amount: {
        min: 'currency',
        max: 'currency'
      }
    },
    {
      amount: {
        min: 30,
        max: 1000
      }
    });

    const actual = toSentence(fields);
    expect(actual).to.equal('$30.00 $1,000.00');
  });

  it('handles values with some phrases', () => {
    const fields = toFields({
      name: {
        _input: 'name',
        _phrase: (val, field) => `My name is ${val}`
      },
      email: 'email'
    },
    {
      name: 'shane thacker',
      email: 'shane@steadymade.com'
    });

    const actual = toSentence(fields);
    expect(actual).to.equal('My name is shane thacker shane@steadymade.com');
  });

  it('handles values with some phrases and format', () => {
    const fields = toFields({
      name: {
        _input: 'name',
        _format: (val, field) => val.toUpperCase(),
        _phrase: (val, field) => `My name is ${val}`
      },
      email: 'email'
    },
    {
      name: 'shane thacker'
    });

    const actual = toSentence(fields);
    expect(actual).to.equal('My name is SHANE THACKER');
  });

  it('handles values with nested fields', () => {
    const fields = toFields({
      name: 'name',
      address: {
        zip: 'text',
        state: 'text',
        country: 'text'
      },
      phone: 'text'
    },
    {
      name: 'shane thacker',
      address: {
        zip: '76177',
        state: 'TX',
        country: 'US'
      },
      phone: '817-945-6101'
    });

    const actual = toSentence(fields);
    expect(actual).to.equal('shane thacker 76177 TX US 817-945-6101');
  });

  it('handles values with nested fields with formats and phrases', () => {
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
    },
    {
      name: 'shane thacker',
      address: {
        zip: '76177',
        state: 'TX',
        country: 'US'
      },
      phone: '817 945 6101'
    });

    const actual = toSentence(fields);
    expect(actual).to.equal('shane thacker lives in TX and can be reached at 817-945-6101');
  });
});
