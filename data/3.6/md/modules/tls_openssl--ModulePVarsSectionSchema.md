# tls\_openssl Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp99664)

2.2. [Most recently active contributors(1) to this module](#idp5972400)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This module implements TLS operations using the [_openSSL_](https://www.openssl.org/) libarary. It provides the primitives required by the _tls\_mgm_ module in order to expose a higher-level API used by TLS-based protocol modules like _proto\_tls_ or _proto\_wss_ etc.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _None_.
    

### 1.2.2.�External Libraries or Applications

OpenSIPS TLS v1.0 support requires the following packages:

*   _openssl_ or _libssl_ >= 0.9.6
    
*   _openssl-dev_ or _libssl-dev_
    

OpenSIPS TLS v1.1/1.2 support requires the following packages:

*   _openssl_ or _libssl_ >= 1.0.1e
    
*   _openssl-dev_ or _libssl-dev_
    

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

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

25

5

2195

39

2.

James Stanley

4

2

13

8

3.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

3

1

3

3

4.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

3

1

1

1

5.

Your Name

2

1

0

1

  

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 2.2.�By Commit Activity

**Table�2.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Your Name

Jul 2024 - Jul 2024

2.

James Stanley

Apr 2023 - Feb 2024

3.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

May 2023 - May 2023

4.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Feb 2023

5.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2021 - Oct 2021

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)).

_Documentation Copyrights:_

Copyright � 2021 [www.opensips-solutions.com](http://www.opensips-solutions.com/)