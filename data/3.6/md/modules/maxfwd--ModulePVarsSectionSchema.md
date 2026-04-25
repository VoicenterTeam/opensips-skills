# maxfwd Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5588096)

2.2. [Most recently active contributors(1) to this module](#idp5690224)

**List of Examples**

1.1. [Set `max_limit` parameter](#idp4048720)

1.2. [`mx_process_maxfwd_header` usage](#idp168368)

1.3. [`is_maxfwd_lt` usage](#idp5575760)

## Chapter�1.�Admin Guide

## 1.1.�Overview

The module implements all the operations regarding MaX-Forward header field, like adding it (if not present) or decrementing and checking the value of the existent one.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _No dependencies on other OpenSIPS modules_.
    

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _None_.
    

## 1.3.�Exported Parameters

### 1.3.1.�`max_limit` (integer)

Set an upper limit for the max-forward value in the outgoing requests. If the header is present, the decremented value is not allowed to exceed this max\_limits - if it does, the header value will by decreased to “max\_limit”.

Note: This check is done when calling the mf\_process\_maxfwd\_header() header.

The range of values stretches from 1 to 256, which is the maximum MAX-FORWARDS value allowed by RFC 3261.

_Default value is “256”._

**Example�1.1.�Set `max_limit` parameter**

...
modparam("maxfwd", "max\_limit", 32)
...

  

## 1.4.�Exported Functions

### 1.4.1.� `mf_process_maxfwd_header(max_value)`

If no Max-Forward header is present in the received request, a header will be added having the original value equal with “max\_value”. If a Max-Forward header is already present, its value will be decremented (if not 0).

Retuning codes:

*   _2 (true)_ - header was not found and a new header was successfully added.
    
*   _1 (true)_ - header was found and its value was successfully decremented (had a non-0 value).
    
*   _\-1 (false)_ - the header was found and its value is 0 (cannot be decremented).
    
*   _\-2 (false)_ - error during processing.
    

The return code may be extensivly tested via script variable “retcode” (or “$?”).

Meaning of the parameters is as follows:

*   _max\_value_ (int) - Value to be added if there is no Max-Forwards header field in the message.
    

This function can be used from REQUEST\_ROUTE.

**Example�1.2.�`mx_process_maxfwd_header` usage**

...
# initial sanity checks -- messages with
# max\_forwards==0, or excessively long requests
if (!mf\_process\_maxfwd\_header(10) && $retcode==-1) {
	sl\_send\_reply(483,"Too Many Hops");
	exit;
};
...

  

### 1.4.2.� `is_maxfwd_lt(max_value)`

Checks if the Max-Forward header value is less then the “max\_value” parameter value. It considers also the value of the new inserted header (if locally added).

Retuning codes:

*   _1 (true)_ - header was found or set and its value is strictly less than “max\_value”.
    
*   _\-1 (false)_ - the header was found or set and its value is greater or equal to “max\_value”.
    
*   _\-2 (false)_ - header was not found or not set.
    
*   _\-3 (false)_ - error during processing.
    

The return code may be extensivly tested via script variable “retcode” (or “$?”).

Meaning of the parameters is as follows:

*   _max\_value_ (int) - value to check the Max-Forward.value against (as less than).
    

**Example�1.3.�`is_maxfwd_lt` usage**

...
# next hope is a gateway, so make no sens to
# forward if MF is 0 (after decrement)
if ( is\_maxfwd\_lt(1) ) {
	sl\_send\_reply(483,"Too Many Hops");
	exit;
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

30

864

484

2.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

12

10

17

44

3.

Jan Janak ([@janakj](https://github.com/janakj))

11

9

58

38

4.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

11

9

23

19

5.

Andrei Pelinescu-Onciul

10

8

31

26

6.

Jiri Kuthan ([@jiriatipteldotorg](https://github.com/jiriatipteldotorg))

9

7

93

7

7.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

8

6

9

8

8.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

6

4

34

43

9.

Henning Westerholt ([@henningw](https://github.com/henningw))

4

2

3

3

10.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

4

2

2

3

  

**All remaining contributors**: Aron Podrigal ([@ar45](https://github.com/ar45)), Konstantin Bokarius, Andreas Heise, Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Edson Gellert Schubert, Nils Ohlmeier, Elena-Ramona Modroiu, Klaus Darilion, Alexandra Titoc, Walter Doekes ([@wdoekes](https://github.com/wdoekes)).

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 2.2.�By Commit Activity

**Table�2.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Alexandra Titoc

Sep 2024 - Sep 2024

2.

Aron Podrigal ([@ar45](https://github.com/ar45))

Sep 2024 - Sep 2024

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Jan 2014 - May 2024

4.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Feb 2023

5.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Feb 2012 - Sep 2019

6.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Apr 2019

7.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Jan 2002 - Apr 2019

8.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

9.

Walter Doekes ([@wdoekes](https://github.com/wdoekes))

May 2014 - May 2014

10.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

Nov 2006 - Mar 2008

  

**All remaining contributors**: Konstantin Bokarius, Edson Gellert Schubert, Henning Westerholt ([@henningw](https://github.com/henningw)), Klaus Darilion, Andreas Heise, Elena-Ramona Modroiu, Jan Janak ([@janakj](https://github.com/janakj)), Andrei Pelinescu-Onciul, Nils Ohlmeier, Jiri Kuthan ([@jiriatipteldotorg](https://github.com/jiriatipteldotorg)).

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Klaus Darilion, Elena-Ramona Modroiu.

_Documentation Copyrights:_

Copyright � 2003 FhG FOKUS