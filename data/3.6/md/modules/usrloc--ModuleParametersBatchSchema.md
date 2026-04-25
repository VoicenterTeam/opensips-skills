## 1.5.�Exported Parameters

### 1.5.1.�`nat_bflag` (string)

The name of the branch flag to be used as NAT marker (if the contact is or not natted). This is a branch flag and it will be imported and used by all other modules depending on the usrloc module.

_Default value is NULL (not set)._

**Example�1.1.�Set `nat_bflag` parameter**

...
modparam("usrloc", "nat\_bflag", "NAT\_BFLAG")
...

  

### 1.5.2.�`contact_id_column` (string)

Name of the column holding the unique contact IDs.

_Default value is “contact\_id”._

**Example�1.2.�Set `contact_id_column` parameter**

...
modparam("usrloc", "contact\_id\_column", "ctid")
...

  

### 1.5.3.�`user_column` (string)

Name of column containing usernames.

_Default value is “username”._

**Example�1.3.�Set `user_column` parameter**

...
modparam("usrloc", "user\_column", "username")
...

  

### 1.5.4.�`domain_column` (string)

Name of column containing domains.

_Default value is “domain”._

**Example�1.4.�Set `user_column` parameter**

...
modparam("usrloc", "domain\_column", "domain")
...

  

### 1.5.5.�`contact_column` (string)

Name of column containing contacts.

_Default value is “contact”._

**Example�1.5.�Set `contact_column` parameter**

...
modparam("usrloc", "contact\_column", "contact")
...

  

### 1.5.6.�`expires_column` (string)

Name of column containing expires value.

_Default value is “expires”._

**Example�1.6.�Set `expires_column` parameter**

...
modparam("usrloc", "expires\_column", "expires")
...

  

### 1.5.7.�`q_column` (string)

Name of column containing q values.

_Default value is “q”._

**Example�1.7.�Set `q_column` parameter**

...
modparam("usrloc", "q\_column", "q")
...

  

### 1.5.8.�`callid_column` (string)

Name of column containing callid values.

_Default value is “callid”._

**Example�1.8.�Set `callid_column` parameter**

...
modparam("usrloc", "callid\_column", "callid")
...

  

### 1.5.9.�`cseq_column` (string)

Name of column containing cseq numbers.

_Default value is “cseq”._

**Example�1.9.�Set `cseq_column` parameter**

...
modparam("usrloc", "cseq\_column", "cseq")
...

  

### 1.5.10.�`methods_column` (string)

Name of column containing supported methods.

_Default value is “methods”._

**Example�1.10.�Set `methods_column` parameter**

...
modparam("usrloc", "methods\_column", "methods")
...

  

### 1.5.11.�`flags_column` (string)

Name of column to save the internal flags of the record.

_Default value is “flags”._

**Example�1.11.�Set `flags_column` parameter**

...
modparam("usrloc", "flags\_column", "flags")
...

  

### 1.5.12.�`cflags_column` (string)

Name of column to save the branch/contact flags of the record.

_Default value is “cflags”._

**Example�1.12.�Set `cflags_column` parameter**

...
modparam("usrloc", "cflags\_column", "cflags")
...

  

### 1.5.13.�`user_agent_column` (string)

Name of column containing user-agent values.

_Default value is “user\_agent”._

**Example�1.13.�Set `user_agent_column` parameter**

...
modparam("usrloc", "user\_agent\_column", "user\_agent")
...

  

### 1.5.14.�`received_column` (string)

Name of column containing the source IP, port, and protocol from the REGISTER message.

_Default value is “received”._

**Example�1.14.�Set `received_column` parameter**

...
modparam("usrloc", "received\_column", "received")
...

  

### 1.5.15.�`socket_column` (string)

Name of column containing the received socket information (IP:port) for the REGISTER message.

_Default value is “socket”._

**Example�1.15.�Set `socket_column` parameter**

...
modparam("usrloc", "socket\_column", "socket")
...

  

### 1.5.16.�`path_column` (string)

Name of column containing the Path header.

_Default value is “path”._

**Example�1.16.�Set `path_column` parameter**

...
modparam("usrloc", "path\_column", "path")
...

  

### 1.5.17.�`sip_instance_column` (string)

Name of column containing the SIP instance.

_Default value is “NULL”._

**Example�1.17.�Set `sip_instance_column` parameter**

