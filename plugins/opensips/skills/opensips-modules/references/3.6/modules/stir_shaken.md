# stir_shaken Module Reference
<!-- generated-from: data/3.6/modules/stir_shaken.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 stir_shaken module. Read this file when configuring or debugging the stir_shaken module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Exported Pseudo-Variables](#exported-pseudo-variables)
- [Exported MI Functions](#exported-mi-functions)
- [Configuration Examples](#configuration-examples)

## Overview

This module adds support for implementing STIR/SHAKEN (RFC 8224, RFC 8588) Authentication and Verification services in OpenSIPS.

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

- `openssl (libssl)`

## Exported Parameters

### `auth_date_freshness` (integer)

The maximum number of seconds that the value in the Date header field can be older than the current time.

This parameter is only relevant for the stir_shaken_auth() function.

*Default value is 60.*

**Example.** 300.

```opensips
modparam("stir_shaken", "auth_date_freshness", 300)
```
### `ca_dir` (string)

Path to a directory containing trusted CA certificates for the verifier. The certificates in the directory must be in hashed form, as described in the openssl documentation for the Hashed Directory Method.

**Example.** /stir_certs/cas.

```opensips
modparam("stir_shaken", "ca_dir", "/stir_certs/cas")
```
### `ca_list` (string)

Path to a file containing trusted CA certificates for the verifier. The certificates must be in PEM format, one after another.

**Example.** /stir_certs/ca_list.pem.

```opensips
modparam("stir_shaken", "ca_list", "/stir_certs/ca_list.pem")
```
### `crl_dir` (string)

Path to a directory containing certificate revocation lists (CRLs) for the verifier. The CRLs in the directory must be in hashed form, as described in the openssl documentation for the Hashed Directory Method.

**Example.** /stir_certs/crls.

```opensips
modparam("stir_shaken", "crl_dir", "/stir_certs/crls")
```
### `crl_list` (string)

Path to a file containing certificate revocation lists (CRLs) for the verifier.

**Example.** /stir_certs/crl_list.pem.

```opensips
modparam("stir_shaken", "crl_list", "/stir_certs/crl_list.pem")
```
### `e164_max_length` (integer)

This parameter allows the 15-digit number length restriction of the E.164 format to be bypassed. Especially useful in scenarios where various telephony number prefixes are in use, causing some numbers to exceed the standard maximum length.

*Default value is 15.*

**Example.** 16.

```opensips
modparam("stir_shaken", "e164_max_length", 16)
```
### `e164_strict_mode` (integer)

Require a leading "+" to be present in the originating/destination SHAKEN identity, on top of mandating an E.164 telephone number by default. Additionally, require the URI to be either a tel URI or a sip / sips URI with the user=phone parameter.

*Default value is 0.*

**Example.** 1.

```opensips
modparam("stir_shaken", "e164_strict_mode", 1)
```
### `require_date_hdr` (integer)

Specifies whether the Date header is mandatory when doing verification with the stir_shaken_verify() function.

A value of 1 means required and 0 not required.

If the parameter is set to "not required" but the Date header is present in the message, the header value will be used as normally to check the freshness (as configured in the verify_date_freshness parameter). If the Date header is indeed missing, the value of the _iat_ claim in the PASSporT will be used instead.

*Default value is 1.*

**Possible values:**

- 0
- 1

**Example.** 0.

```opensips
modparam("stir_shaken", "require_date_hdr", 0)
```
### `verify_date_freshness` (integer)

The maximum number of seconds that the value in the Date header field can be older than the current time. Also, if the _iat_ value in the PASSporT is different than the Date value, but remains within the permitted interval, it will be used in the verification process (for the reconstructed PASSporT) instead of the Date value.

If the require_date_hdr parameter is set to not required and the Date header is missing, the _iat_ value will be used for this check instead.

This parameter is only relevant for the stir_shaken_verify() function.

*Default value is 60.*

**Example.** 300.

```opensips
modparam("stir_shaken", "verify_date_freshness", 300)
```

## Exported Functions

### `stir_shaken_auth(attest, origid, cert, pkey, x5u, [orig], [dest], [out])`

This function performs the steps of an authentication service. Before calling this function though, you must ensure: authority - the server is authoritative for the identity in question; authentication - the originator is authorized to claim the given identity.

**Parameters:**

- `attest` *(string, required)* — value of the 'attest' claim to be included in the PASSporT.
  - `A`
  - `full`
  - `B`
  - `partial`
  - `C`
  - `gateway`
- `cert` *(string, required)* — the X.509 certificate used to compute the signature, in PEM format.
- `dest` *(string, optional)* — telephone number to be used as the destination identity in the PASSporT. If missing, this value will be derived from the SIP message.
- `orig` *(string, optional)* — telephone number to be used as the originating identity in the PASSporT. If missing, this value will be derived from the SIP message.
- `origid` *(string, required)* — value of the 'origid' claim to be included in the PASSporT. Treated by the module as an opaque string.
- `out` *(string, optional)* — name of an output variable to store the Identity header or the following flags: req (append to current request), rpl (append to all replies). If missing, appended to current request.
  - `req`
  - `rpl`
- `pkey` *(string, required)* — the private key used to compute the signature, in PEM format.
- `x5u` *(string, required)* — value of the 'x5u' claim to be included in the PASSporT. Treated by the module as an opaque string.

**Return codes:**

- `1` — Success
- `-1` — Internal error
- `-3` — Failed to derive identity from SIP message because the URI is not a telephone number
- `-4` — Date header value is older than local policy for freshness
- `-5` — The current time or Date header value does not fall within the certificate validity

**Usable from:** REQUEST_ROUTE

**Example.** stir_shaken_auth() usage.

```opensips
stir_shaken_auth("A", "4437c7eb-8f7a-4f0e-a863-f53a0e60251a",
	$var(cert), $var(privKey), "https://certs.example.org/cert.pem");
```

### `stir_shaken_check()`

This function checks the Identity header in order to validate the STIR/SHAKEN information in terms of format. It detects issues such as: missing or badly formated PASSporT claims, unsupported extensions etc.

**Return codes:**

- `1` — Success
- `-1` — Internal error
- `-2` — No Identity header found
- `-3` — Invalid identity header
- `-4` — Unsupported 'ppt' or 'alg' Identity header parameter

**Usable from:** REQUEST_ROUTE

**Example.** stir_shaken_check() usage.

```opensips
if (stir_shaken_check()) {
	xlog("forwarding call to stir/shaken verification service\n");
	...
}
```

### `stir_shaken_check_cert()`

This function checks if the current time falls within the given certificate's validity period.

**Parameters:**

- `cert` *(string, required)* — the X.509 certificate to check, in PEM format.

**Return codes:**

- `1` — Success
- `-1` — Internal error
- `-2` — Certificate is not valid

**Usable from:** REQUEST_ROUTE

**Example.** stir_shaken_check_cert() usage.

```opensips
# update expired cached certificates
cache_fetch("local", $identity(x5u), $var(cert));
if (!stir_shaken_check_cert($var(cert))) {
	rest_get($identity(x5u), $var(cert));
	cache_store("local", $identity(x5u), $var(cert));
}
```

### `stir_shaken_disengagement(token)`

This function add P-Identity-Bypass header with token value at the end of SIP headers.

**Parameters:**

- `token` *(string, required)* — The token provided by the authority during outage.

**Return codes:**

- `1` — Success
- `0` — Failed to add P-Identity-Bypass header

**Usable from:** REQUEST_ROUTE

**Example.** stir_shaken_disengagement() usage.

```opensips
if ( is_method("INVITE") && !has_totag()) {
	# equivalent to sipmsgops module: append_hf("P-Identity-Bypass: OSIP99-1234567890ABCDEF\r\n");
	stir_shaken_disengagement("OSIP99-1234567890ABCDEF");
}
```

### `stir_shaken_verify(cert, err_code, err_reason, [orig], [dest])`

This function performs the steps of an verification service.

**Parameters:**

- `cert` *(string, required)* — the X.509 certificate used to verify the signature, in PEM format.
- `dest` *(string, optional)* — telephone number to be used as the destination identity in the verification process. If missing, this value will be derived from the SIP message.
- `err_code` *(var, required)* — output variable that will store the SIP response code associated with an eventual error of the verification process.
- `err_reason` *(var, required)* — output variable that will store the SIP response reason phrase associated with an eventual error of the verification process.
- `orig` *(string, optional)* — telephone number to be used as the originating identity in the verification prcess. If missing, this value will be derived from the SIP message.

**Return codes:**

- `1` — Success
- `-1` — Internal error
- `-2` — No Identity or Date header found
- `-3` — Failed to derive identity from SIP message because the URI is not a telephone number
- `-4` — Invalid identity header
- `-5` — Unsupported 'ppt' or 'alg' Identity header parameter
- `-6` — Date header value is older than local policy for freshness
- `-7` — The Date header value does not fall within the certificate validity
- `-8` — Invalid certificate
- `-9` — Signature does not verify successfully

**Usable from:** REQUEST_ROUTE

**Example.** stir_shaken_verify() usage.

```opensips
$var(rc) = stir_shaken_verify($var(cert), $var(err_code), $var(err_reason));
if ($var(rc) < -1) {
	send_reply($var(err_sip_code), $var(err_sip_reason));
	exit;
}
```

## Exported Pseudo-Variables

### `$identity(field)`

This is a read-only pseudo-variable that provides access to the parsed information from the Identity header, through the following subnames:

*   _header_ - the entire PASSporT header;
    
*   _x5u_ - the value of the 'x5u' PASSporT claim;
    
*   _payload_ - the entire PASSporT payload;
    
*   _attest_ - the value of the 'attest' PASSporT claim;
    
*   _dest_ - the value of the 'tn' member of the 'dest' PASSporT claim;
    
*   _iat_ - the value of the 'iat' PASSporT claim;
    
*   _orig_ - the value of the 'tn' member of the 'orig' PASSporT claim;
    
*   _origid_ - the value of the 'origid' PASSporT claim;
    
**Example 1.15. `identity` usage**

...
	# acquire the certificate to use for the verification process
	$var(rc) = rest\_get($identity(x5u), $var(cert));
	if ($var(rc) < 0) {
		send\_reply(436, "Bad Identity Info");
		exit;
	}
	...
	xlog("Verified caller:$identity(orig), attestation level: $identity(attest)\\n");
...

- **Type:** string
- **Read/write:** read-only
- **Scope:** 

**Possible values:**

- header
- x5u
- payload
- attest
- dest
- iat
- orig
- origid

## Exported MI Functions

### `stir_shaken_ca_reload`

Reload the file containing trusted CA certificates for the verifier and the directory containing trusted CA certificates for the verifier.

**Example.**

```opensips-cli
opensips-cli -x mi stir_shaken_ca_reload
"OK"
```

### `stir_shaken_crl_reload`

Reload the file containing certificate revocation lists (CRLs) for the verifier and the directory containing certificate revocation lists for the verifier.

**Example.**

```opensips-cli
opensips-cli -x mi stir_shaken_crl_reload
"OK"
```

## Configuration Examples

### Set `auth_date_freshness` parameter

The maximum number of seconds that the value in the Date header field can be older than the current time.

```opensips
...
modparam("stir_shaken", "auth_date_freshness", 300)
...
```
### Set `verify_date_freshness` parameter

The maximum number of seconds that the value in the Date header field can be older than the current time. Also, if the _iat_ value in the PASSporT is different than the Date value, but remains within the permitted interval, it will be used in the verification process (for the reconstructed PASSporT) instead of the Date value.

```opensips
...
modparam("stir_shaken", "verify_date_freshness", 300)
...
```
### Set `ca_list` parameter

Path to a file containing trusted CA certificates for the verifier. The certificates must be in PEM format, one after another.

```opensips
...
modparam("stir_shaken", "ca_list", "/stir_certs/ca_list.pem")
...
```
### Set `ca_dir` parameter

Path to a directory containing trusted CA certificates for the verifier. The certificates in the directory must be in hashed form, as described in the [_openssl documentation_](https://www.openssl.org/docs/manmaster/man3/X509_LOOKUP_hash_dir.html) for the _Hashed Directory Method_.

```opensips
...
modparam("stir_shaken", "ca_dir", "/stir_certs/cas")
...
```
### Set `crl_list` parameter

Path to a file containing certificate revocation lists (CRLs) for the verifier.

```opensips
...
modparam("stir_shaken", "crl_list", "/stir_certs/crl_list.pem")
...
```
### Set `crl_dir` parameter

Path to a directory containing certificate revocation lists (CRLs) for the verifier. The CRLs in the directory must be in hashed form, as described in the [_openssl documentation_](https://www.openssl.org/docs/manmaster/man3/X509_LOOKUP_hash_dir.html) for the _Hashed Directory Method_.

```opensips
...
modparam("stir_shaken", "crl_dir", "/stir_certs/crls")
...
```
### Set `e164_strict_mode` parameter

Require a leading _"+"_ to be present in the originating/destination SHAKEN identity, on top of mandating an E.164 telephone number by default. Additionally, require the URI to be either a _tel_ URI or a _sip_ / _sips_ URI with the _user=phone_ parameter.

```opensips
...
modparam("stir_shaken", "e164_strict_mode", 1)
...
```
### Set `e164_max_length` parameter

This parameter allows the 15-digit number length restriction of the E.164 format to be bypassed. Especially useful in scenarios where various telephony number prefixes are in use, causing some numbers to exceed the standard maximum length.

```opensips
...
modparam("stir_shaken", "e164_max_length", 16)
...
```
### Set `require_date_hdr` parameter

Specifies whether the Date header is mandatory when doing verification with the [stir\_shaken\_verify()](#func_stir_shaken_verify "1.4.2.� stir_shaken_verify(cert, err_code, err_reason, [orig], [dest])") function.

```opensips
...
modparam("stir_shaken", "require_date_hdr", 0)
...
```
### `stir_shaken_auth()` usage

This function performs the steps of an authentication service. Before calling this function though, you must ensure: authority - the server is authoritative for the identity in question; authentication - the originator is authorized to claim the given identity.

```opensips
...
stir_shaken_auth("A", "4437c7eb-8f7a-4f0e-a863-f53a0e60251a",
	$var(cert), $var(privKey), "https://certs.example.org/cert.pem");
...
```
### `stir_shaken_verify()` usage

This function performs the steps of an verification service.

```opensips
...
$var(rc) = stir_shaken_verify($var(cert), $var(err_code), $var(err_reason));
if ($var(rc) < -1) {
	send_reply($var(err_sip_code), $var(err_sip_reason));
	exit;
}
...
```
### `stir_shaken_check()` usage

This function checks the Identity header in order to validate the STIR/SHAKEN information in terms of format. It detects issues such as: missing or badly formated PASSporT claims, unsupported extensions etc.

```opensips
...
if (stir_shaken_check()) {
	xlog("forwarding call to stir/shaken verification service\n");
	...
}
...
```
### `stir_shaken_check_cert()` usage

This function checks if the current time falls within the given certificate's validity period.

```opensips
...
# update expired cached certificates
cache_fetch("local", $identity(x5u), $var(cert));
if (!stir_shaken_check_cert($var(cert))) {
	rest_get($identity(x5u), $var(cert));
	cache_store("local", $identity(x5u), $var(cert));
}
...
```
### `stir_shaken_disengagement()` usage

This function add P-Identity-Bypass header with token value at the end of SIP headers.

```opensips
...
if ( is_method("INVITE") && !has_totag()) {
	# equivalent to sipmsgops module: append_hf("P-Identity-Bypass: OSIP99-1234567890ABCDEF\r\n");
	stir_shaken_disengagement("OSIP99-1234567890ABCDEF");
}
...
```
### `identity` usage

This is a read-only pseudo-variable that provides access to the parsed information from the Identity header, through the following subnames: _header_ - the entire PASSporT header; _x5u_ - the value of the 'x5u' PASSporT claim; _payload_ - the entire PASSporT payload; _attest_ - the value of the 'attest' PASSporT claim; _dest_ - the value of the 'tn' member of the 'dest' PASSporT claim; _iat_ - the value of the 'iat' PASSporT claim; _orig_ - the value of the 'tn' member of the 'orig' PASSporT claim; _origid_ - the value of the 'origid' PASSporT claim;

```opensips
...
	# acquire the certificate to use for the verification process
	$var(rc) = rest_get($identity(x5u), $var(cert));
	if ($var(rc) < 0) {
		send_reply(436, "Bad Identity Info");
		exit;
	}
	...
	xlog("Verified caller:$identity(orig), attestation level: $identity(attest)\n");
...
```
