import { describe, test, expect } from 'bun:test';
import '../lib/utils.js';
import { array, number, object, string } from '../lib/index.js';

// NOTE: The old API had a `toSentence` function that formatted field values into a sentence string.
// This functionality doesn't exist in the new API yet. These tests are ported but skipped until
// equivalent functionality is implemented.

describe('toSentence', () => {
  test.skip('formats values', () => {
    // Old API:
    // const fields = toFields({
    //   name: 'name',
    //   email: 'email'
    // }, {
    //   name: 'shane thacker',
    //   email: 'shane@steadymade.com'
    // });
    // const actual = toSentence(fields);
    // expect(actual).to.equal('shane thacker shane@steadymade.com');

    // New API equivalent would be:
    const Schema = object({
      name: string(),
      email: string()
    });
    const schema = Schema.schema({
      name: 'shane thacker',
      email: 'shane@steadymade.com'
    });

    // TODO: Implement toSentence equivalent or similar functionality
    // const actual = toSentence(schema);
    // expect(actual).toEqual('shane thacker shane@steadymade.com');
  });

  test.skip('formats values with currency', () => {
    // Old API:
    // const fields = toFields({
    //   amount: {
    //     min: 'currency',
    //     max: 'currency'
    //   }
    // }, {
    //   amount: {
    //     min: 30,
    //     max: 1000
    //   }
    // });
    // const actual = toSentence(fields);
    // expect(actual).to.equal('$30.00 $1,000.00');

    const Schema = object({
      amount: object({
        min: number().field({ prefix: '$' }),
        max: number().field({ prefix: '$' })
      })
    });
    const schema = Schema.schema({
      amount: {
        min: 30,
        max: 1000
      }
    });

    // TODO: Implement toSentence equivalent with currency formatting
    // const actual = toSentence(schema);
    // expect(actual).toEqual('$30.00 $1,000.00');
  });

  test.skip('handles values with some phrases', () => {
    // Old API had _phrase callback support:
    // const fields = toFields({
    //   name: {
    //     _input: 'name',
    //     _phrase: (val, field) => `My name is ${val}`
    //   },
    //   email: 'email'
    // }, {
    //   name: 'shane thacker',
    //   email: 'shane@steadymade.com'
    // });
    // const actual = toSentence(fields);
    // expect(actual).to.equal('My name is shane thacker shane@steadymade.com');

    const Schema = object({
      name: string(),
      email: string()
    });
    const schema = Schema.schema({
      name: 'shane thacker',
      email: 'shane@steadymade.com'
    });

    // TODO: Implement phrase support in new API
    // const actual = toSentence(schema);
    // expect(actual).toEqual('My name is shane thacker shane@steadymade.com');
  });

  test.skip('handles values with some phrases and format', () => {
    // Old API had _format and _phrase callbacks:
    // const fields = toFields({
    //   name: {
    //     _input: 'name',
    //     _format: (val, field) => val.toUpperCase(),
    //     _phrase: (val, field) => `My name is ${val}`
    //   },
    //   email: 'email'
    // }, {
    //   name: 'shane thacker'
    // });
    // const actual = toSentence(fields);
    // expect(actual).to.equal('My name is SHANE THACKER');

    const Schema = object({
      name: string(),
      email: string()
    });
    const schema = Schema.schema({
      name: 'shane thacker'
    });

    // TODO: Implement format and phrase support in new API
    // const actual = toSentence(schema);
    // expect(actual).toEqual('My name is SHANE THACKER');
  });

  test.skip('handles values with nested fields', () => {
    // Old API:
    // const fields = toFields({
    //   name: 'name',
    //   address: {
    //     zip: 'text',
    //     state: 'text',
    //     country: 'text'
    //   },
    //   phone: 'text'
    // }, {
    //   name: 'shane thacker',
    //   address: {
    //     zip: '76177',
    //     state: 'TX',
    //     country: 'US'
    //   },
    //   phone: '817-945-6101'
    // });
    // const actual = toSentence(fields);
    // expect(actual).to.equal('shane thacker 76177 TX US 817-945-6101');

    const Schema = object({
      name: string(),
      address: object({
        zip: string(),
        state: string(),
        country: string()
      }),
      phone: string()
    });
    const schema = Schema.schema({
      name: 'shane thacker',
      address: {
        zip: '76177',
        state: 'TX',
        country: 'US'
      },
      phone: '817-945-6101'
    });

    // TODO: Implement toSentence with nested field support
    // const actual = toSentence(schema);
    // expect(actual).toEqual('shane thacker 76177 TX US 817-945-6101');
  });

  test.skip('handles values with nested fields with formats and phrases', () => {
    // Old API:
    // const fields = toFields({
    //   name: 'name',
    //   address: {
    //     state: {
    //       _input: 'text',
    //       _phrase: (val, field) => `lives in ${val}`
    //     }
    //   },
    //   phone: {
    //     _input: 'text',
    //     _format: (val, field) => val.replace(/\s/g, '-'),
    //     _phrase: (val, field) => `and can be reached at ${val}`
    //   }
    // }, {
    //   name: 'shane thacker',
    //   address: {
    //     zip: '76177',
    //     state: 'TX',
    //     country: 'US'
    //   },
    //   phone: '817 945 6101'
    // });
    // const actual = toSentence(fields);
    // expect(actual).to.equal('shane thacker lives in TX and can be reached at 817-945-6101');

    const Schema = object({
      name: string(),
      address: object({
        state: string()
      }),
      phone: string()
    });
    const schema = Schema.schema({
      name: 'shane thacker',
      address: {
        zip: '76177',
        state: 'TX',
        country: 'US'
      },
      phone: '817 945 6101'
    });

    // TODO: Implement toSentence with format and phrase support for nested fields
    // const actual = toSentence(schema);
    // expect(actual).toEqual('shane thacker lives in TX and can be reached at 817-945-6101');
  });
});
