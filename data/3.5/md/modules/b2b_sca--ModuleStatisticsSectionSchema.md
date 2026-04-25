# b2b\_sca Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5678000)

2.2. [Most recently active contributors(1) to this module](#idp5769328)

**List of Examples**

1.1. [Set `hash_size` parameter](#idp247696)

1.2. [Set `presence_server` parameter](#idp167824)

1.3. [Set `watchers_avp_spec` parameter](#idp172832)

1.4. [Set `shared_line_spec_param` parameter](#idp5522064)

1.5. [Set `appearance_name_addr_spec_param` parameter](#idp5527376)

1.6. [Set `db_url` parameter](#idp5531808)

1.7. [Set `db_mode` parameter](#idp5538240)

1.8. [Set `table_name` parameter](#idp5542752)

1.9. [Set `shared_line_column` parameter](#idp5547312)

1.10. [Set `watchers_column` parameter](#idp5551872)

1.11. [Set `app[index]_shared_entity_column` parameter](#idp5556448)

1.12. [Set `app[index]_call_state_column` parameter](#idp5563504)

1.13. [Set `app[index]_call_info_uri_column` parameter](#idp5568208)

1.14. [Set `app[index]_call_info_appearance_uri_column` parameter](#idp5573120)

1.15. [Set `app[index]_b2bl_key_column` parameter](#idp5577872)

1.16. [`sca_init_request()` usage](#idp5586560)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This module provides core SCA (Shared Call Appearance) functionality for OpenSIPS. It is designed to work in tandem with the presence\_callinfo module.

The module handles the basic SIP signalling for call controll while publishing callinfo events to a presence server. It is built on top of the b2b\_logic module and it is using the 'top hiding' scenario to control SIP signalling.

A typical usage example is provided below, where Alice makes a call to Bob. The call leg between Alice and the b2b\_sca server is an "appearance" call of the "shared" call between the b2b\_sca server and Bob.

   caller         caller      b2b\_sca     callee   presence server
alice1@example alice2@example  server   bob@example watcher@example
     |              |             |           |           |
     |--INV bob------------------>|           |           |
     |              |             |--INV bob->|           |
     |              |             |--PUBLISH(alerting)--->|
     |              |             |<-----200 OK-----------|
     |              |             |           |           |
     |              |             |<-180 ring-|           |
     |<-180 ring------------------|           |           |
     |              |             |           |           |
     |              |             |           |           |
     |              |             |<-200 OK---|           |
     |<-200 OK--------------------|--ACK----->|           |
     |--ACK---------------------->|--PUBLISH(active)----->|
     |              |             |<-----200 OK-----------|
     |              |             |           |           |
     |--INV bob (hold)----------->|           |           |
     |              |             |--INV bob->|           |
     |              |             |--PUBLISH(held)------->|
     |              |             |<-----200 OK-----------|
     |              |             |<-200 OK---|           |
     |<--200 OK-------------------|           |           |
     |              |             |           |           |
     |              |--INV------->|           |           |
     |              |             |--INV bob->|           |
     |<-BYE-----------------------|--PUBLISH(active)----->|
     |--200 OK------------------->|<-----200 OK-----------|
     |              |             |<-200 OK---|           |
     |              |<-200 OK-----|           |

	

*   Alice calls Bob from her desk IP phone (alice1).
    
*   Bob answers the call.
    
*   Alice decide to carry the conversation from a meeting room and she put's BOB on hold.
    
*   Alice arrives to the meeting room and retrieves the call on the conference room IP phone (alice2).
    

## 1.2.�To-do

Features to be added in the future:

*   possibility to handle unlimited number of appearances.
    

## 1.3.�Dependencies

### 1.3.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _tm_ module. _pua_ module. _b2b\_logic_ module.
    

## 1.4.�Exported Parameters

### 1.4.1.�`hash_size`(integer)

The size of the hash table internally used to keep the shared calls. A larger table means faster acces at the expense of memory. The hash size is a power of number two.

_The default value is "10"._

**Example�1.1.�Set `hash_size` parameter**

...
modparam("b2b\_sca", "hash\_size", "5")
...

  

### 1.4.2.�`presence_server`(string)

The address of the presence server, where the PUBLISH messages should be sent (not compulsory). If not set, the PUBLISH requests will be routed based on watcher's URI.

_The default value is "NULL"._

**Example�1.2.�Set `presence_server` parameter**

...
modparam("b2b\_sca", "presence\_server", "sip:opensips.org")
...

  

### 1.4.3.�`watchers_avp_spec`(string)

AVP that will hold one or more watcher URI(s). If not set, no PUBLISH requests will be sent out. The watchers\_avp\_spec MUST be set before calling sca\_init\_request();

_The default value is "NULL"._

**Example�1.3.�Set `watchers_avp_spec` parameter**

...
modparam("b2b\_sca", "watchers\_avp\_spec", "$avp(watchers\_avp\_spec)")
...
route {
	...
	$avp(watchers\_avp\_spec) = "sip:first\_watcher@opensip.org";
	$avp(watchers\_avp\_spec) = "sip:second\_watcher@opensip.org";
	...
}

  

### 1.4.4.�`shared_line_spec_param`(string)

Mandatory parameter. Opaque string identifing the shared line/call. The shared\_line\_spec\_param MUST be set before calling sca\_init\_request();

_The default value is "NULL"._

**Example�1.4.�Set `shared_line_spec_param` parameter**

...
modparam("b2b\_sca", "shared\_line\_spec\_param", "$var(shared\_line)")
...

  

### 1.4.5.�`appearance_name_addr_spec_param`(string)

Mandatory parameter. It must be a valid SIP URI. It will populate the _appearance-uri_ SIP parameter inside the _Call-Info_ SIP header. The appearance\_name\_addr\_spec\_param MUST be set before calling sca\_init\_request();

_The default value is "NULL"._

**Example�1.5.�Set `appearance_name_addr_spec_param` parameter**

...
modparam("b2b\_sca", "appearance\_name\_addr\_spec\_param", "")
...

  

### 1.4.6.�`db_url`(string)

This is URL of the database to be used.

_The default value is "NULL"._

**Example�1.6.�Set `db_url` parameter**

...
modparam("b2b\_sca", "db\_url", "\[dbdriver\]://\[\[username\]:\[password\]\]@\[dbhost\]/\[dbname\]")
...

  

### 1.4.7.�`db_mode`(integer)

The b2b\_sca module can utilize database for persistent call appearance storage. Using a database ensure that active call appearances will survive machine restarts or SW crashes. The following databse accessing modes are available for b2b\_sca module:

*   NO DB STORAGE - set this parameter to 0
*   WRITE THROUGH (synchronous write in database) - set this parameter to 1

_The default value is 0 (NO DB STORAGE)._

**Example�1.7.�Set `db_mode` parameter**

...
modparam("b2b\_sca", "db\_mode", 1)
...

  

### 1.4.8.�`table_name`(string)

Identifies the table name from the defined database.

_The default value is "b2b\_sca"._

**Example�1.8.�Set `table_name` parameter**

...
modparam("b2b\_sca", "table\_name", "sla")
...

  

### 1.4.9.�`shared_line_column`(string)

The column's name in the database storing the shared call/line id. See "shared\_line\_spec\_param" parameter.

_The default value is "shared\_line"._

**Example�1.9.�Set `shared_line_column` parameter**

...
modparam("b2b\_sca", "shared\_line\_column", "")
...

  

### 1.4.10.�`watchers_column`(string)

The column's name in the database storing the list of watchers. See "watchers\_avp\_spec" parameter.

_The default value is "watchers"._

**Example�1.10.�Set `watchers_column` parameter**

...
modparam("b2b\_sca", "watchers\_column", "")
...

  

### 1.4.11.�`app[index]_shared_entity_column`(string)

The column's name in the database storing the shared entity of a particular appearance. See "sca\_init\_request" for more info.

_The default value is "app\[index\]\_shared\_entity"._ Index is an integer between 1 and 10.

**Example�1.11.�Set `app[index]_shared_entity_column` parameter**

...
modparam("b2b\_sca", "app1\_shared\_entity\_column", "first\_shared\_entity")
modparam("b2b\_sca", "app2\_shared\_entity\_column", "second\_shared\_entity")
...

  

### 1.4.12.�`app[index]_call_state_column`(string)

The column's name in the database storing the call state of a particular appearance. The following states are stored:

*   1 - alerting,
*   2 - active,
*   3 - held,
*   4 - held-private.

_The default value is "app\[index\]\_call\_state"._ Index is an integer between 1 and 10.

**Example�1.12.�Set `app[index]_call_state_column` parameter**

...
modparam("b2b\_sca", "app1\_call\_state\_column", "first\_call\_state")
modparam("b2b\_sca", "app2\_call\_state\_column", "second\_call\_state")
...

  

### 1.4.13.�`app[index]_call_info_uri_column`(string)

The column's name in the database storing the call info URI of a particular appearance.

_The default value is "app\[index\]\_call\_info\_uri"._ Index is an integer between 1 and 10.

**Example�1.13.�Set `app[index]_call_info_uri_column` parameter**

...
modparam("b2b\_sca", "app1\_call\_info\_uri\_column", "first\_call\_info\_uri")
modparam("b2b\_sca", "app2\_call\_info\_uri\_column", "second\_call\_info\_uri")
...

  

### 1.4.14.�`app[index]_call_info_appearance_uri_column`(string)

The column's name in the database storing the call info appearance URI of a particular appearance. For each appearance, the value is extracted from the "appearance\_name\_addr\_spec\_param" parameter.

_The default value is "app\[index\]\_call\_info\_appearance\_uri"._ Index is an integer between 1 and 10.

**Example�1.14.�Set `app[index]_call_info_appearance_uri_column` parameter**

...
modparam("b2b\_sca", "app1\_call\_info\_appearance\_uri\_column", "first\_call\_info\_appearance\_uri")
modparam("b2b\_sca", "app2\_call\_info\_appearance\_uri\_column", "second\_call\_info\_appearance\_uri")
...

  

### 1.4.15.�`appindex_b2bl_key_column`(string)

The column's name in the database storing the b2b\_logic key of a particular appearance.

_The default value is "app\[index\]\_b2bl\_key"._ Index is an integer between 1 and 10.

**Example�1.15.�Set `app[index]_b2bl_key_column` parameter**

...
modparam("b2b\_sca", "app1\_b2bl\_key\_column", "first\_b2bl\_key")
modparam("b2b\_sca", "app2\_b2bl\_key\_column", "second\_b2bl\_key")
...

  

## 1.5.�Exported Functions

### 1.5.1.� `sca_init_request(shared_line)`

This is the function that must be called by the script writer on an initial INVITE for which an SCA call must be instantiated (see the call from alice1 in the above diagram).

Meaning of the parameters:

*   _shared\_line_ (int) - an integer identifying the call leg as being an "appearnace" call or a "shared" call:
    
    *   0: "shared" call
        
    *   1: "appearance" call
        
    

**Example�1.16.�`sca_init_request()` usage**

...
modparam("b2b\_sca",
	"shared\_line\_spec\_param","$var(shared\_line)")
modparam("b2b\_sca",
	"appearance\_name\_addr\_spec\_param","$var(appearance\_name\_addr)")
modparam("b2b\_sca",
	"watchers\_avp\_spec","$avp(watchers\_avp\_spec)")

...

	# Setting the shared call identifier
	$var(shared\_line) = "alice";

	# Setting the watchers
	$avp(watchers\_avp\_spec) = "sip:alice1@example.com";
	$avp(watchers\_avp\_spec) = "sip:alice2@example.com";

	if (INCOMING\_SHARED\_CALL) {
		# The incoming call is a 'shared' call
		$var(shared\_line\_entity) = 0;
		# Setting the appearance name address
		$var(appearance\_name\_addr) = $fu;
	}
	else {
		# The incoming call is an 'appearance' call
		# - see Alice's initial call leg in the given example
		$var(shared\_line\_entity) = 1;
		# Setting the appearance name address
		$var(appearance\_name\_addr) = $tu;
	}

	# Initiate the call
	if (!sca\_init\_request($var(shared\_line\_entity))) {
		send\_reply(403, "Internal Server Error (SLA)");
		exit;
	}
...

  

### 1.5.2.�`sca_bridge_request(shared_line_to bridge)`

This is the function that must be called by the script writer on an initial "appearance" INVITE for an existing shared call. It will bridge the current "appearance" call with the existing "shared" call and the old "appearance" call will be disconnected (see the call from alice2 in the above diagram).

Meaning of the parameters:

*   _shared\_line\_to\_bridge_ (string) - a string identifying the shared line/call that was previously set by sca\_init\_request().
    

...
	if ($rU==NULL && is\_method("INVITE") &&
		$fU==$tU && is\_present\_hf("Call-Info")) {
		# The incoming call is an 'appearance' call
		# - see Alice's call from alice2 in the given example
		$var(shared\_line\_to\_bridge) = "alice";
		if (!sca\_bridge\_request($var(shared\_line\_to\_bridge)))
			send\_reply(403, "Internal SLA Error");
			exit;
		}
	}
...

## 1.6.�Exported MI Functions

### 1.6.1.�`sca_list`

It lists the appearances belonging to a shared line/call.

Name: _sca\_list_

Parameters: _none_

MI FIFO Command Format:

	opensips-cli -x mi sca\_list

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

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

33

2

3536

2

2.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

13

10

63

67

3.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

12

10

32

28

4.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

9

7

13

13

5.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

8

5

82

90

6.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

5

3

5

7

7.

Ezequiel Lovelle ([@lovelle](https://github.com/lovelle))

3

1

1

1

8.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

3

1

1

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

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Oct 2022 - Feb 2023

2.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Mar 2014 - Nov 2022

3.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Aug 2015 - Feb 2022

4.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

May 2014 - Mar 2020

5.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Apr 2019

6.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

7.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

Dec 2013 - Feb 2016

8.

Ezequiel Lovelle ([@lovelle](https://github.com/lovelle))

Oct 2014 - Oct 2014

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)).

_Documentation Copyrights:_

Copyright � 2011-2013 [VoIP Embedded, Inc.](http://www.voipembedded.com)