import { describe, test, expect } from 'bun:test';
import '../lib/utils.js';
import { array, date, number, integer, boolean, object, string } from '../lib/index.js';

describe('coercion', () => {
  test('object', () => {
    const { parse } = object({
      type: string(),
      method: string(),
      merchantId: integer(),
      categoryId: integer()
    }).field({ classes: '-inset' }).fallback({});

    expect(parse({
      type: 'foo',
      method: 'bar',
      merchantId: '',
      categoryId: ''
    })).toEqual({
      type: 'foo',
      method: 'bar'
    });
  });

  test('nullable integer', () => {
    const { parse } = integer().nullable();
    expect(parse('123')).toEqual(123);
    expect(parse(null)).toEqual(null);
    expect(parse('null')).toEqual(null);
    // expect(parse()).toEqual(null);
    expect(parse(true)).toEqual(1);
    expect(parse(false)).toEqual(0);
    expect(parse(123)).toEqual(123);
    expect(parse(undefined)).toEqual(undefined);
  });

  test('object with empty values', () => {
    const { parse } = object({
      merge: object({
        type: string(),
        method: string(),
        merchantId: integer(),
        categoryId: integer()
      })
    });
    expect(parse({
      merge: {
        type: 'foo',
        method: 'bar',
        merchantId: '',
        categoryId: ''
      }
    })).toEqual({
      merge: {
        type: 'foo',
        method: 'bar'
      }
    });

    expect(parse({
      merge: {
        type: '',
        method: '',
        merchantId: '',
        categoryId: ''
      }
    })).toEqual(undefined);
  });

  test('array', () => {
    const { parse } = array(object({
      type: string(),
      method: string(),
      merchantId: integer(),
      categoryId: integer()
    }));
    expect(parse([
      {
        type: 'foo',
        method: 'bar',
        merchantId: '',
        categoryId: ''
      }
    ])).toEqual([{
      type: 'foo',
      method: 'bar'
    }]);
  });

  test('array', () => {
    const { parse } = array(integer()).nullable();
    expect(parse(['1', '2', '3'])).toEqual([1, 2, 3]);
    expect(parse(null)).toEqual(null);
    expect(parse(1)).toEqual([1]);
    expect(parse('1')).toEqual([1]);
    // expect(parse()).toEqual(null);
    // expect(parse(false)).toEqual(false);
    // expect(parse('null')).toEqual(null);
    // expect(parse()).toEqual(null);
    // expect(parse(true)).toEqual(1);
    // expect(parse(false)).toEqual(0);
    // expect(parse(123)).toEqual(123);
    // expect(parse(undefined)).toEqual(null);
  });

  test('object', () => {
    const DashboardQuerySchema = object({
      account: string(),
      categoryId: integer(),
      merchantId: integer(),
      scope: string(),
      flow: string(),
      usual: boolean(),
      method: string(),
      type: string(),
      q: string(),
      amount: object({
        min: number(),
        max: number()
      }),
      date: object({
        min: date(),
        max: date()
      }),
      order: object({
        by: string(),
        direction: string()
      }),
      first: integer(),
      page: integer(),
      limit: integer()
    });

    expect(DashboardQuerySchema.parse({
      date: {
        min: '2022-01-01',
        max: '2022-01-02'
      },
      categoryId: 1
    })).toEqual({
      categoryId: 1,
      date: {
        min: new Date('2022-01-01T00:00:00.000Z'),
        max: new Date('2022-01-02T00:00:00.000Z')
      }
    });
  });

  let counter = 0;
  function makeOptions() {
    let opts = [];
    for (let i = 0; i < 5; i++) {
      opts.push({
        label: (i + counter).toString(),
        value: i + counter
      });
    }

    // console.log({ opts });

    return opts;
  }

  test('lazy loaded options', () => {
    // iterate 3 times and make a new array of options incrementing the counter
    counter++;
    const Schema = number().options(makeOptions);
    expect(Schema.parse(5)).toEqual(5);
    // console.log(Schema.config.options);
  });

  test('another lazy loaded options', () => {
    // iterate 3 times and make a new array of options incrementing the counter
    counter++;
    const Schema = number().options(makeOptions);
    expect(Schema.parse(6)).toEqual(6);
    // console.log(Schema.config.options);
  });

  test('schema', () => {
    const Rule = object({
      name: string().required(),
      conditions: array(
        object({
          field: string().required(),
          operator: string().required(),
          value: string().required()
        })
      ),
      merge: object({
        type: string().options(['foo', 'bar']).field({ itemOptions: { type: 'option' }}),
        method: string().options(['foo', 'bar']).field({ itemOptions: { type: 'option' }}),
        merchantId: integer().options([1, 2, 3]).field({ itemOptions: { type: 'option' }}),
        categoryId: integer().options([1, 2, 3]).field({ itemOptions: { type: 'option' }})
      }).field({ classes: '-inset' }).fallback({})
    });

    const result = Rule.safeParse({
      name: 'foo',
      conditions: [
        {
          value: 'yo'
        }
      ]
    });

    // console.log({ result });

    expect(result.errors).toMatchObject({
      conditions: [
        {
          field: 'is required',
          operator: 'is required'
        }
      ]
    });
  });

  test('transform', () => {
    function toTimezonedDate(d) {
      if (typeof d !== 'string') return d;
      const newDate = new Date(d + 'T00:00:00');
      // console.log({ key: 'min', d, newDate });
      return newDate;
    }

    const Filters = object({
      date: object({
        min: date().transform(toTimezonedDate),
        max: date().transform(toTimezonedDate)
        // min: date().transform(d => new Date(d + 'T00:00:00')),
        // max: date().transform(d => new Date(d + 'T00:00:00'))
      })
    });

    const result = Filters.safeParse({
      date: {
        min: '2022-01-01',
        max: '2022-12-31'
      }
    });

    // console.log({ result });

    expect(result.data).toMatchObject({
      date: {
        min: new Date('2022-01-01T00:00:00'),
        max: new Date('2022-12-31T00:00:00')
      }
    });
  });

  test('modifiers', () => {
    const Interface = object({
      dot: boolean().modifier()
    });

    const result = Interface.safeParse({
      dot: true
    });

    const modifiers = Interface.modifiers(result.data);

    console.log({ result });
    expect(modifiers).toEqual('-dot');
  });
});

