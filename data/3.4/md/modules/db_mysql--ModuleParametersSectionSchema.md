## 1.3.�Exported Parameters

### 1.3.1.�`exec_query_threshold` (integer)

If queries take longer than 'exec\_query\_threshold' microseconds, warning messages will be written to logging facility.

_Default value is 0 - disabled._

**Example�1.1.�Set `exec_query_threshold` parameter**

...
modparam("db\_mysql", "exec\_query\_threshold", 60000)
...

  

### 1.3.2.�`timeout_interval` (integer)

Time interval after which a connection attempt (read or write request) is aborted. The value counts three times, as several retries are done from the driver before it gives up.

The read timeout parameter is ignored on driver versions prior to “5.1.12”, “5.0.25” and “4.1.22”. The write timeout parameter is ignored on version prior to “5.1.12” and “5.0.25”, the “4.1” release don't support it at all.

_Default value is 2 (6 sec)._

**Example�1.2.�Set `timeout_interval` parameter**

...
modparam("db\_mysql", "timeout\_interval", 2)
...

  

### 1.3.3.�`max_db_queries` (integer)

The maximum number of retries to execute a failed query due to connections problems. If this parameter is set improperly, it is set to default value.

_Default value is 2._

**Example�1.3.�Set `max_db_queries` parameter**

...
modparam("db\_mysql", "max\_db\_queries", 2)
...

  

### 1.3.4.�`max_db_retries` (integer)

The maximum number of database connection retries. If this parameter is set improperly, it is set to default value.

_Default value is 3._

**Example�1.4.�Set `max_db_retries` parameter**

...
modparam("db\_mysql", "max\_db\_retries", 2)
...

  

### 1.3.5.�`ps_max_col_size` (integer)

The maximum size of a column's data, when fetched using prepared statements. Particularly relevant for variable-length data, such as CHAR, BLOB, etc.

NOTE: Should a column's data exceed this limit, the value will be silently truncated to fit the buffer, without reporting any errors!

_Default value is _1024 (bytes)_._

**Example�1.5.�Set `ps_max_col_size` parameter**

...
modparam("db\_mysql", "ps\_max\_col\_size", 4096)
...

  

### 1.3.6.�`use_tls` (integer)

Setting this parameter will allow you to use TLS for MySQL connections. In order to enable TLS for a specific connection, you can use the "**tls\_domain=**dom\_name" URL parameter in the db\_url of the respective OpenSIPS module. This should be placed at the end of the URL after the **'?'** character. Additionally, the query string may include the "**tls\_opts=** PKEY,CERT,CA,CA\_DIR,CIPHERS" CSV parameter, in order to control/limit the amount of TLS options passed to the TLS library.

When using this parameter, you must also ensure that _tls\_mgm_ is loaded and properly configured. Refer to the the module for additional info regarding TLS client domains.

Note that if you want to use this feature, the TLS domain must be provisioned in the configuration file, _NOT_ in the database. In case you are loading TLS certificates from the database, you must at least define one domain in the configuration script, to use for the initial connection to the DB.

Also, you can _NOT_ enable TLS for the connection to the database of the _tls\_mgm_ module itself.

_Default value is **0** (not enabled)_

**Example�1.6.�Set the `use_tls` parameter**

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