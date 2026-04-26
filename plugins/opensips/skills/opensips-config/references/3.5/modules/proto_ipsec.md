# proto_ipsec Module Reference
<!-- generated-from: data/3.5/modules/proto_ipsec.json
     generator-version: 0.1.0
     opensips-version: 3.5
     doc-type: module -->

Reference for the OpenSIPs 3.5 proto_ipsec module. Read this file when configuring or debugging the proto_ipsec module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Exported Pseudo-Variables](#exported-pseudo-variables)
- [Configuration Examples](#configuration-examples)

## Overview

The **proto_ipsec** module provides IPSec sockets for establishing secure communication channels. It relies on RFC 3329 (Security Mechanism Agreement for the Session Initiation Protocol (SIP)) to establish the IPSec parameters necessary for creating dynamic Security Associations (SAs) for each connection.

This module has been developed to fully comply with the VoLTE specification (GSMA PRD IR.92) and implements the extensions defined in TS 33.203 (3G Security: Access Security for IP-based Services).

## How It Works

It allows creation of both UDP and TCP secure connections on the same IP:port pair, defined as sockets. Essentially, when defining a socket using the _proto_ipsec_ protocol, two new internal/hidden sockets are created on the specified port. For example, defining the following socket:

...
socket=ipsec:127.0.0.1:5100
...

Internally, two different sockets are created:

...
socket=udp:127.0.0.1:5100
socket=tcp:127.0.0.1:5100
...

Communication through these sockets should be done over IPSec, thus appropriate security associations (SAs) should be made prior to using these listeners, as defined in RFC 3329.

_NOTE_ that this means that you can no longer define these sockets in your config, otherwise they will overlap with the internally defined ones.

IPSec communication requires each participant to define at least two ports for each connection: one when the entity behaves as a client and another when it behaves as a server. Consequently, it's typically necessary to define at least two IPSec sockets for the module to function correctly.

The module implements the entire logic of keeping track of the registration status by hooking into the usrloc module and listening for contact changes updates. It also ensures the persistency of the tunnels by restoring them after a restart.

When a request is received over an IPSec tunnel, the module provides two variables, [$ipsec(field)](#pv_ipsec "1.5.1.$ipsec") and [$ipsec_ue(field)](#pv_ipsec_ue "1.5.2.$ipsec_ue") to inspect details about it.

## Dependencies

### OpenSIPs Modules

- `proto_tcp` — used for handling IPSec TCP connections operations.
- `proto_udp` — used for handling IPSec UDP connections operations.
- `tm` — used to keep track of IPSec SA context between requests and replies.
- `usrloc` — used to identify when a successful registration/de-registration happens.

### External Libraries

- `libmnl` — Minimalistic Netlink Library used to create IPSec SA using the XFRM kernel interface.

## Exported Parameters

### `allowed_algorithms` (string)

Whitelists the authentication and encryption algorithms that can be used for IPSec.

Its format is: _alg|ealg|alg=ealg_

Multiple algorithms pairs can be specified separated by comma.

Currently supported algorithms are:

*   Authentication algorithms:
    *   hmac-md5-96
    *   hmac-sha-1-96
    *   aes-gmac
    *   null

*   Encryption algorithms:
    *   des-ede3-cbc
    *   aes-cbc
    *   aes-gcm
    *   null

*Default value is none - this means that all algorithms can be used..*

**Possible values:**

- hmac-md5-96
- hmac-sha-1-96
- aes-gmac
- null
- des-ede3-cbc
- aes-cbc
- aes-gcm

**Example.** null.

```opensips
modparam("proto_ipsec", "allowed_algorithms", "null")
modparam("proto_ipsec", "allowed_algorithms", "hmac-sha-1-96=null")
modparam("proto_ipsec", "allowed_algorithms", "hmac-sha-1-96=null,aes-gmac=aes-gcm")
```
### `default_client_port` (integer)

Default port value to be used when we act as clients in the IPSec communication.

*Default value is not defined - a random socket is being used, but needs to be different from the server socket..*

**Example.** 5100.

```opensips
modparam("proto_ipsec", "default_client_port", 5100)
```
### `default_server_port` (integer)

Default port value to be used when we act as server in the IPSec communication.

*Default value is not defined - a random socket is being used, but needs to be different from the client socket..*

**Example.** 6100.

```opensips
modparam("proto_ipsec", "default_server_port", 6100)
```
### `disable_deprecated_algorithms` (integer)

Indicates whether we should ignore deprecated algorithms, as defined in TS 33.203 (3G Security: Access Security for IP-based Services). At the moment, this disables the following algorithms:

*   _hmac-md5-96_ and _hmac-sha-1-96_ authentication algorithms
*   _des-ede3-cbc_ and _aes-cbc_ encryption algorithms

*Default value is false - all algorithms can be used..*

**Example.** yes.

```opensips
modparam("proto_ipsec", "disable_deprecated_algorithms", yes)
```
### `max_spi` (integer)

This parameter represents the maximum value for the Security Association's (SA) SPI parameter. In conjunction with the _min_spi_ setting, it defines the SPI range _\[min_spi, max_spi\]_ that must be unique within the system.

*Default value is 262144.*

**Example.** 20000.

```opensips
modparam("proto_ipsec", "max_spi", 20000)
```
### `min_spi` (integer)

This parameter represents the minimum value for the Security Association's (SA) SPI parameter. In conjunction with the _max_spi_ setting, it defines the SPI range _\[min_spi, max_spi\]_ that must be unique within the system.

*Default value is 65536.*

**Example.** 10000.

```opensips
modparam("proto_ipsec", "min_spi", 10000)
```
### `port` (integer)

Default IPSec port used when no prot is being specified in the _socket_ global parameter.

*Default value is 5062.*

**Example.** 5100.

```opensips
modparam("proto_ipsec", "port", 5100)
```
### `temporary_timeout` (integer)

Sets the timeout (in seconds) a temporary security association can be stored in memory until in is confirmed (or used) by the remote endpoint.

The timeout signifies the duration elapsed after sending the Security Association's (SA) parameters in the 401 reply and when the User Equipment (UE) transmits the initial message over the new secure channel.

*Default value is 30.*

**Example.** 10.

```opensips
param("proto_ipsec", "temporary_timeout", 10) # number of seconds
```

## Exported Functions

### `ipsec_create([port_server], [port_client], [algos])`

Creates an IPSec SA/tunnel according to the _Security-Client_ header and the AKA information received in the 401 reply.

This function should only be called on a 401 reply for a REGISTER message.

Upon successful creation of the IPSec tunnel, it builds the _Security-Server_ header and appends it to the reply.

**Parameters:**

- `algos` *(string, optional)* — a list of algorithms that should be used for creating this security association. It has the same format as disable_allowed_algorithms and overwrites its value when used.
- `port_client` *(integer, optional)* — the client port to be used in the IPSec communication. It should be an existing IPSec port and is advertised in the _Security-Server_ header.
- `port_server` *(integer, optional)* — the server port to be used in the IPSec communication. It should be an existing IPSec port and is advertised in the _Security-Server_ header.

**Usable from:** REPLY_ROUTE

**Example.** `ipsec_create()` usage.

```opensips
...
onreply_route[ipsec] {
	if ($T_reply_code == 401)
		if (ipsec_create())
}
...
```

## Exported Pseudo-Variables

### `$ipsec`

Populated for a request that is being received over an IPSec tunnel, it contains information about the local IPSec endpoint.

The following fields can be retrieved:

*   _ik_ - integrity key being used by the IPSec tunnel.
    
*   _ck_ - confidentiality key being used by the IPSec tunnel.
    
*   _alg_ - authentication algorithm being used.
    
*   _ealg_ - encryption algorithm being used.
    
*   _ip_ - local IP bound for this tunnel.
    
*   _spi-c_ - local SPI chosen for receiving messages through the client channel.
    
*   _spi-s_ - local SPI chosen for receiving messages through the server channel.
    
*   _port-c_ - local port chosen for communicating through the client channel.
    
*   _port-c_ - local port chosen for communicating through the server channel.
    
**Example 1.10. `$ipsec(field)` usage**

...
xlog("Using $ipsec(ip):$ipsec(port-c) and $ipsec(ip):$ipsec(port-s) socket\n");
...

- **Type:** string
- **Read/write:** read-only
- **Scope:** request

**Possible values:**

- ik
- ck
- alg
- ealg
- ip
- spi-c
- spi-s
- port-c
- port-s
### `$ipsec_ue`

Populated for a request that is being received over an IPSec tunnel, it contains information about the remote IPSec endpoint.

The following fields can be retrieved:

*   _ik_ - integrity key being used by the IPSec tunnel.
    
*   _ck_ - confidentiality key being used by the IPSec tunnel.
    
*   _alg_ - authentication algorithm being used.
    
*   _ealg_ - encryption algorithm being used.
    
*   _ip_ - remote IP of the UE that uses this tunnel.
    
*   _spi-c_ - remote SPI chosen for sending messages through the client channel.
    
*   _spi-s_ - remote SPI chosen for sending messages through the server channel.
    
*   _port-c_ - remote port chosen for communicating through the client channel.
    
*   _port-c_ - remote port chosen for communicating through the server channel.
    
**Example 1.11. `$ipsec_ue(field)` usage**

...
xlog("Using $ipsec_ue(ip):$ipsec_ue(port-c) and $ipsec_ue(ip):$ipsec_ue(port-s) socket\n");
...

- **Type:** string
- **Read/write:** read-only
- **Scope:** request

**Possible values:**

- ik
- ck
- alg
- ealg
- ip
- spi-c
- spi-s
- port-c
- port-s

## Configuration Examples

### Set port parameter

Example demonstrating how to set the port parameter.

```opensips
...
modparam("proto_ipsec", "port", 5100)
...
```
### Set min_spi parameter

Example demonstrating how to set the min_spi parameter.

```opensips
...
modparam("proto_ipsec", "min_spi", 10000)
...
```
### Set max_spi parameter

Example demonstrating how to set the max_spi parameter.

```opensips
...
modparam("proto_ipsec", "max_spi", 20000)
...
```
### Set temporary_timeout variable

Example demonstrating how to set the temporary_timeout variable.

```opensips
param("proto_ipsec", "temporary_timeout", 10) # number of seconds
```
### Set default_client_port parameter

Example demonstrating how to set the default_client_port parameter.

```opensips
...
modparam("proto_ipsec", "default_client_port", 5100)
...
```
### Set default_server_port parameter

Example demonstrating how to set the default_server_port parameter.

```opensips
...
modparam("proto_ipsec", "default_server_port", 6100)
...
```
### Set allowed_algorithms parameter

Example demonstrating how to set the allowed_algorithms parameter.

```opensips
...
modparam("proto_ipsec", "allowed_algorithms", "null")
modparam("proto_ipsec", "allowed_algorithms", "hmac-sha-1-96=null")
modparam("proto_ipsec", "allowed_algorithms", "hmac-sha-1-96=null,aes-gmac=aes-gcm")
...
```
### Set disable_deprecated_algorithms parameter

Example demonstrating how to set the disable_deprecated_algorithms parameter.

```opensips
...
modparam("proto_ipsec", "disable_deprecated_algorithms", yes)
...
```
### ipsec_create() usage

Example demonstrating ipsec_create() usage.

```opensips
...
onreply_route[ipsec] {
	if ($T_reply_code == 401)
		if (ipsec_create())
}
...
```
### $ipsec(field) usage

Example demonstrating $ipsec(field) usage.

```opensips
...
xlog("Using $ipsec(ip):$ipsec(port-c) and $ipsec(ip):$ipsec(port-s) socket\n");
...
```
### $ipsec_ue(field) usage

Example demonstrating $ipsec_ue(field) usage.

```opensips
...
xlog("Using $ipsec_ue(ip):$ipsec_ue(port-c) and $ipsec_ue(ip):$ipsec_ue(port-s) socket\n");
...
```
