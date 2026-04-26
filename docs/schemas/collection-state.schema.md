<p align="center"><img src="../OpensipsSkillsLogo.png" alt="OpenSIPs Skills" width="240"></p>

# Collection State Schema

Schema for the runtime state file used to track collection progress and enable recovery.

## Schema Definition

```typescript
interface CollectionState {
  version: string;
  startedAt: string;        // ISO Date
  lastUpdatedAt: string;    // ISO Date
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  
  phases: {
    discovery: PhaseStatus;
    modules: ModulesPhase;
    core: CorePhase;
    guides: GuidesPhase;
    enhancement: PhaseStatus;
    consolidation: PhaseStatus;
  };
  
  errors: ErrorEntry[];
}
```

## Nested Objects

### PhaseStatus
```typescript
interface PhaseStatus {
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  completedAt?: string;
  result?: any;
}
```

### ModulesPhase
```typescript
interface ModulesPhase extends PhaseStatus {
  total: number;
  completed: number;
  failed: number;
  items: Record<string, ItemStatus>; // Keyed by module name
}
```

### CorePhase
```typescript
interface CorePhase extends PhaseStatus {
  items: Record<CoreDocType, ItemStatus>;
}
```

### GuidesPhase
```typescript
interface GuidesPhase extends PhaseStatus {
  items: Record<GuideType, ItemStatus>;
}
```

### ItemStatus
```typescript
interface ItemStatus {
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  filePath?: string;
  error?: string;
  attempts: number;
  lastAttempt?: string;
}
```

### ErrorEntry
```typescript
interface ErrorEntry {
  phase: string;
  item: string;
  error: string;
  timestamp: string;
  retryCount: number;
}
```
