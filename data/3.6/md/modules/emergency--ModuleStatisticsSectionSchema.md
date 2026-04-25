# Emergency Call Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5625472)

2.2. [Most recently active contributors(1) to this module](#idp5724736)

**List of Examples**

1.1. [Setting the `db_url` parameter](#idp170864)

1.2. [Setting the `db_table_routing` parameter](#idp5513872)

1.3. [Setting the `db_table_report` parameter](#idp5518688)

1.4. [Setting the `db_table_provider` parameter](#idp5523728)

1.5. [Setting the `proxy_role` parameter](#idp5532704)

1.6. [Setting the `url_vpc` parameter](#idp5537664)

1.7. [Setting the `emergency_codes` parameter](#idp5543008)

1.8. [Setting the `timer_interval` parameter](#idp5548112)

1.9. [Setting the `contingency_hostname` parameter](#idp5553072)

1.10. [Setting the `emergency_call_server` parameter](#idp5558384)

1.11. [`emergency_call()` usage](#idp5564848)

1.12. [`failure()` usage](#idp5570496)

## Chapter�1.�Admin Guide

## 1.1.�Overview

The emergency module provides emergency call treatment for OpenSIPS, following the architecture i2 specification of the American entity NENA. (National Emergency Number Association). The NENA solution routes the emergency call to a closer gateway (ESGW) and this forward the call to a PSAP(call center responsible for answering emergency calls) that serves the area of ​​the caller, so this must consider the handling and transport of caller location information in the SIP protocol. To attend this new need the NENA solution consists of several servers: to determine the location (LIS), to determine the area of emergency treatment depending on location (VPC), validate location stored (VDB), among others. Along with these elements have the SIP Proxy that interface with these servers to route the call. The OpenSIPS can do the functions of these SIP Proxy through this emergency module, may perform the function of a Call Server, Redirect Server and Routing Proxy, depending on the proposed scenario:

*   scenario I: The VSP(Voip Serve Provide) retains control over the processing of emergency calls. The VSP’s Call Server implements the v2 interface that queries the VPC for routing information, with this information selects the proper ESGW, if normal routing fails routes calls via the PSTN using the contingency number(LRO).
    
*   scenario II: The VSP transfers all emergency calls to Routing Proxy provider using the v6 SIP interface. Once done transfer the VSP no longer participates in the call. The Routing Proxy provider implements the v2 interface, queries the VPC for for routing information, and forwards the call.
    
*   scenario III: The VSP requests routing information for the Redirect Server operator, but remains part of the call. The Redirect Server obtains the routing information from the VPC. It returns the call to the VSP’s Call Server with routing information in the SIP Contact Header. The Call Server selects the proper ESGW based on this information.
    

The emergency module allows the OpenSIPS play the role of a Call Server, a Proxy or Redirect Server Routing within the scenarios presented depending on how it is configured.

1.2. Scenario I: The VSP that originating the call is the same as handle the call and sends the routing information request to the VPC. The emergency module through emergency\_call() command will check if the INVITE received is an emergency call. In this case, the OpenSIPS will get caller location information from specific headers and body in the INVITE. With this information along configuration parameters defined for this module, the opensips implements the v2 interface that queries the VPC for routing information (i.e., ESQK, LRO, and either the ERT or ESGWRI), selects the proper ESGW based on the ESGWRI. When the call ends the OpenSIPS receives BYE request, it warns the VPC for clean your data that is based on the call. The OpenSIPS through failure() command will try to route the calls via the PSTN using a national contingency number(LRO) if normal routing fails.

1.3.Scenario II: The VSP transfers the call to a Routing Server provider The emergency module through emergency\_call() command will check if the INVITE received is an emergency call. In this case, it will forward the call to a Routing Proxy that will interface with the VPC and route the call. The OpenSIPS will leave the call, and all the request of this dialog received by the opensips will be forwarded to the Routing Server.

1.4.Scenario III: The VSP requests routing information for the Redirect Server The emergency module through emergency\_call() command will check if the INVITE received is an emergency call. In this case, it requests routing information to Redirect Server. The Redirect has interface with the VPC and return to VSP's Call Server response whith routing informations on Contact header. The Call Server uses this information to treat the call. When the emergency call ends, it must notify the Redirect Server that inform to VPC to release the resources.

To use this module should informs the mandatory parameters in script and make the correct filling out of the emergency module tables, in accordance with the role chosen within the described scenarios. For more details check the "Emergency calls using OpenSIPS".

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _Dialog - Dialoge module._.
    
*   _TM - Transaction module._.
    
*   _RR - Record-Route module._.
    

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _libcurl_.
    

## 1.3.�Exported Parameters

### 1.3.1.�`db_url` (string)

The database url must be specified.

_Default value is “NULL”._

**Example�1.1.�Setting the `db_url` parameter**

...
modparam("emergency", "db\_url", "mysql://opensips:opensipsrw@localhost/opensips”)
...
		

  

### 1.3.2.�`db_table_routing` (string)

The name of the db table storing routing information to emergency calls.

_Default value is “emergency\_routing”._

**Example�1.2.�Setting the `db_table_routing` parameter**

...
modparam("emergency", "db\_table\_routing", "emergency\_routing")
...
		

  

### 1.3.3.�`db_table_report` (string)

The name of the db table that stores the emergency call report.

_Default value is “emergency\_report”._

**Example�1.3.�Setting the `db_table_report` parameter**

...
modparam("emergency", "db\_table\_report", "emergency\_report")
...
		

  

### 1.3.4.�`db_table_provider` (string)

The name of the db table that stores the nodes information of organization involved in emergency calls.

_Default value is “emergency\_service\_provider”._

**Example�1.4.�Setting the `db_table_provider` parameter**

...
modparam("emergency", "db\_table\_provider", "emergency\_service\_provider")
...
		

  

### 1.3.5.�`proxy_role` (integer)

This parameter define what role the opensips will take to treat emergency call:

0 – The opensips is the Call Server in scenario I. In this role the opensips implements the V2 interface, directly queries the VPC for ESGWRI/ESQK, selects the proper ESGW given the ESGWRI and routes calls Via the PSTN using the LRO if routing fails.

1 – The opensips is the Call Server in scenario II that sends the INVITE on emergency call to a Routing Proxy provider. The Routing Proxy provider implements the V2 interface.

2 - The opensips is the Routing Proxy in scenario II. In this role the opensips implements the V2 interface, directly queries the VPC for ESGWRI/ESQK, selects the proper ESGW given the ESGWRI and routes calls Via the PSTN using the LRO if routing fails.

3 - The opensips is the Redirect Proxy in scenario III that receives the INVITE on emergency call from Call Server. The Redirect Server obtains the ESGWRI/ESQK from the VPC and sends in the SIP 3xx response to the Call Server.

4 - The opensips is the Call Server in scenario III that sends the INVITE on emergency call to a Redirect Server. The Redirect Server obtains the ESGWRI/ESQK from the VPC. It returns the call to the opensips with the ESGWRI/ESQK in the header contact in the SIP response. The opensips selects the proper ESGW based on the ESGWRI.

_Default value is “0”._

**Example�1.5.�Setting the `proxy_role` parameter**

...
modparam("emergency", "proxy\_role", 0))
...
		

  

### 1.3.6.�`url_vpc` (string)

The VPC url that opensips request the routing information to emergency call. This VPC url has IP:Port format

_Default value is “empty string”._

**Example�1.6.�Setting the `url_vpc` parameter**

...
modparam("emergency", "url\_vpc", “192.168.0.103:5060”)
...
		

  

### 1.3.7.�`emergency_codes` (string)

Local emergency number. Opensips uses this number to recognize a emergency call beyond the username default defined by RFC-5031 (urn:service.sos.). Along with the number should be given a brief description about this code. The format is code\_number-description. It can register multiple emergency numbers.

_Default value is “NULLg”._

**Example�1.7.�Setting the `emergency_codes` parameter**

...
modparam("emergency", "emergency\_codes", “911-us emegency code”)
...
		

  

### 1.3.8.�`timer_interval` (interger)

Sets the time interval polling to make the copy in memory of the db\_table\_routing.

_Default value is “10”._

**Example�1.8.�Setting the `timer_interval` parameter**

...
modparam("emergency","timer\_interval",20)
...
		

  

### 1.3.9.�`contingency_hostname` (string)

The contingency\_hostname is the url of the server que will route the call to the PSTN using the number of contingency.

_Default value is “NULL”._

**Example�1.9.�Setting the `contingency_hostname` parameter**

...
modparam("emergency","contingency\_hostname",“176.34,29.102:5060”)
...
		

  

### 1.3.10.�`emergency_call_server` (string)

The emergency\_call\_server is the url of the Routing Proxy/Redirect Server that will handle the emergency call in cenario II. Its is mandatory if Opensips act as Call Server in scenario II (proxy\_role = 1 and flag\_third\_enterprise = 0) or Call Server in scenario III (proxy\_role = 2).

_Default value is “NULL”._

**Example�1.10.�Setting the `emergency_call_server` parameter**

...
modparam("emergency","emergency\_call\_server",“124.78.29.123:5060”)
...
		

  

## 1.4.�Exported Functions

### 1.4.1.� `emergency_call()`

Checks whether the incoming call is an emergency call, case it is treats, and routes the call to the destination determined by VPC. The function returns true if is a emergency call and the treat was Ok.

This function can be used from the _REQUEST_ routes.

**Example�1.11.�`emergency_call()` usage**

...
# Example of treat of emergency call

��� if (emergency\_call()){

��� ��� xlog("emergency call\\n");
��� ��� t\_on\_failure("emergency\_call");
��      t\_relay();
��      exit;

  	}
...
		

  

### 1.4.2.� `failure()`

This function is used when trying to route the emergency call to the destination specified by the VPC and doesn't work, then uses this function to make one last attempt for a contingency number. The function returns true if the contingency treat was OK.

This function can be used from the _FAILURE_ routes.

**Example�1.12.�`failure()` usage**

...
# Example od treat of contingency in emergency call

    if (failure()) {
��� ��� if (!t\_relay()) {
��� ��� �� send\_reply(500,"Internal Error");
��� ��� };
��� ��� exit;
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

Evandro Villaron ([@evillaron](https://github.com/evillaron))

152

9

10947

3011

2.

Robison Tesini ([@rtesini](https://github.com/rtesini))

62

1

3116

2038

3.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

26

17

331

338

4.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

19

13

134

188

5.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

11

9

52

52

6.

Alexandra Titoc

10

8

62

19

7.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

6

4

18

17

8.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

5

3

38

17

9.

Walter Doekes ([@wdoekes](https://github.com/wdoekes))

4

2

4

4

10.

Zero King ([@l2dy](https://github.com/l2dy))

4

2

2

1

  

**All remaining contributors**: Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita)), Juli�n Moreno Pati�o, Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)).

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

Jul 2015 - Sep 2024

2.

Alexandra Titoc

Sep 2024 - Sep 2024

3.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Jan 2021 - Nov 2023

4.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Mar 2015 - May 2023

5.

Walter Doekes ([@wdoekes](https://github.com/wdoekes))

Apr 2021 - Apr 2021

6.

Zero King ([@l2dy](https://github.com/l2dy))

Mar 2020 - Aug 2020

7.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Mar 2015 - Mar 2020

8.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Feb 2020

9.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - May 2017

10.

Juli�n Moreno Pati�o

Feb 2016 - Feb 2016

  

**All remaining contributors**: Evandro Villaron ([@evillaron](https://github.com/evillaron)), Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita)), Robison Tesini ([@rtesini](https://github.com/rtesini)).

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Juli�n Moreno Pati�o, Evandro Villaron ([@evillaron](https://github.com/evillaron)).

_Documentation Copyrights:_

Copyright � 2014 Villaron/Tesini