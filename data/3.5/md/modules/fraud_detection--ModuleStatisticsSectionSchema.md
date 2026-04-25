# Fraud Detection Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp31008128)

2.2. [Most recently active contributors(1) to this module](#idp31097328)

**List of Examples**

1.1. [Set the “db\_url” parameter](#idp30201936)

1.2. [Set the “use\_utc\_time” parameter](#idp29744768)

1.3. [Set the “table\_name” parameter](#idp28953024)

1.4. [Set “rid\_col” parameter](#idp29350768)

1.5. [Set “pid\_col” parameter](#idp25424960)

1.6. [Set “prefix\_col” parameter](#idp25341952)

1.7. [Set “start\_h” parameter](#idp25348128)

1.8. [Set “end\_h” parameter](#idp30772272)

1.9. [Set “days\_col” parameter](#idp30777840)

1.10. [Set “cpm\_thresh\_warn\_col” parameter](#idp30782768)

1.11. [Set “cpm\_thresh\_crit\_col” parameter](#idp30787792)

1.12. [Set “calldur\_thresh\_warn\_col” parameter](#idp30792816)

1.13. [Set “calldur\_thresh\_crit\_col” parameter](#idp30797840)

1.14. [Set “totalc\_thresh\_warn\_col” parameter](#idp30802880)

1.15. [Set “totalc\_thresh\_crit\_col” parameter](#idp30807920)

1.16. [Set “concalls\_thresh\_warn\_col” parameter](#idp30812960)

1.17. [Set “concalls\_thresh\_crit\_col” parameter](#idp30818016)

1.18. [Set “seqcalls\_thresh\_warn\_col” parameter](#idp30823072)

1.19. [Set “seqcalls\_thresh\_crit\_col” parameter](#idp30828128)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This module provides a way to prevent some basic fraud attacks. Alerts are provided through return codes and events.

### 1.1.1.�Monitored Stats

Basically, this module watches the following parameters:

*   Total calls
    
*   Calls per minute
    
*   Concurrent calls
    
*   Number of sequential calls
    
*   Call duration
    

Each of the above parameters is monitored for every user and every called prefix separately. The stats are altered whenever the _check\_fraud_ function is called. The function assumes a new call is made, and checks the called number against all the rules from the supplied profile. The rule's prefix is considered to be the called prefix which along with the provided user will be used to monitor values for the 5 parameters.

### 1.1.2.�Fraud rules

A rule is a set of two thresholds (warning and critical thresholds) for each of the five parameters (as described above) and is only available for a specified prefix. Further more, a rule will only match between the indicated hours in the indicated days of the week (similarly to a dr rule). A fraud profile is simply a group of fraud rules and is used to only to limit the list of rules to match when calling the check\_fraud function.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS modules

The following modules must be loaded before this module:

*   drouting
    
*   dialog
    

### 1.2.2.�External libraries or applications

The following libraries or applications must be installed before running OpenSIPS with this module:

*   _none_.
    

## 1.3.�Exported Parameters

### 1.3.1.�`db_url` (string)

Database where to load the rules from.

_Default value is “NULL”. At least one db\_url should be defined for the fraud\_detection module to work._

**Example�1.1.�Set the “db\_url” parameter**

...
modparam("fraud\_detection", "db\_url", "mysql://user:passwb@localhost/database")
...

  

### 1.3.2.�`use_utc_time` (integer)

Set this parameter to non-zero in order to enable UTC-based interval matching and statistics resets, rather than local time-based.

_The default value is “0” (use local time)._

**Example�1.2.�Set the “use\_utc\_time” parameter**

...
modparam("fraud\_detection", "use\_utc\_time", 1)
...

  

### 1.3.3.�`table_name` (string)

If you want to load the rules from the database you must set this parameter as the database name.

_The default value is “fraud\_detection”._

**Example�1.3.�Set the “table\_name” parameter**

...
modparam("fraud\_detection", "table\_name", "my\_fraud")
...

  

### 1.3.4.�`rid_col` (string)

The column's name in the database storing the fraud rule's id.

_Default value is “ruleid”._

**Example�1.4.�Set “rid\_col” parameter**

...
modparam("fraud\_detection", "rid\_col", "theruleid")
...

  

### 1.3.5.�`pid_col` (string)

The column's name in the database storing the fraud profile's id.

Please keep in mind that a profile is merely a set of rules.

_Default value is “profileid”._

**Example�1.5.�Set “pid\_col” parameter**

...
modparam("fraud\_detection", "pid\_col", "profile")
...

  

### 1.3.6.�`prefix_col` (string)

The column's name in the database storing the prefix for which the fraud rule will match.

_Default value is “prefix”._

**Example�1.6.�Set “prefix\_col” parameter**

...
modparam("fraud\_detection", "prefix\_col", "myprefix")
...

  

### 1.3.7.�`start_h` (string)

The column's name in the database storing the the start time of the interval in which the rule will match.

The time needs to be specified as string using the format: “HH:MM”

_Default value is “start\_hour”._

**Example�1.7.�Set “start\_h” parameter**

...
modparam("fraud\_detection", "start\_h", "the\_start\_time")
...

  

### 1.3.8.�`end_h` (string)

The column's name in the database storing the the end time of the interval in which the rule will match.

The time needs to be specified as string using the format: “HH:MM”

_Default value is “end\_hour”._

**Example�1.8.�Set “end\_h” parameter**

...
modparam("fraud\_detection", "end\_h", "the\_end\_time")
...

  

### 1.3.9.�`days_col` (string)

The column's name in the database storing the week days in which the fraud rule's interval is available.

The daysoftheweek needs to be specified as a string containing a list of days or intervals. Each day must be specified using the first three letters of its name. A valid string would be: "Fri-Mon, Wed, Thu"

_Default value is “daysoftheweek”._

**Example�1.9.�Set “days\_col” parameter**

...
modparam("fraud\_detection", "days\_col", "days")
...

  

### 1.3.10.�`cpm_thresh_warn_col` (string)

The column's name in the database storing the warning threshold value for calls per minute.

_Default value is “cpm\_warning”._

**Example�1.10.�Set “cpm\_thresh\_warn\_col” parameter**

...
modparam("fraud\_detection", "cpm\_thresh\_warn\_col", "cpm\_warn\_thresh")
...

  

### 1.3.11.�`cpm_thresh_crit_col` (string)

The column's name in the database storing the critical threshold value for calls per minute.

_Default value is “cpm\_critical”._

**Example�1.11.�Set “cpm\_thresh\_crit\_col” parameter**

...
modparam("fraud\_detection", "cpm\_thresh\_crit\_col", "cpm\_crit\_thresh")
...

  

### 1.3.12.�`calldur_thresh_warn_col` (string)

The column's name in the database storing the warning threshold value for call duration.

_Default value is “call\_duration\_warning”._

**Example�1.12.�Set “calldur\_thresh\_warn\_col” parameter**

...
modparam("fraud\_detection", "calldur\_thresh\_warn\_col", "calldur\_warn\_thresh")
...

  

### 1.3.13.�`calldur_thresh_crit_col` (string)

The column's name in the database storing the critical threshold value for call duration.

_Default value is “call\_duration\_critical”._

**Example�1.13.�Set “calldur\_thresh\_crit\_col” parameter**

...
modparam("fraud\_detection", "calldur\_thresh\_crit\_col", "calldur\_crit\_thresh")
...

  

### 1.3.14.�`totalc_thresh_warn_col` (string)

The column's name in the database storing the warning threshold value for the number of total calls.

_Default value is “total\_calls\_warning”._

**Example�1.14.�Set “totalc\_thresh\_warn\_col” parameter**

...
modparam("fraud\_detection", "totalc\_thresh\_warn\_col", "totalc\_warn\_thresh")
...

  

### 1.3.15.�`totalc_thresh_crit_col` (string)

The column's name in the database storing the critical threshold value for the number of total calls.

_Default value is “total\_calls\_critical”._

**Example�1.15.�Set “totalc\_thresh\_crit\_col” parameter**

...
modparam("fraud\_detection", "totalc\_thresh\_crit\_col", "totalc\_crit\_thresh")
...

  

### 1.3.16.�`concalls_thresh_warn_col` (string)

The column's name in the database storing the warning threshold value for the number of concurrent calls.

_Default value is “concurrent\_calls\_warning”._

**Example�1.16.�Set “concalls\_thresh\_warn\_col” parameter**

...
modparam("fraud\_detection", "concalls\_thresh\_warn\_col", "concalls\_warn\_thresh")
...

  

### 1.3.17.�`concalls_thresh_crit_col` (string)

The column's name in the database storing the critical threshold value for the number of concurrent calls.

_Default value is “concurrent\_calls\_critical”._

**Example�1.17.�Set “concalls\_thresh\_crit\_col” parameter**

...
modparam("fraud\_detection", "concalls\_thresh\_crit\_col", "concalls\_crit\_thresh")
...

  

### 1.3.18.�`seqcalls_thresh_warn_col` (string)

The column's name in the database storing the warning threshold value for the number of sequential calls.

_Default value is “sequential\_calls\_warning”._

**Example�1.18.�Set “seqcalls\_thresh\_warn\_col” parameter**

...
modparam("fraud\_detection", "seqcalls\_thresh\_warn\_col", "seqcalls\_warn\_thresh")
...

  

### 1.3.19.�`seqcalls_thresh_crit_col` (string)

The column's name in the database storing the critical threshold value for the number of sequential calls.

_Default value is “sequential\_calls\_critical”._

**Example�1.19.�Set “seqcalls\_thresh\_crit\_col” parameter**

...
modparam("fraud\_detection", "seqcalls\_thresh\_crit\_col", "seqcalls\_crit\_thresh")
...

  

## 1.4.�Exported Functions

### 1.4.1.� `check_fraud(user, number, profile_id)`

This method should be called each time a given _user_ calls a given _number_. It will try to match a fraud rule within the given fraud profile and update the stats (see above). Furthermore, the stats will be checked against the rule's thresholds. If any of the stats is above its threshold value, the appropriate event will also be raised (see further details below).

Designed to only work with initial INVITE messages! If a dialog is not already present, one will be created (equivalent of create\_dialog()).

Meaning of the parameters is as follows:

*   _user_ (string) - the user who is making the call. Please keep in mind that the user doesn't have to be registered. This string is only used to keep different stats for different registered users.
    
*   _number_ (string) - the number the user is calling to.
    
*   _profile\_id_ (int) - the fraud profile id (i.e. the subset of fraud rules) in which to try and find a matching fraud rule.
    

The meaning of the return code is as follows:

*   _2_ - no matching fraud rule was found
    
*   _1_ - a matching rule was found, but there is no parameter above the rule's threshlod, i.e - everything is ok
    
*   _\-1_ - there is a parameter above the warning threshold value. Check the raised event for more info
    
*   _\-2_ - there is a parameter above the critical threshold value. Check the raised event for more info
    
*   _\-3_ - something went wrong (internal mechanism failed)
    

This function can be used from REQUEST\_ROUTE and ONREPLY\_ROUTE.

## 1.5.�Exported MI Functions

### 1.5.1.� `show_fraud_stats`

Show the current statistics for all dials of a _user_ to a _prefix_.

NOTE: Since the fraud statistics are refreshed on-the-fly, as check\_fraud() is called, **this function will return stale data** if check\_fraud() has not been called at least once for the (user, prefix) pair within a newly matching time interval!

Name: _show\_fraud\_stats_

Parameters:

*   user
    
*   prefix
    

### 1.5.2.� `fraud_reload`

Reload the all the fraud rules.

Name: _fraud\_reload_

Parameters: _none_

## 1.6.�Exported Events

### 1.6.1.� `E_FRD_WARNING`

This event is raised whenever one of the 5 monitored parameters is above the warning threshold value

Parameters:

*   _param_ - the name of the parameter.
    
*   _value_ - the current value of the parameter.
    
*   _threshold_ - the warning threshold value.
    
*   _user_ - the user who initiated the call.
    
*   _called\_number_ - the number that was called.
    
*   _rule\_id_ - the id of the fraud rule that matched when the call was initiated
    

### 1.6.2.� `E_FRD_CRITICAL`

This event is raised whenever one of the 5 monitored parameters is above the warning threshold value

Parameters:

*   _param_ - the name of the parameter.
    
*   _value_ - the current value of the parameter.
    
*   _threshold_ - the warning threshold value.
    
*   _user_ - the user who initiated the call.
    
*   _called\_number_ - the number that was called.
    
*   _rule\_id_ - the id of the fraud rule that matched when the call was initiated
    

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

51

42

383

284

2.

Andrei Datcu ([@andrei-datcu](https://github.com/andrei-datcu))

38

11

2665

235

3.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

8

6

14

11

4.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

8

5

73

114

5.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

7

5

20

31

6.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

5

3

7

8

7.

Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita))

3

1

21

6

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

Jan 2021 - Feb 2023

2.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Mar 2015 - Aug 2022

3.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Feb 2015 - Oct 2021

4.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Apr 2019

5.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Oct 2014 - Apr 2019

6.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

7.

Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita))

Jan 2016 - Jan 2016

8.

Andrei Datcu ([@andrei-datcu](https://github.com/andrei-datcu))

Aug 2014 - Sep 2014

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Andrei Datcu ([@andrei-datcu](https://github.com/andrei-datcu)).

_Documentation Copyrights:_

Copyright � 2014 [www.opensips-solutions.com](http://www.opensips-solutions.com/)