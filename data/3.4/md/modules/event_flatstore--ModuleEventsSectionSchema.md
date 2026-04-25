# event\_flatstore Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5533808)

2.2. [Most recently active contributors(1) to this module](#idp5623168)

**List of Examples**

1.1. [Set `max_open_sockets` parameter](#idp247472)

1.2. [Set `delimiter` parameter](#idp164352)

1.3. [Set `file_permissions` parameter](#idp169696)

1.4. [Set `suppress_event_name` parameter](#idp5513184)

## Chapter�1.�Admin Guide

## 1.1.�Overview

The _event\_flatstore_ module provides a logging facility for different events, triggered through the OpenSIPS Event Interface, directly from the OpenSIPS script. The module logs the events along with their parameters in plain text files.

## 1.2.�Flatstore socket syntax

_flatstore:path\_to\_file_

Meanings:

*   _flatstore:_ - informs the Event Interface that the events sent to this subscriber should be handled by the _event\_flatstore_ module.
    
*   _path\_to\_file_ - path to the file where the logged events will be appended to. The file will be created if it does not exist. It must be a valid path and not a directory.
    

## 1.3.�Dependencies

### 1.3.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _No dependencies on other OpenSIPS modules_.
    

## 1.4.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _none_
    

## 1.5.�Exported Parameters

### 1.5.1.�`max_open_sockets` (integer)

Defines the maximum number of simultaneously opened files by the module. If the maximum limit is reached, an error message will be thrown, and further subscriptions will only be possible after at least one of the current subscriptions will expire.

_Default value is “100”._

**Example�1.1.�Set `max_open_sockets` parameter**

...
modparam("event\_flatstore", "max\_open\_sockets", 200)
...

  

### 1.5.2.�`delimiter` (string)

Sets the separator between the parameters of the event in the logging file.

_Default value is “,”._

**Example�1.2.�Set `delimiter` parameter**

...
modparam("event\_flatstore", "delimiter", ";")
...

  

### 1.5.3.�`file_permissions` (string)

Sets the permissions for the newly created logs. It expects a string representation of a octal value.

_Default value is “644”._

**Example�1.3.�Set `file_permissions` parameter**

...
modparam("event\_flatstore", "file\_permissions", "664")
...

  

### 1.5.4.�`suppress_event_name` (int)

Suppresses the name of the event in the log file.

_Default value is “0/OFF” (the event's name is printed)._

**Example�1.4.�Set `suppress_event_name` parameter**

...
modparam("event\_flatstore", "suppress\_event\_name", 1)
...

  

## 1.6.�Exported Functions

No exported functions to be used in the configuration file.

## 1.7.�Exported MI Functions

### 1.7.1.� `evi_flat_rotate`

It makes the processes reopen the file specified as a parameter to the command in order to be compatible with a logrotate command. If the function is not called after the mv command is executed, the module will continue to write in the renamed file.

Name: _evi\_flat\_rotate_

Parameters: _path\_to\_file_

MI FIFO Command Format:

		opensips-cli -x mi evi\_flat\_rotate \_path\_to\_log\_file\_
		

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

25

16

482

303

2.

Ionel Cerghit ([@ionel-cerghit](https://github.com/ionel-cerghit))

23

13

770

135

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

12

9

31

62

4.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

9

7

36

5

5.

Eseanu Marius Cristian ([@eseanucristian](https://github.com/eseanucristian))

7

3

254

9

6.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

5

3

7

4

7.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

5

3

4

4

8.

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

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2017 - Feb 2023

2.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Jan 2016 - Dec 2021

3.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

Jun 2015 - Jul 2020

4.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Aug 2015 - Sep 2019

5.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Jun 2018 - Apr 2019

6.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

7.

Ionel Cerghit ([@ionel-cerghit](https://github.com/ionel-cerghit))

Jun 2015 - Jul 2015

8.

Eseanu Marius Cristian ([@eseanucristian](https://github.com/eseanucristian))

Jun 2015 - Jul 2015

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Ionel Cerghit ([@ionel-cerghit](https://github.com/ionel-cerghit)).

_Documentation Copyrights:_

Copyright � 2015 [www.opensips-solutions.com](http://www.opensips-solutions.com/)