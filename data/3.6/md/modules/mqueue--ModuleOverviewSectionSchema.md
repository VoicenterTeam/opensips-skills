# mqueue Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5650992)

2.2. [Most recently active contributors(1) to this module](#idp5718736)

**List of Examples**

1.1. [Set `db_url` parameter](#idp2692928)

1.2. [Set `mqueue` parameter](#idp171392)

1.3. [`mq_add` usage](#idp5569232)

1.4. [`mq_fetch` usage](#idp5573872)

1.5. [`mq_pv_free` usage](#idp5578144)

1.6. [`mq_size` usage](#idp5582800)

1.7. [`mq_get_size` usage](#idp5589216)

1.8. [`mq_fetch` usage](#idp5595424)

1.9. [`mq_get_sizes` usage](#idp5599328)

## Chapter�1.�Admin Guide

## 1.1.�Overview

The mqueue module offers a generic message queue system in shared memory for inter-process communication using the config file. One example of usage is to send time consuming operations to one or several timer processes that consumes items in the queue, without affecting SIP message handling in the socket-listening process.

There can be many defined queues. Access to queued values is done via pseudo variables.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _None_.
    

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _None_.
    

## 1.3.�Exported Parameters

### 1.3.1.�`db_url` (str)

The URL to connect to database for loading values in mqueue table at start up and/or saving values at shutdown.

_Default value is NULL (do not connect)._

**Example�1.1.�Set `db_url` parameter**

...
modparam("mqueue", "db\_url", "mysql://opensips:opensipsrw@localhost/opensips")

# Example of table in sqlite,
# you have the set the fields to support the length according
# to the data that will be present in the mqueue
CREATE TABLE mqueue\_name (
id INTEGER PRIMARY KEY AUTOINCREMENT,
key character varying(64) DEFAULT "" NOT NULL,
val character varying(4096) DEFAULT "" NOT NULL
);
...

  

### 1.3.2.�`mqueue` (string)

Definition of a memory queue

_Default value is “none”._

Value must be a list of parameters: attr=value;...

*   Mandatory attributes:
    
    *   _name_: name of the queue.
        
    
*   Optional attributes:
    
    *   _size_: size of the queue. Specifies the maximum number of items in queue. If exceeded the oldest one is removed. If not set the queue will be limitless.
        
    *   _dbmode_: If set to 1, the content of the queue is written to database table when the SIP server is stopped (i.e., ensure persistency over restarts). If set to 2, it is written at shutdown but not read at startup. If set to 3, it is read at sartup but not written at shutdown. Default value is 0 (no db table interaction).
        
    *   _addmode_: how to add new (key,value) pairs.
        
        *   _0_: Will push all new (key,value) pairs at the end of the queue. (default)
            
        *   _1_: Will keep oldest (key,value) pair in the queue, based on the key.
            
        *   _2_: Will keep newest (key,value) pair in the queue, based on the key.
            
        
    

The parameter can be set many times, each holding the definition of one queue.

**Example�1.2.�Set `mqueue` parameter**

...
modparam("mqueue", "mqueue", "name=myq;size=20;")
modparam("mqueue", "mqueue", "name=myq;size=10000;addmode=2")
modparam("mqueue", "mqueue", "name=qaz")
modparam("mqueue", "mqueue", "name=qaz;addmode=1")
...

  

## 1.4.�Exported Functions

### 1.4.1.� `mq_add(queue, key, value)`

Add a new item (key, value) in the queue. If max size of queue is exceeded, the oldest one is removed.

**Example�1.3.�`mq_add` usage**

...
mq\_add("myq", "$rU", "call from $fU");
...

  

### 1.4.2.� `mq_fetch(queue)`

Take oldest item from queue and fill $mqk(queue) and $mqv(queue) pseudo variables.

Return: true on success (1); false on failure (-1) or no item fetched (-2).

**Example�1.4.�`mq_fetch` usage**

...
while(mq\_fetch("myq"))
{
	xlog("$mqk(myq) - $mqv(myq)\\n");
}
...

  

### 1.4.3.� `mq_pv_free(queue)`

Free the item fetched in pseudo-variables. It is optional, a new fetch frees the previous values.

**Example�1.5.�`mq_pv_free` usage**

...
mq\_pv\_free("myq");
...

  

### 1.4.4.� `mq_size(queue)`

Returns the current number of elements in the mqueue.

If the mqueue is empty, the function returns -1. If the mqueue is not found, the function returns -2.

**Example�1.6.�`mq_size` usage**

...
$var(q\_size) = mq\_size("queue");
xlog("L\_INFO", "Size of queue is: $var(q\_size)\\n");
...

  

## 1.5.�Exported MI Functions

### 1.5.1.�mq\_get\_size

Get the size of a memory queue.

Parameters:

*   _name_ - the name of memory queue

**Example�1.7.�`mq_get_size` usage**

...
opensips-cli -x mq\_get\_size xyz
...

  

### 1.5.2.�mq\_fetch

Fetch one (or up to limit) key-value pair from a memory queue.

Parameters:

*   _name_ - the name of memory queue
*   _limit_ (optional) - if used, an array with up to _limit_ records are being returned.

**Example�1.8.�`mq_fetch` usage**

...
opensips-cli -x mq\_fetch xyz
...

  

### 1.5.3.�mq\_get\_sizes

Get the size for all memory queues.

Parameters: none

**Example�1.9.�`mq_get_sizes` usage**

...
opensips-cli -x mq\_get\_sizes
...

  

## 1.6.�Exported Pseudo-Variables

### 1.6.1.�`$mqk(mqueue)`

The variable is read-only and returns the most recent item key fetched from the specified mqueue.

### 1.6.2.�`$mqv(mqueue)`

The variable is read-only and returns the most recent item value fetched from the specified mqueue.

### 1.6.3.�`$mq_size(mqueue)`

The variable is read-only and returns the size of the specified mqueue.

## Chapter�2.�Contributors

## 2.1.�By Commit Statistics

**Table�2.1.�Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)**

�

Name

DevScore

Commits

Lines ++

Lines --

1.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

19

2

1843

34

2.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

3

1

75

16

3.

Alexandra Titoc

3

1

13

9

  

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 2.2.�By Commit Activity

**Table�2.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Feb 2025 - Feb 2025

2.

Alexandra Titoc

Sep 2024 - Sep 2024

3.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

Feb 2024 - Feb 2024

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)).

_Documentation Copyrights:_

Copyright � 2010 Elena-Ramona Modroiu

Copyright � 2018-2020 Julien chavanton, Flowroute

Copyright � 2024 Ovidiu Sas, [VoIP Embedded, Inc.](http://www.voipembedded.com)