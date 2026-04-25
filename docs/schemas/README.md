# Schema Definitions

This directory contains the documentation for all JSON schemas used in the project. These schemas are the **Source of Truth** for the application. Any changes to the data structure must be reflected here first.

## Schema Index

### Core Data Structures
- [Base Document](./base-document.schema.md) - The foundation for all other documents.
- [Module Document](./module-document.schema.md) - Structure for OpenSIPS modules.
- [Consolidated Output](./consolidated.schema.md) - The final MCP-ready JSON format.
- [Collection State](./collection-state.schema.md) - Runtime state tracking.

### Core Documentation Types
- [Variables](./core-variables.schema.md) - Script variables (`$fu`, `$ru`, etc.)
- [Functions](./core-functions.schema.md) - Script functions (`t_relay`, etc.)
- [Parameters](./core-parameters.schema.md) - Core parameters (`listen`, `debug`, etc.)
- [Operators](./operators.schema.md) - Script operators (`+`, `==`, etc.)
- [Statements](./statements.schema.md) - Control statements (`if`, `switch`, etc.)
- [Routes](./routes.schema.md) - Route blocks (`route`, `onreply_route`, etc.)
- [Flags](./flags.schema.md) - Message processing flags.
- [Transformations](./transformations.schema.md) - Data transformations (`{s.len}`, etc.)
- [Async](./async.schema.md) - Asynchronous operations.
- [MI Commands](./mi-commands.schema.md) - Management Interface commands.
- [Events](./events.schema.md) - Event Interface events.
- [Statistics](./statistics.schema.md) - Core statistics.

### Guides
- [Guides](./guides.schema.md) - Installation, Configuration, and Syntax guides.

## Implementation Rules
1. All schemas must be implemented using **Zod** in `src/schemas/`.
2. All fields must have `.describe()` annotations matching this documentation.
3. Use `z.strict()` to forbid unknown fields.
