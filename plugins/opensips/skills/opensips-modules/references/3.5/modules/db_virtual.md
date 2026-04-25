# db_virtual Module Reference
<!-- generated-from: data/3.5/modules/db_virtual.json
     generator-version: 0.1.0
     opensips-version: 3.5
     doc-type: module -->

Reference for the OpenSIPs 3.5 db_virtual module. Read this file when configuring or debugging the db_virtual module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported MI Functions](#exported-mi-functions)
- [Configuration Examples](#configuration-examples)

## Overview

A virtual DB will expose the same front DB api however, it will backed by many real DB. This means that a virtual DB URL translates to many real DB URLs. This virtual layer also enables us to use the real dbs in multiple ways such as: parallel, failover(hotswap) and round-robin. Therefore: each virtual DB URL with associated real dbs and a way to use(mode) it's real dbs must be specified.

## How It Works

The implemented modes are:

* FAILOVER

Use the first URL; if it fails, take the next URL and redo the operation.

* PARALLEL

Use all the URLs in the virtual DB URL set. Fails if all the URLs fail.

* ROUND (round-robin)

Use the next URL each time; if it fails, use the next one, redo operation.

When choosing the db virtual mode, be sure that there is a full compatibility between the DB operations you want to do (inserts, updates, deletes,...) and the relation (if any) between the real DB URLs you have in the set - can be completely independent, can be nodes of the same cluster, or any other combination.

For each set (or new virtual DB URL), the capabilities are automatically calculated based on the capabilities provided by the real DB URLs from the set. A logical AND is done for each cabability over all the URLs in the set. Shortly, in order for the virtual URL to provide a certain capability, ALL its real URLs must provide that capability.

Note that starting with version 2.2 db_virtual supports async_raw_query and async_raw_resume functions currently implemented only by the mysql database engine.

When an operation from a process on a real DB fails:
	it is marked (global and local CAN flag down)
	its connection closed

Later a timer process (probe):
foreach virtual db_url
	foreach real db_url
		if global CAN down
			try to connect
		if ok
			global CAN up
			close connection

Later each process:
	if local CAN down and global CAN up
		if db_max_consec_retrys *
			try to connect
	if ok
		local CAN up

Note *: there could be inconsistencies between the probe and each process so a retry limit is in order. It is reset and ignored by an MI command.

The timer process(probe) is a process that tries to reconnect to failed dbs from time to time. It is a separate process so that when it blocks (for a timeout on the connection) it doesn't matter.

## Dependencies

### OpenSIPs Modules

- `At least one real DB module`

### External Libraries

None.

## Exported Parameters

### `db_max_consec_retrys` (integer)

After the timer process has reported that it can connect to the real db, other processes will try to reconnect to it. There are cases where although the probe could connect some might fail. This parameter represents the number of consecutive failed retries that a process will do before it gives up. This value is reset and suppressed by a MI function(db\_set).

*Default value is 10 (10 consecutive times).*

**Example.** 20.

```opensips
modparam("db\_virtual", "db\_max\_consec\_retrys", 20)
```
### `db_probe_time` (integer)

Time interval after which a registered timer process attempts to check failed(as reported by other processes) connections to real dbs. The probe will connect and disconnect to the failed real DB and announce others.

*Default value is 10 (10 sec).*

**Example.** 20.

```opensips
modparam("db\_virtual", "db\_probe\_time", 20)
```
### `db_urls` (string)

Multiple value parameter used for virtual DB URLs declaration.

**Example.** define set1 PARALLEL.

```opensips
modparam("group","db\_url","virtual://set1")
modparam("presence|presence\_xml", "db\_url","virtual://set2")

modparam("db\_virtual", "db\_urls", "define set1 PARALLEL")
modparam("db\_virtual", "db\_urls", "mysql://opensips:opensipsrw@localhost/testa")
modparam("db\_virtual", "db\_urls", "postgres://opensips:opensipsrw@localhost/opensips")

modparam("db\_virtual", "db\_urls", "define set2 FAILOVER")
modparam("db\_virtual", "db\_urls", "mysql://opensips:opensipsrw@localhost/testa")
```

## Exported MI Functions

### `db_get`

Return information about global state of the real dbs.

**Example.** MI FIFO Command Format

```opensips-cli
opensips-cli -x mi db\_get
```

### `db_set`

Sets the permissions for real dbs access per set per db. Sets the reconnect reset flag.

**Parameters:**

- `db_url_index` *(int, required)* — the third URL in the fourth set(must exist)
- `ignore_retries` *(boolean, optional)* — reset and suppress db_max_consec_trys
- `may_use_db_flag` *(boolean, required)* — processes are not allowed to use that URL
- `set_index` *(int, required)* — the fourth set (must exist)

**Example.** db_set 3 2 0 1 means: 3 - the fourth set (must exist) 2 - the third URL in the fourth set(must exist) 0 - processes are not allowed to use that URL 1 - reset and suppress db_max_consec_trys

```opensips-cli
opensips-cli -x mi db\_set 3 2 0 1
```

## Configuration Examples

### Set `db_urls` parameter

Multiple value parameter used for virtual DB URLs declaration.

```opensips
...
modparam("group","db\_url","virtual://set1")
modparam("presence|presence\_xml", "db\_url","virtual://set2")

modparam("db\_virtual", "db\_urls", "define set1 PARALLEL")
modparam("db\_virtual", "db\_urls", "mysql://opensips:opensipsrw@localhost/testa")
modparam("db\_virtual", "db\_urls", "postgres://opensips:opensipsrw@localhost/opensips")

modparam("db\_virtual", "db\_urls", "define set2 FAILOVER")
modparam("db\_virtual", "db\_urls", "mysql://opensips:opensipsrw@localhost/testa")
...
```
### Set `db_probe_time` parameter

Time interval after which a registered timer process attempts to check failed(as reported by other processes) connections to real dbs. The probe will connect and disconnect to the failed real DB and announce others.

```opensips
...
modparam("db\_virtual", "db\_probe\_time", 20)
...
```
### Set `db_max_consec_retrys` parameter

After the timer process has reported that it can connect to the real db, other processes will try to reconnect to it. There are cases where although the probe could connect some might fail. This parameter represents the number of consecutive failed retries that a process will do before it gives up.

```opensips
...
modparam("db\_virtual", "db\_max\_consec\_retrys", 20)
...
```
