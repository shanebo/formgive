/**
 * Schema Extension Examples
 *
 * This file demonstrates how to extend, merge, pick, and omit schemas
 * in formgive, similar to Zod's extension methods.
 */

import { object, string, number, boolean } from '../lib/index.js';

// ============================================================================
// .extend() - Add new fields to an existing schema
// ============================================================================

const BaseUserSchema = object({
  name: string().required(),
  age: number().min(18)
});

// Extend with additional fields
const AdminUserSchema = BaseUserSchema.extend({
  email: string().required(),
  isAdmin: boolean(),
  permissions: string().options(['read', 'write', 'admin'])
});

// Usage:
const adminData = AdminUserSchema.parse({
  name: 'John Doe',
  age: 30,
  email: 'john@example.com',
  isAdmin: true,
  permissions: 'admin'
});

console.log('Extended schema:', adminData);

// Original schema is unchanged
const userData = BaseUserSchema.parse({
  name: 'Jane Doe',
  age: 25
});
console.log('Original schema:', userData);


// ============================================================================
// .merge() - Combine two schemas
// ============================================================================

const BaseSchema = object({
  id: string().required(),
  createdAt: string()
});

const ProfileSchema = object({
  name: string().required(),
  email: string().required(),
  bio: string()
});

// Merge both schemas
const UserProfileSchema = BaseSchema.merge(ProfileSchema);

// Usage:
const profileData = UserProfileSchema.parse({
  id: '123',
  createdAt: '2024-01-01',
  name: 'John Doe',
  email: 'john@example.com',
  bio: 'Software developer'
});

console.log('Merged schema:', profileData);


// ============================================================================
// .pick() - Select specific fields from a schema
// ============================================================================

const FullUserSchema = object({
  id: string().required(),
  name: string().required(),
  email: string().required(),
  password: string().required(),
  phone: string()
});

// Create a public-facing schema with only safe fields
const PublicUserSchema = FullUserSchema.pick(['id', 'name']);

// Usage:
const publicData = PublicUserSchema.parse({
  id: '123',
  name: 'John Doe'
  // email and password are not included
});

console.log('Picked schema:', publicData);


// ============================================================================
// .omit() - Exclude specific fields from a schema
// ============================================================================

// Create a schema without sensitive fields
const SafeUserSchema = FullUserSchema.omit(['password', 'email']);

// Usage:
const safeData = SafeUserSchema.parse({
  id: '123',
  name: 'John Doe',
  phone: '555-1234'
  // password and email are excluded
});

console.log('Omitted schema:', safeData);


// ============================================================================
// Chaining - Combine multiple extension methods
// ============================================================================

const ComplexSchema = object({
  id: string().required(),
  name: string().required(),
  email: string().required(),
  password: string().required()
})
  .extend({ age: number().min(18) })  // Add age field
  .omit(['password'])                   // Remove password
  .extend({ phone: string() });        // Add phone field

// Usage:
const complexData = ComplexSchema.parse({
  id: '123',
  name: 'John Doe',
  email: 'john@example.com',
  age: 30,
  phone: '555-1234'
  // password is omitted
});

console.log('Chained schema:', complexData);


// ============================================================================
// Real-world example: Form variations
// ============================================================================

// Base form schema
const BaseFormSchema = object({
  title: string().required(),
  description: string()
});

// Create form (minimal fields)
const CreateFormSchema = BaseFormSchema.extend({
  category: string().required()
});

// Edit form (includes ID and more fields)
const EditFormSchema = BaseFormSchema.extend({
  id: string().required(),
  status: string().options(['draft', 'published', 'archived']),
  tags: string()
});

// View form (read-only, no sensitive fields)
const ViewFormSchema = EditFormSchema.omit(['status']);

console.log('Form schemas created successfully!');
