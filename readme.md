# Formgive

A schema library for form-centric data structures. Defines types, validation, coercion, and field metadata in one chain.

## Install

```bash
bun add formgive
```

## Usage

```js
import { object, string, number, boolean, array } from 'formgive';

const Rule = object({
  name: string().required(),
  age: number().integer().min(18).max(100),
  active: boolean(),
  tags: array(string())
});

Rule.parse(input);       // coerce + validate, throws on error
Rule.safeParse(input);   // { data, errors }
Rule.data(input);        // coerce only, no validation
Rule.validate(input);    // validate only, returns errors or null
Rule.schema(input);      // form-ready field metadata tree
Rule.fields(input);      // schema().props shorthand
```

---

## Primitives

```js
string()
number()
boolean()
integer()          // number().integer()
float(min, max)    // number with decimal constraints
date()
array(itemSchema)
object(props)
mixed([types])     // accepts multiple types
callable()         // function type
gone()             // explicitly absent — used in conditionals
```

---

## Chainable modifiers

```js
.required()
.nullable()
.disabled()
.fallback(value)
.min(n)
.max(n)
.minLength(n)
.maxLength(n)
.length(n)
.pattern(regex)
.test(fn)
.positive()
.negative()
.integer()
.float(minDecimals, maxDecimals)
.options(array)          // constrained values; enables select UI
.options(fn)             // lazy-loaded options
.transform(fn)           // transform raw value before coercion
.computed()              // marks field as computed (value may be a function)
.modifier(fn)            // CSS class modifier function
.field(opts)             // form field metadata: input, label, placeholder, etc.
.sentence(opts)          // controls toSentence() rendering
```

---

## Conditionals

### `when(predicate)`

Low-level branching. Creates a conditional schema node that resolves to one of two branches based on a predicate.

```js
import { when, gone, string, object } from 'formgive';

const Schema = object({
  role: string(),
  adminCode: when(({ parent }) => parent.role === 'admin')
    .then(string().required())
    .otherwise(gone())
});
```

Chain: `.when(fn).then(schema).otherwise(schema)` — `.else()` is an alias for `.otherwise()`.

Branches can be a schema or a factory function that receives the context and returns a schema:

```js
state: when(({ parent }) => parent.country === 'us')
  .then(({ input }) => string().options(getStatesFor(input.country)))
  .otherwise(gone())
```

### `conditional(predicate)`

Sugar for the common case of a field that exists only when the predicate passes. Equivalent to `.when(fn).then(self).otherwise(gone())`.

```js
const Choice = object({
  type: string().options(['checkbox', 'radio', 'switch', 'chip']),
  color: string().options(['red', 'blue']).conditional(({ parent }) => parent.type === 'chip'),
  face: string().options(['soft', 'sharp']).conditional(({ parent }) => parent.type === 'chip')
});
```

Inactive fields are excluded from `data()`, `schema()`, and `validate()`. Active fields stay in their declared position.

### Predicate context

All predicates (`when`, `conditional`) receive a single context object:

| Key | Description |
|-----|-------------|
| `value` | Coerced value of the current field |
| `input` | Raw root input (the original object passed to `parse`/`schema`/etc.) |
| `data` | Same as `input` — raw root input |
| `parent` | Raw immediate container object, or `null` at root |

`parent` is the most useful for sibling checks. `input` is the escape hatch for cross-tree checks.

```js
// Check a sibling in the same object
color: string().conditional(({ parent }) => parent.type === 'chip')

// Check something at root from inside a nested object
detail: string().conditional(({ input }) => input.mode === 'advanced')

// Check the field's own coerced value
label: string().conditional(({ value }) => value !== undefined && value.length > 0)
```

### Nesting

Conditionals work at any depth. Inside an array of objects, `parent` is the current item, not the array.

```js
const Schema = object({
  items: array(object({
    type: string(),
    color: string().conditional(({ parent }) => parent.type === 'chip')
  }))
});
```

### Top-level `when` factory

Available as a named export for standalone conditional schema nodes used directly as props:

```js
import { when, gone } from 'formgive';

const Schema = object({
  parentId: when(({ parent }) => parent.type === 'list')
    .then(string().field({ input: 'hidden' }).fallback('list'))
    .otherwise(string().options(['list', 'abc']))
});
```

---

## Object methods

```js
.extend(newProps)    // add or override props; new props appear first
.merge(otherSchema)  // merge two object schemas; other takes precedence
.pick(keys)          // create schema with only the specified keys
.omit(keys)          // create schema excluding the specified keys
```

---

## Output methods

### `parse(input, opts?)`

Coerces and validates. Throws `ValidationError` on failure.

```js
const result = Schema.parse(input);
```

Options: `{ strict: true, partial: false, validate: true }`.

### `safeParse(input, opts?)`

Same as `parse` but returns `{ data, errors }` instead of throwing.

```js
const { data, errors } = Schema.safeParse(input);
```

### `data(input, opts?)`

Coerce only, no validation. Returns the coerced object.

### `validate(input, key?, opts?)`

Validate only. Returns an error map or `null`.

### `schema(input, parentKey?)`

Returns a field metadata tree for form rendering. Each prop includes `key`, `id`, `name`, `label`, `input`, `type`, `value`, and any field-level metadata from `.field()`.

### `fields(input?)`

Shorthand for `schema(input).props`.

### `toSentence(input, opts?)`

Renders a plain-English sentence from the schema's values. Fields must call `.sentence()` to participate.

---

## Composition

```js
// Combine two object schemas
const Extended = BaseSchema.merge(ExtraSchema);

// Create a variant with extra fields
const AdminVariant = UserSchema.extend({
  adminCode: string().required()
});

// Reuse a subset of fields
const Slim = FullSchema.pick(['name', 'email']);
```

---

## Lazy options

Pass a function to `.options()` and it will be called once per evaluation, then cleared:

```js
tags: string().options(() => fetchTagsFromApi())
```

---

## Modifiers

Modifier functions produce CSS class strings from field values, useful for stateful UI:

```js
const Schema = object({
  active: boolean().modifier((key, value) => value ? 'is-active' : '')
});

Schema.modifiers(input); // returns joined modifier string
```

---

## `partitionInput()`

Splits an object schema's input into `knownInput` (declared props) and `unknownInput` (undeclared props):

```js
const Schema = object({ name: string() }).partitionInput();
const { knownInput, unknownInput } = Schema.composeInputs(input);
```

---

## Error shape

`ValidationError` has an `.errors` property with the same shape as the schema:

```js
try {
  Schema.parse(bad);
} catch (e) {
  e.errors // { name: 'is required', address: { zip: 'is required' } }
}
```

Array errors are indexed:

```js
{ items: [null, { name: 'is required' }] }
```
