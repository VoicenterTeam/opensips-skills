# Statements Schema

Schema for OpenSIPS Script Control Statements (e.g., `if`, `switch`, `while`).

## Schema Definition

Extends [Base Document](./base-document.schema.md).

```typescript
interface StatementDocument extends BaseDocument {
  document_type: 'statement';
  statements: Statement[];
}
```

## Nested Objects

### Statement
```typescript
interface Statement {
  name: string;             // e.g., "if"
  syntax: string;
  description: string;
  parameters: StatementParameter[];
  usage_context: string[];
  examples: CodeExample[];
  related_statements?: string[];
}
```

### StatementParameter
```typescript
interface StatementParameter {
  name: string;
  type: string;             // e.g., "expression"
  required: boolean;
  description: string;
}
```
