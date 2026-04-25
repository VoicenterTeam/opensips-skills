## 1.4.�Exported Parameters

### 1.4.1.�`hash_size` (int)

The size of the hash table that stores the session entities.

_Default value is “9”_ (512 records).

**Example�1.1.�Set `server_hsize` parameter**

...
modparam("b2b\_logic", "hash\_size", 10)
...
	

  

### 1.4.2.�`script_req_route` (str)

The name of the script route to be called when requests belonging to an ongoing B2B session are received.

**Example�1.2.�Set `script_req_route` parameter**

...
modparam("b2b\_logic", "script\_req\_route", "b2b\_request")
...
	

  

### 1.4.3.�`script_reply_route` (str)

The name of the script route to be called when replies belonging to an ongoing B2B session are received.

**Example�1.3.�Set `script_repl_route` parameter**

...
modparam("b2b\_logic", "script\_reply\_route", "b2b\_reply")
...
	

  

### 1.4.4.�`cleanup_period` (int)

The time interval at which to search for an hanged b2b context. A session is considered expired if the duration of a session exceeds its defined lifetime. At that moment, BYE is sent in all the dialogs from that context and the context is deleted.

_Default value is “100”._

**Example�1.4.�Set `cleanup_period` parameter**

...
modparam("b2b\_logic", "cleanup\_period", 60)
...
	

  

### 1.4.5.�`custom_headers_regexp` (str)

Regexp to search SIP header by names that should be passed from the dialog of one side to the other side. There are a number of headers that are passed by default. They are:

*   Max-Forwards (it is decreased by 1)
*   Content-Type
*   Supported
*   Allow
*   Proxy-Require
*   Session-Expires
*   Min-SE
*   Require
*   RSeq

If you wish some other headers to be passed also you should define them by setting this parameter.

It can be in forms like "regexp", "/regexp/" and "/regexp/flags".

Meaning of the flags is as follows:

*   _i_ - Case insensitive search.
    
*   _e_ - Use extended regexp.
    

_Default value is “NULL”._

**Example�1.5.�Set parameter**

...
modparam("b2b\_logic", "custom\_headers\_regexp", "/^x-/i")
...
	

  

### 1.4.6.�`custom_headers` (str)

A list of SIP header names delimited by ';' that should be passed from the dialog of one side to the other side. There are a number of headers that are passed by default. They are:

*   Max-Forwards (it is decreased by 1)
*   Content-Type
*   Supported
*   Allow
*   Proxy-Require
*   Session-Expires
*   Min-SE
*   Require
*   RSeq

If you wish some other headers to be passed also you should define them by setting this parameter.

_Default value is “NULL”._

**Example�1.6.�Set parameter**

...
modparam("b2b\_logic", "custom\_headers", "User-Agent;Date")
...
	

  

### 1.4.7.�`db_url` (str)

Database URL.

**Example�1.7.�Set `db_url` parameter**

...
modparam("b2b\_logic", "db\_url", "mysql://opensips:opensipsrw@127.0.0.1/opensips")
...
	

  

### 1.4.8.�`cachedb_url` (str)

URL of a NoSQL database to be used. Only Redis is supported at the moment.

**Example�1.8.�Set `cachedb_url` parameter**

...
modparam("b2b\_logic", "cachedb\_url", "redis://localhost:6379/")
...
		

  

### 1.4.9.�`cachedb_key_prefix` (string)

Prefix to use for every key set in the NoSQL database.

_Default value is “b2bl$”._

**Example�1.9.�Set `cachedb_key_prefix` parameter**

...
modparam("b2b\_logic", "cachedb\_key\_prefix", "b2b")
...
	

  

### 1.4.10.�`update_period` (int)

The time interval at which to update the info in database.

_Default value is “100”._

**Example�1.10.�Set `update_period` parameter**

...
modparam("b2b\_logic", "update\_period", 60)
...
	

  

### 1.4.11.�`max_duration` (int)

The maximum duration of a call.

_Default value is “12 \* 3600 (12 hours)”._

If you set it to 0, there will be no limitation.

**Example�1.11.�Set `max_duration` parameter**

