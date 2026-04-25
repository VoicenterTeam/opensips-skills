# pua Module Reference
<!-- generated-from: data/3.6/modules/pua.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 pua module. Read this file when configuring or debugging the pua module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Configuration Examples](#configuration-examples)

## Overview

This module offer the internal support for OpenSIPS to act as a Presence User Agent client, by sending Subscribe and Publish messages.

Note that the module does NOT provide any functionality to be used directly from the script, but it is providing this PUA client support (via an internal API) for other event-specific modules to do PUA client operations.

Some of modules build on top of the PUA module are pua_mi, pua_usrloc, pua_dialoginfo, pua_bla and pua_xmpp. The pua_mi offer the possibility to publish any kind of information or subscribing to a resource through fifo. The pua_usrloc module calls a function exported by pua modules to publish elementary presence information, such as basic status "open" or "closed", for clients that do not implement client-to-server presence. The pua_dialoginfo provideds BLF support, by publishing the status of the participants into a call (like ringing, established, terminated). Through pua_bla , BRIDGED LINE APPEARANCE features are added to OpenSIPs. The pua_xmpp module represents a gateway between SIP and XMPP, so that jabber and SIP clients can exchange presence information.

The module use cache to store presentity list and writes to database on timer to be able to recover upon restart.

Notice: This module must not be used in no fork mode (the locking mechanism used may cause deadlock in no fork mode).

## How It Works

Starting 3.2, the module was extended with clustering support also. This means multiple OpenSIPS instance, configured with PUA module, may work together. For example, the publishing for a certain presentity may be done via different node (PUA OpenSIPS instance) in the cluster.

The clustering support is a mixture of DB sharing and OpenSIPS clustering. The OpenSIPS clustering layer is used for broadcasting notifications with the cluster when a presentity is modified by one of the nodes (so that, the other nodes in cluster may refresh the presentity via DB.

The shared DB is used by sharing between the nodes the actual presentity data. A node caches into memory only the presentities created by the node or the presentitites the node worked with. A presentity record may be loaded into memory (from DB) if the node needs to perform an operation with that presentity.

IMPORTANT: because the actual presentity data is shared between the nodes via DB (the clustering layer is used for notifications only), it is important to set a very low update interval for the DB (for data being flushed from memoryc cache into DB), to get the DB content updated as realtime as possible. See the the update_period, module parameter, with recomanded values like 2-5 seconds.

On the OpenSIPS clustering layer, the PUA module use the sharing-tags mechanism in order to control (between all the nodes in the cluster) which node is responsible for performing the expiring operation on the presentity (like sending the PUBLISH with expires 0).

## Dependencies

### OpenSIPs Modules

- `clusterer` — Required if cluster_id module parameter is set and clustering support activated
- `database modules` — Required for database operations
- `tm` — Required module

### External Libraries

- `libxml` — Required library

## Exported Parameters

### `cluster_id` (integer)

The cluster ID where the PUA data should be replicated/shared. This parameter is to be used only if clustering mode is needed. In order to understand the concept of a cluster ID, please see the _clusterer_ module. For more on PUA clustering see the [Section 1.2, “PUA clustering”](#pua_clustering "1.2. PUA clustering") chapter.

*Default value is None.*

**Example.** 10.

```opensips
modparam("pua", "cluster_id", 10)
```
### `cluster_sharing_tag` (string)

The clustering share-tag to be used by the PUA module when creating any new presentity record. The tag will by used to decide which OpenSIPS instance (owning the tag as active) will be responsible for expiring this presentity. This parameter is to be used only if clustering mode is needed. In order to understand the concept of sharing TAG, please see the _clusterer_ module. For more on PUA clustering see the [Section 1.2, “PUA clustering”](#pua_clustering "1.2. PUA clustering") chapter.

*Default value is NULL.*

**Example.** vip.

```opensips
modparam("pua", "cluster_sharing_tag", "vip")
```
### `db_table` (string)

The name of the database table.

*Default value is pua.*

**Example.** pua.

```opensips
modparam("pua", "db_table", "pua")
```
### `db_url` (string)

Database url.

*Default value is \>mysql://opensips:opensipsrw@localhost/opensips.*

**Example.** dbdriver://username:password@dbhost/dbname.

```opensips
modparam("pua", "db_url" "dbdriver://username:password@dbhost/dbname")
```
### `default_expires` (integer)

The default expires value used in case this information is not provisioned.

*Default value is 3600.*

**Example.** 3600.

```opensips
modparam("pua", "default_expires", 3600)
```
### `hash_size` (integer)

The size of the hash table used for storing Subscribe and Publish information. This parameter will be used as the power of 2 when computing table size.

*Default value is 9.*

**Example.** 11.

```opensips
modparam("pua", "hash_size", 11)
```
### `min_expires` (integer)

The inferior expires limit for both Publish and Subscribe.

*Default value is 300.*

**Example.** 0.

```opensips
modparam("pua", "min_expires", 0)
```
### `update_period` (integer)

The interval at which the information in database and hash table should be updated. In the case of the hash table updating is deleting expired messages.

*Default value is 30.*

**Notes:** IMPORTANT - if you use clustering support for this module, set a low value here, like 2-5, see the clustering chapter above.

**Example.** 100.

```opensips
modparam("pua", "update_period", 100)
```

## Exported Functions

### `pua_update_contact()`

The remote target can be updated by the Contact of a subsequent in dialog request. In the PUA watcher case (sending a SUBSCRIBE messages), this means that the remote target for the following Subscribe messages can be updated at any time by the contact of a Notify message. If this function is called on request route on receiving a Notify message, it will try to update the stored remote target.

**Return codes:**

- `1` — if success
- `-1` — if error

**Usable from:** REQUEST_ROUTE

**Example.** pua_update_contact usage.

```opensips
...
if($rm=="NOTIFY")
    pua_update_contact();
...
```

## Configuration Examples

### Set `hash_size` parameter

The size of the hash table used for storing Subscribe and Publish information.

```opensips
...
modparam("pua", "hash_size", 11)
...
```
### Set `db_url` parameter

Database url.

```opensips
...
modparam("pua", "db_url" "dbdriver://username:password@dbhost/dbname")
...
```
### Set `db_table` parameter

The name of the database table.

```opensips
...
modparam("pua", "db_table", "pua")
...
```
### Set `min_expires` parameter

The inferior expires limit for both Publish and Subscribe.

```opensips
...
modparam("pua", "min_expires", 0)
...
```
### Set `default_expires` parameter

The default expires value used in case this information is not provisioned.

```opensips
...
modparam("pua", "default_expires", 3600)
...
```
### Set `update_period` parameter

The interval at which the information in database and hash table should be updated.

```opensips
...
modparam("pua", "update_period", 100)
...
```
### Set `cluster_id` parameter

The cluster ID where the PUA data should be replicated/shared.

```opensips
...
modparam("pua", "cluster_id", 10)
...
```
### Set `cluster_sharing_tag` parameter

The clustering share-tag to be used by the PUA module when creating any new presentity record.

```opensips
...
modparam("pua", "cluster_sharing_tag", "vip")
...
```
### `pua_update_contact` usage

The remote target can be updated by the Contact of a subsequent in dialog request. In the PUA watcher case (sending a SUBSCRIBE messages), this means that the remote target for the following Subscribe messages can be updated at any time by the contact of a Notify message. If this function is called on request route on receiving a Notify message, it will try to update the stored remote target.

```opensips
...
if($rm=="NOTIFY")
    pua_update_contact();
...
```
