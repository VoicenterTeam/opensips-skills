# mqueue Module Reference
<!-- generated-from: data/4.0/modules/mqueue.json
     generator-version: 0.1.0
     opensips-version: 4.0
     doc-type: module -->

Reference for the OpenSIPs 4.0 mqueue module. Read this file when configuring or debugging the mqueue module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Exported Pseudo-Variables](#exported-pseudo-variables)
- [Exported MI Functions](#exported-mi-functions)
- [Configuration Examples](#configuration-examples)

## Overview

The mqueue module offers a generic message queue system in shared memory for inter-process communication using the config file. One example of usage is to send time consuming operations to one or several timer processes that consumes items in the queue, without affecting SIP message handling in the socket-listening process.

There can be many defined queues. Access to queued values is done via pseudo variables.

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

None.

## Exported Parameters

### `db_url` (string)

The URL to connect to database for loading values in mqueue table at start up and/or saving values at shutdown.

*Default value is NULL (do not connect).*

**Example.** Set the `db_url` parameter.

```opensips
...
modparam("mqueue", "db_url", "mysql://opensips:opensipsrw@localhost/opensips")

# Example of table in sqlite,
# you have the set the fields to support the length according
# to the data that will be present in the mqueue
CREATE TABLE mqueue_name (
id INTEGER PRIMARY KEY AUTOINCREMENT,
key character varying(64) DEFAULT "" NOT NULL,
val character varying(4096) DEFAULT "" NOT NULL
);
...
```
### `mqueue` (string)

Definition of a memory queue

*Default value is none.*

**Notes:** Value must be a list of parameters: attr=value;...

Mandatory attributes:

* name: name of the queue.

Optional attributes:

* size: size of the queue. Specifies the maximum number of items in queue. If exceeded the oldest one is removed. If not set the queue will be limitless.
* dbmode: If set to 1, the content of the queue is written to database table when the SIP server is stopped (i.e., ensure persistency over restarts). If set to 2, it is written at shutdown but not read at startup. If set to 3, it is read at sartup but not written at shutdown. Default value is 0 (no db table interaction).
* addmode: how to add new (key,value) pairs.
    * 0: Will push all new (key,value) pairs at the end of the queue. (default)
    * 1: Will keep oldest (key,value) pair in the queue, based on the key.
    * 2: Will keep newest (key,value) pair in the queue, based on the key.

The parameter can be set many times, each holding the definition of one queue.

**Example.** Set the `mqueue` parameter.

```opensips
...
modparam("mqueue", "mqueue", "name=myq;size=20;")
modparam("mqueue", "mqueue", "name=myq;size=10000;addmode=2")
modparam("mqueue", "mqueue", "name=qaz")
modparam("mqueue", "mqueue", "name=qaz;addmode=1")
...
```

## Exported Functions

### `mq_add(queue, key, value)`

Add a new item (key, value) in the queue. If max size of queue is exceeded, the oldest one is removed.

**Parameters:**

- `key` *(string, required)* — The key of the item to add.
- `queue` *(string, required)* — The name of the queue.
- `value` *(string, required)* — The value of the item to add.

**Example.** `mq_add` usage.

```opensips
...
mq_add("myq", "$rU", "call from $fU");
...
```

### `mq_fetch(queue)`

Take oldest item from queue and fill $mqk(queue) and $mqv(queue) pseudo variables.

**Parameters:**

- `queue` *(string, required)* — The name of the queue.

**Return codes:**

- `1` — true on success
- `-1` — failure
- `-2` — no item fetched

**Example.** `mq_fetch` usage.

```opensips
...
while(mq_fetch("myq"))
{
	xlog("$mqk(myq) - $mqv(myq)\\n");
}
...
```

### `mq_pv_free(queue)`

Free the item fetched in pseudo-variables. It is optional, a new fetch frees the previous values.

**Parameters:**

- `queue` *(string, required)* — The name of the queue.

**Example.** `mq_pv_free` usage.

```opensips
...
mq_pv_free("myq");
...
```

### `mq_size(queue)`

Returns the current number of elements in the mqueue.

**Parameters:**

- `queue` *(string, required)* — The name of the queue.

**Return codes:**

- `-1` — the mqueue is empty
- `-2` — the mqueue is not found

**Example.** `mq_size` usage.

```opensips
...
$var(q_size) = mq_size("queue");
xlog("L_INFO", "Size of queue is: $var(q_size)\\n");
...
```

## Exported Pseudo-Variables

### `$mq_size(mqueue)`

The variable is read-only and returns the size of the specified mqueue.

- **Type:** integer
- **Read/write:** read-only
- **Scope:** 
### `$mqk(mqueue)`

The variable is read-only and returns the most recent item key fetched from the specified mqueue.

- **Type:** string
- **Read/write:** read-only
- **Scope:** 
### `$mqv(mqueue)`

The variable is read-only and returns the most recent item value fetched from the specified mqueue.

- **Type:** string
- **Read/write:** read-only
- **Scope:** 

## Exported MI Functions

### `mqueue:fetch`

Replaces obsolete MI command: _mq_fetch_.

Fetch one (or up to limit) key-value pair from a memory queue.

**Parameters:**

- `limit` *(integer, optional)* — if used, an array with up to _limit_ records are being returned.
- `name` *(string, required)* — the name of memory queue

**Example.** Example 1.8. `mqueue:fetch` usage

```opensips-cli
opensips-cli -x mqueue:fetch xyz
```

### `mqueue:get_size`

Replaces obsolete MI command: _mq_get_size_.

Get the size of a memory queue.

**Parameters:**

- `name` *(string, required)* — the name of memory queue

**Example.** Example 1.7. `mqueue:get_size` usage

```opensips-cli
opensips-cli -x mqueue:get_size xyz
```

### `mqueue:get_sizes`

Replaces obsolete MI command: _mq_get_sizes_.

Get the size for all memory queues.

**Example.** Example 1.9. `mqueue:get_sizes` usage

```opensips-cli
opensips-cli -x mqueue:get_sizes
```

## Configuration Examples

### Set `db_url` parameter

The URL to connect to database for loading values in mqueue table at start up and/or saving values at shutdown.

```opensips
...
modparam("mqueue", "db_url", "mysql://opensips:opensipsrw@localhost/opensips")

# Example of table in sqlite,
# you have the set the fields to support the length according
# to the data that will be present in the mqueue
CREATE TABLE mqueue_name (
id INTEGER PRIMARY KEY AUTOINCREMENT,
key character varying(64) DEFAULT "" NOT NULL,
val character varying(4096) DEFAULT "" NOT NULL
);
...
```
### Set `mqueue` parameter

Definition of a memory queue

```opensips
...
modparam("mqueue", "mqueue", "name=myq;size=20;")
modparam("mqueue", "mqueue", "name=myq;size=10000;addmode=2")
modparam("mqueue", "mqueue", "name=qaz")
modparam("mqueue", "mqueue", "name=qaz;addmode=1")
...
```
### `mq_add` usage

Add a new item (key, value) in the queue.

```opensips
...
mq_add("myq", "$rU", "call from $fU");
...
```
### `mq_fetch` usage

Take oldest item from queue and fill $mqk(queue) and $mqv(queue) pseudo variables.

```opensips
...
while(mq_fetch("myq"))
{
	xlog("$mqk(myq) - $mqv(myq)\\n");
}
...
```
### `mq_pv_free` usage

Free the item fetched in pseudo-variables.

```opensips
...
mq_pv_free("myq");
...
```
### `mq_size` usage

Returns the current number of elements in the mqueue.

```opensips
...
$var(q_size) = mq_size("queue");
xlog("L_INFO", "Size of queue is: $var(q_size)\\n");
...
```
### `mqueue:get_size` usage

Get the size of a memory queue.

```opensips
...
opensips-cli -x mqueue:get_size xyz
...
```
### `mqueue:fetch` usage

Fetch one (or up to limit) key-value pair from a memory queue.

```opensips
...
opensips-cli -x mqueue:fetch xyz
...
```
### `mqueue:get_sizes` usage

Get the size for all memory queues.

```opensips
...
opensips-cli -x mqueue:get_sizes
...
```
