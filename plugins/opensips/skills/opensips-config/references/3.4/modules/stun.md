# stun Module Reference
<!-- generated-from: data/3.4/modules/stun.json
     generator-version: 0.1.0
     opensips-version: 3.4
     doc-type: module -->

Reference for the OpenSIPs 3.4 stun module. Read this file when configuring or debugging the stun module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Configuration Examples](#configuration-examples)

## Overview

A stun server working with the same port as SIP (5060) in order to gain accurate information. The benefit would be an exact external address in the case of NATs translating differently when given different destination ports. The server may also advertise different network addresses than the ones it is actually listening on.

## How It Works

The stun server will use 4 sockets:

*   socket1 = ip1 : port1
*   socket2 = ip1 : port2
*   socket3 = ip2 : port1
*   socket4 = ip2 : port2

where ip1 / port1 represent an UDP SIP listener and ip2 / port2 are configured via the alternate_ip and alternate_port parameters.

The sockets come from existing SIP sockets or are created.

Socket1 must allways be a SIP UDP listener from OpenSIPS.

If use_listeners_as_primary is enabled the STUN server will actually use multiple sets of sockets obtained from the IP/port combinations described above, each set corresponding to a SIP UDP listener from OpenSIPS.

The server will create a separate process. This process will listen for data on created sockets. The server will register a callback function to SIP. This function is called when a specific (stun)header is found.

This stun implements RFC3489 (and XOR_MAPPED_ADDRESS from RFC5389)

*   MAPPED_ADDRESS
*   RESPONSE_ADDRESS
*   CHANGE_REQUEST
*   SOURCE_ADDRESS
*   CHANGED_ADDRESS
*   ERROR_CODE
*   UNKNOWN_ATTRIBUTES
*   REFLECTED_FROM
*   XOR_MAPPED_ADDRESS

Not supported attributes:

*   USERNAME
*   PASSWORD
*   MESSAGE_INTEGRITY

and associated ERROR_CODEs

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

None.

## Exported Parameters

### `alternate_ip` (string)

Another IP from another interface. This is a mandatory parameter. If use_listeners_as_primary is enabled, the alternate IP must be either: an IP from an existing UDP SIP listener configured in OpenSIPS, but one that is different from all the other UPD listeners; an IP that is different from the UDP SIP listeners configured in OpenSIPS. Syntax: "ip [/ advertised_ip] By default, the alternate_ip and the advertised alternate_ip will be identical. This may be changed with an optional "/ xxx.xxx.xxx.xxx" string.

**Notes:** Mandatory parameter.

**Example.** 11.22.33.44.

```opensips
...
modparam("stun","alternate_ip","11.22.33.44")

# Example of a STUN server within OpenSIPS which is behind NAT
modparam("stun", "alternate_ip", "192.168.0.100 / 64.78.46.50")
...
```
### `alternate_port` (string)

The port used by the STUN server for the second interface. The default value is 3478 (default STUN port). If use_listeners_as_primary is enabled, the alternate port must be either: a port from an existing UDP SIP listener configured in OpenSIPS, but one that is different from all the other UPD listeners; a port that is different from the UDP SIP listeners configured in OpenSIPS. Syntax: "port [/ advertised_port] By default, the alternate_port and the advertised alternate_port will be identical. This may be changed with an optional "/ adv_port" string.

*Default value is 3478.*

**Example.** 3479.

```opensips
...
modparam("stun","alternate_port","3479")

# Listening on an alternate port, but advertising a different one
modparam("stun", "alternate_port", "5060 / 5062")
...
```
### `primary_ip` (string)

The IP of an interface which is configured as an UDP SIP listener in OpenSIPS. This is a mandatory parameter, unless use_listeners_as_primary is enabled. Syntax: "ip [/ advertised_ip] By default, the primary_ip and the advertised primary_ip will be identical. This may be changed with an optional "/ xxx.xxx.xxx.xxx" string.

**Notes:** Mandatory parameter unless use_listeners_as_primary is enabled.

**Example.** 192.168.0.100.

```opensips
...
modparam("stun", "primary_ip", "192.168.0.100")

# Example of a STUN server within OpenSIPS which is behind NAT
modparam("stun", "primary_ip", "192.168.0.100 / 64.50.46.78")
...
```
### `primary_port` (string)

The port configured (together with the primary_ip) as an UDP SIP listener in OpenSIPS. The default value is 5060. Syntax: "port [/ advertised_port] By default, the primary_port and the advertised primary_port will be identical. This may be changed with an optional "/ adv_port" string.

*Default value is 5060.*

**Example.** 5060.

```opensips
...
modparam("stun", "primary_port", "5060")

# Listening on a primary port, but advertising a different one
modparam("stun", "primary_port", "5060 / 5062")
...
```
### `use_listeners_as_primary` (integer)

Setting this parameter to 1 will allow all configured UDP SIP listeners to be automatically used as "primary" STUN sockets. The primary_ip and primary_port parameters will be ignored when this behavior is enabled. The default value is 0 (disabled).

*Default value is 0.*

**Possible values:**

- 0
- 1

**Example.** 1.

```opensips
...
modparam("stun","use_listeners_as_primary",1)
...
```

## Configuration Examples

### Set `primary_ip` parameter

Demonstrates setting the `primary_ip` parameter, including the syntax for specifying an advertised IP.

```opensips
...
modparam("stun", "primary_ip", "192.168.0.100")

# Example of a STUN server within OpenSIPS which is behind NAT
modparam("stun", "primary_ip", "192.168.0.100 / 64.50.46.78")
...
```
### Set `primary_port` parameter

Demonstrates setting the `primary_port` parameter, including the syntax for specifying an advertised port.

```opensips
...
modparam("stun", "primary_port", "5060")

# Listening on a primary port, but advertising a different one
modparam("stun", "primary_port", "5060 / 5062")
...
```
### Set `alternate_ip` parameter

Demonstrates setting the `alternate_ip` parameter, including the syntax for specifying an advertised IP.

```opensips
...
modparam("stun","alternate_ip","11.22.33.44")

# Example of a STUN server within OpenSIPS which is behind NAT
modparam("stun", "alternate_ip", "192.168.0.100 / 64.78.46.50")
...
```
### Set `alternate_port` parameter

Demonstrates setting the `alternate_port` parameter, including the syntax for specifying an advertised port.

```opensips
...
modparam("stun","alternate_port","3479")

# Listening on an alternate port, but advertising a different one
modparam("stun", "alternate_port", "5060 / 5062")
...
```
### Set `use_listeners_as_primary` parameter

Demonstrates setting the `use_listeners_as_primary` parameter to 1.

```opensips
...
modparam("stun","use_listeners_as_primary",1)
...
```
