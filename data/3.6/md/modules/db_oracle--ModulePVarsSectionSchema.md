# oracle Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp29581008)

2.2. [Most recently active contributors(1) to this module](#idp30785952)

**List of Examples**

1.1. [Set `timeout` parameter](#idp25482512)

1.2. [Disable asynchronous mode](#idp25439568)

1.3. [Set `reconnect` parameter](#idp25428816)

## Chapter�1.�User's Guide

## 1.1.�Overview

This is a module which provides Oracle connectivity for OpenSIPS. It implements the DB API defined in OpenSIPS. If you want to use the nathelper module, or any other modules that calls the get\_all\_ucontacts API export from usrloc, then you need to set the _DORACLE\_USRLOC_ define in the Makefile.defs file before compilation.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _No dependencies on other OpenSIPS modules_.
    

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _instantclient-sdk-10.2.0.3_ - the development headers and libraries of OCI.
    

## 1.3.�Exported Parameters

### 1.3.1.�`timeout` (fixedpoint)

Timeout value for any operation with BD.

Possible values is from 0.1 to 10.0 seconds.

_Default value is 3.0 (3 second)._

If value of timeout parameter set to 0, module use synchronous mode (without timeout).

**Example�1.1.�Set `timeout` parameter**

...
modparam("db\_oracle", "timeout", 1.5)
...

  

**Example�1.2.�Disable asynchronous mode**

...
modparam("db\_oracle", "timeout", 0)
...

  

### 1.3.2.�`reconnect` (fixedpoint)

Timeout value for connect (create session) operation.

Possible values is from 0.1 to 10.0 seconds.

_Default value is 0.2 (200 milliseconds)._

**Example�1.3.�Set `reconnect` parameter**

...
modparam("db\_oracle", "reconnect", 0.5)
...

  

## 1.4.�Exported Functions

No function exported to be used from configuration file.

## 1.5.�Installation

Because it dependes on an external library, the oracle module is not compiled and installed by default. You can use one of the next options.

*   \- edit the "Makefile" and remove "db\_oracle" from "excluded\_modules" list. Then follow the standard procedure to install OpenSIPS: "make all; make install".
    
*   \- from command line use: 'make all include\_modules="db\_oracle"; make install include\_modules="db\_oracle"'.
    

## 1.6.�Utility opensips\_orasel

For working with opensips-cli tool, should be able to print the 'query' results to the terminal in a user-readable form. The standard command-line Oracle client (sqlplus) is not quite suitable for this, as it cannot align row width to real (received) data's (it always prints a cell width as described in the db scheme). This problem has been solved by inclusion the utility opensips\_orasel, which formats printing approximately in the same way as the 'mysql' client utility. In addition, this utility known about the "agreements and types" in DB that are used in OpenSIPS for the work with Oracle and formats printing taking these into account.

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

Iouri Kharon

21

1

2363

0

2.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

14

11

64

68

3.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

12

10

115

41

4.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

12

9

23

83

5.

dronord

8

6

29

18

6.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

7

5

41

5

7.

Gang Zhuo

6

4

42

16

8.

Henning Westerholt ([@henningw](https://github.com/henningw))

5

3

19

7

9.

Gang Zhuo

4

2

4

2

10.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

4

2

3

3

  

**All remaining contributors**: Maksym Sobolyev ([@sobomax](https://github.com/sobomax)), fabriziopicconi, Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)), Ken Rice, Sergio Gutierrez, Juli�n Moreno Pati�o, Razvan Pistolea.

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

Gang Zhuo

Nov 2022 - Nov 2024

3.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Oct 2011 - Jul 2024

4.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Mar 2014 - May 2024

5.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Feb 2023

6.

Gang Zhuo

Dec 2021 - Dec 2021

7.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Jul 2008 - Apr 2019

8.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Apr 2019

9.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Aug 2012 - Jun 2018

10.

dronord

Nov 2017 - Dec 2017

  

**All remaining contributors**: Juli�n Moreno Pati�o, fabriziopicconi, Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)), Razvan Pistolea, Sergio Gutierrez, Henning Westerholt ([@henningw](https://github.com/henningw)), Iouri Kharon.

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Henning Westerholt ([@henningw](https://github.com/henningw)), Iouri Kharon.

_Documentation Copyrights:_

Copyright � 2007-2008 TRUNK MOBILE, INC.