# AAA RADIUS MODULE

---

**List of Tables**

3.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5611488)

3.2. [Most recently active contributors(1) to this module](#idp5718560)

**List of Examples**

1.1. [Set `sets` parameter](#idp101936)

1.2. [Set `radius_config` parameter](#idp106704)

1.3. [Set `syslog_name` parameter](#idp5518656)

1.4. [Set `fetch_all_values` parameter](#idp5523008)

1.5. [`radius_send_auth` usage](#idp5534032)

1.6. [`radius_send_acct` usage](#idp5540128)

1.7. [`radius_send_auth` usage](#idp5550224)

1.8. [`radius_send_acct` usage](#idp162336)

2.1. [downloading the library](#idp5599232)

2.2. [How to apply the patch](#idp5645808)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This module provides a Radius implementation for the AAA API from the core.

It also provides two functions to be used from the script for generating custom Radius acct and auth requests. Detection and handling of SIP-AVPs from Radius replies is automatically and transparently done by the module.

Since version 2.2, aaa\_radius module supports asynchronous operations. But in order to use them, one must apply the patch contained by the modules/aaa\_radius folder, called _radius\_async\_support.patch_.In order to do this, you must have freeradius-client sources. In order to do this you can follow the tutorial in the end of the documentation.

Any module that wishes to use it has to do the following:

*   _include aaa.h_
    
*   _make a bind call with a proper radius specific url_
    

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

None.

### 1.2.2.�External Libraries or Applications

One of the following libraries must be installed before running OpenSIPS with this module loaded:

*   _radiusclient-ng_ 0.5.0 or higher See [http://developer.berlios.de/projects/radiusclient-ng/](http://developer.berlios.de/projects/radiusclient-ng/).
    
*   _freeradius-client_ See [http://freeradius.org/](http://freeradius.org/).
    

One can force the radius library that is usedby setting RADIUSCLIENT env, before compiling the module, to one of the following values:

*   _RADCLI \*\*\*_ libradcli-dev library shall be used;
    
*   _FREERADIUS \*\*\*_ libfreeradius-client-dev library shall be used;
    
*   _RADIUSCLIENT \*\*\*_ libradiusclient-ng library shall be used;
    

IMPORTANT: If the selected library is not installed the module won't compile.

NOTE: If RADIUSCLIENT env not set, the module will try to find one of the three radius libraries in the following order: radcli, freeradius, radiusclient-ng. That is if radcli library is installed it shall be used, else freeradius shall be looked for and so on.

## 1.3.�Exported Parameters

### 1.3.1.�`sets (string)`

Sets of Radius AVPs to be used when building custom RADIUS requests (set of input RADIUS AVPs) or when fetching data from the RADIUS reply (set of output RADIUS AVPs).

The format for a set definition is the following:

*   " set\_name = ( attribute\_name1 = var1 \[, attribute\_name2 = var2 \]\* ) "
    

The left-hand side of the assignment must be an attribute name known by the RADIUS dictionary.

The right-hand side of the assignment must be a script pseudo variable or a script AVP. For more information about them see [CookBooks - Scripting Variables](https://opensips.org/Resources/DocsCoreVar15).

**Example�1.1.�Set `sets` parameter**

...
modparam("aaa\_radius","sets","set4  =  (  Sip-User-ID  =   $avp(10)
			,   Sip-From-Tag=$si,Sip-To-Tag=$tt      )      ")
...

...
modparam("aaa\_radius","sets","set1 = (User-Name=$var(usr), Sip-Group = $var(grp),
			Service-Type = $var(type)) ")
...

...
modparam("aaa\_radius","sets","set2 = (Sip-Group = $var(sipgrup)) ")
...

  

### 1.3.2.�`radius_config (string)`

Radiusclient configuration file.

This parameter is optional. It must be set only if the radius\_send\_acct and radius\_send\_auth functions are used.

**Example�1.2.�Set `radius_config` parameter**

...
modparam("aaa\_radius", "radius\_config", "/etc/radiusclient-ng/radiusclient.conf")
...

  

### 1.3.3.�`syslog_name (string)`

Enable logging of the client library to syslog, using the given log name.

This parameter is optional. Radius client libraries will try to use syslog to report errors (such as problems with dictionaries) with the given ident string .If this parameter is set, then these errors are visible in syslog. Otherwise errors are hidden.

By default this parameter is not set (no logging).

**Example�1.3.�Set `syslog_name` parameter**

...
modparam("aaa\_radius", "syslog\_name", "aaa-radius")
...

  

### 1.3.4.�`fetch_all_values (integer)`

For the output sets, this parameter controls if all the values (for the same RADIUS AVP) should be returned (otherwise only the first value will be returned). When enabling this options, be sure that the variable you use to get the RADIUS output can store multiple values (like the AVP variables).

By default this parameter is disabled (set to 0) for backward compatibility reasons.

**Example�1.4.�Set `fetch_all_values` parameter**

...
modparam("aaa\_radius", "fetch\_all\_values", 1)
...

  

## 1.4.�Exported Functions

### 1.4.1.� `radius_send_auth(input_set_name, output_set_name)`

This function can be used from the script to make custom radius authentication request. The function takes two parameters.

Parameters:

*   _input\_set\_name_ (string) - the name of the set that contains the list of attributes and pvars that will form the authentication request (see the “sets” module parameter).
    
*   _output\_set\_name_ (string) - the name of the set that contains the list of attributes and pvars that will be extracted form the authentication reply (see the “sets” module parameter).
    

The sets must be defined using the “sets” exported parameter.

The function return TRUE (retcode 1) if authentication was successful, FALSE (retcode -1) if an error (any kind of error) occurred during authentication processes or FALSE (retcode -2) if authentication was rejected or denied by RADIUS server.

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, ONREPLY\_ROUTE, BRANCH\_ROUTE, ERROR\_ROUTE and LOCAL\_ROUTE.

**Example�1.5.�`radius_send_auth` usage**

...
radius\_send\_auth("set1","set2");
switch ($rc) {
	case 1:
		xlog("authentication ok \\n");
		break;
	case -1:
		xlog("error during authentication\\n");
		break;
	case -2:
		xlog("authentication denied \\n");
		break;
}
...

		

  

### 1.4.2.� `radius_send_acct(input_set_name)`

This function can be used from the script to make custom radius authentication request. The function takes only one string parameter that represents the name of the set that contains the list of attributes and pvars that will form the accounting request.

Only one set is needed as a parameter because no AVPs can be extracted from the accounting replies.

The set must be defined using the "sets" exported parameter.

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, ONREPLY\_ROUTE, BRANCH\_ROUTE, ERROR\_ROUTE and LOCAL\_ROUTE.

**Example�1.6.�`radius_send_acct` usage**

...
radius\_send\_acct("set1");
...

		

  

## 1.5.�Exported Async Functions

### 1.5.1.� `radius_send_auth(input_set_name, output_set_name)`

This function can be used from the script to make custom radius authentication request.

Parameters:

*   _input\_set\_name_ (string) - the name of the set that contains the list of attributes and pvars that will form the authentication request (see the “sets” module parameter).
    
*   _output\_set\_name_ (string) - the name of the set that contains the list of attributes and pvars that will be extracted form the authentication reply (see the “sets” module parameter).
    

The sets must be defined using the “sets” exported parameter.

The function return TRUE (retcode 1) if authentication was successful, FALSE (retcode -1) if an error (any kind of error) occurred during authentication processes or FALSE (retcode -2) if authentication was rejected or denied by RADIUS server.

**Example�1.7.�`radius_send_auth` usage**

...
{
async( radius\_send\_auth("set1","set2"), resume);
}

route\[resume\] {
switch ($rc) {
	case 1:
		xlog("authentication ok \\n");
		break;
	case -1:
		xlog("error during authentication\\n");
		break;
	case -2:
		xlog("authentication denied \\n");
		break;
}
...

		

  

### 1.5.2.� `radius_send_acct(input_set_name)`

This function can be used from the script to make custom radius authentication request. The function takes only one string parameter that represents the name of the set that contains the list of attributes and pvars that will form the accounting request.

Only one set is needed as a parameter because no AVPs can be extracted from the accounting replies.

The set must be defined using the "sets" exported parameter.

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, ONREPLY\_ROUTE, BRANCH\_ROUTE, ERROR\_ROUTE and LOCAL\_ROUTE.

**Example�1.8.�`radius_send_acct` usage**

...
{
async( radius\_send\_acct("set1","set2"), resume);
}

route\[resume\] {
xlog(" accounting finished\\n");
}

...

		

  

## Chapter�2.�Using radius async

## 2.1.�Downloading radius-client library

You can download the last freeRADIUS Client Library sources from [here](ftp://ftp.freeradius.org/pub/freeradius/freeradius-client-1.1.7.tar.gz) . So the first step would be to download these sources in any folder you want. In this exaple we will consider this folder generically called _freeRADIUS-client_. After you download the sources, extract the contents of the archive.

**Example�2.1.� downloading the library**

........
mkdir freeRADIUS-client; cd freeRADIUS-client
wget ftp://ftp.freeradius.org/pub/freeradius/freeradius-client-1.1.7.tar.gz
tar -xzvf freeradius-client-1.1.7.tar.gz
........
		

  

## 2.2.� Applying the patch

After you extracted the contents of the archive, you can apply the patch called _radius\_async\_support.patch_ that you can find in _modules/aaa\_radius/_ inside OpenSIPS sources folder. You must apply this patch to the freeRADIUS-client library and after this you can install the radius library as usual using configure and make commands and free to use the library.

**Example�2.2.� How to apply the patch**

........
cd freeRADIUS-client/freeradius-client-1.1.7.tar.gz
patch -p1 < /path/to/opensips/modules/aaa\_radius/radius\_async\_support.patch
./configure --any-options-you-want
make
sudo make install
........
		

  

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

Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita))

23

11

1258

30

2.

Irina-Maria Stanescu

23

10

1432

60

3.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

15

13

51

42

4.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

15

12

102

82

5.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

9

7

21

49

6.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

6

3

49

73

7.

Boris Ratner

4

2

38

5

8.

Anca Vamanu

4

2

5

3

9.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

4

2

4

4

10.

Matt Lehner

3

1

32

3

  

**All remaining contributors**: Авдиенко Михаил, Alex Massover, Juli�n Moreno Pati�o, Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Walter Doekes ([@wdoekes](https://github.com/wdoekes)), Zero King ([@l2dy](https://github.com/l2dy)), Dan Pascu ([@danpascu](https://github.com/danpascu)).

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 3.2.�By Commit Activity

**Table�3.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Feb 2023

2.

Zero King ([@l2dy](https://github.com/l2dy))

Mar 2020 - Mar 2020

3.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Sep 2010 - Sep 2019

4.

Dan Pascu ([@danpascu](https://github.com/danpascu))

May 2019 - May 2019

5.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Apr 2019

6.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Aug 2009 - Apr 2019

7.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Mar 2014 - Nov 2018

8.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

9.

Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita))

Jun 2015 - Apr 2017

10.

Juli�n Moreno Pati�o

Feb 2016 - Feb 2016

  

**All remaining contributors**: Walter Doekes ([@wdoekes](https://github.com/wdoekes)), Boris Ratner, Matt Lehner, Irina-Maria Stanescu, Авдиенко Михаил, Alex Massover, Anca Vamanu.

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�4.�Documentation

## 4.1.�Contributors

**Last edited by:** Zero King ([@l2dy](https://github.com/l2dy)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita)), Walter Doekes ([@wdoekes](https://github.com/wdoekes)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Boris Ratner, Irina-Maria Stanescu.

_Documentation Copyrights:_

Copyright � 2009 Irina-Maria Stanescu

Copyright � 2009 Voice Sistem SRL