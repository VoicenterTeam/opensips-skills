# PUA Bridged Line Appearances

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5764192)

2.2. [Most recently active contributors(1) to this module](#idp5865280)

**List of Examples**

1.1. [Set `default_domain` parameter](#idp480304)

1.2. [Set `header_name` parameter](#idp470288)

1.3. [Set `outbound_proxy` parameter](#idp387008)

1.4. [Set `server_address` parameter](#idp391056)

1.5. [Set `presence_server` parameter](#idp5737872)

1.6. [`bla_set_flag` usage](#idp5743712)

1.7. [`bla_handle_notify` usage](#idp5748784)

## Chapter�1.�Admin Guide

## 1.1.�Overview

The pua\_bla module enables Bridged Line Appearances support according to the specifications in draft-anil-sipping-bla-03.txt.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _usrloc_.
    
*   _pua_.
    
*   _presence_.
    

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _libxml_.
    

## 1.3.�Exported Parameters

### 1.3.1.�`default_domain`(str)

The default domain for the registered users to be used when constructing the uri for the registrar callback.

_Default value is “NULL”._

**Example�1.1.�Set `default_domain` parameter**

...
modparam("pua\_bla", "default\_domain", "opensips.org")
...

  

### 1.3.2.�`header_name`(str)

The name of the header to be added to Publish requests. It will contain the uri of the user agent that sent the Notify that is transformed into Publish. It stops sending a Notification with the same information to the sender.

_Default value is “NULL”._

**Example�1.2.�Set `header_name` parameter**

...
modparam("pua\_bla", "header\_name", "Sender")
...

  

### 1.3.3.�`outbound_proxy`(str)

The outbound\_proxy uri to be used when sending Subscribe requests.

_Default value is “NULL”._

**Example�1.3.�Set `outbound_proxy` parameter**

...
modparam("pua\_bla", "outbound\_proxy", "sip:proxy@opensips.org")
...

  

### 1.3.4.�`server_address`(str)

The IP address of the server.

**Example�1.4.�Set `server_address` parameter**

...
modparam("pua\_bla", "server\_address", "sip:bla@160.34.23.12")
...

  

### 1.3.5.�`presence_server`(str)

The address of the presence server - will be used as an outbound proxy when sending PUBLISH requests. It is optional.

_Default value is “NULL”._

**Example�1.5.�Set `presence_server` parameter**

...
modparam("pua\_bla", "presence\_server", "sip:pa@opensips.org")
...

  

## 1.4.�Exported Functions

### 1.4.1.� `bla_set_flag()`

The function is used to mark REGISTER requests made to a BLA AOR. The modules subscribes to the registered contacts for dialog;sla event.

**Example�1.6.�`bla_set_flag` usage**

...
if(is\_method("REGISTER") && $tu=~"bla\_aor@opensips.org") 
	bla\_set\_flag();		
...

  

### 1.4.2.� `bla_handle_notify()`

The function handles Notify requests sent from phones on the same BLA to the server. The message is transformed in Publish request and passed to presence module for further handling. in case of a successful processing a 2xx reply should be sent.

**Example�1.7.�`bla_handle_notify` usage**

...
if(is\_method("NOTIFY") && $tu=~"bla\_aor@opensips.org") 
{
		if( bla\_handle\_notify() ) 
			t\_reply(200, "OK");
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

Anca Vamanu

57

27

1961

779

2.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

17

14

58

73

3.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

16

13

43

61

4.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

9

7

17

15

5.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

8

6

12

13

6.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

7

5

20

18

7.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

4

2

15

4

8.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

3

1

6

16

9.

Sergio Gutierrez

3

1

4

4

10.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

3

1

3

3

  

**All remaining contributors**: Konstantin Bokarius, Juha Heinanen ([@juha-h](https://github.com/juha-h)), Ezequiel Lovelle ([@lovelle](https://github.com/lovelle)), Ken Rice, Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Edson Gellert Schubert, Stanislaw Pitucha.

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 2.2.�By Commit Activity

**Table�2.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Jul 2007 - Nov 2025

2.

Ken Rice

Sep 2025 - Sep 2025

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Mar 2014 - May 2024

4.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Feb 2023

5.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Feb 2012 - Jan 2023

6.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Apr 2019

7.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

8.

Ezequiel Lovelle ([@lovelle](https://github.com/lovelle))

Oct 2014 - Oct 2014

9.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

Dec 2010 - Jan 2013

10.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

Aug 2011 - Aug 2011

  

**All remaining contributors**: Anca Vamanu, Stanislaw Pitucha, Sergio Gutierrez, Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Juha Heinanen ([@juha-h](https://github.com/juha-h)).

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Anca Vamanu, Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert.

_Documentation Copyrights:_

Copyright � 2007 Voice Sistem SRL