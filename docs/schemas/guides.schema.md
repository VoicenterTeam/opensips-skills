<p align="center"><img src="../OpensipsSkillsLogo.png" alt="OpenSIPs Skills" width="240"></p>

# Guides Schema

Schema for OpenSIPS Installation, Configuration, and Syntax Guides.

## Schema Definition

Extends [Base Document](./base-document.schema.md).

```typescript
interface GuideDocument extends BaseDocument {
  document_type: 
    | 'installation_guide'
    | 'configuration_guide'
    | 'syntax_guide';
  
  // Installation Specific
  installation_steps?: InstallStep[];
  prerequisites?: Prerequisite[];
  troubleshooting?: TroubleshootingItem[];
  
  // Configuration Specific
  configuration_sections?: ConfigSection[];
  best_practices?: BestPractice[];
}
```

## Nested Objects

### InstallStep
```typescript
interface InstallStep {
  step_number: number;
  title: string;
  description: string;
  commands: string[];
  notes?: string;
}
```

### TroubleshootingItem
```typescript
interface TroubleshootingItem {
  problem: string;
  solution: string;
}
```

### ConfigSection
```typescript
interface ConfigSection {
  section_name: string;
  description: string;
  parameters: string[];     // Names of parameters covered
  examples: CodeExample[];
}
```

### BestPractice
```typescript
interface BestPractice {
  title: string;
  description: string;
}
```

### Prerequisite
```typescript
interface Prerequisite {
  name: string;
  description: string;
  required: boolean;
}
```

### CodeExample
```typescript
interface CodeExample {
  language: string;
  code: string;
  description: string;
  context?: string;
}
```
