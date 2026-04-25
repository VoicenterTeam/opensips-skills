# jabber Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5797152)

2.2. [Most recently active contributors(1) to this module](#idp5899264)

**List of Examples**

1.1. [Set `db_url` parameter](#idp5560432)

1.2. [Set `jaddress` parameter](#idp5571728)

1.3. [Set `jport` parameter](#idp5569248)

1.4. [Set `jdomain` parameter](#idp5578224)

1.5. [Set `jdomain` parameter](#idp5586960)

1.6. [Set `proxy` parameter](#idp5592752)

1.7. [Set `registrar` parameter](#idp5597568)

1.8. [Set `workers` parameter](#idp5602080)

1.9. [Set `max_jobs` parameter](#idp5606512)

1.10. [Set `cache_time` parameter](#idp5610944)

1.11. [Set `delay_time` parameter](#idp5615760)

1.12. [Set `sleep_time` parameter](#idp5620272)

1.13. [Set `check_time` parameter](#idp5624800)

1.14. [Set `priority` parameter](#idp5629616)

1.15. [`jab_send_message()` usage](#idp5635744)

1.16. [`jab_join_jconf()` usage](#idp5640880)

1.17. [`jab_exit_jconf()` usage](#idp5645600)

1.18. [`jab_go_online()` usage](#idp5650976)

1.19. [`jab_go_offline()` usage](#idp5656272)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This is new version of Jabber module that integrates XODE XML parser for parsing Jabber messages. That introduces a new module dependency: expat library.

Expat is a common XML library and is the fastest available for Linux/Unix, the second over all, after msxml library. It is integrated in most of well known Linux distributions.

### 1.1.1.�New Features

*   Presence support (see doc/xxjab.cfg for a sample cfg file) (January 2003).
    
*   SIP to Jabber conference support (December 2003).
    
*   Possibility to manage all kinds of Jabber messages (message/presence/iq) (December 2003).
    
*   Aliases -- Possibility to set host aliases for addresses (see parameter's desc.) (December 2003).
    
*   Send received SIP MESSAGE messages to different IM networks (Jabber, ICQ,MSN, AIM, Yahoo) using a Jabber server (December 2003).
    
*   Send incoming Jabber instant messages as SIP MESSAGE messages.
    
*   Gateways detection -- Ability to see whether an IM gateway is up or down.
    

## 1.2.�Admin's Guide

### Note

A more complete guide about SIMPLE2Jabber gateway can be found at [https://opensips.org/](https://opensips.org/). The part below will be removed soon, only the manual from web will be updated.

The Jabber server setup is not a subject of this guide. Check [http://www.jabber.org](http://www.jabber.org) for that.

Useful scripts, for creating Jabber Gateway database, or for managing the Jabber accounts form web are located in 'doc' subdirectory of the module.

Main steps of using the Jabber gateway:

*   Create the MySQL database.
    
*   Setup the local Jabber server.
    
*   Set the module parameter values in cfg file of OpenSIPS, load the dependent modules, set up the routing rules for Jabber gateway.
    
*   Run OpenSIPS.
    

The administrator of OpenSIPS/Jabber gateway _must_ inform the users what are the aliases for Jabber/Other IM networks. Other IMs could be AIM, ICQ, MSN, Yahoo, and so on.

These aliases depend on the server hostname where runs OpenSIPS and how local Jabber server is setup.

Next is presented a use case. Prologue:

*   OpenSIPS is running on “server.org”.
    
*   Local Jabber server is running on “jabsrv.server.org”.
    
*   Jabber network alias (first part of “jdomain”) is “jabber.server.org”
    

The aliases for other IM networks _must_ be the same as JID set in Jabber configuration file for each IM transport.

The JIDs of Jabber transports _must_ start with the name of the network. For AIM, JID must start with “aim.”, for ICQ with “icq” (that because I use icqv7-t), for MSN with “msn.” and for Yahoo with “yahoo.”. The gateway needs these to find out what transport is working and which not. For our use case these could be like “aim.server.org”, “icq.server.org”, “msn.server.org”, “yahoo.server.org”.

It is indicated to have these aliases in DNS, thus the client application can resolve the DNS name. Otherwise there must be set the outbound proxy to OpenSIPS server.

\*\*\* Routing rules for Jabber gateway First step is to configure OpenSIPS to recognize messages for Jabber gateway. Look at “doc/xjab.cfg” to see a sample. The idea is to look in messages for destination address and if it contains Jabber alias or other IM alias, that means the message is for Jabber gateway.

Next step is to find out what means that message for Jabber gateway. It could be a special message what triggers the gateway to take an action or is a simple message which should be delivered to Jabber network (using the method “jab\_send\_message”).

The special messages are for:

*   Registering to Jabber server (go online in Jabber network)--here must be called “jab\_go\_online” method.
    
*   Leaving the Jabber network (go offline in Jabber network)--here must be called “jab\_go\_offline” method.
    
*   Joining a Jabber conference room--here must be called “jab\_join\_jconf”.
    
*   Leaving a Jabber conference room--here must be called “jab\_exit\_jconf”.
    

The destination address _must_ follow the following patterns:

*   For Jabber network: “username<delim>jabber\_server@jabber\_alias”.
    
*   For Jabber conference: “nickname<delim>room<delim>conference\_server@jabber\_alias”.
    
*   For AIM network: “aim\_username@aim\_alias”.
    
*   For ICQ network: “icq\_number@icq\_alias”.
    
*   For MSN network: “msn\_username<delim>msn\_server@msn\_alias”. msn\_server can be “msn.com” or “hotmail.com”.
    
*   For YAHOO network: “yahoo\_username@yahoo\_alias”.
    

### Note

“jabber\_alias” is the first part of “jdomain”.

## 1.3.�Admin Guide

The user must activate his Jabber account associated with his SIP id. For each other IM network on which he wants to send messages, he must set an account for that IM network. The gateway is not able to create new account in foreign networks, excepting local Jabber server.

When you want to send a message to someone in other IM network, you must set the destination of the message according with the pattern corresponding to that IM network (see last part of “Admin guide” chapter).

Sending a message to user@jabber.xxx.org which is in Jabber network, the destination must be: user<delim>jabber.xxx.org@jabber\_alias.

For someone who is in Yahoo network the destination must be: user@yahoo\_alias

### Note

The OpenSIPS administrator have to set the Jabber transports for each IM network in order to be able to send messages to those networks. The alias of each IM network can be found out from OpenSIPS admin.

You cannot send messages from your SIP client to your associated Jabber account--is something like sending messages to yourself.

## 1.4.�Dependencies

### 1.4.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   A database module.
    
*   _pa_ (Optionally) - Presence Agent.
    
*   _tm_ - Transaction Manager.
    

### 1.4.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _Expat_ library.
    

## 1.5.�Exported Parameters

### 1.5.1.�`db_url` (string)

SQL URL of database.

_Default value is “mysql://root@127.0.0.1/sip\_jab”._

**Example�1.1.�Set `db_url` parameter**

...
modparam("jabber", "db\_url", "mysql://username:password@host/sip\_jab")
...

  

### 1.5.2.�`jaddress` (string)

IP or hostname of Jabber server -- it must be the same as the value from <host> tag of Jabber server config file.

_Default value is “127.0.0.1”._

**Example�1.2.�Set `jaddress` parameter**

...
modparam("jabber", "jaddress", "1.2.3.4")
...

  

### 1.5.3.�`jport` (integer)

Port number of Jabber server.

_Default value is “5222”._

**Example�1.3.�Set `jport` parameter**

...
modparam("jabber", "jport", 1234)
...

  

### 1.5.4.�`jdomain` (string)

Format: jabber.sipserver.com=<delim>. If the destination is for Jabber network the URI should be like: username<delim>jabber\_server@jdomain or nickname<delim>roomname<delim>conference\_server@jdomain

<delim> must be a un-reserved character. By default this character is \* . The destination will be transformed to username@jabber\_server or roomname@conference\_server/nickname before the message is sent to Jabber server.

_Default value is none._

**Example�1.4.�Set `jdomain` parameter**

...
modparam("jabber", "jdomain", "jabber.sipserver.com=\*")
...

  

### 1.5.5.�`aliases` (string)

Aliases for IM networks.

Format: “N;alias1=<delim1>;...;aliasN=<delimN>;” Destinations like '\*@aliasX' could have other format than those specified for Jabber network. All <delim> from user part of the destination address will be changed to <delimX> if the destination address contains <aliasX>.

(Ex: jdomain is 'jabber.x.com=\*' and msn\_alias is 'msn.x.com=%'. The destination address forM MSN Network, on SIP side, is like 'username\*hotmail.com@msn.x.com'. The destination address will be transformed to 'username%hotmail.com@msn.x.com'. 'msn.x.com' must be the same as the JID associated with MSN transport in Jabber configuration file (usually is 'jabberd.xml'))

_Default value is none._

**Example�1.5.�Set `jdomain` parameter**

...
modparam("jabber", "aliases", "1;msn.x.com=%")
...

  

### 1.5.6.�`proxy` (string)

Outbound proxy address.

Format: ip\_address:port hostname:port

All SIP messages generated by gateway will be sent to that address. If is missing, the message will be delivered to the hostname of the destination address

Default value is none.

**Example�1.6.�Set `proxy` parameter**

...
modparam("jabber", "proxy", "10.0.0.1:5060 sipserver.com:5060")
...

  

### 1.5.7.�`registrar` (string)

The address in whose behalf the INFO and ERROR messages are sent.

_Default value is “jabber\_gateway@127.0.0.1”._

**Example�1.7.�Set `registrar` parameter**

...
modparam("jabber", "registrar", "jabber\_gateway@127.0.0.1")
...

  

### 1.5.8.�`workers` (integer)

Number of workers.

_Default value is 2._

**Example�1.8.�Set `workers` parameter**

...
modparam("jabber", "workers", 2)
...

  

### 1.5.9.�`max_jobs` (integer)

Maximum jobs per worker.

_Default value is 10._

**Example�1.9.�Set `max_jobs` parameter**

...
modparam("jabber", "max\_jobs", 10)
...

  

### 1.5.10.�`cache_time` (integer)

Cache time of a Jabber connection.

_Default value is 600._

**Example�1.10.�Set `cache_time` parameter**

...
modparam("jabber", "cache\_time", 600)
...

  

### 1.5.11.�`delay_time` (integer)

Time to keep a SIP message (in seconds).

_Default value is 90 seconds._

**Example�1.11.�Set `delay_time` parameter**

...
modparam("jabber", "delay\_time", 90)
...

  

### 1.5.12.�`sleep_time` (integer)

Time between expired Jabber connections checking (in seconds).

_Default value is 20 seconds._

**Example�1.12.�Set `sleep_time` parameter**

...
modparam("jabber", "sleep\_time", 20)
...

  

### 1.5.13.�`check_time` (integer)

Time between checking the status of JabberGW workers (in seconds).

_Default value is 20 seconds._

**Example�1.13.�Set `check_time` parameter**

...
modparam("jabber", "check\_time", 20)
...

  

### 1.5.14.�`priority` (str)

Presence priority for Jabber gateway.

_Default value is “9”._

**Example�1.14.�Set `priority` parameter**

...
modparam("jabber", "priority", "3")
...

  

## 1.6.�Exported Functions

### 1.6.1.� `jab_send_message()`

Converts SIP MESSAGE message to a Jabber message and sends it to Jabber server.

This function can be used from REQUEST\_ROUTE.

**Example�1.15.�`jab_send_message()` usage**

...
jab\_send\_message();
...

  

### 1.6.2.� `jab_join_jconf()`

Join a Jabber conference--the nickname, room name and conference server address should be included in To header as: nickname%roomname%conference\_server@jdomain . If the nickname is missing, then the SIP username is used.

This function can be used from REQUEST\_ROUTE.

**Example�1.16.�`jab_join_jconf()` usage**

...
jab\_join\_jconf();
...

  

### 1.6.3.� `jab_exit_jconf()`

Leave a Jabber conference--the nickname, room name and conference server address should be included in To header as: nickname%roomname%conference\_server@jdomain .

This function can be used from REQUEST\_ROUTE.

**Example�1.17.�`jab_exit_jconf()` usage**

...
jab\_exit\_jconf();
...

  

### 1.6.4.� `jab_go_online()`

Register to the Jabber server with associated Jabber ID of the SIP user.

This function can be used from REQUEST\_ROUTE.

**Example�1.18.�`jab_go_online()` usage**

...
jab\_go\_online();
...

  

### 1.6.5.� `jab_go_offline()`

Log off from Jabber server the associated Jabber ID of the SIP user.

This function can be used from REQUEST\_ROUTE.

**Example�1.19.�`jab_go_offline()` usage**

...
jab\_go\_offline();
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

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

381

80

19649

8172

2.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

55

33

1383

558

3.

Jan Janak ([@janakj](https://github.com/janakj))

33

15

1007

498

4.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

23

21

71

51

5.

Andrei Pelinescu-Onciul

19

12

101

336

6.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

15

11

72

136

7.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

6

4

35

12

8.

Jiri Kuthan ([@jiriatipteldotorg](https://github.com/jiriatipteldotorg))

6

3

313

0

9.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

5

3

6

6

10.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

4

2

33

8

  

**All remaining contributors**: Henning Westerholt ([@henningw](https://github.com/henningw)), Alexandra Titoc, Elena-Ramona Modroiu, Jamey Hicks, Konstantin Bokarius, John Riordan, Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)), Juli�n Moreno Pati�o, Klaus Darilion, Zero King ([@l2dy](https://github.com/l2dy)), Edson Gellert Schubert.

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

Aug 2015 - Sep 2024

2.

Alexandra Titoc

Sep 2024 - Sep 2024

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Mar 2014 - May 2024

4.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - May 2023

5.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Oct 2022 - Feb 2023

6.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Jun 2002 - Apr 2020

7.

Zero King ([@l2dy](https://github.com/l2dy))

Mar 2020 - Mar 2020

8.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

May 2007 - Jun 2018

9.

Juli�n Moreno Pati�o

Feb 2016 - Feb 2016

10.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

Feb 2012 - Feb 2012

  

**All remaining contributors**: John Riordan, Klaus Darilion, Henning Westerholt ([@henningw](https://github.com/henningw)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Elena-Ramona Modroiu, Jan Janak ([@janakj](https://github.com/janakj)), Andrei Pelinescu-Onciul, Jamey Hicks, Jiri Kuthan ([@jiriatipteldotorg](https://github.com/jiriatipteldotorg)).

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Klaus Darilion, Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Elena-Ramona Modroiu, Jan Janak ([@janakj](https://github.com/janakj)).

_Documentation Copyrights:_

Copyright � 2003 FhG FOKUS