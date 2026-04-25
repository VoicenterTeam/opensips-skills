# db_mysql Module Reference
<!-- generated-from: data/3.5/modules/db_mysql.json
     generator-version: 0.1.0
     opensips-version: 3.5
     doc-type: module -->

Reference for the OpenSIPs 3.5 db_mysql module. Read this file when configuring or debugging the db_mysql module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Events](#exported-events)
- [Configuration Examples](#configuration-examples)

## Overview

This is a module which provides MySQL connectivity for OpenSIPS. It implements the DB API defined in OpenSIPS.

## Dependencies

### OpenSIPs Modules

- `tls_mgm` — If a use_tls is defined, the tls_mgm module will need to be loaded as well (optional)

### External Libraries

- `libmysqlclient-dev` — the development libraries of mysql-client

## Exported Parameters

### `exec_query_threshold` (integer)

If queries take longer than 'exec\_query\_threshold' microseconds, warning messages will be written to logging facility.

*Default value is 0 - disabled.*

**Example.** 60000.

```opensips
modparam("db\_mysql", "exec\_query\_threshold", 60000)
```
### `max_db_queries` (integer)

The maximum number of retries to execute a failed query due to connections problems. If this parameter is set improperly, it is set to default value.

*Default value is 2.*

**Example.** 2.

```opensips
modparam("db\_mysql", "max\_db\_queries", 2)
```
### `max_db_retries` (integer)

The maximum number of database connection retries. If this parameter is set improperly, it is set to default value.

*Default value is 3.*

**Example.** 2.

```opensips
modparam("db\_mysql", "max\_db\_retries", 2)
```
### `ps_max_col_size` (integer)

The maximum size of a column's data, when fetched using prepared statements. Particularly relevant for variable-length data, such as CHAR, BLOB, etc.

*Default value is 1024 (bytes).*

**Notes:** NOTE: Should a column's data exceed this limit, the value will be silently truncated to fit the buffer, without reporting any errors!

**Example.** 4096.

```opensips
modparam("db\_mysql", "ps\_max\_col\_size", 4096)
```
### `timeout_interval` (integer)

Time interval after which a connection attempt (read or write request) is aborted. The value counts three times, as several retries are done from the driver before it gives up.

The read timeout parameter is ignored on driver versions prior to “5.1.12”, “5.0.25” and “4.1.22”. The write timeout parameter is ignored on version prior to “5.1.12” and “5.0.25”, the “4.1” release don't support it at all.

*Default value is 2 (6 sec).*

**Example.** 2.

```opensips
modparam("db\_mysql", "timeout\_interval", 2)
```
### `use_tls` (integer)

Setting this parameter will allow you to use TLS for MySQL connections. In order to enable TLS for a specific connection, you can use the "**tls\_domain=**dom\_name" URL parameter in the db\_url of the respective OpenSIPS module. This should be placed at the end of the URL after the **'?'** character. Additionally, the query string may include the "**tls\_opts=** PKEY,CERT,CA,CA\_DIR,CIPHERS" CSV parameter, in order to control/limit the amount of TLS options passed to the TLS library.

*Default value is 0 (not enabled).*

**Notes:** When using this parameter, you must also ensure that _tls\_mgm_ is loaded and properly configured. Refer to the the module for additional info regarding TLS client domains.

Note that if you want to use this feature, the TLS domain must be provisioned in the configuration file, _NOT_ in the database. In case you are loading TLS certificates from the database, you must at least define one domain in the configuration script, to use for the initial connection to the DB.

Also, you can _NOT_ enable TLS for the connection to the database of the _tls\_mgm_ module itself.

**Example.** 1.

```opensips
modparam("tls\_mgm", "client\_domain", "dom1")
modparam("tls\_mgm", "certificate", "\[dom1\]/etc/pki/tls/certs/opensips.pem")
modparam("tls\_mgm", "private\_key", "\[dom1\]/etc/pki/tls/private/opensips.key")
modparam("tls\_mgm", "ca\_list",     "\[dom1\]/etc/pki/tls/certs/ca.pem")
...
modparam("db\_mysql", "use\_tls", 1)
...
modparam("usrloc", "db\_url", "mysql://root:1234@localhost/opensips?tls\_domain=dom1")
...
modparam("usrloc", "db\_url", "mysql://root:1234@localhost/opensips?tls\_domain=dom1&tls\_opts=PKEY,CERT,CA,CA\_DIR,CIPHERS")
```

## Exported Events

### `E_MYSQL_CONNECTION`

This event is raised when a MySQL connection is lost or recovered.

**Parameters:**

- `url` *(string)* — the URL of the connection as specified by the db_url parameter.
- `status` *(string)* — connected if the connection recovered, or disconnected if the connection was lost.

## Configuration Examples

### Set `exec_query_threshold` parameter

Sets the exec_query_threshold parameter.

```opensips
...
modparam("db\_mysql", "exec\_query\_threshold", 60000)
...
```
### Set `timeout_interval` parameter

Sets the timeout_interval parameter.

```opensips
...
modparam("db\_mysql", "timeout\_interval", 2)
...
```
### Set `max_db_queries` parameter

Sets the max_db_queries parameter.

```opensips
...
modparam("db\_mysql", "max\_db\_queries", 2)
...
```
### Set `max_db_retries` parameter

Sets the max_db_retries parameter.

```opensips
...
modparam("db\_mysql", "max\_db\_retries", 2)
...
```
### Set `ps_max_col_size` parameter

Sets the ps_max_col_size parameter.

```opensips
...
modparam("db\_mysql", "ps\_max\_col\_size", 4096)
...
```
### Set the `use_tls` parameter

Sets the use_tls parameter and configures TLS domains.

```opensips
...
modparam("tls\_mgm", "client\_domain", "dom1")
modparam("tls\_mgm", "certificate", "\[dom1\]/etc/pki/tls/certs/opensips.pem")
modparam("tls\_mgm", "private\_key", "\[dom1\]/etc/pki/tls/private/opensips.key")
modparam("tls\_mgm", "ca\_list",     "\[dom1\]/etc/pki/tls/certs/ca.pem")
...
modparam("db\_mysql", "use\_tls", 1)
...
modparam("usrloc", "db\_url", "mysql://root:1234@localhost/opensips?tls\_domain=dom1")
...
modparam("usrloc", "db\_url", "mysql://root:1234@localhost/opensips?tls\_domain=dom1&tls\_opts=PKEY,CERT,CA,CA\_DIR,CIPHERS")
...
```
