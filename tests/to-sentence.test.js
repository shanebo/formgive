import { describe, test, expect } from 'bun:test';
import '../lib/utils.js';
import { array, boolean, number, object, string } from '../lib/index.js';

// NOTE: The old API had a `toSentence` function that formatted field values into a sentence string.
// This functionality doesn't exist in the new API yet. These tests are ported but skipped until
// equivalent functionality is implemented.

describe('toSentence', () => {
  test('formats values', () => {
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
      name: string().sentence(),
      email: string().sentence()
    });
    const sentence = Schema.toSentence({
      name: 'shane thacker',
      email: 'shane@steadymade.com'
    });

    expect(sentence).toEqual('shane thacker shane@steadymade.com');
  });

  test('formats values with currency', () => {
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
        min: number().field({ prefix: '$' }).sentence(),
        max: number().field({ prefix: '$' }).sentence()
      })
    });
    const sentence = Schema.toSentence({
      amount: {
        min: 30,
        max: 1000
      }
    });

    expect(sentence).toEqual('$30.00 $1,000.00');
  });

  test('handles values with some phrases', () => {
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
      name: string().sentence({
        phrase: (text) => `My name is ${text}`
      }),
      email: string().sentence()
    });
    const sentence = Schema.toSentence({
      name: 'shane thacker',
      email: 'shane@steadymade.com'
    });

    expect(sentence).toEqual('My name is shane thacker shane@steadymade.com');
  });

  test('handles values with some phrases and format', () => {
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
      name: string().sentence({
        format: (val) => String(val).toUpperCase(),
        phrase: (text) => `My name is ${text}`
      }),
      email: string()
    });
    const sentence = Schema.toSentence({
      name: 'shane thacker'
    });

    expect(sentence).toEqual('My name is SHANE THACKER');
  });

  test('handles values with nested fields', () => {
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
      name: string().sentence(),
      address: object({
        zip: string().sentence(),
        state: string().sentence(),
        country: string().sentence()
      }),
      phone: string().sentence()
    });
    const sentence = Schema.toSentence({
      name: 'shane thacker',
      address: {
        zip: '76177',
        state: 'TX',
        country: 'US'
      },
      phone: '817-945-6101'
    });

    expect(sentence).toEqual('shane thacker 76177 TX US 817-945-6101');
  });

  test('handles values with nested fields with formats and phrases', () => {
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
      name: string().sentence(),
      address: object({
        state: string().sentence({
          prefix: 'lives in'
        })
      }),
      phone: string().sentence({
        format: (val) => String(val).replace(/\s/g, '-'),
        phrase: (text) => `and can be reached at ${text}`
      })
    });
    const sentence = Schema.toSentence({
      name: 'shane thacker',
      address: {
        zip: '76177',
        state: 'TX',
        country: 'US'
      },
      phone: '817 945 6101'
    });

    expect(sentence).toEqual('shane thacker lives in TX and can be reached at 817-945-6101');
  });

  describe('Interface schema example', () => {
    const figureOptions = [
      { label: 'Horatius Bonar', value: 'HB' },
      { label: 'John Owen', value: 'JO' }
    ];

    const topics = [
      { label: 'Justification', value: 'JUSTIFICATION' },
      { label: 'Sanctification', value: 'SANCTIFICATION' }
    ];

    const Interface = object({
      unabridged: boolean().sentence(),
      type: string()
        .options([
          { label: 'Book', value: 'BOOK' },
          { label: 'Booklet', value: 'BOOKLET' },
          { label: 'Ebook', value: 'EBOOK' }
        ])
        .sentence({
          transform: (text) => text.toLowerCase() + 's'
        }),
      figureId: string()
        .options(figureOptions)
        .sentence({ prefix: 'by' }),
      topic: string()
        .options(topics)
        .sentence({
          prefix: 'on',
          transform: (text) => text.toLowerCase()
        })
    });

    test('renders full sentence', () => {
      const sentence = Interface.toSentence({
        unabridged: true,
        type: 'BOOKLET',
        figureId: 'HB',
        topic: 'JUSTIFICATION'
      });

      expect(sentence).toEqual('Unabridged booklets by Horatius Bonar on justification');
    });

    test('renders partial sentence (only topic)', () => {
      const sentence = Interface.toSentence({
        topic: 'JUSTIFICATION'
      });

      expect(sentence).toEqual('on justification');
    });

    test('omits boolean when false and omits undefined', () => {
      const sentence = Interface.toSentence({
        unabridged: false,
        type: 'BOOK',
        figureId: undefined
      });

      expect(sentence).toEqual('books');
    });
  });
});
