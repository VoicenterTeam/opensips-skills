# uac_auth Module Reference
<!-- generated-from: data/4.0/modules/uac_auth.json
     generator-version: 0.1.0
     opensips-version: 4.0
     doc-type: module -->

Reference for the OpenSIPs 4.0 uac_auth module. Read this file when configuring or debugging the uac_auth module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Configuration Examples](#configuration-examples)

## Overview

UAC AUTH (User Agent Client Authentication) module provides a common API for building authentication headers.

It also provides a common set of authentication credetials to be used by other modules.

Note that authentication provided by this module supports both qop "auth" and qop "auth-int" but if both values are presented by the server, "auth" will be prefered.

### 1.1.1. RFC 8760 Support (Strenghtened Authentication)

Starting with OpenSIPS 3.2, the [auth](auth), [auth_db](auth_db) and [uac_auth](uac_auth) modules include support for two new digest authentication algorithms ("SHA-256" and "SHA-512-256"), according to the [RFC 8760](https://datatracker.ietf.org/doc/html/rfc8760) specs.

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

None.

## Exported Parameters

### `auth_password_avp` (string)

The definition of an AVP that might contain the password to be used to perform authentication. The password can be provided as a plain text password or as a precalculated HA1 as a hexa (lower case) string (of 32 chars) prefixed with "0x" (so a total of 34 chars) (for example "0xc17ba8157756f263d07e158504204629")

**Notes:** If you define it, you also need to define “auth_realm_avp” and “auth_username_avp”.

**Example.** Set the `auth_password_avp` parameter.

```opensips
...
modparam("uac_auth","auth_password_avp","$avp(12)")
...
```
### `auth_realm_avp` (string)

The definition of an AVP that might contain the realm to be used to perform authentication.

**Notes:** If you define it, you also need to define “auth_username_avp” and “auth_password_avp”.

**Example.** Set the `auth_realm_avp` parameter.

```opensips
...
modparam("uac_auth","auth_realm_avp","$avp(10)")
...
```
### `auth_username_avp` (string)

The definition of an AVP that might contain the username to be used to perform authentication.

**Notes:** If you define it, you also need to define “auth_realm_avp” and “auth_password_avp”.

**Example.** Set the `auth_username_avp` parameter.

```opensips
...
modparam("uac_auth","auth_username_avp","$avp(11)")
...
```
### `credential` (string)

Contains a multiple definition of credentials used to perform authentication.

**Notes:** NOTE that the password can be provided as a plain text password or as a precalculated HA1 as a hexa (lower case) string (of 32 chars) prefixed with "0x" (so a total of 34 chars).

This parameter is required if UAC authentication is used.

**Example.** Set the `credential` parameter.

```opensips
...
modparam("uac_auth","credential","username:domain:password")
modparam("uac_auth","credential","username:domain:0xc17ba8157756f263d07e158504204629")
...
```

## Configuration Examples

### Set `credential` parameter

Contains a multiple definition of credentials used to perform authentication.

```opensips
...
modparam("uac_auth","credential","username:domain:password")
modparam("uac_auth","credential","username:domain:0xc17ba8157756f263d07e158504204629")
...
```
### Set `auth_realm_avp` parameter

The definition of an AVP that might contain the realm to be used to perform authentication.

```opensips
...
modparam("uac_auth","auth_realm_avp","$avp(10)")
...
```
### Set `auth_username_avp` parameter

The definition of an AVP that might contain the username to be used to perform authentication.

```opensips
...
modparam("uac_auth","auth_username_avp","$avp(11)")
...
```
### Set `auth_password_avp` parameter

The definition of an AVP that might contain the password to be used to perform authentication.

```opensips
...
modparam("uac_auth","auth_password_avp","$avp(12)")
...
```
