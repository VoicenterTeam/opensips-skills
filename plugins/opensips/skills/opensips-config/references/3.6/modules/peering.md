# peering Module Reference
<!-- generated-from: data/3.6/modules/peering.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 peering module. Read this file when configuring or debugging the peering module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Configuration Examples](#configuration-examples)

## Overview

Peering module allows SIP providers (operators or organizations) to verify from a broker if source or destination of a SIP request is a trusted peer.

## How It Works

In order to participate in the trust community provided by a broker, each SIP provider registers with the broker the domains (host parts of SIP URIs) that they serve. When a SIP proxy of a provider needs to send a SIP request to a non-local domain, it can find out from the broker using verify_destination() function if the non-local domain is served by a trusted peer. If so, the provider receives from the broker a hash of the SIP request and a timestamp that it includes in the request to the non-local domain. When a SIP proxy of the non-local domain receives the SIP request, it, in turn, can verify from the broker using verify_source() function if the request came from a trusted peer.

Verification functions communicate with the broker using an AAA protocol.

## Dependencies

### OpenSIPs Modules

- `an AAA implementing module` — The module depends on the following modules (in the other words the listed modules must be loaded before this module)

### External Libraries

None.

## Exported Parameters

### `aaa_url` (string)

This is the url representing the AAA protocol used and the location of the configuration file of this protocol.

If the parameter is set to empty string, the AAA accounting support will be disabled (even if compiled).

*Default value is “NULL”.*

**Example.** radius:/etc/radiusclient-ng/radiusclient.conf.

```opensips
modparam("peering", "aaa_url", "radius:/etc/radiusclient-ng/radiusclient.conf")
```
### `verify_destination_service_type` (integer)

This is the value of the Service-Type AAA attribute to be used, when sender of SIP Request verifies request's destination using verify_destination() function.

*Default value is dictionary value of “Sip-Verify-Destination” Service-Type.*

**Example.** 21.

```opensips
modparam("peering", "verify_destination_service_type", 21)
```
### `verify_source_service_type` (integer)

This is the value of the Service-Type AAA attribute to be used, when receiver of SIP Request verifies request's source using verify_source() function.

*Default value is dictionary value of “Sip-Verify-Source” Service-Type.*

**Example.** 22.

```opensips
modparam("peering", "verify_source_service_type", 22)
```

## Exported Functions

### `verify_destination()`

Function verify_destination() queries from broker's AAA server if domain (host part) of Request URI is served by a trusted peer. AAA request contains the following attributes/values:

*   User-Name - Request-URI host
    
*   SIP-URI-User - Request-URI user
    
*   SIP-From-Tag - From tag
    
*   SIP-Call-Id - Call id
    
*   Service-Type - verify_destination_service_type

Function returns value 1 if domain of Request URI is served by a trusted peer and -1 otherwise. In case of positive result, AAA server returns a set of SIP-AVP reply attributes. Value of each SIP-AVP is of form:

\[#\]name(:|#)value

Value of each SIP-AVP reply attribute is mapped to an OpenSIPS AVP. Prefix # in front of name or value indicates a string name or string value, respectively.

One of the SIP-AVP reply attributes contains a string that the source peer must include "as is" in a P-Request-Hash header when it sends the SIP request to the destination peer. The string value may, for example, be of form hash@timestamp, where hash contains a hash calculated by the broker based on the attributes of the query and some local information and timestamp is the time when the calculation was done.

AVP names used in reply attributes are assigned by the broker.

**Return codes:**

- `1` — if domain of Request URI is served by a trusted peer
- `-1` — otherwise

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE

**Example.** verify_destination() usage.

```opensips
...
if (verify_destination()) {
   append_hf("P-Request-Hash: $avp(prh)\\r\\n");
}
...
```

### `verify_source()`

Function verify_source() queries from broker's AAA server if SIP request was received from a trusted peer. AAA request contains the following attributes/values:

*   User-Name - Request-URI host
    
*   SIP-URI-User - Request-URI user
    
*   SIP-From-Tag - From tag
    
*   SIP-Call-Id - Call id
    
*   SIP-Request-Hash - body of P-Request-Hash header
    
*   Service-Type - verify_source_service_type

Function returns value 1 if SIP request was received from a trusted peer and -1 otherwise. In case of positive result, AAA server may return a set of SIP-AVP reply attributes. Value of each SIP-AVP is of form:

\[#\]name(:|#)value

Value of each SIP-AVP reply attribute is mapped to an OpenSIPS AVP. Prefix # in front of name or value indicates a string name or string value, respectively.

AVP names used in reply attributes are assigned by the broker.

**Return codes:**

- `1` — if SIP request was received from a trusted peer
- `-1` — otherwise

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE

**Example.** verify_source() usage.

```opensips
...
if (is_present_hf("P-Request-Hash")) {
   if (verify_source()) {
      xlog("L_INFO", "Request came from trusted peer\\n")
   }
}
...
```

## Configuration Examples

### Set `aaa_url` parameter

Sets the aaa_url parameter.

```opensips
...
modparam("peering", "aaa_url", "radius:/etc/radiusclient-ng/radiusclient.conf")
...
```
### `verify_destination_service_type` parameter usage

Sets the verify_destination_service_type parameter.

```opensips
...
modparam("peering", "verify_destination_service_type", 21)
...
```
### `verify_source_service_type` parameter usage

Sets the verify_source_service_type parameter.

```opensips
...
modparam("peering", "verify_source_service_type", 22)
...
```
### `verify_destination()` usage

Demonstrates usage of the verify_destination() function.

```opensips
...
if (verify_destination()) {
   append_hf("P-Request-Hash: $avp(prh)\\r\\n");
}
...
```
### `verify_source()` usage

Demonstrates usage of the verify_source() function.

```opensips
...
if (is_present_hf("P-Request-Hash")) {
   if (verify_source()) {
      xlog("L_INFO", "Request came from trusted peer\\n")
   }
}
...
```
