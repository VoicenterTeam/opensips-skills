# UAC Registrant Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp6207584)

2.2. [Most recently active contributors(1) to this module](#idp6308000)

**List of Examples**

1.1. [Set `hash_size` parameter](#idp5929344)

1.2. [Set `timer_interval` parameter](#idp5933776)

1.3. [Set `failure_retry_interval` parameter](#idp5938496)

1.4. [Set `enable_clustering` parameter](#idp5943392)

1.5. [Set “db\_url” parameter](#idp5948288)

1.6. [Set “table\_name” parameter](#idp5953280)

1.7. [Set “registrar\_column” parameter](#idp5958336)

1.8. [Set “proxy\_column” parameter](#idp5963536)

1.9. [Set “aor\_column” parameter](#idp5968720)

1.10. [Set “third\_party\_registrant\_column” parameter](#idp5974032)

1.11. [Set “username\_column” parameter](#idp5979088)

1.12. [Set “password\_column” parameter](#idp5984144)

1.13. [Set “binding\_URI\_column” parameter](#idp5989312)

1.14. [Set “binding\_params\_column” parameter](#idp5997920)

1.15. [Set “expiry\_column” parameter](#idp6002928)

1.16. [Set “forced\_socket\_column” parameter](#idp6008464)

1.17. [Set “cluster\_shtag\_column” parameter](#idp6013616)

1.18. [Set “state\_column” parameter](#idp6019472)

## Chapter�1.�Admin Guide

## 1.1.�Overview

The module enable OpenSIPS to register itself on a remote SIP registrar.

At startup, the registrant records are loaded into a hash table in memory and a timer is started. The hash index is computed over the AOR field.

The timer interval for checking records in a hash bucket is computed by dividing the timer\_interval module param by the number of hash buckets. When the timer fires for the first time, the first hash bucket will be checked and REGISTERs will be sent out for each record that is found. On the next timeout fire, the second hash bucket will be checked and so on. If the configured timer\_interval module param is lower then the number of buckets, the module will fail to start.

Example: setting the timer\_interval module to 8 with a hash\_size of 2, will result in having 4 hash buckets (2^2=4) and buckets will be checked one by one every 2s (8/4=2).

Each registrant has it's own state. Registrant's status can be inspected via "reg\_list" MI comand.

UAC registrant states:

*   _0_ - NOT\_REGISTERED\_STATE - the initial state (no REGISTER has been sent out yet);
    
*   _1_ - REGISTERING\_STATE - waiting for a reply from the registrar after a REGISTER without authentication header was sent;
    
*   _2_ - AUTHENTICATING\_STATE - waiting for a reply from the registrar after a REGISTER with authentication header was sent;
    
*   _3_ - REGISTERED\_STATE - the uac is successfully registered;
    
*   _4_ - REGISTER\_TIMEOUT\_STATE : no reply received from the registrar;
    
*   _5_ - INTERNAL\_ERROR\_STATE - some errors were found/encountered during the processing of a reply;
    
*   _6_ - WRONG\_CREDENTIALS\_STATE - credentials rejected by the registrar;
    
*   _7_ - REGISTRAR\_ERROR\_STATE - error reply received from the registrar;
    
*   _8_ - UNREGISTERING\_STATE - waiting for a reply from the registrar after an unREGISTER without authentication header was sent;
    
*   _9_ - AUTHENTICATING\_UNREGISTER\_STATE - waiting for a reply from the registrar after an unREGISTER with authentication header was sent;
    

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _uac\_auth - UAC authentication module_
    

### 1.2.2.�External Libraries or Applications

None.

## 1.3.�Exported Parameters

### 1.3.1.�`hash_size` (integer)

The size of the hash table internally used to keep the registrants. A larger table distributes better the registration load in time but consumes more memory. The hash size is a power of number two.

_Default value is 1._

**Example�1.1.�Set `hash_size` parameter**

...
modparam("uac\_registrant", "hash\_size", 2)
...

  

### 1.3.2.�`timer_interval` (integer)

Defines the periodic timer for checking the registrations status.

_Default value is 100._

**Example�1.2.�Set `timer_interval` parameter**

...
modparam("uac\_registrant", "timer\_interval", 120)
...

  

### 1.3.3.�`failure_retry_interval` (integer)

Defines a custom interval to retry the registration upon error/failure. Normally, after any kind of failure (timeout, credentials, internal error), the registration is re-taken after "expires" seconds. The parameter here, if set, overrides that value.

_Default value is 0 (not set)._

**Example�1.3.�Set `failure_retry_interval` parameter**

...
modparam("uac\_registrant", "failure\_retry\_interval", 3600)
...

  

### 1.3.4.�`enable_clustering` (integer)

This parameter enables the clustering support in the module. This is used to share this registration between all the nodes in the cluster. When using this option, you should define (for each registrant record) a sharing tag - this sharing tag will control at the cluster level which node is entitled to perform the registation (only the node having that tag as active will do the registation, the onther nodes being idle).

_Default value is 0 / off._

**Example�1.4.�Set `enable_clustering` parameter**

...
modparam("uac\_registrant", "enable\_clustering", 1)
...

  

### 1.3.5.�`db_url` (string)

Database where to load the registrants from.

_Default value is “NULL” (use default DB URL from core)._

**Example�1.5.�Set “db\_url” parameter**

...
modparam("uac\_registrant", "db\_url", "mysql://user:passw@localhost/database")
...

  

### 1.3.6.�`table_name` (string)

The database table that holds the registrant records.

_Default value is “registrant”._

**Example�1.6.�Set “table\_name” parameter**

...
modparam("uac\_registrant", "table\_name", "my\_registrant")
...

  

### 1.3.7.�`registrar_column` (string)

The column's name in the database storing the URI pointing to the remote registrar (mandatory field). OpenSIPS expects a valid URI.

_Default value is “registrar”._

**Example�1.7.�Set “registrar\_column” parameter**

...
modparam("uac\_registrant", "registrar\_column", "registrant\_uri")
...

  

### 1.3.8.�`proxy_column` (string)

The column's name in the database storing the URI pointing to the outbond proxy (not mandatory field). An empty or NULL value means no outbound proxy, otherwise OpenSIPS expects a valid URI.

_Default value is “proxy”._

**Example�1.8.�Set “proxy\_column” parameter**

...
modparam("uac\_registrant", "proxy\_column", "proxy\_uri")
...

  

### 1.3.9.�`aor_column` (string)

The column's name in the database storing the URI defining the address of record (mandatory field). The URI stored here will be used in the To URI of the REGISTER. OpenSIPS expects a valid URI.

_Default value is “aor”._

**Example�1.9.�Set “aor\_column” parameter**

...
modparam("uac\_registrant", "aor\_column", "to\_uri")
...

  

### 1.3.10.�`third_party_registrant_column` (string)

The column's name in the database storing the URI defining the third party registrant (not mandatory field). The URI stored here will be used in the From URI of the REGISTER. An empty or NULL value means no third party registration (the From URI will be identical to To URI), otherwise OpenSIPS expects a valid URI.

_Default value is “third\_party\_registrant”._

**Example�1.10.�Set “third\_party\_registrant\_column” parameter**

...
modparam("uac\_registrant", "third\_party\_registrant\_column", "from\_uri")
...

  

### 1.3.11.�`username_column` (string)

The column's name in the database storing the username for authentication (mandatory if the registrar requires authentication).

_Default value is “username”._

**Example�1.11.�Set “username\_column” parameter**

...
modparam("uac\_registrant", "username\_column", "auth\_username")
...

  

### 1.3.12.�`password_column` (string)

The column's name in the database storing the password for authentication (mandatory if the registrar requires authntication).

_Default value is “password”._

**Example�1.12.�Set “password\_column” parameter**

...
modparam("uac\_registrant", "password\_column", "auth\_passowrd")
...

  

### 1.3.13.�`binding_URI_column` (string)

The column's name in the database storing the binding URI in REGISTER (mandatory field). The URI stored here will be used in the Contact URI of the REGISTER. OpenSIPS expects a valid URI.

_Default value is “binding\_URI”._

**Example�1.13.�Set “binding\_URI\_column” parameter**

...
modparam("uac\_registrant", "binding\_URI\_column", "contact\_uri")
...

  

### 1.3.14.�`binding_params_column` (string)

The column's name in the database storing the binding params in REGISTER (not mandatory field). If not NULL or not empty, the string stored here will be added as params to the Contact URI in REGISTER (it MUST start with “;”.

If the following two params are present, then the binding will be enforced to be unique (if two bindings are received in a 200ok, a complete binding removal will be performed before re-registering):

*   _reg-id_
    
*   _+sip.instance_
    

Example of params that will force unique binding:

;reg-id=1;+sip.instance="<urn:uuid:11111111-AABBCCDDEEFF>"
		

_Default value is “binding\_params”._

**Example�1.14.�Set “binding\_params\_column” parameter**

...
modparam("uac\_registrant", "binding\_params\_column", "contact\_params")
...

  

### 1.3.15.�`expiry_column` (string)

The column's name in the database storing the expiration time (not mandatory).

_Default value is “expiry”._

**Example�1.15.�Set “expiry\_column” parameter**

...
modparam("uac\_registrant", "expiry\_column", "registration\_timeout")
...

  

### 1.3.16.�`forced_socket_column` (string)

The column's name in the database storing the socket for sending the REGISTER (not mandatory). If a forced socket is provided, the socket MUST be explicitely set as a global listening socket in the config (see “listen” core parameter).

_Default value is “forced\_socket”._

**Example�1.16.�Set “forced\_socket\_column” parameter**

...
modparam("uac\_registrant", "forced\_socket\_column", "fs")
...

  

### 1.3.17.�`cluster_shtag_column` (string)

The column's name in the database storing the cluster sharing tag in \[tag\_name/cluster\_id\] format (not mandatory). If a cluster sharing tag is provided, the REGISTER requests will be fired out only when the tag is active.

_Default value is “cluster\_shtag”._

**Example�1.17.�Set “cluster\_shtag\_column” parameter**

...
modparam("uac\_registrant", "cluster\_shtag\_column", "sh")
...

  

### 1.3.18.�`state_column` (string)

The column's name in the database storing the current state of the registrant. When a registrant is disabled, OpenSIPS will no longer send REGISTERs for it. A value of _0_ for this column means enabled and _1_ disabled.

_Default value is “state”._

**Example�1.18.�Set “state\_column” parameter**

...
modparam("uac\_registrant", "state\_column", "status")
...

  

## 1.4.�Exported Functions

None to be used in configuration file.

## 1.5.�Exported MI Functions

### 1.5.1.�`reg_list`

Lists the registrant records and their status.

Name: _reg\_list_

Parameters:

*   _aor_ (optional) - URI defining the address of record. If provided, _contact_ and _registrar_ parameters are also required and only a specific record will be listed.
    
*   _contact_ (optional) - Contact URI. If provided, _aor_ and _registrar_ parameters are also required and only a specific record will be listed.
    
*   _registrar_ (optional) - URI pointing to the remote registrar. If provided, _aor_ and _contact_ parameters are also required and only a specific record will be listed.
    

MI FIFO Command Format:

opensips-cli -x mi reg\_list
...
opensips-cli -x mi reg\_list sip:alice@opensips.org  sip:alice@127.0.0.1:5060 sip:opensips.org
		

### 1.5.2.�`reg_reload`

Reloads the registrant records from the database.

Name: _reg\_reload_

Parameters: _none_

*   _aor_ (optional) - URI defining the address of record. If provided, _contact_ and _registrar_ parameters are also required and only a specific record will be reloaded.
    
*   _contact_ (optional) - Contact URI. If provided, _aor_ and _registrar_ parameters are also required and only a specific record will be reloaded.
    
*   _registrar_ (optional) - URI pointing to the remote registrar. If provided, _aor_ and _contact_ parameters are also required and only a specific record will be reloaded.
    

MI FIFO Command Format:

opensips-cli -x mi reg\_reload
...
opensips-cli -x mi reg\_leload sip:alice@opensips.org  sip:alice@127.0.0.1:5060 sip:opensips.org
		

### 1.5.3.�`reg_enable`

Enables a specific registrant. OpenSIPS will immediately send a REGISTER if the registrant was previously disabled and will update the state in the database.

Name: _reg\_enable_

Parameters: _none_

*   _aor_ - URI defining the address of record.
    
*   _contact_ - Contact URI.
    
*   _registrar_ - URI pointing to the remote registrar.
    

MI FIFO Command Format:

opensips-cli -x mi reg\_enable sip:alice@opensips.org  sip:alice@127.0.0.1:5060 sip:opensips.org
		

### 1.5.4.�`reg_disable`

Disables a specific registrant. OpenSIPS will immediately send an unREGISTER if the registrant was previously enabled and will update the state in the database.

Name: _reg\_disable_

Parameters: _none_

*   _aor_ - URI defining the address of record. If provided, _contact_ and _registrar_ parameters are also required and only a specific record will be disabled.
    
*   _contact_ - Contact URI. If provided, _aor_ and _registrar_ parameters are also required and only a specific record will be disabled.
    
*   _registrar_ - URI pointing to the remote registrar. If provided, _aor_ and _contact_ parameters are also required and only a specific record will be disabled.
    

MI FIFO Command Format:

opensips-cli -x mi reg\_disable sip:alice@opensips.org  sip:alice@127.0.0.1:5060 sip:opensips.org
		

### 1.5.5.�`reg_force_register`

Forces the re-registration (or registation) of a specific registrant (depending on its state). Note that the registrant must be enabled.

Name: _reg\_force\_register_

Parameters:

*   _aor_ - URI defining the address of record. If provided, _contact_ and _registrar_ parameters are also required and only a specific record will be forced to re-register.
    
*   _contact_ - Contact URI. If provided, _aor_ and _registrar_ parameters are also required and only a specific record will be forced to re-register.
    
*   _registrar_ - URI pointing to the remote registrar. If provided, _aor_ and _contact_ parameters are also required and only a specific record will be forced to re-register.
    

MI FIFO Command Format:

opensips-cli -x mi reg\_force\_register sip:alice@opensips.org  sip:alice@127.0.0.1:5060 sip:opensips.org
		

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

143

41

5688

3268

2.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

18

13

451

49

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

17

14

57

68

4.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

16

7

732

118

5.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

11

9

26

36

6.

Nick Altmann ([@nikbyte](https://github.com/nikbyte))

5

3

43

4

7.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

5

3

20

16

8.

James Stanley

4

2

21

14

9.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

4

2

6

3

10.

sagarmalam

3

1

15

1

  

**All remaining contributors**: Walter Doekes ([@wdoekes](https://github.com/wdoekes)), James Stanley, Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), okhowang(王沛文).

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 2.2.�By Commit Activity

**Table�2.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Nick Altmann ([@nikbyte](https://github.com/nikbyte))

Nov 2015 - Mar 2025

2.

okhowang(王沛文)

Jul 2024 - Jul 2024

3.

James Stanley

Dec 2023 - Jun 2024

4.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Dec 2012 - May 2024

5.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

Feb 2011 - Dec 2023

6.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Mar 2021 - Nov 2023

7.

James Stanley

Mar 2023 - Mar 2023

8.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Sep 2011 - Nov 2021

9.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Mar 2014 - Jul 2021

10.

Walter Doekes ([@wdoekes](https://github.com/wdoekes))

Apr 2021 - Apr 2021

  

**All remaining contributors**: sagarmalam, Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)).

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)).

_Documentation Copyrights:_

Copyright � 2011-2014 [VoIP Embedded, Inc.](http://www.voipembedded.com)