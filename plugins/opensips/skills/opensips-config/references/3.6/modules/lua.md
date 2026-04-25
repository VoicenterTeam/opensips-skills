# lua Module Reference
<!-- generated-from: data/3.6/modules/lua.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 lua module. Read this file when configuring or debugging the lua module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Exported MI Functions](#exported-mi-functions)
- [Configuration Examples](#configuration-examples)

## Overview

The time needed when writing a new OpenSIPS module unfortunately is quite high, while the options provided by the configuration file are limited to the features implemented in the modules.

With this Lua module, you can easily implement your own OpenSIPS extensions in Lua.

## How It Works

With the Lua module, you can access to lua function on the OpenSIPS side. You need to define a file to load and call a function from it. Write a function "mongo_alias" and then write in your opensips.cfg

...
if (lua_exec("mongo_alias")) {
	...
}
...

On the Lua side, you have access to opensips functions and variables (AVP, pseudoVar, ...). Read the documentation below for further informations.

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

- `Lua 5.1.x or later`
- `memcached`

## Exported Parameters

### `lua_allocator` (string)

Change the default memory allocator for the lua module. Possible values are :

*Default value is opensips.*

**Possible values:**

- opensips
- malloc
### `lua_auto_reload` (integer)

Define this value to 1 if you want to reload automatically the lua script. Disabled by default.
### `luafilename` (string)

This is the file name of your script. This may be set once only, but it may include an arbitary number of functions and "use" as many Lua module as necessary.

*Default value is /etc/opensips/opensips.lua.*

**Example.** Set the `luafilename` parameter.

```opensips
...
modparam("lua", "luafilename", "/etc/opensips/opensips.lua")
...
```
### `warn_missing_free_fixup` (integer)

When you call a function via moduleFunc() you could have a memleak. Enable this warns you when you're doing it. Enabled by default.

## Exported Functions

### `lua_exec(func, [param])`

Calls a Lua function with passing it the current SIP message.

**Parameters:**

- `func` *(string, required)* — Lua function name
- `param` *(string, optional)* — Parameter to be passed to the Lua function.

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE

**Example.** lua_exec() usage.

```opensips
if (lua_exec("mongo_alias")) {
	...
}
```

### `lua_meminfo()`

Logs informations about memory.

## Exported MI Functions

### `watch`

**Parameters:**

- `action` *(string, optional)* — 'add' or 'delete'
- `extension` *(string, optional)* — required if action is provided

**Example.**

```bash
opensips-cli -x mi watch
```

## Configuration Examples

### Set luafilename parameter

Sets the luafilename parameter to specify the path to the Lua script file.

```opensips
...
modparam("lua", "luafilename", "/etc/opensips/opensips.lua")
...
```
### lua_exec() usage

Demonstrates how to use the lua_exec() function to call a Lua function from the OpenSIPS configuration script.

```opensips
...
if (lua_exec("mongo_alias")) {
	...
}
...
```