describe('coercion edge cases', () => {
  test('empty string to undefined for numbers', () => {
    const Schema = object({
      amount: number()
    });

    // Empty string coerces to undefined for numbers, so the field is omitted
    expect(Schema.parse({ amount: '' })).toEqual(undefined);
    expect(Schema.parse({ amount: '123' })).toEqual({ amount: 123 });
  });

  test('string to boolean coercion', () => {
    const Schema = boolean();
    // Any non-empty string coerces to true (via Boolean() conversion)
    expect(Schema.parse('true')).toEqual(true);
    expect(Schema.parse('false')).toEqual(true); // Non-empty string is truthy

    // Empty string returns undefined (treated as "not provided" before coercion)
    // This happens in coerceValue() before the boolean coercion function runs
    // The check `if (value === '' && !config.required && !config.nullable && config.fallback === undefined)`
    // returns undefined for empty strings, so they never get coerced to false
    expect(Schema.parse('')).toEqual(undefined);
    expect(Schema.parse('anything')).toEqual(true);
  });

  test('number to boolean coercion', () => {
    const Schema = boolean();
    expect(Schema.parse(1)).toEqual(true);
    expect(Schema.parse(0)).toEqual(false);
    expect(Schema.parse(-1)).toEqual(true);
  });

  test('string to date coercion', () => {
    const Schema = date();
    const dateStr = '2022-01-01';
    const parsed = Schema.parse(dateStr);

    expect(parsed).toBeInstanceOf(Date);
    expect(parsed.getTime()).toEqual(new Date(dateStr).getTime());
  });

  test('object with all empty values returns undefined', () => {
    const Schema = object({
      type: string(),
      method: string()
    });

    expect(Schema.parse({
      type: '',
      method: ''
    })).toEqual(undefined);
  });

  test('HTML checkbox "on" value coerces to true for boolean fields', () => {
    const Schema = object({
      label: string(),
      isActive: boolean(),
      isSelected: boolean()
    });

    // HTML checkboxes send "on" when checked
    const result = Schema.parse({
      label: 'test',
      isActive: 'on',
      isSelected: 'on'
    });

    expect(result).toEqual({
      label: 'test',
      isActive: true,
      isSelected: true
    });
  });
});
