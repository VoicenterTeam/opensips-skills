# Auth\_aka Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5849232)

2.2. [Most recently active contributors(1) to this module](#idp5921840)

**List of Examples**

1.1. [`default_av_mgm` parameter usage](#idp248352)

1.2. [`default_qop` parameter usage](#idp164896)

1.3. [`default_algorithm` parameter usage](#idp171088)

1.4. [`hash_size` parameter usage](#idp5516384)

1.5. [`sync_timeout` parameter usage](#idp5521584)

1.6. [`async_timeout` parameter usage](#idp5527328)

1.7. [`unused_timeout` parameter usage](#idp5532208)

1.8. [`pending_timeout` parameter usage](#idp5537152)

1.9. [`aka_www_authorize` usage](#idp5555024)

1.10. [`aka_proxy_authorize` usage](#idp5572384)

1.11. [aka\_www\_challenge usage](#idp5599936)

1.12. [`aka_proxy_challenge` usage](#idp5606432)

1.13. [`aka_av_add` usage](#idp5619616)

1.14. [`aka_av_drop` usage](#idp5629152)

1.15. [`aka_av_drop_all` usage](#idp5638112)

1.16. [`aka_av_fail` usage](#idp5647712)

1.17. [`aka_av_add` usage](#idp5660896)

1.18. [`aka_av_drop` usage](#idp5669088)

1.19. [`aka_av_drop_all` usage](#idp5676192)

1.20. [`aka_av_drop` usage](#idp5685264)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This module contains functions that are used to perform digest authentication using the AKA (Authentication and Key Agreement) security protocol. This mechanism is being used in IMS networks to provide mutual authentication between the UE (device) and the 3G/4G/5G network.

The AKA protocol establishes a set of security keys, called authentication vectors (or AVs), and uses them to generate the digest challenge, as well as for computing the digest result and authenticating the UE. AVs are exchanged over a separate communication channel.

Although the AKA protocol also requires to use the AVs to establish a secure channel between the UE and the network (by means of IPSec tunnels), this module does not handle that part - it just performs the authentication of the user and passes along the cyphering and integrity keys in the Authorization header, according to the _ETSI TS 129 229_ specifications. These are later on picked up by other components (such as P-CSCFs) to establish the secure channel.

## 1.2.�Authentication Vectors

Authentication Vectors (or AVs) consist of a set of five parameter (RAND, AUTN, XRES, CK, IK) that are being used for mutual authentication. As these need to be exchanged between the device (UE) and network through a different channel (i.e. Diameter Cx interface in LTE networks), the module does not provide any means to fetch the AV information. It does, however, provide a generic interface (called AV Manage Interface) to store AVs (that are being fetched by other modules/channels), manage them and use them in the digest authentication algorithm.

Basic AV operations that the module performs:

*   Ask for a new AV to be fetched for a specific user identity
    
*   Manage an AV lifetime, including reuses
    
*   Mark an AV as being used in a digest challeng
    
*   Invalidate or discard an AV (due to various reasons)
    

A module that implements the AV Manage Interface (called AV Manager) should be able to fetch all five parameters of an AV, and push them in the AV Storage.

## 1.3.�Supported algorithms

The current implementation only supports the AKAv1 algorithms, with the associated hashing functions (such as MD5, SHA-256). In the challenge message, we send, one can advertise other algorithms as well, but the response cannot be handled by this module, and an appropriate error will be returned.

## 1.4.�Dependencies

### 1.4.1.�OpenSIPS Modules

The module depends on the following modules (in the other words the listed modules must be loaded before this module):

*   _auth_ -- Authentication framework
    
*   _AV manage module_ -- at least one module that fetches AVs and pushes them in the AV storage
    

### 1.4.2.�External Libraries or Applications

This module does not depend on any external library.

## 1.5.�Exported Parameters

### 1.5.1.�`default_av_mgm` (string)

The default AV Manager used in case the functions do not provide them explicitly.

**Example�1.1.�`default_av_mgm` parameter usage**

		
modparam("auth\_aka", "default\_av\_mgm", "diameter") # fetch AVs through the Cx interface
		

  

### 1.5.2.�`default_qop` (string)

The default qop parameter used during challenge, if the functions do not provide them explicitly.

Default value is _auth_.

**Example�1.2.�`default_qop` parameter usage**

		
modparam("auth\_aka", "default\_qop", "auth,auth-int")
		

  

### 1.5.3.�`default_algorithm` (string)

The default algorithm to be advertise during challenge, if the functions do not provide them explicitly. _Note_ that at least one of the algorithms provided should be an AKA one, otherwise it makes no sense to use this module.

Default value is _AKAv1-MD5_.

_WARNING:_ only AKAv1\* algorithms are currently supported.

**Example�1.3.�`default_algorithm` parameter usage**

		
modparam("auth\_aka", "default\_algorithm", "AKAv2-MD5")
		

  

### 1.5.4.�`hash_size` (integer)

The size of the hash that stores the AVs for each user. Must be a power of 2 number.

Default value is _4096_.

**Example�1.4.�`hash_size` parameter usage**

		
modparam("auth\_aka", "hash\_size", 1024)
		

  

### 1.5.5.�`sync_timeout` (integer)

The amount of milliseconds a synchronous call should wait for getting an authentication vector.

Must be a positive value. A value of _0_ indicates to wait indefinitely.

Default value is _100_ ms.

**Example�1.5.�`sync_timeout` parameter usage**

		
modparam("auth\_aka", "sync\_timeout", 200)
		

  

### 1.5.6.�`async_timeout` (integer)

The amount of milliseconds an asynchronous call should wait for getting an authentication vector.

Must be a positive value, greater than 0.

_NOTE:_ the current timeout mechanism only has seconds granularity, therefore you should configure this parameter as a multiple of 1000.

Default value is _1000_ ms.

**Example�1.6.�`async_timeout` parameter usage**

modparam("auth\_aka", "async\_timeout", 2000)
		

  

### 1.5.7.�`unused_timeout` (integer)

The amount of seconds an authentication vector that has not been used can stay in memory. Once this timeout is reached, the authentication vector is removed.

Must be a positive value, greater than 0.

Default value is _60_ s.

**Example�1.7.�`unused_timeout` parameter usage**

modparam("auth\_aka", "unused\_timeout", 120)
		

  

### 1.5.8.�`unused_timeout` (integer)

The amount of seconds an authentication vector that is being used in the authentication process shall stay in memory. Once this timeout is reached, the authentication vector is removed, and the authentication using it will fail.

Must be a positive value, greater than 0.

Default value is _30_ s.

**Example�1.8.�`pending_timeout` parameter usage**

modparam("auth\_aka", "pending\_timeout", 10)
		

  

## 1.6.�Exported Functions

### 1.6.1.�`aka_www_authorize([realm]])`

The function verifies credentials according to [RFC3310](http://www.ietf.org/rfc/rfc3310.txt), by using an authentication vector priorly allocated by an `aka_www_challenge()` call, using the _av\_mgm_ manager. If the credentials are verified successfully the function will succeed, otherwise it will fail with an appropriate error code, as follows:

*   _\-6 (sync request)_ - the _auts_ parameter was was present, thus a sync was requested;
    
*   _\-5 (generic error)_ - some generic error occurred and no reply was sent out;
    
*   _\-4 (no credentials)_ - credentials were not found in request;
    
*   _\-3 (unknown nonce)_ - authentication vector with the corresponding nonce was not found;
    
*   _\-2 (invalid password)_ - password does not match the authentication vector;
    
*   _\-1 (invalid username)_ - no username found in the Authorize header;
    

In case the function succeeds, the _WWW-Authenticate_ header is being added to the reply, containing the challenge information, as well as the _Integrity-Key_ and the _Confidentiality-Key_ values associated to the AV being used.

Meaning of the parameters is as follows:

*   _realm (string)_ - Realm is a opaque string that the user agent should present to the user so he can decide what username and password to use. This is usually one of the domains the proxy is responsible for. If an empty string “” is used then the server will generate realm from host part of From header field URI.
    

If the credentials are verified successfully then the function will succeed and mark the credentials as authorized (marked credentials can be later used by some other functions).

This function can be used from REQUEST\_ROUTE.

**Example�1.9.�`aka_www_authorize` usage**

		
...
if (!aka\_www\_authorize("diameter", "siphub.com"))
	aka\_www\_challenge("diameter", "siphub.com", "auth");
...

  

### 1.6.2.�`aka_proxy_authorize([realm]])`

The function behaves the same as [aka\_www\_authorize()](#func_aka_www_authorize "1.6.1.�aka_www_authorize([realm]])"), but it authenticates the user from a proxy perspective. It receives the same parameters, with the same meaning, and returns the same values.

This function can be used from REQUEST\_ROUTE.

**Example�1.10.�`aka_proxy_authorize` usage**

		
...
if (!aka\_proxy\_authorize("siphub.com"))
	aka\_proxy\_challenge("diameter", "siphub.com", "auth");
...

  

### 1.6.3.�`aka_www_challenge([av_mgm[, realm[ ,qop[, alg]]]])`

The function challenges a user agent. It fetches an authentication vector for each algorigthm used through the _av\_mgm_ Manager and generate one or more WWW-Authenticate header fields containing digest challenges. It will put the header field(s) into a response generated from the request the server is processing and will send the reply. Upon reception of such a reply the user agent should compute credentials using the used authentication vector annd retry the request. For more information regarding digest authentication see RFC2617, RFC3261, RFC3310 and RFC8760.

Meaning of the parameters is as follows:

*   _av\_mgm_ (string, optional) - the AV Manager to be used for this challenge, in case an AV is not already available for the challenged user identity. In case it is missing the value of the [default\_av\_mgm](#param_default_av_mgm "1.5.1.�default_av_mgm (string)") is being used.
    
    _realm_ (string) - Realm is an opaque string that the user agent should present to the user so it can decide what username and password to use. Usually this is domain of the host the server is running on. If missing, the value of the _From domain_ is being used.
    
*   _qop_ (string, optional) - Value of this parameter can be either “auth”, “auth-int” or both (separated by _,_). When this parameter is set the server will put a qop parameter in the challenge. It is recommended to use the qop parameter, however there are still some user agents that cannot handle qop properly so we made this optional. On the other hand there are still some user agents that cannot handle request without a qop parameter too. If missing, the value of the [default\_qop](#param_default_qop "1.5.2.�default_qop (string)") is being used.
    
*   _algorithms_ (string, optional) - Value of this parameter is a comma-separated list of digest algorithms to be offered for the UAC to use for authentication. Possible values are:
    
    *   “AKAv1-MD5”
    *   “AKAv1-MD5-sess”
    *   “AKAv1-SHA-256”
    *   “AKAv1-SHA-256-sess”
    *   “AKAv1-SHA-512-256”
    *   “AKAv1-SHA-512-256-sess”
    *   “AKAv2-MD5”
    *   “AKAv2-MD5-sess”
    *   “AKAv2-SHA-256”
    *   “AKAv2-SHA-256-sess”
    *   “AKAv2-SHA-512-256”
    *   “AKAv2-SHA-512-256-sess”
    
    When the value is empty or not set, the only offered digest the value of the [default\_algorithm](#param_default_algorithm "1.5.3.�default_algorithm (string)") is being used.
    

Possible return codes:

*   _\-1_ - generic parsing error, generated when there is not enoough data to build the challange
    
*   _\-2_ - no AV vector could not be fetched
    
*   _\-3_ - authentication headers could not be built
    
*   _\-5_ - a reply could not be sent
    
*   _positive_ - the number of successful chalanges being sent in the reply; this value can be lower than the number of algorithms being requested in case there was a timeout waiting for some AVs.
    

This function can be used from REQUEST\_ROUTE.

**Example�1.11.�aka\_www\_challenge usage**

...
if (!aka\_www\_authorize("siphub.com")) {
	aka\_www\_challenge(,"siphub.com", "auth-int", "AKAv1-MD5");
}
...

  

### 1.6.4.�`aka_proxy_challenge([realm]])`

The function behaves the same as [aka\_www\_challenge()](#func_aka_www_challenge "1.6.3.�aka_www_challenge([av_mgm[, realm[ ,qop[, alg]]]])"), but it challenges the user from a proxy perspective. It receives the same parameters, with the same meaning, the only difference being that in case of the _realm_ is missing, then it is taken from the the _To domain_, rather than from _From domain_. The header added is _Proxy-Authenticate_, rather than _WWW-Authenticate_ The rest of the parameters, behavior, as well as return values are the same.

This function can be used from REQUEST\_ROUTE.

**Example�1.12.�`aka_proxy_challenge` usage**

		
...
if (!aka\_proxy\_authorize("siphub.com"))
	aka\_proxy\_challenge(,"siphub.com", "auth");
...

  

### 1.6.5.�`aka_av_add(public_identity, private_identity, authenticate, authorize, confidentiality_key, integrity_key[, algorithms])`

Adds an authentication vector for the user identitied by _public\_identity_ and _private\_identity_.

Meaning of the parameters is as follows:

*   _public\_identity_ (string) - the public identity (IMPU) of the user to add authentication vector for.
    
*   _private\_identity_ (string) - the private identity (IMPI) of the user to add authentication vector for.
    
*   _authenticate_ (string) - the concatenation of the authentication challenge RAND and the token AUTN, encoded in hexa format.
    
*   _authorize_ (string) - the authorization string (XRES) used for authorizing the user, encoded in hexa format.
    
*   _confidentiality\_key_ (string) - the Confidentiality-Key used in the AKA IPSec process, encoded in hexa format.
    
*   _integrity\_key_ (string) - the Integrity-Key used in the AKA IPSec process, encoded in hexa format.
    
*   _algorithms_ (string, optional) - AKA algorithms this AV should be used for. If missing, the AV can be used for any AKA algorithm.
    

This function can be used from any route.

**Example�1.13.�`aka_av_add` usage**

		
...
aka\_av\_add("sip:test@siphub.com", "test@siphub.com",
			"KFQ/MpR3cE3V9PxucEQS5KED8uUNYIAALFyk59sIJI4=", /\* authenticate \*/
			"00000262c0000014000028af2d6398cbe26eea69", /\* authorize \*/
			"db7f8c4a58e17083974bba3b936d34c4", /\* ck \*/
			"6151667b9ef815c1dcb87473685f062a"  /\* ik \*/);
...

  

### 1.6.6.�`aka_av_drop(public_identity, private_identity, authenticate)`

Drops the authentication vector corresponding to the _authenticate/nonce_ value for an user identitied by _public\_identity_ and _private\_identity_.

Meaning of the parameters is as follows:

*   _public\_identity_ (string) - the public identity (IMPU) of the user to drop authentication vector for.
    
*   _private\_identity_ (string) - the private identity (IMPI) of the user to drop authentication vector for.
    
*   _authenticate_ (string) - the authenticate/nonce that identifies the authentication vector to be dropped.
    

This function can be used from any route.

**Example�1.14.�`aka_av_drop` usage**

		
...
aka\_av\_drop("sip:test@siphub.com", "test@siphub.com",
			"KFQ/MpR3cE3V9PxucEQS5KED8uUNYIAALFyk59sIJI4=");
...

  

### 1.6.7.�`aka_av_drop_all(public_identity, private_identity[, count])`

Drops all authentication vectors for an user identitied by _public\_identity_ and _private\_identity_. This function is useful when a synchronization must be done.

Meaning of the parameters is as follows:

*   _public\_identity_ (string) - the public identity (IMPU) of the user to drop authentication vectors for.
    
*   _private\_identity_ (string) - the private identity (IMPI) of the user to drop authentication vectors for.
    
*   _count_ (variable, optional) - a variable to return the number of authentication vectors dropped.
    

This function can be used from any route.

**Example�1.15.�`aka_av_drop_all` usage**

		
...
aka\_av\_drop\_all("sip:test@siphub.com", "test@siphub.com", $var(count));
...

  

### 1.6.8.�`aka_av_fail(public_identity, private_identity[, count])`

Marks the engine that an authentication vector query for a user has failed, unlocking the processing of the message.

_Note:_ this function is useful when you know that fetching a new authentication vector is not possible (due to various reasons) - calling it will resume the message procesing, using only the available AVs fetched so far.

Meaning of the parameters is as follows:

*   _public\_identity_ (string) - the public identity (IMPU) of the user to drop authentication vectors for.
    
*   _private\_identity_ (string) - the private identity (IMPI) of the user to drop authentication vectors for.
    
*   _count_ (integer, optional) - the number of authentication vectors that failed. If missing, _1_ is considered.
    

This function can be used from any route.

**Example�1.16.�`aka_av_fail` usage**

...
aka\_av\_fail("sip:test@siphub.com", "test@siphub.com", 3);
...

  

## 1.7.�Exported MI Functions

### 1.7.1.�`aka_av_add`

Adds an Authentication Vector through the MI interface.

Parameters:

*   _public\_identity_ (string) - the public identity (IMPU) of the user to add authentication vector for.
    
*   _private\_identity_ (string) - the private identity (IMPI) of the user to add authentication vector for.
    
*   _authenticate_ (string) - the concatenation of the authentication challenge RAND and the token AUTN, encoded in hexa format.
    
*   _authorize_ (string) - the authorization string (XRES) used for authorizing the user, encoded in hexa format.
    
*   _confidentiality\_key_ (string) - the Confidentiality-Key used in the AKA IPSec process, encoded in hexa format.
    
*   _integrity\_key_ (string) - the Integrity-Key used in the AKA IPSec process, encoded in hexa format.
    
*   _algorithms_ (string, optional) - AKA algorithms this AV should be used for. If missing, the AV can be used for any AKA algorithm.
    

**Example�1.17.� `aka_av_add` usage**

...
## adds an AKA AV
$ opensips-cli -x mi aka\_av\_add \\
				sip:test@siphub.com
				test@siphub.com
				KFQ/MpR3cE3V9PxucEQS5KED8uUNYIAALFyk59sIJI4=
				00000262c0000014000028af2d6398cbe26eea69
				db7f8c4a58e17083974bba3b936d34c4
				6151667b9ef815c1dcb87473685f062a
...
			

  

### 1.7.2.�`aka_av_drop`

Invalidates an Authentication Vector of an user identified by its authenticate value.

Parameters:

*   _public\_identity_ (string) - the public identity (IMPU) of the user to add authentication vector for.
    
*   _private\_identity_ (string) - the private identity (IMPI) of the user to add authentication vector for.
    
*   _authenticate_ (string) - the authenticate/nonce to indentify the authentication vector.
    

**Example�1.18.� `aka_av_drop` usage**

...
## adds an AKA AV
$ opensips-cli -x mi aka\_av\_drop \\
				sip:test@siphub.com
				test@siphub.com
				KFQ/MpR3cE3V9PxucEQS5KED8uUNYIAALFyk59sIJI4=
...
			

  

### 1.7.3.�`aka_av_drop_all`

Invalidates all Authentication Vectors of an user through the MI interface.

Parameters:

*   _public\_identity_ (string) - the public identity (IMPU) of the user to drop authentication vectors for.
    
*   _private\_identity_ (string) - the private identity (IMPI) of the user to drop authentication vectors for.
    

**Example�1.19.� `aka_av_drop_all` usage**

...
## adds an AKA AV
$ opensips-cli -x mi aka\_av\_drop\_all \\
				sip:test@siphub.com
				test@siphub.com
...
			

  

### 1.7.4.�`aka_av_fail`

Indicates the fact that the fetching of an authentication vector has failed, unlocking the processing of the message.

_Note:_ this function is useful when you know that fetching a new authentication vector is not possible (due to various reasons) - calling it will resume the message procesing, using only the available AVs fetched so far.

Parameters:

*   _public\_identity_ (string) - the public identity (IMPU) of the user to add authentication vector for.
    
*   _private\_identity_ (string) - the private identity (IMPI) of the user to add authentication vector for.
    
*   _count_ (integer, optional) - the number of authentication vectors failures.
    

**Example�1.20.� `aka_av_drop` usage**

...
## adds an AKA AV
$ opensips-cli -x mi aka\_av\_drop \\
				sip:test@siphub.com
				test@siphub.com
				KFQ/MpR3cE3V9PxucEQS5KED8uUNYIAALFyk59sIJI4=
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

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

54

20

3378

295

2.

Alexandra Titoc

4

2

2

2

3.

LarryLaffer-dev

3

1

26

1

4.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

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

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Feb 2024 - Jul 2025

2.

LarryLaffer-dev

Mar 2025 - Mar 2025

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Sep 2024 - Sep 2024

4.

Alexandra Titoc

Sep 2024 - Sep 2024

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)).

_Documentation Copyrights:_

Copyright � 2024 OpenSIPS Solutions;