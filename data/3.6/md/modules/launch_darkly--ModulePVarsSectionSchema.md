# launch\_darkly Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5598512)

2.2. [Most recently active contributors(1) to this module](#idp5662576)

**List of Examples**

1.1. [Set `sdk_key` parameter](#idp293200)

1.2. [Set `log_level` parameter](#idp165712)

1.3. [Set `connect_wait` parameter](#idp170288)

1.4. [Set `re_init_interval` parameter](#idp5567312)

1.5. [`ld_feature_enabled()` function usage](#idp5580480)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This module implements support for the [Launch Darkly](https://launchdarkly.com/) feature management cloud. The module provide the conectivity to the cloud and the ability to query for feature flags.

OpenSIPS uses the [server side C/C++ SDK](https://launchdarkly.com/features/sdk/) provided by Launch Darkly.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _none_.
    

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _ldserverapi_
    

_ldserverapi_ must be compiled and installed from the official [GITHUB repository](https://github.com/launchdarkly/c-server-sdk) .

The instructions for a quick installations of the library (note that it has to be compiled as shared lib in order to be compatible with the OpenSIPS modules):

...
	$ git clone https://github.com/launchdarkly/c-server-sdk.git
	$ cd c-server-sdk
	$ cmake -DBUILD\_SHARED\_LIBS=On -DBUILD\_TESTING=OFF .
	$ sudo make install
...

## 1.3.�Exported Parameters

### 1.3.1.�`sdk_key` (string)

The LaunchDarkly SDK key used to connect to the service. This is a mandatory parameter.

**Example�1.1.�Set `sdk_key` parameter**

...
modparam("launch\_darkly", "sdk\_key", "sdk-12345678-abcd-12ab-1234-0123456789abc")
...

  

### 1.3.2.�`ld_log_level` (string)

The LaunchDarkly specific log level to be used by the LD SDK/libray to log its internal messages. Note that these log produced by the LD library (according to this ld\_log\_level) will be further subject to filtering according to the overall OpenSIPS log\_level.

Accepted values are _LD\_LOG\_FATAL_, _LD\_LOG\_CRITICAL_, _LD\_LOG\_ERROR_, _LD\_LOG\_WARNING_, _LD\_LOG\_INFO_, _LD\_LOG\_DEBUG_, _LD\_LOG\_TRACE_.

If not set or set to an unsupported value, the _LD\_LOG\_WARNING_ level will be used by default.

**Example�1.2.�Set `log_level` parameter**

...
modparam("launch\_darkly", "ld\_log\_level", "LD\_LOG\_CRITICAL")
...

  

### 1.3.3.�`connect_wait` (integer)

The time to wait (in miliseconds) when connecting to the LD service. An initial failure in connecting to the LD service may be addressed by increasing this wait value.

The default value is 500 miliseconds.

**Example�1.3.�Set `connect_wait` parameter**

...
modparam("launch\_darkly", "connect\_wait", 100)
...

  

### 1.3.4.�`re_init_interval` (integer)

The minimum time interval (in seconds) to try again to init the LD client in the situation when the module was not able to init the LC connection at startup. In case of such failure, the module will automatically re-try to init its LD client on-demand, whnever the feature flag is checked from script, but not sooner than \`re\_init\_interval\`. Note: if there are no flag checkings to be performed, the re-init may be attempted longer than \`re\_init\_interval\`.

The default value is 10 seconds.

**Example�1.4.�Set `re_init_interval` parameter**

...
modparam("launch\_darkly", "re\_init\_interval", 30)
...

  

## 1.4.�Exported Functions

### 1.4.1.� `ld_feature_enabled( flag, user, [user_extra], [fallback])`

Function to evaluate a LaunchDarkly boolean feature flag

Returns _1_ if the flag was found TRUE or _\-1_ otherwise.

In case of error, the fallback (TRUE or FALSE) value will be returned In such cases, a "fallback" TRUE is returned as 2 and a fallback FALSE as -2, so you can may a difference between a real TRUE (returned by the LD service) and a fallback TRUE due to an error.

This function can be used from any route.

The function has the following parameters:

*   _flag_ (string) - the key of the flag to evaluate. May not be NULL or empty.
    
*   _user_ (string) - the user to evaluate the flag against. May not be NULL or empty.
    
*   _user\_extra_ (AVP, optional) - an AVP holding one or multiple key-value attributes to be attached to the user. The format of the AVP value is "key=value".
    
*   _fallback_ (int, optional) - the value to be returned on error. By default FALSE will be returned.
    

**Example�1.5.�`ld_feature_enabled()` function usage**

	...
	$avp(extra) = "domainId=123456";
	if (ld\_feature\_enabled("my-flag","opensips", $avp(extra), false))
		xlog("-------TRUE\\n");
	else
		xlog("-------FALSE\\n");
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

8

1

717

0

2.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

3

1

43

2

  

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 2.2.�By Commit Activity

**Table�2.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

May 2024 - May 2024

2.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Jan 2024 - Jan 2024

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)).

_Documentation Copyrights:_

Copyright � 2023 Five9 Inc.