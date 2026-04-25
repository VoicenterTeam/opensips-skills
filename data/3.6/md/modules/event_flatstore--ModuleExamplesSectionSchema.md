# event\_flatstore Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5692864)

2.2. [Most recently active contributors(1) to this module](#idp5786432)

**List of Examples**

1.1. [Set `max_open_sockets` parameter](#idp4226944)

1.2. [Set `delimiter` parameter](#idp4402464)

1.3. [Enable escaping of ',' with '|'](#idp5399968)

1.4. [Set `file_permissions` parameter](#idp4116352)

1.5. [Set `suppress_event_name` parameter](#idp5055280)

1.6. [Set `rotate_period` parameter](#idp3566640)

1.7. [Rotate after five billion lines](#idp4886432)

1.8. [Rotate at 2 GiB](#idp2872336)

1.9. [Set `suffix` parameter](#idp1995424)

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

  

### 1.5.3.�`escape_delimiter` (string)

Optional replacement sequence that will be written _instead of_ the [`delimiter`](#param_delimiter "1.5.2.�delimiter (string)") whenever this character (or sequence) occurs inside a string parameter. This allows you to keep the log file parse-friendly even when user data itself may contain delimiter symbols.

If set, its length _must be exactly equal_ to the length of `delimiter`.

_Default value is “""” (escaping disabled)._

**Example�1.3.�Enable escaping of ',' with '|'**

...
modparam("event\_flatstore", "delimiter", ",")
modparam("event\_flatstore", "escape\_delimiter", "|")
...
	

  

### 1.5.4.�`file_permissions` (string)

Sets the permissions for the newly created logs. It expects a string representation of a octal value.

_Default value is “644”._

**Example�1.4.�Set `file_permissions` parameter**

...
modparam("event\_flatstore", "file\_permissions", "664")
...

  

### 1.5.5.�`suppress_event_name` (int)

Suppresses the name of the event in the log file.

_Default value is “0/OFF” (the event's name is printed)._

**Example�1.5.�Set `suppress_event_name` parameter**

...
modparam("event\_flatstore", "suppress\_event\_name", 1)
...

  

### 1.5.6.�`rotate_period` (int)

When used, it triggers a file auto-rotate. The period is matched against the absolute time of the machine, can be useful to trigger auto-rotate every minute, or every hour.

_Default value is “0/OFF” (the file is never auto-rotated)_

**Example�1.6.�Set `rotate_period` parameter**

...
modparam("event\_flatstore", "rotate\_period", 60) # rotate every minute
modparam("event\_flatstore", "rotate\_period", 3660) # rotate every hour
...

  
\`

### 1.5.7.�`rotate_count` (int|string)

Defines after how many written lines the log file is rotated. The value may exceed the 32-bit integer limit; in that case pass it _as a string_, e.g. "5000000000".

_Default value is “0/OFF”._

**Example�1.7.�Rotate after five billion lines**

...
modparam("event\_flatstore", "rotate\_count", "5000000000")
...
		

  

### 1.5.8.�`rotate_size` (int|string)

Sets the maximum size of a file before it is rotated. A size suffix of “k”, “m” or “g” (multiples of 1024) may be provided. Very large values can be supplied as strings, e.g. "8589934592" for 8 GiB.

_Default value is “0/OFF”._

**Example�1.8.�Rotate at 2 GiB**

...
modparam("event\_flatstore", "rotate\_size", "2g")
...

  

### 1.5.9.�`suffix` (string)

Modifies the file that OpenSIPS writes events into by appending a suffix to the the file specified in the flatstore _socket_.

The suffix can contain string formats (i.e. variables mixed with strings). The path of the resulted file is evaluated when the first event is raised/written in the file after a reload happend, or when the _rotate\_period_, if specified, triggers a rotate.

This parameter does not affect the matching of the event socket - the matching will be done exclusively using the flatstore _socket_ registered.

_Default value is “""” (no suffix is added)_

**Example�1.9.�Set `suffix` parameter**

...
modparam("event\_flatstore", "suffix", "$time(%Y)")
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
		

## 1.8.�Exported Events

### 1.8.1.� `E_FLATSTORE_ROTATION`

The event is raised every time _event\_flatstore_ opens a new log file (manual **evi\_flat\_rotate**, auto-rotate by `rotate_period`, or thresholds `rotate_count`/`rotate_size`). External apps can subscribe to monitor log-rotation activity.

Parameters:

*   _timestamp_ – Unix epoch (seconds) when the rotation was performed.
    
*   _reason_ – one of the strings _count_, _size_, _period_ or _mi_.
    
*   _filename_ – full path of the new log file.
    
*   _old\_filename_ – full path of the previous log file, or empty string if none existed.
    

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

27

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

Nick Altmann ([@nikbyte](https://github.com/nikbyte))

8

1

612

8

6.

Eseanu Marius Cristian ([@eseanucristian](https://github.com/eseanucristian))

7

3

254

9

7.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

5

3

7

4

8.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

5

3

4

4

9.

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

Nick Altmann ([@nikbyte](https://github.com/nikbyte))

May 2025 - May 2025

2.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2017 - Feb 2023

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Jan 2016 - Dec 2021

4.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

Jun 2015 - Jul 2020

5.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Aug 2015 - Sep 2019

6.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Jun 2018 - Apr 2019

7.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

8.

Ionel Cerghit ([@ionel-cerghit](https://github.com/ionel-cerghit))

Jun 2015 - Jul 2015

9.

Eseanu Marius Cristian ([@eseanucristian](https://github.com/eseanucristian))

Jun 2015 - Jul 2015

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Nick Altmann ([@nikbyte](https://github.com/nikbyte)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Ionel Cerghit ([@ionel-cerghit](https://github.com/ionel-cerghit)).

_Documentation Copyrights:_

Copyright � 2015 [www.opensips-solutions.com](http://www.opensips-solutions.com/)