import { describe, test, expect } from 'bun:test';
import '../lib/utils.js';
import formgive, { callable, object } from '../lib/index.js';

describe('callable', () => {
  test('exports callable on default and named APIs', () => {
    expect(typeof formgive.callable).toBe('function');
    expect(formgive.callable).toBe(callable);
  });

  test('parses function values', () => {
    function sum(a, b) {
      return a + b;
    }

    expect(callable().parse(sum)).toBe(sum);
  });

  test('rejects non-function values', () => {
    const result = callable().safeParse('nope');

    expect(result.errors).toBe('should be a function');
  });

  test('shows function prop type in object schemas', () => {
    function run() {
      return true;
    }

    const Schema = object({
      action: callable()
    });

    expect(Schema.schema({ action: run }).props.action).toMatchObject({
      propType: 'function',
      value: run
    });
  });
});
