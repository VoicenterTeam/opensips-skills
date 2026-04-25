# XCAP Module

---

**List of Tables**

3.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5552224)

3.2. [Most recently active contributors(1) to this module](#idp5668368)

**List of Examples**

1.1. [Set `db_url` parameter](#idp161248)

1.2. [Set `xcap_table` parameter](#idp101776)

1.3. [Set `integrated_xcap_server` parameter](#idp107520)

2.1. [`xcap_api` structure](#idp4408592)

## Chapter�1.�Admin Guide

## 1.1.�Overview

The module contains several parameters and functions common to all modules using XCAP capabilities.

The module is currently used by the following modules: presence\_xml, rls and xcap\_client.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _a database module_.
    

## 1.3.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _libxml-dev_.
    

## 1.4.�Exported Parameters

### 1.4.1.�`db_url`(str)

The database url.

_Default value is “mysql://opensips:opensipsrw@localhost/opensips”._

**Example�1.1.�Set `db_url` parameter**

...
modparam("xcap", "db\_url", "dbdriver://username:password@dbhost/dbname")
...
                

  

### 1.4.2.�`xcap_table`(str)

The name of the db table where XCAP documents are stored.

_Default value is “xcap”._

**Example�1.2.�Set `xcap_table` parameter**

...
modparam("xcap", "xcap\_table", "xcap")
...
                

  

### 1.4.3.�`integrated_xcap_server` (int)

This parameter is a flag for the type of XCAP server or servers used. If integrated ones, like OpenXCAP from AG Projects, with direct access to database table, the parameter should be set to a positive value. Apart from updating in xcap table, the integrated server must send an MI command refershWatchers \[pres\_uri\] \[event\] when a user modifies a rules document.

_Default value is “0”._

**Example�1.3.�Set `integrated_xcap_server` parameter**

...
modparam("xcap", "integrated\_xcap\_server", 1)
...
                

  

## 1.5.�Exported Functions

None to be used in configuration file.

## Chapter�2.�Developer Guide

The module exports a number of parameters and functions that are used in several other modules.

## 2.1.� `bind_xcap_api(xcap_api_t* api)`

This function allows binding the needed functions.

**Example�2.1.�`xcap_api` structure**

...
typedef struct xcap\_api {
        int integrated\_server;
        str db\_url;
        str xcap\_table;
        normalize\_sip\_uri\_t normalize\_sip\_uri;
        parse\_xcap\_uri\_t parse\_xcap\_uri;
        get\_xcap\_doc\_t get\_xcap\_doc;
} xcap\_api\_t;
...
			

  

## 2.2.� `normalize_xcap_uri`

This function normalizes a SIP URI found in a XCAP document. It un-escapes it and adds the SIP scheme in case it was missing. Returns a statically allocated string buffer containing the normalized form.

Parameters:

*   _uri_\- the URI that needs to be normalized
    

## 2.3.� `parse_xcap_uri`

This function parses the given XCAP URI.

Parameters:

*   _uri_\- the URI that needs to be parsed in string format
    
*   _xcap\_uri_\- xcap\_uri\_t structure that will be filled with the parsed information
    
    Parameter type:
    ...
    typedef struct {
        char buf\[MAX\_URI\_SIZE\];
        str uri;
        str root;
        str auid;
        str tree;
        str xui;
        str filename;
        str selector;
    } xcap\_uri\_t;
    ...
                            
    

## 2.4.� `get_xcap_doc`

This function queries the local DB for the required XCAP document. It will return the document and its corresponding etag.

Parameters:

*   _user_\- user part od the URI of the document owner
    
*   _domain_\- domain part od the URI of the document owner
    
*   _type_\- type of the requested document, represents the AUID, can be one of PRES\_RULES, RESOURCE\_LISTS, RLS\_SERVICES, PIDF\_MANIPULATION, OMA\_PRES\_RULES
    
*   _filename_\- if specified it will be used to match the document filename, it defaults to 'index'
    
*   _match\_etag_\- if specified the document is only returned its etag matches this one
    
*   _doc_\- reference to the storage for the returned document
    
*   _etag_\- reference to the storage for the returned document's etag
    

## 2.5.� _`db_url`_

URL of the database to which the XCAP mdoules witll connect.

## 2.6.� _`xcap_table`_

Name of the table used to store XCAP documents. Defaults to 'xcap'.

## 2.7.� _`integrated_server`_

Boolean flag indicating if the XCAP server has access to the local database or xcap\_client will be used to fetch documents.

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

Sa�l Ibarra Corretg� ([@saghul](https://github.com/saghul))

15

3

1260

53

2.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

11

8

55

106

3.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

7

5

25

21

4.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

5

3

6

10

5.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

3

1

13

3

6.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

3

1

7

7

7.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

3

1

2

2

8.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

2

1

2

0

  

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 3.2.�By Commit Activity

**Table�3.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Jul 2014 - May 2024

2.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Feb 2023

3.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Oct 2014 - Mar 2020

4.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Aug 2015 - Sep 2019

5.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

6.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - May 2017

7.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

Jan 2013 - Jan 2013

8.

Sa�l Ibarra Corretg� ([@saghul](https://github.com/saghul))

Nov 2012 - Jan 2013

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�4.�Documentation

## 4.1.�Contributors

**Last edited by:** Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Sa�l Ibarra Corretg� ([@saghul](https://github.com/saghul)).

_Documentation Copyrights:_

Copyright � 2012 AG Projects