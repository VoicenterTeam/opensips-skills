# auth_aaa Module Reference
<!-- generated-from: data/3.6/modules/auth_aaa.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 auth_aaa module. Read this file when configuring or debugging the auth_aaa module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Configuration Examples](#configuration-examples)

## Overview

This module contains functions that are used to perform digest authentication and some URI checks against an AAA server. In order to perform the authentication, the proxy will pass along the credentials to the AAA server which will in turn send a reply containing result of the authentication. So basically the whole authentication is done in the AAA server. Before sending the request to the AAA server we perform some sanity checks over the credentials to make sure that only well formed credentials will get to the server.

## Dependencies

### OpenSIPs Modules

- `an aaa implementing module` — for example aaa_radius
- `auth` — Authentication framework, only if the auth functions are used from script

### External Libraries

None.

## Exported Parameters

### `aaa_url` (string)

This is the url representing the AAA protocol used and the location of the configuration file of this protocol.

The syntax for the url is the following: "name_of_the_aaa_protocol_used:path_of_the_configuration_file"

**Example.** radius:/etc/radiusclient-ng/radiusclient.conf.

```opensips
modparam("auth_aaa", "aaa_url", "radius:/etc/radiusclient-ng/radiusclient.conf")
```
### `auth_service_type` (integer)

This is the value of the Service-Type aaa attribute to be used when performing an authentication operation. The default should be fine for most people. See your aaa client include files for numbers to be put in this parameter if you need to change it.

*Default value is 15.*

**Example.** 15.

```opensips
modparam("auth_aaa", "auth_service_type", 15)
```
### `check_service_type` (integer)

AAA service type used by `aaa_does_uri_exist` and `aaa_does_uri_user_exist` checks.

*Default value is 10.*

**Example.** 11.

```opensips
modparam("auth_aaa", "check_service_type", 11)
```
### `use_ruri_flag` (string)

When this parameter is set to the value other than "NULL" and the request being authenticated has flag with matching number set via setflag() function, use Request URI instead of uri parameter value from the Authorization / Proxy-Authorization header field to perform AAA authentication. This is intended to provide workaround for misbehaving NAT / routers / ALGs that alter request in the transit, breaking authentication. At the time of this writing, certain versions of Linksys WRT54GL are known to do that.

*Default value is NULL.*

**Example.** USE_RURI_FLAG.

```opensips
modparam("auth_aaa", "use_ruri_flag", "USE_RURI_FLAG")
```

## Exported Functions

### `aaa_does_uri_exist([sip_uri])`

Checks from Radius if the SIP URI stored in the "sip_uri" parameter (or user@host part of the Request-URI if "sip_uri" is not given) belongs to a local user. Can be used to decide if 404 or 480 should be returned after lookup has failed. If yes, loads AVP based on SIP-AVP reply items returned from Radius. Each SIP-AVP reply item must have a string value of form: value = SIP_AVP_NAME SIP_AVP_VALUE; SIP_AVP_NAME = STRING_NAME | '#'ID_NUMBER; SIP_AVP_VALUE = ':'STRING_VALUE | '#'NUMBER_VALUE.

**Parameters:**

- `sip_uri` *(string, optional)* — SIP URI to check. If not given, user@host part of the Request-URI is used.

**Return codes:**

- `1` — Radius returns Access-Accept
- `-1` — Radius returns Access-Reject
- `-2` — internal error

**Usable from:** REQUEST_ROUTE

**Example.** aaa_does_uri_exist usage.

```opensips
...
if (aaa_does_uri_exist()) {
	...
};
...
```

### `aaa_does_uri_user_exist([sip_uri])`

Similar to aaa_does_uri_exist, but check is done based only on Request-URI user part or user stored in "sip_uri". The user should thus be unique among all users, such as an E.164 number.

**Parameters:**

- `sip_uri` *(string, optional)* — User to check. If not given, Request-URI user part is used.

**Usable from:** REQUEST_ROUTE

**Example.** aaa_does_uri_user_exist usage.

```opensips
...
if (aaa_does_uri_user_exist()) {
	...
};
...
```

### `aaa_proxy_authorize(realm, [uri_user])`

The function verifies credentials according to RFC2617. If the credentials are verified successfully then the function will succeed and mark the credentials as authorized (marked credentials can be later used by some other functions). If the function was unable to verify the credentials for some reason then it will fail and the script should call `proxy_challenge` which will challenge the user again. For more about the negative return codes, see the above function. This function will, in fact, perform sanity checks over the received credentials and then pass them along to the aaa server which will verify the credentials and return whether they are valid or not.

**Parameters:**

- `realm` *(string, required)* — Realm is a opaque string that the user agent should present to the user so he can decide what username and password to use. This is usually one of the domains the proxy is responsible for. If an empty string “” is used then the server will generate realm from host part of From header field URI. The string may contain pseudo variables.
  - ``
- `uri_user` *(string, optional)* — value passed to the Radius server as value of the SIP-URI-User check item. If this parameter is not present, the server will generate the SIP-URI-User check item value from the username part of the To header field URI.

**Return codes:**

- `1` — credentials verified successfully
- `-1` — unable to verify credentials
- `-5` — generic error occurred and no reply was sent out
- `-4` — credentials were not found in request
- `-3` — stale nonce

**Usable from:** REQUEST_ROUTE

**Related:**

- `proxy_challenge`

**Example.** proxy_authorize usage.

```opensips
...
if (!aaa_proxy_authorize(""))    # Realm and URI user will be autogenerated
	proxy_challenge("", "auth");
...
if (!aaa_proxy_authorize($pd, $pU))    # Realm and URI user are taken
	proxy_challenge($pd, "auth");  # from P-Preferred-Identity
                                       # header field
...
```

### `aaa_www_authorize(realm, [uri_user])`

The function verifies credentials according to RFC2617. If the credentials are verified successfully then the function will succeed and mark the credentials as authorized (marked credentials can be later used by some other functions). If the function was unable to verify the credentials for some reason then it will fail and the script should call `www_challenge` which will challenge the user again. Negative codes may be interpreted as follows: -5 (generic error) - some generic error occurred and no reply was sent out; -4 (no credentials) - credentials were not found in request; -3 (stale nonce) - stale nonce. This function will, in fact, perform sanity checks over the received credentials and then pass them along to the aaa server which will verify the credentials and return whether they are valid or not.

**Parameters:**

- `realm` *(string, required)* — Realm is a opaque string that the user agent should present to the user so he can decide what username and password to use. Usually this is domain of the host the server is running on. If an empty string “” is used then the server will generate it from the request. In case of REGISTER requests To header field domain will be used (because this header field represents a user being registered), for all other messages From header field domain will be used. The string may contain pseudo variables.
  - ``
- `uri_user` *(string, optional)* — value passed to the Radius server as value of the SIP-URI-User check item. If this parameter is not present, the server will generate the SIP-URI-User check item value from the username part of the To header field URI.

**Return codes:**

- `1` — credentials verified successfully
- `-1` — unable to verify credentials
- `-5` — generic error occurred and no reply was sent out
- `-4` — credentials were not found in request
- `-3` — stale nonce

**Usable from:** REQUEST_ROUTE

**Related:**

- `www_challenge`

**Example.** aaa_www_authorize usage.

```opensips
...
if (!aaa_www_authorize("siphub.net"))
	www_challenge("siphub.net", "auth");
...
```

## Configuration Examples

### aaa_url parameter usage

This is the url representing the AAA protocol used and the location of the configuration file of this protocol.

```opensips
modparam("auth_aaa", "aaa_url", "radius:/etc/radiusclient-ng/radiusclient.conf")
```
### auth_service_type parameter usage

This is the value of the Service-Type aaa attribute to be used when performing an authentication operation.

```opensips
modparam("auth_aaa", "auth_service_type", 15)
```
### Set check_service_type parameter

AAA service type used by `aaa_does_uri_exist` and `aaa_does_uri_user_exist` checks.

```opensips
modparam("auth_aaa", "check_service_type", 11)
```
### use_ruri_flag parameter usage

When this parameter is set to the value other than "NULL" and the request being authenticated has flag with matching number set via setflag() function, use Request URI instead of uri parameter value from the Authorization / Proxy-Authorization header field to perform AAA authentication.

```opensips
modparam("auth_aaa", "use_ruri_flag", "USE_RURI_FLAG")
```
### aaa_www_authorize usage

The function verifies credentials according to RFC2617. If the credentials are verified successfully then the function will succeed and mark the credentials as authorized (marked credentials can be later used by some other functions).

```opensips
...
if (!aaa_www_authorize("siphub.net"))
	www_challenge("siphub.net", "auth");
...
```
### proxy_authorize usage

The function verifies credentials according to RFC2617. If the credentials are verified successfully then the function will succeed and mark the credentials as authorized (marked credentials can be later used by some other functions).

```opensips
...
if (!aaa_proxy_authorize(""))    # Realm and URI user will be autogenerated
	proxy_challenge("", "auth");
...
if (!aaa_proxy_authorize($pd, $pU))    # Realm and URI user are taken
	proxy_challenge($pd, "auth");  # from P-Preferred-Identity
                                               # header field
...
```
### aaa_does_uri_exist usage

Checks from Radius if the SIP URI stored in the "sip_uri" parameter (or user@host part of the Request-URI if "sip_uri" is not given) belongs to a local user.

```opensips
...
if (aaa_does_uri_exist()) {
	...
};
...
```
### aaa_does_uri_user_exist usage

Similar to aaa_does_uri_exist, but check is done based only on Request-URI user part or user stored in "sip_uri".

```opensips
...
if (aaa_does_uri_user_exist()) {
	...
};
...
```
