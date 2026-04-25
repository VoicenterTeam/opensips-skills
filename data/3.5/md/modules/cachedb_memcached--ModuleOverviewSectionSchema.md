# cachedb\_memcached Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5577456)

2.2. [Most recently active contributors(1) to this module](#idp5663840)

**List of Examples**

1.1. [Set `cachedb_url` parameter](#idp193472)

1.2. [Use memcached servers](#idp195568)

1.3. [Set `exec_threshold` parameter](#idp5570432)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This module is an implementation of a cache system designed to work with a memcached server. It uses libmemcached client library to connect to several memcached servers that store data. It uses the Key-Value interface exported from the core.

## 1.2.�Advantages

*   _memory costs are no longer on the server_
    
*   _many servers may be used so the memory is virtually unlimited_
    
*   _the cache is persistent so a restart of the server will not affect the cache_
    
*   _memcached is an open-source project so it can be used to exchange data with various other applications_
    
*   _servers may be grouped together (e.g. for security purposes : some can be inside a private network, some can be in a public one)_
    

## 1.3.�Limitations

*   _keys (in key:value pairs) may not contain spaces or control characters_
    

## 1.4.�Dependencies

### 1.4.1.�OpenSIPS Modules

None.

### 1.4.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _libmemcached:_
    
    libmemcached can be downloaded from: http://tangent.org/552/libmemcached.html. Download the archive, extract sources, run ./configure, make,sudo make install.
    
      
    ...  
    wget�http://download.tangent.org/libmemcached-0.31.tar.gz�  
    tar�-xzvf�libmemcached-0.31.tar.gz  
    cd�libmemcached-0.31  
    ./configure  
    make  
    sudo�make�install  
    ...
    

## 1.5.�Exported Parameters

### 1.5.1.�`cachedb_url` (string)

The urls of the server groups that OpenSIPS will connect to in order to use the from script cache\_store,cache\_fetch, etc operations. It can be set more than one time. The prefix part of the URL will be the identifier that will be used from the script.

**Example�1.1.�Set `cachedb_url` parameter**

...
modparam("cachedb\_memcached", "cachedb\_url","memcached:group1://localhost:9999,127.0.0.1/");
modparam("cachedb\_memcached", "cachedb\_url","memcached:y://random\_url:8888/");
...
	

  

**Example�1.2.�Use memcached servers**

...
cache\_store("memcached:group1","key","$ru value");
cache\_fetch("memcached:y","key",$avp(10));
cache\_remove("memcached:group1","key");
...
	

  

### 1.5.2.�`exec_threshold` (int)

The maximum number of microseconds that a local cache query can last. Anything above the threshold will trigger a warning message to the log

_Default value is “0 ( unlimited - no warnings )”._

**Example�1.3.�Set `exec_threshold` parameter**

...
modparam("cachedb\_memcached", "exec\_threshold", 100000)
...
	

  

### 1.5.3.�Exported Functions

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

23

13

859

63

2.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

12

10

28

16

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

12

9

71

91

4.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

7

5

5

7

5.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

4

2

3

3

6.

Juli�n Moreno Pati�o

3

1

1

1

7.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

3

1

1

1

8.

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

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Feb 2023

2.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Jan 2013 - Mar 2020

3.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Aug 2015 - Sep 2019

4.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Mar 2014 - Apr 2019

5.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

6.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - May 2017

7.

Juli�n Moreno Pati�o

Feb 2016 - Feb 2016

8.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

Oct 2011 - May 2014

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Juli�n Moreno Pati�o, Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)).

_Documentation Copyrights:_

Copyright � 2009 Andrei Dragus

Copyright � 2009 Voice Sistem SRL