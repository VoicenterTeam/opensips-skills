# Script Syntax v4.0
<!-- generated-from: data/4.0/guides/syntax.json
     generator-version: 0.1.0
     opensips-version: 4.0
     doc-type: syntax_guide -->

Script syntax reference for OpenSIPs 4.0. Read this file when reviewing the language-level rules that govern variables, expressions, statements, and route blocks within an opensips.cfg.

## Contents

- [Overview](#overview)
- [Configuration Sections](#configuration-sections)

## Overview

The OpenSIPS configuration script has three main logical parts: global parameters, modules section, and routing logic. It supports basic data types like integers and strings, and complex types like lists and maps. Functions follow specific calling conventions regarding variable passing and string formatting.

## Configuration Sections

### Global parameters

Usually, in the first part, you declare the OpenSIPS global parameters - these global or core parameters are affecting the OpenSIPS core and possible the modules. Configuring the network listeners, available transport protocols, forking (and number of processes), the logging and other global stuff is provided by these global parameters.

**Parameters:**

- `disable_tcp`
- `listen`
- `fork`
- `children`
- `log_stderror`

*Example of global parameters configuration.*

```opensips
disable_tcp = yes
listen = udp:192.168.4.00:5060
listen = udp:192.168.4.00:5070
fork = yes
children = 4
log_stderror = no
```

### Modules section

The modules that are to be loaded (no module is loaded by default) are specified by using the directive loadmodule. Modules are to be specified by name and an optional path (to the .so file). Once the modules are loaded, the parameters of the modules may be set using the modparam directive.

**Parameters:**

- `loadmodule`
- `modparam`
- `mpath`

*Example of loading a module with a specific path and setting parameters.*

```opensips
loadmodule "modules/mi_datagram/mi_datagram.so"
modparam("mi_datagram", "socket_name", "udp:127.0.0.1:4343")
modparam("mi_datagram", "children_count", 3)
```

*Example of setting a global module path and loading multiple modules.*

```opensips
mpath="/usr/local/opensips_proxy/lib/modules"
loadmodule "mi_datagram.so"
modparam("mi_datagram", "socket_name", "udp:127.0.0.1:4343")
modparam("mi_datagram", "children_count", 3)
loadmodule "mi_fifo.so"
modparam("mi_fifo", "fifo_name", "/tmp/opensips_fifo")
```

### Routing logic

The routing logic is actually a sum of routes (script routes) that contain the OpenSIPS logic for routing SIP traffic. There are different types of routes: top routes (directly triggered by OpenSIPS) and sub-routes (triggered/used from other routes).

**Parameters:**

- `route`

### Data Types

The OpenSIPS scripting language supports basic data types (integer, string, double) and complex data types (list, map).

**Parameters:**

- `integer`
- `string`
- `double`
- `list`
- `map`

### Function Calling Conventions

All OpenSIPS core and module functions internally share the same function interface. Rules include: integer/string params can use holder variables; string params can be format strings; input/output variables must not be quoted; integers no longer need double quotes.

*Direct integer parameter passing.*

```opensips
ds_select_dst(1, 1);
```

*Passing parameters using holder variables.*

```opensips
$var(x) = 1;
ds_select_dst($var(x), $var(x));
```

*Passing a string parameter as a format string.*

```opensips
set_dlg_profile("caller", "$var(country_code)_$var(area)_$fU");
```

*Passing an output variable without quotes.*

```opensips
ds_count(1, "a", $var(out_result));
```

*Integers passed as double-quoted strings vs plain integers.*

```opensips
ds_select_dst("1", "1");
ds_select_dst(1, 1);
```
