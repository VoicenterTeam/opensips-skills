# Script Helper Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5531024)

2.2. [Most recently active contributors(1) to this module](#idp5610800)

**List of Examples**

1.1. [Setting `use_dialog`](#idp5516928)

1.2. [Setting `create_dialog_flags`](#idp5521232)

1.3. [Setting `sequential_route`](#idp5525664)

## Chapter�1.�Admin Guide

## 1.1.�Overview

The purpose of the **Script Helper module** is to simplify the scripting process in OpenSIPS when doing basic scenarios. At the same time, it is useful to script writers as it contains basic SIP routing logic, and thus it allows them to focus more on the particular aspects of their OpenSIPS routing code.

## 1.2.�How it works

By simply loading the module, the following **default logic** will be embedded:

*   for initial SIP requests, the module will perform _record routing_ before running the main _request_ route
    
*   sequential SIP requests will be transparently handled - the module will perform _loose routing_, and the request route will not be run at all
    

Currently, the module may be further configured to embed the following **optional logic**:

*   _dialog_ support (dialog module dependency - must be loaded before this module)
    
*   an additional route to be run before relaying sequential requests
    

## 1.3.�Dependencies

### 1.3.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _dialog_ (only if **[use\_dialog](#param_use_dialog "1.4.1.�use_dialog (integer)")** is enabled).
    

### 1.3.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _None_.
    

## 1.4.�Exported Parameters

### 1.4.1.�`use_dialog` (integer)

Enables dialog support. Note that the dialog module must be loaded before this module when setting this parameter.

Default value is 0 (disabled)

**Example�1.1.�Setting `use_dialog`**

...
modparam("script\_helper", "use\_dialog", 1)
...

  

### 1.4.2.�`create_dialog_flags` (string)

Flags used when creating dialogs. For details on these flags, please refer to the _create\_dialog()_ function of the dialog module.

Default value is "" (no flags are set)

**Example�1.2.�Setting `create_dialog_flags`**

...
modparam("script\_helper", "create\_dialog\_flags", "PpB")
...

  

### 1.4.3.�`sequential_route` (string)

Optional route to be run just before sequential requests are relayed. If the _exit_ script statement is used inside this route, the module assumes that the relaying logic has been handled.

By default, this parameter is not set

**Example�1.3.�Setting `sequential_route`**

...
modparam("script\_helper", "sequential\_route", "sequential\_handling")
...
route \[sequential\_handling\]
{
...
}
...

  

## 1.5.�Known Issues

The Max-Forwards header is currently not handled at all.

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

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

19

13

499

46

2.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

7

5

13

10

3.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

7

5

10

8

4.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

6

4

9

13

5.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

5

3

3

4

6.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

3

1

1

1

  

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

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Aug 2015 - Sep 2023

3.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Oct 2014 - May 2023

4.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Feb 2023

5.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Apr 2019

6.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)).

_Documentation Copyrights:_

Copyright � 2014 [www.opensips-solutions.com](http://www.opensips-solutions.com/)