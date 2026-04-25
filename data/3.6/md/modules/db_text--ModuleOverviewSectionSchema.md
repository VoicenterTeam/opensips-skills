# db\_text Module

---

**List of Tables**

3.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5735280)

3.2. [Most recently active contributors(1) to this module](#idp5799984)

**List of Examples**

1.1. [Sample of a db\_text table](#idp173232)

1.2. [Minimal OpenSIPS location db\_text table definition](#idp5575408)

1.3. [Minimal OpenSIPS subscriber db\_text table example](#idp5576800)

1.4. [Set `db_mode` parameter](#idp5591024)

1.5. [Set `buffer_size` parameter](#idp5595840)

1.6. [Load the db\_text module](#idp5617184)

1.7. [Definition of 'subscriber' table (one line)](#idp5620608)

1.8. [Definition of 'location' and 'aliases' tables (one line)](#idp5622320)

1.9. [Definition of 'version' table and sample records](#idp5624000)

1.10. [Configuration file](#idp5625488)

## Chapter�1.�Admin Guide

## 1.1.�Overview

The module implements a simplified database engine based on text files. It can be used by OpenSIPS DB interface instead of other database module (like MySQL).

The module is meant for use in demos or small devices that do not support other DB modules. It keeps everything in memory and if you deal with large amount of data you may run quickly out of memory. Also, it has not implemented all standard database facilities (like order by), it includes minimal functionality to work properly with OpenSIPS

NOTE: the timestamp is printed in an integer value from time\_t structure. If you use it in a system that cannot do this conversion, it will fail (support for such situation is in to-do list).

NOTE: even when is in non-caching mode, the module does not write back to hard drive after changes. In this mode, the module checks if the corresponding file on disk has changed, and reloads it. The write on disk happens at OpenSIPS shut down.

### 1.1.1.�Design of db\_text engine

The db\_text database system architecture:

*   a database is represented by a directory in the local file system. NOTE: when you use _db\_text_ in OpenSIPS, the database URL for modules must be the path to the directory where the table-files are located, prefixed by “text://”, e.g., “text:///var/dbtext/opensips”. If there is no “/” after “text://” then “CFG\_DIR/” is inserted at the beginning of the database path. So, either you provide an absolute path to database directory or a relative one to “CFG\_DIR” directory.
    
*   a table is represented by a text file inside database directory.
    

### 1.1.2.�Internal format of a db\_text table

First line is the definition of the columns. Each column must be declared as follows:

*   the name of column must not include white spaces.
    
*   the format of a column definition is: _name(type,attr)_.
    
*   between two column definitions must be a white space, e.g., “first\_name(str) last\_name(str)”.
    
*   the type of a column can be:
    
    *   _int_ - integer numbers.
        
    *   _double_ - real numbers with two decimals.
        
    *   _str_ - strings with maximum size of 4KB.
        
    
*   a column can have one of the attributes:
    
    *   _auto_ - only for 'int' columns, the maximum value in that column is incremented and stored in this field if it is not provided in queries.
        
    *   _null_ - accept null values in column fields.
        
    *   if no attribute is set, the fields of the column cannot have null value.
        
    
*   each other line is a row with data. The line ends with “\\n”.
    
*   the fields are separated by “:”.
    
*   no value between two ':' (or between ':' and start/end of a row) means “null” value.
    
*   next characters must be escaped in strings: “\\n”, “\\r”, “\\t”, “:”.
    
*   _0_ -- the zero value must be escaped too.
    

**Example�1.1.�Sample of a db\_text table**

...
id(int,auto) name(str) flag(double) desc(str,null)
1:nick:0.34:a\\tgood\\: friend
2:cole:-3.75:colleague
3:bob:2.50:
...

  

**Example�1.2.�Minimal OpenSIPS location db\_text table definition**

...
username(str) contact(str) expires(int) q(double) callid(str) cseq(int)
...

  

**Example�1.3.�Minimal OpenSIPS subscriber db\_text table example**

...
username(str) password(str) ha1(str) domain(str) ha1b(str)
suser:supasswd:xxx:alpha.org:xxx
...

  

### 1.1.3.�Existing limitations

This database interface don't support the data insertion with default values. All such values specified in the database template are ignored. So its advisable to specify all data for a column at insertion operations.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS modules

The next modules must be loaded before this module:

*   _none_.
    

### 1.2.2.�External libraries or applications

The next libraries or applications must be installed before running OpenSIPS with this module:

*   _none_.
    

## 1.3.�Exported Parameters

### 1.3.1.�`db_mode` (integer)

Set caching mode (0) or non-caching mode (1). In caching mode, data is loaded at startup. In non-caching mode, the module check every time a table is requested whether the corresponding file on disk has changed, and if yes, will re-load table from file.

_Default value is “0”._

**Example�1.4.�Set `db_mode` parameter**

...
modparam("db\_text", "db\_mode", 1)
...

  

### 1.3.2.�`buffer_size` (integer)

Size of the buffer used to read the text file.

_Default value is “4096”._

**Example�1.5.�Set `buffer_size` parameter**

...
modparam("db\_text", "buffer\_size", 8192)
...

  

## 1.4.�Exported Functions

_None_.

## 1.5.�Exported MI Functions

### 1.5.1.�`dbt_dump`

Write back to hard drive modified tables.

Name: _dbt\_dump_.

Parameters: none

MI FIFO Command Format:

opensips-cli -x mi dbt\_dump
		

### 1.5.2.�`dbt_reload`

Causes db\_text module to reload cached tables from disk. Depending on parameters it could be a whole cache or a specified database or a single table. If any table cannot be reloaded from disk - the old version preserved and error reported.

Name: _dbt\_reload_.

Parameters:

*   _db\_name_ (optional) - database name to reload.
    
*   _table\_name_ (optional, but cannot be present without the db\_name parameter) - specific table to reload.
    

MI FIFO Command Format:

opensips-cli -x mi dbt\_reload
		

opensips-cli -x mi dbt\_reload /path/to/dbtext/database
		

opensips-cli -x mi dbt\_reload /path/to/dbtext/database table\_name
		

## 1.6.�Installation and Running

Compile the module and load it instead of mysql or other DB modules.

REMINDER: when you use _db\_text_ in OpenSIPS, the database URL for modules must be the path to the directory where the table-files are located, prefixed by “text://”, e.g., “text:///var/dbtext/opensips”. If there is no “/” after “text://” then “CFG\_DIR/” is inserted at the beginning of the database path. So, either you provide an absolute path to database directory or a relative one to “CFG\_DIR” directory.

**Example�1.6.�Load the db\_text module**

...
loadmodule "/path/to/opensips/modules/db\_text.so"
...
modparam("module\_name", "database\_URL", "text:///path/to/dbtext/database")
...

  

### 1.6.1.�Using db\_text with basic OpenSIPS configuration

Here are the definitions for most important table as well as a basic configuration file to use db\_text with OpenSIPS. The table structures may change in time and you will have to adjust next examples.

You have to populate the table 'subscriber' by hand with user profiles in order to have authentication. To use with the given configuration file, the table files must be placed in the '/tmp/opensipsdb' directory.

**Example�1.7.�Definition of 'subscriber' table (one line)**

...
username(str) domain(str) password(str) first\_name(str) last\_name(str) phone(str) email\_address(str) datetime\_created(int) datetime\_modified(int) confirmation(str) flag(str) sendnotification(str) greeting(str) ha1(str) ha1b(str) perms(str) allow\_find(str) timezone(str,null) rpid(str,null)
...

  

**Example�1.8.�Definition of 'location' and 'aliases' tables (one line)**

...
username(str) domain(str,null) contact(str,null) received(str) expires(int,null) q(double,null) callid(str,null) cseq(int,null) last\_modified(str) flags(int) user\_agent(str) socket(str) 
...

  

**Example�1.9.�Definition of 'version' table and sample records**

...
table\_name(str) table\_version(int)
subscriber:3
location:6
aliases:6
...

  

**Example�1.10.�Configuration file**

...
#
# simple quick-start config script with dbtext
#

# ----------- global configuration parameters ------------------------

#debug\_mode=yes
udp\_workers=4

check\_via=no    # (cmd. line: -v)
dns=no          # (cmd. line: -r)
rev\_dns=no      # (cmd. line: -R)

socket=udp:10.100.100.1:5060

# ------------------ module loading ----------------------------------

# use dbtext database
loadmodule "modules/dbtext/dbtext.so"

loadmodule "modules/sl/sl.so"
loadmodule "modules/tm/tm.so"
loadmodule "modules/rr/rr.so"
loadmodule "modules/maxfwd/maxfwd.so"
loadmodule "modules/usrloc/usrloc.so"
loadmodule "modules/registrar/registrar.so"
loadmodule "modules/textops/textops.so"
loadmodule "modules/textops/mi\_fifo.so"

# modules for digest authentication
loadmodule "modules/auth/auth.so"
loadmodule "modules/auth\_db/auth\_db.so"

# ----------------- setting module-specific parameters ---------------

# -- mi\_fifo params --

modparam("mi\_fifo", "fifo\_name", "/tmp/opensips\_fifo")

# -- usrloc params --

# use dbtext database for persistent storage
modparam("usrloc", "db\_mode", 2)
modparam("usrloc|auth\_db", "db\_url", "text:///tmp/opensipsdb")

# -- auth params --
#
modparam("auth\_db", "calculate\_ha1", 1)
modparam("auth\_db", "password\_column", "password")
modparam("auth\_db", "user\_column", "username")
modparam("auth\_db", "domain\_column", "domain")

# -------------------------  request routing logic -------------------

# main routing logic

route{
    # initial sanity checks -- messages with
    # max\_forwards==0, or excessively long requests
    if (!mf\_process\_maxfwd\_header("10")) {
        sl\_send\_reply(483,"Too Many Hops");
        exit;
    };
    if ($ml >=  65535 ) {
        sl\_send\_reply(513, "Message too big");
        exit;
    };

    # we record-route all messages -- to make sure that
    # subsequent messages will go through our proxy; that's
    # particularly good if upstream and downstream entities
    # use different transport protocol
    if (!$rm=="REGISTER") record\_route();

    # subsequent messages withing a dialog should take the
    # path determined by record-routing
    if (loose\_route()) {
        # mark routing logic in request
        append\_hf("P-hint: rr-enforced\\r\\n");
        route(1);
        exit;
    };

    if (!is\_myself("$rd")) {
        # mark routing logic in request
        append\_hf("P-hint: outbound\\r\\n");
        route(1);
        exit;
    };

    # if the request is for other domain use UsrLoc
    # (in case, it does not work, use the following command
    # with proper names and addresses in it)
    if (is\_myself("$rd")) {
        if ($rm=="REGISTER") {
            # digest authentication
            if (!www\_authorize("", "subscriber")) {
                www\_challenge("", "0");
                exit;
            };

            save("location");
            exit;
        };

        lookup("aliases");
        if (!is\_myself("$rd")) {
            append\_hf("P-hint: outbound alias\\r\\n");
            route(1);
            exit;
        };

        # native SIP destinations are handled using our USRLOC DB
        if (!lookup("location")) {
            sl\_send\_reply(404, "Not Found");
            exit;
        };
    };
    append\_hf("P-hint: usrloc applied\\r\\n");
    route(1);
}

route\[1\]
{
    # send it out now; use stateful forwarding as it works reliably
    # even for UDP2TCP
    if (!t\_relay()) {
        sl\_reply\_error();
    };
}


...

  

## Chapter�2.�Developer Guide

Once you have the module loaded, you can use the API specified by OpenSIPS DB interface.

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

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

135

59

6126

1441

2.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

41

32

310

309

3.

Henning Westerholt ([@henningw](https://github.com/henningw))

25

15

252

410

4.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

23

19

123

97

5.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

21

18

71

110

6.

Jan Janak ([@janakj](https://github.com/janakj))

11

7

124

106

7.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

8

6

105

20

8.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

8

6

94

49

9.

Alexandra Titoc

5

3

13

6

10.

Sergey Khripchenko ([@shripchenko](https://github.com/shripchenko))

5

2

185

2

  

**All remaining contributors**: Jiri Kuthan ([@jiriatipteldotorg](https://github.com/jiriatipteldotorg)), Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita)), Maksym Sobolyev ([@sobomax](https://github.com/sobomax)), Konstantin Bokarius, Razvan Pistolea, Chris Heiser, Norman Brandinger ([@NormB](https://github.com/NormB)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Edson Gellert Schubert, Dusan Klinec ([@ph4r05](https://github.com/ph4r05)), Andrei Pelinescu-Onciul.

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 3.2.�By Commit Activity

**Table�3.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Alexandra Titoc

Sep 2024 - Sep 2024

2.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Oct 2011 - Jul 2024

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Mar 2014 - May 2024

4.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

Dec 2012 - Mar 2024

5.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Feb 2023

6.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Dec 2021

7.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Nov 2003 - Apr 2020

8.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

9.

Dusan Klinec ([@ph4r05](https://github.com/ph4r05))

Dec 2015 - Dec 2015

10.

Sergey Khripchenko ([@shripchenko](https://github.com/shripchenko))

Aug 2015 - Aug 2015

  

**All remaining contributors**: Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita)), Razvan Pistolea, Henning Westerholt ([@henningw](https://github.com/henningw)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Chris Heiser, Edson Gellert Schubert, Norman Brandinger ([@NormB](https://github.com/NormB)), Jan Janak ([@janakj](https://github.com/janakj)), Jiri Kuthan ([@jiriatipteldotorg](https://github.com/jiriatipteldotorg)), Andrei Pelinescu-Onciul.

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�4.�Documentation

## 4.1.�Contributors

**Last edited by:** Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Sergey Khripchenko ([@shripchenko](https://github.com/shripchenko)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Henning Westerholt ([@henningw](https://github.com/henningw)).

_Documentation Copyrights:_

Copyright � 2003-2004 FhG FOKUS