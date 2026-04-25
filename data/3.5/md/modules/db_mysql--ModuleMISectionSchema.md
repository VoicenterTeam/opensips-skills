# mysql Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5580368)

2.2. [Most recently active contributors(1) to this module](#idp5686192)

**List of Examples**

1.1. [Set `exec_query_threshold` parameter](#idp4249952)

1.2. [Set `timeout_interval` parameter](#idp247360)

1.3. [Set `max_db_queries` parameter](#idp5517504)

1.4. [Set `max_db_retries` parameter](#idp5522096)

1.5. [Set `ps_max_col_size` parameter](#idp5527632)

1.6. [Set the `use_tls` parameter](#idp5538160)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This is a module which provides MySQL connectivity for OpenSIPS. It implements the DB API defined in OpenSIPS.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _If a [use\_tls](#param_use_tls "1.3.6.�use_tls (integer)") is defined, the **tls\_mgm** module will need to be loaded as well_.
    

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _libmysqlclient-dev_ - the development libraries of mysql-client.
    

## 1.3.�Exported Parameters

### 1.3.1.�`exec_query_threshold` (integer)

If queries take longer than 'exec\_query\_threshold' microseconds, warning messages will be written to logging facility.

_Default value is 0 - disabled._

**Example�1.1.�Set `exec_query_threshold` parameter**

...
modparam("db\_mysql", "exec\_query\_threshold", 60000)
...

  

### 1.3.2.�`timeout_interval` (integer)

Time interval after which a connection attempt (read or write request) is aborted. The value counts three times, as several retries are done from the driver before it gives up.

The read timeout parameter is ignored on driver versions prior to “5.1.12”, “5.0.25” and “4.1.22”. The write timeout parameter is ignored on version prior to “5.1.12” and “5.0.25”, the “4.1” release don't support it at all.

_Default value is 2 (6 sec)._

**Example�1.2.�Set `timeout_interval` parameter**

...
modparam("db\_mysql", "timeout\_interval", 2)
...

  

### 1.3.3.�`max_db_queries` (integer)

The maximum number of retries to execute a failed query due to connections problems. If this parameter is set improperly, it is set to default value.

_Default value is 2._

**Example�1.3.�Set `max_db_queries` parameter**

...
modparam("db\_mysql", "max\_db\_queries", 2)
...

  

### 1.3.4.�`max_db_retries` (integer)

The maximum number of database connection retries. If this parameter is set improperly, it is set to default value.

_Default value is 3._

**Example�1.4.�Set `max_db_retries` parameter**

...
modparam("db\_mysql", "max\_db\_retries", 2)
...

  

### 1.3.5.�`ps_max_col_size` (integer)

The maximum size of a column's data, when fetched using prepared statements. Particularly relevant for variable-length data, such as CHAR, BLOB, etc.

NOTE: Should a column's data exceed this limit, the value will be silently truncated to fit the buffer, without reporting any errors!

_Default value is _1024 (bytes)_._

**Example�1.5.�Set `ps_max_col_size` parameter**

...
modparam("db\_mysql", "ps\_max\_col\_size", 4096)
...

  

### 1.3.6.�`use_tls` (integer)

Setting this parameter will allow you to use TLS for MySQL connections. In order to enable TLS for a specific connection, you can use the "**tls\_domain=**dom\_name" URL parameter in the db\_url of the respective OpenSIPS module. This should be placed at the end of the URL after the **'?'** character. Additionally, the query string may include the "**tls\_opts=** PKEY,CERT,CA,CA\_DIR,CIPHERS" CSV parameter, in order to control/limit the amount of TLS options passed to the TLS library.

When using this parameter, you must also ensure that _tls\_mgm_ is loaded and properly configured. Refer to the the module for additional info regarding TLS client domains.

Note that if you want to use this feature, the TLS domain must be provisioned in the configuration file, _NOT_ in the database. In case you are loading TLS certificates from the database, you must at least define one domain in the configuration script, to use for the initial connection to the DB.

Also, you can _NOT_ enable TLS for the connection to the database of the _tls\_mgm_ module itself.

_Default value is **0** (not enabled)_

**Example�1.6.�Set the `use_tls` parameter**

...
modparam("tls\_mgm", "client\_domain", "dom1")
modparam("tls\_mgm", "certificate", "\[dom1\]/etc/pki/tls/certs/opensips.pem")
modparam("tls\_mgm", "private\_key", "\[dom1\]/etc/pki/tls/private/opensips.key")
modparam("tls\_mgm", "ca\_list",     "\[dom1\]/etc/pki/tls/certs/ca.pem")
...
modparam("db\_mysql", "use\_tls", 1)
...
modparam("usrloc", "db\_url", "mysql://root:1234@localhost/opensips?tls\_domain=dom1")
...
modparam("usrloc", "db\_url", "mysql://root:1234@localhost/opensips?tls\_domain=dom1&tls\_opts=PKEY,CERT,CA,CA\_DIR,CIPHERS")
...

  

## 1.4.�Exported Functions

No function exported to be used from configuration file.

## 1.5.�Installation

Because it dependes on an external library, the mysql module is not compiled and installed by default. You can use one of the next options.

*   \- edit the "Makefile" and remove "db\_mysql" from "excluded\_modules" list. Then follow the standard procedure to install OpenSIPS: "make all; make install".
    
*   \- from command line use: 'make all include\_modules="db\_mysql"; make install include\_modules="db\_mysql"'.
    

## 1.6.�Exported Events

### 1.6.1.� `E_MYSQL_CONNECTION`

This event is raised when a MySQL connection is lost or recovered.

Parameters:

*   _url_ - the URL of the connection as specified by the _db\_url_ parameter.
    
*   _status_ - _connected_ if the connection recovered, or _disconnected_ if the connection was lost.
    

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

Jan Janak ([@janakj](https://github.com/janakj))

150

53

5336

3190

2.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

100

73

1576

795

3.

Henning Westerholt ([@henningw](https://github.com/henningw))

57

30

693

1239

4.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

43

34

581

206

5.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

28

20

571

154

6.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

19

16

231

59

7.

Andrei Pelinescu-Onciul

16

14

52

49

8.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

15

12

185

25

9.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

12

8

179

78

10.

Jiri Kuthan ([@jiriatipteldotorg](https://github.com/jiriatipteldotorg))

11

6

393

2

  

**All remaining contributors**: Nils Ohlmeier, Maksym Sobolyev ([@sobomax](https://github.com/sobomax)), Norman Brandinger ([@NormB](https://github.com/NormB)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Eseanu Marius Cristian ([@eseanucristian](https://github.com/eseanucristian)), Dan Pascu ([@danpascu](https://github.com/danpascu)), Walter Doekes ([@wdoekes](https://github.com/wdoekes)), Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita)), Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)), Konstantin Bokarius, Andreas Heise, Razvan Pistolea, Sa�l Ibarra Corretg� ([@saghul](https://github.com/saghul)), Sergio Gutierrez, Edson Gellert Schubert, Augusto Caringi.

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

Aug 2002 - Nov 2025

2.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Mar 2014 - Jul 2024

3.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

Feb 2011 - Jul 2023

4.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Feb 2023

5.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

Apr 2017 - May 2021

6.

Walter Doekes ([@wdoekes](https://github.com/wdoekes))

Apr 2021 - Apr 2021

7.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Oct 2011 - Jan 2021

8.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Nov 2017 - Jun 2018

9.

Augusto Caringi

Jul 2017 - Jul 2017

10.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

Mar 2017 - Mar 2017

  

**All remaining contributors**: Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita)), Eseanu Marius Cristian ([@eseanucristian](https://github.com/eseanucristian)), Sa�l Ibarra Corretg� ([@saghul](https://github.com/saghul)), Razvan Pistolea, Norman Brandinger ([@NormB](https://github.com/NormB)), Sergio Gutierrez, Henning Westerholt ([@henningw](https://github.com/henningw)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Andreas Heise, Jan Janak ([@janakj](https://github.com/janakj)), Andrei Pelinescu-Onciul, Dan Pascu ([@danpascu](https://github.com/danpascu)), Jiri Kuthan ([@jiriatipteldotorg](https://github.com/jiriatipteldotorg)), Nils Ohlmeier.

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Eseanu Marius Cristian ([@eseanucristian](https://github.com/eseanucristian)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Henning Westerholt ([@henningw](https://github.com/henningw)), Jan Janak ([@janakj](https://github.com/janakj)).

_Documentation Copyrights:_

Copyright � 2006 Voice Sistem SRL