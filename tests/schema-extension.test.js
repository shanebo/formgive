import { describe, test, expect } from 'bun:test';
import '../lib/utils.js';
import { object, string, number, boolean } from '../lib/index.js';

describe('schema extension methods', () => {
  describe('.extend()', () => {
    test('should add new fields to an existing schema', () => {
      const BaseSchema = object({
        name: string().required(),
        age: number()
      });

      const ExtendedSchema = BaseSchema.extend({
        email: string().required(),
        isActive: boolean()
      });

      const result = ExtendedSchema.parse({
        name: 'John',
        age: 30,
        email: 'john@example.com',
        isActive: true
      });

      expect(result).toMatchObject({
        name: 'John',
        age: 30,
        email: 'john@example.com',
        isActive: true
      });
    });

    test('should override existing fields when extending', () => {
      const BaseSchema = object({
        name: string(),
        age: number()
      });

      const ExtendedSchema = BaseSchema.extend({
        age: number().min(18).max(100) // Override with more strict validation
      });

      // Should work with valid age
      expect(() => ExtendedSchema.parse({ name: 'John', age: 25 })).not.toThrow();

      // Should fail with invalid age
      expect(() => ExtendedSchema.parse({ name: 'John', age: 150 })).toThrow();
    });

    test('should preserve original schema when extending', () => {
      const BaseSchema = object({
        name: string().required()
      });

      const ExtendedSchema = BaseSchema.extend({
        email: string()
      });

      // Original schema should still work
      expect(BaseSchema.parse({ name: 'John' })).toMatchObject({ name: 'John' });

      // Extended schema should have both fields
      expect(ExtendedSchema.parse({ name: 'John', email: 'john@example.com' }))
        .toMatchObject({ name: 'John', email: 'john@example.com' });
    });

    test('should not mutate original schema config when extending', () => {
      const BaseSchema = object({
        name: string().required(),
        age: number()
      });

      // Store original props reference
      const originalProps = BaseSchema.config.props;
      const originalPropsKeys = Object.keys(originalProps);

      const ExtendedSchema = BaseSchema.extend({
        email: string(),
        phone: string()
      });

      // Original schema's props should be unchanged
      expect(BaseSchema.config.props).toBe(originalProps);
      expect(Object.keys(BaseSchema.config.props)).toEqual(originalPropsKeys);
      expect(BaseSchema.config.props).not.toHaveProperty('email');
      expect(BaseSchema.config.props).not.toHaveProperty('phone');

      // Extended schema should have new props
      expect(Object.keys(ExtendedSchema.config.props)).toContain('name');
      expect(Object.keys(ExtendedSchema.config.props)).toContain('age');
      expect(Object.keys(ExtendedSchema.config.props)).toContain('email');
      expect(Object.keys(ExtendedSchema.config.props)).toContain('phone');

      // They should be different objects
      expect(ExtendedSchema.config.props).not.toBe(BaseSchema.config.props);
    });

    test('should put new props first in key order when extending', () => {
      const BaseSchema = object({
        name: string().required(),
        age: number()
      });

      const ExtendedSchema = BaseSchema.extend({
        email: string(),
        phone: string()
      });

      // New props should appear first in the key order
      const keys = Object.keys(ExtendedSchema.config.props);
      expect(keys[0]).toBe('email');
      expect(keys[1]).toBe('phone');
      expect(keys[2]).toBe('name');
      expect(keys[3]).toBe('age');
    });
  });

  describe('.merge()', () => {
    test('should combine two schemas', () => {
      const BaseSchema = object({
        id: string().required(),
        name: string()
      });

      const ProfileSchema = object({
        email: string().required(),
        age: number()
      });

      const MergedSchema = BaseSchema.merge(ProfileSchema);

      const result = MergedSchema.parse({
        id: '123',
        name: 'John',
        email: 'john@example.com',
        age: 30
      });

      expect(result).toMatchObject({
        id: '123',
        name: 'John',
        email: 'john@example.com',
        age: 30
      });
    });

    test('should override fields from first schema with second schema', () => {
      const Schema1 = object({
        name: string(),
        age: number()
      });

      const Schema2 = object({
        age: number().min(18) // Override age with stricter validation
      });

      const MergedSchema = Schema1.merge(Schema2);

      // Should fail with age < 18
      expect(() => MergedSchema.parse({ name: 'John', age: 15 })).toThrow();

      // Should work with age >= 18
      expect(() => MergedSchema.parse({ name: 'John', age: 25 })).not.toThrow();
    });
  });

  describe('.pick()', () => {
    test('should create schema with only selected fields', () => {
      const FullSchema = object({
        id: string().required(),
        name: string().required(),
        email: string().required(),
        password: string().required()
      });

      const PublicSchema = FullSchema.pick(['id', 'name']);

      const result = PublicSchema.parse({
        id: '123',
        name: 'John'
      });

      expect(result).toMatchObject({
        id: '123',
        name: 'John'
      });

      // Should not include email or password
      expect(result.email).toBeUndefined();
      expect(result.password).toBeUndefined();
    });

    test('should preserve validation rules for picked fields', () => {
      const FullSchema = object({
        name: string().required(),
        email: string().required()
      });

      const NameOnlySchema = FullSchema.pick(['name']);

      // Should still require name
      expect(() => NameOnlySchema.parse({})).toThrow();
      expect(() => NameOnlySchema.parse({ name: 'John' })).not.toThrow();
    });
  });

  describe('.omit()', () => {
    test('should create schema excluding specified fields', () => {
      const FullSchema = object({
        id: string().required(),
        name: string().required(),
        email: string().required(),
        password: string().required()
      });

      const PublicSchema = FullSchema.omit(['password', 'email']);

      const result = PublicSchema.parse({
        id: '123',
        name: 'John'
      });

      expect(result).toMatchObject({
        id: '123',
        name: 'John'
      });

      // Should not include omitted fields
      expect(result.email).toBeUndefined();
      expect(result.password).toBeUndefined();
    });

    test('should preserve validation rules for remaining fields', () => {
      const FullSchema = object({
        name: string().required(),
        email: string().required(),
        age: number()
      });

      const WithoutEmailSchema = FullSchema.omit(['email']);

      // Should still require name
      expect(() => WithoutEmailSchema.parse({})).toThrow();
      expect(() => WithoutEmailSchema.parse({ name: 'John' })).not.toThrow();
    });
  });

  describe('chaining extension methods', () => {
    test('should chain extend with other methods', () => {
      const BaseSchema = object({
        name: string().required()
      });

      const FinalSchema = BaseSchema
        .extend({ email: string().required() })
        .extend({ age: number().min(18) });

      const result = FinalSchema.parse({
        name: 'John',
        email: 'john@example.com',
        age: 25
      });

      expect(result).toMatchObject({
        name: 'John',
        email: 'john@example.com',
        age: 25
      });
    });

    test('should chain pick/omit with extend', () => {
      const BaseSchema = object({
        id: string().required(),
        name: string().required(),
        email: string().required()
      });

      const Schema = BaseSchema
        .extend({ age: number() })
        .omit(['email'])
        .extend({ phone: string() });

      const result = Schema.parse({
        id: '123',
        name: 'John',
        age: 30,
        phone: '555-1234'
      });

      expect(result).toMatchObject({
        id: '123',
        name: 'John',
        age: 30,
        phone: '555-1234'
      });

      expect(result.email).toBeUndefined();
    });
  });
});
