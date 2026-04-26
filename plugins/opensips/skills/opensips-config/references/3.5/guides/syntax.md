# Script Syntax v3.5
<!-- generated-from: data/3.5/guides/syntax.json
     generator-version: 0.1.0
     opensips-version: 3.5
     doc-type: syntax_guide -->

Script syntax reference for OpenSIPs 3.5. Read this file when reviewing the language-level rules that govern variables, expressions, statements, and route blocks within an opensips.cfg.

## Contents

- [Overview](#overview)
- [Configuration Sections](#configuration-sections)
- [Best Practices](#best-practices)

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
listen = udp:192.168.3.50:5060
listen = udp:192.168.3.50:5070
fork = yes
children = 4
log_stderror = no
```

### Modules section

The modules that are to be loaded are specified by using the directive loadmodule. Modules are to be specified by name and an optional path. Once the modules are loaded, the parameters of the modules may be set using the modparam directive.

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

The routing logic is actually a sum of routes (script routes) that contain the OpenSIPS logic for routing SIP traffic. There are top routes (triggered by events) and sub-routes (called from other routes).

**Parameters:**

- `route`

### Data Types

The OpenSIPS scripting language supports integer (32-bit signed), string (unlimited size), double (via mathops module), list (via $avp), and map (via $json and $xml) data types.

### Function Calling Conventions

Core and module functions share calling conventions: parameters may use holder variables, strings can be format strings, variables must not be quoted, and integers do not need quotes.

*Direct integer parameter passing.*

```opensips
ds_select_dst(1, 1);
```

*Passing parameters using holder variables.*

```opensips
$var(x) = 1;
ds_select_dst($var(x), $var(x));
```

*Passing a string as a format string.*

```opensips
set_dlg_profile("caller", "$var(country_code)_$var(area)_$fU");
```

*Passing an unquoted output variable.*

```opensips
ds_count(1, "a", $var(out_result));
```

*Comparison of passing integers as quoted strings vs plain integers.*

```opensips
ds_select_dst("1", "1");
ds_select_dst(1, 1);
```

## Best Practices

### Holder Variables

Any integer or string function parameter may also be passed using a holder variable.
### Format Strings

Any string function parameter can be passed as a format string. Literal '$' characters can be included using the '$$' escape sequence.
### Unquoted Variables

Input or output variables passed to functions must not be quoted.
### Integer Passing

Integers no longer need to be passed as double-quoted strings.
