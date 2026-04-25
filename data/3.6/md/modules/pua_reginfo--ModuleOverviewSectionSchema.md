# pua\_reginfo Module

### Carsten Bock

`<[carsten@ng-voice.com](mailto:carsten@ng-voice.com)>`

#### Edited by

### Carsten Bock

`<[carsten@ng-voice.com](mailto:carsten@ng-voice.com)>`

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5593936)

2.2. [Most recently active contributors(1) to this module](#idp5675472)

**List of Examples**

1.1. [Set `default_domain` parameter](#idp259824)

1.2. [Set `publish_reginfo` parameter](#idp163648)

1.3. [Set `outbound_proxy` parameter](#idp168160)

1.4. [Set `server_address` parameter](#idp171680)

1.5. [Set `ul_domain` parameter](#idp176400)

1.6. [Set `ul_identities_key` parameter](#idp181120)

1.7. [`reginfo_handle_notify` usage](#idp5551424)

1.8. [`reginfo_subscribe` usage](#idp5558208)

1.9. [`reginfo_subscribe` usage](#idp5564800)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This module publishes information about "reg"-events according to to RFC 3680. This can be used distribute the registration-info status to the subscribed watchers.

This module "PUBLISH"es information when a new user registers at this server (e.g. when "save()" is called) to users, which have subscribed for the reg-info for this user.

This module can "SUBSCRIBE" for information at another server, so it will receive "NOTIFY"-requests, when the information about a user changes.

And finally, it can process received "NOTIFY" requests and it will update the local registry accordingly.

Use cases for this might be:

*   Keeping different Servers in Sync regarding the location database
*   Get notified, when a user registers: A presence-server, which handles offline message storage for an account, would get notified, when the user comes online.
*   A client could subscribe to its own registration-status, so he would get notified as soon as his account gets administratively unregistered.
*   ...

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _pua_.
    
*   _usrloc_.
    

### 1.2.2.�External Libraries or Applications

None.

## 1.3.�Parameters

### 1.3.1.�`default_domain`(str)

The default domain for the registered users to be used when constructing the uri for the registrar callback.

_Default value is “NULL”._

**Example�1.1.�Set `default_domain` parameter**

...
modparam("pua\_reginfo", "default\_domain", "kamailio.org")
...

  

### 1.3.2.�`publish_reginfo`(int)

Whether or not to generate PUBLISH requests.

_Default value is “1” (enabled)._

**Example�1.2.�Set `publish_reginfo` parameter**

...
modparam("pua\_reginfo", "publish\_reginfo", 0)
...

  

### 1.3.3.�`outbound_proxy`(str)

The outbound\_proxy uri to be used when sending Subscribe and Publish requests.

_Default value is “NULL”._

**Example�1.3.�Set `outbound_proxy` parameter**

...
modparam("pua\_reginfo", "outbound\_proxy", "sip:proxy@kamailio.org")
...

  

### 1.3.4.�`server_address`(str)

The IP address of the server.

**Example�1.4.�Set `server_address` parameter**

...
modparam("pua\_reginfo", "server\_address", "sip:reginfo@160.34.23.12")
...

  

### 1.3.5.�`ul_domain`(str)

The domain for for querying the usrloc-database.

_Default value is “NULL” (not set)._

**Example�1.5.�Set `ul_domain` parameter**

...
modparam("pua\_reginfo", "ul\_domain", "location")
...

  

### 1.3.6.�`ul_identities_key`(str)

The Key, which may be used for retrieving multiple public identies for a user.

_Default value is “NULL” (not set)._

**Example�1.6.�Set `ul_identities_key` parameter**

...
modparam("pua\_reginfo", "ul\_identities\_key", "identities")
...
onreply\_route\[register\_reply\] {
	if (t\_check\_status("200") && $hdr(P-Associated-URI)) {
        ul\_add\_key("location", "$tU@$td", "identities", "$hdr(P-Associated-URI)");
        reginfo\_update("$tU@$td");
	}
}

...
		

  

## 1.4.�Functions

### 1.4.1.� `reginfo_handle_notify(uldomain)`

This function processes received "NOTIFY"-requests and updates the local registry accordingly.

This method does not create any SIP-Response, this has to be done by the script-writer.

The parameter has to correspond to user location table (domain) where to store the record.

Return codes:

*   _2_ - contacts successfully updated, but no more contacts online now.
    
    _1_ - contacts successfully updated and at at least one contact still registered.
    
    _\-1_ - Invalid NOTIFY or other error (see log-file)
    

**Example�1.7.�`reginfo_handle_notify` usage**

...
if(is\_method("NOTIFY")) 
	if (reginfo\_handle\_notify("location"))
		send\_reply("202", "Accepted");
...
				

  

### 1.4.2.� `reginfo_subscribe(uri[, expires])`

This function will subscribe for reginfo-information at the given server URI.

Meaning of the parameters is as follows:

*   _uri_ - SIP-URI of the server, where to subscribe, may contain pseudo-variables.
    
    _expires_ - Expiration date for this subscription, in seconds (default 3600)
    

**Example�1.8.�`reginfo_subscribe` usage**

...
route {
	t\_on\_reply("1");
	t\_relay();
}

reply\_route\[1\] {
	if (t\_check\_status("200")) 
		reginfo\_subscribe("$ru");		
}
...
				

  

### 1.4.3.� `reginfo_update(aor)`

Explicitly update the presence status, e.g., when new information is learned. This may trigger a new NOTIFY towards subscribed entities; at least it will update the internal information for subsequent subscribe and notifies.

This is done implicitly, when a registration is updated. However, when a registration was just updated with additional information like identities, this is not triggered automatically.

Meaning of the parameters is as follows:

*   _aor_ - The AOR to be updated.
    

**Example�1.9.�`reginfo_subscribe` usage**

...
modparam("pua\_reginfo", "ul\_domain", "location")
modparam("pua\_reginfo", "ul\_identities\_key", "identities")
...
onreply\_route\[register\_reply\] {
	if (t\_check\_status("200") && $hdr(P-Associated-URI)) {
        ul\_add\_key("location", "$tU@$td", "identities", "$hdr(P-Associated-URI)");
        reginfo\_update("$tU@$td");
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

Carsten Bock

18

1

1930

0

2.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

4

2

16

19

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

3

1

2

3

4.

Ken Rice

3

1

2

2

5.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

3

1

1

1

6.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

2

1

1

0

  

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 2.2.�By Commit Activity

**Table�2.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Ken Rice

Sep 2025 - Sep 2025

2.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Feb 2025 - Feb 2025

3.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Jan 2025 - Jan 2025

4.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Apr 2024 - Apr 2024

5.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Apr 2024 - Apr 2024

6.

Carsten Bock

Mar 2024 - Mar 2024

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Carsten Bock.

_Documentation Copyrights:_

Copyright � 2011-2023 Carsten Bock, carsten@ng-voice.com, http://www.ng-voice.com