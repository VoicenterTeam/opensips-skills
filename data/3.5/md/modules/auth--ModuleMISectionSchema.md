# Auth Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5726928)

2.2. [Most recently active contributors(1) to this module](#idp5831312)

**List of Examples**

1.1. [secret parameter example](#idp85392)

1.2. [nonce\_expire parameter example](#idp90240)

1.3. [rpid\_prefix parameter example](#idp5513152)

1.4. [rpid\_suffix parameter example](#idp5517440)

1.5. [realm\_prefix parameter example](#idp5521824)

1.6. [rpid\_avp parameter example](#idp5526528)

1.7. [`username_spec` parameter usage](#idp5530576)

1.8. [`password_spec` parameter usage](#idp5534880)

1.9. [`calculate_ha1` parameter usage](#idp5539984)

1.10. [`disable_nonce_check` parameter usage](#idp5544672)

1.11. [www\_challenge usage](#idp5563376)

1.12. [proxy\_challenge usage](#idp5581200)

1.13. [consume\_credentials example](#idp5587168)

1.14. [is\_rpid\_user\_e164 usage](#idp5591664)

1.15. [append\_rpid\_hf usage](#idp5596064)

1.16. [append\_rpid\_hf(prefix, suffix) usage](#idp5604208)

1.17. [`pv_www_authorize` usage](#idp5618208)

1.18. [pv\_proxy\_authorize usage](#idp5627392)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This is a module that provides common functions that are needed by other authentication related modules. Also, it can perform authentication taking username and password from pseudo-variables.

### 1.1.1.�RFC 8760 Support (Strenghtened Authentication)

Starting with OpenSIPS 3.2, the [auth](auth), [auth\_db](auth_db) and [uac\_auth](uac_auth) modules include support for two new digest authentication algorithms ("SHA-256" and "SHA-512-256"), according to the [RFC 8760](https://datatracker.ietf.org/doc/html/rfc8760) specs.

## 1.2.�Nonce Security

The authentication mechanism offers protection against sniffing intrusion. The module generates and verifies the nonces so that they can be used only once (in an auth response). This is done by having a lifetime value and an index associated with every nonce. Using only an expiration value is not good enough because,as this value has to be of few tens of seconds, it is possible for someone to sniff on the network, get the credentials and then reuse them in another packet with which to register a different contact or make calls using the others's account. The index ensures that this will never be possible since it is generated as unique through the lifetime of the nonce.

The default limit for the requests that can be authenticated is 100000 in 30 seconds. If you wish to adjust this you can decrease the lifetime of a nonce( how much time to wait for a reply to a challenge). However, be aware not to set it to a too smaller value.

However this mechanism does not work for architectures using a cluster of servers that share the same dns name for load balancing. In this case you can disable the nonce reusability check by setting the module parameter 'disable\_nonce\_check'.

## 1.3.�Dependencies

### 1.3.1.�OpenSIPS Modules

The module depends on the following modules (in the other words the listed modules must be loaded before this module):

*   _signaling_ -- Signaling module
    

### 1.3.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _none_
    

## 1.4.�Exported Parameters

### 1.4.1.�`secret` (string)

Secret phrase used to calculate the nonce value. Must be exactly 32-character long.

The default is to use a random value generated from the random source in the core.

If you use multiple servers in your installation, and would like to authenticate on the second server against the nonce generated at the first one its necessary to explicitly set the secret to the same value on all servers. However, the use of a shared (and fixed) secret as nonce is insecure, much better is to stay with the default. Any clients should send the reply to the server that issued the request.

**Example�1.1.�secret parameter example**

modparam("auth", "secret", "johndoessecretphrase")

  

### 1.4.2.�`nonce_expire` (integer)

Nonces have limited lifetime. After a given period of time nonces will be considered invalid. This is to protect replay attacks. Credentials containing a stale nonce will be not authorized, but the user agent will be challenged again. This time the challenge will contain `stale` parameter which will indicate to the client that it doesn't have to disturb user by asking for username and password, it can recalculate credentials using existing username and password.

The value is in seconds and default value is 30 seconds.

**Example�1.2.�nonce\_expire parameter example**

modparam("auth", "nonce\_expire", 15)   # Set nonce\_expire to 15s

  

### 1.4.3.�`rpid_prefix` (string)

Prefix to be added to Remote-Party-ID header field just before the URI returned from either radius or database.

Default value is “”.

**Example�1.3.�rpid\_prefix parameter example**

modparam("auth", "rpid\_prefix", "Whatever <")

  

### 1.4.4.�`rpid_suffix` (string)

Suffix to be added to Remote-Party-ID header field after the URI returned from either radius or database.

Default value is “;party=calling;id-type=subscriber;screen=yes”.

**Example�1.4.�rpid\_suffix parameter example**

modparam("auth", "rpid\_suffix", "@1.2.3.4>")

  

### 1.4.5.�`realm_prefix` (string)

Prefix to be automatically strip from realm. As an alternative to SRV records (not all SIP clients support SRV lookup), a subdomain of the master domain can be defined for SIP purposes (like sip.mydomain.net pointing to same IP address as the SRV record for mydomain.net). By ignoring the realm\_prefix “sip.”, at authentication, sip.mydomain.net will be equivalent to mydomain.net .

Default value is empty string.

**Example�1.5.�realm\_prefix parameter example**

modparam("auth", "realm\_prefix", "sip.")

  

### 1.4.6.�`rpid_avp` (string)

Full AVP specification for the AVP which stores the RPID value. It used to transport the RPID value from authentication backend modules (auth\_db or auth\_radius) or from script to the auth function append\_rpid\_hf and is\_rpid\_user\_e164.

If defined to NULL string, all RPID functions will fail at runtime.

Default value is “$avp(rpid)”.

**Example�1.6.�rpid\_avp parameter example**

modparam("auth", "rpid\_avp", "$avp(caller\_rpid)")
		

  

### 1.4.7.�`username_spec` (string)

This name of the pseudo-variable that will hold the username.

Default value is “NULL”.

**Example�1.7.�`username_spec` parameter usage**

modparam("auth", "username\_spec", "$var(username)")

  

### 1.4.8.�`password_spec` (string)

This name of the pseudo-variable that will hold the password.

Default value is “NULL”.

**Example�1.8.�`password_spec` parameter usage**

modparam("auth", "password\_spec", "$var(password)")

  

### 1.4.9.�`calculate_ha1` (integer)

This parameter tells the server whether it should expect plaintext passwords in the pseudo-variable or a pre-calculated HA1 string.

If the parameter is set to 1 then the server will assume that the “password\_spec” pseudo-variable contains plaintext passwords and it will calculate HA1 strings on the fly. If the parameter is set to 0 then the server assumes the pseudo-variable contains the HA1 strings directly and will not calculate them.

Default value of this parameter is 0.

**Example�1.9.�`calculate_ha1` parameter usage**

modparam("auth", "calculate\_ha1", 1)

  

### 1.4.10.�`disable_nonce_check` (int)

By setting this parameter you disable the security mechanism that protects against intrusion sniffing and does not allow nonces to be reused. But, because of the current implementation, having this enabled breaks auth for an architecture where load is balanced by having more servers with the same dns name. This parameter has to be set in this case.

Default value is “0” (enabled).

**Example�1.10.�`disable_nonce_check` parameter usage**

modparam("auth", "disable\_nonce\_check", 1)

  

## 1.5.�Exported Functions

### 1.5.1.� `www_challenge(realm[, qop[, algorithms]])`

The function challenges a user agent. It will generate one or more WWW-Authorize header fields containing a digest challenges, it will put the header field(s) into a response generated from the request the server is processing and will send the reply. Upon reception of such a reply the user agent should compute credentials and retry the request. For more information regarding digest authentication see RFC2617, RFC3261 and RFC8760.

Meaning of the parameters is as follows:

*   _realm_ (string) - Realm is an opaque string that the user agent should present to the user so it can decide what username and password to use. Usually this is domain of the host the server is running on.
    
    If an empty string “” is used then the server will generate it from the request. In case of REGISTER request's To header field, domain will be used (because this header field represents a user being registered), for all other messages From header field domain will be used.
    
*   _qop_ (string, optional) - Value of this parameter can be either “auth”, “auth-int” or both (separated by _,_). When this parameter is set the server will put a qop parameter in the challenge. It is recommended to use the qop parameter, however there are still some user agents that cannot handle qop properly so we made this optional. On the other hand there are still some user agents that cannot handle request without a qop parameter too.
    
    Enabling this parameter does not improve security at the moment, because the sequence number is not stored and therefore could not be checked. Actually there is no information kept by the module during the challenge and response requests.
    
*   _algorithms_ (string, optional) - Value of this parameter is a comma-separated list of digest algorithms to be offered for the UAC to use for authentication. Possible values are:
    
    *   “MD5”
    *   “MD5-sess”
    *   “SHA-256”
    *   “SHA-256-sess”
    *   “SHA-512-256”
    *   “SHA-512-256-sess”
    
    When the value is empty or not set, the only offered digest algorithm is _MD5_, to provide compatibility with pre-RFC8760 UAC implementations.
    
    Values can be listed in any order. The actual order of individual challenges in SIP response is defined by the RFC8760: from stronger algorithm to a weaker one.
    

This function can be used from REQUEST\_ROUTE.

**Example�1.11.�www\_challenge usage**

...
if (!www\_authorize("siphub.net", "subscriber")) {
	www\_challenge("siphub.net", "auth,auth-int", "MD5,SHA-512-256");
}
...

  

### 1.5.2.� `proxy_challenge(realm[, qop[, algorithms]])`

The function challenges a user agent. It will generate a Proxy-Authorize header field containing a digest challenge, it will put the header field into a response generated from the request the server is processing and will send the reply. Upon reception of such a reply the user agent should compute credentials and retry the request. For more information regarding digest authentication see RFC2617, RFC3261 and RFC8760.

See the paragraph on [www\_challenge() parameters meaning](#www_challenge_params) for the description of the parameters.

This function can be used from REQUEST\_ROUTE.

**Example�1.12.�proxy\_challenge usage**

...
$var(secure\_algorithms) = "sha-256,sha-512-256";
...
if (!proxy\_authorize("", "subscriber")) {
...
	proxy\_challenge("", "auth", $var(secure\_algorithms));  # Realm will be autogenerated
							       # MD5 won't be allowed
}
...

  

### 1.5.3.� `consume_credentials()`

This function removes previously authorized credentials from the message being processed by the server. That means that the downstream message will not contain credentials there were used by this server. This ensures that the proxy will not reveal information about credentials used to downstream elements and also the message will be a little bit shorter. The function must be called after `www_authorize` or `proxy_authorize`.

This function can be used from REQUEST\_ROUTE.

**Example�1.13.�consume\_credentials example**

...
if (www\_authorize("", "subscriber")) {
    consume\_credentials();
}
...

  

### 1.5.4.� `is_rpid_user_e164()`

The function checks if the SIP URI received from the database or radius server and will potentially be used in Remote-Party-ID header field contains an E164 number (+followed by up to 15 decimal digits) in its user part. Check fails, if no such SIP URI exists (i.e. radius server or database didn't provide this information).

This function can be used from REQUEST\_ROUTE.

**Example�1.14.�is\_rpid\_user\_e164 usage**

...
if (is\_rpid\_user\_e164()) {
    # do something here
}
...

  

### 1.5.5.� `append_rpid_hf()`

Appends to the message a Remote-Party-ID header that contains header 'Remote-Party-ID: ' followed by the saved value of the SIP URI received from the database or radius server followed by the value of module parameter radius\_rpid\_suffix. The function does nothing if no saved SIP URI exists.

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE.

**Example�1.15.�append\_rpid\_hf usage**

...
append\_rpid\_hf();  # Append Remote-Party-ID header field
...

  

### 1.5.6.� `append_rpid_hf(prefix, suffix)`

This function is the same as [append\_rpid\_hf()](#func_append_rpid_hf_no_params "1.5.5.� append_rpid_hf()"). The only difference is that it accepts two parameters--prefix and suffix to be added to Remote-Party-ID header field. This function ignores rpid\_prefix and rpid\_suffix parameters, instead of that allows to set them in every call.

Meaning of the parameters is as follows:

*   _prefix_ (string) - Prefix of the Remote-Party-ID URI. The string will be added at the beginning of body of the header field, just before the URI.
    
*   _suffix_ (string) - Suffix of the Remote-Party-ID header field. The string will be appended at the end of the header field. It can be used to set various URI parameters, for example.
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE.

**Example�1.16.�append\_rpid\_hf(prefix, suffix) usage**

...
# Append Remote-Party-ID header field
append\_rpid\_hf("", ";party=calling;id-type=subscriber;screen=yes");
...

  

### 1.5.7.� `pv_www_authorize(realm)`

The function verifies credentials according to [RFC2617](http://www.ietf.org/rfc/rfc2617.txt). If the credentials are verified successfully then the function will succeed and mark the credentials as authorized (marked credentials can be later used by some other functions). If the function was unable to verify the credentials for some reason then it will fail and the script should call `www_challenge` which will challenge the user again.

Negative codes may be interpreted as follows:

*   _\-5 (generic error)_ - some generic error occurred and no reply was sent out;
    
*   _\-4 (no credentials)_ - credentials were not found in request;
    
*   _\-3 (stale nonce)_ - stale nonce;
    
*   _\-2 (invalid password)_ - valid user, but wrong password;
    
*   _\-1 (invalid user)_ - authentication user does not exist.
    

Meaning of the parameters is as follows:

*   _realm_ (string) - Realm is an opaque string that the user agent should present to the user so he can decide what username and password to use. Usually this is domain of the host the server is running on.
    
    If an empty string “” is used then the server will generate it from the request. In case of REGISTER requests To header field domain will be used (because this header field represents a user being registered), for all other messages From header field domain will be used.
    

This function can be used from REQUEST\_ROUTE.

**Example�1.17.�`pv_www_authorize` usage**

...
$var(username)="abc";
$var(password)="xyz";
if (!pv\_www\_authorize("opensips.org")) {
	www\_challenge("opensips.org", "auth");
}
...

  

### 1.5.8.� `pv_proxy_authorize(realm)`

The function verifies credentials according to [RFC2617](http://www.ietf.org/rfc/rfc2617.txt). If the credentials are verified successfully then the function will succeed and mark the credentials as authorized (marked credentials can be later used by some other functions). If the function was unable to verify the credentials for some reason then it will fail and the script should call `proxy_challenge` which will challenge the user again. For more about the negative return codes, see the above function.

Meaning of the parameters is as follows:

*   _realm_ (string) - Realm is an opaque string that the user agent should present to the user so he can decide what username and password to use. Usually this is domain of the host the server is running on.
    
    If an empty string “” is used then the server will generate it from the request. From header field domain will be used as realm.
    

This function can be used from REQUEST\_ROUTE.

**Example�1.18.�pv\_proxy\_authorize usage**

...
$var(username)="abc";
$var(password)="xyz";
if (!pv\_proxy\_authorize("")) {
	proxy\_challenge("", "auth");  # Realm will be autogenerated
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

Jan Janak ([@janakj](https://github.com/janakj))

271

107

7717

6060

2.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

50

34

704

615

3.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

39

21

1136

476

4.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

33

13

587

862

5.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

29

22

214

294

6.

Jiri Kuthan ([@jiriatipteldotorg](https://github.com/jiriatipteldotorg))

26

19

660

51

7.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

18

13

212

169

8.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

18

10

420

236

9.

Anca Vamanu

12

5

497

77

10.

Henning Westerholt ([@henningw](https://github.com/henningw))

11

8

107

100

  

**All remaining contributors**: Edson Gellert Schubert, Andrei Pelinescu-Onciul, Juha Heinanen ([@juha-h](https://github.com/juha-h)), Dan Pascu ([@danpascu](https://github.com/danpascu)), Zero King ([@l2dy](https://github.com/l2dy)), Sergio Gutierrez, Anatoly Pidruchny, Konstantin Bokarius, Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Walter Doekes ([@wdoekes](https://github.com/wdoekes)), Nils Ohlmeier, Dusan Klinec ([@ph4r05](https://github.com/ph4r05)).

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

Mar 2014 - Dec 2025

2.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Jun 2011 - Feb 2024

3.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Jan 2005 - Mar 2023

4.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Jun 2022

5.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Dec 2002 - Jan 2021

6.

Zero King ([@l2dy](https://github.com/l2dy))

Mar 2020 - Mar 2020

7.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

8.

Dusan Klinec ([@ph4r05](https://github.com/ph4r05))

Dec 2015 - Dec 2015

9.

Walter Doekes ([@wdoekes](https://github.com/wdoekes))

Feb 2014 - Feb 2014

10.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

Mar 2012 - Mar 2012

  

**All remaining contributors**: Sergio Gutierrez, Dan Pascu ([@danpascu](https://github.com/danpascu)), Anca Vamanu, Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Henning Westerholt ([@henningw](https://github.com/henningw)), Juha Heinanen ([@juha-h](https://github.com/juha-h)), Anatoly Pidruchny, Jan Janak ([@janakj](https://github.com/janakj)), Jiri Kuthan ([@jiriatipteldotorg](https://github.com/jiriatipteldotorg)), Andrei Pelinescu-Onciul, Nils Ohlmeier.

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Maksym Sobolyev ([@sobomax](https://github.com/sobomax)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Sergio Gutierrez, Dan Pascu ([@danpascu](https://github.com/danpascu)), Anca Vamanu, Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Henning Westerholt ([@henningw](https://github.com/henningw)), Jan Janak ([@janakj](https://github.com/janakj)).

_Documentation Copyrights:_

Copyright � 2005 Voice Sistem SRL

Copyright � 2002-2003 FhG FOKUS