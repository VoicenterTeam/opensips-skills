# Config Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp1894928)

2.2. [Most recently active contributors(1) to this module](#idp5731376)

**List of Examples**

1.1. [Set “db\_url” parameter](#idp1538528)

1.2. [Set “table\_name” parameter](#idp2105504)

1.3. [Set “name\_column” parameter](#idp5120432)

1.4. [Set “value\_column” parameter](#idp4493360)

1.5. [Set “desctiption\_column” parameter](#idp4735248)

1.6. [Set “restart\_persistent\_memory” parameter](#idp5104928)

1.7. [Set “hash\_size” parameter](#idp4129424)

1.8. [Usage of `$config(...)`](#idp4517760)

1.9. [Usage of `$config.description(name)`](#idp4146416)

## Chapter�1.�Admin Guide

## 1.1.�Overview

The _config_ module enables dynamic, runtime configuration of OpenSIPS parameters by loading them from persistent storage at startup and exposing them to the script level via the [$config(...)](#pv_config "1.4.1.�$config(name)") pseudo-variable.

All configuration variables are stored in OpenSIPS' internal cache, allowing fast access during SIP processing to maintain high performance. The cache can be updated in three ways:

*   _Script_ – Assigning a value to the [$config(...)](#pv_config "1.4.1.�$config(name)") pseudo-variable updates the in-memory cache, but this change is not persisted to the database.
    
*   _MI Commands_ – Using [config\_push](#mi_config_push "1.5.3.�config_push") or [config\_push\_bulk](#mi_config_push_bulk "1.5.4.�config_push_bulk") updates one or more variables in the runtime cache. These updates are also not saved to the database.
    
*   _Database_ – Manually modifying values in the database, then triggering the [config\_reload](#mi_config_reload "1.5.1.�config_reload") command, will refresh the in-memory cache with updated values from the database.
    

### 1.1.1.�Restart Persistent Memory

By default, the configuration cache is initialized at startup by reading from the database and persists only during the runtime. Any temporary changes made through the script or MI commands that are not explicitly flushed to the database using the [config\_flush](#mi_config_flush "1.5.5.�config_flush") command will be lost after a restart.

In such cases, restart persistent memory becomes useful. When enabled via the [enable\_restart\_persistency](#param_enable_rpm "1.3.6.�enable_restart_persistency (integer)") parameter, OpenSIPS no longer loads configuration values from the database on startup. Instead, it restores the previously saved in-memory cache, preserving runtime changes across restarts.

If needed, you can still manually re-initialize the cache from the database by running the [config\_reload](#mi_config_reload "1.5.1.�config_reload") MI command.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _A database module is needed to read the initial cache_.
    

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _None_.
    

## 1.3.�Exported Parameters

### 1.3.1.�`db_url` (string)

Database URL used to load the initial configuration values, and flush them at runtime using the [config\_flush](#mi_config_flush "1.5.5.�config_flush") MI command.

_Default value is “mysql://opensips:opensipsrw@localhost/opensips”._

**Example�1.1.�Set “db\_url” parameter**

...
modparam("config", "db\_url", "dbdriver://username:password@dbhost/dbname")
...

  

### 1.3.2.�`table_name` (string)

Name of the table where configuration entries are stored.

_Default value is “config”._

**Example�1.2.�Set “table\_name” parameter**

...
modparam("config", "table\_name", "configuration")
...

  

### 1.3.3.�`name_column` (string)

Name of the column storing configuration variable names.

_Default value is “name”._

**Example�1.3.�Set “name\_column” parameter**

...
modparam("config", "name\_column", "key")
...

  

### 1.3.4.�`value_column` (string)

Name of the column storing configuration variable values.

_Default value is “value”._

**Example�1.4.�Set “value\_column” parameter**

...
modparam("config", "value\_column", "val")
...

  

### 1.3.5.�`description_column` (string)

Name of the column storing variable descriptions.

_Default value is “description”._

**Example�1.5.�Set “desctiption\_column” parameter**

...
modparam("config", "description\_column", "desc")
...

  

### 1.3.6.�`enable_restart_persistency` (integer)

Enables restart persistency. Check the [Restart Persistent Memory](#restart_persistent_memory "1.1.1.�Restart Persistent Memory") for more information.

_Default value is “0 / disabled”._

**Example�1.6.�Set “restart\_persistent\_memory” parameter**

...
modparam("config", "restart\_persistent\_memory", yes)
...

  

### 1.3.7.�`hash_size` (integer)

Size of the internal hash table used to store config variables. Must be a power of 2 number, otherwise its value will be rounded to the closest value of 2 smaller than the provided value.

_Default value is “16”._

**Example�1.7.�Set “hash\_size” parameter**

...
modparam("config", "hash\_size", 32)
...

  

## 1.4.�Exported Pseudo-Variables

### 1.4.1.�`$config(name)`

Returns the value of the given config variable by name. Can also be used for temporarily changing the value.

**Example�1.8.�Usage of `$config(...)`**

			...
			xlog("Config value: $config(debug\_mode)\\n"); # reading the value
			$config(debug\_mode) = 1; # temporarily changing the value
			...
			

  

### 1.4.2.�`$config.description(name)`

Returns the description of a config variable if available.

This variable is read-only.

**Example�1.9.�Usage of `$config.description(name)`**

			...
			xlog("Description: $config.description(debug\_mode)\\n");
			...
			

  

## 1.5.�MI Commands

### 1.5.1.�**config\_reload**

Reloads all configuration variables from the database.

MI FIFO Command Format:

		## reload configuration cache from the database
		opensips-mi config\_reload
		opensips-cli -x mi config\_reload
		

### 1.5.2.�**config\_list**

Lists all config variables currently loaded in cache, printing temporary values as well. If the optional _description_ parameter is provided and different than _0_, it returns an array containing the description of the values as well.

MI FIFO Command Format:

		## list all configuration cache
		opensips-mi config\_list
		opensips-cli -x mi config\_list 1
		

### 1.5.3.�**config\_push**

Temporarily pushes a single configuration variable.

Expected parameters are:

*   _name_ – (string) the name of the variable
    
*   _value_ – (string) the value of the variable
    
*   _description_ – (string, optional) the description of the variable; if missing the description is inheritted, or a null value is used if the variable is new.
    

MI FIFO Command Format:

		## push temporarily debug\_mode configuration value
		opensips-mi config\_push debug\_mode 1 "Enable Debug mode"
		opensips-cli -x mi config\_list 1
		

### 1.5.4.�**config\_push\_bulk**

Pushes multiple temporarily configuration variables in memory.

Expected parameters are:

*   _configs_ – (json) a JSON array containing a set of variables to be pushed. Each variable should be described as a JSON object with the following keys:
    
    *   _name_ – (string) the name of the variable to be changed.
        
    *   _value_ – (string or null) the new value of the variable.
        
    *   _description_ – (string, optional) the description of the variable.
        
    

MI FIFO Command Format:

		## push bulk temporarily values to the config cache
		opensips-mi config\_push\_bulk -j '\[\[{"name":"debug\_mode","value":"1"},{"name":"debug\_level","value":"5"}\]\]'
		

The command returns the number of values successfully pushed.

### 1.5.5.�**config\_flush**

Flushes the variables from the memory to the database.

Expected parameters are:

*   _name_ – (string, optional) if present, flushes only a specific config variable in database, otherwise the entire cache.
    

MI FIFO Command Format:

		## Flush config variables to the database
		opensips-mi config\_flush
		opensips-cli -x mi config\_flush debug\_mode
		

The command returns the number of values successfully flushed.

## Chapter�2.�Contributors

## 2.1.�By Commit Statistics

**Table�2.1.�Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)**

�

Name

DevScore

Commits

Lines ++

Lines --

1.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

14

1

1437

0

  

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 2.2.�By Commit Activity

**Table�2.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

May 2025 - May 2025

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)).

_Documentation Copyrights:_

Copyright � 2025 OpenSIPS Solutions;