# STIR/SHAKEN Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5847552)

2.2. [Most recently active contributors(1) to this module](#idp5945232)

**List of Examples**

1.1. [Set `auth_date_freshness` parameter](#idp248320)

1.2. [Set `verify_date_freshness` parameter](#idp168400)

1.3. [Set `ca_list` parameter](#idp172560)

1.4. [Set `ca_dir` parameter](#idp5582512)

1.5. [Set `crl_list` parameter](#idp5586288)

1.6. [Set `crl_dir` parameter](#idp5591392)

1.7. [Set `e164_strict_mode` parameter](#idp5598016)

1.8. [Set `e164_max_length` parameter](#idp5602800)

1.9. [Set `require_date_hdr` parameter](#idp5610640)

1.10. [`stir_shaken_auth()` usage](#idp5642336)

1.11. [`stir_shaken_verify()` usage](#idp5662624)

1.12. [`stir_shaken_check()` usage](#idp5672288)

1.13. [`stir_shaken_check_cert()` usage](#idp5680128)

1.14. [`stir_shaken_disengagement()` usage](#idp5689184)

1.15. [`identity` usage](#idp5703488)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This module adds support for implementing STIR/SHAKEN (RFC 8224, RFC 8588) Authentication and Verification services in OpenSIPS.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _No dependencies on other OpenSIPS modules_.
    

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _openssl (libssl)_.
    

## 1.3.�Exported Parameters

### 1.3.1.�`auth_date_freshness` (integer)

The maximum number of seconds that the value in the Date header field can be older than the current time.

This parameter is only relevant for the [stir\_shaken\_auth()](#func_stir_shaken_auth "1.4.1.� stir_shaken_auth(attest, origid, cert, pkey, x5u, [orig], [dest], [out])") function.

The default value is _60_.

**Example�1.1.�Set `auth_date_freshness` parameter**

...
modparam("stir\_shaken", "auth\_date\_freshness", 300)
...

  

### 1.3.2.�`verify_date_freshness` (integer)

The maximum number of seconds that the value in the Date header field can be older than the current time. Also, if the _iat_ value in the PASSporT is different than the Date value, but remains within the permitted interval, it will be used in the verification process (for the reconstructed PASSporT) instead of the Date value.

If the [require\_date\_hdr](#param_require_date_hdr "1.3.9.�require_date_hdr (integer)") parameter is set to not required and the Date header is missing, the _iat_ value will be used for this check instead.

This parameter is only relevant for the [stir\_shaken\_verify()](#func_stir_shaken_verify "1.4.2.� stir_shaken_verify(cert, err_code, err_reason, [orig], [dest])") function.

The default value is _60_.

**Example�1.2.�Set `verify_date_freshness` parameter**

...
modparam("stir\_shaken", "verify\_date\_freshness", 300)
...

  

### 1.3.3.�`ca_list` (string)

Path to a file containing trusted CA certificates for the verifier. The certificates must be in PEM format, one after another.

**Example�1.3.�Set `ca_list` parameter**

...
modparam("stir\_shaken", "ca\_list", "/stir\_certs/ca\_list.pem")
...

  

### 1.3.4.�`ca_dir` (string)

Path to a directory containing trusted CA certificates for the verifier. The certificates in the directory must be in hashed form, as described in the [_openssl documentation_](https://www.openssl.org/docs/manmaster/man3/X509_LOOKUP_hash_dir.html) for the _Hashed Directory Method_.

**Example�1.4.�Set `ca_dir` parameter**

...
modparam("stir\_shaken", "ca\_dir", "/stir\_certs/cas")
...

  

### 1.3.5.�`crl_list` (string)

Path to a file containing certificate revocation lists (CRLs) for the verifier.

**Example�1.5.�Set `crl_list` parameter**

...
modparam("stir\_shaken", "crl\_list", "/stir\_certs/crl\_list.pem")
...

  

### 1.3.6.�`crl_dir` (string)

Path to a directory containing certificate revocation lists (CRLs) for the verifier. The CRLs in the directory must be in hashed form, as described in the [_openssl documentation_](https://www.openssl.org/docs/manmaster/man3/X509_LOOKUP_hash_dir.html) for the _Hashed Directory Method_.

**Example�1.6.�Set `crl_dir` parameter**

...
modparam("stir\_shaken", "crl\_dir", "/stir\_certs/crls")
...

  

### 1.3.7.�`e164_strict_mode` (integer)

Require a leading _"+"_ to be present in the originating/destination SHAKEN identity, on top of mandating an E.164 telephone number by default. Additionally, require the URI to be either a _tel_ URI or a _sip_ / _sips_ URI with the _user=phone_ parameter.

The default value is _0_ (disabled).

**Example�1.7.�Set `e164_strict_mode` parameter**

...
modparam("stir\_shaken", "e164\_strict\_mode", 1)
...

  

### 1.3.8.�`e164_max_length` (integer)

This parameter allows the 15-digit number length restriction of the E.164 format to be bypassed. Especially useful in scenarios where various telephony number prefixes are in use, causing some numbers to exceed the standard maximum length.

The default value is _15_.

**Example�1.8.�Set `e164_max_length` parameter**

...
modparam("stir\_shaken", "e164\_max\_length", 16)
...

  

### 1.3.9.�`require_date_hdr` (integer)

Specifies whether the Date header is mandatory when doing verification with the [stir\_shaken\_verify()](#func_stir_shaken_verify "1.4.2.� stir_shaken_verify(cert, err_code, err_reason, [orig], [dest])") function.

A value of _1_ means required and _0_ not required.

If the parameter is set to "not required" but the Date header is present in the message, the header value will be used as normally to check the freshness (as configured in the [verify\_date\_freshness](#param_verify_date_freshness "1.3.2.�verify_date_freshness (integer)") parameter). If the Date header is indeed missing, the value of the _iat_ claim in the PASSporT will be used instead.

The default value is _1_ (required).

**Example�1.9.�Set `require_date_hdr` parameter**

...
modparam("stir\_shaken", "require\_date\_hdr", 0)
...

  

## 1.4.�Exported Functions

### 1.4.1.� `stir_shaken_auth(attest, origid, cert, pkey, x5u, [orig], [dest], [out])`

This function performs the steps of an authentication service. Before calling this function though, you must ensure:

*   authority - the server is authoritative for the identity in question;
    
*   authentication - the originator is authorized to claim the given identity.
    

Meaning of the parameters is as follows:

*   _attest (string)_ - value of the 'attest' claim to be included in the PASSporT. The following values can be used:
    
    *   _A_ or _full_
        
    *   _B_ or _partial_
        
    *   _C_ or _gateway_
        
    
*   _origid (string)_ - value of the 'origid' claim to be included in the PASSporT. Treated by the module as an opaque string.
    
*   _cert (string)_ - the X.509 certificate used to compute the signature, in PEM format.
    
*   _pkey (string)_ - the private key used to compute the signature, in PEM format.
    
*   _x5u (string)_ - value of the 'x5u' claim to be included in the PASSporT. Treated by the module as an opaque string.
    
*   _orig (string, optional)_ - telephone number to be used as the originating identity in the PASSporT. If missing, this value will be derived from the SIP message.
    
*   _dest (string, optional)_ - telephone number to be used as the destination identity in the PASSporT. If missing, this value will be derived from the SIP message.
    
*   _out (string, no expand, optional)_ - name of an output variable to store the Identity header or the following flags:
    
    *   _req_ - the Identity header will be appended to the current request message;
        
    *   _rpl_ - the Identity header will be appended to all replies that will be generated by OpenSIPS for this request.
        
    
    If this parameter is missing, the Identity header will be appended to the current request message.
    
    If an output variable is provided, it should be given as a quoted string, eg. _"$var(identity\_hdr)"_.
    

The function returns the following values:

*   1: Success
    
*   \-1: Internal error
    
*   \-3: Failed to derive identity from SIP message because the URI is not a telephone number
    
*   \-4: Date header value is older than local policy for freshness
    
*   \-5: The current time or Date header value does not fall within the certificate validity
    

This function can be used from REQUEST\_ROUTE.

**Example�1.10.�`stir_shaken_auth()` usage**

...
stir\_shaken\_auth("A", "4437c7eb-8f7a-4f0e-a863-f53a0e60251a",
	$var(cert), $var(privKey), "https://certs.example.org/cert.pem");
...

  

### 1.4.2.� `stir_shaken_verify(cert, err_code, err_reason, [orig], [dest])`

This function performs the steps of an verification service.

Meaning of the parameters is as follows:

*   _cert (string)_ - the X.509 certificate used to verify the signature, in PEM format.
    
*   _err\_code (var)_ - output variable that will store the SIP response code associated with an eventual error of the verification process.
    
*   _err\_reason (var)_ - output variable that will store the SIP response reason phrase associated with an eventual error of the verification process.
    
*   _orig (string, optional)_ - telephone number to be used as the originating identity in the verification prcess. If missing, this value will be derived from the SIP message.
    
*   _dest (string, optional)_ - telephone number to be used as the destination identity in the verification process. If missing, this value will be derived from the SIP message.
    

The function returns the following values:

*   1: Success
    
*   \-1: Internal error
    
*   \-2: No Identity or Date header found
    
*   \-3: Failed to derive identity from SIP message because the URI is not a telephone number
    
*   \-4: Invalid identity header
    
*   \-5: Unsupported 'ppt' or 'alg' Identity header parameter
    
*   \-6: Date header value is older than local policy for freshness
    
*   \-7: The Date header value does not fall within the certificate validity
    
*   \-8: Invalid certificate
    
*   \-9: Signature does not verify successfully
    

This function can be used from REQUEST\_ROUTE.

**Example�1.11.�`stir_shaken_verify()` usage**

...
$var(rc) = stir\_shaken\_verify($var(cert), $var(err\_code), $var(err\_reason));
if ($var(rc) < -1) {
	send\_reply($var(err\_sip\_code), $var(err\_sip\_reason));
	exit;
}
...

  

### 1.4.3.� `stir_shaken_check()`

This function checks the Identity header in order to validate the STIR/SHAKEN information in terms of format. It detects issues such as: missing or badly formated PASSporT claims, unsupported extensions etc.

The function returns the following values:

*   1: Success
    
*   \-1: Internal error
    
*   \-2: No Identity header found
    
*   \-3: Invalid identity header
    
*   \-4: Unsupported 'ppt' or 'alg' Identity header parameter
    

This function can be used from REQUEST\_ROUTE.

**Example�1.12.�`stir_shaken_check()` usage**

...
if (stir\_shaken\_check()) {
	xlog("forwarding call to stir/shaken verification service\\n");
	...
}
...

  

### 1.4.4.� `stir_shaken_check_cert()`

This function checks if the current time falls within the given certificate's validity period.

The function returns the following values:

*   1: Success
    
*   \-1: Internal error
    
*   \-2: Certificate is not valid
    

This function can be used from REQUEST\_ROUTE.

**Example�1.13.�`stir_shaken_check_cert()` usage**

...
# update expired cached certificates
cache\_fetch("local", $identity(x5u), $var(cert));
if (!stir\_shaken\_check\_cert($var(cert))) {
	rest\_get($identity(x5u), $var(cert));
	cache\_store("local", $identity(x5u), $var(cert));
}
...

  

### 1.4.5.� `stir_shaken_disengagement(token)`

This function add P-Identity-Bypass header with token value at the end of SIP headers.

Meaning of the parameters is as follows:

*   _token (string)_ - The token provided by the authority during outage.
    

The function returns the following values:

*   1: Success
    
*   0: Failed to add P-Identity-Bypass header
    

This function can be used from REQUEST\_ROUTE.

**Example�1.14.�`stir_shaken_disengagement()` usage**

...
if ( is\_method("INVITE") && !has\_totag()) {
	# equivalent to sipmsgops module: append\_hf("P-Identity-Bypass: OSIP99-1234567890ABCDEF\\r\\n");
	stir\_shaken\_disengagement("OSIP99-1234567890ABCDEF");
}
...

  

## 1.5.�Exported Pseudo-Variables

### 1.5.1.� `$identity(field)`

This is a read-only pseudo-variable that provides access to the parsed information from the Identity header, through the following subnames:

*   _header_ - the entire PASSporT header;
    
*   _x5u_ - the value of the 'x5u' PASSporT claim;
    
*   _payload_ - the entire PASSporT payload;
    
*   _attest_ - the value of the 'attest' PASSporT claim;
    
*   _dest_ - the value of the 'tn' member of the 'dest' PASSporT claim;
    
*   _iat_ - the value of the 'iat' PASSporT claim;
    
*   _orig_ - the value of the 'tn' member of the 'orig' PASSporT claim;
    
*   _origid_ - the value of the 'origid' PASSporT claim;
    

**Example�1.15.�`identity` usage**

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
	

  

## 1.6.�Exported MI Functions

### 1.6.1.� `stir_shaken_ca_reload`

Reload the file containing trusted CA certificates for the verifier and the directory containing trusted CA certificates for the verifier.

Name: _stir\_shaken\_ca\_reload_

Parameters: _none_

MI FIFO Command Format:

...
opensips-cli -x mi stir\_shaken\_ca\_reload
"OK"
...

### 1.6.2.� `stir_shaken_crl_reload`

Reload the file containing certificate revocation lists (CRLs) for the verifier and the directory containing certificate revocation lists for the verifier.

Name: _stir\_shaken\_crl\_reload_

Parameters: _none_

MI FIFO Command Format:

...
opensips-cli -x mi stir\_shaken\_crl\_reload
"OK"
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

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

59

26

3129

324

2.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

24

18

252

123

3.

MonkeyTester

14

9

388

14

4.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

7

5

23

35

5.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

6

4

49

25

6.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

6

3

47

64

7.

kworm83

4

2

7

2

8.

tcresson

3

1

4

18

9.

Patrice Fournier

3

1

3

1

10.

Kevin

3

1

2

2

  

**All remaining contributors**: John Burke ([@john08burke](https://github.com/john08burke)), Andriy Pylypenko ([@bambyster](https://github.com/bambyster)).

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 2.2.�By Commit Activity

**Table�2.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Patrice Fournier

Nov 2025 - Nov 2025

2.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Jan 2021 - May 2025

3.

MonkeyTester

Aug 2023 - Aug 2024

4.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Mar 2024 - Jul 2024

5.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Jan 2021 - Jun 2024

6.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Nov 2019 - Apr 2024

7.

tcresson

Oct 2023 - Oct 2023

8.

Kevin

Feb 2022 - Feb 2022

9.

kworm83

Jan 2022 - Jan 2022

10.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

Oct 2019 - Aug 2021

  

**All remaining contributors**: John Burke ([@john08burke](https://github.com/john08burke)), Andriy Pylypenko ([@bambyster](https://github.com/bambyster)).

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), MonkeyTester, Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)).

_Documentation Copyrights:_

Copyright � 2019 [www.opensips-solutions.com](http://www.opensips-solutions.com/)