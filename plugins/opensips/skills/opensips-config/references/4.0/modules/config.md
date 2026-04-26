# config Module Reference
<!-- generated-from: data/4.0/modules/config.json
     generator-version: 0.1.0
     opensips-version: 4.0
     doc-type: module -->

Reference for the OpenSIPs 4.0 config module. Read this file when configuring or debugging the config module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Pseudo-Variables](#exported-pseudo-variables)
- [Exported MI Functions](#exported-mi-functions)
- [Configuration Examples](#configuration-examples)

## Overview

The _config_ module enables dynamic, runtime configuration of OpenSIPS parameters by loading them from persistent storage at startup and exposing them to the script level via the [$config(...)](#pv_config "1.4.1.$config(name)") pseudo-variable.

## How It Works

All configuration variables are stored in OpenSIPS' internal cache, allowing fast access during SIP processing to maintain high performance. The cache can be updated in three ways:

* _Script_ – Assigning a value to the [$config(...)](#pv_config "1.4.1.$config(name)") pseudo-variable updates the in-memory cache, but this change is not persisted to the database.
    
* _MI Commands_ – Using [config:push](#mi_push "1.5.3.config:push") or [config:push_bulk](#mi_push_bulk "1.5.4.config:push_bulk") updates one or more variables in the runtime cache. These updates are also not saved to the database.
    
* _Database_ – Manually modifying values in the database, then triggering the [config:reload](#mi_reload "1.5.1.config:reload") command, will refresh the in-memory cache with updated values from the database.

## Dependencies

### OpenSIPs Modules

- `database module` — to read the initial cache

### External Libraries

None.

## Exported Parameters

### `db_url` (string)

Database URL used to load the initial configuration values, and flush them at runtime using the [config:flush](#mi_flush "1.5.5.config:flush") MI command.

*Default value is mysql://opensips:opensipsrw@localhost/opensips.*

**Example.** dbdriver://username:password@dbhost/dbname.

```opensips
modparam("config", "db_url", "dbdriver://username:password@dbhost/dbname")
```
### `description_column` (string)

Name of the column storing variable descriptions.

*Default value is description.*

**Example.** desc.

```opensips
modparam("config", "description_column", "desc")
```
### `enable_restart_persistency` (integer)

Enables restart persistency. Check the [Restart Persistent Memory](#restart_persistent_memory "1.1.1.Restart Persistent Memory") for more information.

*Default value is 0 / disabled.*

**Notes:** The example code provided in the documentation uses the parameter name 'restart_persistent_memory' instead of 'enable_restart_persistency'.

**Example.** yes.

```opensips
modparam("config", "restart_persistent_memory", yes)
```
### `hash_size` (integer)

Size of the internal hash table used to store config variables. Must be a power of 2 number, otherwise its value will be rounded to the closest value of 2 smaller than the provided value.

*Default value is 16.*

**Example.** 32.

```opensips
modparam("config", "hash_size", 32)
```
### `name_column` (string)

Name of the column storing configuration variable names.

*Default value is name.*

**Example.** key.

```opensips
modparam("config", "name_column", "key")
```
### `table_name` (string)

Name of the table where configuration entries are stored.

*Default value is config.*

**Example.** configuration.

```opensips
modparam("config", "table_name", "configuration")
```
### `value_column` (string)

Name of the column storing configuration variable values.

*Default value is value.*

**Example.** val.

```opensips
modparam("config", "value_column", "val")
```

## Exported Pseudo-Variables

### `$config(name)`

Returns the value of the given config variable by name. Can also be used for temporarily changing the value.

- **Type:** string
- **Read/write:** read-write
- **Scope:** 
### `$config.description(name)`

Returns the description of a config variable if available.

- **Type:** string
- **Read/write:** read-only
- **Scope:** 

## Exported MI Functions

### `config:flush`

Replaces obsolete MI command: _config_flush_.

Flushes the variables from the memory to the database.

**Parameters:**

- `name` *(string, optional)* — if present, flushes only a specific config variable in database, otherwise the entire cache.

**Returns:** The command returns the number of values successfully flushed.

**Example.** Flush config variables to the database

```opensips-mi
opensips-mi config:flush
```

**Example.**

```opensips-cli
opensips-cli -x mi config:flush debug_mode
```

### `config:list`

Replaces obsolete MI command: _config_list_.

Lists all config variables currently loaded in cache, printing temporary values as well. If the optional _description_ parameter is provided and different than _0_, it returns an array containing the description of the values as well.

**Parameters:**

- `description` *(integer, optional)* — If provided and different than 0, it returns an array containing the description of the values as well.

**Returns:** Returns an array containing the description of the values if the description parameter is provided.

**Example.** list all configuration cache

```opensips-mi
opensips-mi config:list
```

**Example.**

```opensips-cli
opensips-cli -x mi config:list 1
```

### `config:push`

Replaces obsolete MI command: _config_push_.

Temporarily pushes a single configuration variable.

**Parameters:**

- `description` *(string, optional)* — the description of the variable; if missing the description is inheritted, or a null value is used if the variable is new.
- `name` *(string, required)* — the name of the variable
- `value` *(string, required)* — the value of the variable

**Example.** push temporarily debug_mode configuration value

```opensips-mi
opensips-mi config:push debug_mode 1 "Enable Debug mode"
```

**Example.**

```opensips-cli
opensips-cli -x mi config:list 1
```

### `config:push_bulk`

Replaces obsolete MI command: _config_push_bulk_.

Pushes multiple temporarily configuration variables in memory.

**Parameters:**

- `configs` *(json, required)* — a JSON array containing a set of variables to be pushed. Each variable should be described as a JSON object with the following keys: name (string), value (string or null), description (string, optional).

**Returns:** The command returns the number of values successfully pushed.

**Example.** push bulk temporarily values to the config cache

```opensips-mi
opensips-mi config:push_bulk -j '\[\[{"name":"debug_mode","value":"1"},{"name":"debug_level","value":"5"}\]\]'
```

### `config:reload`

Replaces obsolete MI command: _config_reload_.

Reloads all configuration variables from the database.

**Example.** reload configuration cache from the database

```opensips-mi
opensips-mi config:reload
```

**Example.**

```opensips-cli
opensips-cli -x mi config:reload
```

## Configuration Examples

### Set “db_url” parameter

Database URL used to load the initial configuration values, and flush them at runtime using the config:flush MI command.

```opensips
...
modparam("config", "db_url", "dbdriver://username:password@dbhost/dbname")
...
```
### Set “table_name” parameter

Name of the table where configuration entries are stored.

```opensips
...
modparam("config", "table_name", "configuration")
...
```
### Set “name_column” parameter

Name of the column storing configuration variable names.

```opensips
...
modparam("config", "name_column", "key")
...
```
### Set “value_column” parameter

Name of the column storing configuration variable values.

```opensips
...
modparam("config", "value_column", "val")
...
```
### Set “desctiption_column” parameter

Name of the column storing variable descriptions.

```opensips
...
modparam("config", "description_column", "desc")
...
```
### Set “restart_persistent_memory” parameter

Enables restart persistency. Check the Restart Persistent Memory for more information.

```opensips
...
modparam("config", "restart_persistent_memory", yes)
...
```
### Set “hash_size” parameter

Size of the internal hash table used to store config variables. Must be a power of 2 number, otherwise its value will be rounded to the closest value of 2 smaller than the provided value.

```opensips
...
modparam("config", "hash_size", 32)
...
```
### Usage of `$config(...)`

Returns the value of the given config variable by name. Can also be used for temporarily changing the value.

```opensips
			...
			xlog("Config value: $config(debug_mode)\\n"); # reading the value
			$config(debug_mode) = 1; # temporarily changing the value
			...
			
```
### Usage of `$config.description(name)`

Returns the description of a config variable if available.

This variable is read-only.

```opensips
			...
			xlog("Description: $config.description(debug_mode)\\n");
			...
			
```
