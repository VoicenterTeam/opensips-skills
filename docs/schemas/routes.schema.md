<p align="center"><img src="../OpensipsSkillsLogo.png" alt="OpenSIPs Skills" width="240"></p>

# Routes Schema

Schema for OpenSIPS Route Blocks (e.g., `route`, `onreply_route`).

## Schema Definition

Extends [Base Document](./base-document.schema.md).

```typescript
interface RouteDocument extends BaseDocument {
  document_type: 'route_type';
  route_types: RouteType[];
}
```

## Nested Objects

### RouteType
```typescript
interface RouteType {
  name: string;             // e.g., "request_route"
  syntax: string;
  description: string;
  trigger_condition: string;
  available_variables?: string[];
  available_functions?: string[];
  can_call_routes: boolean;
  examples: CodeExample[];
}
```
