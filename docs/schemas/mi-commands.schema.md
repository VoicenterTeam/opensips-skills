<p align="center"><img src="../OpensipsSkillsLogo.png" alt="OpenSIPs Skills" width="240"></p>

# MI Commands Schema

Schema for OpenSIPS Management Interface (MI) Commands.

## Schema Definition

Extends [Base Document](./base-document.schema.md).

```typescript
interface MICommandDocument extends BaseDocument {
  document_type: 'mi_command';
  mi_commands: MICommand[];
  mi_protocols?: string[];  // e.g., ["FIFO", "HTTP"]
}
```

## Nested Objects

### MICommand
```typescript
interface MICommand {
  name: string;             // e.g., "uptime"
  description: string;
  parameters: MIParameter[];
  return_value?: MIReturnValue;
  examples: CodeExample[];
  available_in?: string[];  // supported protocols
}
```

### MIParameter
```typescript
interface MIParameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
}
```

### MIReturnValue
```typescript
interface MIReturnValue {
  type: string;             // e.g., "json_array"
  description: string;
  structure?: any;          // JSON schema of return value
}
```
