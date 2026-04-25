# Options Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5534656)

2.2. [Most recently active contributors(1) to this module](#idp5633824)

**List of Examples**

1.1. [Set `accept` parameter](#idp260656)

1.2. [Set `accept_encoding` parameter](#idp162720)

1.3. [Set `accept_language` parameter](#idp168432)

1.4. [Set `support` parameter](#idp174160)

1.5. [`options_reply` usage](#idp5524208)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This module provides a function to answer OPTIONS requests which are directed to the server itself. This means an OPTIONS request which has the address of the server in the request URI, and no username in the URI. The request will be answered with a 200 OK which the capabilities of the server.

To answer OPTIONS request directed to your server is the easiest way for is-alive-tests on the SIP (application) layer from remote (similar to ICMP echo requests, also known as “ping”, on the network layer).

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _sl_ -- Stateless replies.
    
*   _signaling_ -- Stateless replies.
    

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _None_.
    

## 1.3.�Exported Parameters

### 1.3.1.�`accept` (string)

This parameter is the content of the Accept header field. If “”, the header is not added in the reply. Note: it is not clearly written in RFC3261 if a proxy should accept any content (the default “\*/\*”) because it does not care about content. Or if it does not accept any content, which is “”.

_Default value is “\*/\*”._

**Example�1.1.�Set `accept` parameter**

...
modparam("options", "accept", "application/\*")
...

  

### 1.3.2.�`accept_encoding` (string)

This parameter is the content of the Accept-Encoding header field. If “”, the header is not added in the reply. Please do not change the default value because OpenSIPS does not support any encodings yet.

_Default value is “”._

**Example�1.2.�Set `accept_encoding` parameter**

...
modparam("options", "accept\_encoding", "gzip")
...

  

### 1.3.3.�`accept_language` (string)

This parameter is the content of the Accept-Language header field. If “”, the header is not added in the reply. You can set any language code which you prefer for error descriptions from other devices, but presumably there are not much devices around which support other languages then the default English.

_Default value is “en”._

**Example�1.3.�Set `accept_language` parameter**

...
modparam("options", "accept\_language", "de")
...

  

### 1.3.4.�`support` (string)

This parameter is the content of the Support header field. If “”, the header is not added in the reply. Please do not change the default value, because OpenSIPS currently does not support any of the SIP extensions registered at the IANA.

_Default value is “”._

**Example�1.4.�Set `support` parameter**

...
modparam("options", "support", "100rel")
...

  

## 1.4.�Exported Functions

### 1.4.1.� `options_reply()`

This function checks if the request method is OPTIONS and if the request URI does not contain an username. If both is true the request will be answered stateless with “200 OK” and the capabilities from the modules parameters.

It sends “500 Server Internal Error” for some errors and returns false if it is called for a wrong request.

The check for the request method and the missing username is optional because it is also done by the function itself. But you should not call this function outside the myself check because in this case the function could answer OPTIONS requests which are sent to you as outbound proxy but with an other destination then your proxy (this check is currently missing in the function).

This function can be used from REQUEST\_ROUTE.

**Example�1.5.�`options_reply` usage**

...
if (is\_myself("$rd")) {
	if (is\_method("OPTIONS") && (! $ru=~"sip:.\*\[@\]+.\*")) {
		options\_reply();
	}
}
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

20

18

52

35

2.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

14

12

41

31

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

10

8

29

45

4.

Nils Ohlmeier

10

3

630

4

5.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

8

5

85

88

6.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

5

3

9

6

7.

Elena-Ramona Modroiu

4

2

4

4

8.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

4

2

3

4

9.

Ancuta Onofrei

3

1

10

11

10.

Jan Janak ([@janakj](https://github.com/janakj))

3

1

7

7

  

**All remaining contributors**: Konstantin Bokarius, Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Edson Gellert Schubert.

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

Jul 2014 - May 2024

2.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Feb 2023

3.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Nov 2012 - Sep 2019

4.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Nov 2003 - Apr 2019

5.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Apr 2019

6.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

7.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

Jul 2006 - Mar 2008

8.

Konstantin Bokarius

Mar 2008 - Mar 2008

9.

Edson Gellert Schubert

Feb 2008 - Feb 2008

10.

Ancuta Onofrei

Sep 2007 - Sep 2007

  

**All remaining contributors**: Elena-Ramona Modroiu, Jan Janak ([@janakj](https://github.com/janakj)), Nils Ohlmeier.

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Elena-Ramona Modroiu, Jan Janak ([@janakj](https://github.com/janakj)), Nils Ohlmeier.

_Documentation Copyrights:_

Copyright � 2003 FhG FOKUS