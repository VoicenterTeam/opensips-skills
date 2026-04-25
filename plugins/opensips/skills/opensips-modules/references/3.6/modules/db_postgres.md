# db_postgres Module Reference
<!-- generated-from: data/3.6/modules/db_postgres.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 db_postgres module. Read this file when configuring or debugging the db_postgres module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Configuration Examples](#configuration-examples)

## Overview

Module description

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

- `PostgreSQL devel library` — to compile the module (e.g., libpq-dev)
- `PostgreSQL library` — e.g., libpq5

## Exported Parameters

### `exec_query_threshold` (integer)

If queries take longer than 'exec\_query\_threshold' microseconds, warning messages will be written to logging facility.

*Default value is 0 - disabled.*

**Example.** 60000.

```opensips
modparam("db\_postgres", "exec\_query\_threshold", 60000)
```
### `max_db_queries` (integer)

The maximum number of database queries to be executed. If this parameter is set improperly, it is set to default value.

*Default value is 2.*

**Example.** 2.

```opensips
modparam("db\_postgres", "max\_db\_queries", 2)
```
### `timeout` (integer)

The number of seconds the PostgreSQL library waits to connect and query the server. If the connection does not succeed within the given timeout, the connection fails.

*Default value is 5.*

**Notes:** If the timeout is a negative value and connection does not succeed, OpenSIPS will block until the connection becomes back available and gets successfully established. This is the default behavior of the library and is the behavior prior to the adition of this parameter.

**Example.** 2.

```opensips
modparam("db\_postgres", "timeout", 2)
```
### `use_tls` (integer)

Parameter to control the way the SSL support is used when connecting to the Postgres server, as follows:

*   _use\_tls=0_ (default) - the SSL support is disabled and there is no attempt to use it;
    
*   _use\_tls=1_ with "tls\_domain" present in the DB URL - the SSL support is enabled, either "require", either "verify-ca", depending on the certificate settings;
    
*   _use\_tls=1_ with no "tls\_domain" present in the DB URL - the SSL support is enabled in best effort mode (or "prefer"); if supported by the server, it will be used, otherwise it will fall back to non-SSL.

*Default value is 0 (not enabled).*

**Possible values:**

- 0
- 1

**Notes:** Warning: the _tls\_openssl_ module cannot be used when setting this parameter. Use the _tls\_wolfssl_ module instead if a TLS/SSL Library is required.

Setting this parameter will allow you to use TLS for PostgreSQL connections. In order to enable TLS for a specific connection, you can use the "tls\_domain=_dom\_name_" URL parameter in the db\_url of the respective OpenSIPS module. This should be placed at the end of the URL after the '?' character.

When using this parameter, you must also ensure that _tls\_mgm_ is loaded and properly configured. Refer to the the module for additional info regarding TLS client domains.

Note that if you want to use this feature, the TLS domain must be provisioned in the configuration file, _NOT_ in the database. In case you are loading TLS certificates from the database, you must at least define one domain in the configuration script, to use for the initial connection to the DB.

Also, you can _NOT_ enable TLS for the connection to the database of the _tls\_mgm_ module itself.

**Example.** 1.

```opensips
modparam("tls\_mgm", "client\_domain", "dom1")
modparam("tls\_mgm", "certificate", "\[dom1\]/etc/pki/tls/certs/opensips.pem")
modparam("tls\_mgm", "private\_key", "\[dom1\]/etc/pki/tls/private/opensips.key")
modparam("tls\_mgm", "ca\_list",     "\[dom1\]/etc/pki/tls/certs/ca.pem")
...
modparam("db\_postgres", "use\_tls", 1)
...
modparam("usrloc", "db\_url", "postgres://root:1234@localhost/opensips?tls\_domain=dom1")
```

## Configuration Examples

### Set `exec_query_threshold` parameter

Sets the exec_query_threshold parameter.

```opensips
...
modparam("db_postgres", "exec_query_threshold", 60000)
...
```
### Set `max_db_queries` parameter

Sets the max_db_queries parameter.

```opensips
...
modparam("db_postgres", "max_db_queries", 2)
...
```
### Set `timeout` parameter

Sets the timeout parameter.

```opensips
...
modparam("db_postgres", "timeout", 2)
...
```
### Set the `use_tls` parameter

Sets the use_tls parameter.

```opensips
...
modparam("tls_mgm", "client_domain", "dom1")
modparam("tls_mgm", "certificate", "[dom1]/etc/pki/tls/certs/opensips.pem")
modparam("tls_mgm", "private_key", "[dom1]/etc/pki/tls/private/opensips.key")
modparam("tls_mgm", "ca_list",     "[dom1]/etc/pki/tls/certs/ca.pem")
...
modparam("db_postgres", "use_tls", 1)
...
modparam("usrloc", "db_url", "postgres://root:1234@localhost/opensips?tls_domain=dom1")
...
```
