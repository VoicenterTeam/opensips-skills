# MSRP Relay Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5648912)

2.2. [Most recently active contributors(1) to this module](#idp5718544)

**List of Examples**

1.1. [Set `server_hsize` parameter](#idp310464)

1.2. [Set `cleanup_interval` parameter](#idp162240)

1.3. [Set `auth_route` parameter](#idp167888)

1.4. [`username_var` parameter usage](#idp172720)

1.5. [`realm_var` parameter usage](#idp5526496)

1.6. [`password_var` parameter usage](#idp5531664)

1.7. [`calculate_ha1` parameter usage](#idp5536432)

1.8. [Set `socket_route` parameter](#idp5548608)

1.9. [`auth_realm` parameter usage](#idp5559792)

1.10. [Set `server_hsize` parameter](#idp5565104)

1.11. [Set `auth_min_expires` parameter](#idp5570176)

1.12. [Set `auth_max_expires` parameter](#idp5575328)

1.13. [nonce\_expire parameter example](#idp5580432)

1.14. [`my_uri` parameter usage](#idp5585472)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This modules implements a Relay for the MSRP protocol, according to the specifications of RFC 4976. Once loaded, the module will automatically forward messages and manage MSRP sessions for the MSRP listeners defined in the script.

For authenticating MSRP clients, a dedicated script route is run in order to check the Digest credentials via pseudo-variables.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _proto\_msrp_
    

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _openssl_ or _libssl_
    
*   _openssl-dev_ or _libssl-dev_
    

## 1.3.�Exported Parameters

### 1.3.1.�`hash_size` (int)

The size of the hash table that stores the MSRP sessions. It is the 2 logarithmic value of the real size.

_Default value is “10”_ (1024 records).

**Example�1.1.�Set `server_hsize` parameter**

...
modparam("msrp\_relay", "hash\_size", 10)
...
		

  

### 1.3.2.�`cleanup_interval` (int)

The interval between full iterations of the sessions table in order to clean up expired MSRP sessions. Note that a session will be kept in memory as long as the _Expires_ value provided in the 200 OK response to the AUTH request indicates.

_Default value is “60”._

**Example�1.2.�Set `cleanup_interval` parameter**

...
modparam("msrp\_relay", "cleanup\_interval", 30)
...
		

  

### 1.3.3.�`auth_route` (str)

The name of the script route to be called when authorizing MSRP clients (receiving an AUTH request with an Authorization header). Here you should provide the appropriate password (or pre-calculated HA1 string) for the credentials via the [password\_var](#param_password_var "1.3.6.�password_var (string)") pseudo-variable, in order for the relay to check the client response.

_No default value; this parameter is mandatory._

**Example�1.3.�Set `auth_route` parameter**

...
modparam("msrp\_relay", "auth\_route", "auth")
...
		

  

### 1.3.4.�`username_var` (string)

This name of the pseudo-variable that holds the authentication username.

Default value is “$var(username)”.

**Example�1.4.�`username_var` parameter usage**

modparam("msrp\_relay", "username\_var", "$var(msrp\_auth\_user)")

  

### 1.3.5.�`realm_var` (string)

This name of the pseudo-variable that hols the authentication Realm.

Default value is “$var(realm)”.

**Example�1.5.�`realm_var` parameter usage**

modparam("msrp\_relay", "realm\_var", "$var(msrp\_auth\_realm)")

  

### 1.3.6.�`password_var` (string)

This name of the pseudo-variable that should be set in the [auth\_route](#param_auth_route "1.3.3.�auth_route (str)") script route in order to check the client response when authenticating. The value to be set can be either the plaintext password or pre-calculated HA1 string, based on the parameter.

Default value is “$var(password)”.

**Example�1.6.�`password_var` parameter usage**

modparam("msrp\_relay", "password\_var", "$var(msrp\_auth\_password)")

  

### 1.3.7.�`calculate_ha1` (integer)

This parameter configures whether the value of the [password\_var](#param_password_var "1.3.6.�password_var (string)") pseudo-variable should be treated as a plaintext password or a pre-calculated HA1 string.

Default value of this parameter is 0 (HA1 string).

**Example�1.7.�`calculate_ha1` parameter usage**

modparam("msrp\_relay", "calculate\_ha1", 1)

  

### 1.3.8.�`socket_route` (str)

The optional name of the script route to be called when start relaying a new MSRP session (upon the first SEND). The purpose of this route is to allow you to select the appropriate outbound socket to be be used for sending out the MSRP request.

Inside the route, the following information from the received request will be exposed:

*   _source network information_ via the `$si`, `$sp`, `$sP` and `$socket_in` variables.
    
*   _destination URL schema_ via the [dst\_schema\_var](#param_dst_schema_var "1.3.9.�dst_schema_var (string)") variable
    
*   _destination URL host_ via the [dst\_host\_var](#param_dst_host_var "1.3.10.�dst_host_var (string)") variable
    

In this route you should optionally set the desired MSRP(S) outbound socket via the `$socket_out` variable. If none is set, the inbound interface will also be used as outbound if the schema (MSRP versus MSRPS) is the same. If the schema changes, the first socket (matching the out schema) will be used.

Default value is “NULL” (none).

**Example�1.8.�Set `socket_route` parameter**

...
modparam("msrp\_relay", "socket\_route", "msrp\_routing")

route\[msrp\_routing\] {
	xlog("MSRP request comming from $si:$sp on $socket\_in socket\\n");
	xlog("trying to go to $var(dst\_schema)://$var(dst\_host)\\n");

	$socket\_out = "msrp:1.2.3.4:9999";
}
...
		

  

### 1.3.9.�`dst_schema_var` (string)

This name of the variable to provide the schema ("msrp" or "msrps") of the destination URL in the socket route. See more on [param\_socket\_route](#param_socket_route "1.3.8.�socket_route (str)") parameter.

Default value is “$var(dst\_schema)”.

### 1.3.10.�`dst_host_var` (string)

This name of the variable to provide the host of the destination URL in the socket route. See more on [param\_socket\_route](#param_socket_route "1.3.8.�socket_route (str)") parameter.

Default value is “$var(dst\_host)”.

### 1.3.11.�`auth_realm` (string)

The realm to be provided in the WWW-Authenticate header when the relay automatically challanges an MSRP client.

If this parameter is not set, the realm chose by the relay is the domain part of the top MSRP URI in the To-Path header of the AUTH request.

**Example�1.9.�`auth_realm` parameter usage**

modparam("msrp\_relay", "auth\_realm", "opensips.org")

  

### 1.3.12.�`auth_expires` (int)

The _Expires_ header value to be provided in the 200 OK response to an AUTH request, if the client does not explicitly request one. This represents how long the MSRP URI provided by the relay in the Use-Path header is valid.

_Default value is “1800”_ (1024 records).

**Example�1.10.�Set `server_hsize` parameter**

...
modparam("msrp\_relay", "auth\_expires", 600)
...
	

  

### 1.3.13.�`auth_min_expires` (int)

The minimum value accepted by the relay in the _Expires_ header, if the client provides it in the AUTH request. If the requested value is lower that this parameter, the relay will include a _Min-Expires_ header with the configured value, in the 423 Interval Out-of-Bounds response.

If not set, the relay will accept any value.

**Example�1.11.�Set `auth_min_expires` parameter**

...
modparam("msrp\_relay", "auth\_min\_expires", 60)
...
	

  

### 1.3.14.�`auth_max_expires` (int)

The maximum value accepted by the relay in the _Expires_ header, if the client provides it in the AUTH request. If the requested value is higher that this parameter, the relay will include a _Max-Expires_ header with the configured value, in the 423 Interval Out-of-Bounds response.

If not set, the relay will accept any value.

**Example�1.12.�Set `auth_max_expires` parameter**

...
modparam("msrp\_relay", "auth\_max\_expires", 60)
...
	

  

### 1.3.15.�`nonce_expire` (integer)

Nonces have limited lifetime. After a given period of time nonces will be considered invalid. This is to protect replay attacks. Credentials containing a stale nonce will be not authorized, but the user agent will be challenged again. This time the challenge will contain `stale` parameter which will indicate to the client that it doesn't have to disturb user by asking for username and password, it can recalculate credentials using existing username and password.

The value is in seconds and default value is 30 seconds.

**Example�1.13.�nonce\_expire parameter example**

modparam("msrp\_relay", "nonce\_expire", 15)   # Set nonce\_expire to 15s

  

### 1.3.16.�`my_uri` (string)

MSRP URI of this relay, that will be matched against the first URI in the To-Path header of any request or response received. Messages that are not addressed to this relay will be dropped.

The MSRP URI provided by the relay in the Use-Path header, will be chosen based on the URI in the To-Path header of the AUTH request.

This parameter can be set multiple times

If the port is not set explicitly, the default value of 2855 wil be assumed. The session-id part of the URI should not be set

**Example�1.14.�`my_uri` parameter usage**

modparam("msrp\_relay", "my\_uri", "msrp://opensips.org:2855;tcp")

  

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

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

22

7

1646

16

2.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

7

4

200

20

3.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

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

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

Mar 2022 - May 2023

2.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Apr 2022 - May 2023

3.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Feb 2023

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)).

_Documentation Copyrights:_

Copyright � 2022 [www.opensips-solutions.com](http://www.opensips-solutions.com/)