# event\_datagram Module

---

**List of Tables**

3.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp30694448)

3.2. [Most recently active contributors(1) to this module](#idp30786576)

**List of Examples**

1.1. [E\_PIKE\_BLOCKED event](#idp25437136)

1.2. [UNIX socket](#idp25438912)

1.3. [UDP socket](#idp25425008)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This is a module which provides a UNIX/UDP SOCKET transport layer implementation for the Event Interface.

## 1.2.�DATAGRAM events syntax

The event payload is formated as a JSON-RPC notification, with the event name as the _method_ field and the event parameters as the _params_ field.

## 1.3.�DATAGRAM socket syntax

There are two types of sockets used by this module, based on the sockets type. An UNIX socket should follow this syntax:

_\['unix:'\] unix\_socket\_path_

An UDP socket should follow this syntax:

_'udp:' address ':' port_

## 1.4.�Dependencies

### 1.4.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _No dependencies on other OpenSIPS modules_.
    

### 1.4.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _none_
    

## 1.5.�Exported Parameters

No parameter exported by this module.

## 1.6.�Exported Functions

No function exported to be used from configuration file.

## 1.7.�Example

This is an example of an event raised by the pike module when it decides an ip should be blocked:

**Example�1.1.�E\_PIKE\_BLOCKED event**

{
  "jsonrpc": "2.0",
  "method": "E\_PIKE\_BLOCKED",
  "params": {
    "ip": "192.168.2.11"
  }
}

  

**Example�1.2.�UNIX socket**

unix:/tmp/opensips\_event.sock

  

**Example�1.3.�UDP socket**

udp:127.0.0.1:8081

  

## Chapter�2.�Frequently Asked Questions

**2.1.**

Both UNIX and UDP type of socket can be used to notify the events?

Yes, you can use the both types.

**2.2.**

What is the maximum lenght of a datagram event?

The maximum length of a datagram event is 65457 bytes.

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

25

16

854

37

2.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

8

6

12

29

3.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

8

4

27

140

4.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

4

2

3

1

5.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

4

2

2

3

6.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

4

2

2

2

  

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

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Aug 2020

3.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Jul 2020

4.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

May 2011 - Sep 2019

5.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Oct 2014 - Apr 2019

6.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Mar 2014 - Nov 2018

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�4.�Documentation

## 4.1.�Contributors

**Last edited by:** Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)).

_Documentation Copyrights:_

Copyright � 2011 [www.opensips-solutions.com](http://www.opensips-solutions.com/)