...
modparam("usrloc", "sip\_instance\_column", "sip\_instance")
...

  

### 1.5.18.�`kv_store_column` (string)

Name of column containing generic key-value data.

_Default value is “kv\_store”._

**Example�1.18.�Set `kv_store_column` parameter**

...
modparam("usrloc", "kv\_store\_column", "json\_data")
...

  

### 1.5.19.�`attr_column` (string)

Name of column containing additional registration-related information.

_Default value is “attr”._

**Example�1.19.�Set `attr_column` parameter**

...
modparam("usrloc", "attr\_column", "attributes")
...

  

### 1.5.20.�`use_domain` (integer)

If the domain part of the user should be also saved and used for identifing the user (along with the username part). Useful in multi domain scenarios. Non 0 value means true.

_Default value is “0 (false)”._

**Example�1.20.�Set `use_domain` parameter**

...
modparam("usrloc", "use\_domain", 1)
...

  

### 1.5.21.�`desc_time_order` (integer)

If the user's contacts should be kept timestamp ordered; otherwise the contact will be ordered based on q value. Non 0 value means true.

_Default value is “0 (false)”._

**Example�1.21.�Set `desc_time_order` parameter**

...
modparam("usrloc", "desc\_time\_order", 1)
...

  

### 1.5.22.�`timer_interval` (integer)

Number of seconds between two timer runs. During each run, the module will update/delete dirty/expired contacts from memory and/or mirror these operations to the database, if configured to do so.

### Warning

In case of an OpenSIPS shutdown or even a crash, contacts which are in memory only and have not been flushed yet to disk will NOT get lost! OpenSIPS will try its best to do a last-minute sync to DB right before shutting down.

_Default value is 60._

**Example�1.22.�Set `timer_interval` parameter**

...
modparam("usrloc", "timer\_interval", 120)
...

  

### 1.5.23.�`db_url` (string)

URL of the database that should be used.

_Default value is “mysql://opensips:opensipsrw@localhost/opensips”._

**Example�1.23.�Set `db_url` parameter**

...
modparam("usrloc", "db\_url", "dbdriver://username:password@dbhost/dbname")
...

  

### 1.5.24.�`cachedb_url` (string)

