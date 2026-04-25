# SpeedDial Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp1728656)

2.2. [Most recently active contributors(1) to this module](#idp1995232)

**List of Examples**

1.1. [Set `db_url` parameter](#idp4219824)

1.2. [Set `user_column` parameter](#idp3574624)

1.3. [Set `domain_column` parameter](#idp4735952)

1.4. [Set `sd_user_column` parameter](#idp2513168)

1.5. [Set `sd_domain_column` parameter](#idp3891664)

1.6. [Set `new_uri_column` parameter](#idp3791392)

1.7. [Set `domain_prefix` parameter](#idp5582848)

1.8. [Set `use_domain` parameter](#idp4220720)

1.9. [`sd_lookup` usage](#idp4187520)

1.10. [OpenSIPS config script - sample speeddial usage](#idp4954944)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This module provides on-server speed dial facilities. An user can store records consisting of pairs short numbers (2 digits) and SIP addresses into a table of OpenSIPS. Then it can dial the two digits whenever it wants to call the SIP address associated with them.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _database module (mysql, dbtext, ...)_.
    

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _None_.
    

## 1.3.�Exported Parameters

### 1.3.1.�`db_url` (string)

The URL of database where the table containing speed dial records.

_Default value is mysql://opensipsro:opensipsro@localhost/opensips._

**Example�1.1.�Set `db_url` parameter**

...
modparam("speeddial", "db\_url", "mysql://user:xxx@localhost/db\_name")
...

  

### 1.3.2.�`user_column` (string)

The name of column storing the user name of the owner of the speed dial record.

_Default value is “username”._

**Example�1.2.�Set `user_column` parameter**

...
modparam("speeddial", "user\_column", "userid")
...

  

### 1.3.3.�`domain_column` (string)

The name of column storing the domain of the owner of the speed dial record.

_Default value is “domain”._

**Example�1.3.�Set `domain_column` parameter**

...
modparam("speeddial", "domain\_column", "userdomain")
...

  

### 1.3.4.�`sd_user_column` (string)

The name of the column storing the user part of the short dial address.

_Default value is “sd\_username”._

**Example�1.4.�Set `sd_user_column` parameter**

...
modparam("speeddial", "sd\_user\_column", "short\_user")
...

  

### 1.3.5.�`sd_domain_column` (string)

The name of the column storing the domain of the short dial address.

_Default value is “sd\_domain”._

**Example�1.5.�Set `sd_domain_column` parameter**

...
modparam("speeddial", "sd\_domain\_column", "short\_domain")
...

  

### 1.3.6.�`new_uri_column` (string)

The name of the column containing the URI that will be use to replace the short dial URI.

_Default value is “new\_uri”._

**Example�1.6.�Set `new_uri_column` parameter**

...
modparam("speeddial", "new\_uri\_column", "real\_uri")
...

  

### 1.3.7.�`domain_prefix` (string)

If the domain of the owner (From URI) starts with the value of this parameter, then it is stripped before performing the lookup of the short number.

_Default value is NULL._

**Example�1.7.�Set `domain_prefix` parameter**

...
modparam("speeddial", "domain\_prefix", "tel.")
...

  

### 1.3.8.�`use_domain` (int)

The parameter specifies wheter or not to use the domain when searching a speed dial record (0 - no domain, 1 - use domain from From URI, 2 - use both domains, from From URI and from request URI).

_Default value is 0._

**Example�1.8.�Set `use_domain` parameter**

...
modparam("speeddial", "use\_domain", 1)
...

  

## 1.4.�Exported Functions

### 1.4.1.� `sd_lookup(table [, owner])`

The function lookups the short dial number from R-URI in 'table' and replaces the R-URI with associated address.

Meaning of the parameters is as follows:

*   _table_ (string) - The name of the table storing the speed dial records.
    
*   _owner_ (string) - The SIP URI of the owner of short dialing codes. If not pressent, URI of From header is used.
    

This function can be used from REQUEST\_ROUTE.

**Example�1.9.�`sd_lookup` usage**

...
# 'speed\_dial' is the default table name created by opensips db script
if($ru=~"sip:\[0-9\]{2}@.\*")
	sd\_lookup("speed\_dial");
# use auth username
if($ru=~"sip:\[0-9\]{2}@.\*")
	sd\_lookup("speed\_dial", "sip:$au@$fd");
...

  

## 1.5.�Installation and Running

### 1.5.1.�OpenSIPS config file

Next picture displays a sample usage of speeddial.

**Example�1.10.�OpenSIPS config script - sample speeddial usage**

...
# sample config script to use speeddial module
#

# ----------- global configuration parameters ------------------------

check\_via=no	# (cmd. line: -v)
dns=no          # (cmd. line: -r)
rev\_dns=no      # (cmd. line: -R)

# ------------------ module loading ----------------------------------

mpath="/usr/local/lib/opensips/modules"
loadmodule "sl.so"
loadmodule "tm.so"
loadmodule "rr.so"
loadmodule "maxfwd.so"
loadmodule "usrloc.so"
loadmodule "registrar.so"
loadmodule "textops.so"
loadmodule "mysql.so"
loadmodule "speeddial.so"
loadmodule "mi\_fifo.so"

# ----------------- setting module-specific parameters ---------------

# -- mi\_fifo params --

modparam("mi\_fifo", "fifo\_name", "/tmp/opensips\_fifo")

# -- usrloc params --

modparam("usrloc", "db\_mode",   0)

# -------------------------  request routing logic -------------------

# main routing logic
route{

	# initial sanity checks 
	if (!mf\_process\_maxfwd\_header("10"))
	{
		sl\_send\_reply(483,"Too Many Hops");
		exit;
	};
	if ($ml >=  65535 )
	{
		sl\_send\_reply(513, "Message too big");
		exit;
	};

	if (!$rm=="REGISTER") record\_route();

	if (loose\_route())
	{
		if (!t\_relay())
		{
			sl\_reply\_error();
		};
		exit;
	};

	if (!is\_myself("$rd"))
	{
		if (!t\_relay())
		{
			sl\_reply\_error();
		};
		exit;
	};

	if (is\_myself("$rd"))
	{
		if ($rm=="REGISTER")
		{
			save("location");
			exit;
		};

		if($ru=~"sip:\[0-9\]{2}@.\*")
			sd\_lookup("speeddial");

		lookup("aliases");
		if (!is\_myself("$rd"))
		{
			if (!t\_relay())
			{
				sl\_reply\_error();
			};
			exit;
		};

		if (!lookup("location"))
		{
			sl\_send\_reply(404, "Not Found");
			exit;
		};
	};

	if (!t\_relay())
	{
		sl\_reply\_error();
	};
}


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

27

23

90

147

2.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

21

16

127

137

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

15

12

38

61

4.

Elena-Ramona Modroiu

12

2

1063

1

5.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

8

6

11

8

6.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

6

4

31

35

7.

Henning Westerholt ([@henningw](https://github.com/henningw))

4

2

50

41

8.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

4

2

4

5

9.

Elena-Ramona Modroiu

4

2

4

1

10.

Sergio Gutierrez

4

2

2

2

  

**All remaining contributors**: Walter Doekes ([@wdoekes](https://github.com/wdoekes)), Anca Vamanu, Andrei Pelinescu-Onciul, Konstantin Bokarius, Juli�n Moreno Pati�o, Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Edson Gellert Schubert.

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

Walter Doekes ([@wdoekes](https://github.com/wdoekes))

Apr 2021 - Apr 2021

4.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Aug 2015 - Jul 2020

5.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Oct 2005 - Mar 2020

6.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Apr 2019

7.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

8.

Juli�n Moreno Pati�o

Feb 2016 - Feb 2016

9.

Sergio Gutierrez

Nov 2008 - Dec 2008

10.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

May 2006 - Mar 2008

  

**All remaining contributors**: Konstantin Bokarius, Edson Gellert Schubert, Henning Westerholt ([@henningw](https://github.com/henningw)), Anca Vamanu, Elena-Ramona Modroiu, Andrei Pelinescu-Onciul, Elena-Ramona Modroiu.

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Sergio Gutierrez, Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Elena-Ramona Modroiu, Elena-Ramona Modroiu.

_Documentation Copyrights:_

Copyright � 2004 Voice Sistem SRL