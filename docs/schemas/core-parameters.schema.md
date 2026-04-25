# Core Parameters Schema

Schema for OpenSIPS Core Global Parameters (e.g., `listen`, `debug`).

## Schema Definition

Extends [Base Document](./base-document.schema.md).

```typescript
interface CoreParameterDocument extends BaseDocument {
  document_type: 'core_parameter';
  parameters: CoreParameter[];
  parameter_categories?: string[];
}
```

## Nested Objects

### CoreParameter
```typescript
interface CoreParameter {
  name: string;             // e.g., "listen"
  type: string;
  default_value: string;
  description: string;
  syntax?: string;
  multiple_allowed: boolean;// can be defined multiple times?
  valid_values?: string[];
  examples: CodeExample[];
  category?: string;
  notes?: string;
}
```
