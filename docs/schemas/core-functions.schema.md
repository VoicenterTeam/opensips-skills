# Core Functions Schema

Schema for OpenSIPS Core Script Functions (e.g., `t_relay`, `xlog`).

## Schema Definition

Extends [Base Document](./base-document.schema.md).

```typescript
interface CoreFunctionDocument extends BaseDocument {
  document_type: 'core_function';
  functions: CoreFunction[];
  function_categories?: string[];
}
```

## Nested Objects

### CoreFunction
```typescript
interface CoreFunction {
  name: string;             // e.g., "exit"
  signature: string;        // e.g., "exit()"
  parameters: FunctionParameter[];
  return_type: string;      // e.g., "void"
  description: string;
  usage_context: string[];  // e.g., ["REQUEST_ROUTE"]
  examples: CodeExample[];
  category?: string;
  related_functions?: string[];
}
```

### FunctionParameter
```typescript
interface FunctionParameter {
  name: string;
  type: string;
  required: boolean;
  default?: string;
  description: string;
  valid_values?: string[];
}
```
