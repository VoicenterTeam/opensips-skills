## 1.3.�Exported Parameters

### 1.3.1.�`exec_query_threshold` (integer)

If queries take longer than 'exec\_query\_threshold' microseconds, warning messages will be written to logging facility.

_Default value is 0 - disabled._

**Example�1.1.�Set `exec_query_threshold` parameter**

...
modparam("db\_postgres", "exec\_query\_threshold", 60000)
...

  

### 1.3.2.�`max_db_queries` (integer)

The maximum number of database queries to be executed. If this parameter is set improperly, it is set to default value.

_Default value is 2._

**Example�1.2.�Set `max_db_queries` parameter**

...
modparam("db\_postgres", "max\_db\_queries", 2)
...

  

### 1.3.3.�`timeout` (integer)

The number of seconds the PostgreSQL library waits to connect and query the server. If the connection does not succeed within the given timeout, the connection fails.

_Note:_If the timeout is a negative value and connection does not succeed, OpenSIPS will block until the connection becomes back available and gets successfully established. This is the default behavior of the library and is the behavior prior to the adition of this parameter.

_Default value is 5._

**Example�1.3.�Set `timeout` parameter**

...
modparam("db\_postgres", "timeout", 2)
...

  

### 1.3.4.�`use_tls` (integer)

Warning: the _tls\_openssl_ module cannot be used when setting this parameter. Use the _tls\_wolfssl_ module instead if a TLS/SSL Library is required.

Setting this parameter will allow you to use TLS for PostgreSQL connections. In order to enable TLS for a specific connection, you can use the "tls\_domain=_dom\_name_" URL parameter in the db\_url of the respective OpenSIPS module. This should be placed at the end of the URL after the '?' character.

When using this parameter, you must also ensure that _tls\_mgm_ is loaded and properly configured. Refer to the the module for additional info regarding TLS client domains.

Note that if you want to use this feature, the TLS domain must be provisioned in the configuration file, _NOT_ in the database. In case you are loading TLS certificates from the database, you must at least define one domain in the configuration script, to use for the initial connection to the DB.

Also, you can _NOT_ enable TLS for the connection to the database of the _tls\_mgm_ module itself.

_Default value is **0** (not enabled)_

**Example�1.4.�Set the `use_tls` parameter**

...
modparam("tls\_mgm", "client\_domain", "dom1")
modparam("tls\_mgm", "certificate", "\[dom1\]/etc/pki/tls/certs/opensips.pem")
modparam("tls\_mgm", "private\_key", "\[dom1\]/etc/pki/tls/private/opensips.key")
modparam("tls\_mgm", "ca\_list",     "\[dom1\]/etc/pki/tls/certs/ca.pem")
...
modparam("db\_postgres", "use\_tls", 1)
...
modparam("usrloc", "db\_url", "postgres://root:1234@localhost/opensips?tls\_domain=dom1")
...