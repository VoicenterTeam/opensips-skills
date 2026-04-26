# db_unixodbc Module Reference
<!-- generated-from: data/4.0/modules/db_unixodbc.json
     generator-version: 0.1.0
     opensips-version: 4.0
     doc-type: module -->

Reference for the OpenSIPs 4.0 db_unixodbc module. Read this file when configuring or debugging the db_unixodbc module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Configuration Examples](#configuration-examples)

## Overview

This module allows to use the unixodbc package with OpenSIPS. It have been tested with mysql and the odbc connector, but it should work also with other database. The auth_db module works.

For more information, see the [http://www.unixodbc.org/](http://www.unixodbc.org/) project web page.

To see what DB engines can be used via unixodbc, look at [http://www.unixodbc.org/drivers.html](http://www.unixodbc.org/drivers.html).

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

None.

## Exported Parameters

### `auto_reconnect` (integer)

Turns on or off the auto_reconnect mode.

*Default value is 1.*

**Example.** 0.

```opensips
modparam("db_unixodbc", "auto_reconnect", 0)
```
### `use_escape_common` (integer)

Escape values in query using internal escape_common() function. It escapes single quote ''', double quote '"', backslash '\\', and NULL characters.

You should enable this parameter if you know that the ODBC driver considers the above characters as special (for marking begin and end of a value, escape other characters ...). It prevents against SQL injection.

*Default value is 0.*

**Possible values:**

- 0
- 1

**Example.** 1.

```opensips
modparam("db_unixodbc", "use_escape_common", 1)
```

## Configuration Examples

### Set the “auto_reconnect” parameter

Turns on or off the auto_reconnect mode.

```opensips
...
modparam("db_unixodbc", "auto_reconnect", 0)
...
```
### Set the “use_escape_common” parameter

Escape values in query using internal escape_common() function. It escapes single quote ''', double quote '"', backslash '\\', and NULL characters.

```opensips
...
modparam("db_unixodbc", "use_escape_common", 1)
...
```
