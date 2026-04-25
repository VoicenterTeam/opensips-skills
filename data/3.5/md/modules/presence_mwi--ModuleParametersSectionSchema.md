# Presence\_MWI Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp257456)

2.2. [Most recently active contributors(1) to this module](#idp5618016)

## Chapter�1.�Admin Guide

## 1.1.�Overview

The module does specific handling for notify-subscribe message-summary (message waiting indication) events as specified in RFC 3842. It is used with the general event handling module, presence. It constructs and adds message-summary event to it.

The module does not currently implement any authorization rules. It assumes that publish requests are only issued by a voicemail application and subscribe requests only by the owner of voicemail box. Authorization can thus be easily done by OpenSIPS configuration file before calling handle\_publish() and handle\_subscribe() functions.

The module implements a simple check of content type application/simple-message-summary: Content must start with Messages-Waiting status line followed by zero or more lines that consist of tabs and printable ASCII characters.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _presence_.
    

### 1.2.2.�External Libraries or Applications

None.

## 1.3.�Exported Parameters

None.

## 1.4.�Exported Functions

None to be used in configuration file.

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

15

13

30

30

2.

Juha Heinanen ([@juha-h](https://github.com/juha-h))

12

5

645

11

3.

Anca Vamanu

10

7

18

88

4.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

9

7

25

30

5.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

9

7

13

11

6.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

9

7

10

8

7.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

4

2

3

4

8.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

3

2

2

0

9.

Sergio Gutierrez

3

1

41

10

10.

Ancuta Onofrei

3

1

10

13

  

**All remaining contributors**: Konstantin Bokarius, Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Edson Gellert Schubert, Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)).

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

Feb 2023 - Feb 2023

2.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Aug 2015 - Sep 2019

3.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Jul 2007 - Apr 2019

4.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

5.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Mar 2014 - Jun 2018

6.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - May 2017

7.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

Oct 2010 - Mar 2011

8.

Anca Vamanu

Jul 2007 - Sep 2010

9.

Sergio Gutierrez

Nov 2008 - Nov 2008

10.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

Oct 2007 - Mar 2008

  

**All remaining contributors**: Konstantin Bokarius, Edson Gellert Schubert, Juha Heinanen ([@juha-h](https://github.com/juha-h)), Ancuta Onofrei.

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Juha Heinanen ([@juha-h](https://github.com/juha-h)).

_Documentation Copyrights:_

Copyright � 2007 Juha Heinanen