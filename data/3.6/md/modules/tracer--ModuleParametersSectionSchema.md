## 1.3.�Exported Parameters

### 1.3.1.�`trace_on` (integer)

Parameter to enable/disable trace (on(1)/off(0))

_Default value is "1"(enabled)._

**Example�1.1.�Set `trace_on` parameter**

...
modparam("tracer", "trace\_on", 1)
...

  

### 1.3.2.�`trace_local_ip` (str)

The address to be used in the fields that specify the source address (protocol, ip and port) for locally generated messages. If not set, the module sets it to the address of the socket that will be used to send the message. Protocol and/or port are optional and if omitted will take the default values: udp and 5060.

_Default value is "NULL"._

**Example�1.2.�Set `trace_local_ip` parameter**

...
#Resulting address: udp:10.1.1.1:5064
modparam("tracer", "trace\_local\_ip", "10.1.1.1:5064")
...

...
#Resulting address: tcp:10.1.1.1:5060
modparam("tracer, "trace\_local\_ip", "tcp:10.1.1.1")
...

...
#Resulting address: tcp:10.1.1.1:5064
modparam("tracer", "trace\_local\_ip", "tcp:10.1.1.1:5064")
...

...
#Resulting address: udp:10.1.1.1:5060
modparam("tracer", "trace\_local\_ip", "10.1.1.1")
...

  

### 1.3.3.�`trace_id` (str)

Specify a destination for the trace. This can be a hep id defined in proto\_hep, a sip uri, a file, a syslog facility or a database url and a table. All parameters inside _trace\_id_ must be separated by _;_, excepting the last one. The parameters are given in key-value format, the possible keys being _uri_ for HEP and SIP IDs and _uri_ and _table_ for databases. The format is _\[id\_name\]key1=value1;key2=value2;_. HEP id's **MUST** be defined in proto\_hep in order to be able to use them here.

When the uri is a _file_, the path to the file has to be specified after the colon. The output is always appended if the file exists, or created if it doesn't, using [file\_mode](#param_file_mode "1.3.6.�file_mode (integer)") permissions.

When the uri is _syslog_, it has to follow the following format: _syslog\[:FACILITY\[:LEVEL\]\]_. The default facility and levels are the ones used by OpenSIPS (_syslog\_facility_ and _log\_level_). These can be tuned using [syslog\_default\_facility](#param_syslog_default_facility "1.3.4.�syslog_default_facility (string)") and [syslog\_default\_level](#param_syslog_default_level "1.3.5.�syslog_default_level (integer)") parameters.

One can declare multiple types of tracing under the same trace id, being identified by their name. So if you define two database url, one hep uri and one sip uri with the same name, when calling trace() with this name tracing shall be done to all the destinations.

All the old parameter such as db\_url, table and duplicate\_uri will form the trace id with the name "default".

_No default value. If not set the module will be useless._

**Example�1.3.�Set `trace_id` parameter**

...
/\*DB trace id\*/
modparam("tracer", "trace\_id",
"\[tid\]
uri=mysql://xxxx:xxxx@10.10.10.10/opensips;
table=new\_sip\_trace;")
/\* hep trace id with the hep id defined in proto\_hep; check proto\_hep docs
 \* for more information \*/
modparam("proto\_hep", "hep\_id",  "\[hid\]10.10.10.10")
modparam("tracer", "trace\_id", "\[tid\]uri=hep:hid")
/\*sip trace id\*/
modparam("tracer", "trace\_id",
"\[tid\]uri=sip:10.10.10.11:5060")
/\* notice that they all have the same name
 \* meaning that calling trace("tid",...)
 \* will do sql, sip and hep tracing \*/
/\*file trace id\*/
modparam("tracer", "trace\_id",
"\[tid\]uri=file:/path/to/file")
/\*syslog trace id at error (level -1)\*/
modparam("tracer", "trace\_id",
"\[tid\]uri=syslog:local0:-1")
...

  

### 1.3.4.�`syslog_default_facility` (string)

When _syslog_ tracing is used, this parameter specifies the log facility to write traces to.

_Default value is the value of _syslog\_facility_._

**Example�1.4.�Set `syslog_default_facility` parameter**

...
modparam("tracer", "syslog\_default\_facility", "LOG\_DAEMON")
...

  

### 1.3.5.�`syslog_default_level` (integer)

When _syslog_ tracing is used, this parameter specifies the level to write traces to.

_Default value is the value of _log\_level_._

**Example�1.5.�Set `syslog_default_level` parameter**

...
modparam("tracer", "syslog\_default\_level", 2) # NOTICE
...

  

### 1.3.6.�`file_mode` (integer)

When _file_ tracing is used, this parameter specifies the permissions to be used to create the trace files. It follows the UNIX conventions.

_Default value is _0600 (rw-------)_._

**Example�1.6.�Set `file_mode` parameter**

...
modparam("tracer", "file\_mode", 0644)
...