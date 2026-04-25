# auth_aka Module Reference
<!-- generated-from: data/3.6/modules/auth_aka.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 auth_aka module. Read this file when configuring or debugging the auth_aka module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Exported MI Functions](#exported-mi-functions)
- [Configuration Examples](#configuration-examples)

## Overview

This module contains functions that are used to perform digest authentication using the AKA (Authentication and Key Agreement) security protocol. This mechanism is being used in IMS networks to provide mutual authentication between the UE (device) and the 3G/4G/5G network.

## How It Works

The AKA protocol establishes a set of security keys, called authentication vectors (or AVs), and uses them to generate the digest challenge, as well as for computing the digest result and authenticating the UE. AVs are exchanged over a separate communication channel. Although the AKA protocol also requires to use the AVs to establish a secure channel between the UE and the network (by means of IPSec tunnels), this module does not handle that part - it just performs the authentication of the user and passes along the cyphering and integrity keys in the Authorization header, according to the _ETSI TS 129 229_ specifications. These are later on picked up by other components (such as P-CSCFs) to establish the secure channel.

Authentication Vectors (or AVs) consist of a set of five parameter (RAND, AUTN, XRES, CK, IK) that are being used for mutual authentication. As these need to be exchanged between the device (UE) and network through a different channel (i.e. Diameter Cx interface in LTE networks), the module does not provide any means to fetch the AV information. It does, however, provide a generic interface (called AV Manage Interface) to store AVs (that are being fetched by other modules/channels), manage them and use them in the digest authentication algorithm.

Basic AV operations that the module performs:
*   Ask for a new AV to be fetched for a specific user identity
*   Manage an AV lifetime, including reuses
*   Mark an AV as being used in a digest challeng
*   Invalidate or discard an AV (due to various reasons)

A module that implements the AV Manage Interface (called AV Manager) should be able to fetch all five parameters of an AV, and push them in the AV Storage.

## Dependencies

### OpenSIPs Modules

- `AV manage module` — at least one module that fetches AVs and pushes them in the AV storage
- `auth` — Authentication framework

### External Libraries

None.

## Exported Parameters

### `async_timeout` (integer)

The amount of milliseconds an asynchronous call should wait for getting an authentication vector.

*Default value is 1000.*

*Valid range: 1 or above.*

**Notes:** the current timeout mechanism only has seconds granularity, therefore you should configure this parameter as a multiple of 1000.

**Example.** 2000.

```opensips
modparam("auth\_aka", "async\_timeout", 2000)
```
### `default_algorithm` (string)

The default algorithm to be advertise during challenge, if the functions do not provide them explicitly. Note that at least one of the algorithms provided should be an AKA one, otherwise it makes no sense to use this module.

*Default value is AKAv1-MD5.*

**Notes:** only AKAv1* algorithms are currently supported.

**Example.** AKAv2-MD5.

```opensips
modparam("auth\_aka", "default\_algorithm", "AKAv2-MD5")
```
### `default_av_mgm` (string)

The default AV Manager used in case the functions do not provide them explicitly.

**Example.** diameter.

```opensips
modparam("auth\_aka", "default\_av\_mgm", "diameter") # fetch AVs through the Cx interface
```
### `default_qop` (string)

The default qop parameter used during challenge, if the functions do not provide them explicitly.

*Default value is auth.*

**Example.** auth,auth-int.

```opensips
modparam("auth\_aka", "default\_qop", "auth,auth-int")
```
### `hash_size` (integer)

The size of the hash that stores the AVs for each user. Must be a power of 2 number.

*Default value is 4096.*

**Notes:** Must be a power of 2 number.

**Example.** 1024.

```opensips
modparam("auth\_aka", "hash\_size", 1024)
```
### `pending_timeout` (integer)

The amount of seconds an authentication vector that is being used in the authentication process shall stay in memory. Once this timeout is reached, the authentication vector is removed, and the authentication using it will fail.

*Default value is 30.*

*Valid range: 1 or above.*

**Example.** 10.

```opensips
modparam("auth\_aka", "pending\_timeout", 10)
```
### `sync_timeout` (integer)

The amount of milliseconds a synchronous call should wait for getting an authentication vector.

*Default value is 100.*

*Valid range: 0 or above.*

**Notes:** A value of 0 indicates to wait indefinitely.

**Example.** 200.

```opensips
modparam("auth\_aka", "sync\_timeout", 200)
```
### `unused_timeout` (integer)

The amount of seconds an authentication vector that has not been used can stay in memory. Once this timeout is reached, the authentication vector is removed.

*Default value is 60.*

*Valid range: 1 or above.*

**Example.** 120.

```opensips
modparam("auth\_aka", "unused\_timeout", 120)
```

## Exported Functions

### `aka_av_add(public_identity, private_identity, authenticate, authorize, confidentiality_key, integrity_key[, algorithms])`

Adds an authentication vector for the user identitied by public_identity and private_identity.

**Parameters:**

- `algorithms` *(string, optional)* — AKA algorithms this AV should be used for. If missing, the AV can be used for any AKA algorithm.
- `authenticate` *(string, required)* — The concatenation of the authentication challenge RAND and the token AUTN, encoded in hexa format.
- `authorize` *(string, required)* — The authorization string (XRES) used for authorizing the user, encoded in hexa format.
- `confidentiality_key` *(string, required)* — The Confidentiality-Key used in the AKA IPSec process, encoded in hexa format.
- `integrity_key` *(string, required)* — The Integrity-Key used in the AKA IPSec process, encoded in hexa format.
- `private_identity` *(string, required)* — The private identity (IMPI) of the user to add authentication vector for.
- `public_identity` *(string, required)* — The public identity (IMPU) of the user to add authentication vector for.

**Usable from:** any route

**Example.** aka_av_add usage.

```opensips
...
aka_av_add("sip:test@siphub.com", "test@siphub.com",
			"KFQ/MpR3cE3V9PxucEQS5KED8uUNYIAALFyk59sIJI4=", /* authenticate */
			"00000262c0000014000028af2d6398cbe26eea69", /* authorize */
			"db7f8c4a58e17083974bba3b936d34c4", /* ck */
			"6151667b9ef815c1dcb87473685f062a"  /* ik */);
...
```

### `aka_av_drop(public_identity, private_identity, authenticate)`

Drops the authentication vector corresponding to the authenticate/nonce value for an user identitied by public_identity and private_identity.

**Parameters:**

- `authenticate` *(string, required)* — The authenticate/nonce that identifies the authentication vector to be dropped.
- `private_identity` *(string, required)* — The private identity (IMPI) of the user to drop authentication vector for.
- `public_identity` *(string, required)* — The public identity (IMPU) of the user to drop authentication vector for.

**Usable from:** any route

**Example.** aka_av_drop usage.

```opensips
...
aka_av_drop("sip:test@siphub.com", "test@siphub.com",
			"KFQ/MpR3cE3V9PxucEQS5KED8uUNYIAALFyk59sIJI4=");
...
```

### `aka_av_drop_all(public_identity, private_identity[, count])`

Drops all authentication vectors for an user identitied by public_identity and private_identity. This function is useful when a synchronization must be done.

**Parameters:**

- `count` *(variable, optional)* — A variable to return the number of authentication vectors dropped.
- `private_identity` *(string, required)* — The private identity (IMPI) of the user to drop authentication vectors for.
- `public_identity` *(string, required)* — The public identity (IMPU) of the user to drop authentication vectors for.

**Usable from:** any route

**Example.** aka_av_drop_all usage.

```opensips
...
aka_av_drop_all("sip:test@siphub.com", "test@siphub.com", $var(count));
...
```

### `aka_av_fail(public_identity, private_identity[, count])`

Marks the engine that an authentication vector query for a user has failed, unlocking the processing of the message. Note: this function is useful when you know that fetching a new authentication vector is not possible (due to various reasons) - calling it will resume the message procesing, using only the available AVs fetched so far.

**Parameters:**

- `count` *(integer, optional)* — The number of authentication vectors that failed.
- `private_identity` *(string, required)* — The private identity (IMPI) of the user to drop authentication vectors for.
- `public_identity` *(string, required)* — The public identity (IMPU) of the user to drop authentication vectors for.

**Usable from:** any route

**Example.** aka_av_fail usage.

```opensips
...
aka_av_fail("sip:test@siphub.com", "test@siphub.com", 3);
...
```

### `aka_proxy_authorize([realm])`

The function behaves the same as aka_www_authorize(), but it authenticates the user from a proxy perspective. It receives the same parameters, with the same meaning, and returns the same values.

**Parameters:**

- `realm` *(string, optional)* — Realm is a opaque string that the user agent should present to the user so he can decide what username and password to use. This is usually one of the domains the proxy is responsible for. If an empty string “” is used then the server will generate realm from host part of From header field URI.

**Return codes:**

- `-6` — sync request
- `-5` — generic error
- `-4` — no credentials
- `-3` — unknown nonce
- `-2` — invalid password
- `-1` — invalid username
- `1` — success

**Usable from:** REQUEST_ROUTE

**Related:**

- `aka_proxy_challenge`
- `aka_www_authorize`

**Example.** aka_proxy_authorize usage.

```opensips
...
if (!aka_proxy_authorize("siphub.com"))
	aka_proxy_challenge("diameter", "siphub.com", "auth");
...
```

### `aka_proxy_challenge([av_mgm[, realm[, qop[, alg]]]])`

The function behaves the same as aka_www_challenge(), but it challenges the user from a proxy perspective. It receives the same parameters, with the same meaning, the only difference being that in case of the realm is missing, then it is taken from the the To domain, rather than from From domain. The header added is Proxy-Authenticate, rather than WWW-Authenticate. The rest of the parameters, behavior, as well as return values are the same.

**Parameters:**

- `algorithms` *(string, optional)* — Value of this parameter is a comma-separated list of digest algorithms to be offered for the UAC to use for authentication.
  - `AKAv1-MD5`
  - `AKAv1-MD5-sess`
  - `AKAv1-SHA-256`
  - `AKAv1-SHA-256-sess`
  - `AKAv1-SHA-512-256`
  - `AKAv1-SHA-512-256-sess`
  - `AKAv2-MD5`
  - `AKAv2-MD5-sess`
  - `AKAv2-SHA-256`
  - `AKAv2-SHA-256-sess`
  - `AKAv2-SHA-512-256`
  - `AKAv2-SHA-512-256-sess`
- `av_mgm` *(string, optional)* — The AV Manager to be used for this challenge, in case an AV is not already available for the challenged user identity.
- `qop` *(string, optional)* — Value of this parameter can be either “auth”, “auth-int” or both (separated by _,_). When this parameter is set the server will put a qop parameter in the challenge.
  - `auth`
  - `auth-int`
- `realm` *(string, optional)* — Realm is an opaque string that the user agent should present to the user so it can decide what username and password to use. Usually this is domain of the host the server is running on. If missing, it is taken from the To domain.

**Return codes:**

- `-1` — generic parsing error
- `-2` — no AV vector could be fetched
- `-3` — authentication headers could not be built
- `-5` — a reply could not be sent
- `positive` — the number of successful challenges being sent in the reply

**Usable from:** REQUEST_ROUTE

**Related:**

- `aka_www_challenge`

**Example.** aka_proxy_challenge usage.

```opensips
...
if (!aka_proxy_authorize("siphub.com"))
	aka_proxy_challenge(,"siphub.com", "auth");
...
```

### `aka_www_authorize([realm])`

The function verifies credentials according to RFC3310, by using an authentication vector priorly allocated by an aka_www_challenge() call, using the av_mgm manager. If the credentials are verified successfully the function will succeed, otherwise it will fail with an appropriate error code. In case the function succeeds, the WWW-Authenticate header is being added to the reply, containing the challenge information, as well as the Integrity-Key and the Confidentiality-Key values associated to the AV being used. If the credentials are verified successfully then the function will succeed and mark the credentials as authorized (marked credentials can be later used by some other functions).

**Parameters:**

- `realm` *(string, optional)* — Realm is a opaque string that the user agent should present to the user so he can decide what username and password to use. This is usually one of the domains the proxy is responsible for. If an empty string “” is used then the server will generate realm from host part of From header field URI.

**Return codes:**

- `-6` — sync request (the auts parameter was present, thus a sync was requested)
- `-5` — generic error (some generic error occurred and no reply was sent out)
- `-4` — no credentials (credentials were not found in request)
- `-3` — unknown nonce (authentication vector with the corresponding nonce was not found)
- `-2` — invalid password (password does not match the authentication vector)
- `-1` — invalid username (no username found in the Authorize header)
- `1` — success (credentials verified successfully)

**Usable from:** REQUEST_ROUTE

**Related:**

- `aka_www_challenge`

**Example.** aka_www_authorize usage.

```opensips
...
if (!aka_www_authorize("diameter", "siphub.com"))
	aka_www_challenge("diameter", "siphub.com", "auth");
...
```

### `aka_www_challenge([av_mgm[, realm[, qop[, alg]]]])`

The function challenges a user agent. It fetches an authentication vector for each algorigthm used through the av_mgm Manager and generate one or more WWW-Authenticate header fields containing digest challenges. It will put the header field(s) into a response generated from the request the server is processing and will send the reply. Upon reception of such a reply the user agent should compute credentials using the used authentication vector annd retry the request. For more information regarding digest authentication see RFC2617, RFC3261, RFC3310 and RFC8760.

**Parameters:**

- `algorithms` *(string, optional)* — Value of this parameter is a comma-separated list of digest algorithms to be offered for the UAC to use for authentication.
  - `AKAv1-MD5`
  - `AKAv1-MD5-sess`
  - `AKAv1-SHA-256`
  - `AKAv1-SHA-256-sess`
  - `AKAv1-SHA-512-256`
  - `AKAv1-SHA-512-256-sess`
  - `AKAv2-MD5`
  - `AKAv2-MD5-sess`
  - `AKAv2-SHA-256`
  - `AKAv2-SHA-256-sess`
  - `AKAv2-SHA-512-256`
  - `AKAv2-SHA-512-256-sess`
- `av_mgm` *(string, optional)* — The AV Manager to be used for this challenge, in case an AV is not already available for the challenged user identity.
- `qop` *(string, optional)* — Value of this parameter can be either “auth”, “auth-int” or both (separated by _,_). When this parameter is set the server will put a qop parameter in the challenge.
  - `auth`
  - `auth-int`
- `realm` *(string, optional)* — Realm is an opaque string that the user agent should present to the user so it can decide what username and password to use. Usually this is domain of the host the server is running on.

**Return codes:**

- `-1` — generic parsing error (generated when there is not enough data to build the challenge)
- `-2` — no AV vector could be fetched
- `-3` — authentication headers could not be built
- `-5` — a reply could not be sent
- `positive` — the number of successful challenges being sent in the reply; this value can be lower than the number of algorithms being requested in case there was a timeout waiting for some AVs

**Usable from:** REQUEST_ROUTE

**Example.** aka_www_challenge usage.

```opensips
...
if (!aka_www_authorize("siphub.com")) {
	aka_www_challenge(,"siphub.com", "auth-int", "AKAv1-MD5");
}
...
```

## Exported MI Functions

### `aka_av_add`

Adds an Authentication Vector through the MI interface.

**Parameters:**

- `algorithms` *(string, optional)* — AKA algorithms this AV should be used for. If missing, the AV can be used for any AKA algorithm.
- `authenticate` *(string, required)* — the concatenation of the authentication challenge RAND and the token AUTN, encoded in hexa format.
- `authorize` *(string, required)* — the authorization string (XRES) used for authorizing the user, encoded in hexa format.
- `confidentiality_key` *(string, required)* — the Confidentiality-Key used in the AKA IPSec process, encoded in hexa format.
- `integrity_key` *(string, required)* — the Integrity-Key used in the AKA IPSec process, encoded in hexa format.
- `private_identity` *(string, required)* — the private identity (IMPI) of the user to add authentication vector for.
- `public_identity` *(string, required)* — the public identity (IMPU) of the user to add authentication vector for.

**Example.** `aka_av_add` usage

```bash
## adds an AKA AV
$ opensips-cli -x mi aka_av_add \
					sip:test@siphub.com
					test@siphub.com
					KFQ/MpR3cE3V9PxucEQS5KED8uUNYIAALFyk59sIJI4=
					00000262c0000014000028af2d6398cbe26eea69
					db7f8c4a58e17083974bba3b936d34c4
					6151667b9ef815c1dcb87473685f062a
```

### `aka_av_drop`

Invalidates an Authentication Vector of an user identified by its authenticate value.

**Parameters:**

- `authenticate` *(string, required)* — the authenticate/nonce to indentify the authentication vector.
- `private_identity` *(string, required)* — the private identity (IMPI) of the user to add authentication vector for.
- `public_identity` *(string, required)* — the public identity (IMPU) of the user to add authentication vector for.

**Example.** `aka_av_drop` usage

```bash
## adds an AKA AV
$ opensips-cli -x mi aka_av_drop \
					sip:test@siphub.com
					test@siphub.com
					KFQ/MpR3cE3V9PxucEQS5KED8uUNYIAALFyk59sIJI4=
```

### `aka_av_drop_all`

Invalidates all Authentication Vectors of an user through the MI interface.

**Parameters:**

- `private_identity` *(string, required)* — the private identity (IMPI) of the user to drop authentication vectors for.
- `public_identity` *(string, required)* — the public identity (IMPU) of the user to drop authentication vectors for.

**Example.** `aka_av_drop_all` usage

```bash
## adds an AKA AV
$ opensips-cli -x mi aka_av_drop_all \
					sip:test@siphub.com
					test@siphub.com
```

### `aka_av_fail`

Indicates the fact that the fetching of an authentication vector has failed, unlocking the processing of the message.

_Note:_ this function is useful when you know that fetching a new authentication vector is not possible (due to various reasons) - calling it will resume the message procesing, using only the available AVs fetched so far.

**Parameters:**

- `count` *(integer, optional)* — the number of authentication vectors failures.
- `private_identity` *(string, required)* — the private identity (IMPI) of the user to add authentication vector for.
- `public_identity` *(string, required)* — the public identity (IMPU) of the user to add authentication vector for.

**Example.** `aka_av_drop` usage

```bash
## adds an AKA AV
$ opensips-cli -x mi aka_av_drop \
					sip:test@siphub.com
					test@siphub.com
					KFQ/MpR3cE3V9PxucEQS5KED8uUNYIAALFyk59sIJI4=
```

## Configuration Examples

### `default_av_mgm` parameter usage

The default AV Manager used in case the functions do not provide them explicitly.

```opensips
		
modparam("auth\_aka", "default\_av\_mgm", "diameter") # fetch AVs through the Cx interface

```
### `default_qop` parameter usage

The default qop parameter used during challenge, if the functions do not provide them explicitly.

```opensips
		
modparam("auth\_aka", "default\_qop", "auth,auth-int")

```
### `default_algorithm` parameter usage

The default algorithm to be advertise during challenge, if the functions do not provide them explicitly. _Note_ that at least one of the algorithms provided should be an AKA one, otherwise it makes no sense to use this module.

```opensips
		
modparam("auth\_aka", "default\_algorithm", "AKAv2-MD5")

```
### `hash_size` parameter usage

The size of the hash that stores the AVs for each user. Must be a power of 2 number.

```opensips
		
modparam("auth\_aka", "hash\_size", 1024)

```
### `sync_timeout` parameter usage

The amount of milliseconds a synchronous call should wait for getting an authentication vector.

```opensips
		
modparam("auth\_aka", "sync\_timeout", 200)

```
### `async_timeout` parameter usage

The amount of milliseconds an asynchronous call should wait for getting an authentication vector.

```opensips
modparam("auth\_aka", "async\_timeout", 2000)

```
### `unused_timeout` parameter usage

The amount of seconds an authentication vector that has not been used can stay in memory. Once this timeout is reached, the authentication vector is removed.

```opensips
modparam("auth\_aka", "unused\_timeout", 120)

```
### `pending_timeout` parameter usage

The amount of seconds an authentication vector that is being used in the authentication process shall stay in memory. Once this timeout is reached, the authentication vector is removed, and the authentication using it will fail.

```opensips
modparam("auth\_aka", "pending\_timeout", 10)

```
### `aka_www_authorize` usage

The function verifies credentials according to RFC3310, by using an authentication vector priorly allocated by an `aka_www_challenge()` call, using the _av\_mgm_ manager. If the credentials are verified successfully the function will succeed, otherwise it will fail with an appropriate error code, as follows: * _\-6 (sync request)_ - the _auts_ parameter was was present, thus a sync was requested; * _\-5 (generic error)_ - some generic error occurred and no reply was sent out; * _\-4 (no credentials)_ - credentials were not found in request; * _\-3 (unknown nonce)_ - authentication vector with the corresponding nonce was not found; * _\-2 (invalid password)_ - password does not match the authentication vector; * _\-1 (invalid username)_ - no username found in the Authorize header; In case the function succeeds, the _WWW-Authenticate_ header is being added to the reply, containing the challenge information, as well as the _Integrity-Key_ and the _Confidentiality-Key_ values associated to the AV being used.

```opensips
		
...
if (!aka\_www\_authorize("diameter", "siphub.com"))
	aka\_www\_challenge("diameter", "siphub.com", "auth");
...
  
```
### `aka_proxy_authorize` usage

The function behaves the same as aka\_www\_authorize(), but it authenticates the user from a proxy perspective. It receives the same parameters, with the same meaning, and returns the same values.

```opensips
		
...
if (!aka\_proxy\_authorize("siphub.com"))
	aka\_proxy\_challenge("diameter", "siphub.com", "auth");
...
  
```
### aka\_www\_challenge usage

The function challenges a user agent. It fetches an authentication vector for each algorigthm used through the _av\_mgm_ Manager and generate one or more WWW-Authenticate header fields containing digest challenges. It will put the header field(s) into a response generated from the request the server is processing and will send the reply. Upon reception of such a reply the user agent should compute credentials using the used authentication vector annd retry the request. For more information regarding digest authentication see RFC2617, RFC3261, RFC3310 and RFC8760.

```opensips
...
if (!aka\_www\_authorize("siphub.com")) {
	aka\_www\_challenge(,"siphub.com", "auth-int", "AKAv1-MD5");
}
...
  
```
### `aka_proxy_challenge` usage

The function behaves the same as aka\_www\_challenge(), but it challenges the user from a proxy perspective. It receives the same parameters, with the same meaning, the only difference being that in case of the _realm_ is missing, then it is taken from the the _To domain_, rather than from _From domain_. The header added is _Proxy-Authenticate_, rather than _WWW-Authenticate_ The rest of the parameters, behavior, as well as return values are the same.

```opensips
		
...
if (!aka\_proxy\_authorize("siphub.com"))
	aka\_proxy\_challenge(,"siphub.com", "auth");
...
  
```
### `aka_av_add` usage

Adds an authentication vector for the user identitied by _public\_identity_ and _private\_identity_.

```opensips
		
...
aka\_av\_add("sip:test@siphub.com", "test@siphub.com",
			"KFQ/MpR3cE3V9PxucEQS5KED8uUNYIAALFyk59sIJI4=", /\* authenticate \*/
			"00000262c0000014000028af2d6398cbe26eea69", /\* authorize \*/
			"db7f8c4a58e17083974bba3b936d34c4", /\* ck \*/
			"6151667b9ef815c1dcb87473685f062a"  /\* ik \*/);
...
  
```
### `aka_av_drop` usage

Drops the authentication vector corresponding to the _authenticate/nonce_ value for an user identitied by _public\_identity_ and _private\_identity_.

```opensips
		
...
aka\_av\_drop("sip:test@siphub.com", "test@siphub.com",
			"KFQ/MpR3cE3V9PxucEQS5KED8uUNYIAALFyk59sIJI4=");
...
  
```
### `aka_av_drop_all` usage

Drops all authentication vectors for an user identitied by _public\_identity_ and _private\_identity_. This function is useful when a synchronization must be done.

```opensips
		
...
aka\_av\_drop\_all("sip:test@siphub.com", "test@siphub.com", $var(count));
...
  
```
### `aka_av_fail` usage

Marks the engine that an authentication vector query for a user has failed, unlocking the processing of the message. _Note:_ this function is useful when you know that fetching a new authentication vector is not possible (due to various reasons) - calling it will resume the message procesing, using only the available AVs fetched so far.

```opensips
...
aka\_av\_fail("sip:test@siphub.com", "test@siphub.com", 3);
...
  
```
### `aka_av_add` usage

Adds an Authentication Vector through the MI interface.

```opensips
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

```
### `aka_av_drop` usage

Invalidates an Authentication Vector of an user identified by its authenticate value.

```opensips
...
## adds an AKA AV
$ opensips-cli -x mi aka\_av\_drop \\
				sip:test@siphub.com
				test@siphub.com
				KFQ/MpR3cE3V9PxucEQS5KED8uUNYIAALFyk59sIJI4=
...

```
### `aka_av_drop_all` usage

Invalidates all Authentication Vectors of an user through the MI interface.

```opensips
...
## adds an AKA AV
$ opensips-cli -x mi aka\_av\_drop\_all \\
				sip:test@siphub.com
				test@siphub.com
...

```
### `aka_av_drop` usage

Indicates the fact that the fetching of an authentication vector has failed, unlocking the processing of the message. _Note:_ this function is useful when you know that fetching a new authentication vector is not possible (due to various reasons) - calling it will resume the message procesing, using only the available AVs fetched so far.

```opensips
...
## adds an AKA AV
$ opensips-cli -x mi aka\_av\_drop \\
				sip:test@siphub.com
				test@siphub.com
				KFQ/MpR3cE3V9PxucEQS5KED8uUNYIAALFyk59sIJI4=
...

```
