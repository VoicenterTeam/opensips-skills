<p align="center"><img src="../OpensipsSkillsLogo.png" alt="OpenSIPs Skills" width="240"></p>

# Events Schema

Schema for OpenSIPS Event Interface.

## Schema Definition

Extends [Base Document](./base-document.schema.md).

```typescript
interface EventDocument extends BaseDocument {
  document_type: 'event';
  events: EventDefinition[];
  event_interface_types?: string[]; // e.g., ["RabbitMQ"]
}
```

## Nested Objects

### EventDefinition
```typescript
interface EventDefinition {
  name: string;             // e.g., "E_CORE_THRESHOLD"
  module: string;
  description: string;
  parameters: EventParameter[];
  subscribe_method: string;
  examples: CodeExample[];
}
```

### EventParameter
```typescript
interface EventParameter {
  name: string;
  type: string;
  description: string;
}
```
