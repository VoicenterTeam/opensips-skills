# config Module Reference
<!-- generated-from: data/3.6/modules/config.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 config module. Read this file when configuring or debugging the config module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Pseudo-Variables](#exported-pseudo-variables)
- [Exported MI Functions](#exported-mi-functions)
- [Configuration Examples](#configuration-examples)

## Overview

The _config_ module enables dynamic, runtime configuration of OpenSIPS parameters by loading them from persistent storage at startup and exposing them to the script level via the [$config(...)](#pv_config "1.4.1.�$config(name)") pseudo-variable.

## How It Works

All configuration variables are stored in OpenSIPS' internal cache, allowing fast access during SIP processing to maintain high performance. The cache can be updated in three ways:

* _Script_ – Assigning a value to the [$config(...)](#pv_config "1.4.1.�$config(name)") pseudo-variable updates the in-memory cache, but this change is not persisted to the database.
* _MI Commands_ – Using [config_push](#mi_config_push "1.5.3.�config_push") or [config_push_bulk](#mi_config_push_bulk "1.5.4.�config_push_bulk") updates one or more variables in the runtime cache. These updates are also not saved to the database.
* _Database_ – Manually modifying values in the database, then triggering the [config_reload](#mi_config_reload "1.5.1.�config_reload") command, will refresh the in-memory cache with updated values from the database.

### 1.1.1.�Restart Persistent Memory

By default, the configuration cache is initialized at startup by reading from the database and persists only during the runtime. Any temporary changes made through the script or MI commands that are not explicitly flushed to the database using the [config_flush](#mi_config_flush "1.5.5.�config_flush") command will be lost after a restart.

In such cases, restart persistent memory becomes useful. When enabled via the [enable_restart_persistency](#param_enable_rpm "1.3.6.�enable_restart_persistency (integer)") parameter, OpenSIPS no longer loads configuration values from the database on startup. Instead, it restores the previously saved in-memory cache, preserving runtime changes across restarts.

If needed, you can still manually re-initialize the cache from the database by running the [config_reload](#mi_config_reload "1.5.1.�config_reload") MI command.

## Dependencies

### OpenSIPs Modules

- `database module` — needed to read the initial cache

### External Libraries

None.

## Exported Parameters

### `db_url` (string)

Database URL used to load the initial configuration values, and flush them at runtime using the config_flush MI command.

*Default value is mysql://opensips:opensipsrw@localhost/opensips.*

**Example.** Set the `db_url` parameter.

```opensips
modparam("config", "db_url", "dbdriver://username:password@dbhost/dbname")
```
### `description_column` (string)

Name of the column storing variable descriptions.

*Default value is description.*

**Example.** Set the `description_column` parameter.

```opensips
modparam("config", "description_column", "desc")
```
### `enable_restart_persistency` (integer)

Enables restart persistency. Check the Restart Persistent Memory for more information.

*Default value is 0 / disabled.*

**Example.** Set the `enable_restart_persistency` parameter.

```opensips
modparam("config", "restart_persistent_memory", yes)
```
### `hash_size` (integer)

Size of the internal hash table used to store config variables. Must be a power of 2 number, otherwise its value will be rounded to the closest value of 2 smaller than the provided value.

*Default value is 16.*

**Example.** Set the `hash_size` parameter.

```opensips
modparam("config", "hash_size", 32)
```
### `name_column` (string)

Name of the column storing configuration variable names.

*Default value is name.*

**Example.** Set the `name_column` parameter.

```opensips
modparam("config", "name_column", "key")
```
### `table_name` (string)

Name of the table where configuration entries are stored.

*Default value is config.*

**Example.** Set the `table_name` parameter.

```opensips
modparam("config", "table_name", "configuration")
```
### `value_column` (string)

Name of the column storing configuration variable values.

*Default value is value.*

**Example.** Set the `value_column` parameter.

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

### `config_flush`

Flushes the variables from the memory to the database.

**Parameters:**

- `name` *(string, optional)* — if present, flushes only a specific config variable in database, otherwise the entire cache.

**Returns:** The number of values successfully flushed.

**Example.** Flush config variables to the database

```opensips-mi
		## Flush config variables to the database
		opensips-mi config_flush
```

**Example.**

```opensips-cli
		opensips-cli -x mi config_flush debug_mode
```

### `config_list`

Lists all config variables currently loaded in cache, printing temporary values as well. If the optional _description_ parameter is provided and different than _0_, it returns an array containing the description of the values as well.

**Parameters:**

- `description` *(integer, optional)* — If provided and different than 0, it returns an array containing the description of the values as well.

**Returns:** Array containing the description of the values as well (if description parameter provided).

**Example.** list all configuration cache

```opensips-mi
		## list all configuration cache
		opensips-mi config_list
```

**Example.**

```opensips-cli
		opensips-cli -x mi config_list 1
```

### `config_push`

Temporarily pushes a single configuration variable.

**Parameters:**

- `description` *(string, optional)* — the description of the variable; if missing the description is inheritted, or a null value is used if the variable is new.
- `name` *(string, required)* — the name of the variable
- `value` *(string, required)* — the value of the variable

**Example.** push temporarily debug_mode configuration value

```opensips-mi
		## push temporarily debug_mode configuration value
		opensips-mi config_push debug_mode 1 "Enable Debug mode"
```

**Example.**

```opensips-cli
		opensips-cli -x mi config_list 1
```

### `config_push_bulk`

Pushes multiple temporarily configuration variables in memory.

**Parameters:**

- `configs` *(json, required)* — a JSON array containing a set of variables to be pushed. Each variable should be described as a JSON object with the following keys: name (string), value (string or null), description (string, optional).

**Returns:** The number of values successfully pushed.

**Example.** push bulk temporarily values to the config cache

```opensips-mi
		## push bulk temporarily values to the config cache
		opensips-mi config_push_bulk -j '\[\[{"name":"debug_mode","value":"1"},{"name":"debug_level","value":"5"}\]\]'
```

### `config_reload`

Reloads all configuration variables from the database.

**Example.** reload configuration cache from the database

```opensips-mi
		## reload configuration cache from the database
		opensips-mi config_reload
```

**Example.**

```opensips-cli
		opensips-cli -x mi config_reload
```

## Configuration Examples

### Set “db\_url” parameter

Database URL used to load the initial configuration values, and flush them at runtime using the config_flush MI command.

```opensips
...
modparam("config", "db\_url", "dbdriver://username:password@dbhost/dbname")
...
```
### Set “table\_name” parameter

Name of the table where configuration entries are stored.

```opensips
...
modparam("config", "table\_name", "configuration")
...
```
### Set “name\_column” parameter

Name of the column storing configuration variable names.

```opensips
...
modparam("config", "name\_column", "key")
...
```
### Set “value\_column” parameter

Name of the column storing configuration variable values.

```opensips
...
modparam("config", "value\_column", "val")
...
```
### Set “desctiption\_column” parameter

Name of the column storing variable descriptions.

```opensips
...
modparam("config", "description\_column", "desc")
...
```
### Set “restart\_persistent\_memory” parameter

Enables restart persistency.

```opensips
...
modparam("config", "restart\_persistent\_memory", yes)
...
```
### Set “hash\_size” parameter

Size of the internal hash table used to store config variables.

```opensips
...
modparam("config", "hash\_size", 32)
...
```
### Usage of `$config(...)`

Returns the value of the given config variable by name. Can also be used for temporarily changing the value.

```opensips
			...
			xlog("Config value: $config(debug\_mode)\\n"); # reading the value
			$config(debug\_mode) = 1; # temporarily changing the value
			...
			
```
### Usage of `$config.description(name)`

Returns the description of a config variable if available.

```opensips
			...
			xlog("Description: $config.description(debug\_mode)\\n");
			...
			
```
