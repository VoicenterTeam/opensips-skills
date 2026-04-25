## 1.3.�Exported Parameters

### 1.3.1.�`server_hsize` (int)

The size of the hash table that stores the b2b server entities. It is the 2 logarithmic value of the real size.

_Default value is “9”_ (512 records).

**Example�1.1.�Set `server_hsize` parameter**

...
modparam("b2b\_entities", "server\_hsize", 10)
...
	

  

### 1.3.2.�`client_hsize` (int)

The size of the hash table that stores the b2b client entities. It is the 2 logarithmic value of the real size.

_Default value is “9”_ (512 records).

**Example�1.2.�Set `client_hsize` parameter**

...
modparam("b2b\_entities", "client\_hsize", 10)
...
	

  

### 1.3.3.�`script_req_route` (str)

The name of the b2b script route that will be called when B2B requests are received.

**Example�1.3.�Set `script_req_route` parameter**

...
modparam("b2b\_entities", "script\_req\_route", "b2b\_request")
...
	

  

### 1.3.4.�`script_reply_route` (str)

The name of the b2b script route that will be called when B2B replies are received.

**Example�1.4.�Set `script_repl_route` parameter**

...
modparam("b2b\_entities", "script\_reply\_route", "b2b\_reply")
...
	

  

### 1.3.5.�`db_url` (str)

Database URL. It is not compulsory, if not set data is not stored in database.

**Example�1.5.�Set `db_url` parameter**

...
modparam("b2b\_entities", "db\_url", "mysql://opensips:opensipsrw@127.0.0.1/opensips")
...
	

  

### 1.3.6.�`cachedb_url` (str)

URL of a NoSQL database to be used. Only Redis is supported at the moment.

**Example�1.6.�Set `cachedb_url` parameter**

...
modparam("b2b\_entities", "cachedb\_url", "redis://localhost:6379/")
...
	

  

### 1.3.7.�`cachedb_key_prefix` (string)

Prefix to use for every key set in the NoSQL database.

_Default value is “b2be$”._

**Example�1.7.�Set `cachedb_key_prefix` parameter**

...
modparam("b2b\_entities", "cachedb\_key\_prefix", "b2b")
...

  

### 1.3.8.�`update_period` (int)

The time interval at which to update the info in database.

_Default value is “100”._

**Example�1.8.�Set `update_period` parameter**

...
modparam("b2b\_entities", "update\_period", 60)
...
	

  

### 1.3.9.�`b2b_key_prefix` (string)

The string to use when generating the key ( it is inserted in the SIP messages as callid or to tag. It is useful to set this prefix if you use more instances of opensips B2BUA cascaded in the same architecture. Sometimes opensips B2BUA looks at the callid or totag to see if it has the format it uses to determine if the request was sent by it.

_Default value is “B2B”._

**Example�1.9.�Set `b2b_key_prefix` parameter**

...
modparam("b2b\_entities", "b2b\_key\_prefix", "B2B1")
...
	

  

### 1.3.10.�`db_mode` (int)

The B2B modules have support for the 3 type of database storage

*   NO DB STORAGE - set this parameter to 0
*   WRITE THROUGH (synchronous write in database) - set this parameter to 1
*   WRITE BACK (update in db from time to time) - set this parameter to 2

_Default value is “2” (WRITE BACK)._

**Example�1.10.�Set `db_mode` parameter**

...
modparam("b2b\_entities", "db\_mode", 1)
...
	

  

### 1.3.11.�`db_table` (str)

The name of the table that will be used for storing B2B entities

_Default value is “b2b\_entities”_

**Example�1.11.�Set `db_table` parameter**

...
modparam("b2b\_entities", "db\_table", "some table name")
...
	

  

### 1.3.12.�`cluster_id` (int)

The ID of the cluster this instance belongs to. Setting this parameter enables clustering support for the OpenSIPS B2BUA by replicating the B2B entities (B2B dialogs) between instances. This also ensures restart persistency through the _clusterer_ module's data "sync" mechanism.

This OpenSIPS cluster exposes the **"b2be-entities-repl"** capability in order to mark nodes as eligible for becoming data donors during an arbitrary sync request. Consequently, the cluster must have _at least one node_ marked with the **"seed"** value as the _clusterer.flags_ column/property in order to be fully functional. Consult the [clusterer - Capabilities](clusterer#capabilities) chapter for more details.

_Default value is “0” (clustering disabled)_

**Example�1.12.�Set `cluster_id` parameter**

...
modparam("b2b\_entities", "cluster\_id", 10)
...
	

  

### 1.3.13.�`passthru_prack` (int)

This parameter allows to control, whether a PRACK should be generated locally (=0) or if we request it to be end-to-end (=1).

_Default value is “0” (generate PRACK locally)_

**Example�1.13.�Set `passthru_prack` parameter**

...
modparam("b2b\_entities", "passthru\_prack", 1)
...
	

  

### 1.3.14.�`advertised_contact` (str)

Contact to use in generated messages for UA session started with the [ua\_session\_client\_start](#mi_ua_session_client_start "1.5.2.� ua_session_client_start") MI function.

**Example�1.14.�Set `advertised_contact` parameter**

...
modparam("b2b\_entities", "advertised\_contact", "opensips@10.10.10.10:5060")
...
	

  

### 1.3.15.�`ua_default_timeout` (str)

Default timeout, in seconds, for UA session started with the [ua\_session\_server\_init()](#func_ua_session_server_init "1.4.1.� ua_session_server_init([key], [flags])") function or the [ua\_session\_client\_start](#mi_ua_session_client_start "1.5.2.� ua_session_client_start") MI function. After this interval a BYE will be sent and the session will be deleted.

If not set the default is 43200 (12 hours).

**Example�1.15.�Set `ua_default_timeout` parameter**

...
modparam("b2b\_entities", "ua\_default\_timeout", 7200)
...