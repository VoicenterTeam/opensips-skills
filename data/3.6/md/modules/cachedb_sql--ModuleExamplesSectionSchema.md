# cachedb\_sql Module

---

**List of Tables**

3.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5556352)

3.2. [Most recently active contributors(1) to this module](#idp5658992)

**List of Examples**

1.1. [Set `db_url` parameter](#idp164992)

1.2. [Usage example](#idp167008)

1.3. [Set `db_url` parameter](#idp170992)

1.4. [Set `key_column` parameter](#idp5515728)

1.5. [Set `value_column` parameter](#idp5519392)

1.6. [Set `counter_column` parameter](#idp5523056)

1.7. [Set `expires_column` parameter](#idp5526720)

1.8. [Set `cache_clean_period` parameter](#idp5530528)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This module is an implementation of a cache system designed to work with a regular SQL-based server. It uses the internal DB interface to connect to the back-end, and also implements the Key-Value interface exported from the core.

## 1.2.�Advantages

*   _memory costs are no longer on the server_
    
*   _the cache is 100% persistent. A restart of OpenSIPS server will not affect the DB. The DB is also persistent so it can also be restarted without loss of information._
    
*   _Multiple OpenSIPS instances can easily share key-value information via a regular SQL-based database_
    

## 1.3.�Limitations

*   _The module's counter operations ( ADD and SUB ) are currently only supported by MySQL_
    

## 1.4.�Dependencies

### 1.4.1.�OpenSIPS Modules

None.

### 1.4.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _none:_
    

## 1.5.�Exported Parameters

### 1.5.1.�`cachedb_url` (string)

The url of the Database that OpenSIPS will connect to in order to use the from script cache\_store,cache\_fetch, etc operations.

The format to follow is : sql:\[conn\_id\]-dburl

The parameter can be set multiple times to create multiple connections accessible from the OpenSIPS script.

**Example�1.1.�Set `db_url` parameter**

...
modparam("cachedb\_sql", "cachedb\_url", "sql:1st-mysql://root:vlad@localhost/opensips\_sql")
...
	

  

**Example�1.2.�Usage example**

...
modparam("cachedb\_sql", "cachedb\_url", "sql:1st-mysql://root:vlad@localhost/opensips\_sql")
modparam("cachedb\_sql", "cachedb\_url", "sql:2nd-postgres://root:vlad@localhost/opensips\_pg")
...
...
cache\_store("sql:1st-mysql","key","$ru value");
cache\_store("sql:2nd-postgres","counter","10");
...
	

  

### 1.5.2.�`db_table` (string)

The table of the Database that OpenSIPS will connect to in order to use the from script cache\_store,cache\_fetch, etc operations.

**Example�1.3.�Set `db_url` parameter**

...
modparam("cachedb\_sql", "db\_table","my\_table");
...
	

  

### 1.5.3.�`key_column` (string)

The column where the key will be stored

**Example�1.4.�Set `key_column` parameter**

...
modparam("cachedb\_sql", "key\_column","some\_name");
...
	

  

### 1.5.4.�`value_column` (string)

The column where the value will be stored

**Example�1.5.�Set `value_column` parameter**

...
modparam("cachedb\_sql", "value\_column","some\_name");
...
	

  

### 1.5.5.�`counter_column` (string)

The column where the counter value will be stored

**Example�1.6.�Set `counter_column` parameter**

...
modparam("cachedb\_sql", "counter\_column","some\_name");
...
	

  

### 1.5.6.�`expires_column` (string)

The column where the expires will be stored

**Example�1.7.�Set `expires_column` parameter**

...
modparam("cachedb\_sql", "expires\_column","some\_name");
...
	

  

### 1.5.7.�`cache_clean_period` (int)

The interval in seconds at which the expired keys will be removed from the database. Default value is 60 ( seconds )

**Example�1.8.�Set `cache_clean_period` parameter**

...
modparam("cachedb\_sql", "cache\_clean\_period",10);
...
	

  

### 1.5.8.�Exported Functions

The module does not export functions to be used in configuration script.

## Chapter�2.�Frequently Asked Questions

**2.1.**

What happened with the old “db\_url” module parameter?

It was replaced with the “cachedb\_url” parameter. See the documentation for the usage of the “cachedb\_url” parameter.

## Chapter�3.�Contributors

## 3.1.�By Commit Statistics

**Table�3.1.�Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)**

�

Name

DevScore

Commits

Lines ++

Lines --

1.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

16

5

1001

87

2.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

11

9

42

59

3.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

7

5

4

2

4.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

5

3

5

2

5.

Alexandra Titoc

4

2

4

3

6.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

4

2

1

2

7.

Dusan Klinec ([@ph4r05](https://github.com/ph4r05))

3

1

2

2

8.

Juli�n Moreno Pati�o

3

1

2

2

9.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

3

1

1

1

10.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

2

1

1

0

  

**All remaining contributors**: Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)).

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 3.2.�By Commit Activity

**Table�3.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Alexandra Titoc

Sep 2024 - Sep 2024

2.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Feb 2023

3.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

Apr 2022 - Apr 2022

4.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Mar 2014 - Apr 2021

5.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Aug 2015 - Sep 2019

6.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Oct 2014 - Apr 2019

7.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

8.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - May 2017

9.

Juli�n Moreno Pati�o

Feb 2016 - Feb 2016

10.

Dusan Klinec ([@ph4r05](https://github.com/ph4r05))

Dec 2015 - Dec 2015

  

**All remaining contributors**: Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)).

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�4.�Documentation

## 4.1.�Contributors

**Last edited by:** Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Juli�n Moreno Pati�o, Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)).

_Documentation Copyrights:_

Copyright � 2013 [www.opensips-solutions.com](http://www.opensips-solutions.com/)