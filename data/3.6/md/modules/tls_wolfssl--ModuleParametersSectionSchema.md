# tls\_wolfssl Module

---

**List of Tables**

3.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp4447392)

3.2. [Most recently active contributors(1) to this module](#idp5647664)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This module implements TLS operations using the [_wolfSSL_](https://www.wolfssl.com/) libarary. It provides the primitives required by the _tls\_mgm_ module in order to expose a higher-level API used by TLS-based protocol modules like _proto\_tls_ or _proto\_wss_.

The _wolfSSL_ library is statically-linked and bundled with this module so no installation or external dependency is required.

## 1.2.�Dependencies

### 1.2.1.�Compilation

The following packages must be installed before compiling this module:

*   _autoconf_.
    
*   _automake_.
    
*   _libtool_.
    

### 1.2.2.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _None_.
    

### 1.2.3.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _None_.
    

## Chapter�2.�Frequently Asked Questions

**2.1.**

Why do I get the following error when compiling the module?

    make\[1\]: Entering directory '/usr/local/src/opensips/modules/tls\_wolfssl'
    /bin/sh: 3: ./autogen.sh: not found
    env: './configure': No such file or directory
    make\[1\]: \*\*\* \[Makefile:15: lib/lib/libwolfssl.a\] Error 127
    make\[1\]: Leaving directory '/usr/local/src/opensips/modules/tls\_wolfssl'
    make: \*\*\* \[Makefile:197: modules\] Error 2
		

If you obtained the OpenSIPS sources by cloning the repository from Github, without using the _\--recursive_ option for the _git clone_ command, you did not properly fetch the _wolfSSL_ library code, which is included as a git submodule pointing to the official _wolfSSL_ repository.

In order to fetch the _wolfSSL_ library code you can run:

		git submodule update --init
		

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

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

29

22

553

114

2.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

14

10

219

77

3.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

4

2

2

2

4.

James Stanley

3

1

6

1

5.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

3

1

3

3

6.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

3

1

2

2

7.

Bence Szigeti

3

1

1

1

8.

Alexey Vasilyev ([@vasilevalex](https://github.com/vasilevalex))

2

1

11

0

9.

vladpaiu

2

1

8

0

  

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 3.2.�By Commit Activity

**Table�3.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Aug 2023 - Feb 2026

2.

vladpaiu

Jun 2025 - Jun 2025

3.

James Stanley

Feb 2024 - Feb 2024

4.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Oct 2023 - Oct 2023

5.

Bence Szigeti

Oct 2023 - Oct 2023

6.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

May 2023 - May 2023

7.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2021 - Mar 2023

8.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Feb 2023

9.

Alexey Vasilyev ([@vasilevalex](https://github.com/vasilevalex))

Jan 2022 - Jan 2022

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�4.�Documentation

## 4.1.�Contributors

**Last edited by:** Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)).

_Documentation Copyrights:_

Copyright � 2021 [www.opensips-solutions.com](http://www.opensips-solutions.com/)