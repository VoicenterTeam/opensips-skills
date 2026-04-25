# DB\_HTTP Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5740432)

2.2. [Most recently active contributors(1) to this module](#idp5840256)

**List of Examples**

1.1. [Setting db\_url for a module](#idp2024864)

1.2. [Set `SSL` parameter](#idp258896)

1.3. [Set `cap_raw_query` parameter](#idp161536)

1.4. [Set `cap_replace` parameter](#idp166752)

1.5. [Set `cap_insert_update` parameter](#idp171968)

1.6. [Set `cap_last_inserted_id` parameter](#idp5562912)

1.7. [Set `field_delimiter` parameter](#idp5567728)

1.8. [Set `row_delimiter` parameter](#idp5572544)

1.9. [Set `quote_delimiter` parameter](#idp5577488)

1.10. [Set `value_delimiter` parameter](#idp5595104)

1.11. [Set `timeout` parameter](#idp5599920)

1.12. [Set `disable_expect` parameter](#idp5605008)

1.13. [Example query.](#idp5611088)

1.14. [Example query with variables.](#idp5626512)

1.15. [More query examples.](#idp5639168)

1.16. [NULL query example.](#idp5642160)

1.17. [Example Reply.](#idp5647728)

1.18. [Quoting Example.](#idp5651552)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This module provides access to a database that is implemented as a HTTP server. It may be used in special cases where traversing firewalls is a problem, or where data encryption is required.

In order to use this module you must have a server that can communicate via HTTP or HTTPS with this module that follows exactly the format decribed in the specifications section.

The module can provide SSL, authentication, and all the functionalities of an opensips db as long as the server supports them ( except result\_fetch).

There is a slight difference between the url of db\_http and the urls of the other db modules. The url doesn't have to contain the database name. Instead, everything that is after the address is considered to be a path to the db resource, it may be missing.

Even if using HTTPS the url must begin with "http://" , and the SSL parameter for the module must be set to 1.

**Example�1.1.�Setting db\_url for a module**

...
modparam("presence", "db\_url","http://user:pass@localhost:13100")
or
modparam("presence", "db\_url","http://user:pass@www.some.com/some/some")
...

  

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

This module does not depend on other modules.

### 1.2.2.�External Libraries or Applications

*   _libcurl_.
    

## 1.3.�Exported Parameters

### 1.3.1.�`SSL`(int)

Whether or not to use SSL.

If value is 1 the module will use https otherwise it will use http.

_Default value is “ 0 ”._

**Example�1.2.�Set `SSL` parameter**

...
modparam("db\_http", "SSL",1)
...

  

### 1.3.2.�`cap_raw_query`(int)

Whether or not the server supports raw queries.

_Default value is “0”._

**Example�1.3.�Set `cap_raw_query` parameter**

...
modparam("db\_http", "cap\_raw\_query", 1)
...

  

### 1.3.3.�`cap_replace`(int)

Whether or not the server supports replace capabilities.

_Default value is “0”._

**Example�1.4.�Set `cap_replace` parameter**

...
modparam("db\_http", "cap\_replace", 1)
...

  

### 1.3.4.�`cap_insert_update`(int)

Whether or not the server supports insert\_update capabilities.

_Default value is “0”._

**Example�1.5.�Set `cap_insert_update` parameter**

...
modparam("db\_http", "cap\_insert\_update", 1)
...

  

### 1.3.5.�`cap_last_inserted_id`(int)

Whether or not the server supports last\_inserted\_id capabilities.

_Default value is “0”._

**Example�1.6.�Set `cap_last_inserted_id` parameter**

...
modparam("db\_http", "cap\_last\_inserted\_id", 1)
...

  

### 1.3.6.�`field_delimiter` (str)

Character to be used to delimit fields in the reply.Only one char may be set.

_Default value is “;”_

**Example�1.7.�Set `field_delimiter` parameter**

...
modparam("db\_http", "field\_delimiter",";")
...

  

### 1.3.7.�`row_delimiter` (str)

Character to be used to delimit rows in the reply.Only one char may be set.

_Default value is “\\n”_

**Example�1.8.�Set `row_delimiter` parameter**

...
modparam("db\_http", "row\_delimiter","\\n")
...

  

### 1.3.8.�`quote_delimiter` (str)

Character to be used to quote fields that require quoting in the reply.Only one char may be set.

_Default value is “|”_

**Example�1.9.�Set `quote_delimiter` parameter**

...
modparam("db\_http", "quote\_delimiter","|")
...

  

### 1.3.9.�`value_delimiter` (str)

The delimiter used to separate multiple fields of a single variable (see [Section�1.5.2, “Variables”](#http-variables "1.5.2.�Variables")). Only one char may be set.

_Default value is “,”_

**Example�1.10.�Set `value_delimiter` parameter**

...
modparam("db\_http", "value\_delimiter",";")
...

  

### 1.3.10.�`timeout` (int)

The maximum number of milliseconds that the HTTP ops are allowed to last

_Default value is “30000 ( 30 seconds )”_

**Example�1.11.�Set `timeout` parameter**

...
modparam("db\_http", "timeout",5000)
...

  

### 1.3.11.�`disable_expect` (int)

Disables automatic 'Expect: 100-continue' behavior in libcurl for requests over 1024 bytes in size. This can help reduce latency by saving a network round-trip for large records. For more information on this behavior please seee rfc2616 section 8.2.3.

_Default value is “0 (off)”_

**Example�1.12.�Set `disable_expect` parameter**

...
modparam("db\_http", "disable\_expect",1)
...

  

## 1.4.�Exported Functions

This module does not export any functions.

## 1.5.�Server specifications

### 1.5.1.�Queries

The server must accept queries as HTTP queries.

The queries are of 2 types : GET and POST.Both set variables that must be interpreted by the server. All values are URL-encoded.

There are several types of queries and the server can tell them apart by the query\_type variable. Each type of query uses specific variables simillar to those in the opensips db\_api.

**Example�1.13.�Example query.**

...
GET /presentity/?c=username,domain,event,expires HTTP/1.1
...

  

### 1.5.2.�Variables

A description of all the variables. Each variable can have either a single value or a comma-separated list of values. Each variable has a special meaning and can be used only with certain queries.

The table on which operations will take place will be encoded in the url as the end of the url ( www.some.com/users will point to the users table).

*   k=
    
    Describes the keys (columns) that will be used for comparison.Can have multiple values.
    
*   op=
    
    Describes the operators that will be used for comparison.Can have multiple values.
    
*   v=
    
    Describes the values that columns will be compaired against. Can have multiple values.
    
*   c=
    
    Describes the columns that will be selected from the result.Can have multiple values.
    
*   o=
    
    The column that the result will be ordered by. Has a single value.
    
*   uk=
    
    The keys(columns) that will be updated. Can have multiple values.
    
*   uv=
    
    The new values that will be put in the columns. Can have multiple values.
    
*   q=
    
    Describes a raw query. Will only be used if the server supports raw queries. Has a single value.
    
*   query\_type=
    
    Describes the type of the current query. Can have a single value as described in the Query Types section.Has a single value. Will be present in all queries except the "SELECT" (normal query).
    

**Example�1.14.�Example query with variables.**

...
GET /presentity/?c=username,domain,event,expires HTTP/1.1
GET /version/?k=table\_name&v=xcap&c=table\_version HTTP/1.1 
...
...
POST /active\_watchers HTTP/1.1

k=id&v=100&query\_type=insert
...

  

### 1.5.3.�Query Types

The types of the queries are described by the query\_type variable. The value of the variable will be set to the exact name of the query.

Queries for "SELECT" use GET and the rest use POST (insert, update, delete, replace, insert\_update).

*   normal query
    
    Uses the k, op, v, c and o variables. This will not set the query\_type variable and will use GET.
    
*   delete
    
    Uses the k, op and v variables.
    
*   insert
    
    Uses the k and v variables.
    
*   update
    
    Uses the k,op,v,uk and uv variables.
    
*   replace
    
    Uses the k and v variables. This is an optional type of query. If the module is not configured to use it it will not.
    
*   insert\_update
    
    Uses the k and v variables. This is an optional type of query. If the module is not configured to use it it will not.
    
*   custom
    
    Uses the q variable. This is an optional type of query. If the module is not configured to use it it will not.
    

**Example�1.15.�More query examples.**

...
POST /active\_watchers HTTP/1.1

k=id&op=%3D&v=100&query\_type=delete
...

...
POST /active\_watchers HTTP/1.1

k=id&op=%3D&v=100&uk=id&uv=101&query\_type=update
...

  

### 1.5.4.�NULL values in queries

NULL values in queries are represented as a string of length 1 containing a single character with value '\\0'.

**Example�1.16.�NULL query example.**

...
POST /active\_watchers HTTP/1.1

k=id&op=%3D&v=%00&query\_type=delete
...

  

### 1.5.5.�Server Replies

If the query is ok (even if the answer is empty) the server must reply with a 200 OK HTTP reply with a body containing the types and values of the columns.

The server must reply with a delimiter separated list of values and columns.

Each element in the list must be seperated from the one before it by a field delimiter that must be the same as the one set as a parameter from the script for the module. The last element of each line must not be followed by a field delimiter, but by a row delimiter.

The first line of the reply must contain a list of the types of values of each column. The types can be any from the list: integer, string, str, blob, date.

Each following line contains the values of each row from the result.

If the query produced an error the server must reply with a HTTP 500 reply, or with a corresponding error code (404, 401).

**Example�1.17.�Example Reply.**

...
int;string;blob
6;something=something;1000
100;mine;10002030
...

  

### 1.5.6.�Reply Quoting

Because the values may contain delimiters inside, the server must perform quoting when necessary (there is no problem if it does it even when it is not necessary).

A quote delimiter must be defined and must be the same as the one set from the script ( by default it is "|" ).

If a value contains a field , row or a quote delimiter it must be placed under quotes. A quote delimiter inside a value must be preceeded by another quote delimiter.

**Example�1.18.�Quoting Example.**

...
int;string;blob
6;|ana;maria|;1000
100;mine;10002030
3;mine;|some||more;|
...

  

### 1.5.7.�Last inserted id

This is an optional feature and may be enabled if one wants to use it.

In order to use this feature the server must place the id of the last insert in the 200 reply for each insert query.

### 1.5.8.�Authentication and SSL

If the server supports authentication and SSL, the module can be enabled to use SSL. Authentication will always be used if needed.

The module will try to use the most secure type of authentication that is provided by the server from: Basic, Digest,GSSNEGOTIATE and NTLM.

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

Andrei Dragus

22

2

2289

5

2.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

14

12

71

20

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

10

8

25

48

4.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

9

7

48

52

5.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

6

4

65

7

6.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

6

4

62

9

7.

Ryan Bullock ([@rrb3942](https://github.com/rrb3942))

5

3

42

1

8.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

4

2

6

6

9.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

4

2

5

5

10.

Dusan Klinec ([@ph4r05](https://github.com/ph4r05))

3

1

50

26

  

**All remaining contributors**: Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)), Anca Vamanu, Ezequiel Lovelle ([@lovelle](https://github.com/lovelle)), Stephane Alnet.

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

Dec 2009 - Nov 2025

2.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Oct 2025

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Mar 2014 - May 2023

4.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Feb 2023

5.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - May 2021

6.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Oct 2011 - Jan 2021

7.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

Mar 2020 - Mar 2020

8.

Ryan Bullock ([@rrb3942](https://github.com/rrb3942))

Jan 2019 - Feb 2019

9.

Dusan Klinec ([@ph4r05](https://github.com/ph4r05))

Dec 2015 - Dec 2015

10.

Ezequiel Lovelle ([@lovelle](https://github.com/lovelle))

Oct 2014 - Oct 2014

  

**All remaining contributors**: Stephane Alnet, Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)), Anca Vamanu, Andrei Dragus.

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Ryan Bullock ([@rrb3942](https://github.com/rrb3942)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Stephane Alnet, Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Andrei Dragus.

_Documentation Copyrights:_

Copyright � 2009 Voice Sistem SRL