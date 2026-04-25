## 1.3.�Exported Parameters

### 1.3.1.�`hep_id` (str)

Specify a destination for HEP packets and the version of HEP protocol used. All parameters inside **hep\_id** must be separated by **;**. The parameters are given in key-value format, the possible keys being **uri**, **transport** and **version**, except destiantion's URI which doesn't have a key and is in **host:port** . **transport** key can be **TCP** or **UDP**. **TCP** works only for HEP version 3. **Version** is the hep protocol version and can be **1**, **2** or **3**.

HEPv1 and HEPv2 can use only UDP. HEPv3 can use both TCP and UDP having the default set to TCP. If no hep version defined, the default is version 3 with TCP.

NO default value. If **hep\_id** the module can't be used for HEP tracing.

**Example�1.1.� Set `hep_id` parameter**

...
/\* define a destination to localhost on port 8001 using hepV3 on tcp \*/
modparam("proto\_hep", "hep\_id",
"\[hep\_dst\] 127.0.0.1:8001; transport=tcp; version=3")
/\* define a destination to 1.2.3.4 on port 5000 using hepV2; no transport(default UDP) \*/
modparam("proto\_hep", "hep\_id", "\[hep\_dst\] 1.2.3.4:5000; version=2")
/\* define only the destination uri; version will be 3(default) and transport TCP(default) \*/
modparam("proto\_hep", "hep\_id", "\[hep\_dst\] 1.2.3.4:5000")

  

### 1.3.2.�`homer5_on` (int)

Specify how the data should be encapsulated in the HEP packet. If set to _0_, then the JSON based HOMER 6 format will be used. Otherwise, if set to anything different than _0_, the plain text HOMER 5 format will be used for encapsulation. On the capturing node, this parameter affects the behavior of the _report\_capture_ function from the [sipcapture](sipcapture#func_report_capture) module.

Default value 1, HOMER5 format.

**Example�1.2.� Set `homer5_on` parameter**

modparam("proto\_hep", "homer5\_on", 0)

  

### 1.3.3.�`homer5_delim` (str)

In case **homer5\_on** is set (different than 0), with this parameter you will be able to set the delmiter between different payload parts.

Default value ":".

**Example�1.3.� Set `homer5_on` parameter**

modparam("proto\_hep", "homer5\_delim", "##")

  

### 1.3.4.�`hep_port` (integer)

The default port to be used by all TCP/UDP listeners.

_Default value is 5656._

**Example�1.4.�Set `hep_port` parameter**

...
modparam("proto\_hep", "hep\_port", 6666)
...

  

### 1.3.5.�`hep_send_timeout` (integer)

Time in milliseconds after a TCP connection will be closed if it is not available for blocking writing in this interval (and OpenSIPS wants to send something on it).

_Default value is 100 ms._

**Example�1.5.�Set `hep_send_timeout` parameter**

...
modparam("proto\_hep", "hep\_send\_timeout", 200)
...

  

### 1.3.6.�`hep_max_msg_chunks` (integer)

The maximum number of chunks in which a HEP message is expected to arrive via TCP. If a received packet is more fragmented than this, the connection is dropped (either the connection is very overloaded and this leads to high fragmentation - or we are the victim of an ongoing attack where the attacker is sending very fragmented traffic in order to decrease server performance).

_Default value is 32._

**Example�1.6.�Set `hep_max_msg_chunks` parameter**

...
modparam("proto\_hep", "hep\_max\_msg\_chunks", 8)
...

  

### 1.3.7.�`hep_async` (integer)

Specifies whether the TCP connect and write operations should be done in an asynchronous mode (non-blocking connect and write) or not. If disabled, OpenSIPS will block and wait for TCP operations like connect and write.

_Default value is 1 (enabled)._

**Example�1.7.�Set `hep_async` parameter**

...
modparam("proto\_hep", "hep\_async", 0)
...

  

### 1.3.8.�`hep_async_max_postponed_chunks` (integer)

If _hep\_async_ is enabled, this specifies the maximum number of HEP messages that can be stashed for later/async writing. If the connection pending writes exceed this number, the connection will be marked as broken and dropped.

_Default value is 32._

**Example�1.8.�Set `hep_async_max_postponed_chunks` parameter**

...
modparam("proto\_hep", "hep\_async\_max\_postponed\_chunks", 16)
...

  

### 1.3.9.�`hep_capture_id` (integer)

The parameter indicate the capture agent ID for HEPv2/v3 protocol. Limitation: 16-bit integer.

_Default value is "1"._

**Example�1.9.�Set `hep_capture_id` parameter**

...
modparam("proto\_hep", "hep\_capture\_id", 234)
...

  

### 1.3.10.�`hep_async_local_connect_timeout` (integer)

If _hep\_async_ is enabled, this specifies the number of milliseconds that a connect will be tried in blocking mode (optimization). If the connect operation lasts more than this, the connect will go to async mode and will be passed to TCP MAIN for polling.

_Default value is 100 ms._

**Example�1.10.�Set `hep_async_local_connect_timeout` parameter**

...
modparam("proto\_hep", "hep\_async\_local\_connect\_timeout", 200)
...

  

### 1.3.11.�`hep_async_local_write_timeout` (integer)

If _hep\_async_ is enabled, this specifies the number of milliseconds that a write op will be tried in blocking mode (optimization). If the write operation lasts more than this, the write will go to async mode and will be passed to bin MAIN for polling.

_Default value is 10 ms._

**Example�1.11.�Set `hep_async_local_write_timeout` parameter**

...
modparam("proto\_hep", "hep\_async\_local\_write\_timeout", 100)
...