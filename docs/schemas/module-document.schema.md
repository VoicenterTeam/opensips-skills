# Module Document Schema

This schema defines the structure for OpenSIPS Modules. This is the most complex schema as modules contain nested definitions for parameters, functions, MI commands, and more.

## Schema Definition

Extends [Base Document](./base-document.schema.md).

```typescript
interface ModuleDocument extends BaseDocument {
  document_type: 'module';
  module_name: string;
  overview: string;
  how_it_works?: string;
  dependencies_required?: Dependency[];
  dependencies_optional?: string[];
  exported_parameters: ModuleParameter[];
  exported_functions: ModuleFunction[];
  exported_mi_functions?: MIFunction[];
  exported_statistics?: Statistic[];
  exported_events?: Event[];
  exported_pseudo_variables?: PseudoVariable[];
  configuration_examples?: ConfigExample[];
}
```

## Nested Objects

### Dependency
```typescript
interface Dependency {
  name: string;
  type: 'module' | 'library' | 'application';
  reason?: string;
  optional: boolean;
}
```

### ModuleParameter
```typescript
interface ModuleParameter {
  name: string;
  type: string;             // e.g., "integer", "string"
  default_value?: string;
  description: string;
  possible_values?: string[];
  valid_range_min?: number;
  valid_range_max?: number;
  scope?: string;           // e.g., "global"
  example_value?: string;
  example_code?: string;    // "modparam(...)"
  notes?: string;
}
```

### ModuleFunction
```typescript
interface ModuleFunction {
  name: string;
  signature: string;        // e.g., "t_relay([flags])"
  parameters: FunctionParameter[];
  return_type: string;
  return_values?: ReturnValue[];
  description: string;
  usage_context: string[];  // e.g., ["REQUEST_ROUTE", "FAILURE_ROUTE"]
  examples: CodeExample[];
  related_functions?: string[];
  deprecated?: boolean;
}
```

### MIFunction (Management Interface)
```typescript
interface MIFunction {
  name: string;
  parameters: MIParameter[];
  return_value?: MIReturnValue;
  description: string;
  examples: CodeExample[];
}
```

### PseudoVariable
```typescript
interface PseudoVariable {
  name: string;
  type: string;
  readable: boolean;
  writable: boolean;
  scope: string;
  description: string;
  possible_values?: string[];
}
```

### CodeExample
```typescript
interface CodeExample {
  language: string;         // e.g., "opensips", "bash"
  code: string;
  description: string;
  context?: string;
}
```
