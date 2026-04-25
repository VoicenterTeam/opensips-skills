# TCP Management Module (tcp\_mgm)

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp103488)

2.2. [Most recently active contributors(1) to this module](#idp5557232)

**List of Examples**

1.1. [Setting the `db_url` parameter](#idp3899776)

1.2. [Setting the `db_table` parameter](#idp3981536)

1.3. [Setting the `[column-name]_col` parameter](#idp245408)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This module provides optional, SQL-based support for fine-grained management of all TCP connections taking place on OpenSIPS.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

At least one SQL database module must be loaded (e.g. "db\_xxx").

### 1.2.2.�External Libraries or Applications

None.

## 1.3.�Exported Parameters

### 1.3.1.�`db_url (string)`

Mandatory URL to the SQL database.

**Example�1.1.�Setting the `db_url` parameter**

modparam("tcp\_mgm", "db\_url", "mysql://opensips:opensipsrw@localhost/opensips")

  

### 1.3.2.�`db_table (string)`

The name of the table holding the TCP paths (rules).

Default value is _"tcp\_mgm"_.

**Example�1.2.�Setting the `db_table` parameter**

modparam("tcp\_mgm", "db\_table", "tcp\_mgm")

  

### 1.3.3.�`[column-name]_col (string)`

Use a different name for column _"column-name"_.

**Example�1.3.�Setting the `[column-name]_col` parameter**

modparam("tcp\_mgm", "connect\_timeout\_col", "connect\_to")

  

## 1.4.�Exported MI Functions

### 1.4.1.� `tcp_reload`

Reload all TCP paths from the _tcp\_mgm_ table without disrupting ongoing traffic. Note that the reloaded rules will NOT immediately apply to existing TCP connections, rather only to newly established ones.

Example:

\# reload all TCP paths
$ opensips-cli -x mi tcp\_reload
$ "OK"
		

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

21

8

1281

62

2.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

5

3

9

10

  

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

Feb 2023 - Nov 2023

2.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Apr 2022 - Jul 2022

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)).

_Documentation Copyrights:_

Copyright � 2022 [www.opensips-solutions.com](http://www.opensips-solutions.com/)