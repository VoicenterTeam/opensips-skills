<p align="center"><img src="../OpensipsSkillsLogo.png" alt="OpenSIPs Skills" width="240"></p>

# Core Variables Schema

Schema for OpenSIPS Core Script Variables (e.g., `$fu`, `$si`).

## Schema Definition

Extends [Base Document](./base-document.schema.md).

```typescript
interface CoreVariableDocument extends BaseDocument {
  document_type: 'core_variable';
  variables: CoreVariable[];
  syntax_notes?: string;
}
```

## Nested Objects

### CoreVariable
```typescript
interface CoreVariable {
  name: string;             // e.g., "$si"
  alternate_names?: string[];
  description: string;
  type: string;             // "string", "integer"
  readable: boolean;
  writable: boolean;
  scope: string;            // e.g., "message_context"
  context: 'request' | 'reply' | 'both';
  related_variables?: string[];
  examples: CodeExample[];
  notes?: string;
  subfields?: VariableSubfield[];
  indexed: boolean;         // true if accessed like $var[1]
  multi_value: boolean;     // true if can hold multiple values
}
```

### VariableSubfield
```typescript
interface VariableSubfield {
  name: string;             // e.g., "ip" in $socket_in(ip)
  access_syntax: string;    // e.g., "$socket_in(ip)"
  description: string;
  type: string;
}
```
