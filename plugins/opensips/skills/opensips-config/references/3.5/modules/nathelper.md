# nathelper Module Reference
<!-- generated-from: data/3.5/modules/nathelper.json
     generator-version: 0.1.0
     opensips-version: 3.5
     doc-type: module -->

Reference for the OpenSIPs 3.5 nathelper module. Read this file when configuring or debugging the nathelper module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Exported MI Functions](#exported-mi-functions)
- [Configuration Examples](#configuration-examples)

## Overview

This is a module to help with NAT traversal. In particular, it helps symmetric UAs that don't advertise they are symmetric and are not able to determine their public address. fix_nated_contact rewrites Contact header field with request's source address:port pair. fix_nated_sdp adds the active direction indication to SDP (flag 0x01) and updates source IP address too (flag 0x02).

Since version 2.2, stateful ping(only SIP Pings) for nathelper is available. This allows you to remove contacts from usrloc location table when max_pings_lost pings are not responded to, each ping having a response timeout of ping_threshold seconds. In order to have this functionality, contacts must have remove_on_timeout_bflag flag set when inserted into the location table.

Works with multipart messages that contain an SDP part, but not with multi-layered multipart messages.

## How It Works

Currently, the nathelper module supports two types of NAT pings:

* UDP package - 4 bytes (zero filled) UDP packages are sent to the contact address.

* Advantages: low bandwitdh traffic, easy to generate by OpenSIPS;

* Disadvantages: unidirectional traffic through NAT (inbound - from outside to inside); As many NATs do update the bind timeout only on outbound traffic, the bind may expire and closed.

* SIP request - a stateless SIP request is sent to the contact address.

* Advantages: bidirectional traffic through NAT, since each PING request from OpenSIPS (inbound traffic) will force the SIP client to generate a SIP reply (outbound traffic) - the NAT bind will be surely kept open. Since version 2.2, one can also choose to remove contacts from the location table if a certain threshold is detected.

* Disadvantages: higher bandwitdh traffic, more expensive (as time) to generate by OpenSIPS;

## Dependencies

### OpenSIPs Modules

- `clusterer` — only if "cluster_id" option is enabled
- `usrloc` — only if the NATed contacts are to be pinged

### External Libraries

None.

## Exported Parameters

### `cluster_id` (integer)

The ID of the cluster the module is part of. The clustering support is used by the nathelper module for controlling the pinging process. When part of a cluster of multiple nodes, the nodes can agree upon which node is the one responsible for pinging.

The clustering with sharing tag support may be used to control which node in the cluster will perform the pinging/probing to the contacts. See the cluster_sharing_tag option.

For more info on how to define and populate a cluster (with OpenSIPS nodes) see the "clusterer" module.

*Default value is 0 (none)..*

**Example.** 9.

```opensips
modparam("nathelper", "cluster_id", 9)
```
### `cluster_sharing_tag` (string)

The name of the sharing tag (as defined per clusterer modules) to control which node is responsible for perform pinging of the contacts. If defined, only the node with active status of this tag will perform the pinging.

The cluster_id must be defined for this option to work.

This is an optional parameter. If not set, all the nodes in the cluster will individually do the pinging.

*Default value is empty (none)..*

**Example.** vip.

```opensips
modparam("nathelper", "cluster_sharing_tag", "vip")
```
### `force_socket` (string)

Sending socket to be used for pinging contacts without local socket information (the local socket information may be lost during a restart or contact replication). If no one specified, OpenSIPS will choose the first listening interface matching the destination protocol and AF family.

*Default value is “NULL”.*

**Example.** localhost:33333.

```opensips
modparam("nathelper", "force_socket", "localhost:33333")
```
### `max_pings_lost` (integer)

Number of unresponded pings after which the contact shall be removed from the location table.

*Default value is 3 (pings)..*

**Example.** 5.

```opensips
modparam("nathelper", "max_pings_lost", 5)
```
### `natping_interval` (integer)

Period of time in seconds between sending the NAT pings to all currently registered UAs to keep their NAT bindings alive. Value of 0 disables this functionality.

*Default value is 0.*

**Notes:** Enabling the NAT pinging functionality will force the module to bind itself to USRLOC module.

**Example.** Set the `natping_interval` parameter.

```opensips
modparam("nathelper", "natping_interval", 10)
```
### `natping_partitions` (integer)

How many partitions/chunks to be used for sending the pingings. One partition means sending all pingings together. Two partitions means to send half pings and second half at a time.

*Default value is 1.*

*Valid range: up to 8.*

**Example.** Set the `natping_partitions` parameter.

```opensips
modparam("nathelper", "natping_partitions", 4)
```
### `natping_socket` (string)

Spoof the natping's source-ip to this address. Works only for IPv4.

*Default value is NULL.*

**Example.** Set the `natping_socket` parameter.

```opensips
modparam("nathelper", "natping_socket", "192.168.1.1:5006")
```
### `natping_tcp` (integer)

If the flag is set, TCP/TLS clients will also be pinged with SIP OPTIONS messages.

*Default value is 0 (not set).*

**Example.** 1.

```opensips
modparam("nathelper", "natping_tcp", 1)
```
### `nortpproxy_str` (string)

The parameter sets the SDP attribute used by nathelper to mark the packet SDP informations have already been mangled.

If empty string, no marker will be added or checked.

*Default value is a=nortpproxy:yes\r\n.*

**Notes:** The string must be a complete SDP line, including the EOH (\r\n).

**Example.** a=sdpmangled:yes\r\n.

```opensips
modparam("nathelper", "nortpproxy_str", "a=sdpmangled:yes\r\n")
```
### `oldip_skip` (string)

Parameter which specifies whether old media ip and old origin ip shall be put in the sdp body. The parameter has two values : 'o' ("a=oldoip" field shall be skipped) and 'c' ("a=oldcip" field shall be skipped).

*Default value is 0 (not set).*

**Possible values:**

- o
- c

**Example.** oc.

```opensips
modparam("nathelper", "oldip_skip", "oc")
```
### `ping_nated_only` (integer)

If this variable is set then only contacts that have “behind_NAT” flag in user location database set will get ping.

*Default value is 0.*

**Example.** Set the `ping_nated_only` parameter.

```opensips
modparam("nathelper", "ping_nated_only", 1)
```
### `ping_threshold` (integer)

If a contact does not respond in _ping_threshold_ seconds since the ping has been sent, the contact shall be removed after max_pings_lost unresponded pings.

*Default value is 3 (seconds)..*

**Example.** 10.

```opensips
modparam("nathelper", "ping_threshold", 10)
```
### `received_avp` (string)

The name of the Attribute-Value-Pair (AVP) used to store the URI containing the received IP, port and protocol. The URI is created by the [fix_nated_register()](#func_fix_nated_register "1.5.4. fix_nated_register()") function and this data may then be also picked up by the registrar module, which will attach a "Received=" attribute to the registration. Do not forget to change the value of corresponding parameter in the [registrar](registrar) module whenever you change the value of this parameter.

*Default value is "NULL" (disabled).*

**Notes:** You must set this parameter if you use [fix_nated_register()](#func_fix_nated_register "1.5.4. fix_nated_register()"). Additionally, if you are using registrar, you must also set its symmetric [received_avp](registrar#received_avp) module parameter to the **same value**.

**Example.** Set the `received_avp` parameter.

```opensips
modparam("nathelper", "received_avp", "$avp(received)")
```
### `remove_on_timeout_bflag` (string)

What branch flag to be used in order to activate usrloc contact removal when the ping_threshold is exceeded.

*Default value is NULL (disabled)..*

**Example.** SIPPING_RTO.

```opensips
modparam("nathelper", "remove_on_timeout_bflag", "SIPPING_RTO")
```
### `sipping_bflag` (string)

What branch flag should be used by the module to identify NATed contacts for which it should perform NAT ping via a SIP request instead if dummy UDP package.

*Default value is NULL (disabled)..*

**Example.** SIPPING_ENABLE.

```opensips
modparam("nathelper", "sipping_bflag", "SIPPING_ENABLE")
```
### `sipping_from` (string)

The parameter sets the SIP URI to be used in generating the SIP requests for NAT ping purposes. To enable the SIP request pinging feature, you have to set this parameter. The SIP request pinging will be used only for requests marked so.

*Default value is NULL.*

**Example.** sip:pinger@siphub.net.

```opensips
modparam("nathelper", "sipping_from", "sip:pinger@siphub.net")
```
### `sipping_ignore_rpl_codes` (CSV string)

A comma-separated list of SIP reply status codes to contact pings which are to be discarded. This may be useful for "full-sharing" user location topologies, where the location nodes are not directly facing the UAs, hence the intermediary SIP component may generate replies to offline contact ping attempts (e.g. 408 - Request Timeout) -- such ping replies should be ignored.

*Default value is "NULL" (all reply status codes are accepted)..*

**Example.** 408, 480, 404.

```opensips
modparam("nathelper", "sipping_ignore_rpl_codes", "408, 480, 404")
```
### `sipping_latency_flag` (string)

The branch flag which will be used in order to enable contact pinging latency computation and reporting via the usrloc E_UL_LATENCY_UPDATE event.

*Default value is NULL (disabled)..*

**Example.** SIPPING_CALC_LATENCY.

```opensips
modparam("nathelper", "sipping_latency_flag", "SIPPING_CALC_LATENCY")
```
### `sipping_method` (string)

The parameter sets the SIP method to be used in generating the SIP requests for NAT ping purposes.

*Default value is OPTIONS.*

**Example.** INFO.

```opensips
modparam("nathelper", "sipping_method", "INFO")
```

## Exported Functions

### `add_rcv_param([flag])`

Add received parameter to Contact header fields or Contact URI. The parameter will contain URI created from the source IP, port, and protocol of the packet containing the SIP message. The parameter can be then processed by another registrar, this is useful, for example, when replicating register messages using t_replicate function to another registrar.

**Parameters:**

- `flag` *(int, optional)* — flags to indicate if the parameter should be added to Contact URI or Contact header. If the flag is non-zero, the parameter will be added to the Contact URI. If not used or equal to zero, the parameter will go to the Contact header.

**Usable from:** REQUEST_ROUTE

**Example.** add_rcv_paramer usage.

```opensips
...
add_rcv_param(); # add the parameter to the Contact header
....
add_rcv_param(1); # add the parameter to the Contact URI
...
```

### `fix_nated_contact([uri_params])`

Rewrites the URI Contact HF to contain request's source address:port. If a list of URI parameter is provided, it will be added to the modified contact;

_IMPORTANT NOTE:_ Changes made by this function shall not be seen in the async resume route. So make sure you call it in all the resume routes where you need the contact fixed.

**Parameters:**

- `uri_params` *(string, optional)* — If a list of URI parameter is provided, it will be added to the modified contact;

**Usable from:** REQUEST_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE

**Example.** fix_nated_contact usage.

```opensips
...
if (search("User-Agent: Cisco ATA.*") {
    fix_nated_contact(";ata=cisco");
} else {
    fix_nated_contact();
}
...
```

### `fix_nated_register()`

The function creates a URI consisting of the source IP, port and protocol and stores it in the [received_avp](#param_received_avp "1.4.5.received_avp (str)") AVP. The URI will be appended as "received" parameter to Contact in 200 OK and may also be stored in the user location database if the same AVP is also configured for the [registrar](registrar) module.

**Usable from:** REQUEST_ROUTE

**Example.** fix_nated_register usage.

```opensips
...
fix_nated_register();
...
```

### `fix_nated_sdp(flags [, ip_address [, sdp_fields]])`

Alters the SDP information in orer to facilitate NAT traversal. What changes to be performed may be controled via the “flags” parameter. Since version 1.12 the name of the old ip fields are "a=oldoip" for old origin ip and "a=oldcip" for old meda ip.

**Parameters:**

- `flags` *(string, required)* — the value may be a CSV of the following flags:
  - `add-dir-active`
  - `rewrite-media-ip`
  - `add-no-rtpproxy`
  - `rewrite-origin-ip`
  - `rewrite-null-ips`
- `ip_address` *(string, optional)* — IP to be used for rewriting SDP. If not specified, the received signalling IP will be used. NOTE: For the IP to be used, you need to use 0x02 or 0x08 flags, otherwise it will have no effect.
- `sdp_fields` *(string, optional)* — SDP field(s) to be appended to SDP. Note: Each SDP field must be preceded by "\r\n".

**Usable from:** REQUEST_ROUTE, ONREPLY_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE

**Example.** fix_nated_sdp usage.

```opensips
...
# Add "a=direction:active" SDP line
# Rewrite media IP (c= line)
# Add extra "a=x-attr1" SDP line
# Add extra "a=x-attr2" SDP line
if (search("User-Agent: Cisco ATA.*")
    {fix_nated_sdp(3,,"\r\na=x-attr1\r\na=x-attr2");};
...
```

### `nat_uac_test(flags)`

Determines whether the received SIP message originated behind a NAT, using one or more pre-defined checks.

**Parameters:**

- `flags` *(string, required)* — denotes a comma-separated list of checks to be performed, as follows:
  - `private-contact`
  - `diff-ip-src-via`
  - `private-via`
  - `private-sdp`
  - `diff-port-src-via`
  - `diff-ip-src-contact`
  - `diff-port-src-contact`
  - `carrier-grade-nat`

**Return codes:**

- `true` — if any of the tests passed

**Usable from:** REQUEST_ROUTE, ONREPLY_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE

**Example.** nat_uac_test usage.

```opensips
...
# check for private Contact or SDP media IP addresses
if (nat_uac_test("private-contact,private-sdp"))
	xlog("SIP message is NAT'ed (Call-ID: $ci)\n");
...
```

## Exported MI Functions

### `nh_enable_ping`

Gets or sets the natpinging status.

**Parameters:**

- `status` *(integer, optional)* — if not provided the function returns the current natping status. Otherwise, enables natping if parameter value greater than 0 or disables natping if parameter value is 0.

**Returns:** Returns the current natping status.

**Example.** nh_enable_ping usage

```bash
$ opensips-cli -x mi nh_enable_ping
Status:: 1
$
$ opensips-cli -x mi nh_enable_ping 0
$
$ opensips-cli -x mi nh_enable_ping
Status:: 0
$
```

## Configuration Examples

### Set `natping_interval` parameter

Period of time in seconds between sending the NAT pings to all currently registered UAs to keep their NAT bindings alive. Value of 0 disables this functionality.

```opensips
...
modparam("nathelper", "natping_interval", 10)
...
```
### Set `ping_nated_only` parameter

If this variable is set then only contacts that have “behind_NAT” flag in user location database set will get ping.

```opensips
...
modparam("nathelper", "ping_nated_only", 1)
...
```
### Set `natping_partitions` parameter

How many partitions/chunks to be used for sending the pingings. One partition means sending all pingings together. Two partitions means to send half pings and second half at a time.

```opensips
...
modparam("nathelper", "natping_partitions", 4)
...
```
### Set `natping_socket` parameter

Spoof the natping's source-ip to this address. Works only for IPv4.

```opensips
...
modparam("nathelper", "natping_socket", "192.168.1.1:5006")
...
```
### Set `received_avp` parameter

The name of the Attribute-Value-Pair (AVP) used to store the URI containing the received IP, port and protocol. The URI is created by the [fix_nated_register()](#func_fix_nated_register "1.5.4. fix_nated_register()") function and this data may then be also picked up by the registrar module, which will attach a "Received=" attribute to the registration.

```opensips
...
modparam("nathelper", "received_avp", "$avp(received)")
...
```
### Set `force_socket` parameter

Sending socket to be used for pinging contacts without local socket information (the local socket information may be lost during a restart or contact replication). If no one specified, OpenSIPS will choose the first listening interface matching the destination protocol and AF family.

```opensips
...
modparam("nathelper", "force_socket", "localhost:33333")
...
```
### Set `sipping_bflag` parameter

What branch flag should be used by the module to identify NATed contacts for which it should perform NAT ping via a SIP request instead if dummy UDP package.

```opensips
...
modparam("nathelper", "sipping_bflag", "SIPPING_ENABLE")
...
```
### Set `remove_on_timeout_bflag` parameter

What branch flag to be used in order to activate usrloc contact removal when the [ping_threshold](#param_ping_threshold "1.4.16.ping_threshold (int)") is exceeded.

```opensips
...
modparam("nathelper", "remove_on_timeout_bflag", "SIPPING_RTO")
...
```
### Set `sipping_latency_flag` parameter

The branch flag which will be used in order to enable contact pinging latency computation and reporting via the usrloc E_UL_LATENCY_UPDATE event.

```opensips
...
modparam("nathelper", "sipping_latency_flag", "SIPPING_CALC_LATENCY")
...
```
### Set `sipping_ignore_rpl_codes` parameter

A comma-separated list of SIP reply status codes to contact pings which are to be discarded. This may be useful for "full-sharing" user location topologies, where the location nodes are not directly facing the UAs, hence the intermediary SIP component may generate replies to offline contact ping attempts (e.g. 408 - Request Timeout) -- such ping replies should be ignored.

```opensips
...
modparam("nathelper", "sipping_ignore_rpl_codes", "408, 480, 404")
...
```
### Set `sipping_from` parameter

The parameter sets the SIP URI to be used in generating the SIP requests for NAT ping purposes. To enable the SIP request pinging feature, you have to set this parameter. The SIP request pinging will be used only for requests marked so.

```opensips
...
modparam("nathelper", "sipping_from", "sip:pinger@siphub.net")
...
```
### Set `sipping_method` parameter

The parameter sets the SIP method to be used in generating the SIP requests for NAT ping purposes.

```opensips
...
modparam("nathelper", "sipping_method", "INFO")
...
```
### Set `nortpproxy_str` parameter

The parameter sets the SDP attribute used by nathelper to mark the packet SDP informations have already been mangled.

```opensips
...
modparam("nathelper", "nortpproxy_str", "a=sdpmangled:yes\\r\\n")
...
```
### Set `natping_tcp` parameter

If the flag is set, TCP/TLS clients will also be pinged with SIP OPTIONS messages.

```opensips
...
modparam("nathelper", "natping_tcp", 1)
...
```
### Set `oldip_skip` parameter

Parameter which specifies whether old media ip and old origin ip shall be put in the sdp body. The parameter has two values : 'o' ("a=oldoip" field shall be skipped) and 'c' ("a=oldcip" field shall be skipped).

```opensips
...
modparam("nathelper", "oldip_skip", "oc")
...
```
### Set `ping_threshold` parameter

If a contact does not respond in _ping_threshold_ seconds since the ping has been sent, the contact shall be removed after [max_pings_lost](#param_max_pings_lost "1.4.17.max_pings_lost (int)") unresponded pings.

```opensips
...
modparam("nathelper", "ping_threshold", 10)
...
```
### Set `max_pings_lost` parameter

Number of unresponded pings after which the contact shall be removed from the location table.

```opensips
...
modparam("nathelper", "max_pings_lost", 5)
...
```
### Set `cluster_id` parameter

The ID of the cluster the module is part of. The clustering support is used by the nathelper module for controlling the pinging process.

```opensips
...
# Be part of cluster ID 9
modparam("nathelper", "cluster_id", 9)
...
```
### Set `cluster_sharing_tag` parameter

The name of the sharing tag (as defined per clusterer modules) to control which node is responsible for perform pinging of the contacts. If defined, only the node with active status of this tag will perform the pinging.

```opensips
...
# only the node with the active "vip" sharing tag will perform pinging
modparam("nathelper", "cluster_id", 9)
modparam("nathelper", "cluster_sharing_tag", "vip")
...
```
### `fix_nated_contact` usage

Rewrites the URI Contact HF to contain request's source address:port. If a list of URI parameter is provided, it will be added to the modified contact;

```opensips
...
if (search("User-Agent: Cisco ATA.*") {
    fix_nated_contact(";ata=cisco");
} else {
    fix_nated_contact();
}
...
```
### `fix_nated_sdp` usage

Alters the SDP information in orer to facilitate NAT traversal. What changes to be performed may be controled via the “flags” parameter.

```opensips
...
# Add "a=direction:active" SDP line
# Rewrite media IP (c= line)
# Add extra "a=x-attr1" SDP line
# Add extra "a=x-attr2" SDP line
if (search("User-Agent: Cisco ATA.*")
    {fix_nated_sdp(3,,"\\r\\na=x-attr1\\r\\na=x-attr2");};
...
```
### `add_rcv_paramer` usage

Add received parameter to Contact header fields or Contact URI. The parameter will contain URI created from the source IP, port, and protocol of the packet containing the SIP message.

```opensips
...
add_rcv_param(); # add the parameter to the Contact header
....
add_rcv_param(1); # add the parameter to the Contact URI
...
```
### `fix_nated_register` usage

The function creates a URI consisting of the source IP, port and protocol and stores it in the [received_avp](#param_received_avp "1.4.5.received_avp (str)") AVP.

```opensips
...
fix_nated_register();
...
```
### `nat_uac_test` usage

Determines whether the received SIP message originated behind a NAT, using one or more pre-defined checks.

```opensips
...
# check for private Contact or SDP media IP addresses
if (nat_uac_test("private-contact,private-sdp"))
	xlog("SIP message is NAT'ed (Call-ID: $ci)\\n");
...
```
### `nh_enable_ping` usage

Gets or sets the natpinging status.

```opensips
...
$ opensips-cli -x mi nh_enable_ping
Status:: 1
$
$ opensips-cli -x mi nh_enable_ping 0
$
$ opensips-cli -x mi nh_enable_ping
Status:: 0
$
...
```
