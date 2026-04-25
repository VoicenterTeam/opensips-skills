# RTP.io Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp93888)

2.2. [Most recently active contributors(1) to this module](#idp5549040)

**List of Examples**

1.1. [Set `rtpproxy_args` parameter](#idp245776)

## Chapter�1.�Admin Guide

## 1.1.�Overview

The RTP.io module provides an integrated solution for handling RTP traffic within OpenSIPS, enabling RTP relaying and processing directly inside the OpenSIPS process. This eliminates the need for external processes such as RTPProxy, resulting in a more streamlined, efficient, and manageable system for certain use cases.

The _rtp.io_ module starts RTP handling threads in the main OpenSIPS process and allows the _rtpproxy_ module to access these threads via a one-to-one socket pair. This tight integration facilitates efficient RTP traffic management within OpenSIPS without relying on external RTP handling services.

The module requires RTPProxy™ version 3.1 or higher, compiled with the `--enable-librtpproxy` option to build. It utilizes the `librtpproxy` library to manage RTP traffic and interfaces with the existing _rtpproxy_ module to generate commands, parse responses, and process SIP messages.

When the _rtpproxy_ module is loaded without arguments and the _rtp.io_ module is also loaded, the sockets exported by _rtp.io_ are used automatically in set `0`. Alternatively, these sockets can be incorporated into other sets by using the `"rtp.io:auto"` moniker.

## 1.2.�Dependencies

## 1.3.�Exported Parameters

### 1.3.1.�`rtpproxy_args`(string)

Command-line parameteres passed down to the embedded RTPProxy module upon initialization. Refer to the RTPProxy documentation for the full list.

_Parameter has no default value._

**Example�1.1.�Set `rtpproxy_args` parameter**

...
modparam("rtp.io", "rtpproxy\_args", "-m 12000 -M 15000 -l 0.0.0.0 -6 /::")
...

  

## 1.4.�Exported Functions

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

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

7

1

660

0

2.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

2

1

3

0

  

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

May 2025 - May 2025

2.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Jun 2024 - Jun 2024

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Maksym Sobolyev ([@sobomax](https://github.com/sobomax)).

_Documentation Copyrights:_

Copyright � 2023 Sippy Software, Inc.