# SQL Cacher Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5711696)

2.2. [Most recently active contributors(1) to this module](#idp5810864)

**List of Examples**

1.1. [`cache_table` parameter usage](#idp5531216)

1.2. [`spec_delimiter` parameter usage](#idp5535904)

1.3. [`pvar_delimiter` parameter usage](#idp5540736)

1.4. [`columns_delimiter` parameter usage](#idp5545904)

1.5. [`sql_fetch_nr_rows` parameter usage](#idp5550448)

1.6. [`full_caching_expire` parameter usage](#idp5554928)

1.7. [`reload_interval` parameter usage](#idp5559376)

1.8. [`bigint_to_str` parameter usage](#idp5563920)

1.9. [`sql_cache_dump` usage](#idp5578448)

1.10. [`sql_cacher_reload` usage](#idp5587856)

1.11. [`sql_cached_value(id{sep}col{sep}key) pseudo-variable` usage](#idp5597616)

1.12. [Example database content - carrierfailureroute table](#idp5603280)

1.13. [Setting the `cache_table` parameter](#idp5606144)

1.14. [Accessing cached values](#idp5608960)

## Chapter�1.�Admin Guide

## 1.1.�Overview

The sql\_cacher module introduces the possibility to cache data from a SQL-based database (using different OpenSIPS modules which implement the DB API) into a cache system implemented in OpenSIPS through the CacheDB Interface. This is done by specifying the databases URLs, SQL table to be used, desired columns to be cached and other details in the OpenSIPS configuration script.

The cached data is available in the script through the read-only pseudovariable “$sql\_cached\_value” similar to a Key-Value system. A specified column from the SQL table has the role of “key” therefore the value of this column along with the name of a required column are provided as "parameters" to the pseudovariable returning the appropriate value of the column.

There are two types of caching available:

*   _full caching_ - the entire SQL table (all the rows) is loaded into the cache at OpenSIPS startup;
    
*   _on demand_ - the rows of the SQL table are loaded at runtime when appropriate keys are requested.
    

For on demand caching, the stored values have a configurable expire period after which they are permanently removed unless an MI reload function is called for a specific key. In the case of full caching the data is automatically reloaded at a configurable interval. Consequently if the data in the SQL database changes and a MI reload function is called, the old data remains in cache only until it expires.

## 1.2.�Dependencies

The following modules must be loaded before this module:

*   _The OpenSIPS modules that offer actual database back-end connection_
    

## 1.3.�Exported Parameters

### 1.3.1.�`cache_table` (string)

This parameter can be set multiple times in order to cache multiple SQL tables or even the same table but with a different configuration. The module distinguishes those different entries by an “id” string.

The caching entry is specified via this parameter that has it's own subparameters. Each of those parameters are separated by a delimiter configured by [spec\_delimiter](#param_spec_delimiter "1.3.2.�spec_delimiter (string)") and have the following format:

_param\_name=param\_value_

The parameters are:

*   _id_ : cache entry id
    
*   _db\_url_ : the URL of the SQL database
    
*   _cachedb\_url_ : the URL of the CacheDB database
    
*   _table_ : SQL database table name
    
*   _key_ : SQL database column name of the “key” column
    
*   _key\_type_ : data type for the SQL "key" column:
    
    *   string
        
    *   int
        
    
    If not present, default value is “string”
    
*   _columns_ : names of the columns to be cached from the SQL database, separated by a delimiter configured by [columns\_delimiter](#param_columns_delimiter "1.3.4.�columns_delimiter (string)").
    
    If not present, all the columns from the table will be cached
    
*   _on\_demand_ : specifies the type of caching:
    
    *   0 : full caching
        
    *   1 : on demand
        
    
    If not present, default value is “0”
    
*   _expire_ : expire period for the values stored in the cache for the on demand caching type in seconds
    
    If not present, default value is “1 hour”
    

The parameters must be given in the exact order specified above.

Overall, the parameter does not have a default value, it must be set at least once in order to cache any table.

**Example�1.1.�`cache_table` parameter usage**

modparam("sql\_cacher", "cache\_table",
"id=caching\_name
db\_url=mysql://root:opensips@localhost/opensips\_2\_2
cachedb\_url=mongodb:mycluster://127.0.0.1:27017/db.col
table=table\_name
key=column\_name\_0
columns=column\_name\_1 column\_name\_2 column\_name\_3
on\_demand=0")

  

### 1.3.2.�`spec_delimiter` (string)

The delimiter to be used in the caching entry specification provided in the _cache\_table_ parameter to separate the subparameters. It must be a single character.

The default value is newline.

**Example�1.2.�`spec_delimiter` parameter usage**

modparam("sql\_cacher", "spec\_delimiter", "\\n")

  

### 1.3.3.�`pvar_delimiter` (string)

The delimiter to be used in the “$sql\_cached\_value” pseudovariable to separate the caching id, the desired column name and the value of the key. It must be a single character.

The default value is “:”.

**Example�1.3.�`pvar_delimiter` parameter usage**

modparam("sql\_cacher", "pvar\_delimiter", " ")

  

### 1.3.4.�`columns_delimiter` (string)

The delimiter to be used in the _columns_ subparameter of the caching entry specification provided in the _cache\_table_ parameter to separate the desired columns names. It must be a single character.

The default value is “ ”(space).

**Example�1.4.�`columns_delimiter` parameter usage**

modparam("sql\_cacher", "columns\_delimiter", ",")

  

### 1.3.5.�`sql_fetch_nr_rows` (integer)

The number of rows to be fetched into OpenSIPS private memory in one chunk from the SQL database driver. When querying large tables, adjust this parameter accordingly to avoid the filling of OpenSIPS private memory.

The default value is “100”.

**Example�1.5.�`sql_fetch_nr_rows` parameter usage**

modparam("sql\_cacher", "sql\_fetch\_nr\_rows", 1000)

  

### 1.3.6.�`full_caching_expire` (integer)

Expire period for the values stored in cache for the full caching type in seconds. This is the longest time that deleted or modified data remains in cache.

The default value is “24 hours”.

**Example�1.6.�`full_caching_expire` parameter usage**

modparam("sql\_cacher", "full\_caching\_expire", 3600)

  

### 1.3.7.�`reload_interval` (integer)

This parameter represents how many seconds before the data expires (for full caching) the automatic reloading is triggered.

The default value is “60 s”.

**Example�1.7.�`reload_interval` parameter usage**

modparam("sql\_cacher", "reload\_interval", 5)

  

### 1.3.8.�`bigint_to_str` (integer)

Controls bigint conversion. By default bigint values are returned as int. If the value stored in bigint is out of the int range, by enabling bigint to string conversion, the bigint value will be returned as string.

The default value is “0” (disabled).

**Example�1.8.�`bigint_to_str` parameter usage**

modparam("sql\_cacher", "bigint\_to\_str", 1)

  

## 1.4.�Exported Functions

### 1.4.1.� `sql_cache_dump(caching_id, columns, result_avps)`

Dump all _columns_ cached within the given _caching\_id_, and write them to their respective _result\_avps_.

Parameters:

*   _caching\_id_ (string) - Identifier for the SQL cache
    
*   _columns_ (string) - the desired SQL columns to be dumped, specified as comma-separated values
    
*   _result\_avps_ (string) - comma-separated list of AVPs where the results will be written to
    

Return Codes:

*   **\-1** - Internal Error
    
*   **\-2** - Zero Results Returned
    
*   **1, 2, 3, ...** - Number of results returned into each output AVP
    

This function can be used from any route.

**Example�1.9.�`sql_cache_dump` usage**

...
# Example of pulling all cached CNAM records
$var(n) = sql\_cache\_dump("cnam", "caller,callee,calling\_name,fraud\_score",
                "$avp(caller),$avp(callee),$avp(cnam),$avp(fraud)");
$var(i) = 0;
while ($var(i) < $var(n)) {
	xlog("Caller $(avp(caller)\[$var(i)\]) has CNAM $(avp(cnam)\[$var(i)\])\\n");
	$var(i) += 1;
}
...

  

## 1.5.�Exported MI Functions

### 1.5.1.�`sql_cacher_reload`

Reloads the entire SQL table in cache or the single key (if key provided) in _full caching_ mode.

Reloads the given key or invalidates all the keys in cache in _on demand_ mode.

Parameters:

*   _id_ - the caching entry's id
    
*   _key_ (optional) - the specific key to be reloaded.
    

**Example�1.10.�`sql_cacher_reload` usage**

...
$ opensips-cli -x mi sql\_cacher\_reload subs\_caching
...
$ opensips-cli -x mi sql\_cacher\_reload subs\_caching alice@domain.com
...

  

## 1.6.�Exported Pseudo-Variables

### 1.6.1.�`$sql_cached_value(id{sep}col{sep}key)`

The cached data is available through this read-only PV.The format is the following:

*   _sep_ : separator configured by [pvar\_delimiter](#param_pvar_delimiter "1.3.3.�pvar_delimiter (string)")
    
*   _id_ : cache entry id
    
*   _col_ : name of the required column
    
*   _key_ : value of the “key” column
    

**Example�1.11.�`sql_cached_value(id{sep}col{sep}key) pseudo-variable` usage**

...
$avp(a) = $sql\_cached\_value(caching\_name:column\_name\_1:key1);
...
				 

  

## 1.7.�Usage Example

This section provides an usage example for the caching of an SQL table.

Suppose one in interested in caching the columns: “host\_name”, “reply\_code”, “flags” and “next\_domain” from the “carrierfailureroute” table of the OpenSIPS database.

**Example�1.12.�Example database content - carrierfailureroute table**

...
+----+---------+-----------+------------+--------+-----+-------------+
| id | domain  | host\_name | reply\_code | flags | mask | next\_domain |
+----+---------+-----------+------------+-------+------+-------------+
|  1 |      99 |           | 408        |    16 |   16 |             |
|  2 |      99 | gw1       | 404        |     0 |    0 | 100         |
|  3 |      99 | gw2       | 50.        |     0 |    0 | 100         |
|  4 |      99 |           | 404        |  2048 | 2112 | asterisk-1  |
+----+---------+-----------+------------+-------+------+-------------+
...
		

  

In the first place, the details of the caching must be provided by setting the module parameter “cache\_table” in the OpenSIPS configuration script.

**Example�1.13.�Setting the `cache_table` parameter**

modparam("sql\_cacher", "cache\_table",
"id=carrier\_fr\_caching
db\_url=mysql://root:opensips@localhost/opensips
cachedb\_url=mongodb:mycluster://127.0.0.1:27017/my\_db.col
table=carrierfailureroute
key=id
columns=host\_name reply\_code flags next\_domain")
		

  

Next, the values of the cached columns ca be accessed through the “$sql\_cached\_value” PV.

**Example�1.14.�Accessing cached values**

...
$avp(rc1) = $sql\_cached\_value(carrier\_fr\_caching:reply\_code:1);
$avp(rc2) = $sql\_cached\_value(carrier\_fr\_caching:reply\_code:2);
...
var(some\_id)=4;
$avp(nd) = $sql\_cached\_value(carrier\_fr\_caching:next\_domain:$var(some\_id));
...
xlog("host name is: $sql\_cached\_value(carrier\_fr\_caching:host\_name:2)");
...
		

  

## 1.8.�Exported Status/Report Identifiers

The module provides the "sql\_cacher" Status/Report group, where each full cache is defined as a separate SR identifier. NOTE that there are no identifiers created for the on-demand caches.

### 1.8.1.�`[cache_entry_id]`

The status of these identifiers reflects the readiness/status of the cached data (if available or not when being loaded from DB):

*   _\-2_ - no data at all (initial status)
    
*   _\-1_ - no data, initial loading in progress
    
*   _1_ - data loaded, partition ready
    
*   _2_ - data available, a reload in progress
    

In terms of reports/logs, the following events will be reported:

*   starting DB data loading
    
*   DB data loading failed, discarding
    
*   DB data loading successfully completed
    
*   N records loaded)
    

For how to access and use the Status/Report information, please see [https://www.opensips.org/Documentation/Interface-StatusReport-3-3](>https://www.opensips.org/Documentation/Interface-StatusReport-3-3).

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

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

94

44

3640

1114

2.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

30

22

498

150

3.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

16

14

33

15

4.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

13

10

128

31

5.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

7

5

83

7

6.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

7

5

8

9

7.

Bence Szigeti

4

2

3

2

8.

Ionel Cerghit ([@ionel-cerghit](https://github.com/ionel-cerghit))

4

1

50

92

9.

Dan Pascu ([@danpascu](https://github.com/danpascu))

3

1

1

1

10.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

3

1

1

1

  

**All remaining contributors**: Walter Doekes ([@wdoekes](https://github.com/wdoekes)), Gang Zhuo.

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 2.2.�By Commit Activity

**Table�2.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Mar 2016 - May 2025

2.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Feb 2016 - Jul 2024

3.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

May 2017 - Apr 2024

4.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

Mar 2017 - Apr 2024

5.

Bence Szigeti

Jan 2024 - Jan 2024

6.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Oct 2020 - Nov 2023

7.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

Aug 2015 - Jul 2022

8.

Gang Zhuo

Nov 2021 - Nov 2021

9.

Walter Doekes ([@wdoekes](https://github.com/wdoekes))

Apr 2021 - Apr 2021

10.

Dan Pascu ([@danpascu](https://github.com/danpascu))

May 2019 - May 2019

  

**All remaining contributors**: Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Ionel Cerghit ([@ionel-cerghit](https://github.com/ionel-cerghit)).

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)).

_Documentation Copyrights:_

Copyright � 2015 [www.opensips-solutions.com](http://www.opensips-solutions.com/)