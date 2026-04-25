# Statistics Schema

Schema for OpenSIPS Statistics.

## Schema Definition

Extends [Base Document](./base-document.schema.md).

```typescript
interface StatisticDocument extends BaseDocument {
  document_type: 'statistic';
  statistics: StatisticDefinition[];
  statistic_access_methods?: string[];
}
```

## Nested Objects

### StatisticDefinition
```typescript
interface StatisticDefinition {
  name: string;             // e.g., "core:rcv_requests"
  module: string;
  type: 'counter' | 'gauge';
  description: string;
  access_methods: string[];
  reset_method?: string;
}
```
