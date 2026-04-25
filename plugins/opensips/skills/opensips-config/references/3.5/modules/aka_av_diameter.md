# aka_av_diameter Module Reference
<!-- generated-from: data/3.5/modules/aka_av_diameter.json
     generator-version: 0.1.0
     opensips-version: 3.5
     doc-type: module -->

Reference for the OpenSIPs 3.5 aka_av_diameter module. Read this file when configuring or debugging the aka_av_diameter module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Configuration Examples](#configuration-examples)

## Overview

This module is an extension to the _AKA_AUTH_ module providing a Diameter AKA AV Manager that implements the Multimedia-Auth-Request and Multimedia-Auth-Answer Diameter commands defined in the _Cx_ interface of the _ETSI TS 129 229_ specifications in order to fetch a set of authentication vectors and feed them in the AKA authentication process.

## How It Works

When the _AKA_AUTH_ module needs a new authentication vector to do an _aka_challenge()_, it may require this module to fetch a set of authentication vectors for the purpose. The module packs the query in a _MAR_ (Multimedia-Auth-Request) command and sends it to an _HSS_ Diameter server. When an _MAA_ (Multimedia-Auth-Answer) command is received in response, the corresponding authentication vectors are gathered and fed back to the _AUTH_AKA_ engine.

It uses the _AAA_Diameter_ module to perform the Diameter requests. It may run in both a synchronous and asynchronous mode, depending on how the _AUTH_AKA_ module performs the query.

## Dependencies

### OpenSIPs Modules

- `aaa_diameter` — AAA Diameter module that implements the Diameter communication to the _HSS_ Server
- `auth_aka` — AKA Authentication module that triggers the AKA authentication process

### External Libraries

None.

## Exported Parameters

### `aaa_url` (string)

This is the url representing the connection to the AAA server.

**Notes:** Currently the module only supports connections to a Diameter server. The path to the AVPs configuration file is also required, otherwise the module will not start, or not work properly.

**Example.** diameter:freeDiameter.conf;extra-avps-file:/etc/freeDiameter/aka_av_diameter.dictionary.

```opensips
modparam("auth_aaa", "aaa_url", "diameter:freeDiameter.conf;extra-avps-file:/etc/freeDiameter/aka_av_diameter.dictionary")
```
### `realm` (string)

The Realm used in the Origin Diameter commands.

*Default value is diameter.test.*

**Example.** scscf.ims.mnc001.mcc001.3gppnetwork.org.

```opensips
modparam("aka_av_diameter", "realm", "scscf.ims.mnc001.mcc001.3gppnetwork.org")
```

## Configuration Examples

### `aaa_url` parameter usage

This is the url representing the connection to the AAA server.

```opensips
modparam("auth_aaa", "aaa_url", "diameter:freeDiameter.conf;extra-avps-file:/etc/freeDiameter/aka_av_diameter.dictionary")
```
### `realm` parameter usage

The Realm used in the Origin Diameter commands.

```opensips
modparam("aka_av_diameter", "realm", "scscf.ims.mnc001.mcc001.3gppnetwork.org")
```
### Diameter Commands File Example

File that should be provided to the _aaa_diameter_ connection.

```opensips
VENDOR 10415 TGPP

ATTRIBUTE Public-Identity                     601 string     10415
ATTRIBUTE Server-Name                         602 string     10415
ATTRIBUTE 3GPP-SIP-Number-Auth-Items          607 unsigned32 10415
ATTRIBUTE 3GPP-SIP-Authentication-Scheme      608 utf8string 10415
ATTRIBUTE 3GPP-SIP-Authenticate               609 hexstring  10415
ATTRIBUTE 3GPP-SIP-Authorization              610 hexstring  10415
ATTRIBUTE 3GPP-SIP-Authentication-Context     611 string     10415
ATTRIBUTE 3GPP-SIP-Item-Number                613 unsigned32 10415
ATTRIBUTE Confidentiality-Key                 625 hexstring  10415
ATTRIBUTE Integrity-Key                       626 hexstring  10415

ATTRIBUTE 3GPP-SIP-Auth-Data-Item             612 grouped    10415
{
	3GPP-SIP-Item-Number | OPTIONAL | 1
	3GPP-SIP-Authentication-Scheme | OPTIONAL | 1
	3GPP-SIP-Authenticate | OPTIONAL | 1
	3GPP-SIP-Authorization | OPTIONAL | 1
	3GPP-SIP-Authentication-Context | OPTIONAL | 1
	Confidentiality-Key | OPTIONAL | 1
	Integrity-Key | OPTIONAL | 1
}

APPLICATION-AUTH 16777216/10415 3GPP Cx

REQUEST 303 Multimedia-Auth Request
{
	Session-Id | REQUIRED | 1
	Origin-Host | REQUIRED | 1
	Origin-Realm | REQUIRED | 1
	Destination-Realm | REQUIRED | 1
	Vendor-Specific-Application-Id | REQUIRED | 1
	Auth-Session-State | REQUIRED | 1
	User-Name | REQUIRED | 1
	Public-Identity | REQUIRED | 1
	3GPP-SIP-Number-Auth-Items | REQUIRED | 1
	3GPP-SIP-Auth-Data-Item | REQUIRED | 1
	Server-Name | REQUIRED | 1
}

ANSWER 303 Multimedia-Auth Answer
{
	Session-Id | REQUIRED | 1
	Origin-Host | REQUIRED | 1
	Origin-Realm | REQUIRED | 1
	Destination-Host | OPTIONAL | 1
	Destination-Realm | OPTIONAL | 1
	Vendor-Specific-Application-Id | REQUIRED | 1
	Auth-Session-State | REQUIRED | 1
	User-Name | REQUIRED | 1
	Public-Identity | REQUIRED | 1
	3GPP-SIP-Number-Auth-Items | REQUIRED | 1
	3GPP-SIP-Auth-Data-Item | REQUIRED | 1
	Result-Code | REQUIRED | 1
}
```
