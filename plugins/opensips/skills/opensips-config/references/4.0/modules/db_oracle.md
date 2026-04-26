# db_oracle Module Reference
<!-- generated-from: data/4.0/modules/db_oracle.json
     generator-version: 0.1.0
     opensips-version: 4.0
     doc-type: module -->

Reference for the OpenSIPs 4.0 db_oracle module. Read this file when configuring or debugging the db_oracle module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Configuration Examples](#configuration-examples)

## Overview

This is a module which provides Oracle connectivity for OpenSIPS. It implements the DB API defined in OpenSIPS. If you want to use the nathelper module, or any other modules that calls the get_all_ucontacts API export from usrloc, then you need to set the _DORACLE_USRLOC_ define in the Makefile.defs file before compilation.

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

- `instantclient-sdk-10.2.0.3` — the development headers and libraries of OCI

## Exported Parameters

### `reconnect` (fixedpoint)

Timeout value for connect (create session) operation.

*Default value is 0.2.*

*Valid range: 0.1 to 10.*

**Example.** 0.5.

```opensips
modparam("db_oracle", "reconnect", 0.5)
```
### `timeout` (fixedpoint)

Timeout value for any operation with BD.

*Default value is 3.0.*

*Valid range: 0.1 to 10.*

**Notes:** If value of timeout parameter set to 0, module use synchronous mode (without timeout).

**Example.** 1.5.

```opensips
modparam("db_oracle", "timeout", 1.5)
```

## Configuration Examples

### Set `timeout` parameter

Sets the timeout parameter to 1.5 seconds.

```opensips
...
modparam("db_oracle", "timeout", 1.5)
...
```
### Disable asynchronous mode

Disables asynchronous mode by setting the timeout parameter to 0.

```opensips
...
modparam("db_oracle", "timeout", 0)
...
```
### Set `reconnect` parameter

Sets the reconnect parameter to 0.5 seconds.

```opensips
...
modparam("db_oracle", "reconnect", 0.5)
...
```
