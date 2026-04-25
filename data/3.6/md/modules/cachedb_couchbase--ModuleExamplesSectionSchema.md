# cachedb\_couchbase Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp258608)

2.2. [Most recently active contributors(1) to this module](#idp5627424)

**List of Examples**

1.1. [Set `cachedb_url` parameter](#idp3195568)

1.2. [Set `timeout` parameter](#idp4347136)

1.3. [Set `exec_threshold` parameter](#idp2330624)

1.4. [Set `lazy_connect` parameter](#idp5226192)

1.5. [Use CouchBase servers](#idp4000720)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This module is an implementation of a cache system designed to work with a Couchbase server. It uses the libcouchbase client library to connect to the server instance, It uses the Key-Value interface exported from the core.

## 1.2.�Advantages

*   _memory costs are no longer on the server_
    
*   _many servers can be used inside a cluster, so the memory is virtually unlimited_
    
*   _the cache is 100% persistent. A restart of OpenSIPS server will not affect the DB. The CouchBase DB is also persistent so it can also be restarted without loss of information._
    
*   _CouchBase is an open-source project so it can be used to exchange data with various other applications_
    
*   _By creating a CouchBase Cluster, multiple OpenSIPS instances can easily share key-value information_
    

## 1.3.�Limitations

*   _keys (in key:value pairs) may not contain spaces or control characters_
    

## 1.4.�Dependencies

### 1.4.1.�OpenSIPS Modules

None.

### 1.4.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _libcouchbase >= 3.0:_
    
    libcoucbase can be downloaded from http://www.couchbase.com/develop/c/current
    

## 1.5.�Exported Parameters

### 1.5.1.�`cachedb_url` (string)

The urls of the server groups that OpenSIPS will connect to in order to use the from script cache\_store,cache\_fetch, etc operations. It can be set more than one time. The prefix part of the URL will be the identifier that will be used from the script. The format of the URL is couchbase\[:identifier\]://\[username:password@\]IP:Port/bucket\_name

**Example�1.1.�Set `cachedb_url` parameter**

...
modparam("cachedb\_couchbase", "cachedb\_url","couchbase:group1://localhost:6379/default")
modparam("cachedb\_couchbase", "cachedb\_url","couchbase:cluster1://random\_url:8888/my\_bucket")
# Multiple hosts
modparam("cachedb\_couchbase", "cachedb\_url","couchbase:cluster1://random\_url1:8888,random\_url2:8888,random\_url3:8888/my\_bucket")
...
	

  

### 1.5.2.�`timeout` (int)

The max duration in microseconds that a couchbase op is expected to last. Default is 3000000 ( 3 seconds )

**Example�1.2.�Set `timeout` parameter**

...
modparam("cachedb\_couchbase", "timeout",5000000);
...
	

  

### 1.5.3.�`exec_threshold` (int)

The maximum number of microseconds that a couchbase query can last. Anything above the threshold will trigger a warning message to the log

_Default value is “0 ( unlimited - no warnings )”._

**Example�1.3.�Set `exec_threshold` parameter**

...
modparam("cachedb\_couchbase", "exec\_threshold", 100000)
...
	

  

### 1.5.4.�`lazy_connect` (int)

Delay connecting to a bucket until the first time it is used. Connecting to many buckets at startup can be time consuming. This option allows for faster startup by delaying connections until they are needed. This option can be dangerous for untested bucket configurations/settings. Always test first without lazy\_connect. This option will show errors in the log during the first access made to a bucket. Default is 0 ( Connect to all buckets on startup )

**Example�1.4.�Set `lazy_connect` parameter**

...
modparam("cachedb\_couchbase", "lazy\_connect", 1);
...
	

  

**Example�1.5.�Use CouchBase servers**

...
cache\_store("couchbase:group1","key","$ru value");
cache\_fetch("couchbase:cluster1","key",$avp(10));
cache\_remove("couchbase:cluster1","key");
...
	

  

### 1.5.5.�Exported Functions

The module does not export functions to be used in configuration script.

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

21

8

1146

151

2.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

17

11

206

238

3.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

11

9

101

20

4.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

10

7

96

89

5.

Ryan Bullock ([@rrb3942](https://github.com/rrb3942))

6

2

230

87

6.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

5

3

3

5

7.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

4

2

3

3

8.

Juli�n Moreno Pati�o

3

1

1

1

9.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

2

1

1

0

  

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

Aug 2015 - Mar 2025

2.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Feb 2023

3.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jan 2021

4.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Oct 2014 - Mar 2020

5.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Mar 2014 - Apr 2019

6.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - May 2017

7.

Juli�n Moreno Pati�o

Feb 2016 - Feb 2016

8.

Ryan Bullock ([@rrb3942](https://github.com/rrb3942))

Oct 2013 - Jun 2015

9.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

Jan 2013 - May 2014

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Juli�n Moreno Pati�o, Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)), Ryan Bullock ([@rrb3942](https://github.com/rrb3942)).

_Documentation Copyrights:_

Copyright � 2013 [www.opensips-solutions.com](http://www.opensips-solutions.com/)