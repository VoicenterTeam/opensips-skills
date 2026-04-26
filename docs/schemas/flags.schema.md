<p align="center"><img src="../OpensipsSkillsLogo.png" alt="OpenSIPs Skills" width="240"></p>

# Flags Schema

Schema for OpenSIPS Message/Script Flags.

## Schema Definition

Extends [Base Document](./base-document.schema.md).

```typescript
interface FlagDocument extends BaseDocument {
  document_type: 'flag';
  flag_types: FlagType[];
}
```

## Nested Objects

### FlagType
```typescript
interface FlagType {
  type_name: string;        // e.g., "Message Flags"
  description: string;
  max_flags: number;
  persistence: string;      // e.g., "transaction"
  functions: FlagFunction[];
  examples: CodeExample[];
}
```

### FlagFunction
```typescript
interface FlagFunction {
  name: string;             // e.g., "setflag"
  purpose: string;
  signature: string;
}
```
