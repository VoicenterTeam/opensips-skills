# group Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5728592)

2.2. [Most recently active contributors(1) to this module](#idp5831216)

**List of Examples**

1.1. [Set `db_url` parameter](#idp3828416)

1.2. [Set `table` parameter](#idp248448)

1.3. [Set `user_column` parameter](#idp165712)

1.4. [Set `domain_column` parameter](#idp171456)

1.5. [Set `group_column` parameter](#idp5573392)

1.6. [Set `use_domain` parameter](#idp5578000)

1.7. [Set `re_table` parameter](#idp5582992)

1.8. [Set `re_exp_column` parameter](#idp5588192)

1.9. [Set `re_gid_column` parameter](#idp5593392)

1.10. [Set `multiple_gid` parameter](#idp5598384)

1.11. [Set `aaa_url` parameter](#idp5602176)

1.12. [`db_is_user_in` usage](#idp5616384)

1.13. [`db_get_user_group` usage](#idp5642256)

1.14. [`aaa_is_user_in` usage](#idp5653792)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This module provides functionalities for different methods of group membership checking.

### 1.1.1.�Strict membership checking

There is a database table that contains list of users and groups they belong to. The module provides the possibility to check if a specific user belongs to a specific group.

There is no DB caching support, each check involving a DB query.

### 1.1.2.�Regular Expression based checking

Another database table contains list of regular expressions and group IDs. A matching occurs if the user URI match the regular expression. This type of matching may be used to fetch the group ID(s) the user belongs to (via RE matching) .

Due performance reasons (regular expression evaluation), DB cache support is available: the table content is loaded into memory at startup and all regular expressions are compiled.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   A database module, like mysql, postgres or dbtext.
    
*   An AAA module, like radius or diameter.
    

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _None_.
    

## 1.3.�Exported Parameters

### 1.3.1.�`db_url` (string)

URL of the database table to be used.

**Example�1.1.�Set `db_url` parameter**

...
modparam("group", "db\_url", "mysql://username:password@dbhost/opensips")
...

  

### 1.3.2.�`table` (string)

Name of the table holding strict definitions of groups and their members.

_Default value is “grp”._

**Example�1.2.�Set `table` parameter**

...
modparam("group", "table", "grp\_table")
...

  

### 1.3.3.�`user_column` (string)

Name of the “table” column holding usernames.

_Default value is “username”._

**Example�1.3.�Set `user_column` parameter**

...
modparam("group", "user\_column", "user")
...

  

### 1.3.4.�`domain_column` (string)

Name of the “table” column holding domains.

_Default value is “domain”._

**Example�1.4.�Set `domain_column` parameter**

...
modparam("group", "domain\_column", "realm")
...

  

### 1.3.5.�`group_column` (string)

Name of the “table” column holding groups.

_Default value is “grp”._

**Example�1.5.�Set `group_column` parameter**

...
modparam("group", "group\_column", "grp")
...

  

### 1.3.6.�`use_domain` (integer)

If enabled (set to non zero value) then domain will be used also used for strict group matching; otherwise only the username part will be used.

_Default value is 0 (no)._

**Example�1.6.�Set `use_domain` parameter**

...
modparam("group", "use\_domain", 1)
...

  

### 1.3.7.�`re_table` (string)

Name of the table holding definitions for regular-expression based groups. If no table is defined, the regular-expression support is disabled.

_Default value is “NULL”._

**Example�1.7.�Set `re_table` parameter**

...
modparam("group", "re\_table", "re\_grp")
...

  

### 1.3.8.�`re_exp_column` (string)

Name of the “re\_table” column holding the regular expression used for user matching.

_Default value is “reg\_exp”._

**Example�1.8.�Set `re_exp_column` parameter**

...
modparam("group", "re\_exp\_column", "re")
...

  

### 1.3.9.�`re_gid_column` (string)

Name of the “re\_table” column holding the group IDs.

_Default value is “group\_id”._

**Example�1.9.�Set `re_gid_column` parameter**

...
modparam("group", "re\_gid\_column", "grp\_id")
...

  

### 1.3.10.�`multiple_gid` (integer)

If enabled (non zero value) the regular-expression matching will return all group IDs that match the user; otherwise only the first will be returned.

_Default value is “1”._

**Example�1.10.�Set `multiple_gid` parameter**

...
modparam("group", "multiple\_gid", 0)
...

  

### 1.3.11.�`aaa_url` (string)

This is the url representing the AAA protocol used and the location of the configuration file of this protocol.

**Example�1.11.�Set `aaa_url` parameter**

...
modparam("group", "aaa\_url", "radius:/etc/radiusclient-ng/radiusclient.conf")
...

  

## 1.4.�Exported Functions

### 1.4.1.� `db_is_user_in(uri, group)`

This function is to be used for script group membership. The function returns true if username in the given URI is member of the given group and false if not.

Meaning of the parameters is as follows:

*   _uri (string)_ - a SIP URI whose username and optionally domain to be used. Possible values:
    
    *   "Request-URI" - Use Request-URI username and (optionally) domain.
        
    *   "To" - Use To username and (optionally) domain.
        
    *   "From" - Use From username and (optionally) domain.
        
    *   "Credentials" - Use digest credentials username.
        
    *   (default) - parse the given input as a SIP URI
        
    
*   _group (string)_ - the group to check
    

This function can be used from REQUEST\_ROUTE and FAILURE\_ROUTE.

**Example�1.12.�`db_is_user_in` usage**

...
if (db\_is\_user\_in("Request-URI", "ld")) {
	...
}
...
$avp(grouptocheck)="offline";

if (db\_is\_user\_in("Credentials", $avp(grouptocheck))) {
	...
}
...

  

### 1.4.2.� `db_get_user_group(uri, output_avp)`

This function is to be used for regular expression based group membership, using DB support. The function returns true if the username in the given "uri" belongs to at least one group.

All matching group IDs shall be returned in "output\_avp" if [multiple\_gid](#param_multiple_gid "1.3.10.�multiple_gid (integer)") is enabled, otherwise only the first one to match (the records are attempted in reversed order of the results returned by the RDBMS).

Meaning of the parameters is as follows:

*   _uri (string)_ - a SIP URI to be matched against the regular expressions:
    
    *   "Request-URI" - Use Request-URI
        
    *   "To" - Use To URI.
        
    *   "From" - Use From URI
        
    *   "Credentials" - Use digest credentials username and realm.
        
    *   (default) - parse the given input as a SIP URI
        
    
*   _output\_avp (var)_ - a list of matched group IDs
    

This function can be used from REQUEST\_ROUTE and FAILURE\_ROUTE.

**Example�1.13.�`db_get_user_group` usage**

...
if (db\_get\_user\_group("Request-URI", $avp(10))) {
    xdbg("User $ru belongs to the following groups: $(avp(10)\[\*\])\\n");
    ....
};
...

  

### 1.4.3.� `aaa_is_user_in(uri, group)`

This function checks group membership, using AAA support. The function returns true if username in the given "uri" is member of the given group and false if not.

Meaning of the parameters is as follows:

*   _uri (string)_ - a SIP URI whose username and optionally domain to be used, this can be one of:
    
    *   "Request-URI" - Use Request-URI username and (optionally) domain.
        
    *   "To" - Use To username and (optionally) domain.
        
    *   "From" - Use From username and (optionally) domain.
        
    *   "Credentials" - Use digest credentials username.
        
    
*   _group (string)_ - Name of the group to check.
    

This function can be used from REQUEST\_ROUTE.

**Example�1.14.�`aaa_is_user_in` usage**

...
if (aaa\_is\_user\_in("Request-URI", "ld")) {
	...
};
...

  

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

46

31

848

397

2.

Jan Janak ([@janakj](https://github.com/janakj))

35

20

1370

148

3.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

24

18

176

226

4.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

16

12

87

154

5.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

9

7

16

39

6.

Irina-Maria Stanescu

9

4

466

59

7.

Andrei Pelinescu-Onciul

7

5

101

40

8.

Henning Westerholt ([@henningw](https://github.com/henningw))

7

5

27

46

9.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

5

2

78

106

10.

Sergio Gutierrez

5

1

122

72

  

**All remaining contributors**: Edson Gellert Schubert, Jiri Kuthan ([@jiriatipteldotorg](https://github.com/jiriatipteldotorg)), Maksym Sobolyev ([@sobomax](https://github.com/sobomax)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Walter Doekes ([@wdoekes](https://github.com/wdoekes)), Dan Pascu ([@danpascu](https://github.com/danpascu)), Konstantin Bokarius, Norman Brandinger ([@NormB](https://github.com/NormB)), UnixDev, Anca Vamanu.

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

Mar 2014 - May 2024

2.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Feb 2023

3.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Jun 2011 - Jun 2021

4.

Walter Doekes ([@wdoekes](https://github.com/wdoekes))

Apr 2021 - Apr 2021

5.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - May 2020

6.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Jul 2005 - Mar 2020

7.

Dan Pascu ([@danpascu](https://github.com/danpascu))

Oct 2007 - Apr 2019

8.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Apr 2019

9.

Irina-Maria Stanescu

Aug 2009 - Dec 2009

10.

Anca Vamanu

Sep 2009 - Sep 2009

  

**All remaining contributors**: UnixDev, Sergio Gutierrez, Henning Westerholt ([@henningw](https://github.com/henningw)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Norman Brandinger ([@NormB](https://github.com/NormB)), Jan Janak ([@janakj](https://github.com/janakj)), Andrei Pelinescu-Onciul, Jiri Kuthan ([@jiriatipteldotorg](https://github.com/jiriatipteldotorg)).

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Irina-Maria Stanescu, Sergio Gutierrez, Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Dan Pascu ([@danpascu](https://github.com/danpascu)), Jan Janak ([@janakj](https://github.com/janakj)).

_Documentation Copyrights:_

Copyright � 2009 Voice Sistem SRL

Copyright � 2003 FhG FOKUS