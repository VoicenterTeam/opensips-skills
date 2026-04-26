# mangler Module Reference
<!-- generated-from: data/4.0/modules/mangler.json
     generator-version: 0.1.0
     opensips-version: 4.0
     doc-type: module -->

Reference for the OpenSIPs 4.0 mangler module. Read this file when configuring or debugging the mangler module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Configuration Examples](#configuration-examples)

## Overview

This is a module to help with SDP mangling. Note: This module is obselete and will be removed for the 1.5.0 release.

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

None.

## Exported Parameters

### `contact_flds_separator` (string)

First char of this parameter is used as separator for encoding/decoding Contact header.

*Default value is *.*

**Notes:** First char of this field must be set to a value which is not used inside username,password or other fields of contact. Otherwise it is possible for the decoding step to fail/produce wrong results.

then an encoded uri might look sip:user-password-ip-port-protocol@PublicIP

**Example.** -.

```opensips
...
modparam("mangler", "contact_flds_separator", "-")
...
```

## Exported Functions

### `decode_contact()`

This function will decode the URI in first line in packets which come with encoded URI in the following manner sip:enc_pref*username*ip*port*protocol@public_ip goes to sip:username:password@ip:port;transport=protocol It uses the default set parameter for contact encoding separator.

**Return codes:**

- `negative` — on error
- `1` — on success

**Usable from:** REQUEST_ROUTE

**Example.** `decode_contact` usage.

```opensips
if ($ru =~ "^enc*") { decode_contact(); }
```

### `decode_contact_header()`

This function will decode URIs inside Contact header in the following manner sip:enc_pref*username*ip*port*protocol@public_ip goes to sip:username:password@ip:port;transport=protocol. It uses the default set parameter for contact encoding separator.

**Return codes:**

- `negative` — on error
- `1` — on success

**Usable from:** REQUEST_ROUTE, ONREPLY_ROUTE

**Example.** `decode_contact_header` usage.

```opensips
if ($ru =~ "^enc*") { decode_contact_header(); }
```

### `encode_contact(encoding_prefix, public_ip)`

This function will encode uri-s inside Contact header in the following manner sip:username:password@ip:port;transport=protocol goes sip:enc_pref*username*ip*port*protocol@public_ip * is the default separator.

**Parameters:**

- `encoding_prefix` *(string, required)* — Something to allow us to determine that a contact is encoded publicip--a routable IP, most probably you should put your external IP of your NAT box.
- `public_ip` *(string, required)* — The public IP which will be used in the encoded contact, as described by the example above.

**Return codes:**

- `negative` — on error
- `1` — on success

**Usable from:** REQUEST_ROUTE, ONREPLY_ROUTE

**Example.** `encode_contact` usage.

```opensips
if ($si == 10.0.0.0/8) encode_contact("enc_prefix","193.175.135.38");
```

### `sdp_mangle_ip(pattern, newip)`

Changes IP addresses inside SDP package in lines describing connections like c=IN IP4 Currently in only changes IP4 addresses since IP6 probably will not need to traverse NAT :)

**Parameters:**

- `newip` *(string, required)* — the new IP to be put inside SDP package if old IP address matches pattern.
- `pattern` *(string, required)* — A pair ip/mask used to match IP's located inside SDP package in lines c=IN IP4 ip. This lines will only be mangled if located IP is in the network described by this pattern. Examples of valid patterns are “10.0.0.0/255.0.0.0” or “10.0.0.0/8” etc.
  - `10.0.0.0/255.0.0.0`
  - `10.0.0.0/8`

**Return codes:**

- `negative` — on error
- `number of replacements + 1` — on success

**Usable from:** REQUEST_ROUTE, ONREPLY_ROUTE

**Example.** `sdp_mangle_ip` usage.

```opensips
sdp_mangle_ip("10.0.0.0/8","193.175.135.38");
```

### `sdp_mangle_port(offset)`

Changes ports inside SDP package in lines describing media like m=audio 13451.

**Parameters:**

- `offset` *(int, required)* — an integer which will be added/subtracted from the located port.

**Return codes:**

- `negative` — on error
- `number of replacements + 1` — on success

**Usable from:** REQUEST_ROUTE, ONREPLY_ROUTE

**Example.** `sdp_mangle_port` usage.

```opensips
sdp_mangle_port(-12000);
```

## Configuration Examples

### Set `db_url` parameter

Set `contact_flds_separator` parameter

```opensips
...
modparam("mangler", "contact_flds_separator", "-")
...
```

then an encoded uri might look sip:user-password-ip-port-protocol@PublicIP
### `sdp_mangle_ip` usage

Usage of `sdp_mangle_ip` function

```opensips
...
sdp_mangle_ip("10.0.0.0/8","193.175.135.38");
...
```
### `sdp_mangle_port` usage

Usage of `sdp_mangle_port` function

```opensips
...
sdp_mangle_port(-12000);
...
```
### `encode_contact` usage

Usage of `encode_contact` function

```opensips
...
if ($si == 10.0.0.0/8) encode_contact("enc_prefix","193.175.135.38"); 
...
```
### `decode_contact` usage

Usage of `decode_contact` function

```opensips
...
if ($ru =~ "^enc\*") { decode_contact(); }
...
```
### `decode_contact_header` usage

Usage of `decode_contact_header` function

```opensips
...
if ($ru =~ "^enc\*") { decode_contact_header(); }
...
```
