# mangler Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5565728)

2.2. [Most recently active contributors(1) to this module](#idp5666768)

**List of Examples**

1.1. [Set `db_url` parameter](#idp259408)

1.2. [`sdp_mangle_ip` usage](#idp170528)

1.3. [`sdp_mangle_port` usage](#idp5516048)

1.4. [`encode_contact` usage](#idp5525264)

1.5. [`decode_contact` usage](#idp5530608)

1.6. [`decode_contact_header` usage](#idp5538864)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This is a module to help with SDP mangling. Note: This module is obselete and will be removed for the 1.5.0 release.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _No dependencies on other OpenSIPS modules_.
    

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _None_.
    

## 1.3.�Exported Parameters

### 1.3.1.�`contact_flds_separator` (string)

First char of this parameter is used as separator for encoding/decoding Contact header.

### Warning

First char of this field must be set to a value which is not used inside username,password or other fields of contact. Otherwise it is possible for the decoding step to fail/produce wrong results.

_Default value is “\*”._

**Example�1.1.�Set `db_url` parameter**

...
modparam("mangler", "contact\_flds\_separator", "-")
...

  

then an encoded uri might look sip:user-password-ip-port-protocol@PublicIP

## 1.4.�Exported Functions

### 1.4.1.� `sdp_mangle_ip(pattern, newip)`

Changes IP addresses inside SDP package in lines describing connections like c=IN IP4 Currently in only changes IP4 addresses since IP6 probably will not need to traverse NAT :)

The function returns negative on error, or number of replacements + 1.

Meaning of the parameters is as follows:

*   _pattern_ (string) - A pair ip/mask used to match IP's located inside SDP package in lines c=IN IP4 ip. This lines will only be mangled if located IP is in the network described by this pattern. Examples of valid patterns are “10.0.0.0/255.0.0.0” or “10.0.0.0/8” etc.
    
*   _newip_ (string) - the new IP to be put inside SDP package if old IP address matches pattern.
    

This function can be used from REQUEST\_ROUTE, ONREPLY\_ROUTE.

**Example�1.2.�`sdp_mangle_ip` usage**

...
sdp\_mangle\_ip("10.0.0.0/8","193.175.135.38");
...

  

### 1.4.2.� `sdp_mangle_port(offset)`

Changes ports inside SDP package in lines describing media like m=audio 13451.

The function returns negative on error, or number of replacements + 1.

Meaning of the parameters is as follows:

*   _offset_ (int) - an integer which will be added/subtracted from the located port.
    

This function can be used from REQUEST\_ROUTE, ONREPLY\_ROUTE.

**Example�1.3.�`sdp_mangle_port` usage**

...
sdp\_mangle\_port(-12000);
...

  

### 1.4.3.� `encode_contact(encoding_prefix, public_ip)`

This function will encode uri-s inside Contact header in the following manner sip:username:password@ip:port;transport=protocol goes sip:enc\_pref\*username\*ip\*port\*protocol@public\_ip \* is the default separator.

The function returns negative on error, 1 on success.

Meaning of the parameters is as follows:

*   _encoding\_prefix_ (string) - Something to allow us to determine that a contact is encoded publicip--a routable IP, most probably you should put your external IP of your NAT box.
    
    _public\_ip_ (string) - The public IP which will be used in the encoded contact, as described by the example above.
    

This function can be used from REQUEST\_ROUTE, ONREPLY\_ROUTE.

**Example�1.4.�`encode_contact` usage**

...
if ($si == 10.0.0.0/8) encode\_contact("enc\_prefix","193.175.135.38"); 
...

  

### 1.4.4.� `decode_contact()`

This function will decode the URI in first line in packets which come with encoded URI in the following manner sip:enc\_pref\*username\*ip\*port\*protocol@public\_ip goes to sip:username:password@ip:port;transport=protocol It uses the default set parameter for contact encoding separator.

The function returns negative on error, 1 on success.

Meaning of the parameters is as follows:

This function can be used from REQUEST\_ROUTE.

**Example�1.5.�`decode_contact` usage**

...
if ($ru =~ "^enc\*") { decode\_contact(); }
...

  

### 1.4.5.� `decode_contact_header()`

This function will decode URIs inside Contact header in the following manner sip:enc\_pref\*username\*ip\*port\*protocol@public\_ip goes to sip:username:password@ip:port;transport=protocol. It uses the default set parameter for contact encoding separator.

The function returns negative on error, 1 on success.

Meaning of the parameters is as follows:

This function can be used from REQUEST\_ROUTE, ONREPLY\_ROUTE.

**Example�1.6.�`decode_contact_header` usage**

...
if ($ru =~ "^enc\*") { decode\_contact\_header(); }
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

Gabriel Vasile

50

13

3118

674

2.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

26

20

195

198

3.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

14

12

39

27

4.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

13

11

25

49

5.

Andrei Pelinescu-Onciul

12

9

71

72

6.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

9

7

17

60

7.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

9

6

102

108

8.

Jan Janak ([@janakj](https://github.com/janakj))

9

4

428

48

9.

Henning Westerholt ([@henningw](https://github.com/henningw))

8

5

13

104

10.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

4

2

5

6

  

**All remaining contributors**: Maksym Sobolyev ([@sobomax](https://github.com/sobomax)), Jiri Kuthan ([@jiriatipteldotorg](https://github.com/jiriatipteldotorg)), Walter Doekes ([@wdoekes](https://github.com/wdoekes)), Konstantin Bokarius, Edson Gellert Schubert, Elena-Ramona Modroiu.

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

Mar 2014 - May 2023

2.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Feb 2023

3.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Jul 2005 - Apr 2020

4.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Feb 2020

5.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Jun 2011 - Sep 2019

6.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Apr 2019

7.

Walter Doekes ([@wdoekes](https://github.com/wdoekes))

Jun 2014 - Jun 2014

8.

Henning Westerholt ([@henningw](https://github.com/henningw))

May 2007 - Jun 2008

9.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

Sep 2003 - Mar 2008

10.

Konstantin Bokarius

Mar 2008 - Mar 2008

  

**All remaining contributors**: Edson Gellert Schubert, Elena-Ramona Modroiu, Jan Janak ([@janakj](https://github.com/janakj)), Andrei Pelinescu-Onciul, Jiri Kuthan ([@jiriatipteldotorg](https://github.com/jiriatipteldotorg)), Gabriel Vasile.

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Henning Westerholt ([@henningw](https://github.com/henningw)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Elena-Ramona Modroiu, Jan Janak ([@janakj](https://github.com/janakj)).

_Documentation Copyrights:_

Copyright � 2003 FhG FOKUS