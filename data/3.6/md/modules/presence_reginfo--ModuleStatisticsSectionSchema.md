# presence\_reginfo Module

### Carsten Bock

`<[carsten@ng-voice.com](mailto:carsten@ng-voice.com)>`

#### Edited by

### Carsten Bock

`<[carsten@ng-voice.com](mailto:carsten@ng-voice.com)>`

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp185376)

2.2. [Most recently active contributors(1) to this module](#idp5553744)

**List of Examples**

1.1. [Set `default_expires` parameter](#idp2969840)

1.2. [Set `aggregate_presentities` parameter](#idp150400)

## Chapter�1.�Admin Guide

## 1.1.�Overview

The module enables the handling of "Event: reg" (as defined in RFC 3680) inside of the presence module. This can be used distribute the registration-info status to the subscribed watchers.

The module does not currently implement any authorization rules. It assumes that publish requests are only issued by an authorized application and subscribe requests only by authorized users. Authorization can thus be easily done in OpenSIPS configuration file before calling handle\_publish() and handle\_subscribe() functions.

Note: This module only activates the processing of the "reg" in the presence module. To send dialog-info to watchers you also need a source which PUBLISH the reg info to the presence module. For example you can use the pua\_reginfo module or any external component. This approach allows to have the presence server and the reg-info aware publisher (e.g. the main proxy) on different OpenSIPS instances.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _presence_.
    

### 1.2.2.�External Libraries or Applications

None.

## 1.3.�Parameters

### 1.3.1.�`default_expires` (int)

The default expires value used when missing from SUBSCRIBE message (in seconds).

_Default value is “3600”._

**Example�1.1.�Set `default_expires` parameter**

        ...
        modparam("presence\_reginfo", "default\_expires", 3600)
        ...
        

  

### 1.3.2.�`aggregate_presentities` (int)

Whether to aggregate in a single notify body all registration presentities. Useful to have all registrations on first NOTIFY following initial SUBSCRIBE.

_Default value is “0” (disabled)._

**Example�1.2.�Set `aggregate_presentities` parameter**

					...
					modparam("presence\_reginfo", "aggregate\_presentities", 1)
					...
					

  

## 1.4.�Functions

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

Carsten Bock

8

1

771

0

2.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

4

2

14

17

3.

Ken Rice

3

1

2

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

Ken Rice

Sep 2025 - Sep 2025

2.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Apr 2024 - Apr 2024

3.

Carsten Bock

Mar 2024 - Mar 2024

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Carsten Bock.

_Documentation Copyrights:_

Copyright � 2011-2023 Carsten Bock, carsten@ng-voice.com, http://www.ng-voice.com