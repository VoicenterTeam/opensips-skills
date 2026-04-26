<p align="center"><img src="../OpensipsSkillsLogo.png" alt="OpenSIPs Skills" width="240"></p>

# Module Sections Schema

This document defines the partial schemas used for section-based module extraction. Each schema represents a subset of the full `ModuleDocumentSchema`, enabling focused LLM extraction that avoids timeouts on large modules.

## Overview

The full `ModuleDocumentSchema` is split into 8 partial schemas:

| Schema | Fields | Required |
|--------|--------|----------|
| `ModuleOverviewSectionSchema` | module_name, overview, how_it_works, dependencies | Yes |
| `ModuleParametersSectionSchema` | exported_parameters | Yes |
| `ModuleFunctionsSectionSchema` | exported_functions | Yes |
| `ModuleMISectionSchema` | exported_mi_functions | No |
| `ModuleStatisticsSectionSchema` | exported_statistics | No |
| `ModuleEventsSectionSchema` | exported_events | No |
| `ModulePVarsSectionSchema` | exported_pseudo_variables | No |
| `ModuleExamplesSectionSchema` | configuration_examples | No |

## Schema Definitions

### ModuleOverviewSectionSchema

Core module identification and description.

```typescript
interface ModuleOverviewSection {
  module_name: string;
  overview: string;
  how_it_works?: string;
  dependencies_required?: Dependency[];
  dependencies_optional?: string[];
}

interface Dependency {
  name: string;
  type: 'module' | 'library' | 'application';
  reason?: string;
  optional: boolean;
}
```

### ModuleParametersSectionSchema

Module configuration parameters.

```typescript
interface ModuleParametersSection {
  exported_parameters: ModuleParameter[];
}

interface ModuleParameter {
  name: string;
  type: string;
  default_value?: string;
  description: string;
  possible_values?: string[];
  valid_range_min?: number;
  valid_range_max?: number;
  scope?: string;
  example_value?: string;
  example_code?: string;
  notes?: string;
}
```

### ModuleFunctionsSectionSchema

Exported script functions.

```typescript
interface ModuleFunctionsSection {
  exported_functions: ModuleFunction[];
}

interface ModuleFunction {
  name: string;
  signature: string;
  parameters: FunctionParameter[];
  return_type: string;
  return_values?: ReturnValue[];
  description: string;
  usage_context: string[];
  examples: CodeExample[];
  related_functions?: string[];
  deprecated?: boolean;
}
```

### ModuleMISectionSchema

Management Interface commands.

```typescript
interface ModuleMISection {
  exported_mi_functions?: MIFunction[];
}

interface MIFunction {
  name: string;
  parameters: MIParameter[];
  return_value?: MIReturnValue;
  description: string;
  examples: CodeExample[];
}
```

### ModuleStatisticsSectionSchema

Runtime statistics.

```typescript
interface ModuleStatisticsSection {
  exported_statistics?: Statistic[];
}

interface Statistic {
  name: string;
  type?: 'counter' | 'gauge' | 'histogram' | string;
  description: string;
  access_methods?: string[];
  reset_method?: string;
}
```

### ModuleEventsSectionSchema

Module events.

```typescript
interface ModuleEventsSection {
  exported_events?: Event[];
}

interface Event {
  name: string;
  description: string;
  parameters: EventParameter[];
  subscribe_method?: string;
  examples?: CodeExample[];
}
```

### ModulePVarsSectionSchema

Module pseudo-variables.

```typescript
interface ModulePVarsSection {
  exported_pseudo_variables?: PseudoVariable[];
}

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

### ModuleExamplesSectionSchema

Configuration examples.

```typescript
interface ModuleExamplesSection {
  configuration_examples?: ConfigExample[];
}

interface ConfigExample {
  title: string;
  description: string;
  code: string;
  explanation?: string;
}
```

## Merge Strategy

After all sections are extracted, they are merged into a full `ModuleDocumentSchema`:

```typescript
function mergeModuleSections(
  base: BaseDocument,
  overview: ModuleOverviewSection,
  parameters: ModuleParametersSection,
  functions: ModuleFunctionsSection,
  mi: ModuleMISection,
  statistics: ModuleStatisticsSection,
  events: ModuleEventsSection,
  pvars: ModulePVarsSection,
  examples: ModuleExamplesSection
): ModuleDocument {
  return {
    // Base document fields
    ...base,
    document_type: 'module',
    
    // Overview section
    module_name: overview.module_name,
    overview: overview.overview,
    how_it_works: overview.how_it_works,
    dependencies_required: overview.dependencies_required,
    dependencies_optional: overview.dependencies_optional,
    
    // Required sections
    exported_parameters: parameters.exported_parameters,
    exported_functions: functions.exported_functions,
    
    // Optional sections
    exported_mi_functions: mi.exported_mi_functions,
    exported_statistics: statistics.exported_statistics,
    exported_events: events.exported_events,
    exported_pseudo_variables: pvars.exported_pseudo_variables,
    configuration_examples: examples.configuration_examples,
  };
}
```

## Validation Approach

### Partial Validation (Per Section)

Each section is validated against its partial schema immediately after extraction:

```typescript
const result = ModuleParametersSectionSchema.safeParse(sectionData);
if (!result.success) {
  throw new Error(`Section validation failed: ${result.error.message}`);
}
```

### Full Validation (After Merge)

The merged document is validated against `ModuleDocumentSchema`:

```typescript
const mergedResult = ModuleDocumentSchema.safeParse(mergedDocument);
if (!mergedResult.success) {
  // Log which fields failed
  // May need to re-extract specific sections
}
```

## Empty Section Handling

Optional sections may return empty arrays or undefined:

- `exported_mi_functions`: Empty array `[]` if no MI commands
- `exported_statistics`: Empty array `[]` if no statistics
- `exported_events`: Empty array `[]` if no events
- `exported_pseudo_variables`: Empty array `[]` if no pseudo-variables
- `configuration_examples`: Empty array `[]` if no examples

The merge logic preserves these as-is; the full schema allows optional fields.

## Related Files

- Schema Implementation: `src/schemas/module-sections.schema.ts`
- Full Module Schema: `src/schemas/modules.schema.ts`
- Base Schema: `src/schemas/base.schema.ts`
- Workflow Docs: `docs/workflows/extract-module.workflow.md`
