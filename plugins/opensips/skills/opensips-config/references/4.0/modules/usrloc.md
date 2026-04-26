# usrloc Module Reference
<!-- generated-from: data/4.0/modules/usrloc.json
     generator-version: 0.1.0
     opensips-version: 4.0
     doc-type: module -->

Reference for the OpenSIPs 4.0 usrloc module. Read this file when configuring or debugging the usrloc module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Exported MI Functions](#exported-mi-functions)
- [Exported Statistics](#exported-statistics)
- [Exported Events](#exported-events)
- [Configuration Examples](#configuration-examples)

## Overview

A SIP user location implementation. Its main purpose is to store, manage and provide access to SIP registration bindings (contacts) for other modules (e.g. registrar, mid-registrar, nathelper, etc.). The module exports no functions that could be directly used from the OpenSIPS script.

At runtime, the contacts may reside in memory, in an SQL database or in a NoSQL database. Combinations of two of the above are also possible. For example, contacts may only be directly manipulated in memory in order to guarantee fast interactions while being asynchronously synchronized to an SQL database. The latter helps achieve restart persistency. Consult the working_mode_preset parameter for more details on all possible runtime behaviors of the module.

The OpenSIPS user location implementation is cluster-enabled. On top of supporting traditional "single instance" setups, it also allows multiple OpenSIPS user location nodes to form a single, global user location cluster. This allows high-level features such as startup synchronization (data tunneling) from a random, healthy "donor" node and evenly distributed NAT pinging workloads.

## How It Works

### 1.2. Distributed SIP User Location

Starting with OpenSIPS 2.4, the user location module offers several optional data distribution models, each tailoring to specific real-life production use cases. Built on top of the OpenSIPS clustering module, these models take into account service concerns such as high availability, geographical distribution, horizontal scalability and NAT traversal.

Depending on data locality, the distribution models are split in two main categories:

#### 1.2.1. "Federation" Topology

A federated user location keeps contact data local to the original OpenSIPS node the contact initially registered to. In order to share the reachability of these contacts with the global OpenSIPS user location cluster, registrar nodes will only publish some light "metadata" entries for any new Addresses-of-Record which are reachable from them. These entries will cause other nodes to also fork additional SIP branches pointing to the publisher registrar upon receiving calls for its advertised Addresses-of-Record.

The federation topology is an optimized solution for the following core problems:

* IP address restrictions - In some cases, calls routed towards registered contacts must necessarily pass through the original registration nodes of these contacts. A classic example of this situation is when an OpenSIPS registrar sitting at the edge of the platform is directly facing a NAT device on the way to the contact. Unless calls are sent out from this exact registrar, they will not be able to traverse the NAT device and reach the contact.
* horizontal scalability - Avoiding global replication/contact broadcasting within the cluster not only dramatically improves contact storage performance, but also leads to better service scalability. Different geographical locations can be sized according to their local subscriber populations (traffic may be balanced to them using DNS SRV weights, for example), without losing platform-wide reachability.

Currently, the metadata information may be published to NoSQL databases which support key/multi-value column-like associations. Example known backends to support these abstractions at the time of writing are MongoDB and Cassandra.

#### 1.2.2. "Full Sharing" Topology

A fully sharing user location broadcasts contact information to all data nodes (OpenSIPS or NoSQL). The main assumption behind this mode is that any routing restrictions have been alleviated beforehand. Consequently, either SIP traffic egressing from a "full sharing" OpenSIPS user location topology is being intermediated by an additional SIP edge endpoint of our platform, or there are no egress IP restrictions at all (for example, if all SIP UAs have public IPs). In this setup, all OpenSIPS user location nodes are equivalent to one another, as they each have access to the same dataset and have no routing restrictions.

The full sharing topology is an appropriate solution for multi-layer VoIP platforms, where the OpenSIPS registrar nodes do not directly interact with external SIP endpoints. Moreover, it can be configured to fully store contact data within a NoSQL cluster (zero in-memory storage), thus taking full advantage of the data sharing, sharding, migration and other capabilities of a specialized distributed data handling engine.

Additionally, a "full sharing" topology can be used to achieve a basic "hot backup" high-availability setup with an active-passive registrar nodes configuration, both of which make use of a shared virtual IP.

Registrations may optionally be fully managed inside NoSQL databases which support key/multi-value column-like associations. Example known backends to currently support these abstractions are MongoDB and Apache Cassandra.

#### 1.2.3. "N Contact Pings" Problem

A long-standing problem caused by contact information being replicated to multiple SIP registrar instances directly through replication or indirectly through a globally reachable database. As long as traditionally clusterized nodes are not aware of each other, they will each scan the entire contact dataset, thus periodically sending "N pings" instead of "1 ping" for each contact. This difference directly affects service scalability, as well as the amount of consumed resources such as CPU and network bandwidth, both on the service and client side.

This problem is solved with the help of the OpenSIPS cluster layer, which makes all nodes aware of each others' presence. Thus, the distributed user location node topologies are able to collectively partition the pinging workload and spread it evenly across the current number of cluster nodes, at any given point in time. The pinging_mode module parameter describes the built-in pinging heuristics in more detail.

### 1.3. Contact matching

Contact matching (for the same Address-of-Record, AoR) is an important aspect of a SIP user location service, especially in the context of NAT traversal. The latter raises more problems, since contacts from different phones of same users may overlap (if behind NATs with identical configurations) or the re-register Contact of the same SIP User Agent may be seen as a new one (due to the request arriving via a new NAT binding).

The SIP RFC 3261 publishes a matching algorithm based only on the contact string with Call-ID and CSeq number extra checking (if the Call-ID matches, it must have a higher CSeq number, otherwise the registration is invalid). But as argumented above, this is not enough in a NAT traversal context, so the OpenSIPS implementation of contact matching offers more algorithms:

* Contact based only - strict RFC 3261 compliancy - the contact is matched as string and extra checked via Call-ID and CSeq (if Call-ID is the same, it must have a higher CSeq number, otherwise the registration is invalid).
* Contact and Call-ID based - an extension of the first case - the Contact and Call-ID header field values must match as strings; the CSeq must be higher than the previous one - so be careful how you deal with REGISTER retransmissions in this case.

## Dependencies

### OpenSIPs Modules

- `clusterer` — if cluster_mode is different than "none"

### External Libraries

None.

### Optional Modules

- `NoSQL database module`
- `SQL database module`

## Exported Parameters

### `attr_column` (string)

Name of column containing additional registration-related information.

*Default value is “attr”.*

**Example.** attributes.

```opensips
modparam("usrloc", "attr_column", "attributes")
```
### `cachedb_url` (string)

URL of a NoSQL database to be used. Only required in a cachedb-enabled cluster_mode.

*Default value is none.*

**Example.** mongodb://10.0.0.4:27017/opensipsDB.userlocation.

```opensips
modparam("usrloc", "cachedb_url", "mongodb://10.0.0.4:27017/opensipsDB.userlocation")
```
### `callid_column` (string)

Name of column containing callid values.

*Default value is callid.*

**Example.** callid.

```opensips
modparam("usrloc", "callid_column", "callid")
```
### `cflags_column` (string)

Name of column to save the branch/contact flags of the record.

*Default value is “cflags”.*

**Example.** Set the `cflags_column` parameter.

```opensips
modparam("usrloc", "cflags_column", "cflags")
```
### `cluster_mode` (string)

The behavior of the global OpenSIPS user location cluster. Refer to section Distributed SIP User Location for details. This parameter will get overridden if either working_mode_preset or [???] is set.

*Default value is none.*

**Possible values:**

- none
- federation-cachedb
- full-sharing
- full-sharing-cachedb
- sql-only

**Notes:** none - single instance mode. federation-cachedb - federation-based data sharing. Local AoR metadata is published inside a NoSQL database, so other cluster nodes can fork SIP traffic over to the current node. Consequently, the location_cluster and cachedb_url parameters are mandatory. full-sharing - Broadcast contact updates (full-mesh mirroring) to all other OpenSIPS cluster participants. Each node will hold the entire user location dataset. Consequently, the location_cluster parameter is mandatory. full-sharing-cachedb - Full contact data management through the use of a NoSQL database (somewhat resembling the "sql-only" preset). The cluster layer is still required in order to be able to partition and spread the pinging workload evenly among participating OpenSIPS nodes. Consequently, the location_cluster and cachedb_url parameters are mandatory. sql-only - Multiple OpenSIPS boxes using a common db_url without necessarily being aware of each other.

**Example.** federation-cachedb.

```opensips
modparam("usrloc", "cluster_mode", "federation-cachedb")
```
### `contact_column` (string)

Name of column containing contacts.

*Default value is contact.*

**Example.** contact.

```opensips
modparam("usrloc", "contact_column", "contact")
```
### `contact_id_column` (string)

Name of the column holding the unique contact IDs.

*Default value is contact_id.*

**Example.** ctid.

```opensips
modparam("usrloc", "contact_id_column", "ctid")
```
### `contact_refresh_timer` (boolean)

Enable a timer which will periodically scan a sorted list of contacts and raise the [E_UL_CONTACT_REFRESH](#event_E_UL_CONTACT_REFRESH "1.9.6. E_UL_CONTACT_REFRESH") for any of them which are past their re-registration time interval limit. This limit may given by registrar's _pn_trigger_interval_ module parameter, for example.

*Default value is false (disabled).*

**Example.** true.

```opensips
...
modparam("usrloc", "contact_refresh_timer", true)
...
```
### `cseq_column` (string)

Name of column containing cseq numbers.

*Default value is cseq.*

**Example.** cseq.

```opensips
modparam("usrloc", "cseq_column", "cseq")
```
### `cseq_delay` (integer)

Delay (in seconds) for accepting as retransmissions register requests with same Call-ID and Cseq. The delay is calculated starting from the receiving time of the first register with that Call-ID and Cseq. Retransmissions within this delay interval will be accepted and replied as the original request, but no update will be done in location. If the delay is exceeded, error is reported. A value of 0 disable the retransmission detection.

*Default value is 20.*

**Notes:** A value of 0 disable the retransmission detection.

**Example.** 5.

```opensips
modparam("usrloc", "cseq_delay", 5)
```
### `db_url` (string)

URL of the database that should be used.

*Default value is mysql://opensips:opensipsrw@localhost/opensips.*

**Example.** dbdriver://username:password@dbhost/dbname.

```opensips
modparam("usrloc", "db_url", "dbdriver://username:password@dbhost/dbname")
```
### `desc_time_order` (integer)

If the user's contacts should be kept timestamp ordered; otherwise the contact will be ordered based on q value. Non 0 value means true.

*Default value is 0 (false).*

**Example.** 1.

```opensips
modparam("usrloc", "desc_time_order", 1)
```
### `domain_column` (string)

Name of column containing domains.

*Default value is domain.*

**Example.** domain.

```opensips
modparam("usrloc", "domain_column", "domain")
```
### `expires_column` (string)

Name of column containing expires value.

*Default value is expires.*

**Example.** expires.

```opensips
modparam("usrloc", "expires_column", "expires")
```
### `flags_column` (string)

Name of column to save the internal flags of the record.

*Default value is “flags”.*

**Example.** Set the `flags_column` parameter.

```opensips
modparam("usrloc", "flags_column", "flags")
```
### `ha_cluster` (integer)

Only relevant in **"federation-cachedb"** [cluster_mode](#param_cluster_mode "1.5.26.cluster_mode (string)"). Denotes the HA cluster ID to use in order to establish the active node within the HA pair, such that only that node performs WRITE operations to CacheDB.

*Default value is 0 (disabled).*

**Example.** 4.

```opensips
modparam("usrloc", "ha_cluster", 4)
```
### `ha_shtag` (string)

Only relevant in **"federation-cachedb"** [cluster_mode](#param_cluster_mode "1.5.26.cluster_mode (string)"). Denotes the HA cluster sharing tag to use in order to establish the active node within the HA pair, such that only that node performs WRITE operations to CacheDB.

*Default value is NULL (disabled).*

**Example.** vip2.

```opensips
modparam("usrloc", "ha_shtag", "vip2")
```
### `hash_size` (integer)

The number of entries of the hash table used by usrloc to store the location records is 2^hash_size. For hash_size=4, the number of entries of the hash table is 16. Since version 2.2, the maximu size of this parameter is 16, meaning that the hash supports maximum 65536 entries.

*Default value is 9.*

*Valid range: up to 16.*

**Example.** 10.

```opensips
modparam("usrloc", "hash_size", 10)
```
### `kv_store_column` (string)

Name of column containing generic key-value data.

*Default value is “kv_store”.*

**Example.** json_data.

```opensips
modparam("usrloc", "kv_store_column", "json_data")
```
### `latency_event_min_us` (integer)

Defines a minimal pinging latency threshold, in microseconds, past which contact pinging latency update events will get raised. By default, an event is raised for each ping reply (i.e. latency update). If both [latency_event_min_us](#param_latency_event_min_us "1.5.38.latency_event_min_us (integer)") and [latency_event_min_us_delta](#param_latency_event_min_us_delta "1.5.39.latency_event_min_us_delta (integer)") are set, the event will get raised if either of them is true.

*Default value is 0 (no bottom limit set).*

**Example.** 425000.

```opensips
# raise an event for any 425+ ms pinging latency
modparam("usrloc", "latency_event_min_us", 425000)
```
### `latency_event_min_us_delta` (integer)

Defines a minimal, absolute pinging latency difference, in microseconds, past which contact pinging latency update events will get raised. The difference is computed using the latencies of the last two contact pinging replies. By default, an event is raised for each ping reply (i.e. latency update). If both [latency_event_min_us](#param_latency_event_min_us "1.5.38.latency_event_min_us (integer)") and [latency_event_min_us_delta](#param_latency_event_min_us_delta "1.5.39.latency_event_min_us_delta (integer)") are set, the event will get raised if either of them is true.

*Default value is 0 (no minimal latency delta set).*

**Example.** 300000.

```opensips
# raise an event only if a contact has pinging latency swings of 300+ ms
modparam("usrloc", "latency_event_min_us_delta", 300000)
```
### `location_cluster` (integer)

Specifies the cluster ID which this instance will send to and receive from all user-location related information (_addresses-of-record_, _contacts_), organized into specific events (inserts, deletes or updates). This OpenSIPS cluster exposes the **"usrloc-contact-repl"** capability in order to mark nodes as eligible for becoming data donors during an arbitrary sync request. Consequently, the cluster must have _at least one node_ marked with the **"seed"** value as the _clusterer.flags_ column/property in order to be fully functional. Consult the [clusterer - Capabilities](clusterer#capabilities) chapter for more details. More details on the user location distribution mechanisms are available under [Distributed SIP User Location](#distributed-sip-user-location "1.2.Distributed SIP User Location").

*Default value is 0 (replication disabled).*

**Example.** 1.

```opensips
modparam("usrloc", "location_cluster", 1)
```
### `matching_mode` (integer)

What contact matching algorithm to be used. Refer to section Contact Matching for the description of the algorithms.

*Default value is 0.*

**Possible values:**

- 0
- 1

**Notes:** 0 - CONTACT ONLY based matching algorithm. 1 - CONTACT and CALLID based matching algorithm.

**Example.** 1.

```opensips
modparam("usrloc", "matching_mode", 1)
```
### `max_contact_delete` (integer)

Relevant only in WRITE_THROUGH or WRITE_BACK schemes. The maximum number of contacts to be deleted from the database at once. Will delete all of them, if fewer after passing through all the contacts.

*Default value is "10".*

**Example.** 10.

```opensips
modparam("usrloc", "max_contact_delete", 10)
```
### `methods_column` (string)

Name of column containing supported methods.

*Default value is methods.*

**Example.** methods.

```opensips
modparam("usrloc", "methods_column", "methods")
```
### `mi_dump_kv_store` (integer)

Enable in order to include the "KV-Store" field in all usrloc MI commands which output AoR or Contact representations. This verbose field contains custom data attached to each of these two entities. mid_registrar makes use of both of these holders, for example.

*Default value is 0 (disabled).*

**Example.** 1.

```opensips
...
# include the "KV-Store" key in all usrloc MI output
modparam("usrloc", "mi_dump_kv_store", 1)
...
```
### `nat_bflag` (string)

The name of the branch flag to be used as NAT marker (if the contact is or not natted). This is a branch flag and it will be imported and used by all other modules depending on the usrloc module.

*Default value is NULL (not set).*

**Example.** NAT_BFLAG.

```opensips
modparam("usrloc", "nat_bflag", "NAT_BFLAG")
```
### `path_column` (string)

Name of column containing the Path header.

*Default value is “path”.*

**Example.** path.

```opensips
modparam("usrloc", "path_column", "path")
```
### `pinging_mode` (string)

Depending on the [cluster_mode](#param_cluster_mode "1.5.26.cluster_mode (string)"), the module can perform contact pinging using one of two possible heuristics: * **"ownership"** - this instance will only attempt to ping a contact if it decides it is the logical owner of the contact. If a shared tag is attached to a contact, a node will keep sending pings to that contact as long as it owns the respective tag. If no shared tag has been specified for a given contact, the default is to assume permanent ownership of the contact and ping it upon request. * **"cooperation"** - the assumption behind this pinging heuristic is that all user location cluster nodes are symmetrical (possibly front-ended by a SIP traffic balancing entity), such that **either** of them can ping **any** contact. Under this assumption, all currently online user location cluster nodes will cooperate and evenly split the pinging workload between them by hashing AoRs modulo current_number_of_online_nodes, and only picking the ones that they are responsible for.

**Possible values:**

- ownership
- cooperation

**Notes:** Notice that only the **"full-sharing"** clustering mode allows some flexibility -- all other modes are logically tied to a single pinging logic. Any unaccepted value, according to the above table, set for those modes will be silently discarded.

**Example.** ownership.

```opensips
# prepare an active/backup "full-sharing" setup, with no front-end
modparam("usrloc", "pinging_mode", "ownership")
```
### `q_column` (string)

Name of column containing q values.

*Default value is q.*

**Example.** q.

```opensips
modparam("usrloc", "q_column", "q")
```
### `received_column` (string)

Name of column containing the source IP, port, and protocol from the REGISTER message.

*Default value is “received”.*

**Example.** Set the `received_column` parameter.

```opensips
modparam("usrloc", "received_column", "received")
```
### `regen_broken_contactid` (integer)

Since version 2.2, **contact_id** concept was introduced. Since this parameter validates a contact each time OpenSIPS is started, there are times when the value of this parameter should be regenerated. That is when **location** table is being migrated from a version older than 2.2 or when **hash_size** module parameter is changed. Enabling this parameter will regenerate broken contact id's based on current configurations.

*Default value is 0(not enabled).*

**Example.** 1.

```opensips
modparam("usrloc", "regen_broken_contactid", 1)
```
### `restart_persistency` (string)

Controls the behavior of the OpenSIPS user location following a restart. This parameter has no effect in some database-only working mode presets, where restart persistency is naturally ensured. This parameter will get overridden if either working_mode_preset or [???] are set.

*Default value is none.*

**Possible values:**

- none
- load-from-sql
- sync-from-cluster

**Notes:** none - no explicit data synchronization following a restart. The node starts empty. load-from-sql - enable SQL-based restart persistency. This causes all runtime in-memory writes (i.e. new registrations, re-registrations or de-registrations) to also propagate to an SQL database, from which all data will be imported following a restart. Choosing this value will make the db_url parameter mandatory, as well as cause sql_write_mode to default to "write-back" instead of "none". sync-from-cluster - enable cluster-based restart persistency. Following a restart, an OpenSIPS cluster node will search for a healthy "donor" node from which to mirror the entire user location dataset via direct cluster sync (TCP-based, binary-encoded data transfer). Depending on the clustering mode and cluster topology, this will require the configuration of one or multiple "seed" nodes in the cluster. Choosing this value will make the location_cluster parameter mandatory.

**Example.** sync-from-cluster.

```opensips
modparam("usrloc", "restart_persistency", "sync-from-cluster")
```
### `sip_instance_column` (string)

Name of column containing the SIP instance.

*Default value is “NULL”.*

**Example.** sip_instance.

```opensips
modparam("usrloc", "sip_instance_column", "sip_instance")
```
### `skip_replicated_db_ops` (integer)

Prevent OpenSIPS from performing any DB-related contact operations when events are received over the _Binary Interface_. This is commonly used to prevent unneeded duplicate operations. More details on the user location replication mechanism are available in [Distributed SIP User Location](#distributed-sip-user-location "1.2.Distributed SIP User Location")

*Default value is "0" (upon receival of usrloc-related Binary Interface events, DB queries may be freely performed).*

**Example.** 1.

```opensips
modparam("usrloc", "skip_replicated_db_ops", 1)
```
### `socket_column` (string)

Name of column containing the received socket information (IP:port) for the REGISTER message.

*Default value is “socket”.*

**Example.** Set the `socket_column` parameter.

```opensips
modparam("usrloc", "socket_column", "socket")
```
### `sql_write_mode` (string)

Only valid if restart_persistency is enabled. Controls the runtime behavior of OpenSIPS writes to the SQL database. This parameter will get overridden if either working_mode_preset or [???] are set.

*Default value is none.*

**Possible values:**

- none
- write-through
- write-back

**Notes:** none - do not perform any additional SQL writes at runtime to an SQL database in order to specifically ensure restart persistency. write-through - all in-memory writes (i.e. new registrations, re-registrations or de-registrations) also propagate into the SQL database, inline. While this will definitely slow down registration performance (lookups are served from memory!), it has the advantage of making the instance crash-safe. write-back - all in-memory writes (i.e. new registrations, re-registrations or de-registrations) eventually also propagate into the SQL database, thanks to a separate timer routine. This dramatically speeds up registrations, but also introduces the possibility of crashing before the latest contact changes are propagated to the database.

**Example.** write-back.

```opensips
modparam("usrloc", "sql_write_mode", "write-back")
```
### `timer_interval` (integer)

Number of seconds between two timer runs. During each run, the module will update/delete dirty/expired contacts from memory and/or mirror these operations to the database, if configured to do so.

*Default value is 60.*

**Notes:** In case of an OpenSIPS shutdown or even a crash, contacts which are in memory only and have not been flushed yet to disk will NOT get lost! OpenSIPS will try its best to do a last-minute sync to DB right before shutting down.

**Example.** 120.

```opensips
modparam("usrloc", "timer_interval", 120)
```
### `use_domain` (boolean)

Denotes whether the _domain_ part of the user should also be saved and used for identifying the user, along with the _username_ part. Useful in multi-domain scenarios.

*Default value is true (enabled).*

**Example.** true.

```opensips
modparam("usrloc", "use_domain", true)
```
### `user_agent_column` (string)

Name of column containing user-agent values.

*Default value is “user_agent”.*

**Example.** Set the `user_agent_column` parameter.

```opensips
modparam("usrloc", "user_agent_column", "user_agent")
```
### `user_column` (string)

Name of column containing usernames.

*Default value is username.*

**Example.** username.

```opensips
modparam("usrloc", "user_column", "username")
```
### `working_mode_preset` (string)

A pre-defined working mode for the usrloc module. Setting this parameter will override any cluster_mode, restart_persistency and sql_write_mode settings.

*Default value is single-instance-no-db.*

**Possible values:**

- single-instance-no-db
- single-instance-sql-write-through
- single-instance-sql-write-back
- sql-only
- federation-cachedb-cluster
- full-sharing-cluster
- full-sharing-cachedb-cluster

**Notes:** "single-instance-no-db" - This disables database completely. Only memory will be used. Contacts will not survive restart. Use this value if you need a really fast usrloc and contact persistence is not necessary or is provided by other means.
"single-instance-sql-write-through" - Write-Through scheme. All changes to usrloc are immediately reflected in database too. This is very slow, but very reliable. Use this scheme if speed is not your priority but need to make sure that no registered contacts will be lost during crash or reboot.
"single-instance-sql-write-back" - Write-Back scheme. This is a combination of previous two schemes. All changes are made to memory and database synchronization is done in the timer. The timer deletes all expired contacts and flushes all modified or new contacts to database. Use this scheme if you encounter high-load peaks and want them to process as fast as possible. The mode will not help at all if the load is high all the time. The added latency on the SIP signaling when using this asynchronous preset is much lower than the one added by the safe but blocking, "single-instance-sql-write-through" preset.
"sql-only" - DB-Only scheme. No memory cache is kept, all operations being directly performed with the database. The timer deletes all expired contacts from database - cleans after clients that didn't un-register or re-register. The mode is useful if you configure more servers sharing the same DB without any replication at SIP level. The mode may be slower due the high number of DB operation. For example NAT pinging is a killer since during each ping cycle all nated contact are loaded from the DB; The lack of memory caching also disable the statistics exports.
"federation-cachedb-cluster" - OpenSIPS will run with a "federation-cachedb" cluster_mode and "sync-from-cluster" restart_persistency. This will require the configuration of multiple "seed" nodes in the cluster. Refer to the federated user location tutorial for more details.
"full-sharing-cluster" - OpenSIPS will run with a "full-sharing" cluster_mode and "sync-from-cluster" restart_persistency. This will require the configuration of one of the nodes in the cluster as a "seed" node in order to bootstrap the syncing process.
"full-sharing-cachedb-cluster" - OpenSIPS will run with a "full-sharing-cachedb" cluster_mode, where all location data strictly resides in a NoSQL database, thus it will have natural restart persistency.

**Example.** full-sharing-cachedb-cluster.

```opensips
modparam("usrloc", "working_mode_preset", "full-sharing-cachedb-cluster")
```

## Exported Functions

### `ul_add_key(domain, aor, key_name, [key_value])`

Append a Key/Value to the Key-Value-Store of a Usrloc-Record.

**Parameters:**

- `aor` *(string, required)* — Address-of-Record, save the key for a specific (registered) user.
- `domain` *(string, required)* — Domain of the AOR, e.g. "location"
- `key_name` *(string, required)* — The name of the key to be stored.
- `key_value` *(string, optional)* — The value to be stored. Not providing the value or by providing an empty value, will delete the entry.

**Return codes:**

- `false` — if no record is found is usrloc

**Usable from:** ANY_ROUTE

**Example.** ul_add_key usage.

```opensips
...
ul_add_key("location", "$tU@$td", "service_route", "$hdr(Service-Route)");
...
```

### `ul_del_key(domain, aor, key_name)`

Deletes a Key/Value from the Key-Value-Store of a Usrloc-Record.

**Parameters:**

- `aor` *(string, required)* — Address-of-Record, save the key for a specific (registered) user.
- `domain` *(string, required)* — Domain of the AOR, e.g. "location"
- `key_name` *(string, required)* — The name of the key to be deleted.

**Return codes:**

- `false` — if no record is found is usrloc

**Usable from:** ANY_ROUTE

**Example.** ul_del_key usage.

```opensips
...
ul_del_key("location", "$tU@$td", "service_route");
...
```

### `ul_get_key(domain, aor, key_name, destination)`

Retrieve a Key/Value from the Key-Value-Store of a Usrloc-Record.

**Parameters:**

- `aor` *(string, required)* — Address-of-Record, save the key for a specific (registered) user.
- `destination` *(variable, required)* — A variable, where to store the retrieved key.
- `domain` *(string, required)* — Domain of the AOR, e.g. "location"
- `key_name` *(string, required)* — The name of the key to be retrieved.

**Return codes:**

- `false` — if no record is found is usrloc or no according key is found

**Usable from:** ANY_ROUTE

**Example.** ul_get_key usage.

```opensips
...
if (ul_get_key("location", "$tU@$td", "service_route", $avp(service_route))) {
        append_to_reply("Service-Route: $avp(service_route)\r\n");
}
...
```

## Exported MI Functions

### `usrloc:add`

Replaces obsolete MI command: _ul_add_.

Adds a new contact for an user AOR.

**Parameters:**

- `aor` *(string, required)* — user AOR in username[@domain] format (domain must be supplied only if use_domain option is on).
- `cflags` *(integer, required)* — per branch flags of the contact
- `contact` *(string, required)* — Contact URI to be added
- `expires` *(integer, required)* — expires value of the contact
- `flags` *(integer, required)* — internal USRLOC flags of the contact
- `methods` *(integer, required)* — bitmask with supported requests of the contact. To whitelist all SIP methods, simply use the value 32767. For a breakdown of each method's value, see the "request_method" internal enum.
- `q` *(string, required)* — Q value of the contact
- `table name` *(string, required)* — table where the contact will be added (Ex: "location").

### `usrloc:cluster_sync`

Replaces obsolete MI command: _ul_cluster_sync_.

This command will only take effect if the target OpenSIPS instance is paired with a hot backup instance, while running under a cluster-enabled working_mode_preset.

The current node will locate a healthy donor node within the location_cluster and issue a sync request to it. The donor node will then proceed to push all of its user location data over to the current node, via the binary interface. The received data will be merged with existing data. Conflicting contacts (matched according to matching_mode) are overwritten only if the sync data is newer than the current data.

### `usrloc:dump`

Replaces obsolete MI command: _ul_dump_.

Dumps the entire content of the USRLOC in memory cache

**Parameters:**

- `brief` *(string, optional)* — (optional, may not be present); if equals to string “brief”, a brief dump will be done (only AOR and contacts, with no other details)

### `usrloc:flush`

Replaces obsolete MI command: _ul_flush_.

Force a flush of all pending usrloc cache changes to the database. Normally, this routine runs every timer_interval seconds.

### `usrloc:rm`

Replaces obsolete MI command: _ul_rm_.

Deletes an entire AOR record (including its contacts).

**Parameters:**

- `aor` *(string, required)* — user AOR in username[@domain] format (domain must be supplied only if use_domain option is on).
- `table_name` *(string, required)* — table where the AOR is removed from (Ex: location).

### `usrloc:rm_contact`

Replaces obsolete MI command: _ul_rm_contact_.

Deletes a contact from an AOR record.

**Parameters:**

- `AOR` *(string, required)* — user AOR in username[@domain] format (domain must be supplied only if use_domain option is on).
- `contact` *(string, required)* — exact contact to be removed
- `table name` *(string, required)* — table where the AOR is removed from (Ex: location).

### `usrloc:show_contact`

Replaces obsolete MI command: _ul_show_contact_.

Dumps the contacts of an user AOR.

**Parameters:**

- `aor` *(string, required)* — user AOR in username[@domain] format (domain must be supplied only if use_domain option is on).
- `table_name` *(string, required)* — table where the AOR resides (Ex: location).

### `usrloc:sync`

Replaces obsolete MI command: _ul_sync_.

Empty the location table, then synchronize it with all contacts from memory. Note that this can not be used when no database is specified or with the DB-Only scheme.

Important: make sure that all your contacts are in memory (_usrloc:dump_ MI function) before executing this command.

**Parameters:**

- `AOR` *(string, optional)* — only delete/sync this user AOR, not the whole table. Format: "username[@domain]" (_domain_ is required only if use_domain option is on).
- `table name` *(string, required)* — table where the AOR resides (Ex: location).

## Exported Statistics

### `contacts`

Number of contacts existing in the USRLOC memory cache for that domain - can not be resetted; this statistic will be register for each used domain (Ex: location).

- **Type:** gauge
### `expires`

Total number of expired contacts for that domain - can be resetted; this statistic will be register for each used domain (Ex: location).

- **Type:** counter
### `registered_users`

Total number of AOR existing in the USRLOC memory cache for all domains - can not be resetted.

- **Type:** gauge
### `users`

Number of AOR existing in the USRLOC memory cache for that domain - can not be resetted; this statistic will be register for each used domain (Ex: location).

- **Type:** gauge

## Exported Events

### `E_UL_AOR_DELETE`

This event is raised when a new AOR is deleted from the USRLOC memory cache.

**Parameters:**

- `domain` *(string)* — The name of the table.
- `aor` *(string)* — The AOR of the deleted record.
### `E_UL_AOR_INSERT`

This event is raised when a new AOR is inserted in the USRLOC memory cache.

**Parameters:**

- `domain` *(string)* — The name of the table.
- `aor` *(string)* — The AOR of the inserted record.
### `E_UL_CONTACT_DELETE`

This event is raised when a contact is deleted from an existing AOR's contact list. If the contact is the only one in the list then both the E_UL_AOR_DELETE and E_UL_CONTACT_DELETE events will be raised.

**Parameters:**

- `domain` *(string)* — The name of the table.
- `aor` *(string)* — The AOR of the inserted contact.
- `uri` *(string)* — The contact URI of the inserted contact.
- `received` *(string)* — IP, port and protocol the registration message was received from. If these have the same value as the contact's address (see the address parameter) then the received parameter will be an empty string.
- `path` *(string)* — The PATH header value of the registration message.(empty string if not present)
- `qval` *(integer)* — The Q value (priority) of the contact (as integer value from 0 to 10).
- `user_agent` *(string)* — The User-Agent header value. NOTICE: Can contain spaces.
- `socket` *(string)* — The SIP socket/listener (as string) used by OpenSIPS to receive the contact registations.
- `bflags` *(integer)* — The branch flags (bflags) of the contact (in integer value of the bitmask)
- `expires` *(integer)* — The expires value of the contact (as UNIX timestamp integer).
- `callid` *(string)* — The Call-ID header of the registration message.
- `cseq` *(integer)* — The cseq number as an int value.
- `attr` *(string)* — The attributes string attached to the contact (the custom attributes attached from the script level). As this string is options, if missing in the contact, the event will push the empty string for this event field.
- `latency` *(integer)* — The latency of the last successful ping for this contact, in microseconds. Until the first ping reply for a given contact arrives, its pinging latency will be 0.
- `shtag` *(string)* — The shared tag of the contact, which helps determine if the current node owns the contact (e.g. possibly using the $cluster.sh_tag pseudo-variable in order to perform the check). NOTICE: If a contact has no shared tag attached to it, the value of this parameter will be "" (empty string)!
### `E_UL_CONTACT_INSERT`

This event is raised when a new contact is inserted in any of the existing AOR's contact list. For each new contact, if its AOR does not exist in the memory, then both the E_UL_AOR_CREATE and E_UL_CONTACT_INSERT events will be raised.

**Parameters:**

- `domain` *(string)* — The name of the table.
- `aor` *(string)* — The AOR of the inserted contact.
- `uri` *(string)* — The contact URI of the inserted contact.
- `received` *(string)* — IP, port and protocol the registration message was received from. If these have the same value as the contact's address (see the address parameter) then the received parameter will be an empty string.
- `path` *(string)* — The PATH header value of the registration message.(empty string if not present)
- `qval` *(integer)* — The Q value (priority) of the contact (as integer value from 0 to 10).
- `user_agent` *(string)* — The User-Agent header value. NOTICE: Can contain spaces.
- `socket` *(string)* — The SIP socket/listener (as string) used by OpenSIPS to receive the contact registations.
- `bflags` *(integer)* — The branch flags (bflags) of the contact (in integer value of the bitmask)
- `expires` *(integer)* — The expires value of the contact (as UNIX timestamp integer).
- `callid` *(string)* — The Call-ID header of the registration message.
- `cseq` *(integer)* — The cseq number as an int value.
- `attr` *(string)* — The attributes string attached to the contact (the custom attributes attached from the script level). As this string is options, if missing in the contact, the event will push the empty string for this event field.
- `latency` *(integer)* — The latency of the last successful ping for this contact, in microseconds. Until the first ping reply for a given contact arrives, its pinging latency will be 0.
- `shtag` *(string)* — The shared tag of the contact, which helps determine if the current node owns the contact (e.g. possibly using the $cluster.sh_tag pseudo-variable in order to perform the check). NOTICE: If a contact has no shared tag attached to it, the value of this parameter will be "" (empty string)!
### `E_UL_CONTACT_REFRESH`

This event may only be raised for RFC 8599 (Push Notification) enabled contacts. Set contact_refresh_timer to true in order to enable this event. The event is raised within reasonable time before an RFC 8599 enabled contact will expire, such that the script writer can take action, possibly force a registration refresh from the endpoint.

**Parameters:**

- `domain` *(string)* — The name of the table.
- `aor` *(string)* — The AOR of the inserted contact.
- `uri` *(string)* — The contact URI of the inserted contact.
- `received` *(string)* — IP, port and protocol the registration message was received from. If these have the same value as the contact's address (see the address parameter) then the received parameter will be an empty string.
- `user_agent` *(string)* — The User-Agent header value. NOTICE: Can contain spaces.
- `socket` *(string)* — The SIP socket/listener (as string) used by OpenSIPS to receive the contact registations.
- `bflags` *(integer)* — The branch flags (bflags) of the contact (in integer value of the bitmask)
- `expires` *(integer)* — The expires value of the contact (as UNIX timestamp integer).
- `callid` *(string)* — The Call-ID header of the registration message.
- `attr` *(string)* — The attributes string attached to the contact (the custom attributes attached from the script level). As this string is options, if missing in the contact, the event will push the empty string for this event field.
- `shtag` *(string)* — The shared tag of the contact, which helps determine if the current node owns the contact (e.g. possibly using the $cluster.sh_tag pseudo-variable in order to perform the check).
- `reason` *(string)* — the reason why the binding refresh event was triggered. Possible values: "reg-refresh" - periodic refresh triggered by OpenSIPS; "ini-INVITE", "ini-SUBSCRIBE", etc. - a refresh triggered by an incoming initial SIP request; "mid-INVITE", "mid-BYE", etc. - a refresh triggered by an incoming mid-dialog SIP request
- `req_callid` *(string)* — the Call-ID of the SIP request which triggered this event, if any. This gives the ability to logically link the pending request with the current event and access useful data from that request (e.g. caller identity, dialed number, etc.). Using the req_callid, if a dialog has been created for the pending request, this dialog may be temporarily loaded inside the event_route using the load_dialog_ctx() and unload_dialog_ctx() functions of the dialog module.
### `E_UL_CONTACT_UPDATE`

This event is raised when a contact's info is updated by receiving another registration message.

**Parameters:**

- `domain` *(string)* — The name of the table.
- `aor` *(string)* — The AOR of the inserted contact.
- `uri` *(string)* — The contact URI of the inserted contact.
- `received` *(string)* — IP, port and protocol the registration message was received from. If these have the same value as the contact's address (see the address parameter) then the received parameter will be an empty string.
- `path` *(string)* — The PATH header value of the registration message.(empty string if not present)
- `qval` *(integer)* — The Q value (priority) of the contact (as integer value from 0 to 10).
- `user_agent` *(string)* — The User-Agent header value. NOTICE: Can contain spaces.
- `socket` *(string)* — The SIP socket/listener (as string) used by OpenSIPS to receive the contact registations.
- `bflags` *(integer)* — The branch flags (bflags) of the contact (in integer value of the bitmask)
- `expires` *(integer)* — The expires value of the contact (as UNIX timestamp integer).
- `callid` *(string)* — The Call-ID header of the registration message.
- `cseq` *(integer)* — The cseq number as an int value.
- `attr` *(string)* — The attributes string attached to the contact (the custom attributes attached from the script level). As this string is options, if missing in the contact, the event will push the empty string for this event field.
- `latency` *(integer)* — The latency of the last successful ping for this contact, in microseconds. Until the first ping reply for a given contact arrives, its pinging latency will be 0.
- `shtag` *(string)* — The shared tag of the contact, which helps determine if the current node owns the contact (e.g. possibly using the $cluster.sh_tag pseudo-variable in order to perform the check). NOTICE: If a contact has no shared tag attached to it, the value of this parameter will be "" (empty string)!
### `E_UL_LATENCY_UPDATE`

This event is raised when a contact pinging latency matches either of the latency_event_min_us or latency_event_min_us_delta filters. If none of these filters is set, this event will get raised for each successful contact ping operation.

**Parameters:**

- `domain` *(string)* — The name of the table.
- `aor` *(string)* — The AOR of the inserted contact.
- `uri` *(string)* — The contact URI of the inserted contact.
- `received` *(string)* — IP, port and protocol the registration message was received from. If these have the same value as the contact's address (see the address parameter) then the received parameter will be an empty string.
- `path` *(string)* — The PATH header value of the registration message.(empty string if not present)
- `qval` *(integer)* — The Q value (priority) of the contact (as integer value from 0 to 10).
- `user_agent` *(string)* — The User-Agent header value. NOTICE: Can contain spaces.
- `socket` *(string)* — The SIP socket/listener (as string) used by OpenSIPS to receive the contact registations.
- `bflags` *(integer)* — The branch flags (bflags) of the contact (in integer value of the bitmask)
- `expires` *(integer)* — The expires value of the contact (as UNIX timestamp integer).
- `callid` *(string)* — The Call-ID header of the registration message.
- `cseq` *(integer)* — The cseq number as an int value.
- `attr` *(string)* — The attributes string attached to the contact (the custom attributes attached from the script level). As this string is options, if missing in the contact, the event will push the empty string for this event field.
- `latency` *(integer)* — The latency of the last successful ping for this contact, in microseconds. Until the first ping reply for a given contact arrives, its pinging latency will be 0.
- `shtag` *(string)* — The shared tag of the contact, which helps determine if the current node owns the contact (e.g. possibly using the $cluster.sh_tag pseudo-variable in order to perform the check). NOTICE: If a contact has no shared tag attached to it, the value of this parameter will be "" (empty string)!

## Configuration Examples

### Example 1.1. Set nat_bflag parameter

Set nat_bflag parameter

```opensips
...
modparam("usrloc", "nat_bflag", "NAT_BFLAG")
...
```
### Example 1.2. Set contact_id_column parameter

Set contact_id_column parameter

```opensips
...
modparam("usrloc", "contact_id_column", "ctid")
...
```
### Example 1.3. Set user_column parameter

Set user_column parameter

```opensips
...
modparam("usrloc", "user_column", "username")
...
```
### Example 1.4. Set user_column parameter

Set user_column parameter

```opensips
...
modparam("usrloc", "domain_column", "domain")
...
```
### Example 1.5. Set contact_column parameter

Set contact_column parameter

```opensips
...
modparam("usrloc", "contact_column", "contact")
...
```
### Example 1.6. Set expires_column parameter

Set expires_column parameter

```opensips
...
modparam("usrloc", "expires_column", "expires")
...
```
### Example 1.7. Set q_column parameter

Set q_column parameter

```opensips
...
modparam("usrloc", "q_column", "q")
...
```
### Example 1.8. Set callid_column parameter

Set callid_column parameter

```opensips
...
modparam("usrloc", "callid_column", "callid")
...
```
### Example 1.9. Set cseq_column parameter

Set cseq_column parameter

```opensips
...
modparam("usrloc", "cseq_column", "cseq")
...
```
### Example 1.10. Set methods_column parameter

Set methods_column parameter

```opensips
...
modparam("usrloc", "methods_column", "methods")
...
```
### Example 1.11. Set flags_column parameter

Set flags_column parameter

```opensips
...
modparam("usrloc", "flags_column", "flags")
...
```
### Example 1.12. Set cflags_column parameter

Set cflags_column parameter

```opensips
...
modparam("usrloc", "cflags_column", "cflags")
...
```
### Example 1.13. Set user_agent_column parameter

Set user_agent_column parameter

```opensips
...
modparam("usrloc", "user_agent_column", "user_agent")
...
```
### Example 1.14. Set received_column parameter

Set received_column parameter

```opensips
...
modparam("usrloc", "received_column", "received")
...
```
### Example 1.15. Set socket_column parameter

Set socket_column parameter

```opensips
...
modparam("usrloc", "socket_column", "socket")
...
```
### Example 1.16. Set path_column parameter

Set path_column parameter

```opensips
...
modparam("usrloc", "path_column", "path")
...
```
### Example 1.17. Set sip_instance_column parameter

Set sip_instance_column parameter

```opensips
...
modparam("usrloc", "sip_instance_column", "sip_instance")
...
```
### Example 1.18. Set kv_store_column parameter

Set kv_store_column parameter

```opensips
...
modparam("usrloc", "kv_store_column", "json_data")
...
```
### Example 1.19. Set attr_column parameter

Set attr_column parameter

```opensips
...
modparam("usrloc", "attr_column", "attributes")
...
```
### Example 1.20. Set use_domain parameter

Set use_domain parameter

```opensips
...
modparam("usrloc", "use_domain", true)
...
```
### Example 1.21. Set desc_time_order parameter

Set desc_time_order parameter

```opensips
...
modparam("usrloc", "desc_time_order", 1)
...
```
### Example 1.22. Set timer_interval parameter

Set timer_interval parameter

```opensips
...
modparam("usrloc", "timer_interval", 120)
...
```
### Example 1.23. Set db_url parameter

Set db_url parameter

```opensips
...
modparam("usrloc", "db_url", "dbdriver://username:password@dbhost/dbname")
...
```
### Example 1.24. Set cachedb_url parameter

Set cachedb_url parameter

```opensips
...
modparam("usrloc", "cachedb_url", "mongodb://10.0.0.4:27017/opensipsDB.userlocation")
...
```
### Example 1.25. Set working_mode_preset parameter

Set working_mode_preset parameter

```opensips
...
modparam("usrloc", "working_mode_preset", "full-sharing-cachedb-cluster")
...
```
### Example 1.26. Set cluster_mode parameter

Set cluster_mode parameter

```opensips
...
modparam("usrloc", "cluster_mode", "federation-cachedb")
...
```
### Example 1.27. Set restart_persistency parameter

Set restart_persistency parameter

```opensips
...
modparam("usrloc", "restart_persistency", "sync-from-cluster")
...
```
### Example 1.28. Set sql_write_mode parameter

Set sql_write_mode parameter

```opensips
...
modparam("usrloc", "sql_write_mode", "write-back")
...
```
### Example 1.29. Set matching_mode parameter

Set matching_mode parameter

```opensips
...
modparam("usrloc", "matching_mode", 1)
...
```
### Example 1.30. Set cseq_delay parameter

Set cseq_delay parameter

```opensips
...
modparam("usrloc", "cseq_delay", 5)
...
```
### Example 1.31. Setting the location_cluster parameter

Setting the location_cluster parameter

```opensips
...
modparam("usrloc", "location_cluster", 1)
...
```
### Example 1.32. Setting the ha_cluster parameter

Setting the ha_cluster parameter

```opensips
...
modparam("usrloc", "ha_cluster", 4)
...
```
### Example 1.33. Setting the ha_shtag parameter

Setting the ha_shtag parameter

```opensips
...
modparam("usrloc", "ha_shtag", "vip2")
...
```
### Example 1.34. Setting the skip_replicated_db_ops parameter

Setting the skip_replicated_db_ops parameter

```opensips
...
modparam("usrloc", "skip_replicated_db_ops", 1)
...
```
### Example 1.35. Setting the max_contact_delete parameter

Setting the max_contact_delete parameter

```opensips
...
modparam("usrloc", "max_contact_delete", 10)
...
```
### Example 1.36. Set hash_size parameter

Set hash_size parameter

```opensips
...
modparam("usrloc", "hash_size", 10)
...
```
### Example 1.37. Set regen_broken_contactid parameter

Set regen_broken_contactid parameter

```opensips
...
modparam("usrloc", "regen_broken_contactid", 1)
...
```
### Example 1.38. Set latency_event_min_us parameter

Set latency_event_min_us parameter

```opensips
...
# raise an event for any 425+ ms pinging latency
modparam("usrloc", "latency_event_min_us", 425000)
...
```
### Example 1.39. Set latency_event_min_us_delta parameter

Set latency_event_min_us_delta parameter

```opensips
...
# raise an event only if a contact has pinging latency swings of 300+ ms
modparam("usrloc", "latency_event_min_us_delta", 300000)
...
```
### Example 1.40. Set pinging_mode parameter

Set pinging_mode parameter

```opensips
...
# prepare an active/backup "full-sharing" setup, with no front-end
modparam("usrloc", "pinging_mode", "ownership")
...
```
### Example 1.41. Set mi_dump_kv_store parameter

Set mi_dump_kv_store parameter

```opensips
...
# include the "KV-Store" key in all usrloc MI output
modparam("usrloc", "mi_dump_kv_store", 1)
...
```
### Example 1.42. Set contact_refresh_timer parameter

Set contact_refresh_timer parameter

```opensips
...
modparam("usrloc", "contact_refresh_timer", true)
...
```
### Example 1.43. ul_add_key usage

ul_add_key usage

```opensips
...
ul_add_key("location", "$tU@$td", "service_route", "$hdr(Service-Route)");
...
```
### Example 1.44. ul_get_key usage

ul_get_key usage

```opensips
...
if (ul_get_key("location", "$tU@$td", "service_route", $avp(service_route))) {
        append_to_reply("Service-Route: $avp(service_route)\r\n");
}
...
```
### Example 1.45. ul_del_key usage

ul_del_key usage

```opensips
...
ul_del_key("location", "$tU@$td", "service_route");
...
```
