# dns\_cache Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp100112)

2.2. [Most recently active contributors(1) to this module](#idp5584144)

**List of Examples**

1.1. [Set `cachedb_url` parameter](#idp3510576)

1.2. [Set `blacklist_timeout` parameter](#idp259360)

1.3. [Set `min_ttl` parameter](#idp249664)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This module is an implementation of a cache system designed for DNS records. For successful DNS queries of all types, the module will store in a cache/db backend the mappings, for TTL number of seconds received in the DNS answer. Failed DNS queries will also be stored in the back-end, with a TTL that can be specified by the user. The module uses the Key-Value interface exported from the core.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

A cachedb\_\* type module must be loaded before loading the dns\_cache module.

## 1.3.�Exported Parameters

### 1.3.1.�`cachedb_url` (string)

The url of the key-value back-end that will be used for storing the DNS records.

**Example�1.1.�Set `cachedb_url` parameter**

...
#use internal cachedb\_local module
modparam("dns\_cache", "cachedb\_url","local://")
#use cachedb\_memcached module with memcached server at 192.168.2.130
modparam("dns\_cache", "cachedb\_url","memcached://192.168.2.130:8888/")
...
		

  

### 1.3.2.�`blacklist_timeout` (int)

The number of seconds that a failed DNS query will be kept in cache. Default is 3600.

**Example�1.2.�Set `blacklist_timeout` parameter**

...
modparam("dns\_cache", "blacklist\_timeout",7200) # 2 hours
...
		

  

### 1.3.3.�`min_ttl` (int)

The minimum number of seconds that a DNS record will be kept in cache. If the TTL received in the DNS answer is lower than this value, the record will be cached for min\_ttl seconds.

_Default value is **0** seconds (no minimum TTL is enforced)._

**Example�1.3.�Set `min_ttl` parameter**

...
modparam("dns\_cache", "min\_ttl",300) # 5 minutes
...
		

  

## 1.4.�Exported Functions

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

15

5

1006

3

2.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

13

11

50

48

3.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

11

9

12

14

4.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

9

7

22

13

5.

Leo Smith

8

6

32

2

6.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

3

1

2

2

7.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

3

1

1

1

8.

Alexandra Titoc

2

1

2

0

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

Leo Smith

Mar 2025 - Mar 2025

2.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Jun 2012 - Dec 2024

3.

Alexandra Titoc

Sep 2024 - Sep 2024

4.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Feb 2023

5.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Mar 2014 - Apr 2021

6.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Feb 2012 - Sep 2019

7.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

8.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - May 2017

9.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

Feb 2012 - Oct 2012

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Leo Smith, Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)).

_Documentation Copyrights:_

Copyright � 2012 [www.opensips-solutions.com](http://www.opensips-solutions.com/)