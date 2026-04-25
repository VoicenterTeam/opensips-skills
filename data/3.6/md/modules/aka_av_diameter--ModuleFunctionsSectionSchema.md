# AKA Authentication Vector Diameter Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5592096)

2.2. [Most recently active contributors(1) to this module](#idp5656560)

**List of Examples**

1.1. [`aaa_url` parameter usage](#idp5569888)

1.2. [`realm` parameter usage](#idp5574784)

1.3. [`server_uri` parameter usage](#idp5579232)

1.4. [Diameter Commands File Example](#idp5583136)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This module is an extension to the _AKA\_AUTH_ module providing a Diameter AKA AV Manager that implements the Multimedia-Auth-Request and Multimedia-Auth-Answer Diameter commands defined in the _Cx_ interface of the _ETSI TS 129 229_ specifications in order to fetch a set of authentication vectors and feed them in the AKA authentication process.

When the _AKA\_AUTH_ module needs a new authentication vector to do an _aka\_challenge()_, it may require this module to fetch a set of authentication vectors for the purpose. The module packs the query in a _MAR_ (Multimedia-Auth-Request) command and sends it to an _HSS_ Diameter server. When an _MAA_ (Multimedia-Auth-Answer) command is received in response, the corresponding authentication vectors are gathered and fed back to the _AUTH\_AKA_ engine.

It uses the _AAA\_Diameter_ module to perform the Diameter requests. It may run in both a synchronous and asynchronous mode, depending on how the _AUTH\_AKA_ module performs the query.

## 1.2.�Setup

The module requires an _aaa\_diameter_ connection to an _HSS_ Diameter server that implements the _Cx_ interfaces and is able to provide authentication vectors through the Multimedia-Auth-Request and Multimedia-Auth-Answer commands.

The format of the command, along with the required fields can be found in the _example/aka\_av\_diameter.dictionary_ file located in the module's source directory, as well as in the [Diameter Commands Example](#example_diameter_commands "1.5.�Diameter Commands File") section.

_Note:_ the module internals uses the AVPs names found in the provided dictionary - changing the file may break the behavior of the module.

## 1.3.�Dependencies

### 1.3.1.�OpenSIPS Modules

The module depends on the following modules (in the other words the listed modules must be loaded before this module):

*   _auth\_aka_ -- AKA Authentication module that triggers the AKA authentication process
    
*   _aaa\_diameter_ -- AAA Diameter module that implements the Diameter communication to the _HSS_ Server.
    

### 1.3.2.�External Libraries or Applications

This module does not depend on any external library.

## 1.4.�Exported Parameters

### 1.4.1.�`aaa_url` (string)

This is the url representing the connection to the AAA server.

_Note:_ Currently the module only supports connections to a Diameter server. The path to the AVPs configuration file is also required, otherwise the module will not start, or not work properly.

**Example�1.1.�`aaa_url` parameter usage**

modparam("auth\_aaa", "aaa\_url", "diameter:freeDiameter.conf;extra-avps-file:/etc/freeDiameter/aka\_av\_diameter.dictionary")
		

  

### 1.4.2.�`realm` (string)

The Realm used in the Origin Diameter commands.

Default value is “diameter.test”.

**Example�1.2.�`realm` parameter usage**

		
modparam("aka\_av\_diameter", "realm", "scscf.ims.mnc001.mcc001.3gppnetwork.org")
		

  

### 1.4.3.�`server_uri` (string)

The Server-URI used in the Diameter commands.

If it is left empty, the Server-Name will be created by adding "sip:" in front of the realm parameter value (e.g. “sip:scscf.ims.mnc001.mcc001.3gppnetwork.org”).

**Example�1.3.�`server_uri` parameter usage**

		
modparam("aka\_av\_diameter", "server\_uri", "sip:scscf.ims.mnc001.mcc001.3gppnetwork.org")
		

  

## 1.5.�Diameter Commands File

File that should be provided to the _aaa\_diameter_ connection.

**Example�1.4.�Diameter Commands File Example**

VENDOR 10415 TGPP

ATTRIBUTE Public-Identity                     601 string     10415
ATTRIBUTE Server-Name                         602 string     10415
ATTRIBUTE 3GPP-SIP-Number-Auth-Items          607 unsigned32 10415
ATTRIBUTE 3GPP-SIP-Authentication-Scheme      608 utf8string 10415
ATTRIBUTE 3GPP-SIP-Authenticate               609 hexstring  10415
ATTRIBUTE 3GPP-SIP-Authorization              610 hexstring  10415
ATTRIBUTE 3GPP-SIP-Authentication-Context     611 string     10415
ATTRIBUTE 3GPP-SIP-Item-Number                613 unsigned32 10415
ATTRIBUTE Confidentiality-Key                 625 hexstring  10415
ATTRIBUTE Integrity-Key                       626 hexstring  10415


ATTRIBUTE 3GPP-SIP-Auth-Data-Item             612 grouped    10415
{
	3GPP-SIP-Item-Number | OPTIONAL | 1
	3GPP-SIP-Authentication-Scheme | OPTIONAL | 1
	3GPP-SIP-Authenticate | OPTIONAL | 1
	3GPP-SIP-Authorization | OPTIONAL | 1
	3GPP-SIP-Authentication-Context | OPTIONAL | 1
	Confidentiality-Key | OPTIONAL | 1
	Integrity-Key | OPTIONAL | 1
}

APPLICATION-AUTH 16777216/10415 3GPP Cx

REQUEST 303 Multimedia-Auth Request
{
	Session-Id | REQUIRED | 1
	Origin-Host | REQUIRED | 1
	Origin-Realm | REQUIRED | 1
	Destination-Realm | REQUIRED | 1
	Vendor-Specific-Application-Id | REQUIRED | 1
	Auth-Session-State | REQUIRED | 1
	User-Name | REQUIRED | 1
	Public-Identity | REQUIRED | 1
	3GPP-SIP-Number-Auth-Items | REQUIRED | 1
	3GPP-SIP-Auth-Data-Item | REQUIRED | 1
	Server-Name | REQUIRED | 1
}

ANSWER 303 Multimedia-Auth Answer
{
	Session-Id | REQUIRED | 1
	Origin-Host | REQUIRED | 1
	Origin-Realm | REQUIRED | 1
	Destination-Host | OPTIONAL | 1
	Destination-Realm | OPTIONAL | 1
	Vendor-Specific-Application-Id | REQUIRED | 1
	Auth-Session-State | REQUIRED | 1
	User-Name | REQUIRED | 1
	Public-Identity | REQUIRED | 1
	3GPP-SIP-Number-Auth-Items | REQUIRED | 1
	3GPP-SIP-Auth-Data-Item | REQUIRED | 1
	Result-Code | REQUIRED | 1
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

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

13

4

941

4

2.

LarryLaffer-dev

6

4

57

24

  

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 2.2.�By Commit Activity

**Table�2.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

LarryLaffer-dev

Mar 2025 - Mar 2025

2.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Mar 2024 - Mar 2024

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** LarryLaffer-dev, Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)).

_Documentation Copyrights:_

Copyright � 2024 OpenSIPS Solutions;