# gflags Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5598320)

2.2. [Most recently active contributors(1) to this module](#idp5699056)

**List of Examples**

1.1. [`initial` parameter usage](#idp3448112)

1.2. [`set_gflag()` usage](#idp4327952)

1.3. [`reset_gflag()` usage](#idp248384)

1.4. [`is_gflag()` usage](#idp166064)

1.5. [`set_gflag` usage](#idp173104)

1.6. [`reset_gflag` usage](#idp5569248)

1.7. [`is_gflag` usage](#idp5574464)

1.8. [`get_gflags` usage](#idp5578832)

## Chapter�1.�Admin Guide

## 1.1.�Overview

gflags module (global flags) keeps a bitmap of flags in shared memory and may be used to change behaviour of server based on value of the flags. Example:

	if (is\_gflag(1)) {
		t\_relay("udp:10.0.0.1:5060");
	} else {
		t\_relay("udp:10.0.0.2:5060");
	}
	

The benefit of this module is the value of the switch flags can be manipulated by external applications such as web interface or command line tools. The size of bitmap is 32.

The module exports external commands that can be used to change the global flags via Management Interface. The MI commands are: “set\_gflag”, “reset\_gflag” and “is\_gflag”.

## 1.2.�Dependencies

The module depends on the following modules (in the other words the listed modules must be loaded before this module):

*   _none_
    

## 1.3.�Exported Parameters

### 1.3.1.�`initial` (integer)

The initial value of global flags bitmap.

Default value is “0”.

**Example�1.1.�`initial` parameter usage**

modparam("gflags", "initial", 15)
		

  

## 1.4.�Exported Functions

### 1.4.1.�`set_gflag(flag)`

Set the bit at the position “flag” in global flags.

The “flag” (int) parameter can have a value in the range of 0..31.

This function may be used from any route.

**Example�1.2.�`set_gflag()` usage**

...
set\_gflag(4);
...

  

### 1.4.2.�`reset_gflag(flag)`

Reset the bit at the position “flag” in global flags.

The “flag” (int) parameter can have a value in the range of 0..31.

This function may be used from any route.

**Example�1.3.�`reset_gflag()` usage**

...
reset\_gflag(4);
...

  

### 1.4.3.�`is_gflag(flag)`

Check if bit at the position “flag” in global flags is set.

The “flag” (int) parameter can have a value in the range of 0..31.

This function may be used from any route.

**Example�1.4.�`is_gflag()` usage**

...
if(is\_gflag(4))
{
	log("global flag 4 is set\\n");
} else {
	log("global flag 4 is not set\\n");
};
...

  

## 1.5.�Exported MI Functions

Functions that check or change some flags accepts one parameter which is the flag bitmap/mask specifing the corresponding flags. It is not possible to specify directly the flag position that should be changed as in the functions available in the routing script.

### 1.5.1.�`set_gflag`

Set the value of some flags (specified by bitmask) to 1.

The parameter value must be a bitmask in decimal or hexa format. The bitmaks has a 32 bit size.

**Example�1.5.�`set_gflag` usage**

...
$ opensips-cli -x mi set\_gflag 1
$ opensips-cli -x mi set\_gflag 0x3
...

  

### 1.5.2.�`reset_gflag`

Reset the value of some flags to 0.

The parameter value must be a bitmask in decimal or hexa format. The bitmaks has a 32 bit size.

**Example�1.6.� `reset_gflag` usage**

...
$ opensips-cli -x mi reset\_gflag 1
$ opensips-cli -x mi reset\_gflag 0x3
...

  

### 1.5.3.�`is_gflag`

Returns true if the all the flags from the bitmask are set.

The parameter value must be a bitmask in decimal or hexa format. The bitmaks has a 32 bit size.

The function returns TRUE if all the flags from the set are set and FALSE if at least one is not set.

**Example�1.7.�`is_gflag` usage**

...
$ opensips-cli -x mi set\_gflag 1024
$ opensips-cli -x mi is\_gflag 1024
TRUE
$ opensips-cli -x mi is\_gflag 1025
TRUE
$ opensips-cli -x mi is\_gflag 1023
FALSE
$ opensips-cli -x mi set\_gflag 0x10
$ opensips-cli -x mi is\_gflag 1023
TRUE
$ opensips-cli -x mi is\_gflag 1007
FALSE
$ opensips-cli -x mi is\_gflag 16
TRUE
...

  

### 1.5.4.�`get_gflags`

Return the bitmap with all flags. The function gets no parameters and returns the bitmap in hexa and decimal format.

**Example�1.8.� `get_gflags` usage**

...
$ opensips-cli -x mi get\_gflags
0x3039
12345
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

41

31

423

326

2.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

14

12

42

22

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

13

11

27

59

4.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

10

8

26

24

5.

Henning Westerholt ([@henningw](https://github.com/henningw))

8

6

42

31

6.

Jiri Kuthan ([@jiriatipteldotorg](https://github.com/jiriatipteldotorg))

8

4

278

4

7.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

7

4

88

94

8.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

4

2

3

4

9.

Richard Revels

3

1

24

11

10.

Anca Vamanu

3

1

6

3

  

**All remaining contributors**: Konstantin Bokarius, Andrei Pelinescu-Onciul, Dan Pascu ([@danpascu](https://github.com/danpascu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Edson Gellert Schubert, Klaus Darilion, Ancuta Onofrei.

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

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Oct 2005 - Oct 2022

4.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Sep 2011 - Sep 2019

5.

Dan Pascu ([@danpascu](https://github.com/danpascu))

May 2019 - May 2019

6.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Apr 2019

7.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

8.

Anca Vamanu

Sep 2009 - Sep 2009

9.

Richard Revels

Aug 2008 - Aug 2008

10.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

Oct 2005 - Jun 2008

  

**All remaining contributors**: Konstantin Bokarius, Edson Gellert Schubert, Henning Westerholt ([@henningw](https://github.com/henningw)), Ancuta Onofrei, Klaus Darilion, Andrei Pelinescu-Onciul, Jiri Kuthan ([@jiriatipteldotorg](https://github.com/jiriatipteldotorg)).

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Richard Revels, Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Henning Westerholt ([@henningw](https://github.com/henningw)), Klaus Darilion.

_Documentation Copyrights:_

Copyright � 2004 FhG FOKUS