URL of a NoSQL database to be used. Only required in a cachedb-enabled **[cluster\_mode](#param_cluster_mode "1.5.27.�cluster_mode (string)")**.

_Default value is “none”._

**Example�1.24.�Set `cachedb_url` parameter**

...
modparam("usrloc", "cachedb\_url", "mongodb://10.0.0.4:27017/opensipsDB.userlocation")
...

  

### 1.5.25.�`db_mode` (integer, deprecated)

This parameter has been kept for backwards compatibility. It acts as a [working\_mode\_preset](#param_working_mode_preset "1.5.26.�working_mode_preset (string)") (which it also conflicts with), overriding any [cluster\_mode](#param_cluster_mode "1.5.27.�cluster_mode (string)"), [restart\_persistency](#param_restart_persistency "1.5.28.�restart_persistency (string)") and [sql\_write\_mode](#param_sql_write_mode "1.5.29.�sql_write_mode (string)") settings. Possible values are:

*   0, corresponding to "single-instance-no-db" (see below)
    
*   1, corresponding to "single-instance-sql-write-through"
    
*   2, corresponding to "single-instance-sql-write-back"
    
*   3, corresponding to "sql-only"
    

_Default value is "not set"._

**Example�1.25.�Set `db_mode` parameter**

...
modparam("usrloc", "db\_mode", 2)
...

  

### 1.5.26.�`working_mode_preset` (string)

A pre-defined working mode for the usrloc module. Setting this parameter will override any [cluster\_mode](#param_cluster_mode "1.5.27.�cluster_mode (string)"), [restart\_persistency](#param_restart_persistency "1.5.28.�restart_persistency (string)") and [sql\_write\_mode](#param_sql_write_mode "1.5.29.�sql_write_mode (string)") settings.

*   **"single-instance-no-db"** - This disables database completely. Only memory will be used. Contacts will not survive restart. Use this value if you need a really fast usrloc and contact persistence is not necessary or is provided by other means.
    
*   **"single-instance-sql-write-through"** - Write-Through scheme. All changes to usrloc are immediately reflected in database too. This is very slow, but very reliable. Use this scheme if speed is not your priority but need to make sure that no registered contacts will be lost during crash or reboot.
    
*   **"single-instance-sql-write-back"** - Write-Back scheme. This is a combination of previous two schemes. All changes are made to memory and database synchronization is done in the timer. The timer deletes all expired contacts and flushes all modified or new contacts to database. Use this scheme if you encounter high-load peaks and want them to process as fast as possible. The mode will not help at all if the load is high all the time. The added latency on the SIP signaling when using this asynchronous preset is much lower than the one added by the safe but blocking, "single-instance-sql-write-through" preset.
    
*   **"sql-only"** - DB-Only scheme. No memory cache is kept, all operations being directly performed with the database. The timer deletes all expired contacts from database - cleans after clients that didn't un-register or re-register. The mode is useful if you configure more servers sharing the same DB without any replication at SIP level. The mode may be slower due the high number of DB operation. For example NAT pinging is a killer since during each ping cycle all nated contact are loaded from the DB; The lack of memory caching also disable the statistics exports.
    
*   **"federation-cachedb-cluster"** - OpenSIPS will run with a "federation-cachedb" [cluster\_mode](#param_cluster_mode "1.5.27.�cluster_mode (string)") and "sync-from-cluster" [restart\_persistency](#param_restart_persistency "1.5.28.�restart_persistency (string)"). This will require the configuration of multiple "seed" nodes in the cluster. Refer to the [_federated user location tutorial_](https://opensips.org/Documentation/Tutorials-Distributed-User-Location-Federation) for more details.
    
*   **"full-sharing-cluster"** - OpenSIPS will run with a "full-sharing" [cluster\_mode](#param_cluster_mode "1.5.27.�cluster_mode (string)") and "sync-from-cluster" [restart\_persistency](#param_restart_persistency "1.5.28.�restart_persistency (string)"). This will require the configuration of one of the nodes in the cluster as a "seed" node in order to bootstrap the syncing process.
    
*   **"full-sharing-cachedb-cluster"** - OpenSIPS will run with a "full-sharing-cachedb" [cluster\_mode](#param_cluster_mode "1.5.27.�cluster_mode (string)"), where all location data strictly resides in a NoSQL database, thus it will have natural restart persistency.
    

Refer to section [Distributed SIP User Location](#distributed-sip-user-location "1.2.�Distributed SIP User Location") for details regarding the clustering topologies and their behavior.

_Default value is "single-instance-no-db"._

**Example�1.26.�Set `working_mode_preset` parameter**

...
modparam("usrloc", "working\_mode\_preset", "full-sharing-cachedb-cluster")
...

  

### 1.5.27.�`cluster_mode` (string)

**This parameter will get overridden if either [working\_mode\_preset](#param_working_mode_preset "1.5.26.�working_mode_preset (string)") or [db\_mode](#param_db_mode "1.5.25.�db_mode (integer, deprecated)") is set.**

The behavior of the global OpenSIPS user location cluster. Refer to section [Distributed SIP User Location](#distributed-sip-user-location "1.2.�Distributed SIP User Location") for details.

This parameter may take the following values:

*   _"none"_ - single instance mode.
    
*   _"federation-cachedb"_ - federation-based data sharing. Local AoR metadata is published inside a NoSQL database, so other cluster nodes can fork SIP traffic over to the current node. Consequently, the [location\_cluster](#param_location_cluster "1.5.32.�location_cluster (integer)") and [cachedb\_url](#param_cachedb_url "1.5.24.�cachedb_url (string)") parameters are mandatory.
    
*   _"full-sharing"_ - Broadcast contact updates (full-mesh mirroring) to all other OpenSIPS cluster participants. Each node will hold the entire user location dataset. Consequently, the [location\_cluster](#param_location_cluster "1.5.32.�location_cluster (integer)") parameter is mandatory.
    
*   _"full-sharing-cachedb"_ - Full contact data management through the use of a NoSQL database (somewhat resembling the "sql-only" preset). The cluster layer is still required in order to be able to partition and spread the pinging workload evenly among participating OpenSIPS nodes. Consequently, the [location\_cluster](#param_location_cluster "1.5.32.�location_cluster (integer)") and [cachedb\_url](#param_cachedb_url "1.5.24.�cachedb_url (string)") parameters are mandatory.
    
*   _"sql-only"_ - Multiple OpenSIPS boxes using a common [db\_url](#param_db_url "1.5.23.�db_url (string)") without necessarily being aware of each other.
    

_Default value is _"none" (single instance mode)_._

**Example�1.27.�Set `cluster_mode` parameter**

...
modparam("usrloc", "cluster\_mode", "federation-cachedb")
...

  

### 1.5.28.�`restart_persistency` (string)

**This parameter will get overridden if either [working\_mode\_preset](#param_working_mode_preset "1.5.26.�working_mode_preset (string)") or [db\_mode](#param_db_mode "1.5.25.�db_mode (integer, deprecated)") are set.**

Controls the behavior of the OpenSIPS user location following a restart. This parameter has no effect in some database-only working mode presets, where restart persistency is naturally ensured.

This parameter may take the following values:

*   _"none"_ - no explicit data synchronization following a restart. The node starts empty.
    
*   _"load-from-sql"_ - enable SQL-based restart persistency. This causes all runtime in-memory writes (i.e. new registrations, re-registrations or de-registrations) to also propagate to an SQL database, from which all data will be imported following a restart. Choosing this value will make the [db\_url](#param_db_url "1.5.23.�db_url (string)") parameter mandatory, as well as cause [sql\_write\_mode](#param_sql_write_mode "1.5.29.�sql_write_mode (string)") to default to "write-back" instead of "none".
    
*   _"sync-from-cluster"_ - enable cluster-based restart persistency. Following a restart, an OpenSIPS cluster node will search for a healthy "donor" node from which to mirror the entire user location dataset via direct cluster sync (TCP-based, binary-encoded data transfer). Depending on the clustering mode and cluster topology, this will require the configuration of one or multiple "seed" nodes in the cluster. Choosing this value will make the [location\_cluster](#param_location_cluster "1.5.32.�location_cluster (integer)") parameter mandatory.
    

_Default value is _"none" (no restart persistency)_._

**Example�1.28.�Set `restart_persistency` parameter**

...
modparam("usrloc", "restart\_persistency", "sync-from-cluster")
...

  

### 1.5.29.�`sql_write_mode` (string)

**This parameter will get overridden if either [working\_mode\_preset](#param_working_mode_preset "1.5.26.�working_mode_preset (string)") or [db\_mode](#param_db_mode "1.5.25.�db_mode (integer, deprecated)") are set.**

Only valid if [restart\_persistency](#param_restart_persistency "1.5.28.�restart_persistency (string)") is enabled. Controls the runtime behavior of OpenSIPS writes to the SQL database.

This parameter may take the following values:

*   _"none"_ - do not perform any additional SQL writes at runtime to an SQL database in order to specifically ensure restart persistency.
    
*   _"write-through"_ - all in-memory writes (i.e. new registrations, re-registrations or de-registrations) also propagate into the SQL database, inline. While this will definitely slow down registration performance (lookups are served from memory!), it has the advantage of making the instance crash-safe.
    
*   _"write-back"_ - all in-memory writes (i.e. new registrations, re-registrations or de-registrations) eventually also propagate into the SQL database, thanks to a separate timer routine. This dramatically speeds up registrations, but also introduces the possibility of crashing before the latest contact changes are propagated to the database. See the [timer\_interval](#param_timer_interval "1.5.22.�timer_interval (integer)") for additional configuration.
    

_Default value is _"none" (no added SQL writes)_._

**Example�1.29.�Set `sql_write_mode` parameter**

...
modparam("usrloc", "sql\_write\_mode", "write-back")
...

  

### 1.5.30.�`matching_mode` (integer)

What contact matching algorithm to be used. Refer to section [Contact Matching](#contact-matching "1.3.�Contact matching") for the description of the algorithms.

The parameter may take the following values:

*   _0_ - CONTACT ONLY based matching algorithm.
    
*   _1_ - CONTACT and CALLID based matching algorithm.
    

_Default value is _0 (CONTACT\_ONLY)_._

**Example�1.30.�Set `matching_mode` parameter**

...
modparam("usrloc", "matching\_mode", 1)
...

  

### 1.5.31.�`cseq_delay` (integer)

Delay (in seconds) for accepting as retransmissions register requests with same Call-ID and Cseq. The delay is calculated starting from the receiving time of the first register with that Call-ID and Cseq.

Retransmissions within this delay interval will be accepted and replied as the original request, but no update will be done in location. If the delay is exceeded, error is reported.

A value of 0 disable the retransmission detection.

_Default value is “20 seconds”._

**Example�1.31.�Set `cseq_delay` parameter**

...
modparam("usrloc", "cseq\_delay", 5)
...

  

### 1.5.32.�`location_cluster` (integer)

Specifies the cluster ID which this instance will send to and receive from all user-location related information (_addresses-of-record_, _contacts_), organized into specific events (inserts, deletes or updates).

This OpenSIPS cluster exposes the **"usrloc-contact-repl"** capability in order to mark nodes as eligible for becoming data donors during an arbitrary sync request. Consequently, the cluster must have _at least one node_ marked with the **"seed"** value as the _clusterer.flags_ column/property in order to be fully functional. Consult the [clusterer - Capabilities](clusterer#capabilities) chapter for more details.

Default value is 0 (replication disabled).

More details on the user location distribution mechanisms are available under [Distributed SIP User Location](#distributed-sip-user-location "1.2.�Distributed SIP User Location").

**Example�1.32.�Setting the `location_cluster` parameter**

...
modparam("usrloc", "location\_cluster", 1)
...

  

### 1.5.33.�`ha_cluster` (integer)

Only relevant in **"federation-cachedb"** [cluster\_mode](#param_cluster_mode "1.5.27.�cluster_mode (string)"). Denotes the HA cluster ID to use in order to establish the active node within the HA pair, such that only that node performs WRITE operations to CacheDB.

Default value is 0 (disabled).

**Example�1.33.�Setting the `ha_cluster` parameter**

...
modparam("usrloc", "ha\_cluster", 4)
...

  

### 1.5.34.�`ha_shtag` (string)

Only relevant in **"federation-cachedb"** [cluster\_mode](#param_cluster_mode "1.5.27.�cluster_mode (string)"). Denotes the HA cluster sharing tag to use in order to establish the active node within the HA pair, such that only that node performs WRITE operations to CacheDB.

Default value is NULL (disabled).

**Example�1.34.�Setting the `ha_shtag` parameter**

...
modparam("usrloc", "ha\_shtag", "vip2")
...

  

### 1.5.35.�`skip_replicated_db_ops` (int)

Prevent OpenSIPS from performing any DB-related contact operations when events are received over the _Binary Interface_. This is commonly used to prevent unneeded duplicate operations.

Default value is "0" (upon receival of usrloc-related Binary Interface events, DB queries may be freely performed)

More details on the user location replication mechanism are available in [Distributed SIP User Location](#distributed-sip-user-location "1.2.�Distributed SIP User Location")

**Example�1.35.�Setting the `skip_replicated_db_ops` parameter**

...
modparam("usrloc", "skip\_replicated\_db\_ops", 1)
...

  

### 1.5.36.�`max_contact_delete` (int)

Relevant only in WRITE\_THROUGH or WRITE\_BACK schemes. The maximum number of contacts to be deleted from the database at once. Will delete all of them, if fewer after passing through all the contacts.

Default value is "10"

**Example�1.36.�Setting the `max_contact_delete` parameter**

...
modparam("usrloc", "max\_contact\_delete", 10)
...

  

### 1.5.37.�`hash_size` (integer)

The number of entries of the hash table used by usrloc to store the location records is 2^hash\_size. For hash\_size=4, the number of entries of the hash table is 16. Since version 2.2, the maximu size of this parameter is 16, meaning that the hash supports maximum 65536 entries.

_Default value is “9”._

**Example�1.37.�Set `hash_size` parameter**

...
modparam("usrloc", "hash\_size", 10)
...

  

### 1.5.38.�`regen_broken_contactid` (integer)

Since version 2.2, **contact\_id** concept was introduced. Since this parameter validates a contact each time OpenSIPS is started, there are times when the value of this parameter should be regenerated. That is when **location** table is being migrated from a version older than 2.2 or when **hash\_size** module parameter is changed. Enabling this parameter will regenerate broken contact id's based on current configurations.

_Default value is “0(not enabled)”_

**Example�1.38.�Set `regen_broken_contactid` parameter**

...
modparam("usrloc", "regen\_broken\_contactid", 1)
...

  

### 1.5.39.�`latency_event_min_us` (integer)

Defines a minimal pinging latency threshold, in microseconds, past which contact pinging latency update events will get raised. By default, an event is raised for each ping reply (i.e. latency update).

If both [latency\_event\_min\_us](#param_latency_event_min_us "1.5.39.�latency_event_min_us (integer)") and [latency\_event\_min\_us\_delta](#param_latency_event_min_us_delta "1.5.40.�latency_event_min_us_delta (integer)") are set, the event will get raised if either of them is true.

_Default value is “0 (no bottom limit set)”._

**Example�1.39.�Set `latency_event_min_us` parameter**

...
# raise an event for any 425+ ms pinging latency
modparam("usrloc", "latency\_event\_min\_us", 425000)
...

  

### 1.5.40.�`latency_event_min_us_delta` (integer)

Defines a minimal, absolute pinging latency difference, in microseconds, past which contact pinging latency update events will get raised. The difference is computed using the latencies of the last two contact pinging replies. By default, an event is raised for each ping reply (i.e. latency update).

If both [latency\_event\_min\_us](#param_latency_event_min_us "1.5.39.�latency_event_min_us (integer)") and [latency\_event\_min\_us\_delta](#param_latency_event_min_us_delta "1.5.40.�latency_event_min_us_delta (integer)") are set, the event will get raised if either of them is true.

_Default value is “0 (no minimal latency delta set)”._

**Example�1.40.�Set `latency_event_min_us_delta` parameter**

...
# raise an event only if a contact has pinging latency swings of 300+ ms
modparam("usrloc", "latency\_event\_min\_us\_delta", 300000)
...

  

### 1.5.41.�`pinging_mode` (string)

Depending on the [cluster\_mode](#param_cluster_mode "1.5.27.�cluster_mode (string)"), the module can perform contact pinging using one of two possible heuristics:

*   **"ownership"** - this instance will only attempt to ping a contact if it decides it is the logical owner of the contact. If a shared tag is attached to a contact, a node will keep sending pings to that contact as long as it owns the respective tag. If no shared tag has been specified for a given contact, the default is to assume permanent ownership of the contact and ping it upon request.
    
*   **"cooperation"** - the assumption behind this pinging heuristic is that all user location cluster nodes are symmetrical (possibly front-ended by a SIP traffic balancing entity), such that **either** of them can ping **any** contact. Under this assumption, all currently online user location cluster nodes will cooperate and evenly split the pinging workload between them by hashing AoRs modulo current\_number\_of\_online\_nodes, and only picking the ones that they are responsible for.
    

**Table�1.1.�Possible values for the "pinging\_mode", depending on the current "cluster\_mode"**

[cluster\_mode](#param_cluster_mode "1.5.27.�cluster_mode (string)")

none

federation-cachedb

full-sharing

full-sharing-cachedb

sql-only

[pinging\_mode](#param_pinging_mode "1.5.41.�pinging_mode (string)")

**ownership**

**ownership**

**cooperation** / ownership

**cooperation**

_unmaintained_

  

Notice that only the **"full-sharing"** clustering mode allows some flexibility -- all other modes are logically tied to a single pinging logic. Any unaccepted value, according to the above table, set for those modes will be silently discarded.

**Example�1.41.�Set `pinging_mode` parameter**

...
# prepare an active/backup "full-sharing" setup, with no front-end
modparam("usrloc", "pinging\_mode", "ownership")
...

  

### 1.5.42.�`mi_dump_kv_store` (integer)

Enable in order to include the "KV-Store" field in all usrloc MI commands which output AoR or Contact representations. This verbose field contains custom data attached to each of these two entities. mid\_registrar makes use of both of these holders, for example.

_Default value is “0 (disabled)”._

**Example�1.42.�Set `mi_dump_kv_store` parameter**

...
# include the "KV-Store" key in all usrloc MI output
modparam("usrloc", "mi\_dump\_kv\_store", 1)
...

  

### 1.5.43.�`contact_refresh_timer` (boolean)

Enable a timer which will periodically scan a sorted list of contacts and raise the [E\_UL\_CONTACT\_REFRESH](#event_E_UL_CONTACT_REFRESH "1.9.6.� E_UL_CONTACT_REFRESH") for any of them which are past their re-registration time interval limit. This limit may given by registrar's _pn\_trigger\_interval_ module parameter, for example.

_Default value is “false (disabled)”._

**Example�1.43.�Set `contact_refresh_timer` parameter**

...
modparam("usrloc", "contact\_refresh\_timer", true)
...