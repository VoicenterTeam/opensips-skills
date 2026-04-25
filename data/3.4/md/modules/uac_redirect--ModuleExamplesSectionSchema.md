# UAC\_REDIRECT Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5598784)

2.2. [Most recently active contributors(1) to this module](#idp5699440)

**List of Examples**

1.1. [Set `default_filter` module parameter](#idp164128)

1.2. [Set `deny_filter` module parameter](#idp171744)

1.3. [Set `accept_filter` module parameter](#idp5516944)

1.4. [`set_deny_filter` usage](#idp5530704)

1.5. [`set_accept_filter` usage](#idp5543360)

1.6. [`get_redirects` usage](#idp5553184)

1.7. [Redirection script example](#idp5556192)

## Chapter�1.�Admin Guide

## 1.1.�Overview

UAC REDIRECT - User Agent Client redirection - module enhance OpenSIPS with the functionality of being able to handle (interpret, filter, log and follow) redirect responses ( 3xx replies class).

UAC REDIRECT module offer stateful processing, gathering the contacts from all 3xx branches of a call.

The module provide a powerful mechanism for selecting and filtering the contacts to be used for the new redirect:

*   _number based_ - limits like the number of total contacts to be used or the maximum number of contacts per branch to be selected.
    
*   _Regular Expression based_ - combinations of deny and accept filters allow a strict control of the contacts to be used for redirection.
    

When selecting from a 3xx branch the contacts to be used, the contacts will be ordered and prioritized based on the “q” value.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _TM_ - Transaction Module, for accessing replies.
    
*   _ACC_ - Accounting Module, but only if the logging feature is used.
    

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _None_
    

## 1.3.�Exported Parameters

### 1.3.1.�`default_filter` (string)

The default behavior in filtering contacts. It may be “accept” or “deny”.

_The default value is “accept”._

**Example�1.1.�Set `default_filter` module parameter**

...
modparam("uac\_redirect","default\_filter","deny")
...
				

  

### 1.3.2.�`deny_filter` (string)

The regular expression for default deny filtering. It make sens to be defined on only if the `default_filter` parameter is set to “accept”. All contacts matching the `deny_filter` will be rejected; the rest of them will be accepted for redirection.

The parameter may be defined only one - multiple definition will overwrite the previous definitions. If more regular expression need to be defined, use the `set_deny_filter()` scripting function.

_This parameter is optional, it's default value being NULL._

**Example�1.2.�Set `deny_filter` module parameter**

...
modparam("uac\_redirect","deny\_filter",".\*@siphub\\.net")
...
				

  

### 1.3.3.�`accept_filter` (string)

The regular expression for default accept filtering. It make sens to be defined on only if the `default_filter` parameter is set to “deny”. All contacts matching the `accept_filter` will be accepted; the rest of them will be rejected for redirection.

The parameter may be defined only one - multiple definition will overwrite the previous definitions. If more regular expression need to be defined, use the `set_accept_filter()` scripting function.

_This parameter is optional, it's default value being NULL._

**Example�1.3.�Set `accept_filter` module parameter**

...
modparam("uac\_redirect","accept\_filter",".\*@siphub\\.net")
...
				

  

## 1.4.�Exported Functions

### 1.4.1.� `set_deny_filter(filter,flags)`

Sets additional deny filters. Maximum 6 may be combined. This additional filter will apply only to the current message - it will not have a global effect.

Parameters:

*   _filter_ (string) - regular expression
    
*   _flags_ (string)
    
    Default or previous added deny filter may be reset depending of the parameter value:
    
    *   _reset\_all_ - reset both default and previous added deny filters;
        
    *   _reset\_default_ - reset only the default deny filter;
        
    *   _reset\_added_ - reset only the previous added deny filters;
        
    *   _empty_ - no reset, just add the filter.
        
    

This function can be used from FAILURE\_ROUTE.

**Example�1.4.�`set_deny_filter` usage**

...
set\_deny\_filter(".\*@domain2.net","reset\_all");
set\_deny\_filter(".\*@domain1.net","");
...
				

  

### 1.4.2.� `set_accept_filter(filter,flags)`

Sets additional accept filters. Maximum 6 may be combined. This additional filter will apply only to the current message - it will not have a global effect.

Parameters:

*   _filter_ (string) - regular expression
    
*   _flags_ (string)
    
    Default or previous added deny filter may be reset depending of the parameter value:
    
    *   _reset\_all_ - reset both default and previous added accept filters;
        
    *   _reset\_default_ - reset only the default accept filter;
        
    *   _reset\_added_ - reset only the previous added accept filters;
        
    *   _empty_ - no reset, just add the filter.
        
    

This function can be used from FAILURE\_ROUTE.

**Example�1.5.�`set_accept_filter` usage**

...
set\_accept\_filter(".\*@domain2.net","reset\_added");
set\_accept\_filter(".\*@domain1.net","");
...
				

  

### 1.4.3.� `get_redirects([max_total], [max_branch])`

The function may be called only from failure routes. It will extract the contacts from all 3xx branches and append them as new branches. Note that the function will not forward the new branches, this must be done explicitly from script.

How many contacts (in total and per branch) are selected depends on the _max\_total_ and _max\_branch_ parameters:

*   max\_total (int, optional) - max overall number of contacts to be selected
    
*   max\_branch (int, optional) - max number of contacts per branch to be selected
    

Both “max\_total” and “max\_branch” default to 0 (unlimited).

NOTE that during the selection process, each set of contacts from a specific branch are ordered based on “q” value.

This function can be used from FAILURE\_ROUTE.

**Example�1.6.�`get_redirects` usage**

...
# no restrictions
get\_redirects();
...
# no limits per branch, but not more than 6 overall contacts
get\_redirects(6);
...
# max 2 contacts per branch, but no overall limit
get\_redirects(, 2);
...
				

  

## 1.5.�Script Example

**Example�1.7.�Redirection script example**

loadmodule "modules/sl/sl.so"
loadmodule "modules/usrloc/usrloc.so"
loadmodule "modules/registrar/registrar.so"
loadmodule "modules/tm/tm.so"
loadmodule "modules/acc/acc.so"
loadmodule "modules/uac\_redirect/uac\_redirect.so"

modparam("usrloc", "db\_mode",   0)

route{
	if (is\_myself("$rd")) {

		if ($rm=="REGISTER") {
			save("location");
			exit;
		};

		if (!lookup("location")) {
			sl\_send\_reply(404, "Not Found");
			exit;
		};
	}

	t\_on\_failure("do\_redirect");

	if (!t\_relay()) {
		sl\_reply\_error();
	};
}

failure\_route\[do\_redirect\] {
	if (get\_redirects(3, 1))
		t\_relay();
}

				

  

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

29

1711

143

2.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

18

10

106

372

3.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

12

10

24

20

4.

Rob Gagnon ([@rgagnon24](https://github.com/rgagnon24))

8

6

50

48

5.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

8

6

11

10

6.

Henning Westerholt ([@henningw](https://github.com/henningw))

7

5

12

11

7.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

5

3

25

6

8.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

4

2

3

4

9.

Anca Vamanu

3

1

30

55

10.

Konstantin Bokarius

3

1

2

5

  

**All remaining contributors**: Andreas Granig, Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Edson Gellert Schubert, Elena-Ramona Modroiu, Walter Doekes ([@wdoekes](https://github.com/wdoekes)).

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

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Jun 2005 - Feb 2022

3.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Feb 2012 - Sep 2019

4.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Apr 2019

5.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Mar 2014 - Apr 2019

6.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

7.

Rob Gagnon ([@rgagnon24](https://github.com/rgagnon24))

Mar 2015 - Mar 2015

8.

Walter Doekes ([@wdoekes](https://github.com/wdoekes))

May 2014 - May 2014

9.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

Nov 2006 - Mar 2008

10.

Konstantin Bokarius

Mar 2008 - Mar 2008

  

**All remaining contributors**: Edson Gellert Schubert, Henning Westerholt ([@henningw](https://github.com/henningw)), Anca Vamanu, Andreas Granig, Elena-Ramona Modroiu.

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Rob Gagnon ([@rgagnon24](https://github.com/rgagnon24)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Henning Westerholt ([@henningw](https://github.com/henningw)).

_Documentation Copyrights:_

Copyright � 2005 Voice Sistem SRL