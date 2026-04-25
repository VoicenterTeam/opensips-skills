# msrp_relay Module Reference
<!-- generated-from: data/3.6/modules/msrp_relay.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 msrp_relay module. Read this file when configuring or debugging the msrp_relay module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Configuration Examples](#configuration-examples)

## Overview

This modules implements a Relay for the MSRP protocol, according to the specifications of RFC 4976. Once loaded, the module will automatically forward messages and manage MSRP sessions for the MSRP listeners defined in the script.

For authenticating MSRP clients, a dedicated script route is run in order to check the Digest credentials via pseudo-variables.

## Dependencies

### OpenSIPs Modules

- `proto_msrp`

### External Libraries

- `openssl or libssl`
- `openssl-dev or libssl-dev`

## Exported Parameters

### `auth_expires` (int)

The _Expires_ header value to be provided in the 200 OK response to an AUTH request, if the client does not explicitly request one. This represents how long the MSRP URI provided by the relay in the Use-Path header is valid.

*Default value is 1800.*

**Example.** 600.

```opensips
...
modparam("msrp_relay", "auth_expires", 600)
...
```
### `auth_max_expires` (int)

The maximum value accepted by the relay in the _Expires_ header, if the client provides it in the AUTH request. If the requested value is higher that this parameter, the relay will include a _Max-Expires_ header with the configured value, in the 423 Interval Out-of-Bounds response. If not set, the relay will accept any value.

**Example.** 60.

```opensips
...
modparam("msrp_relay", "auth_max_expires", 60)
...
```
### `auth_min_expires` (int)

The minimum value accepted by the relay in the _Expires_ header, if the client provides it in the AUTH request. If the requested value is lower that this parameter, the relay will include a _Min-Expires_ header with the configured value, in the 423 Interval Out-of-Bounds response. If not set, the relay will accept any value.

**Example.** 60.

```opensips
...
modparam("msrp_relay", "auth_min_expires", 60)
...
```
### `auth_realm` (string)

The realm to be provided in the WWW-Authenticate header when the relay automatically challanges an MSRP client. If this parameter is not set, the realm chose by the relay is the domain part of the top MSRP URI in the To-Path header of the AUTH request.

**Example.** opensips.org.

```opensips
modparam("msrp_relay", "auth_realm", "opensips.org")
```
### `auth_route` (str)

The name of the script route to be called when authorizing MSRP clients (receiving an AUTH request with an Authorization header). Here you should provide the appropriate password (or pre-calculated HA1 string) for the credentials via the [password_var](#param_password_var "1.3.6.password_var (string)") pseudo-variable, in order for the relay to check the client response.

**Notes:** No default value; this parameter is mandatory.

**Example.** auth.

```opensips
...
modparam("msrp_relay", "auth_route", "auth")
...
```
### `calculate_ha1` (integer)

This parameter configures whether the value of the password_var pseudo-variable should be treated as a plaintext password or a pre-calculated HA1 string.

*Default value is 0 (HA1 string).*

**Example.** Set the `calculate_ha1` parameter.

```opensips
modparam("msrp_relay", "calculate_ha1", 1)
```
### `cleanup_interval` (int)

The interval between full iterations of the sessions table in order to clean up expired MSRP sessions. Note that a session will be kept in memory as long as the _Expires_ value provided in the 200 OK response to the AUTH request indicates.

*Default value is 60.*

**Example.** 30.

```opensips
...
modparam("msrp_relay", "cleanup_interval", 30)
...
```
### `dst_host_var` (string)

This name of the variable to provide the host of the destination URL in the socket route. See more on param_socket_route parameter.

*Default value is $var(dst_host).*
### `dst_schema_var` (string)

This name of the variable to provide the schema ("msrp" or "msrps") of the destination URL in the socket route. See more on param_socket_route parameter.

*Default value is $var(dst_schema).*
### `hash_size` (int)

The size of the hash table that stores the MSRP sessions. It is the 2 logarithmic value of the real size.

*Default value is 10.*

**Example.** 10.

```opensips
...
modparam("msrp_relay", "hash_size", 10)
...
```
### `my_uri` (string)

MSRP URI of this relay, that will be matched against the first URI in the To-Path header of any request or response received. Messages that are not addressed to this relay will be dropped.

The MSRP URI provided by the relay in the Use-Path header, will be chosen based on the URI in the To-Path header of the AUTH request.

**Notes:** This parameter can be set multiple times

If the port is not set explicitly, the default value of 2855 wil be assumed. The session-id part of the URI should not be set

**Example.** msrp://opensips.org:2855;tcp.

```opensips
modparam("msrp_relay", "my_uri", "msrp://opensips.org:2855;tcp")
```
### `nonce_expire` (integer)

Nonces have limited lifetime. After a given period of time nonces will be considered invalid. This is to protect replay attacks. Credentials containing a stale nonce will be not authorized, but the user agent will be challenged again. This time the challenge will contain `stale` parameter which will indicate to the client that it doesn't have to disturb user by asking for username and password, it can recalculate credentials using existing username and password. The value is in seconds and default value is 30 seconds.

*Default value is 30.*

**Example.** 15.

```opensips
modparam("msrp_relay", "nonce_expire", 15)   # Set nonce_expire to 15s
```
### `password_var` (string)

This name of the pseudo-variable that should be set in the auth_route script route in order to check the client response when authenticating. The value to be set can be either the plaintext password or pre-calculated HA1 string, based on the parameter.

*Default value is $var(password).*

**Example.** Set the `password_var` parameter.

```opensips
modparam("msrp_relay", "password_var", "$var(msrp_auth_password)")
```
### `realm_var` (string)

This name of the pseudo-variable that hols the authentication Realm.

*Default value is $var(realm).*

**Example.** $var(msrp_auth_realm).

```opensips
modparam("msrp_relay", "realm_var", "$var(msrp_auth_realm)")
```
### `socket_route` (str)

The optional name of the script route to be called when start relaying a new MSRP session (upon the first SEND). The purpose of this route is to allow you to select the appropriate outbound socket to be be used for sending out the MSRP request. Inside the route, the following information from the received request will be exposed: source network information via the $si, $sp, $sP and $socket_in variables. destination URL schema via the dst_schema_var variable. destination URL host via the dst_host_var variable. In this route you should optionally set the desired MSRP(S) outbound socket via the $socket_out variable. If none is set, the inbound interface will also be used as outbound if the schema (MSRP versus MSRPS) is the same. If the schema changes, the first socket (matching the out schema) will be used.

*Default value is NULL (none).*

**Example.** Set the `socket_route` parameter.

```opensips
...
modparam("msrp_relay", "socket_route", "msrp_routing")

route[msrp_routing] {
	xlog("MSRP request comming from $si:$sp on $socket_in socket\n");
	xlog("trying to go to $var(dst_schema)://$var(dst_host)\n");

	$socket_out = "msrp:1.2.3.4:9999";
}
...
```
### `username_var` (string)

This name of the pseudo-variable that holds the authentication username.

*Default value is $var(username).*

**Example.** $var(msrp_auth_user).

```opensips
modparam("msrp_relay", "username_var", "$var(msrp_auth_user)")
```

## Configuration Examples

### Set server_hsize parameter

Set the hash_size parameter for the MSRP sessions table.

```opensips
...
modparam("msrp_relay", "hash_size", 10)
...
```

null
### Set cleanup_interval parameter

Set the interval between full iterations of the sessions table in order to clean up expired MSRP sessions.

```opensips
...
modparam("msrp_relay", "cleanup_interval", 30)
...
```

null
### Set auth_route parameter

Set the name of the script route to be called when authorizing MSRP clients.

```opensips
...
modparam("msrp_relay", "auth_route", "auth")
...
```

null
### username_var parameter usage

Configure the pseudo-variable that holds the authentication username.

```opensips
modparam("msrp_relay", "username_var", "$var(msrp_auth_user)")
```

null
### realm_var parameter usage

Configure the pseudo-variable that holds the authentication Realm.

```opensips
modparam("msrp_relay", "realm_var", "$var(msrp_auth_realm)")
```

null
### password_var parameter usage

Configure the pseudo-variable that should be set in the auth_route script route in order to check the client response when authenticating.

```opensips
modparam("msrp_relay", "password_var", "$var(msrp_auth_password)")
```

null
### calculate_ha1 parameter usage

Configure whether the value of the password_var pseudo-variable should be treated as a plaintext password or a pre-calculated HA1 string.

```opensips
modparam("msrp_relay", "calculate_ha1", 1)
```

null
### Set socket_route parameter

Set the script route to be called when starting to relay a new MSRP session to allow selection of the outbound socket.

```opensips
...
modparam("msrp_relay", "socket_route", "msrp_routing")

route\[msrp_routing\] {
	xlog("MSRP request comming from $si:$sp on $socket_in socket\\n");
	xlog("trying to go to $var(dst_schema)://$var(dst_host)\\n");

	$socket_out = "msrp:1.2.3.4:9999";
}
...
```

null
### auth_realm parameter usage

Set the realm to be provided in the WWW-Authenticate header when the relay automatically challenges an MSRP client.

```opensips
modparam("msrp_relay", "auth_realm", "opensips.org")
```

null
### Set server_hsize parameter

Set the auth_expires header value to be provided in the 200 OK response to an AUTH request.

```opensips
...
modparam("msrp_relay", "auth_expires", 600)
...
```

null
### Set auth_min_expires parameter

Set the minimum value accepted by the relay in the Expires header.

```opensips
...
modparam("msrp_relay", "auth_min_expires", 60)
...
```

null
### Set auth_max_expires parameter

Set the maximum value accepted by the relay in the Expires header.

```opensips
...
modparam("msrp_relay", "auth_max_expires", 60)
...
```

null
### nonce_expire parameter example

Set the lifetime of nonces to protect against replay attacks.

```opensips
modparam("msrp_relay", "nonce_expire", 15)   # Set nonce_expire to 15s
```

null
### my_uri parameter usage

Set the MSRP URI of the relay to be matched against the To-Path header.

```opensips
modparam("msrp_relay", "my_uri", "msrp://opensips.org:2855;tcp")
```

null
