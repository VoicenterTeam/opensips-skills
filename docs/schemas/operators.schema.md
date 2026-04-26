<p align="center"><img src="../OpensipsSkillsLogo.png" alt="OpenSIPs Skills" width="240"></p>

# Operators Schema

Schema for OpenSIPS Script Operators (e.g., `+`, `==`, `=~`).

## Schema Definition

Extends [Base Document](./base-document.schema.md).

```typescript
interface OperatorDocument extends BaseDocument {
  document_type: 'operator';
  operators: Operator[];
  operator_categories: string[];
}
```

## Nested Objects

### Operator
```typescript
interface Operator {
  symbol: string;           // e.g., "+"
  name: string;
  category: string;         // e.g., "Arithmetic"
  operand_type: 'unary' | 'binary' | 'ternary';
  description: string;
  applicable_to: string[];  // e.g., ["integer", "string"]
  precedence: number;
  associativity: 'left' | 'right';
  examples: CodeExample[];
}
```
