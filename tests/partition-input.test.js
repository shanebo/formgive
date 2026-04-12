import { describe, test, expect } from 'bun:test';
import { object, string, number } from '../lib/index.js';


describe('composeInputs with function compositions', () => {
  test('invokes function and assigns result', () => {
    const Schema = object({
      foo: string(),
      bar: number()
    }).compose('mapped', (input) => ({ a: input.foo, doubled: input.bar * 2 }));

    const input = { foo: 'hi', bar: 3, extra: 'x' };
    const out = Schema.composeInputs(input);

    expect(out.mapped).toEqual({ a: 'hi', doubled: 6 });
  });
});


describe('partitionInput', () => {
  test('splits known vs unknown keys', () => {
    const Schema = object({
      name: string(),
      age: number()
    }).partitionInput();

    const input = { name: 'Ada', age: 36, 'data-x': 'y', extra: true };
    const { knownInput, unknownInput } = Schema.composeInputs(input);

    expect(knownInput).toEqual({ name: 'Ada', age: 36 });
    expect(unknownInput).toEqual({ 'data-x': 'y', extra: true });
  });

  test('extend moves new prop from unknown to known', () => {
    const Base = object({
      a: string()
    }).partitionInput();

    const Extended = Base.extend({
      b: string()
    });

    const input = { a: '1', b: '2', c: '3' };
    const { knownInput, unknownInput } = Extended.composeInputs(input);

    expect(knownInput).toEqual({ a: '1', b: '2' });
    expect(unknownInput).toEqual({ c: '3' });
  });

  test('sibling extends keep partition bindings isolated', () => {
    const Base = object({
      base: string()
    }).partitionInput();

    const A = Base.extend({
      a: string()
    });

    Base.extend({
      b: string()
    });

    const input = { base: 'x', a: '1', extra: 'e' };
    const { knownInput, unknownInput } = A.composeInputs(input);

    expect(knownInput).toEqual({ base: 'x', a: '1' });
    expect(unknownInput).toEqual({ extra: 'e' });
  });

  test('merge combines props and rebinding partition', () => {
    const A = object({ x: string() }).partitionInput();
    const B = object({ y: string() }).partitionInput();

    const Merged = A.merge(B);
    const input = { x: 'a', y: 'b', z: 'c' };
    const { knownInput, unknownInput } = Merged.composeInputs(input);

    expect(knownInput).toEqual({ x: 'a', y: 'b' });
    expect(unknownInput).toEqual({ z: 'c' });
  });

  test('pick rebinding keeps partition in sync', () => {
    const Schema = object({
      keep: string(),
      drop: number()
    }).partitionInput();

    const Picked = Schema.pick(['keep']);
    const input = { keep: 'k', other: 1 };
    const { knownInput, unknownInput } = Picked.composeInputs(input);

    expect(knownInput).toEqual({ keep: 'k' });
    expect(unknownInput).toEqual({ other: 1 });
  });
});
