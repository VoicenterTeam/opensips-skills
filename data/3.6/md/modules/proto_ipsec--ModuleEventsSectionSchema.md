# proto\_ipsec Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5681104)

2.2. [Most recently active contributors(1) to this module](#idp5748816)

**List of Examples**

1.1. [Set `port` parameter](#idp5515552)

1.2. [Set `min_spi` parameter](#idp5520896)

1.3. [Set `max_spi` parameter](#idp5526240)

1.4. [Set `temporary_timeout` variable](#idp5531216)

1.5. [Set `default_client_port` parameter](#idp5536000)

1.6. [Set `default_server_port` parameter](#idp5540688)

1.7. [Set `allowed_algorithms` parameter](#idp5552624)

1.8. [Set `disable_deprecated_algorithms` parameter](#idp5560976)

1.9. [`ipsec_create()` usage](#idp5575280)

1.10. [`$ipsec(field)` usage](#idp5588256)

1.11. [`$ipsec_ue(field)` usage](#idp5600480)

## Chapter�1.�Admin Guide

## 1.1.�Overview

The **proto\_ipsec** module provides IPSec sockets for establishing secure communication channels. It relies on RFC 3329 (Security Mechanism Agreement for the Session Initiation Protocol (SIP)) to establish the IPSec parameters necessary for creating dynamic Security Associations (SAs) for each connection.

This module has been developed to fully comply with the VoLTE specification (GSMA PRD IR.92) and implements the extensions defined in TS 33.203 (3G Security: Access Security for IP-based Services).

It allows creation of both UDP and TCP secure connections on the same IP:port pair, defined as sockets. Essentially, when defining a socket using the _proto\_ipsec_ protocol, two new internal/hidden sockets are created on the specified port. For example, defining the following socket:

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

When a request is received over an IPSec tunnel, the module provides two variables, [$ipsec(field)](#pv_ipsec "1.5.1.�$ipsec") and [$ipsec\_ue(field)](#pv_ipsec_ue "1.5.2.�$ipsec_ue") to inspect details about it.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _tm_ - used to keep track of IPSec SA context between requests and replies.
    
*   _usrloc_ - used to identify when a successful registration/de-registration happens.
    
*   _proto\_udp_ - used for handling IPSec UDP connections operations.
    
*   _proto\_tcp_ - used for handling IPSec TCP connections operations.
    

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _libmnl_ - Minimalistic Netlink Library used to create IPSec SA using the XFRM kernel interface.
    

## 1.3.�Exported Parameters

### 1.3.1.�`port` (integer)

Default IPSec port used when no prot is being specified in the _socket_ global parameter.

_Default value is 5062._

**Example�1.1.�Set `port` parameter**

...
modparam("proto\_ipsec", "port", 5100)
...

  

### 1.3.2.�`min_spi` (integer)

This parameter represents the minimum value for the Security Association's (SA) SPI parameter. In conjunction with the _max\_spi_ setting, it defines the SPI range _\[min\_spi, max\_spi\]_ that must be unique within the system.

_Default value is 65536._

**Example�1.2.�Set `min_spi` parameter**

...
modparam("proto\_ipsec", "min\_spi", 10000)
...

  

### 1.3.3.�`max_spi` (integer)

This parameter represents the maximum value for the Security Association's (SA) SPI parameter. In conjunction with the _min\_spi_ setting, it defines the SPI range _\[min\_spi, max\_spi\]_ that must be unique within the system.

_Default value is 262144._

**Example�1.3.�Set `max_spi` parameter**

...
modparam("proto\_ipsec", "max\_spi", 20000)
...

  

### 1.3.4.�`temporary_timeout` (integer)

Sets the timeout (in seconds) a temporary security association can be stored in memory until in is confirmed (or used) by the remote endpoint.

The timeout signifies the duration elapsed after sending the Security Association's (SA) parameters in the 401 reply and when the User Equipment (UE) transmits the initial message over the new secure channel.

_Default value is 30._

**Example�1.4.�Set `temporary_timeout` variable**

param("proto\_ipsec", "temporary\_timeout", 10) # number of seconds

			

  

### 1.3.5.�`default_client_port` (integer)

Default port value to be used when we act as clients in the IPSec communication.

_Default value is not defined - a random socket is being used, but needs to be different from the server socket._

**Example�1.5.�Set `default_client_port` parameter**

...
modparam("proto\_ipsec", "default\_client\_port", 5100)
...

  

### 1.3.6.�`default_server_port` (integer)

Default port value to be used when we act as server in the IPSec communication.

_Default value is not defined - a random socket is being used, but needs to be different from the client socket._

**Example�1.6.�Set `default_server_port` parameter**

...
modparam("proto\_ipsec", "default\_server\_port", 6100)
...

  

### 1.3.7.�`allowed_algorithms` (string)

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
    

_Default value is none - this means that all algorithms can be used._

**Example�1.7.�Set `allowed_algorithms` parameter**

...
modparam("proto\_ipsec", "allowed\_algorithms", "null")
modparam("proto\_ipsec", "allowed\_algorithms", "hmac-sha-1-96=null")
modparam("proto\_ipsec", "allowed\_algorithms", "hmac-sha-1-96=null,aes-gmac=aes-gcm")
...

  

### 1.3.8.�`disable_deprecated_algorithms` (integer)

Indicates whether we should ignore deprecated algorithms, as defined in TS 33.203 (3G Security: Access Security for IP-based Services). At the moment, this disables the following algorithms:

*   _hmac-md5-96_ and _hmac-sha-1-96_ authentication algorithms
    
*   _des-ede3-cbc_ and _aes-cbc_ encryption algorithms
    

_Default value is false - all algorithms can be used._

**Example�1.8.�Set `disable_deprecated_algorithms` parameter**

...
modparam("proto\_ipsec", "disable\_deprecated\_algorithms", yes)
...

  

## 1.4.�Exported Functions

### 1.4.1.� `ipsec_create([port_server], [port_client], [algos])`

Creates an IPSec SA/tunnel according to the _Security-Client_ header and the AKA information received in the 401 reply.

This function should only be called on a 401 reply for a REGISTER message.

Upon successful creation of the IPSec tunnel, it builds the _Security-Server_ header and appends it to the reply.

Meaning of the parameters is as follows:

*   _port\_server (integer, optional)_ - the server port to be used in the IPSec communication. It should be an existing IPSec port and is advertised in the _Security-Server_ header. If missing, the [default\_client\_port](#param_default_client_port "1.3.5.�default_client_port (integer)") is considered.
    
*   _port\_client (integer, optional)_ - the client port to be used in the IPSec communication. It should be an existing IPSec port and is advertised in the _Security-Server_ header. If missing, the [default\_server\_port](#param_default_server_port "1.3.6.�default_server_port (integer)") is considered.
    
*   _algos (string, optional)_ - a list of algorithms that should be used for creating this security association. It has the same format as [disable\_allowed\_algorithms](#param_allowed_algorithms "1.3.7.�allowed_algorithms (string)") and overwrites its value when used. If missing, the [disable\_allowed\_algorithms](#param_allowed_algorithms "1.3.7.�allowed_algorithms (string)") is considered.
    

This function can be used from REPLY\_ROUTE.

**Example�1.9.�`ipsec_create()` usage**

...
onreply\_route\[ipsec\] {
	if ($T\_reply\_code == 401)
		if (ipsec\_create())
}
...

  

## 1.5.�Exported Pseudo-Variables

### 1.5.1.�`$ipsec`

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
    

**Example�1.10.�`$ipsec(field)` usage**

...
xlog("Using $ipsec(ip):$ipsec(port-c) and $ipsec(ip):$ipsec(port-s) socket\\n");
...

  

### 1.5.2.�`$ipsec_ue`

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
    

**Example�1.11.�`$ipsec_ue(field)` usage**

...
xlog("Using $ipsec\_ue(ip):$ipsec\_ue(port-c) and $ipsec\_ue(ip):$ipsec\_ue(port-s) socket\\n");
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

65

20

4519

393

2.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

4

2

23

15

3.

Alexandra Titoc

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

Apr 2024 - Dec 2025

2.

Alexandra Titoc

Sep 2024 - Sep 2024

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

May 2024 - May 2024

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)).

_Documentation Copyrights:_

Copyright � 2024 OpenSIPS Solutions;