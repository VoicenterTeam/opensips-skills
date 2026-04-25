# db\_sqlite Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp94480)

2.2. [Most recently active contributors(1) to this module](#idp5598128)

**List of Examples**

1.1. [Set `alloc_limit` parameter](#idp1782528)

1.2. [Set `db_sqlite_alloc_limit` parameter](#idp248800)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This is a module which provides SQLite support for OpenSIPS. It implements the DB API defined in OpenSIPS.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _No dependencies on other OpenSIPS modules_.
    

Also this module provides two ways of creating the query. One is to use sqlite3\_bind\_\* functions after opensips creates the prepared statement query. The second one directly uses only sqlite3\_snprintf function to print the values into the opensips created query. In theory, the second one should be faster and should allow you to make more queries to the database in the same time, so by default this one will be active. You can use the sqlite3\_bind\_\* interface by simply uncommenting the SQLITE\_BIND line the Makefile.

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _libsqlite3-dev_ - the development libraries of sqlite.
    

## 1.3.�Exported Parameters

### 1.3.1.�`alloc_limit` (integer)

Since the library does not support a function to return the number of rows in a query, this number is obtained using "count(\*)" query. If we use multiple processes there is the risk ,since "count(\*)" query and the actual "select" query, the number of rows in the result query to have changed, so realloc will be needed if the number is bigger. Using _alloc\_limit_ parameter you can specify the number with which the number of allocated rows in the result is raised.

_Default value is 10._

**Example�1.1.�Set `alloc_limit` parameter**

...
modparam("db\_sqlite", "alloc\_limit", 25)
...

  

### 1.3.2.�`load_extension` (string)

This parameter enables extension loading, similiar to ".load" functionality in sqlite3, extenions like sqlite3-pcre which enables REGEX function. In order to use this functionality you must specify the library path (.so file) and the entry point which represents the function to be called by the sqlite library (read more at sqlite [load\_extension](https://www.sqlite.org/capi3ref.html#sqlite3_load_extension) official documentation), separated by ";" delimiter. The entry point paramter can miss, so you won't need to use the delimitier in this case.

_By default, no extension is loaded._

**Example�1.2.�Set `db_sqlite_alloc_limit` parameter**

...
modparam("db\_sqlite", "load\_extension", "/usr/lib/sqlite3/pcre.so")
modparam("db\_sqlite", "load\_extension", "/usr/lib/sqlite3/pcre.so;sqlite3\_extension\_init")
...

  

## 1.4.�Exported Functions

No function exported to be used from configuration file.

## 1.5.�Installation

Because it dependes on an external library, the sqlite module is not compiled and installed by default. You can use one of the next options.

*   \- edit the "Makefile" and remove "db\_sqlite" from "excluded\_modules" list. Then follow the standard procedure to install OpenSIPS: "make all; make install".
    
*   \- from command line use: 'make all include\_modules="db\_sqlite"; make install include\_modules="db\_sqlite"'.
    

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

Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita))

81

28

3744

1276

2.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

15

13

105

40

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

12

10

32

60

4.

Jarrod Baumann ([@jarrodb](https://github.com/jarrodb))

5

3

7

4

5.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

4

2

34

37

6.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

4

2

3

2

7.

Aron Podrigal ([@ar45](https://github.com/ar45))

3

1

10

1

8.

Daniel Fussia

3

1

4

22

9.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

3

1

2

2

10.

Eric Green

3

1

1

10

  

**All remaining contributors**: Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)).

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 2.2.�By Commit Activity

**Table�2.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Apr 2019 - Jan 2025

2.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Aug 2015 - Oct 2024

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

May 2016 - Sep 2024

4.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Feb 2023

5.

Eric Green

Aug 2020 - Aug 2020

6.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Apr 2019

7.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

8.

Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita))

Apr 2015 - Feb 2017

9.

Daniel Fussia

Jun 2016 - Jun 2016

10.

Jarrod Baumann ([@jarrodb](https://github.com/jarrodb))

Apr 2015 - Mar 2016

  

**All remaining contributors**: Aron Podrigal ([@ar45](https://github.com/ar45)).

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita)).

_Documentation Copyrights:_

Copyright � 2015 [www.opensips-solutions.com](http://www.opensips-solutions.com/)