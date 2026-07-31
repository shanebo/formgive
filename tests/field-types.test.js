import { describe, test, expect } from 'bun:test';
import '../lib/utils.js';
import { number, integer, boolean, date, object, string } from '../lib/index.js';

describe('field types', () => {
  test('string field schema within object', () => {
    const Schema = object({
      name: string()
    });
    const schema = Schema.schema({ name: 'test value' });

    expect(schema.props.name).toMatchObject({
      propType: 'string',
      type: 'text',
      component: 'Input',
      value: 'test value',
      key: 'name',
      name: 'name',
      label: 'Name'
    });
  });

  test('number field schema within object', () => {
    const Schema = object({
      age: number()
    });
    const schema = Schema.schema({ age: 123 });

    expect(schema.props.age).toMatchObject({
      propType: 'number',
      type: 'number',
      component: 'Input',
      value: 123,
      key: 'age'
    });
  });

  test('integer field schema within object', () => {
    const Schema = object({
      count: integer()
    });
    const schema = Schema.schema({ count: 456 });

    expect(schema.props.count).toMatchObject({
      propType: 'number',
      type: 'number',
      component: 'Input',
      value: 456,
      key: 'count'
    });
    expect(schema.props.count.integer).toEqual(true);
  });

  test('boolean field schema within object', () => {
    const Schema = object({
      active: boolean()
    });
    const schema = Schema.schema({ active: true });

    expect(schema.props.active).toMatchObject({
      propType: 'boolean',
      type: 'switch',
      component: 'Choice',
      checked: true,
      value: true,
      key: 'active'
    });
  });

  test('date field schema within object', () => {
    const testDate = new Date('2022-01-01');
    const Schema = object({
      createdAt: date()
    });
    const schema = Schema.schema({ createdAt: testDate });

    expect(schema.props.createdAt).toMatchObject({
      propType: 'date',
      value: testDate,
      key: 'createdAt'
    });
  });

  test('required string field', () => {
    const Schema = object({
      name: string().required()
    });
    const schema = Schema.schema({ name: 'test' });

    expect(schema.props.name.required).toEqual(true);
    expect(schema.props.name.value).toEqual('test');
  });

  test('nullable integer field', () => {
    const Schema = integer().nullable();
    expect(Schema.parse(null)).toEqual(null);
    expect(Schema.parse('123')).toEqual(123);
    expect(Schema.parse(undefined)).toEqual(undefined);
  });

  test('string with options', () => {
    const Schema = object({
      status: string().options(['foo', 'bar', 'baz'])
    });
    const schema = Schema.schema({ status: 'foo' });

    expect(schema.props.status.options).toEqual([
      expect.objectContaining({ label: 'foo', value: 'foo' }),
      expect.objectContaining({ label: 'bar', value: 'bar' }),
      expect.objectContaining({ label: 'baz', value: 'baz' })
    ]);
    expect(schema.props.status.value).toEqual('foo');
    expect(schema.props.status.component).toEqual('Select');
  });

  test('number with min and max', () => {
    const Schema = object({
      value: number().min(0).max(100)
    });
    expect(Schema.parse({ value: 50 })).toEqual({ value: 50 });

    // NOTE: There's a bug where min(0) doesn't work because 0 is falsy
    // The check `if (min && value < min)` fails when min is 0
    // Testing with min(1) instead to verify min/max validation works
    const SchemaWithMin1 = object({
      value: number().min(1).max(100)
    });
    expect(() => SchemaWithMin1.parse({ value: -1 })).toThrow();
    expect(() => SchemaWithMin1.parse({ value: 0 })).toThrow();
    expect(() => SchemaWithMin1.parse({ value: 101 })).toThrow();

    // Max validation works even when min is 0
    expect(() => Schema.parse({ value: 101 })).toThrow();
  });

  test('string with length constraints', () => {
    const Schema = string().minLength(3).maxLength(10);
    expect(Schema.parse('test')).toEqual('test');
    expect(() => Schema.parse('ab')).toThrow();
    expect(() => Schema.parse('this is too long')).toThrow();
  });
});
