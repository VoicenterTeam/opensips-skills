# Consolidated Output Schema

Schema for the final, merged JSON file designed for MCP consumption.

## Schema Definition

```typescript
interface ConsolidatedDocument {
  version: string;
  generatedAt: string;
  generator: string;
  
  statistics: {
    totalDocuments: number;
    totalModules: number;
    totalCorePages: number;
    totalGuides: number;
    totalFunctions: number;
    totalParameters: number;
    totalMICommands: number;
    totalEvents: number;
    totalPseudoVariables: number;
  };
  
  modules: ModuleDocument[];
  core: {
    variables: CoreVariableDocument;
    functions: CoreFunctionDocument;
    parameters: CoreParameterDocument;
    operators: OperatorDocument;
    statements: StatementDocument;
    routes: RouteDocument;
    flags: FlagDocument;
    transformations: TransformationDocument;
    async: AsyncDocument;
    mi_commands: MICommandDocument;
    events: EventDocument;
    statistics: StatisticDocument;
  };
  
  guides: {
    installation: GuideDocument;
    configuration: GuideDocument;
    syntax: GuideDocument;
  };
  
  indexes: {
    functionsByName: Record<string, IndexEntry>;
    parametersByModule: Record<string, string[]>;
    variablesByName: Record<string, IndexEntry>;
    miCommandsByName: Record<string, IndexEntry>;
  };
  
  relationships: {
    moduleDependencies: Record<string, string[]>;
    relatedDocuments: Record<string, string[]>;
  };
}
```

## Nested Objects

### IndexEntry
```typescript
interface IndexEntry {
  source: string;           // "module:dialog" or "core"
  path: string;             // JSON path to the definition
  description: string;
}
```
