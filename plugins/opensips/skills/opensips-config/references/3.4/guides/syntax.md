# Script Syntax v3.4
<!-- generated-from: data/3.4/guides/syntax.json
     generator-version: 0.1.0
     opensips-version: 3.4
     doc-type: syntax_guide -->

Script syntax reference for OpenSIPs 3.4. Read this file when reviewing the language-level rules that govern variables, expressions, statements, and route blocks within an opensips.cfg.

## Contents

- [Overview](#overview)
- [Configuration Sections](#configuration-sections)
- [Best Practices](#best-practices)

## Overview

The OpenSIPS configuration script has three main logical parts: global parameters, modules section, and routing logic. It supports basic data types like integers and strings, and complex types like lists and maps, with specific function calling conventions.

## Configuration Sections

### Global Parameters

Usually, in the first part, you declare the OpenSIPS global parameters - these global or core parameters are affecting the OpenSIPS core and possible the modules.

**Parameters:**

- `disable_tcp`
- `listen`
- `fork`
- `children`
- `log_stderror`

*Example of global parameters configuration.*

```opensips_script
disable_tcp = yes
listen = udp:192.168.3.40:5060
listen = udp:192.168.3.40:5070
fork = yes
children = 4
log_stderror = no
```

### Modules Section

In regards to the OpenSIPS modules,the modules that are to be loaded (no module is loaded by default) are specified by using the directive loadmodule.

**Parameters:**

- `loadmodule`
- `modparam`
- `mpath`

*Example of loading a module with a specific path.*

```opensips_script
loadmodule "modules/mi_datagram/mi_datagram.so"
modparam("mi_datagram", "socket_name", "udp:127.0.0.1:4343")
modparam("mi_datagram", "children_count", 3)
```

*Example of using a global module path (mpath) and loading multiple modules.*

```opensips_script
mpath="/usr/local/opensips_proxy/lib/modules"
loadmodule "mi_datagram.so"
modparam("mi_datagram", "socket_name", "udp:127.0.0.1:4343")
modparam("mi_datagram", "children_count", 3)
loadmodule "mi_fifo.so"
modparam("mi_fifo", "fifo_name", "/tmp/opensips_fifo")
```

### Routing Logic

The routing logic is actually a sum of routes (script routes) that contain the OpenSIPS logic for routing SIP traffic.

**Parameters:**

- `route`

### Data Types

The OpenSIPS scripting language supports the following data types: integer, string, double, list, map.

**Parameters:**

- `integer`
- `string`
- `double`
- `list`
- `map`

### Function Calling Conventions

All OpenSIPS core and module functions internally share the same function interface, such that they benefit from specific calling conventions.

*Direct integer passing.*

```opensips_script
ds_select_dst(1, 1);
```

*Passing parameters using holder variables.*

```opensips_script
$var(x) = 1;
ds_select_dst($var(x), $var(x));
```

*Passing a string as a format string.*

```opensips_script
set_dlg_profile("caller", "$var(country_code)_$var(area)_$fU");
```

*Passing an output variable without quotes.*

```opensips_script
ds_count(1, "a", $var(out_result));
```

*Integers passed as strings vs integers.*

```opensips_script
ds_select_dst("1", "1");

ds_select_dst(1, 1);
```

## Best Practices

### Holder Variables

Any integer or string function parameter may also be passed using a 'holder' variable.
### Format Strings

Any string function parameter can be passed as a format string. Literal '$' characters can be included using '$$'.
### Quoting Variables

Input or output variables passed to functions must not be quoted.
### Integer Passing

Integers no longer need to be passed as double-quoted strings.
