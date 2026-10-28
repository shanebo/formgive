import { describe, test, expect } from 'bun:test';
import '../lib/utils.js';
import { array, integer, object, string } from '../lib/index.js';

describe('arrays', () => {
  test('array of strings', () => {
    const Schema = array(string());
    const input = ['foo', 'bar', 'baz'];

    const parsed = Schema.parse(input);
    expect(parsed).toEqual(input);

    const schema = Schema.schema(input);
    expect(schema).toMatchObject({
      propType: 'array',
      schemaType: 'array',
      value: input
    });
    expect(schema.items).toHaveLength(3);
    // Array items are schema objects, not value objects
    expect(schema.items[0]).toMatchObject({
      propType: 'string',
      schemaType: 'string'
    });
    expect(schema.items[1].propType).toEqual('string');
    expect(schema.items[2].propType).toEqual('string');
  });

  test('array of integers', () => {
    const Schema = array(integer());
    const input = ['1', '2', '3'];

    const parsed = Schema.parse(input);
    expect(parsed).toEqual([1, 2, 3]);
  });

  test('array of objects', () => {
    const Schema = array(object({
      name: string(),
      email: string()
    }));

    const input = [
      { name: 'John', email: 'john@example.com' },
      { name: 'Jane', email: 'jane@example.com' }
    ];

    const parsed = Schema.parse(input);
    expect(parsed).toEqual(input);

    const schema = Schema.schema(input);
    expect(schema.items).toHaveLength(2);
    expect(schema.items[0].props.name.value).toEqual('John');
    expect(schema.items[1].props.email.value).toEqual('jane@example.com');
  });

  test('nullable array', () => {
    const Schema = array(integer()).nullable();
    expect(Schema.parse(null)).toEqual(null);
    expect(Schema.parse(['1', '2'])).toEqual([1, 2]);
    expect(Schema.parse(1)).toEqual([1]);
    expect(Schema.parse('1')).toEqual([1]);
  });

  test('array coercion from single value', () => {
    const Schema = array(string());
    expect(Schema.parse('single')).toEqual(['single']);
  });

  test('empty string coerces to empty array', () => {
    const Schema = array(string());
    expect(Schema.parse('')).toEqual([]);
  });

  test('empty array items are removed during parsing', () => {
    const Schema = array(string());
    expect(Schema.parse([''])).toEqual([]);
    expect(Schema.parse(['', 'a', '', 'b'])).toEqual(['a', 'b']);
  });

  test('length rules count items', () => {
    expect(array(string()).minLength(1).safeParse([]).errors).toEqual('should be length of at least 1');
    expect(array(string()).maxLength(1).safeParse(['a', 'b']).errors).toEqual('should be length no more than 1');
    expect(array(string()).length(2).safeParse(['a']).errors).toEqual('should be a length of 2');
    expect(array(string()).minLength(1).safeParse(['a']).errors).toEqual(null);
  });

  test('options check every item', () => {
    const Schema = array(integer()).options([1, 2]);

    expect(Schema.safeParse(['3']).errors).toEqual('should be one of 1, 2 instead of 3');
    expect(Schema.safeParse(['1', '2']).errors).toEqual(null);
  });

  test('test gets the whole array', () => {
    const Schema = array(string()).test(items => new Set(items).size === items.length);

    expect(Schema.safeParse(['a', 'a']).errors).toEqual('does not pass the custom validator');
    expect(Schema.safeParse(['a', 'b']).errors).toEqual(null);
  });

  test('array rule errors replace item errors', () => {
    const Schema = array(object({ name: string().required() })).maxLength(1);

    expect(Schema.safeParse([{}, {}]).errors).toEqual('should be length no more than 1');
  });

  test('item errors keep their position', () => {
    const Schema = array(object({ name: string().required() }));

    expect(Schema.safeParse([{ name: 'a' }, {}, { name: 'c' }]).errors).toEqual([
      null,
      { name: 'is required' },
      null
    ]);
  });
});
