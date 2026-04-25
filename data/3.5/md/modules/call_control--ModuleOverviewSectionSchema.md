# Call Control Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5732752)

2.2. [Most recently active contributors(1) to this module](#idp5833696)

**List of Examples**

1.1. [Setting the `disable` parameter](#idp171456)

1.2. [Setting the `socket_name` parameter](#idp5569664)

1.3. [Setting the `socket_timeout` parameter](#idp5574608)

1.4. [Setting the `signaling_ip_avp` parameter](#idp5580944)

1.5. [Setting the `canonical_uri_avp` parameter](#idp212608)

1.6. [Setting the `diverter_avp` parameter](#idp5601664)

1.7. [Setting the `prepaid_account_flag` parameter](#idp5606944)

1.8. [Setting the `call_limit_avp` parameter](#idp5612144)

1.9. [Setting the `call_token_avp` parameter](#idp5617488)

1.10. [Setting the `init` parameter](#idp5625776)

1.11. [Setting the `start` parameter](#idp5634160)

1.12. [Setting the `stop` parameter](#idp5642544)

1.13. [Using the `call_control` function](#idp5654336)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This module allows one to limit the duration of calls and automatically end them when they exceed the imposed limit. Its main use case is to implement a prepaid system, but it can also be used to impose a global limit on all calls processed by the proxy.

## 1.2.�Description

Callcontrol consists of 3 components:

*   The OpenSIPS call\_control module
    
*   An external application called callcontrol which keeps track of the calls that have a time limit and automatically ends them when they exceed it. This application receives requests from OpenSIPS and makes requests to a rating engine (see below) to find out if a call needs to be limited or not. When a call ends (or is ended) it will also instruct the rating engine to debit the balance for the caller with the consumed amount. The callcontrol application is available from http://callcontrol.ag-projects.com/
    
*   A rating engine that is used to calculate the time limit based on the caller's credit and the destination price and to debit the caller's balance after a call ends. This is available as part of CDRTool from http://cdrtool.ag-projects.com/
    

The callcontrol application runs on the same machine as OpenSIPS and they communicate over a filesystem socket, while the rating engine can run on a different host and communicates with the callcontrol application using a TCP connection.

Callcontrol is invoked by calling the call\_control() function for the initial INVITE of every call we want to apply a limit to. This will end up as a request to the callcontrol application, which will interrogate the rating engine for a time limit for the given caller and destination. The rating engine will determine if the destination has any associated cost and if the caller has any credit limit and if so will return the amount of time he is allowed to call that destination. Otherwise it will indicate that there is no limit associated with the call. If there is a limit, the callcontrol application will retain the session and attach a timer to it that will expire after the given time causing it to call back to OpenSIPS with a request to end the dialog. If the rating engine returns that there is no limit for the call, the session is discarded by the callcontrol application and it will allow it to go proceed any limit. An appropriate response is returned to the call\_control module that is then returned by the call\_control() function call and allows the script to make a decision based on the answer.

## 1.3.�Features

*   Very simple API consisting of a single function that needs to be called once for the first INVITE of every call. The rest is done automatically in the background using dialog callbacks.
    
*   Gracefully end dialogs when they exceed their time by triggering a dlg\_end\_dlg request into the dialog module, that will generate two BYE messages towards each endpoint, ending the call cleanly.
    
*   Allow parallel sessions using one balance per subscriber
    
*   Integrates with mediaproxy's ability to detect when a call does timeout sending media and is closed. In this case the dlg\_end\_dlg that is triggered by mediaproxy will end the callcontrol session before it reaches the limit and consumes all the credit for a call that died and didn't actually take place. For this mediaproxy has to be used and it has to be started by engage\_media\_proxy() to be able to keep track of the call's dialog and end it on timeout.
    
*   Even when mediaproxy is unable to end the dialog because it was not started with engage\_media\_proxy(), the callcantrol application is still able to detect calls that did timeout sending media, by looking in the radius accounting records for entries recorded by mediaproxy for calls that did timeout. These calls will also be ended gracefully by the callcontrol application itself.
    
*   If the prepaid\_account\_flag module parameter is defined, the external application compares the OpenSIPS's and the rating engine's views on whether the account calling is prepaid or not and takes appropriate action if they conflict. This provides protection against frauds in case the rating engine malfunctions or there is an inconsistency in the database.
    
*   If the call\_limit\_avp is defined to a value greater than 0 it will be passed to the CallControl application, which will limit the number of concurrent calls the billing party (From user or diverter) is able to make. If the limit is reached the call\_control function will return a specific error value.
    
*   The call\_token\_avp may be used to detect calls with a duplicated CallID that could create potential problems in call rating engines.
    

## 1.4.�Dependencies

### 1.4.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _dialog_ module
    

### 1.4.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _None_.
    

## 1.5.�Exported parameters

### 1.5.1.�`disable` (int)

Boolean flag that specifies if callcontrol should be disabled. This is useful when you want to use the same OpenSIPS configuration in two different context, one using callcontrol, the other not. In the case callcontrol is disabled, calls to the call\_control() function will return a code indicating that there is no limit associated with the call, allowing the use of the same configuration without changes.

_Default value is “0”._

**Example�1.1.�Setting the `disable` parameter**

...
modparam("call\_control", "disable", 1)
...
        

  

### 1.5.2.�`socket_name` (string)

It is the path to the filesystem socket where the callcontrol application listens for commands from the module.

_Default value is “/run/callcontrol/socket”._

**Example�1.2.�Setting the `socket_name` parameter**

...
modparam("call\_control", "socket\_name", "/run/callcontrol/socket")
...
        

  

### 1.5.3.�`socket_timeout` (int)

How much time (in milliseconds) to wait for an answer from the callcontrol application.

_Default value is “500” (ms)._

**Example�1.3.�Setting the `socket_timeout` parameter**

...
modparam("call\_control", "socket\_timeout", 500)
...
        

  

### 1.5.4.�`signaling_ip_avp` (string)

Specification of the AVP which holds the IP address from where the SIP signaling originated. If this AVP is set it will be used to get the signaling IP address, else the source IP address from where the SIP message was received will be used. This AVP is meant to be used in cases where there are more than one proxy in the call setup path and the proxy that actually starts callcontrol doesn't receive the SIP messages directly from the UA and it cannot determine the NAT IP address from where the signaling originated. In such a case attaching a SIP header at the first proxy and then copying that header's value into the signaling\_ip\_avp on the proxy that starts callcontrol will allow it to get the correct NAT IP address from where the SIP signaling originated.

This is used by the rating engine which finds the rates to apply to a call based on caller's SIP URI, caller's SIP domain or caller's IP address (whichever yields a rate first, in this order).

_Default value is “$avp(cc\_signaling\_ip)”._

**Example�1.4.�Setting the `signaling_ip_avp` parameter**

...
modparam("call\_control", "signaling\_ip\_avp", "$avp(cc\_signaling\_ip)")
...
        

  

### 1.5.5.�`canonical_uri_avp` (string)

Specification of the AVP which holds an optional application defined canonical request URI. When this is set, it will be used as the destination when computing the call price, otherwise the request URI will be used. This is useful when the username of the ruri needs to have a different, canonical form in the rating engine computation than it has in the ruri.

_Default value is “$avp(cc\_can\_uri)”._

**Example�1.5.�Setting the `canonical_uri_avp` parameter**

...
modparam("call\_control", "canonical\_uri\_avp", "$avp(cc\_can\_uri)")
...
        

  

### 1.5.6.�`diverter_avp` (string)

Specification of the AVP which holds an optional application defined diverter SIP URI. When this is set, it will be used by the rating engine as the billing party when finding the rates to apply to a given call, otherwise, the caller's URI taken from the From field will be used. When set, this AVP should contain a value in the form “user@domain” (no sip: prefix should be used).

This is useful when a destination diverts a call, thus becoming the new caller. In this case the billing party is the diverter and this AVP should be set to it, to allow the rating engine to pick the right rates for the call. For example, if A calls B and B diverts all its calls unconditionally to C, then the diverter AVP should the set to B's URI, because B is the billing party in the call not A after the call was diverted.

_Default value is “$avp(diverter)”._

**Example�1.6.�Setting the `diverter_avp` parameter**

...
modparam("call\_control", "diverter\_avp", "$avp(diverter)")

route {
  ...
  # alice@example.com is paying for this call
  $avp(diverter) = "alice@example.com";
  ...
}
...
        

  

### 1.5.7.�`prepaid_account_flag` (string)

The flag that is used to specify whether the account making the call is prepaid or postpaid. Setting this to a non-null value will determine the module to pass the flag's value to the external application. This will allow the external application to compare OpenSIPS's and the rating engine's views on whether the account calling is prepaid or not and take appropriate action if they conflict. The flag should be set from the OpenSIPS configuration for a prepaid account and reset for a postpaid one.

_Default value is NULL (undefined)._

**Example�1.7.�Setting the `prepaid_account_flag` parameter**

...
modparam("call\_control", "prepaid\_account\_flag", "PP\_ACC\_FLAG")
...
        

  

### 1.5.8.�`call_limit_avp` (string)

Specification of the AVP which holds an optional application defined call limit. When this is set, it will be passed to the CallControl application and if the limit is reached the call\_control function will return an error code of -4.

_Default value is “$avp(cc\_call\_limit)”._

**Example�1.8.�Setting the `call_limit_avp` parameter**

...
modparam("call\_control", "call\_limit\_avp", "$avp(cc\_call\_limit)")
...
        

  

### 1.5.9.�`call_token_avp` (string)

Specification of the AVP which holds an optional application defined token. This token will be used to check if two calls with the same CallID actually refer to the same call. If call\_control() is called multiple times for the same call (thus same CallID) the token needs to be the same or call\_control will return -3 error, indicating that the CallID is duplicated.

_Default value is “$avp(cc\_call\_token)”._

**Example�1.9.�Setting the `call_token_avp` parameter**

...
modparam("call\_control", "call\_token\_avp", "$avp(cc\_call\_token)")
...
$avp(cc\_call\_token) := $RANDOM;
...
        

  

### 1.5.10.�`init` (string)

This parameter is used to describe custom call control initialize messages. It represents a list of key value pairs and has the following format:

*   "string1 = var1 \[string2 = var2\]\*"
    

The left-hand side of the assignment can be any string.

The right-hand side of the assignment must be a script pseudo variable or a script AVP. For more information about them see [CookBooks - Scripting Variables](https://opensips.org/Resources/DocsCoreVar15).

If the parameter is not set, the default initialize message is sent.

_Default value is “NULL”._

**Example�1.10.�Setting the `init` parameter**

	
...
modparam("call\_control", "init", "call-id=$ci to=$tu from=$fu 
			authruri=$du another\_field = $avp(10)")
...
        

  

### 1.5.11.�`start` (string)

This parameter is used to describe custom call control start messages. It represents a list of key value pairs and has the following format:

*   "string1 = var1 \[string2 = var2\]\*"
    

The left-hand side of the assignment can be any string.

The right-hand side of the assignment must be a script pseudo variable or a script AVP. For more information about them see [CookBooks - Scripting Variables](https://opensips.org/Resources/DocsCoreVar15).

If the parameter is not set, the default start message is sent.

_Default value is “NULL”._

**Example�1.11.�Setting the `start` parameter**

	
...
modparam("call\_control", "start", "call-id=$ci to=$tu from=$fu 
			authruri=$du another\_field = $avp(10)")
...
        

  

### 1.5.12.�`stop` (string)

This parameter is used to describe custom call control stop messages. It represents a list of key value pairs and has the following format:

*   "string1 = var1 \[string2 = var2\]\*"
    

The left-hand side of the assignment can be any string.

The right-hand side of the assignment must be a script pseudo variable or a script AVP. For more information about them see [CookBooks - Scripting Variables](https://opensips.org/Resources/DocsCoreVar15).

If the parameter is not set, the default stop message is sent.

_Default value is “NULL”._

**Example�1.12.�Setting the `stop` parameter**

	
...
modparam("call\_control", "stop", "call-id=$ci to=$tu from=$fu 
			authruri=$du another\_field = $avp(10)")
...
        

  

## 1.6.�Exported Functions

### 1.6.1.�`call_control()`

Trigger the use of callcontrol for the dialog started by the INVITE for which this function is called (the function should only be called for the first INVITE of a call). Further in-dialog requests will be processed automatically using internal bindings into the dialog state machine, allowing callcontrol to update its internal state as the dialog progresses, without any other intervention from the script.

This function should be called right before the message is sent out using t\_relay(), when all the request uri modifications are over and a final destination has been determined.

This function has the following return codes:

*   +2 - call has no limit
    
*   +1 - call has limit and is traced by callcontrol
    
*   \-1 - not enough credit to make the call
    
*   \-2 - call is locked by another call in progress
    
*   \-3 - duplicated callid
    
*   \-4 - call limit has been reached
    
*   \-5 - internal error (message parsing, communication, ...)
    

This function can be used from REQUEST\_ROUTE.

**Example�1.13.�Using the `call_control` function**

...
if ($avp(805) != NULL) {
    # the diverter AVP is set, use it as billing party
    $avp(billing\_party\_domain) = $(avp(805){uri.domain});
} else {
    $avp(billing\_party\_domain) = $fd;
}

if (is\_method("INVITE") && !has\_totag() &&
    is\_domain\_local($avp(billing\_party\_domain))) {
    call\_control();
    switch ($retcode) {
    case 2:
        # Call with no limit
    case 1:
        # Call has limit and is under callcontrol management
        break;
    case -1:
        # Not enough credit (prepaid call)
        sl\_send\_reply(402, "Not enough credit");
        exit;
        break;
    case -2:
        # Locked by another call in progress (prepaid call)
        sl\_send\_reply(403, "Call locked by another call in progress");
        exit;
        break;
    case -3:
        # Duplicated callid
        sl\_send\_reply(400, "Duplicated callid");
        exit;
        break;
    case -4:
        # Call limit reached
        sl\_send\_reply(503, "Too many concurrent calls");
        exit;
        break;
    default:
        # Internal error (message parsing, communication, ...)
        if (PREPAID\_ACCOUNT) {
            xlog("Call control: internal server error\\n");
            sl\_send\_reply(500, "Internal server error");
            exit;
        } else {
            xlog("L\_WARN", "Cannot set time limit for postpaid call\\n");
        }
    }
}
t\_relay();
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

Dan Pascu ([@danpascu](https://github.com/danpascu))

27

10

1621

177

2.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

16

13

56

67

3.

Sa�l Ibarra Corretg� ([@saghul](https://github.com/saghul))

15

9

320

124

4.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

12

10

58

34

5.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

11

9

18

48

6.

Irina-Maria Stanescu

6

2

356

17

7.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

5

3

11

9

8.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

4

2

5

12

9.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

4

2

3

4

10.

Alexey Vasilyev ([@vasilevalex](https://github.com/vasilevalex))

3

1

3

3

  

**All remaining contributors**: Zero King ([@l2dy](https://github.com/l2dy)), Juli�n Moreno Pati�o, Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Mauro Davi.

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

Jan 2013 - May 2024

2.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Jul 2010 - Feb 2024

3.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Feb 2023

4.

Alexey Vasilyev ([@vasilevalex](https://github.com/vasilevalex))

Mar 2022 - Mar 2022

5.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Mar 2009 - May 2020

6.

Zero King ([@l2dy](https://github.com/l2dy))

Mar 2020 - Mar 2020

7.

Dan Pascu ([@danpascu](https://github.com/danpascu))

Dec 2008 - Aug 2019

8.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Apr 2019

9.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

10.

Juli�n Moreno Pati�o

Feb 2016 - Feb 2016

  

**All remaining contributors**: Sa�l Ibarra Corretg� ([@saghul](https://github.com/saghul)), Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)), Irina-Maria Stanescu, Mauro Davi.

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Alexey Vasilyev ([@vasilevalex](https://github.com/vasilevalex)), Zero King ([@l2dy](https://github.com/l2dy)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Dan Pascu ([@danpascu](https://github.com/danpascu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Sa�l Ibarra Corretg� ([@saghul](https://github.com/saghul)), Irina-Maria Stanescu.

_Documentation Copyrights:_

Copyright � 2005-2008 Dan Pascu