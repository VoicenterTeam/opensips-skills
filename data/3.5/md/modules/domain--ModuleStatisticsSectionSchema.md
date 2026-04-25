# domain Module

---

**List of Tables**

3.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5661600)

3.2. [Most recently active contributors(1) to this module](#idp5739168)

**List of Examples**

1.1. [Setting db\_url parameter](#idp4120176)

1.2. [db\_mode example](#idp1715888)

1.3. [Setting domain\_table parameter](#idp1719888)

1.4. [Setting domain\_col parameter](#idp261792)

1.5. [Setting attrs\_col parameter](#idp265600)

1.6. [is\_from\_local usage](#idp5570992)

1.7. [is\_uri\_host\_local usage](#idp5575424)

1.8. [is\_domain\_local usage](#idp5584144)

## Chapter�1.�Admin Guide

## 1.1.�Overview

Domain module implements checks that based on domain table determine if a host part of an URI is “local” or not. A “local” domain is one that the proxy is responsible for.

Domain module operates in caching or non-caching mode depending on value of module parameter _`db_mode`_. In caching mode domain module reads the contents of domain table into cache memory when the module is loaded. After that domain table is re-read only when module is given domain\_reload fifo command. Any changes in domain table must thus be followed by “domain\_reload” command in order to reflect them in module behavior. In non-caching mode domain module always queries domain table in the database.

Caching is implemented using a hash table. The size of the hash table is given by HASH\_SIZE constant defined in domain\_mod.h. Its “factory default” value is 128.

## 1.2.�Dependencies

The module depends on the following modules (in the other words the listed modules must be loaded before this module):

*   _database_ -- Any database module
    

## 1.3.�Exported Parameters

### 1.3.1.�`db_url` (string)

This is URL of the database to be used.

Default value is “mysql://opensipsro:opensipsro@localhost/opensips”

**Example�1.1.�Setting db\_url parameter**

modparam("domain", "db\_url", "mysql://ser:pass@db\_host/ser")

  

### 1.3.2.�`db_mode` (integer)

Database mode: 0 means non-caching, 1 means caching.

Default value is 0 (non-caching).

**Example�1.2.�db\_mode example**

modparam("domain", "db\_mode", 1)   # Use caching

  

### 1.3.3.�`domain_table` (string)

Name of table containing names of local domains that the proxy is responsible for. Local users must have in their sip uri a host part that is equal to one of these domains.

Default value is “domain”.

**Example�1.3.�Setting domain\_table parameter**

modparam("domain", "domain\_table", "new\_name")

  

### 1.3.4.�`domain_col` (string)

Name of column containing domains in domain table.

Default value is “domain”.

**Example�1.4.�Setting domain\_col parameter**

modparam("domain", "domain\_col", "domain\_name")

  

### 1.3.5.�`attrs_col` (string)

Name of column containing attributes in domain table.

Default value is “attrs”.

**Example�1.5.�Setting attrs\_col parameter**

modparam("domain", "attrs\_col", "attributes")

  

## 1.4.�Exported Functions

### 1.4.1.�`is_from_local([attrs_var])`

Checks based on domain table if host part of From header uri is one of the local domains that the proxy is responsible for. The argument is optional and if present it should contain a writable variable that will be populated with the attributes from the database.

This function can be used from REQUEST\_ROUTE.

**Example�1.6.�is\_from\_local usage**

...
if (is\_from\_local()) {
	...
};
...
if (is\_from\_local($var(attrs))) {
	xlog("Domain attributes are $var(attrs)\\n");
	...
};
...
		

  

### 1.4.2.�`is_uri_host_local([attrs_var])`

If called from route or failure route block, checks based on domain table if host part of Request-URI is one of the local domains that the proxy is responsible for. If called from branch route, the test is made on host part of URI of first branch, which thus must have been appended to the transaction before is\_uri\_host\_local() is called. The argument is optional and if present it should contain a writable variable that will be populated with the attributes from the database.

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE.

**Example�1.7.�is\_uri\_host\_local usage**

...
if (is\_uri\_host\_local()) {
	...
};
...
if (is\_uri\_host\_local($var(attrs))) {
	xlog("Domain attributes are $var(attrs)\\n");
	...
};
		

  

### 1.4.3.�`is_domain_local(domain, [attrs_var])`

This function checks if the domain contained in the first parameter is local.

This function is a generalized form of the is\_from\_local() and is\_uri\_host\_local() functions, being able to completely replace them and also extends them by allowing the domain to be taken from any of the above mentioned sources. The following equivalences exist:

*   is\_domain\_local($rd) is same as is\_uri\_host\_local()
    
*   is\_domain\_local($fd) is same as is\_from\_local()
    

Parameters:

*   _domain_ (string)
    
*   _attrs\_var_ (var, optional) - a writable variable that will be populated with the attributes from the database.
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE.

**Example�1.8.�is\_domain\_local usage**

...
if (is\_domain\_local($rd)) {
	...
};
if (is\_domain\_local($fd)) {
	...
};
if (is\_domain\_local($avp(some\_avp\_alias))) {
	...
};
if (is\_domain\_local($avp(850))) {
	...
};
if (is\_domain\_local($avp(some\_avp))) {
	...
};
if (is\_domain\_local($avp(some\_avp), $avp(attrs))) {
	xlog("Domain attributes are $avp(attrs)\\n");
	...
};
...
		

  

## 1.5.�Exported MI Functions

### 1.5.1.�`domain_reload`

Causes domain module to re-read the contents of domain table into cache memory.

Name: _domain\_reload_

Parameters: _none_

MI FIFO Command Format:

		opensips-cli -x mi domain\_reload
		

### 1.5.2.�`domain_dump`

Causes domain module to dump hash indexes and domain names in its cache memory.

Name: _domain\_dump_

Parameters: _none_

MI FIFO Command Format:

		opensips-cli -x mi domain\_dump
		

## 1.6.�Known Limitations

There is an unlikely race condition on domain list update. If a process uses a table, which is reloaded at the same time twice through FIFO, the second reload will delete the original table still in use by the process.

## Chapter�2.�Developer Guide

The module provides is\_domain\_local API function for use by other OpenSIPS modules.

## 2.1.�Available Functions

### 2.1.1.� `is_domain_local(domain)`

Checks if domain given in str\* parameter is local.

The function returns 1 if domain is local and -1 if domain is not local or if an error occurred.

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

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

56

42

427

561

2.

Jan Janak ([@janakj](https://github.com/janakj))

32

21

999

113

3.

Juha Heinanen ([@juha-h](https://github.com/juha-h))

30

20

700

233

4.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

21

14

288

222

5.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

19

16

92

79

6.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

11

8

45

109

7.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

8

5

96

123

8.

Dan Pascu ([@danpascu](https://github.com/danpascu))

8

4

232

101

9.

Andrei Pelinescu-Onciul

8

4

186

121

10.

Henning Westerholt ([@henningw](https://github.com/henningw))

7

5

44

48

  

**All remaining contributors**: Edson Gellert Schubert, Elena-Ramona Modroiu, Maksym Sobolyev ([@sobomax](https://github.com/sobomax)), Jiri Kuthan ([@jiriatipteldotorg](https://github.com/jiriatipteldotorg)), [@coxx](https://github.com/coxx), Konstantin Bokarius, Klaus Darilion, Anca Vamanu, Norman Brandinger ([@NormB](https://github.com/NormB)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), UnixDev, Andreas Granig, John Burke ([@john08burke](https://github.com/john08burke)).

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 3.2.�By Commit Activity

**Table�3.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Oct 2005 - Aug 2025

2.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Jun 2011 - Jun 2024

3.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Feb 2023

4.

John Burke ([@john08burke](https://github.com/john08burke))

Jan 2022 - Jan 2022

5.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Apr 2019

6.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Mar 2014 - Nov 2018

7.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

8.

[@coxx](https://github.com/coxx)

Mar 2010 - Mar 2010

9.

Anca Vamanu

Sep 2009 - Sep 2009

10.

UnixDev

Feb 2009 - Feb 2009

  

**All remaining contributors**: Juha Heinanen ([@juha-h](https://github.com/juha-h)), Henning Westerholt ([@henningw](https://github.com/henningw)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Elena-Ramona Modroiu, Dan Pascu ([@danpascu](https://github.com/danpascu)), Norman Brandinger ([@NormB](https://github.com/NormB)), Andreas Granig, Klaus Darilion, Jan Janak ([@janakj](https://github.com/janakj)), Andrei Pelinescu-Onciul, Jiri Kuthan ([@jiriatipteldotorg](https://github.com/jiriatipteldotorg)).

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�4.�Documentation

## 4.1.�Contributors

**Last edited by:** Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Juha Heinanen ([@juha-h](https://github.com/juha-h)), Elena-Ramona Modroiu, Dan Pascu ([@danpascu](https://github.com/danpascu)), Klaus Darilion, Jan Janak ([@janakj](https://github.com/janakj)).

_Documentation Copyrights:_

Copyright � 2002-2008 Juha Heinanen