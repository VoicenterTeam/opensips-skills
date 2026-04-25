# cachedb\_redis Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5634048)

2.2. [Most recently active contributors(1) to this module](#idp5732896)

**List of Examples**

1.1. [Set `cachedb_url` parameter](#idp3472480)

1.2. [Use Redis servers](#idp2149168)

1.3. [Set `connect_timeout` parameter](#idp4100192)

1.4. [Set `connect_timeout` parameter](#idp4308496)

1.5. [Set the `shutdown_on_error` parameter](#idp4157040)

1.6. [Set the `use_tls` parameter](#idp1509056)

1.7. [Redis Raw Query Examples](#idp4072736)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This module is an implementation of a cache system designed to work with a Redis server. It uses hiredis client library to connect to either a single Redis server instance, or to a Redis Server inside a Redis Cluster. It uses the Key-Value interface exported from the core.

## 1.2.�Advantages

*   _memory costs are no longer on the server_
    
*   _many servers can be used inside a cluster, so the memory is virtually unlimited_
    
*   _the cache is 100% persistent. A restart of OpenSIPS server will not affect the DB. The Redis DB is also persistent so it can also be restarted without loss of information._
    
*   _redis is an open-source project so it can be used to exchange data with various other applications_
    
*   _By creating a Redis Cluster, multiple OpenSIPS instances can easily share key-value information_
    

## 1.3.�Limitations

*   _keys (in key:value pairs) may not contain spaces or control characters_
    

## 1.4.�Dependencies

### 1.4.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _If a [use\_tls](#param_use_tls "1.5.5.�use_tls (integer)") is defined, the **tls\_mgm** module will need to be loaded as well_.
    

### 1.4.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _hiredis:_
    
    On the latest Debian based distributions, hiredis can be installed by running 'apt-get install libhiredis-dev' Alternatively, if hiredis is not available on your OS repos, hiredis can be downloaded from: https://github.com/antirez/hiredis . Download the archive, extract sources, run make,sudo make install.
    
    If TLS connections are enabled via the [use\_tls](#param_use_tls "1.5.5.�use_tls (integer)") modparam, _hiredis_ needs to be compiled with TLS support.
    

## 1.5.�Exported Parameters

### 1.5.1.�`cachedb_url` (string)

The URLs of the server groups that OpenSIPS will connect to in order to use, from script, the cache\_store(), cache\_fetch(), etc. operations. It may be set more than once. The prefix part of the URL will be the identifier that will be used from the script.

**Example�1.1.�Set `cachedb_url` parameter**

...
# single-instance URLs (Redis Server or Redis Cluster)
modparam("cachedb\_redis", "cachedb\_url", "redis:group1://localhost:6379/")
modparam("cachedb\_redis", "cachedb\_url", "redis:cluster1://random\_url:8888/")

# multi-instance URL (will perform circular **failover** on each query)
modparam("cachedb\_redis", "cachedb\_url",
	"redis:ha://localhost,host\_a:6380,host\_b:6381,host\_c/")
...
		

  

**Example�1.2.�Use Redis servers**

...
cache\_store("redis:group1", "key", "$ru value");
cache\_fetch("redis:cluster1", "key", $avp(10));
cache\_remove("redis:cluster1", "key");
...
		

  

### 1.5.2.�`connect_timeout` (integer)

This parameter specifies how many milliseconds OpenSIPS should wait for connecting to a Redis node.

_Default value is “5000 ms”._

**Example�1.3.�Set `connect_timeout` parameter**

...
# wait 1 seconds for Redis to connect
modparam("cachedb\_redis", "connect\_timeout",1000)
...
		

  

### 1.5.3.�`query_timeout` (integer)

This parameter specifies how many milliseconds OpenSIPS should wait for a query response from a Redis node.

_Default value is “5000 ms”._

**Example�1.4.�Set `connect_timeout` parameter**

...
# wait 1 seconds for Redis queries
modparam("cachedb\_redis", "query\_timeout",1000)
...
		

  

### 1.5.4.�`shutdown_on_error` (integer)

By setting this parameter to 1, OpenSIPS will abort startup if the initial connection to Redis is not possible. Runtime reconnect behavior is unaffected by this parameter, and is always enabled.

_Default value is “0” (disabled)._

**Example�1.5.�Set the `shutdown_on_error` parameter**

...
# abort OpenSIPS startup if Redis is down
modparam("cachedb\_redis", "shutdown\_on\_error", 1)
...
		

  

### 1.5.5.�`use_tls` (integer)

Setting this parameter will allow you to use TLS for Redis connections. In order to enable TLS for a specific connection, you can use the "tls\_domain=_dom\_name_" URL parameter in the cachedb\_url of this module (or other modules that use the CacheDB interface). This should be placed at the end of the URL after the '?' character.

When using this parameter, you must also ensure that _tls\_mgm_ is loaded and properly configured. Refer to the the module for additional info regarding TLS client domains.

Note that TLS is supported by Redis starting with version 6.0. Also, it is an optional feature enabled at compile time and might not be included in the standard Redis packages available for your OS.

_Default value is **0** (not enabled)_

**Example�1.6.�Set the `use_tls` parameter**

...
modparam("tls\_mgm", "client\_domain", "redis")
modparam("tls\_mgm", "certificate", "\[redis\]/etc/pki/tls/certs/redis.pem")
modparam("tls\_mgm", "private\_key", "\[redis\]/etc/pki/tls/private/redis.key")
modparam("tls\_mgm", "ca\_list",     "\[redis\]/etc/pki/tls/certs/ca.pem")
...
modparam("cachedb\_redis", "use\_tls", 1)
modparam("cachedb\_redis", "cachedb\_url","redis://localhost:6379/?tls\_domain=redis")
...

  

## 1.6.�Exported Functions

The module does not export functions to be used in configuration script.

## 1.7.�Raw Query Syntax

The cachedb\_redis module allows to run RAW queries, thus taking full advantage of the capabilities of the back-end. The query syntax is the typical REDIS one.

Here are a couple examples of running some Redis queries :

**Example�1.7.�Redis Raw Query Examples**

...
	$var(my\_hash) = "my\_hash\_name";
	$var(my\_key) = "my\_key\_name";
	$var(my\_value) = "my\_key\_value";
	cache\_raw\_query("redis","HSET $var(my\_hash) $var(my\_key) $var(my\_value)");
	cache\_raw\_query("redis","HGET $var(my\_hash) $var(my\_key)","$avp(result)");
	xlog("We have fetched $avp(result) \\n");
...
	$var(my\_hash) = "my\_hash\_name";
	$var(my\_key1) = "my\_key1\_name";
	$var(my\_key2) = "my\_key2\_name";
	$var(my\_value1) = "my\_key1\_value";
	$var(my\_value2) = "my\_key2\_value";
	cache\_raw\_query("redis","HSET $var(my\_hash) $var(my\_key1) $var(my\_value1)");
	cache\_raw\_query("redis","HSET $var(my\_hash) $var(my\_key2) $var(my\_value2)");
	cache\_raw\_query("redis","HGETALL $var(my\_hash)","$avp(result)");

	$var(it) = 0;
	while ($(avp(result\_final)\[$var(it)\]) != NULL) {
		xlog("Multiple key reply: - we have fetched $(avp(result\_final)\[$var(it)\]) \\n");
		$var(it) = $var(it) + 1;
	}
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

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

33

19

1446

50

2.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

29

19

558

277

3.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

16

13

130

35

4.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

12

6

595

38

5.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

7

5

7

5

6.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

6

4

7

7

7.

jalung

4

1

144

61

8.

Dan Pascu ([@danpascu](https://github.com/danpascu))

3

1

15

15

9.

Ezequiel Lovelle

3

1

11

4

10.

John Burke ([@john08burke](https://github.com/john08burke))

3

1

6

1

  

**All remaining contributors**: tcresson, Juli�n Moreno Pati�o, Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), zhengsh, Jarrod Baumann ([@jarrodb](https://github.com/jarrodb)), Kristian H�gh.

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 2.2.�By Commit Activity

**Table�2.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

Oct 2011 - Nov 2024

2.

tcresson

Oct 2023 - Oct 2023

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Mar 2014 - Oct 2023

4.

zhengsh

Aug 2023 - Aug 2023

5.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Feb 2023

6.

John Burke ([@john08burke](https://github.com/john08burke))

Apr 2022 - Apr 2022

7.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Jan 2022

8.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Oct 2014 - Mar 2020

9.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Feb 2012 - Sep 2019

10.

Dan Pascu ([@danpascu](https://github.com/danpascu))

May 2019 - May 2019

  

**All remaining contributors**: Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Kristian H�gh, Juli�n Moreno Pati�o, Jarrod Baumann ([@jarrodb](https://github.com/jarrodb)), jalung, Ezequiel Lovelle.

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Juli�n Moreno Pati�o, Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)).

## Chapter�4.�Frequently Asked Questions

**4.1.**

My OpenSIPS is occasionally crashing in libhiredis, what to do?

Make sure you've upgraded the Redis "libhiredis" client library to at least version 0.14.1. There was at least one significant vulnerability reported in library versions prior to that one ([CVE-2020-7105](https://bugzilla.redhat.com/show_bug.cgi?id=CVE-2020-7105)), so upgrading to latest stable may very well fix the crash!

_Documentation Copyrights:_

Copyright � 2011 [www.opensips-solutions.com](http://www.opensips-solutions.com/)