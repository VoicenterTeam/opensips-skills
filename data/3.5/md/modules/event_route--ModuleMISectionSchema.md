# event\_route Module

---

**List of Tables**

3.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5575168)

3.2. [Most recently active contributors(1) to this module](#idp5692816)

**List of Examples**

1.1. [EVENT\_ROUTE usage](#idp4522144)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This module provides a simple way for capturing and handling directly in the OpenSIPS script of different events triggered through the OpenSIPS Event Interface

If you want to capture and handle a certian event, you need to define a dedicated route (_event\_route_) into the OpenSIPS script, route having as name the name/code of the desired event. The route is triggered (and executed) by the module when the corresponding event is raised by the OpenSIPS

NOTE that the triggered _event\_route_ is run asyncronus (and in a different process) in regards to the code or process that generated the actual event.

NOTE that inside the _event\_route_ you should NOT rely on anything more than the content provide by the event itself (see below variable). DO NOT assume to have access to any other variable or context, not even to a SIP message.

## 1.2.�ROUTE events parameters

In order to retrieve the parameters of an event, the _$param(name)_ variable has to be used. It's name can be the parameter's name, or, if an integer is specified, its index inside the parameter's list.

Example:

xlog("first parameters is $param(1)\\n");
xlog("Pike Blocking IP is $param(ip)\\n");

_NOTE:_ An event may be triggered within a different event, leading to nested processing. This function will retrieve the parameters of the currently processed event.

The event name can contain any non-quoted string character, but it is recommended to follow the syntax: E\__MODULE\_NAME_\__EXTRA\_NAME_

## 1.3.�EVENT\_ROUTE usage

In order to handle the _E\_PIKE\_BLOCKED_ event, the following snippet can be used:

**Example�1.1.�EVENT\_ROUTE usage**

	event\_route\[E\_PIKE\_BLOCKED\] {
		xlog("IP $param(ip) has been blocked\\n");
	}
					

  

## 1.4.�EVENT\_ROUTE socket syntax

As the OpenSIPS Event Interface requires, the _event\_route_ module uses a specific socket syntax:

_'route:' event\_name_

Example:

_route:E\_PIKE\_BLOCKED_

## 1.5.�Dependencies

### 1.5.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _No dependencies on other OpenSIPS modules_.
    

### 1.5.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _none_
    

## 1.6.�Exported Parameters

The module does not export parameters to be used in configuration script.

## 1.7.�Exported Functions

The function does not export any function.

## Chapter�2.�Frequently Asked Questions

**2.1.**

Can I declare more routes for handling the same event?

No, only a single _event\_route_ can be used for a particular event.

**2.2.**

What happened with the “fetch\_event\_params()” function?

This function has been dropped starting with OpenSIPS 3.0. Its functionality has been replaced by the “$param(name)” variable.

**2.3.**

Where can I find more about OpenSIPS?

Take a look at [https://opensips.org/](https://opensips.org/).

**2.4.**

Where can I post a question about this module?

First at all check if your question was already answered on one of our mailing lists:

*   User Mailing List - [http://lists.opensips.org/cgi-bin/mailman/listinfo/users](http://lists.opensips.org/cgi-bin/mailman/listinfo/users)
    
*   Developer Mailing List - [http://lists.opensips.org/cgi-bin/mailman/listinfo/devel](http://lists.opensips.org/cgi-bin/mailman/listinfo/devel)
    

E-mails regarding any stable OpenSIPS release should be sent to `<[users@lists.opensips.org](mailto:users@lists.opensips.org)>` and e-mails regarding development versions should be sent to `<[devel@lists.opensips.org](mailto:devel@lists.opensips.org)>`.

If you want to keep the mail private, send it to `<[users@lists.opensips.org](mailto:users@lists.opensips.org)>`.

**2.5.**

How can I report a bug?

Please follow the guidelines provided at: [https://github.com/OpenSIPS/opensips/issues](https://github.com/OpenSIPS/opensips/issues).

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

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

40

25

993

317

2.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

18

9

142

400

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

14

12

29

49

4.

Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita))

8

5

138

51

5.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

7

5

14

5

6.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

7

2

384

9

7.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

5

3

18

16

8.

Ionel Cerghit ([@ionel-cerghit](https://github.com/ionel-cerghit))

3

1

5

6

9.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

3

1

1

1

10.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

2

1

1

0

  

**All remaining contributors**: Walter Doekes ([@wdoekes](https://github.com/wdoekes)).

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 3.2.�By Commit Activity

**Table�3.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Mar 2014 - Apr 2025

2.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Dec 2012 - Apr 2024

3.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Jun 2023

4.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Oct 2014 - May 2023

5.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2021 - Feb 2023

6.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

7.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

Jun 2016 - Jun 2016

8.

Ionel Cerghit ([@ionel-cerghit](https://github.com/ionel-cerghit))

Jun 2015 - Jun 2015

9.

Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita))

Oct 2014 - Oct 2014

10.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

Jul 2014 - Jul 2014

  

**All remaining contributors**: Walter Doekes ([@wdoekes](https://github.com/wdoekes)).

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�4.�Documentation

## 4.1.�Contributors

**Last edited by:** Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita)), Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)).

_Documentation Copyrights:_

Copyright � 2012 [www.opensips-solutions.com](http://www.opensips-solutions.com/)