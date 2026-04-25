# userblacklist Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5567968)

2.2. [Most recently active contributors(1) to this module](#idp5667376)

**List of Examples**

1.1. [Set `db_url` parameter](#idp2714880)

1.2. [Set `db_table` parameter](#idp101328)

1.3. [Set `use_domain` parameter](#idp106560)

1.4. [`check_user_blacklist` usage](#idp5516352)

1.5. [`check_blacklist` usage](#idp5522480)

1.6. [`reload_blacklists` usage](#idp5528144)

1.7. [Example database content - globalblacklist table](#idp5533328)

1.8. [Example database content - userblacklist table](#idp5536960)

## Chapter�1.�Admin Guide

## 1.1.�Overview

The userblacklist module allows OpenSIPS to handle blacklists on a per user basis. This information is stored in a database table, which is queried to decide if the number (more exactly, the request URI user) is blacklisted or not.

An additional functionality that this module provides is the ability to handle global blacklists. This lists are loaded on startup into memory, thus providing a better performance then in the userblacklist case. This global blacklists are useful to only allow calls to certain international destinations, i.e. block all not whitelisted numbers. They could also used to prevent the blacklisting of important numbers, as whitelisting is supported too. This is useful for example to prevent the customer from blocking emergency call number or service hotlines.

The module exports two functions, _check\_blacklist_ and _check\_user\_blacklist_ for usage in the config file. Furthermore its provide a FIFO function to reload the global blacklist cache.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The module depends on the following modules (in the other words the listed modules must be loaded before this module):

*   _database_ -- Any database module
    

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _none_
    

## 1.3.�Exported Parameters

### 1.3.1.�`db_url` (string)

Url to the database containing the routing data.

_Default value is “mysql://opensipsro:opensipsro@localhost/opensips”._

**Example�1.1.�Set `db_url` parameter**

...
modparam("userblacklist", "db\_url", "dbdriver://username:password@dbhost/dbname")
...
		

  

### 1.3.2.�`db_table` (string)

Name of the table where the user blacklist data is stored.

_Default value is “userblacklist”._

**Example�1.2.�Set `db_table` parameter**

...
modparam("userblacklist", "db\_table", "userblacklist")
...
		    

  

### 1.3.3.�`use_domain` (integer)

If set to non-zero value, the domain column in the userblacklist is used.

_Default value is “0”._

**Example�1.3.�Set `use_domain` parameter**

...
modparam("userblacklist", "use\_domain", 0)
...
		    

  

## 1.4.�Exported Functions

### 1.4.1.� `check_user_blacklist (user, domain, [number], [table])`

Finds the longest prefix that matches the request URI user (or the number parameter) for the given user and domain name in the database. If a match is found and it is not set to whitelist, false is returned. Otherwise, true is returned. The number parameter can be used to check for example against the from URI user.

Parameters:

*   _user_ (string) - description
    
*   _domain_ (string) - description
    
*   _number_ (string, optional) - If ommited, the defalut is used.
    
*   _table_ (string, optional) - If ommited, the defalut is used.
    

**Example�1.4.�`check_user_blacklist` usage**

...
if (!check\_user\_blacklist("user", "domain.com"))
	sl\_send\_reply(403, "Forbidden");
	exit;
}
...
		

  

### 1.4.2.� `check_blacklist (table)`

Finds the longest prefix that matches the request URI for the given table. If a match is found and it is not set to whitelist, false is returned. Otherwise, true is returned.

Parameters:

*   _table_ (string)
    

**Example�1.5.�`check_blacklist` usage**

...
if (!check\_blacklist("global\_blacklist")))
	sl\_send\_reply(403, "Forbidden");
	exit;
}
...
		

  

## 1.5.�Exported MI Functions

### 1.5.1.� `reload_blacklist`

Reload the internal global blacklist cache. This is necessary after the database tables for the global blacklist have been changed.

**Example�1.6.�`reload_blacklists` usage**

...
opensips-cli -x mi reload\_blacklist
...
		

  

## 1.6.�Installation and Running

### 1.6.1.�Database setup

Before running OpenSIPS with userblacklist, you have to setup the database table where the module will read the blacklist data. For that, if the table was not created by the installation script or you choose to install everything by yourself you can use the userblacklist-create.sql SQL script in the database directories in the opensips/scripts folder as template. Database and table name can be set with module parameters so they can be changed, but the name of the columns must be as they are in the SQL script. You can also find the complete database documentation on the project webpage, https://opensips.org/docs/db/db-schema-devel.html.

**Example�1.7.�Example database content - globalblacklist table**

...
+----+-----------+-----------+
| id | prefix    | whitelist |
+----+-----------+-----------+
|  1 |           |         0 |
|  2 | 1         |         1 |
|  3 | 123456    |         0 |
|  4 | 123455787 |         0 |
+----+-----------+-----------+
...
		

  

This table will setup a global blacklist for all numbers, only allowing calls starting with “1”. Numbers that starting with “123456” and “123455787” are also blacklisted, because the longest prefix will be matched.

**Example�1.8.�Example database content - userblacklist table**

...
+----+----------------+-------------+-----------+-----------+
| id | username       | domain      | prefix    | whitelist |
+----+----------------+-------------+-----------+-----------+
| 23 | 49721123456788 |             | 1234      |         0 |
| 22 | 49721123456788 |             | 123456788 |         1 |
| 21 | 49721123456789 |             | 12345     |         0 |
| 20 | 494675231      |             | 499034133 |         1 |
| 19 | 494675231      | test        | 499034132 |         0 |
| 18 | 494675453      | test.domain | 49901     |         0 |
| 17 | 494675454      |             | 49900     |         0 |
+----+----------------+-------------+-----------+-----------+
...
		

  

This table will setup user specific blacklists for certain usernames. For example for user “49721123456788” the prefix “1234” will be not allowed, but the number “123456788” is allowed. Additionally a domain could be specified that is used for username matching if the “use\_domain” parameter is set.

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

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

18

16

55

53

2.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

13

11

38

55

3.

Hardy Kahl

12

1

1191

0

4.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

10

8

17

12

5.

Henning Westerholt ([@henningw](https://github.com/henningw))

9

5

204

72

6.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

8

6

17

12

7.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

8

4

82

151

8.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

4

2

4

5

9.

Ruslan Bukin

3

1

21

10

10.

Juli�n Moreno Pati�o

3

1

1

1

  

**All remaining contributors**: Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), UnixDev, Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)), Edson Gellert Schubert.

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

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Mar 2014 - Jul 2020

3.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Feb 2008 - Mar 2020

4.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Sep 2011 - Sep 2019

5.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Apr 2019

6.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

7.

Juli�n Moreno Pati�o

Feb 2016 - Feb 2016

8.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

Apr 2011 - Apr 2011

9.

Ruslan Bukin

Oct 2009 - Oct 2009

10.

UnixDev

Feb 2009 - Feb 2009

  

**All remaining contributors**: Henning Westerholt ([@henningw](https://github.com/henningw)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Edson Gellert Schubert, Hardy Kahl.

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Henning Westerholt ([@henningw](https://github.com/henningw)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Edson Gellert Schubert, Hardy Kahl.

_Documentation Copyrights:_

Copyright � 2008 1&1 Internet AG