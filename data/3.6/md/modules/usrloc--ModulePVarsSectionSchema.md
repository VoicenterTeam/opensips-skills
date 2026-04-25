# usrloc Module

---

**List of Tables**

1.1. [Possible values for the "pinging\_mode", depending on the current "cluster\_mode"](#idp5834208)

3.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp6680848)

3.2. [Most recently active contributors(1) to this module](#idp6791200)

**List of Examples**

1.1. [Set `nat_bflag` parameter](#idp5552960)

1.2. [Set `contact_id_column` parameter](#idp5557776)

1.3. [Set `user_column` parameter](#idp5562592)

1.4. [Set `user_column` parameter](#idp5567408)

1.5. [Set `contact_column` parameter](#idp5572224)

1.6. [Set `expires_column` parameter](#idp5577040)

1.7. [Set `q_column` parameter](#idp5581856)

1.8. [Set `callid_column` parameter](#idp5586672)

1.9. [Set `cseq_column` parameter](#idp5591488)

1.10. [Set `methods_column` parameter](#idp5596304)

1.11. [Set `flags_column` parameter](#idp5601120)

1.12. [Set `cflags_column` parameter](#idp5605936)

1.13. [Set `user_agent_column` parameter](#idp5610752)

1.14. [Set `received_column` parameter](#idp5615760)

1.15. [Set `socket_column` parameter](#idp5620768)

1.16. [Set `path_column` parameter](#idp5625584)

1.17. [Set `sip_instance_column` parameter](#idp5630400)

1.18. [Set `kv_store_column` parameter](#idp5635296)

1.19. [Set `attr_column` parameter](#idp5640192)

1.20. [Set `use_domain` parameter](#idp5645296)

1.21. [Set `desc_time_order` parameter](#idp5650272)

1.22. [Set `timer_interval` parameter](#idp5655952)

1.23. [Set `db_url` parameter](#idp5661216)

1.24. [Set `cachedb_url` parameter](#idp5668496)

1.25. [Set `db_mode` parameter](#idp5680400)

1.26. [Set `working_mode_preset` parameter](#idp5703488)

1.27. [Set `cluster_mode` parameter](#idp5720672)

1.28. [Set `restart_persistency` parameter](#idp5734016)

1.29. [Set `sql_write_mode` parameter](#idp5746720)

1.30. [Set `matching_mode` parameter](#idp5755088)

1.31. [Set `cseq_delay` parameter](#idp5761184)

1.32. [Setting the `location_cluster` parameter](#idp5773904)

1.33. [Setting the `ha_cluster` parameter](#idp5779856)

1.34. [Setting the `ha_shtag` parameter](#idp5785792)

1.35. [Setting the `skip_replicated_db_ops` parameter](#idp5792048)

1.36. [Setting the `max_contact_delete` parameter](#idp5796720)

1.37. [Set `hash_size` parameter](#idp5802240)

1.38. [Set `regen_broken_contactid` parameter](#idp5810064)

1.39. [Set `latency_event_min_us` parameter](#idp5818064)

1.40. [Set `latency_event_min_us_delta` parameter](#idp5824800)

1.41. [Set `pinging_mode` parameter](#idp5848048)

1.42. [Set `mi_dump_kv_store` parameter](#idp5853296)

1.43. [Set `contact_refresh_timer` parameter](#idp5859360)

1.44. [`ul_add_key` usage](#idp5870672)

1.45. [`ul_get_key` usage](#idp5880896)

1.46. [`ul_del_key` usage](#idp5890000)

## Chapter�1.�Admin Guide

## 1.1.�Overview

A SIP user location implementation. Its main purpose is to store, manage and provide access to SIP registration bindings (contacts) for other modules (e.g. registrar, mid-registrar, nathelper, etc.). The module exports no functions that could be directly used from the OpenSIPS script.

At runtime, the contacts may reside in memory, in an SQL database or in a NoSQL database. Combinations of two of the above are also possible. For example, contacts may only be directly manipulated in memory in order to guarantee fast interactions while being asynchronously synchronized to an SQL database. The latter helps achieve restart persistency. Consult the **[working\_mode\_preset](#param_working_mode_preset "1.5.26.�working_mode_preset (string)")** parameter for more details on all possible runtime behaviors of the module.

The OpenSIPS user location implementation is cluster-enabled. On top of supporting traditional "single instance" setups, it also allows multiple OpenSIPS user location nodes to form a single, global user location cluster. This allows high-level features such as startup synchronization (data tunneling) from a random, healthy "donor" node and evenly distributed NAT pinging workloads.

## 1.2.�Distributed SIP User Location

Starting with OpenSIPS 2.4, the user location module offers several optional data distribution models, each tailoring to specific real-life production use cases. Built on top of the OpenSIPS clustering module, these models take into account service concerns such as _high availability, geographical distribution, horizontal scalability and NAT traversal_.

Depending on data locality, the distribution models are split in two main categories:

### 1.2.1.�"Federation" Topology

A _federated_ user location keeps contact data local to the original OpenSIPS node the contact initially registered to. In order to share the reachability of these contacts with the global OpenSIPS user location cluster, registrar nodes will only publish some light "metadata" entries for any new Addresses-of-Record which are reachable from them. These entries will cause other nodes to also fork additional SIP branches pointing to the publisher registrar upon receiving calls for its advertised Addresses-of-Record.

The **federation** topology is an optimized solution for the following core problems:

*   **IP address restrictions** - In some cases, calls routed towards registered contacts must necessarily pass through the original registration nodes of these contacts. A classic example of this situation is when an OpenSIPS registrar sitting at the edge of the platform is directly facing a NAT device on the way to the contact. Unless calls are sent out from this exact registrar, they will not be able to traverse the NAT device and reach the contact.
    
*   **horizontal scalability** - Avoiding global replication/contact broadcasting within the cluster not only dramatically improves contact storage performance, but also leads to better service scalability. Different geographical locations can be sized according to their local subscriber populations (traffic may be balanced to them using DNS SRV weights, for example), without losing platform-wide reachability.
    

Currently, the metadata information may be published to NoSQL databases which support key/multi-value column-like associations. Example known backends to support these abstractions at the time of writing are MongoDB and Cassandra.

The [_federated user location tutorial_](https://opensips.org/Documentation/Tutorials-Distributed-User-Location-Federation) contains precise details on how to achieve this setup (including High Availability support).

### 1.2.2.�"Full Sharing" Topology

A _fully sharing_ user location broadcasts contact information to all data nodes (OpenSIPS or NoSQL). The main assumption behind this mode is that any routing restrictions have been alleviated beforehand. Consequently, either SIP traffic egressing from a "full sharing" OpenSIPS user location topology is being intermediated by an additional SIP edge endpoint of our platform, or there are no egress IP restrictions at all (for example, if all SIP UAs have public IPs). In this setup, all OpenSIPS user location nodes are _equivalent_ to one another, as they each have access to the same dataset and have no routing restrictions.

The **full sharing** topology is an appropriate solution for multi-layer VoIP platforms, where the OpenSIPS registrar nodes do not directly interact with external SIP endpoints. Moreover, it can be configured to fully store contact data within a NoSQL cluster (zero in-memory storage), thus taking full advantage of the data sharing, sharding, migration and other capabilities of a specialized distributed data handling engine.

Additionally, a "full sharing" topology can be used to achieve a basic "hot backup" high-availability setup with an active-passive registrar nodes configuration, both of which make use of a shared virtual IP.

Registrations may optionally be fully managed inside NoSQL databases which support key/multi-value column-like associations. Example known backends to currently support these abstractions are MongoDB and Apache Cassandra.

The [_"full sharing" user location tutorial_](https://opensips.org/Documentation/Tutorials-Distributed-User-Location-Full-Sharing) contains precise details on how to achieve this setup (including full NoSQL storage support).

### 1.2.3.�"N Contact Pings" Problem

A long-standing problem caused by contact information being replicated to multiple SIP registrar instances directly through replication or indirectly through a globally reachable database. As long as traditionally clusterized nodes are not aware of each other, they will each scan the entire contact dataset, thus periodically sending "N pings" instead of "1 ping" for each contact. This difference directly affects service scalability, as well as the amount of consumed resources such as CPU and network bandwidth, both on the service and client side.

This problem is solved with the help of the OpenSIPS cluster layer, which makes all nodes aware of each others' presence. Thus, the distributed user location node topologies are able to collectively partition the pinging workload and spread it evenly across the current number of cluster nodes, at any given point in time. The [pinging\_mode](#param_pinging_mode "1.5.41.�pinging_mode (string)") module parameter describes the built-in pinging heuristics in more detail.

## 1.3.�Contact matching

Contact matching (for the same Address-of-Record, AoR) is an important aspect of a SIP user location service, especially in the context of NAT traversal. The latter raises more problems, since contacts from different phones of same users may overlap (if behind NATs with identical configurations) or the re-register Contact of the same SIP User Agent may be seen as a new one (due to the request arriving via a new NAT binding).

The SIP RFC 3261 publishes a matching algorithm based only on the contact string with Call-ID and CSeq number extra checking (if the Call-ID matches, it must have a higher CSeq number, otherwise the registration is invalid). But as argumented above, this is not enough in a NAT traversal context, so the OpenSIPS implementation of contact matching offers more algorithms:

*   _Contact based only_ - strict RFC 3261 compliancy - the contact is matched as string and extra checked via Call-ID and CSeq (if Call-ID is the same, it must have a higher CSeq number, otherwise the registration is invalid).
    
*   _Contact and Call-ID based_ - an extension of the first case - the Contact and Call-ID header field values must match as strings; the CSeq must be higher than the previous one - so be careful how you deal with REGISTER retransmissions in this case.
    

For more details on how to control/select the contact matching algorithm, please go to **[matching\_mode](#param_matching_mode "1.5.30.�matching_mode (integer)")**.

## 1.4.�Dependencies

### 1.4.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _Optionally an SQL database module_.
    
*   _Optionally a NoSQL database module_.
    
*   _clusterer, if [cluster\_mode](#param_cluster_mode "1.5.27.�cluster_mode (string)") is different than "none"._
    

### 1.4.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _None_.
    

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

  

## 1.6.�Exported Functions

### 1.6.1.� `ul_add_key(domain, aor, key_name, [key_value])`

Append a Key/Value to the Key-Value-Store of a Usrloc-Record.

Returns false, if no record is found is usrloc.

Meaning of the parameters is as follows:

*   _domain (string)_ - Domain of the AOR, e.g. "location"
    
*   _aor (string)_ - Address-of-Record, save the key for a specific (registered) user.
    
*   _key (string)_ - The name of the key to be stored.
    
*   _value (string, optional)_ - The value to be stored. Not providing the value or by providing an empty value, will delete the entry.
    

This function can be used in ANY route.

**Example�1.44.�`ul_add_key` usage**

...
ul\_add\_key("location", "$tU@$td", "service\_route", "$hdr(Service-Route)");
...

  

### 1.6.2.� `ul_get_key(domain, aor, key_name, destination)`

Retrieve a Key/Value from the Key-Value-Store of a Usrloc-Record.

Returns false, if no record is found is usrloc or no according key is found.

Meaning of the parameters is as follows:

*   _domain (string)_ - Domain of the AOR, e.g. "location"
    
*   _aor (string)_ - Address-of-Record, save the key for a specific (registered) user.
    
*   _key (string)_ - The name of the key to be retrieved.
    
*   _destination (variable)_ - A variable, where to store the retrieved key.
    

This function can be used in ANY route.

**Example�1.45.�`ul_get_key` usage**

...
if (ul\_get\_key("location", "$tU@$td", "service\_route", $avp(service\_route))) {
        append\_to\_reply("Service-Route: $avp(service\_route)\\r\\n");
}
...

  

### 1.6.3.� `ul_del_key(domain, aor, key_name)`

Deletes a Key/Value from the Key-Value-Store of a Usrloc-Record.

Returns false, if no record is found is usrloc.

Meaning of the parameters is as follows:

*   _domain (string)_ - Domain of the AOR, e.g. "location"
    
*   _aor (string)_ - Address-of-Record, save the key for a specific (registered) user.
    
*   _key (string)_ - The name of the key to be deleted.
    

This function can be used in ANY route.

**Example�1.46.�`ul_del_key` usage**

...
ul\_del\_key("location", "$tU@$td", "service\_route");
...

  

## 1.7.�Exported MI Functions

### 1.7.1.� `ul_rm`

Deletes an entire AOR record (including its contacts).

Parameters:

*   _table\_name_ - table where the AOR is removed from (Ex: location).
    
*   _aor_ - user AOR in username\[@domain\] format (domain must be supplied only if use\_domain option is on).
    

### 1.7.2.� `ul_rm_contact`

Deletes a contact from an AOR record.

Parameters:

*   _table name_ - table where the AOR is removed from (Ex: location).
    
*   _AOR_ - user AOR in username\[@domain\] format (domain must be supplied only if use\_domain option is on).
    
*   _contact_ - exact contact to be removed
    

### 1.7.3.� `ul_dump`

Dumps the entire content of the USRLOC in memory cache

Parameters:

*   _brief_ - (optional, may not be present); if equals to string “brief”, a brief dump will be done (only AOR and contacts, with no other details)
    

### 1.7.4.� `ul_flush`

Force a flush of all pending usrloc cache changes to the database. Normally, this routine runs every [timer\_interval](#param_timer_interval "1.5.22.�timer_interval (integer)") seconds.

### 1.7.5.� `ul_add`

Adds a new contact for an user AOR.

Parameters:

*   _table name (string)_ - table where the contact will be added (Ex: "location").
    
*   _aor (string)_ \- user AOR in username\[@domain\] format (domain must be supplied only if use\_domain option is on).
    
*   _contact (string)_ - Contact URI to be added
    
*   _expires (int)_ - expires value of the contact
    
*   _q (string)_ - Q value of the contact
    
*   _flags (int)_ - internal USRLOC flags of the contact
    
*   _cflags (int)_ - per branch flags of the contact
    
*   _methods (int)_ - bitmask with supported requests of the contact. To whitelist all SIP methods, simply use the value **32767**. For a breakdown of each method's value, see the "request\_method" internal enum.
    

### 1.7.6.� `ul_show_contact`

Dumps the contacts of an user AOR.

Parameters:

*   _table\_name_ - table where the AOR resides (Ex: location).
    
*   _aor_ - user AOR in username\[@domain\] format (domain must be supplied only if use\_domain option is on).
    

### 1.7.7.� `ul_sync`

Empty the location table, then synchronize it with all contacts from memory. Note that this can not be used when no database is specified or with the DB-Only scheme.

Important: make sure that all your contacts are in memory (_ul\_dump_ MI function) before executing this command.

Parameters:

*   _table name_ - table where the AOR resides (Ex: location).
    
*   _AOR (optional)_ - only delete/sync this user AOR, not the whole table. Format: "username\[@domain\]" (_domain_ is required only if [use\_domain](#param_use_domain "1.5.20.�use_domain (integer)") option is on).
    

### 1.7.8.� `ul_cluster_sync`

This command will only take effect if the target OpenSIPS instance is paired with a hot backup instance, while running under a cluster-enabled [working\_mode\_preset](#param_working_mode_preset "1.5.26.�working_mode_preset (string)").

The current node will locate a healthy donor node within the [location\_cluster](#param_location_cluster "1.5.32.�location_cluster (integer)") and issue a sync request to it. The donor node will then proceed to push all of its user location data over to the current node, via the binary interface. The received data will be merged with existing data. Conflicting contacts (matched according to [matching\_mode](#param_matching_mode "1.5.30.�matching_mode (integer)")) are overwritten only if the sync data is newer than the current data.

## 1.8.�Exported Statistics

Exported statistics are listed in the next sections.

### 1.8.1.�users

Number of AOR existing in the USRLOC memory cache for that domain - can not be resetted; this statistic will be register for each used domain (Ex: location).

### 1.8.2.�contacts

Number of contacts existing in the USRLOC memory cache for that domain - can not be resetted; this statistic will be register for each used domain (Ex: location).

### 1.8.3.�expires

Total number of expired contacts for that domain - can be resetted; this statistic will be register for each used domain (Ex: location).

### 1.8.4.�registered\_users

Total number of AOR existing in the USRLOC memory cache for all domains - can not be resetted.

## 1.9.�Exported Events

### 1.9.1.� `E_UL_AOR_INSERT`

This event is raised when a new AOR is inserted in the USRLOC memory cache.

Parameters:

*   _domain_ - The name of the table.
    
*   _aor_ - The AOR of the inserted record.
    

### 1.9.2.� `E_UL_AOR_DELETE`

This event is raised when a new AOR is deleted from the USRLOC memory cache.

Parameters:

*   _domain_ - The name of the table.
    
*   _aor_ - The AOR of the deleted record.
    

### 1.9.3.� `E_UL_CONTACT_INSERT`

This event is raised when a new contact is inserted in any of the existing AOR's contact list. For each new contact, if its AOR does not exist in the memory, then both the E\_UL\_AOR\_CREATE and E\_UL\_CONTACT\_INSERT events will be raised.

Parameters:

*   _domain_ - The name of the table.
    
*   _aor_ - The AOR of the inserted contact.
    
*   _uri_ - The contact URI of the inserted contact.
    
*   _received_ - IP, port and protocol the registration message was received from. If these have the same value as the contact's address (see the address parameter) then the received parameter will be an empty string.
    
*   _path_ - The PATH header value of the registration message.(empty string if not present)
    
*   _qval_ - The Q value (priority) of the contact (as integer value from 0 to 10).
    
*   _user\_agent_ - The User-Agent header value.
    
    _NOTICE:_ Can contain spaces.
    
*   _socket_ - The SIP socket/listener (as string) used by OpenSIPS to receive the contact registations.
    
*   _bflags_ - The branch flags (bflags) of the contact (in integer value of the bitmask)
    
*   _expires_ - The expires value of the contact (as UNIX timestamp integer).
    
*   _callid_ - The Call-ID header of the registration message.
    
*   _cseq_ - The cseq number as an int value.
    
*   _attr_ - The attributes string attached to the contact (the custom attributes attached from the script level). As this string is options, if missing in the contact, the event will push the empty string for this event field.
    
*   _latency_ - The latency of the last successful ping for this contact, in microseconds. Until the first ping reply for a given contact arrives, its pinging latency will be 0.
    
*   _shtag_ - The shared tag of the contact, which helps determine if the current node owns the contact (e.g. possibly using the **$cluster.sh\_tag** pseudo-variable in order to perform the check).
    
    _NOTICE:_ If a contact has no shared tag attached to it, the value of this parameter will be "" (empty string)!
    

### 1.9.4.� `E_UL_CONTACT_DELETE`

This event is raised when a contact is deleted from an existing AOR's contact list. If the contact is the only one in the list then both the E\_UL\_AOR\_DELETE and E\_UL\_CONTACT\_DELETE events will be raised.

Parameters: same as the [E\_UL\_CONTACT\_INSERT](#event_E_UL_CONTACT_INSERT "1.9.3.� E_UL_CONTACT_INSERT") event

### 1.9.5.� `E_UL_CONTACT_UPDATE`

This event is raised when a contact's info is updated by receiving another registration message.

Parameters: same as the [E\_UL\_CONTACT\_INSERT](#event_E_UL_CONTACT_INSERT "1.9.3.� E_UL_CONTACT_INSERT") event

### 1.9.6.� `E_UL_CONTACT_REFRESH`

This event may only be raised for RFC 8599 (Push Notification) enabled contacts.

Set [contact\_refresh\_timer](#param_contact_refresh_timer "1.5.43.�contact_refresh_timer (boolean)") to _true_ in order to enable this event. The event is raised within reasonable time before an RFC 8599 enabled contact will expire, such that the script writer can take action, possibly force a registration refresh from the endpoint.

Parameters:

*   _domain_ - The name of the table.
    
*   _aor_ - The AOR of the inserted contact.
    
*   _uri_ - The contact URI of the inserted contact.
    
*   _received_ - IP, port and protocol the registration message was received from. If these have the same value as the contact's address (see the address parameter) then the received parameter will be an empty string.
    
*   _user\_agent_ - The User-Agent header value.
    
    _NOTICE:_ Can contain spaces.
    
*   _socket_ - The SIP socket/listener (as string) used by OpenSIPS to receive the contact registations.
    
*   _bflags_ - The branch flags (bflags) of the contact (in integer value of the bitmask)
    
*   _expires_ - The expires value of the contact (as UNIX timestamp integer).
    
*   _callid_ - The Call-ID header of the registration message.
    
*   _attr_ - The attributes string attached to the contact (the custom attributes attached from the script level). As this string is options, if missing in the contact, the event will push the empty string for this event field.
    
*   _shtag_ - The shared tag of the contact, which helps determine if the current node owns the contact (e.g. possibly using the **$cluster.sh\_tag** pseudo-variable in order to perform the check).
    
*   _reason_ - the reason why the binding refresh event was triggered. Possible values:
    
    *   "reg-refresh" - periodic refresh triggered by OpenSIPS
        
    *   "ini-INVITE", "ini-SUBSCRIBE", etc. - a refresh triggered by an incoming initial SIP request
        
    *   "mid-INVITE", "mid-BYE", etc. - a refresh triggered by an incoming mid-dialog SIP request
        
    
*   _req\_callid_ - the Call-ID of the SIP request which triggered this event, if any. This gives the ability to logically link the pending request with the current event and access useful data from that request (e.g. caller identity, dialed number, etc.).
    
    Using the _req\_callid_, if a dialog has been created for the pending request, this dialog may be temporarily loaded inside the event\_route using the [load\_dialog\_ctx()](dialog#func_load_dialog_ctx) and [unload\_dialog\_ctx()](dialog#func_unload_dialog_ctx) functions of the dialog module.
    

### 1.9.7.� `E_UL_LATENCY_UPDATE`

This event is raised when a contact pinging latency matches either of the [latency\_event\_min\_us](#param_latency_event_min_us "1.5.39.�latency_event_min_us (integer)") or [latency\_event\_min\_us\_delta](#param_latency_event_min_us_delta "1.5.40.�latency_event_min_us_delta (integer)") filters. If none of these filters is set, this event will get raised for each successful contact ping operation.

Parameters: same as the [E\_UL\_CONTACT\_INSERT](#event_E_UL_CONTACT_INSERT "1.9.3.� E_UL_CONTACT_INSERT") event

## Chapter�2.�Developer Guide

## 2.1.�Available Functions

### 2.1.1.� `ul_register_domain(name)`

The function registers a new domain. Domain is just another name for table used in registrar. The function is called from fixups in registrar. It gets name of the domain as a parameter and returns pointer to a new domain structure. The fixup than 'fixes' the parameter in registrar so that it will pass the pointer instead of the name every time save() or lookup() is called. Some usrloc functions get the pointer as parameter when called. For more details see implementation of save function in registrar.

Meaning of the parameters is as follows:

*   _const char\* name_ - Name of the domain (also called table) to be registered.
    

### 2.1.2.� `ul_insert_urecord(domain, aor, rec, is_replicated)`

The function creates a new record structure and inserts it in the specified domain. The record is structure that contains all the contacts for belonging to the specified username.

Meaning of the parameters is as follows:

*   _udomain\_t\* domain_ - Pointer to domain returned by ul\_register\_udomain.
    
*   _str\* aor_ - Address of Record (aka username) of the new record (at this time the record will contain no contacts yet).
    
*   _urecord\_t\*\* rec_ - The newly created record structure.
    
*   _char is\_replicated_ - Specifies whether this function will be called from the context of a Binary Interface callback. If uncertain, simply use 0.
    

### 2.1.3.� `ul_delete_urecord(domain, aor, is_replicated)`

The function deletes all the contacts bound with the given Address Of Record.

Meaning of the parameters is as follows:

*   _udomain\_t\* domain_ - Pointer to domain returned by ul\_register\_udomain.
    
*   _str\* aor_ - Address of record (aka username) of the record, that should be deleted.
    
*   _char is\_replicated_ - Specifies whether this function will be called from the context of a Binary Interface callback. If uncertain, simply use 0.
    

### 2.1.4.� `ul_get_urecord(domain, aor)`

The function returns pointer to record with given Address of Record.

Meaning of the parameters is as follows:

*   _udomain\_t\* domain_ - Pointer to domain returned by ul\_register\_udomain.
    

*   _str\* aor_ - Address of Record of request record.
    

### 2.1.5.� `ul_lock_udomain(domain)`

The function lock the specified domain, it means, that no other processes will be able to access during the time. This prevents race conditions. Scope of the lock is the specified domain, that means, that multiple domain can be accessed simultaneously, they don't block each other.

Meaning of the parameters is as follows:

*   _udomain\_t\* domain_ - Domain to be locked.
    

### 2.1.6.� `ul_unlock_udomain(domain)`

Unlock the specified domain previously locked by ul\_lock\_udomain.

Meaning of the parameters is as follows:

*   _udomain\_t\* domain_ - Domain to be unlocked.
    

### 2.1.7.� `ul_release_urecord(record, is_replicated)`

Do some sanity checks - if all contacts have been removed, delete the entire record structure.

Meaning of the parameters is as follows:

*   _urecord\_t\* record_ - Record to be released.
    
*   _char is\_replicated_ - Specifies whether this function will be called from the context of a Binary Interface callback. If uncertain, simply use 0.
    

### 2.1.8.� `ul_insert_ucontact(record, contact, contact_info, contact, is_replicated)`

The function inserts a new contact in the given record with specified parameters.

Meaning of the parameters is as follows:

*   _urecord\_t\* record_ - Record in which the contact should be inserted.
    
*   _str\* contact_ - Contact URI.
    
*   _ucontact\_info\_t\* contact\_info_ - Single structure containing the new contact information
    
*   _char is\_replicated_ - Specifies whether this function will be called from the context of a Binary Interface callback. If uncertain, simply use 0.
    

### 2.1.9.� `ul_delete_ucontact (record, contact, is_replicated)`

The function deletes given contact from record.

Meaning of the parameters is as follows:

*   _urecord\_t\* record_ - Record from which the contact should be removed.
    

*   _ucontact\_t\* contact_ - Contact to be deleted.
    
*   _char is\_replicated_ - Specifies whether this function will be called from the context of a Binary Interface callback. If uncertain, simply use 0.
    

### 2.1.10.� `ul_delete_ucontact_from_id (domain, contact_id)`

The function deletes a contact with the given contact\_id from the given domain.

Meaning of the parameters is as follows:

*   _udomain\_t\* domain_ - Domain where the contact can be found.
    

*   _uint64\_t contact\_id_ - Contact\_id identifying the contact to be deleted.
    

### 2.1.11.� `ul_get_ucontact(record, contact)`

The function tries to find contact with given Contact URI and returns pointer to structure representing the contact.

Meaning of the parameters is as follows:

*   _urecord\_t\* record_ - Record to be searched for the contact.
    

*   _str\_t\* contact_ - URI of the request contact.
    

### 2.1.12.� `ul_get_domain_ucontacts (domain, buf, len, flags)`

The function retrieves all contacts of all registered users from the given doamin and returns them in the caller-supplied buffer. If the buffer is too small, the function returns positive value indicating how much additional space would be necessary to accommodate all of them. Please note that the positive return value should be used only as a “hint”, as there is no guarantee that during the time between two subsequent calls number of registered contacts will remain the same.

If flag parameter is set to non-zero value then only contacts that have the specified flags set will be returned. It is, for example, possible to list only contacts that are behind NAT.

Meaning of the parameters is as follows:

*   _udomaint\_t\* domain_ - Domain from which to get the contacts
    

*   _void\* buf_ - Buffer for returning contacts.
    

*   _int len_ - Length of the buffer.
    

*   _unsigned int flags_ - Flags that must be set.
    

### 2.1.13.� `ul_get_all_ucontacts (buf, len, flags)`

The function retrieves all contacts of all registered users and returns them in the caller-supplied buffer. If the buffer is too small, the function returns positive value indicating how much additional space would be necessary to accommodate all of them. Please note that the positive return value should be used only as a “hint”, as there is no guarantee that during the time between two subsequent calls number of registered contacts will remain the same.

If flag parameter is set to non-zero value then only contacts that have the specified flags set will be returned. It is, for example, possible to list only contacts that are behind NAT.

Meaning of the parameters is as follows:

*   _void\* buf_ - Buffer for returning contacts.
    

*   _int len_ - Length of the buffer.
    

*   _unsigned int flags_ - Flags that must be set.
    

### 2.1.14.� `ul_update_ucontact(record, contact, contact_info, is_replicated)`

The function updates contact with new values.

Meaning of the parameters is as follows:

*   _urecord\_t\* record_ - Record in which the contact should be inserted.
    
*   _ucontact\_t\* contact_ - Contact URI.
    
*   _ucontact\_info\_t\* contact\_info_ - Single structure containing the new contact information
    
*   _char is\_replicated_ - Specifies whether this function will be called from the context of a Binary Interface callback. If uncertain, simply use 0.
    

### 2.1.15.� `ul_bind_ursloc( api )`

The function imports all functions that are exported by the USRLOC module. Overs for other modules which want to user the internal USRLOC API an easy way to load and access the functions.

Meaning of the parameters is as follows:

*   _usrloc\_api\_t\* api_ - USRLOC API
    

### 2.1.16.� `ul_register_ulcb(type ,callback, param)`

The function register with USRLOC a callback function to be called when some event occures inside USRLOC.

Meaning of the parameters is as follows:

*   _int types_ - type of event for which the callback should be called (see usrloc/ul\_callback.h).
    
*   _ul\_cb f_ - callback function; see usrloc/ul\_callback.h for prototype.
    
*   _void \*param_ - some parameter to be passed to the callback each time when it is called.
    

### 2.1.17.� `ul_get_num_users()`

The function loops through all domains summing up the number of users.

## Chapter�3.�Contributors

## 3.1.�By Commit Statistics

**Table�3.1.�Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)**

�

Name

DevScore

Commits

Lines ++

Lines --

1.

Jan Janak ([@janakj](https://github.com/janakj))

416

117

15689

10095

2.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

358

215

9395

3830

3.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

246

150

4232

3624

4.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

43

25

794

661

5.

Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita))

41

24

1099

413

6.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

40

29

544

308

7.

Jiri Kuthan ([@jiriatipteldotorg](https://github.com/jiriatipteldotorg))

36

25

975

120

8.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

31

24

427

159

9.

Henning Westerholt ([@henningw](https://github.com/henningw))

21

11

462

356

10.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

19

13

347

162

  

**All remaining contributors**: Andrei Pelinescu-Onciul, Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)), Walter Doekes ([@wdoekes](https://github.com/wdoekes)), Nils Ohlmeier, Eseanu Marius Cristian ([@eseanucristian](https://github.com/eseanucristian)), Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)), Ionel Cerghit ([@ionel-cerghit](https://github.com/ionel-cerghit)), Andrei Dragus, Anca Vamanu, Alessio Garzi ([@Ozzyboshi](https://github.com/Ozzyboshi)), Zero King ([@l2dy](https://github.com/l2dy)), Dusan Klinec ([@ph4r05](https://github.com/ph4r05)), Andrei Datcu ([@andrei-datcu](https://github.com/andrei-datcu)), Carsten Bock, Juha Heinanen ([@juha-h](https://github.com/juha-h)), Marcus Hunger, Jamey Hicks, Norman Brandinger ([@NormB](https://github.com/NormB)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Andreas Granig, Shlomi Gutman, [@jalung](https://github.com/jalung), Jeffrey Magder, Phil D'Amore, David Sanders, Konstantin Bokarius, Klaus Darilion, Iouri Kharon, Aron Podrigal ([@ar45](https://github.com/ar45)), Alexandra Titoc, Dan Pascu ([@danpascu](https://github.com/danpascu)), Gang Zhuo, Matthew M. Boedicker, UnixDev, Edson Gellert Schubert, Alexey Vasilyev ([@vasilevalex](https://github.com/vasilevalex)), Elena-Ramona Modroiu, Stephane Alnet.

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 3.2.�By Commit Activity

**Table�3.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Norman Brandinger ([@NormB](https://github.com/NormB))

Aug 2006 - May 2025

2.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Jan 2013 - Feb 2025

3.

Gang Zhuo

Nov 2024 - Nov 2024

4.

Alexandra Titoc

Sep 2024 - Sep 2024

5.

Carsten Bock

Mar 2024 - Mar 2024

6.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Apr 2003 - Dec 2023

7.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

Jun 2011 - Jul 2023

8.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

Jul 2016 - Mar 2023

9.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Jul 2011 - Jan 2023

10.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Mar 2002 - Feb 2022

  

**All remaining contributors**: Walter Doekes ([@wdoekes](https://github.com/wdoekes)), Zero King ([@l2dy](https://github.com/l2dy)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Alexey Vasilyev ([@vasilevalex](https://github.com/vasilevalex)), Aron Podrigal ([@ar45](https://github.com/ar45)), Alessio Garzi ([@Ozzyboshi](https://github.com/Ozzyboshi)), Dan Pascu ([@danpascu](https://github.com/danpascu)), Shlomi Gutman, [@jalung](https://github.com/jalung), Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita)), Ionel Cerghit ([@ionel-cerghit](https://github.com/ionel-cerghit)), Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)), Dusan Klinec ([@ph4r05](https://github.com/ph4r05)), Eseanu Marius Cristian ([@eseanucristian](https://github.com/eseanucristian)), David Sanders, Andrei Datcu ([@andrei-datcu](https://github.com/andrei-datcu)), Stephane Alnet, Andrei Dragus, Phil D'Amore, UnixDev, Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Henning Westerholt ([@henningw](https://github.com/henningw)), Iouri Kharon, Konstantin Bokarius, Edson Gellert Schubert, Anca Vamanu, Matthew M. Boedicker, Marcus Hunger, Elena-Ramona Modroiu, Jeffrey Magder, Andreas Granig, Juha Heinanen ([@juha-h](https://github.com/juha-h)), Klaus Darilion, Jan Janak ([@janakj](https://github.com/janakj)), Andrei Pelinescu-Onciul, Jiri Kuthan ([@jiriatipteldotorg](https://github.com/jiriatipteldotorg)), Jamey Hicks, Nils Ohlmeier.

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�4.�Documentation

## 4.1.�Contributors

**Last edited by:** Norman Brandinger ([@NormB](https://github.com/NormB)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Carsten Bock, Zero King ([@l2dy](https://github.com/l2dy)), Alexey Vasilyev ([@vasilevalex](https://github.com/vasilevalex)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita)), Eseanu Marius Cristian ([@eseanucristian](https://github.com/eseanucristian)), Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)), Andrei Datcu ([@andrei-datcu](https://github.com/andrei-datcu)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Henning Westerholt ([@henningw](https://github.com/henningw)), Marcus Hunger, Elena-Ramona Modroiu, Juha Heinanen ([@juha-h](https://github.com/juha-h)), Jan Janak ([@janakj](https://github.com/janakj)), Maksym Sobolyev ([@sobomax](https://github.com/sobomax)), Nils Ohlmeier.

_Documentation Copyrights:_

Copyright � 2018 [www.opensips-solutions.com](http://www.opensips-solutions.com/)

Copyright � 2005-2008 Voice Sistem SRL

Copyright � 2003 FhG FOKUS