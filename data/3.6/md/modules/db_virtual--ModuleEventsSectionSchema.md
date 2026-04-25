# db\_virtual Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5544432)

2.2. [Most recently active contributors(1) to this module](#idp5644368)

**List of Examples**

1.1. [Set `db_urls` parameter](#idp250384)

1.2. [Set `db_probe_time` parameter](#idp166848)

1.3. [Set `db_max_consec_retrys` parameter](#idp171584)

## Chapter�1.�Admin Guide

## 1.1.�Overview

### 1.1.1.� The idea

A virtual DB will expose the same front DB api however, it will backed by many real DB. This means that a virtual DB URL translates to many real DB URLs. This virtual layer also enables us to use the real dbs in multiple ways such as: parallel, failover(hotswap) and round-robin. Therefore: each virtual DB URL with associated real dbs and a way to use(mode) it's real dbs must be specified.

### 1.1.2.�Modes

The implemented modes are:

*   FAILOVER
    
    Use the first URL; if it fails, take the next URL and redo the operation.
    
*   PARALLEL
    
    Use all the URLs in the virtual DB URL set. Fails if all the URLs fail.
    
*   ROUND (round-robin)
    
    Use the next URL each time; if it fails, use the next one, redo operation.
    

When choosing the db virtual mode, be sure that there is a full compatibility between the DB operations you want to do (inserts, updates, deletes,...) and the relation (if any) between the real DB URLs you have in the set - can be completely independent, can be nodes of the same cluster, or any other combination.

### 1.1.3.�Capabilities

For each set (or new virtual DB URL), the capabilities are automatically calculated based on the capabilities provided by the real DB URLs from the set. A logical AND is done for each cabability over all the URLs in the set. Shortly, in order for the virtual URL to provide a certain capability, ALL its real URLs must provide that capability.

Note that starting with version 2.2 db\_virtual supports async\_raw\_query and async\_raw\_resume functions currently implemented only by the mysql database engine.

### 1.1.4.� Failures

	When an operation from a process on a real DB fails:
		it is marked (global and local CAN flag down)
		its connection closed

	Later a timer process (probe):
	foreach virtual db\_url
		foreach real db\_url
			if global CAN down
				try to connect
			if ok
				global CAN up
				close connection

	Later each process:
		if local CAN down and global CAN up
			if db\_max\_consec\_retrys \*
				try to connect
		if ok
			local CAN up

				

Note \*: there could be inconsistencies between the probe and each process so a retry limit is in order. It is reset and ignored by an MI command.

### 1.1.5.�The timer process

The timer process(probe) is a process that tries to reconnect to failed dbs from time to time. It is a separate process so that when it blocks (for a timeout on the connection) it doesn't matter.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _At least one real DB module_.
    

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _None_.
    

## 1.3.�Exported Parameters

### 1.3.1.� `db_urls` (str)

Multiple value parameter used for virtual DB URLs declaration.

**Example�1.1.�Set `db_urls` parameter**

...

modparam("group","db\_url","virtual://set1")
modparam("presence|presence\_xml", "db\_url","virtual://set2")

modparam("db\_virtual", "db\_urls", "define set1 PARALLEL")
modparam("db\_virtual", "db\_urls", "mysql://opensips:opensipsrw@localhost/testa")
modparam("db\_virtual", "db\_urls", "postgres://opensips:opensipsrw@localhost/opensips")

modparam("db\_virtual", "db\_urls", "define set2 FAILOVER")
modparam("db\_virtual", "db\_urls", "mysql://opensips:opensipsrw@localhost/testa")
...
				

  

### 1.3.2.� `db_probe_time` (integer)

Time interval after which a registered timer process attempts to check failed(as reported by other processes) connections to real dbs. The probe will connect and disconnect to the failed real DB and announce others.

_Default value is 10 (10 sec)._

**Example�1.2.�Set `db_probe_time` parameter**

...
modparam("db\_virtual", "db\_probe\_time", 20)
...
				

  

### 1.3.3.� `db_max_consec_retrys` (integer)

After the timer process has reported that it can connect to the real db, other processes will try to reconnect to it. There are cases where although the probe could connect some might fail. This parameter represents the number of consecutive failed retries that a process will do before it gives up. This value is reset and suppressed by a MI function(db\_set).

_Default value is 10 (10 consecutive times)._

**Example�1.3.�Set `db_max_consec_retrys` parameter**

...
modparam("db\_virtual", "db\_max\_consec\_retrys", 20)
...

				

  

## 1.4.�Exported MI Functions

### 1.4.1.� `db_get`

Return information about global state of the real dbs.

Name: _db\_get_

Parameters:

*   None.
    

MI FIFO Command Format:

				opensips-cli -x mi db\_get
			

### 1.4.2.� `db_set`

Sets the permissions for real dbs access per set per db.

Sets the reconnect reset flag.

Name: _db\_set_

Parameters:

*   set\_index \[int\]
*   db\_url\_index \[int\]
*   may\_use\_db\_flag \[boolean\]
*   ignore\_retries\[boolean\](optional)

db\_set 3 2 0 1 means:

*   3 - the fourth set (must exist)
*   2 - the third URL in the fourth set(must exist)
*   0 - processes are not allowed to use that URL
*   1 - reset and suppress db\_max\_consec\_retrys

MI FIFO Command Format:

				opensips-cli -x mi db\_set 3 2 0 1
			

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

Razvan Pistolea

31

7

2244

297

2.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

22

18

104

128

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

16

12

105

140

4.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

14

12

21

19

5.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

9

5

85

145

6.

Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita))

6

3

232

9

7.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

4

2

4

5

8.

Zero King ([@l2dy](https://github.com/l2dy))

3

1

5

5

9.

Anca Vamanu

3

1

3

3

10.

Walter Doekes ([@wdoekes](https://github.com/wdoekes))

3

1

2

2

  

**All remaining contributors**: Juli�n Moreno Pati�o, Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)).

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

Aug 2009 - May 2022

3.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Sep 2011 - Jan 2021

4.

Zero King ([@l2dy](https://github.com/l2dy))

Mar 2020 - Mar 2020

5.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Apr 2019

6.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

7.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Oct 2013 - Jun 2018

8.

Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita))

Feb 2016 - Mar 2017

9.

Juli�n Moreno Pati�o

Feb 2016 - Feb 2016

10.

Walter Doekes ([@wdoekes](https://github.com/wdoekes))

Jun 2014 - Jun 2014

  

**All remaining contributors**: Anca Vamanu, Razvan Pistolea.

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Juli�n Moreno Pati�o, Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita)), Razvan Pistolea.

_Documentation Copyrights:_

Copyright � 2009 Voice Sistem SRL