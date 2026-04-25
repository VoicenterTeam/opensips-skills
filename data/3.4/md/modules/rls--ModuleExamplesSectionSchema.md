# Resource List Server

---

**List of Tables**

3.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp6103584)

3.2. [Most recently active contributors(1) to this module](#idp6166608)

**List of Examples**

1.1. [Set `rlsubs_table` parameter](#idp5919600)

1.2. [Set `rlpres_table` parameter](#idp5924416)

1.3. [Set `clean_period` parameter](#idp5929232)

1.4. [Set `waitn_time` parameter](#idp5934224)

1.5. [Set `max_expires` parameter](#idp5939040)

1.6. [Set `hash_size` parameter](#idp5944032)

1.7. [Set `hash_size` parameter](#idp5948848)

1.8. [Set `to_presence_code` parameter](#idp5953968)

1.9. [Set `rls_event` parameter](#idp5958976)

1.10. [Set `presence_server` parameter](#idp5962912)

1.11. [Set `contact_user` parameter](#idp5968672)

1.12. [`rls_handle_subscribe` usage](#idp5974592)

1.13. [`rls_handle_notify` usage](#idp5984048)

## Chapter�1.�Admin Guide

## 1.1.�Overview

The modules is a Resource List Server implementation following the specification in RFC 4662 and RFC 4826.

The server is independent from local presence servers, retrieving presence information with Subscribe-Notify messages.

The module uses the presence module as a library, as it requires a resembling mechanism for handling Subscribe. Therefore, in case the local presence server is not collocated on the same machine with the RL server, the presence module should be loaded in a library mode only (see doc for presence module).

It handles subscription to lists in an event independent way.The default event is presence, but if some other events are to be handled by the server, they should be added using the module parameter "rls\_events".

It works with XCAP server for storage. There is also the possibility to configure it to work in an integrated\_xcap server mode, when it only queries database for the resource lists documents. This is useful in a small architecture when all the clients use an integrated server and there are no references to exterior documents in their lists.

The same as presence module, it has a caching mode with periodical update in database for subscribe information. The information retrieved with Notify messages is stored in database only.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _a database module_.
    
*   _signaling_.
    
*   _tm_.
    
*   _presence- in a library mode_.
    
*   _pua_.
    
*   _xcap_.
    

### 1.2.2.�External Libraries or Applications

*   _libxml-dev_.
    

## 1.3.�Exported Parameters

### 1.3.1.�`rlsubs_table`(str)

The name of the db table where resource lists subscription information is stored.

_Default value is “rls\_watchers”._

**Example�1.1.�Set `rlsubs_table` parameter**

...
modparam("rls", "rlsubs\_table", "rls\_subscriptions")
...

  

### 1.3.2.�`rlpres_table`(str)

The name of the db table where notified event specific information is stored.

_Default value is “rls\_presentity”._

**Example�1.2.�Set `rlpres_table` parameter**

...
modparam("rls", "rlpres\_table", "rls\_notify")
...

  

### 1.3.3.�`clean_period` (int)

The period at which to check for expired information.

_Default value is “100”._

**Example�1.3.�Set `clean_period` parameter**

...
modparam("rls", "clean\_period", 100)
...

  

### 1.3.4.�`waitn_time` (int)

The timer period at which the server should attempt to send Notifies with the updated presence state of the subscribed list or watcher information.

_Default value is “50”._

**Example�1.4.�Set `waitn_time` parameter**

...
modparam("rls", "waitn\_time", 10)
...

  

### 1.3.5.�`max_expires` (int)

The maximum accepted expires for a subscription to a list.

_Default value is “7200”._

**Example�1.5.�Set `max_expires` parameter**

...
modparam("rls", "max\_expires", 10800)
...
		

  

### 1.3.6.�`hash_size` (int)

The dimension of the hash table used to store subscription to a list. This parameter will be used as the power of 2 when computing table size.

_Default value is “9 (512)”._

**Example�1.6.�Set `hash_size` parameter**

...
modparam("rls", "hash\_size", 11)
...
		

  

### 1.3.7.�`xcap_root` (str)

The address of the xcap server.

_Default value is “NULL”._

**Example�1.7.�Set `hash_size` parameter**

...
modparam("rls", "xcap\_root", "http://192.168.2.132/xcap-root:800")
...
		

  

### 1.3.8.�`to_presence_code` (int)

The code to be returned by rls\_handle\_subscribe function if the processed Subscribe is not a resource list Subscribe. This code can be used in an architecture with presence and rls servers collocated on the same machine, to call handle\_subscribe on the message causing this code.

_Default value is “0”._

**Example�1.8.�Set `to_presence_code` parameter**

...
modparam("rls", "to\_presence\_code", 10)
...
		

  

### 1.3.9.�`rls_event` (str)

The default event that RLS handles is presence. If some other events should also be handled by RLS they should be added using this parameter. It can be set more than once.

_Default value is “"presence"”._

**Example�1.9.�Set `rls_event` parameter**

...
modparam("rls", "rls\_event", "dialog;sla")
...
		

  

### 1.3.10.�`presence_server` (str)

The address of the presence server. It will be used as outbound proxy for Subscribe requests sent by the RLS server to bouncing on and off the proxy and having to include special processing for this messages in the proxy's configuration file.

**Example�1.10.�Set `presence_server` parameter**

...
modparam("rls", "presence\_server", "sip:pres@opensips.org:5060")
...
		

  

### 1.3.11.�`contact_user` (str)

This is the username that will be used in the Contact header for the 200 OK replies to SUBSCRIBE and in the following in-dialog NOTIFY requests, as well as for the SUBSCRIBE requests that are generated by the RLS server. The IP address, port and transport for the Contact will be automatically determined based on the interface where the SUBSCRIBE was received or sent from.

If set to an empty string, no username will be added to the contact and the contact will be built just out of the IP, port and transport.

_Default value is “rls”._

**Example�1.11.�Set `contact_user` parameter**

...
modparam("rls", "contact\_user", "rls")
...
		

  

## 1.4.�Exported Functions

### 1.4.1.� `rls_handle_subscribe()`

This function detects if a Subscribe message should be handled by RLS. If not it replies with the configured to\_presence\_code. If it is, it extracts the dialog info and sends aggregate Notify requests with information for the list.

This function can be used from REQUEST\_ROUTE.

**Example�1.12.�`rls_handle_subscribe` usage**

...
For presence and rls on the same machine:
	modparam(rls, "to\_presence\_code", 10)

	if(is\_method("SUBSCRIBE"))
	{	
		$var(ret\_code)= rls\_handle\_subscribe();

		if($var(ret\_code)== 10)
				handle\_subscribe();

		t\_release();
	}

For rls only:
	if(is\_method("SUBSCRIBE"))
	{
		rls\_handle\_subscribe();
		t\_release();
	}

...

  

### 1.4.2.� `rls_handle_notify()`

This function has to be called for Notify messages sent by presence servers in reply to the Subscribe messages sent by RLS.

This function can be used from REQUEST\_ROUTE.

It can return 3 codes:

*   _1_ - the Notify was inside a dialog that was recognized by the RLS server and was processed successfully.
    
*   _2_ - the Notify did not belog to a dialog initiated by the RLS server.
    
*   _\-1_ - an error occurred during processing.
    

**Example�1.13.�`rls_handle_notify` usage**

...
if($rm=="NOTIFY")
    rls\_handle\_notify();
...

  

## 1.5.�Exported MI Functions

### 1.5.1.� `rls_update_subscriptions`

Triggers updating backend subscriptions after a resources-list or rls-services document has been updated.

Name: _rls\_update\_subscriptions_

Parameters:

*   presentity\_uri : the uri of the user who made the change and whose subscriptions should be updated
    

MI FIFO Command Format:

opensips-cli -x mi rls\_update\_subscriptions sip:alice@atlanta.com
	

## 1.6.�Installation

The module requires 2 table in OpenSIPS database: rls\_presentity and rls\_watchers.The SQL syntax to create them can be found in rls-create.sql script in the database directories in the opensips/scripts folder. You can also find the complete database documentation on the project webpage, [https://opensips.org/docs/db/db-schema-devel.html](https://opensips.org/docs/db/db-schema-devel.html).

## Chapter�2.�Developer Guide

The module provides no functions to be used in other OpenSIPS modules.

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

Anca Vamanu

100

41

5335

863

2.

Sa�l Ibarra Corretg� ([@saghul](https://github.com/saghul))

40

18

1150

710

3.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

25

21

110

137

4.

Dan Pascu ([@danpascu](https://github.com/danpascu))

15

10

127

138

5.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

14

12

20

38

6.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

14

11

58

79

7.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

9

7

18

15

8.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

7

5

28

35

9.

Henning Westerholt ([@henningw](https://github.com/henningw))

7

3

164

114

10.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

5

3

11

41

  

**All remaining contributors**: Walter Doekes ([@wdoekes](https://github.com/wdoekes)), Stanislaw Pitucha, Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)), Sergio Gutierrez, Maksym Sobolyev ([@sobomax](https://github.com/sobomax)), Konstantin Bokarius, UnixDev, John Riordan, Juli�n Moreno Pati�o, Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Edson Gellert Schubert.

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 3.2.�By Commit Activity

**Table�3.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Mar 2014 - May 2024

2.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Feb 2023

3.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Feb 2012 - Jul 2020

4.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Jan 2008 - Mar 2020

5.

Dan Pascu ([@danpascu](https://github.com/danpascu))

Aug 2008 - Jul 2019

6.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Apr 2019

7.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

8.

Juli�n Moreno Pati�o

Feb 2016 - Feb 2016

9.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

Jan 2013 - Jan 2013

10.

Sa�l Ibarra Corretg� ([@saghul](https://github.com/saghul))

Oct 2012 - Jan 2013

  

**All remaining contributors**: Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)), Anca Vamanu, Stanislaw Pitucha, Walter Doekes ([@wdoekes](https://github.com/wdoekes)), John Riordan, UnixDev, Sergio Gutierrez, Henning Westerholt ([@henningw](https://github.com/henningw)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert.

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�4.�Documentation

## 4.1.�Contributors

**Last edited by:** Dan Pascu ([@danpascu](https://github.com/danpascu)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Sa�l Ibarra Corretg� ([@saghul](https://github.com/saghul)), Walter Doekes ([@wdoekes](https://github.com/wdoekes)), Anca Vamanu, Henning Westerholt ([@henningw](https://github.com/henningw)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert.

_Documentation Copyrights:_

Copyright � 2007 Voice Sistem SRL