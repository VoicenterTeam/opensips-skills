# Transformations Schema

Schema for OpenSIPS Data Transformations (e.g., `{s.len}`).

## Schema Definition

Extends [Base Document](./base-document.schema.md).

```typescript
interface TransformationDocument extends BaseDocument {
  document_type: 'transformation';
  transformations: Transformation[];
}
```

## Nested Objects

### Transformation
```typescript
interface Transformation {
  name: string;             // e.g., "s.len"
  class: string;            // e.g., "string"
  description: string;
  syntax: string;
  parameters: TransformationParameter[];
  input_type: string;
  output_type: string;
  examples: CodeExample[];
  chainable: boolean;
}
```

### TransformationParameter
```typescript
interface TransformationParameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
}
```
