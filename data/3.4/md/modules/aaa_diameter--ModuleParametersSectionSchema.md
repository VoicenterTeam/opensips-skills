## 1.3.�Exported Parameters

### 1.3.1.�`fd_log_level (integer)`

This parameter measures the _quietness_ of the logging done by the freeDiameter library. Possible values:

*   0 (ANNOYING)
    
*   1 (DEBUG)
    
*   3 (NOTICE, default)
    
*   5 (ERROR)
    
*   6 (FATAL)
    

NOTE: since freeDiameter logs to standard output, you must also enable the new core parameter, **log\_stdout**, before getting any logs from the library.

**Example�1.1.�Setting the `fd_log_level` parameter**

modparam("aaa\_diameter", "fd\_log\_level", 0)

  

### 1.3.2.�`realm (string)`

The unique realm to be used by all participating Diameter peers.

Default value is _"diameter.test"_.

**Example�1.2.�Setting the `realm` parameter**

modparam("aaa\_diameter", "realm", "opensips.org")

  

### 1.3.3.�`peer_identity (string)`

The identity (realm subdomain) of the Diameter server peer, to which the OpenSIPS Diameter client peer will connect.

Default value is _"server"_ (i.e. "server.diameter.test").

**Example�1.3.�Setting the `peer_identity` parameter**

modparam("aaa\_diameter", "peer\_identity", "server")

  

### 1.3.4.�`aaa_url (string)`

URL of the diameter client: the configuration file, with an optional extra-avps-file, where the Diameter client is configured.

By default, the connection is not created.

**Example�1.4.�Setting the `aaa_url` parameter**

modparam("aaa\_diameter", "aaa\_url", "diameter:freeDiameter-client.conf")

  

**Example�1.5.�Setting the `aaa_url` parameter**

with an extra AVPs file.

modparam("aaa\_diameter", "aaa\_url", "diameter:freeDiameter-client.conf;extra-avps-file:dictionary.opensips")

  

### 1.3.5.�`answer_timeout (integer)`

Time, in milliseconds, after which a [dm\_send\_request()](#func_dm_send_request "1.4.1.� dm_send_request(app_id, cmd_code, avps_json, [rpl_avps_pv])") function call with no received reply will time out and return a **\-2** code.

Default value is _2000_ ms.

**Example�1.6.�Setting the `answer_timeout` parameter**

modparam("aaa\_diameter", "answer\_timeout", 5000)