...
modparam("b2b\_logic", "max\_duration", 7200)
...
	

  

### 1.4.12.�`contact_user` (int)

If set to 1, adds user from From: header to generated Contact:

_Default value is “0”._

**Example�1.12.�Set `contact_user` parameter**

...
modparam("b2b\_logic", "contact\_user", 1)
...
	

  

### 1.4.13.�`b2bl_from_spec_param` (string)

The name of the pseudo variable for storing the new “From” header. The PV must be set before calling “b2b\_init\_request”.

_Default value is “NULL” (disabled)._

**Example�1.13.�Set `b2bl_from_spec_param` parameter**

...
modparam("b2b\_logic", "b2bl\_from\_spec\_param", "$var(b2bl\_from)")
...
route{
	...
	# setting the From header
	$var(b2bl\_from) = "\\"Call ID\\" <sip:user@opensips.org>";
	...
	b2b\_init\_request("top hiding");
	...
}
	

  

### 1.4.14.�`server_address` (str)

The IP address of the machine that will be used as Contact in the generated messages. This is compulsory only when OpenSIPS starts a call from the middle. For scenarios triggered by received calls, if it is not set, it is constructed dynamically from the socket where the initiating request was received. This socket will be used to send all the requests, replies for that session. This parameter support Pseudo-Variables.

**Example�1.14.�Set `server_address` parameter**

...
modparam("b2b\_logic", "server\_address", "sip:sa@10.10.10.10:5060")
...
	

  

**Example�1.15.�Set `server_address` parameter using Pseudo-Variables**

...
modparam("b2b\_logic", "server\_address", "sip:$socket\_in(advertised\_ip):$socket\_in(advertised\_port)")
...
	

  

### 1.4.15.�`init_callid_hdr` (str)

The module offers the possibility to insert the original callid in a header in the generated Invites. If you want this, set this parameter to the name of the header in which to insert the original callid.

**Example�1.16.�Set `init_callid_hdr` parameter**

...
modparam("b2b\_logic", "init\_callid\_hdr", "Init-CallID")
...
	

  

### 1.4.16.�`db_mode` (int)

The B2B modules have support for the 3 type of database storage

*   NO DB STORAGE - set this parameter to 0
*   WRITE THROUGH (synchronous write in database) - set this parameter to 1
*   WRITE BACK (update in db from time to time) - set this parameter to 2

_Default value is “2” (WRITE BACK)._

**Example�1.17.�Set `db_mode` parameter**

...
modparam("b2b\_logic", "db\_mode", 1)
...
	

  

### 1.4.17.�`db_table` (str)

Name of the database table to be used

_Default value is “b2b\_logic”_

**Example�1.18.�Set `db_table` parameter**

...
modparam("b2b\_logic", "db\_table", "some\_table\_name")
...
	

  

### 1.4.18.�`b2bl_th_init_timeout` (int)

Call setup timeout for topology hiding scenario.

_Default value is “60”_

**Example�1.19.�Set `b2bl_th_init_timeout` parameter**

...
modparam("b2b\_logic", "b2bl\_th\_init\_timeout", 60)
...
	

  

### 1.4.19.�`b2bl_early_update` (int)

Allow bridging of calls in early stage by issuing a "UPDATE" request

*   0 - Do not bridge dialogs in early stage
*   1 - Try to update an session in early stage by sending an UPDATE

_Default value is “0” Do not bridge dialogs in early stage_

**Example�1.20.�Set `b2bl_early_update` parameter**

...
modparam("b2b\_logic", "b2bl\_early\_update", 1)
...
	

  

### 1.4.20.�`old_entity_term_delay` (int)

When the _b2b\_bridge\_request_ is being used with the _late\_bye_ flag, this parameter can delay the moment when the BYE is being sent to the terminating entity. Thus, instead of terminating it when the new entity is established, the BYE is delayed with the value of this param, expressed in seconds.

_Default value is “0” - send BYE on the spot_

**Example�1.21.�Set `old_entity_term_delay` parameter**

...
modparam("b2b\_logic", "old\_entity\_term\_delay", 2) # delay the BYE with 2 seconds
...