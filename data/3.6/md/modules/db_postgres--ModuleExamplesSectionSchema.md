# db\_postgres Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5536576)

2.2. [Most recently active contributors(1) to this module](#idp5640624)

**List of Examples**

1.1. [Set `exec_query_threshold` parameter](#idp1642640)

1.2. [Set `max_db_queries` parameter](#idp101856)

1.3. [Set `timeout` parameter](#idp181840)

1.4. [Set the `use_tls` parameter](#idp5521856)

## Chapter�1.�Admin Guide

## 1.1.�Overview

Module description

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _No dependencies on other OpenSIPS modules_.
    

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _PostgreSQL library_ - e.g., libpq5.
    
*   _PostgreSQL devel library_ - to compile the module (e.g., libpq-dev).
    

## 1.3.�Exported Parameters

### 1.3.1.�`exec_query_threshold` (integer)

If queries take longer than 'exec\_query\_threshold' microseconds, warning messages will be written to logging facility.

_Default value is 0 - disabled._

**Example�1.1.�Set `exec_query_threshold` parameter**

...
modparam("db\_postgres", "exec\_query\_threshold", 60000)
...

  

### 1.3.2.�`max_db_queries` (integer)

The maximum number of database queries to be executed. If this parameter is set improperly, it is set to default value.

_Default value is 2._

**Example�1.2.�Set `max_db_queries` parameter**

...
modparam("db\_postgres", "max\_db\_queries", 2)
...

  

### 1.3.3.�`timeout` (integer)

The number of seconds the PostgreSQL library waits to connect and query the server. If the connection does not succeed within the given timeout, the connection fails.

_Note:_If the timeout is a negative value and connection does not succeed, OpenSIPS will block until the connection becomes back available and gets successfully established. This is the default behavior of the library and is the behavior prior to the adition of this parameter.

_Default value is 5._

**Example�1.3.�Set `timeout` parameter**

...
modparam("db\_postgres", "timeout", 2)
...

  

### 1.3.4.�`use_tls` (integer)

Parameter to control the way the SSL support is used when connecting to the Postgres server, as follows:

*   _use\_tls=0_ (default) - the SSL support is disabled and there is no attempt to use it;
    
*   _use\_tls=1_ with "tls\_domain" present in the DB URL - the SSL support is enabled, either "require", either "verify-ca", depending on the certificate settings;
    
*   _use\_tls=1_ with no "tls\_domain" present in the DB URL - the SSL support is enabled in best effort mode (or "prefer"); if supported by the server, it will be used, otherwise it will fall back to non-SSL.
    

Warning: the _tls\_openssl_ module cannot be used when setting this parameter. Use the _tls\_wolfssl_ module instead if a TLS/SSL Library is required.

Setting this parameter will allow you to use TLS for PostgreSQL connections. In order to enable TLS for a specific connection, you can use the "tls\_domain=_dom\_name_" URL parameter in the db\_url of the respective OpenSIPS module. This should be placed at the end of the URL after the '?' character.

When using this parameter, you must also ensure that _tls\_mgm_ is loaded and properly configured. Refer to the the module for additional info regarding TLS client domains.

Note that if you want to use this feature, the TLS domain must be provisioned in the configuration file, _NOT_ in the database. In case you are loading TLS certificates from the database, you must at least define one domain in the configuration script, to use for the initial connection to the DB.

Also, you can _NOT_ enable TLS for the connection to the database of the _tls\_mgm_ module itself.

_Default value is **0** (not enabled)_

**Example�1.4.�Set the `use_tls` parameter**

...
modparam("tls\_mgm", "client\_domain", "dom1")
modparam("tls\_mgm", "certificate", "\[dom1\]/etc/pki/tls/certs/opensips.pem")
modparam("tls\_mgm", "private\_key", "\[dom1\]/etc/pki/tls/private/opensips.key")
modparam("tls\_mgm", "ca\_list",     "\[dom1\]/etc/pki/tls/certs/ca.pem")
...
modparam("db\_postgres", "use\_tls", 1)
...
modparam("usrloc", "db\_url", "postgres://root:1234@localhost/opensips?tls\_domain=dom1")
...

  

## 1.4.�Exported Functions

NONE

## 1.5.�Installation and Running

Notes about installation and running.

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

Henning Westerholt ([@henningw](https://github.com/henningw))

67

29

554

1963

2.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

61

45

1088

349

3.

Norman Brandinger ([@NormB](https://github.com/NormB))

55

4

1449

2247

4.

Greg Fausak

42

3

4472

2

5.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

27

20

350

203

6.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

18

15

45

87

7.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

15

12

210

27

8.

Jan Janak ([@janakj](https://github.com/janakj))

12

8

300

23

9.

Klaus Darilion

10

6

139

67

10.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

9

7

102

34

  

**All remaining contributors**: Maksym Sobolyev ([@sobomax](https://github.com/sobomax)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Ancuta Onofrei, Norman Brandinger, Andrei Pelinescu-Onciul, Dusan Klinec ([@ph4r05](https://github.com/ph4r05)), Eseanu Marius Cristian ([@eseanucristian](https://github.com/eseanucristian)), Ruslan Bukin, Ryan Bullock ([@rrb3942](https://github.com/rrb3942)), Konstantin Bokarius, Razvan Pistolea, Aron Podrigal, Dan Pascu ([@danpascu](https://github.com/danpascu)), Ken Rice, Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Edson Gellert Schubert, Jarrod Baumann ([@jarrodb](https://github.com/jarrodb)).

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 2.2.�By Commit Activity

**Table�2.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Ken Rice

Sep 2025 - Sep 2025

2.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Oct 2011 - Jul 2024

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Sep 2012 - May 2024

4.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Jul 2005 - Feb 2024

5.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Apr 2004 - Feb 2023

6.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Oct 2021

7.

Norman Brandinger ([@NormB](https://github.com/NormB))

Aug 2006 - Oct 2021

8.

Dan Pascu ([@danpascu](https://github.com/danpascu))

May 2019 - May 2019

9.

Ryan Bullock ([@rrb3942](https://github.com/rrb3942))

Mar 2019 - Mar 2019

10.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

Jan 2011 - Feb 2019

  

**All remaining contributors**: Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Jarrod Baumann ([@jarrodb](https://github.com/jarrodb)), Dusan Klinec ([@ph4r05](https://github.com/ph4r05)), Aron Podrigal, Eseanu Marius Cristian ([@eseanucristian](https://github.com/eseanucristian)), Razvan Pistolea, Ruslan Bukin, Henning Westerholt ([@henningw](https://github.com/henningw)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Ancuta Onofrei, Klaus Darilion, Norman Brandinger, Jan Janak ([@janakj](https://github.com/janakj)), Greg Fausak, Andrei Pelinescu-Onciul.

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Norman Brandinger ([@NormB](https://github.com/NormB)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Aron Podrigal, Eseanu Marius Cristian ([@eseanucristian](https://github.com/eseanucristian)), Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Henning Westerholt ([@henningw](https://github.com/henningw)), Jan Janak ([@janakj](https://github.com/janakj)).

_Documentation Copyrights:_

Copyright � 2003 Greg Fausak