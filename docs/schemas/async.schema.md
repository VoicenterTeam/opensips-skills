<p align="center"><img src="../OpensipsSkillsLogo.png" alt="OpenSIPs Skills" width="240"></p>

# Async Schema

Schema for OpenSIPS Asynchronous Statements (e.g., `async`).

## Schema Definition

Extends [Base Document](./base-document.schema.md).

```typescript
interface AsyncDocument extends BaseDocument {
  document_type: 'async_statement';
  statements: AsyncStatement[];
}
```

## Nested Objects

### AsyncStatement
```typescript
interface AsyncStatement {
  name: string;             // e.g., "async"
  syntax: string;
  description: string;
  parameters: StatementParameter[];
  usage_context: string[];
  examples: CodeExample[];
}
```
