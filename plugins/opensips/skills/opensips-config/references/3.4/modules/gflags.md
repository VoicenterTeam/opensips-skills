# gflags Module Reference
<!-- generated-from: data/3.4/modules/gflags.json
     generator-version: 0.1.0
     opensips-version: 3.4
     doc-type: module -->

Reference for the OpenSIPs 3.4 gflags module. Read this file when configuring or debugging the gflags module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Exported MI Functions](#exported-mi-functions)
- [Configuration Examples](#configuration-examples)

## Overview

gflags module (global flags) keeps a bitmap of flags in shared memory and may be used to change behaviour of server based on value of the flags. Example:

if (is_gflag(1)) {
	t_relay("udp:10.0.0.1:5060");
} else {
	t_relay("udp:10.0.0.2:5060");
}

The benefit of this module is the value of the switch flags can be manipulated by external applications such as web interface or command line tools. The size of bitmap is 32.

The module exports external commands that can be used to change the global flags via Management Interface. The MI commands are: “set_gflag”, “reset_gflag” and “is_gflag”.

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

None.

## Exported Parameters

### `initial` (integer)

The initial value of global flags bitmap.

*Default value is 0.*

**Example.** 15.

```opensips
modparam("gflags", "initial", 15)
```

## Exported Functions

### `is_gflag(flag)`

Check if bit at the position “flag” in global flags is set.

**Parameters:**

- `flag` *(int, required)* — The “flag” (int) parameter can have a value in the range of 0..31.
  - `0..31`

**Usable from:** any route

**Example.** is_gflag() usage.

```opensips
...
if(is_gflag(4))
{
	log("global flag 4 is set\\n");
} else {
	log("global flag 4 is not set\\n");
};
...
```

### `reset_gflag(flag)`

Reset the bit at the position “flag” in global flags.

**Parameters:**

- `flag` *(int, required)* — The “flag” (int) parameter can have a value in the range of 0..31.
  - `0..31`

**Usable from:** any route

**Example.** reset_gflag() usage.

```opensips
...
reset_gflag(4);
...
```

### `set_gflag(flag)`

Set the bit at the position “flag” in global flags.

**Parameters:**

- `flag` *(int, required)* — The “flag” (int) parameter can have a value in the range of 0..31.
  - `0..31`

**Usable from:** any route

**Example.** set_gflag() usage.

```opensips
...
set_gflag(4);
...
```

## Exported MI Functions

### `get_gflags`

Return the bitmap with all flags. The function gets no parameters and returns the bitmap in hexa and decimal format.

**Returns:** Returns the bitmap in hexa and decimal format.

**Example.** get_gflags usage

```bash
$ opensips-cli -x mi get_gflags
0x3039
12345
```

### `is_gflag`

Returns true if the all the flags from the bitmask are set.

**Parameters:**

- `bitmask` *(string, required)* — The parameter value must be a bitmask in decimal or hexa format. The bitmaks has a 32 bit size.

**Returns:** The function returns TRUE if all the flags from the set are set and FALSE if at least one is not set.

**Example.** is_gflag usage

```bash
$ opensips-cli -x mi set_gflag 1024
$ opensips-cli -x mi is_gflag 1024
TRUE
$ opensips-cli -x mi is_gflag 1025
TRUE
$ opensips-cli -x mi is_gflag 1023
FALSE
$ opensips-cli -x mi set_gflag 0x10
$ opensips-cli -x mi is_gflag 1023
TRUE
$ opensips-cli -x mi is_gflag 1007
FALSE
$ opensips-cli -x mi is_gflag 16
TRUE
```

### `reset_gflag`

Reset the value of some flags to 0.

**Parameters:**

- `bitmask` *(string, required)* — The parameter value must be a bitmask in decimal or hexa format. The bitmaks has a 32 bit size.

**Example.** reset_gflag usage

```bash
$ opensips-cli -x mi reset_gflag 1
$ opensips-cli -x mi reset_gflag 0x3
```

### `set_gflag`

Set the value of some flags (specified by bitmask) to 1.

**Parameters:**

- `bitmask` *(string, required)* — The parameter value must be a bitmask in decimal or hexa format. The bitmaks has a 32 bit size.

**Example.** set_gflag usage

```bash
$ opensips-cli -x mi set_gflag 1
$ opensips-cli -x mi set_gflag 0x3
```

## Configuration Examples

### `initial` parameter usage

Sets the initial value of global flags bitmap.

```opensips
modparam("gflags", "initial", 15)
```
### `set_gflag()` usage

Sets the bit at the position “flag” in global flags.

```opensips
...
set_gflag(4);
...
```
### `reset_gflag()` usage

Resets the bit at the position “flag” in global flags.

```opensips
...
reset_gflag(4);
...
```
### `is_gflag()` usage

Checks if bit at the position “flag” in global flags is set.

```opensips
...
if(is_gflag(4))
{
	log("global flag 4 is set\\n");
} else {
	log("global flag 4 is not set\\n");
};
...
```
### `set_gflag` usage

Sets the value of some flags (specified by bitmask) to 1 via Management Interface.

```opensips
...
$ opensips-cli -x mi set_gflag 1
$ opensips-cli -x mi set_gflag 0x3
...
```
### `reset_gflag` usage

Resets the value of some flags to 0 via Management Interface.

```opensips
...
$ opensips-cli -x mi reset_gflag 1
$ opensips-cli -x mi reset_gflag 0x3
...
```
### `is_gflag` usage

Returns true if all the flags from the bitmask are set via Management Interface.

```opensips
...
$ opensips-cli -x mi set_gflag 1024
$ opensips-cli -x mi is_gflag 1024
TRUE
$ opensips-cli -x mi is_gflag 1025
TRUE
$ opensips-cli -x mi is_gflag 1023
FALSE
$ opensips-cli -x mi set_gflag 0x10
$ opensips-cli -x mi is_gflag 1023
TRUE
$ opensips-cli -x mi is_gflag 1007
FALSE
$ opensips-cli -x mi is_gflag 16
TRUE
...
```
### `get_gflags` usage

Returns the bitmap with all flags via Management Interface.

```opensips
...
$ opensips-cli -x mi get_gflags
0x3039
12345
...
```
