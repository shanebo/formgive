import { describe, test, expect } from 'bun:test';
import '../lib/utils.js';
import { integer, object, string, array } from '../lib/index.js';


function repeatSchema() {
  return object({
    frequency: string().fallback(''),
    every: integer().fallback(1),
    days: array(integer()).fallback([])
  });
}


describe('nullable nested objects', () => {
  test('nullable object preserves null through data/parse', () => {
    const Schema = object({
      dueKind: string().fallback(''),
      repeat: repeatSchema().nullable()
    });

    expect(Schema.data({ repeat: null })).toEqual({ dueKind: '', repeat: null });
    expect(Schema.parse({ repeat: null })).toEqual({ dueKind: '', repeat: null });
    expect(Schema.parse({ dueKind: 'week', repeat: null }, { partial: true })).toEqual({
      dueKind: 'week',
      repeat: null
    });
  });


  test('nullable().fallback(null) preserves explicit null', () => {
    const Schema = object({
      dueKind: string().fallback(''),
      repeat: repeatSchema().nullable().fallback(null)
    });

    expect(Schema.parse({ repeat: null })).toEqual({ dueKind: '', repeat: null });
    expect(Schema.parse({ dueKind: 'week', repeat: null }, { partial: true })).toEqual({
      dueKind: 'week',
      repeat: null
    });
  });


  test('partial parse of only null object field returns that null field', () => {
    const Schema = object({
      dueKind: string().fallback(''),
      repeat: repeatSchema().nullable().fallback(null)
    });

    expect(Schema.parse({ repeat: null }, { partial: true })).toEqual({
      repeat: null
    });
  });


  test('nullable object still parses real objects', () => {
    const Schema = object({
      repeat: repeatSchema().nullable().fallback(null)
    });

    expect(Schema.parse({
      repeat: { frequency: 'weekly', every: 2, days: [1] }
    })).toEqual({
      repeat: { frequency: 'weekly', every: 2, days: [1] }
    });
  });


  test('null nested object validates cleanly when nullable', () => {
    expect(object({ repeat: repeatSchema().nullable() }).validate({ repeat: null })).toBe(null);
    expect(repeatSchema().nullable().validate(null)).toBe(null);
  });


  test('fallback(null) alone does not allow explicit null', () => {
    const Schema = object({
      repeat: repeatSchema().fallback(null)
    });

    expect(Schema.safeParse({ repeat: null }).errors).toEqual({
      repeat: 'cannot be null'
    });
  });


  test('null nested object still errors when not nullable', () => {
    const Schema = object({
      repeat: repeatSchema()
    });

    expect(Schema.safeParse({ repeat: null }).errors).toEqual({
      repeat: 'cannot be null'
    });
  });
});
