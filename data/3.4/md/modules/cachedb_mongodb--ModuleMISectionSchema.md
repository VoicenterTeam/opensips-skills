# cachedb\_mongodb Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5572864)

2.2. [Most recently active contributors(1) to this module](#idp5672320)

**List of Examples**

1.1. [Runtime requirements for "cachedb\_mongodb"](#idp164976)

1.2. [Compilation requirements for "cachedb\_mongodb"](#idp167168)

1.3. [Set `cachedb_url` parameter](#idp5515424)

1.4. [Reference MongoDB connections](#idp5520272)

1.5. [Set `exec_threshold` parameter](#idp5525024)

1.6. [Setting the `compat_mode_2.4` parameter](#idp5530656)

1.7. [Setting the `compat_mode_3.0` parameter](#idp5536288)

1.8. [MongoDB Raw Insert](#idp5542816)

1.9. [MongoDB Raw Update](#idp5544512)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This module is an implementation of a cache system designed to work with MongoDB servers. It implements the Key-Value interface exposed by the OpenSIPS core.

The underlying client library is compatible with any of the following MongoDB server versions: 2.4, 2.6, 3.0, 3.2 and 3.4, as stated in [the MongoDB documentation](https://docs.mongodb.com/ecosystem/drivers/driver-compatibility-reference/).

## 1.2.�Advantages

*   _memory costs are no longer on the server_
    
*   _many servers can be used inside a cluster, so the memory is virtually unlimited_
    
*   _the cache is 100% persistent. A restart of OpenSIPS server will not affect the DB. The MongoDB is also persistent so it can also be restarted without loss of information._
    
*   _MongoDB is an open-source project so it can be used to exchange data with various other applications_
    
*   _By creating a MongoDB Cluster, multiple OpenSIPS instances can easily share key-value information_
    
*   _This module also implements the CacheDB Raw query capability, thus you can run whatever query that the MongoDB back-end supports, taking full advatange of it._
    

## 1.3.�Limitations

*   _keys (in key:value pairs) may not contain spaces or control characters_
    

## 1.4.�Dependencies

### 1.4.1.�OpenSIPS Modules

None.

### 1.4.2.�External Libraries or Applications

The following packages must be installed before running OpenSIPS with this module loaded:

**Example�1.1.�Runtime requirements for "cachedb\_mongodb"**

\# Debian / Ubuntu
sudo apt-get install libjson-c2 libmongoc-1.0

# Red Hat / CentOS
sudo yum install json-c mongo-c-driver
				

  

The following packages are required in order to compile this module:

**Example�1.2.�Compilation requirements for "cachedb\_mongodb"**

\# Debian / Ubuntu
sudo apt-get install libjson-c-dev libmongoc-dev libbson-dev

# Red Hat / CentOS
sudo yum install json-c-devel mongo-c-driver-devel
				

  

## 1.5.�Exported Parameters

### 1.5.1.�`cachedb_url` (string)

The URLs of the server groups that OpenSIPS will connect to in order to allow the cache\_store(), cache\_fetch(), etc. functions to be used from the OpenSIPS script. It can be set more than one time. The prefix part of the URL will be the identifier that will be used from the script.

The URL syntax is identical to the one used by MongoDB, including connect string options. For more info, please refer to [the official MongoDB connect string documentation](https://docs.mongodb.com/manual/reference/connection-string/).

**Example�1.3.�Set `cachedb_url` parameter**

...
# Connect to a single _mongod_ instance
modparam("cachedb\_mongodb", "cachedb\_url",
         "mongodb://localhost:27017/opensipsDB.dialog")

# Connect to a _mongod_ replica set
modparam("cachedb\_mongodb", "cachedb\_url",
         "mongodb://10.0.0.10,10.0.0.11:27017/opensipsDB.dialog?replicaSet=my-set")

# Connect to a _mongos_ instance (routes to a sharded cluster)
modparam("cachedb\_mongodb", "cachedb\_url",
         "mongodb://localhost/opensipsDB.dialog")

# Example of multiple connections:
#   \* to a main _mongos_, with failover to a backup _mongos_
#   \* to a single _mongod_
modparam("cachedb\_mongodb", "cachedb\_url",
         "mongodb:cluster://localhost,10.0.0.10:27017/opensipsDB.dialog")
modparam("cachedb\_mongodb", "cachedb\_url",
         "mongodb://localhost:27017/opensipsDB.userlocation")
...
	

  

**Example�1.4.�Reference MongoDB connections**

...
cache\_store("mongodb", "key", "$ru value");
cache\_remove("mongodb:cluster", "key");
cache\_fetch("mongodb:instance1", "key", $avp(10));
...
	

  

### 1.5.2.�`exec_threshold` (int)

The maximum number of microseconds that a mongodb query can last. Anything above the threshold will trigger a warning message to the log

_Default value is “0 ( unlimited - no warnings )”._

**Example�1.5.�Set `exec_threshold` parameter**

...
modparam("cachedb\_mongodb", "exec\_threshold", 100000)
...
	

  

### 1.5.3.�`compat_mode_2.4` (int)

Switch the module into compatibility mode for MongoDB 2.4 servers. Specifically, this allows "insert/update/delete" raw queries to not fail, since they were introduced in MongoDB 2.6. The module will interpret the raw query JSON, convert it to its corresponding command and run it.

Caveat: only the minimally required raw query options are supported in this mode.

_Default value is “0 (disabled)”._

**Example�1.6.�Setting the `compat_mode_2.4` parameter**

...
modparam("cachedb\_mongodb", "compat\_mode\_2.4", 1)
...
	

  

### 1.5.4.�`compat_mode_3.0` (int)

Switch the module into compatibility mode for MongoDB 2.6/3.0 servers. Specifically, this allows "find" raw queries to not fail, since they were introduced in MongoDB 3.2. The module will interpret the "find" raw query JSON, convert it to its corresponding command and run it.

Caveat: only the minimally required options for "find" raw queries are supported in this mode.

_Default value is “0 (disabled)”._

**Example�1.7.�Setting the `compat_mode_3.0` parameter**

...
modparam("cachedb\_mongodb", "compat\_mode\_3.0", 1)
...
	

  

## 1.6.�Exported Functions

The module does not export functions to be used in configuration script.

## 1.7.�Raw Query Syntax

The cachedb\_mongodb module supports raw queries, thus taking full advantage of the capabilities of the back-end, including query-specific options such as read/write preference, timeouts, filtering options, etc.

The query syntax is identical to the mongo cli. Documentation for it can be found on the [MongoDB website](https://docs.mongodb.com/manual/reference/command/nav-crud/). Query results are returned as JSON documents, that one can further process in the OpenSIPS script by using the JSON module.

Some example raw queries:

**Example�1.8.�MongoDB Raw Insert**

...
cache\_raw\_query("mongodb:cluster", "{ \\
    \\"insert\\": \\"ip\_blacklist\\", \\
    \\"documents\\": \[{ \\
        \\"username\\": \\"$fU\\", \\
        \\"ip\\": \\"$si\\", \\
        \\"attempts\\": 1 \\
     }\]}",
 "$avp(out)");
xlog("INSERT RAW QUERY returned $rc, output: '$avp(out)'\\n");
...
			

  

**Example�1.9.�MongoDB Raw Update**

...
cache\_raw\_query("mongodb:cluster", "{ \\
    \\"update\\": \\"ip\_blacklist\\", \\
    \\"updates\\": \[{ \\
        \\"q\\": { \\
            \\"username\\": \\"$fU\\", \\
            \\"ip\\": \\"$si\\" \\
         }, \\
        \\"u\\": { \\
            \\"$$inc\\": {\\"attempts\\": 1} \\
         } \\
      }\]}",
 "$avp(out)");
xlog("UPDATE RAW QUERY returned $rc, output: '$avp(out)'\\n");
...
			

  

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

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

152

82

2920

2758

2.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

36

10

3018

50

3.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

12

10

30

26

4.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

10

8

92

16

5.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

6

4

96

11

6.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

6

4

5

7

7.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

4

2

9

5

8.

Dan Pascu ([@danpascu](https://github.com/danpascu))

4

2

4

4

9.

Alessio Garzi ([@Ozzyboshi](https://github.com/Ozzyboshi))

4

2

2

2

10.

[@jalung](https://github.com/jalung)

3

1

97

56

  

**All remaining contributors**: Maksym Sobolyev ([@sobomax](https://github.com/sobomax)), Juli�n Moreno Pati�o.

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 2.2.�By Commit Activity

**Table�2.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jan 2026

2.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Oct 2014 - Nov 2025

3.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

Jan 2013 - Aug 2024

4.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Feb 2023

5.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Mar 2014 - Jul 2021

6.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - May 2021

7.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Aug 2015 - Dec 2020

8.

Alessio Garzi ([@Ozzyboshi](https://github.com/Ozzyboshi))

Nov 2019 - Dec 2019

9.

Dan Pascu ([@danpascu](https://github.com/danpascu))

May 2019 - May 2019

10.

[@jalung](https://github.com/jalung)

Aug 2017 - Aug 2017

  

**All remaining contributors**: Juli�n Moreno Pati�o, Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)).

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Juli�n Moreno Pati�o, Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)).

_Documentation Copyrights:_

Copyright � 2013-2017 [www.opensips-solutions.com](http://www.opensips-solutions.com/)