# identity Module Reference
<!-- generated-from: data/3.4/modules/identity.json
     generator-version: 0.1.0
     opensips-version: 3.4
     doc-type: module -->

Reference for the OpenSIPs 3.4 identity module. Read this file when configuring or debugging the identity module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Configuration Examples](#configuration-examples)

## Overview

This module adds support for SIP Identity (see RFC 4474).

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

- `openssl (libssl)`

## Exported Parameters

### `authCert` (string)

Filename of certificate which belongs to `privKey`. This file must be in PEM format.

**Example.** /etc/openser/cert.pem.

```opensips
modparam("identity", "authCert", "/etc/openser/cert.pem")
```
### `caList` (string)

File containing all trusted (root) certificates for the verifier. Certificates must be in PEM format.

**Example.** /etc/openser/caList.pem.

```opensips
modparam("identity", "caList", "/etc/openser/caList.pem")
```
### `certUri` (string)

URI from which the certificate of the authentication service can be acquired. This string will be placed in the Identity-Info header.

**Example.** http://www.myserver.com/cert.pem.

```opensips
modparam("identity", "certUri", "http://www.myserver.com/cert.pem")
```
### `crlList` (string)

File containing certificate revocation lists (crls) for the verifier. Setting this parameter is only necessary if `useCrls` is set to “1”.

**Example.** /etc/openser/crls.pem.

```opensips
modparam("identity", "crlList", "/etc/openser/crls.pem")
```
### `privKey` (string)

Filename of private RSA-key of authentication service. This file must be in PEM format.

**Example.** /etc/openser/privkey.pem.

```opensips
modparam("identity", "privKey", "/etc/openser/privkey.pem")
```
### `useCrls` (integer)

Switch to decide whether to use revocation lists (“1”) or not (“0”).

*Default value is 0.*

**Possible values:**

- 0
- 1

**Example.** 1.

```opensips
modparam("identity", "useCrls", 1)
```
### `verCert` (string)

Path containing certificates for the verifier. Certificates must be in PEM format. The URI in the Identity-Info header field is used to find the corresponding certificate for the request. For this purpose the verifier replaces every character which is not alphanumeric, no “_” and no “.” with a “\-”. A “.” at the beginning of the URI is forbidden. If the URI is “http://www.test.com/cert.pem” the verifier will look for the file “http---www.test.com-cert.pem”, for example. It is also possible to store a whole certificate chain in a file. In this case certificates must be in right order, end certificate first.

**Example.** /etc/openser/verCert/.

```opensips
modparam("identity", "verCert", "/etc/openser/verCert/")
```

## Exported Functions

### `authservice()`

This function performs the steps of an authentication service. Before you call this function, you have to ensure that the server is responsible for this request (from URI matches local SIP domain) and the sender of the request is authorized to claim the identity given in the From header field.

**Return codes:**

- `-3` — Date header field does not match validity period of cert. Identity header has not been added.
- `-2` — message out of time (e.g. message to old), Identity header has not been added.
- `-1` — An error occurred.
- `1` — everything OK, Identity header has been added.

**Usable from:** REQUEST_ROUTE

**Example.** Example 1.8. `authservice()` usage.

```opensips
...
# CANCEL and ACK cannot be challenged
if (($rm=="CANCEL") || ($rm"ACK"))
{
    route(1); # forward
    exit;
}

# some clients (e.g. Kphone) do not answer, when a BYE is challenged
if ($rm=="BYE")
{
    route(1); # forward
    exit;
}

### Authentication Service ###

# check whether I am authoritative
if($fd!="mysipdomain.de")
{
    route(1); # forward
    exit;
}

if(!proxy_authorize("mysipdomain.de","subscriber"))
{
    proxy_challenge("mysipdomain.de",0);
    exit;
}

if ($au!=$fU)
{
    sl_send_reply(403, "Use From=ID");
    exit;
}
consume_credentials();
        
authservice();
switch($retcode)
{
    case -3:
        xlog("L_DBG" ,"authservice: Date header field does not match validity period of cert\n");
        break;
    case -2:
        xlog("L_DBG" ,"authservice: msg out of time (max. +- 10 minutes allowed)\n");
        break;
    case -1:
        xlog("L_DBG" ,"authservice: ERROR, returnvalue: -1\n");
        break;
    case 1:
        xlog("L_DBG" ,"authservice: everything OK\n");
        break;
    default:
        xlog("L_DBG" ,"unknown returnvalue of authservice\n");
        
}

route(1); #forward with ($retcode=1) or without ($retcode!=1) Identity header
...
```

### `verifier()`

This function performs the steps of an verifier. The returned code tells you the result of the verification.

**Return codes:**

- `-438` — Signature does not correspond to the message. 438-response should be send.
- `-437` — Certificate cannot be validated. 437-response should be send.
- `-436` — Certificate is not available. 436-response should be send.
- `-428` — Message does not have an Identity header. 428-response should be send.
- `-3` — Error verifying Date header field.
- `-2` — Authentication service is not authoritative.
- `-1` — An unknown error occurred.
- `1` — verification OK

**Usable from:** REQUEST_ROUTE

**Example.** Example 1.9. `verifier()` usage.

```opensips
...
# we have to define the same exceptions as we did for the authentication service
if (($rm=="CANCEL") || ($rm"ACK")) 
{ 
    route(1); # forward
    exit;
}
    
if ($rm=="BYE")
{
    route(1); # forward
    exit;
}
   
verifier();
switch($retcode)
{
    case -438:
        xlog("L_DBG" ,"verifier: returnvalue: -438\n");
        sl_send_reply(438, "Invalid Identity Header");
        exit;
        break;
    case -437:
        xlog("L_DBG" ,"verifier: returnvalue: -437\n");
        sl_send_reply(437, "Unsupported Certificate");
        exit;
        break;
    case -436:
        xlog("L_DBG" ,"verifier: returnvalue: -436\n");
        sl_send_reply(436, "Bad Identity-Info");
        exit;
        break;
    case -428:
        xlog("L_DBG" ,"verifier: returnvalue: -428\n");
        sl_send_reply(428, "Use Identity Header");
        exit;
        break;
    case -3:
        xlog("L_DBG" ,"verifier: error verifying Date header field\n");
        exit;
        break;
    case -2:
        xlog("L_DBG" ,"verifier: authentication service is not authoritative\n");
        exit;
        break;
    case -1:
        xlog("L_DBG" ,"verifier: ERROR, returnvalue: -1\n");
        exit;
        break;
    case 1:
        xlog("L_DBG" ,"verifier: verification OK\n");
        route(1); # forward
        exit;
        break;
    default:
        xlog("L_DBG" ,"unknown returnvalue of verifier\n");
        exit;
}
exit;
...
```

## Configuration Examples

### Example 1.1. Set privKey parameter

Filename of private RSA-key of authentication service. This file must be in PEM format.

```opensips
...
modparam("identity", "privKey", "/etc/openser/privkey.pem")
...
```

null
### Example 1.2. Set authCert parameter

Filename of certificate which belongs to privKey. This file must be in PEM format.

```opensips
...
modparam("identity", "authCert", "/etc/openser/cert.pem")
...
```

null
### Example 1.3. Set certUri parameter

URI from which the certificate of the authentication service can be acquired. This string will be placed in the Identity-Info header.

```opensips
...
modparam("identity", "certUri", "http://www.myserver.com/cert.pem")
...
```

null
### Example 1.4. Set verCert parameter

Path containing certificates for the verifier. Certificates must be in PEM format. The URI in the Identity-Info header field is used to find the corresponding certificate for the request. For this purpose the verifier replaces every character which is not alphanumeric, no “_” and no “.” with a “-”. A “.” at the beginning of the URI is forbidden. If the URI is “http://www.test.com/cert.pem” the verifier will look for the file “http---www.test.com-cert.pem”, for example. It is also possible to store a whole certificate chain in a file. In this case certificates must be in right order, end certificate first.

```opensips
...
modparam("identity", "verCert", "/etc/openser/verCert/")
...
```

null
### Example 1.5. Set caList parameter

File containing all trusted (root) certificates for the verifier. Certificates must be in PEM format.

```opensips
...
modparam("identity", "caList", "/etc/openser/caList.pem")
...
```

null
### Example 1.6. Set crlList parameter

File containing certificate revocation lists (crls) for the verifier. Setting this parameter is only necessary if useCrls is set to “1”.

```opensips
...
modparam("identity", "crlList", "/etc/openser/crls.pem")
...
```

null
### Example 1.7. Set privKey parameter

Switch to decide whether to use revocation lists (“1”) or not (“0”).

```opensips
...
modparam("identity", "useCrls", 1)
...
```

null
### Example 1.8. authservice() usage

This function performs the steps of an authentication service. Before you call this function, you have to ensure that

*   the server is responsible for this request (from URI matches local SIP domain)
    
*   the sender of the request is authorized to claim the identity given in the From header field.

```opensips
...
# CANCEL and ACK cannot be challenged
if (($rm=="CANCEL") || ($rm"ACK"))
{
    route(1); # forward
    exit;
}

# some clients (e.g. Kphone) do not answer, when a BYE is challenged
if ($rm=="BYE")
{
    route(1); # forward
    exit;
}

### Authentication Service ###

# check whether I am authoritative
if($fd!="mysipdomain.de")
{
    route(1); # forward
    exit;
}

if(!proxy_authorize("mysipdomain.de","subscriber"))
{
    proxy_challenge("mysipdomain.de",0);
    exit;
}

if ($au!=$fU)
{
    sl_send_reply(403, "Use From=ID");
    exit;
}
consume_credentials();
        
authservice();
switch($retcode)
{
    case -3:
        xlog("L_DBG" ,"authservice: Date header field does not match validity period of cert\n");
        break;
    case -2:
        xlog("L_DBG" ,"authservice: msg out of time (max. +- 10 minutes allowed)\n");
        break;
    case -1:
        xlog("L_DBG" ,"authservice: ERROR, returnvalue: -1\n");
        break;
    case 1:
        xlog("L_DBG" ,"authservice: everything OK\n");
        break;
    default:
        xlog("L_DBG" ,"unknown returnvalue of authservice\n");
        
}

route(1); #forward with ($retcode=1) or without ($retcode!=1) Identity header
...
```

null
### Example 1.9. verifier() usage

This function performs the steps of an verifier. The returned code tells you the result of the verification:

*   -438: Signature does not correspond to the message. 438-response should be send.
    
*   -437: Certificate cannot be validated. 437-response should be send.
    
*   -436: Certificate is not available. 436-response should be send.
    
*   -428: Message does not have an Identity header. 428-response should be send.
    
*   -3: Error verifying Date header field.
    
*   -2: Authentication service is not authoritative.
    
*   -1: An unknown error occurred.
    
*   1: verification OK

```opensips
...
# we have to define the same exceptions as we did for the authentication service
if (($rm=="CANCEL") || ($rm"ACK")) 
{ 
    route(1); # forward
    exit;
}
    
if ($rm=="BYE")
{
    route(1); # forward
    exit;
}
   
verifier();
switch($retcode)
{
    case -438:
        xlog("L_DBG" ,"verifier: returnvalue: -438\n");
        sl_send_reply(438, "Invalid Identity Header");
        exit;
        break;
    case -437:
        xlog("L_DBG" ,"verifier: returnvalue: -437\n");
        sl_send_reply(437, "Unsupported Certificate");
        exit;
        break;
    case -436:
        xlog("L_DBG" ,"verifier: returnvalue: -436\n");
        sl_send_reply(436, "Bad Identity-Info");
        exit;
        break;
    case -428:
        xlog("L_DBG" ,"verifier: returnvalue: -428\n");
        sl_send_reply(428, "Use Identity Header");
        exit;
        break;
    case -3:
        xlog("L_DBG" ,"verifier: error verifying Date header field\n");
        exit;
        break;
    case -2:
        xlog("L_DBG" ,"verifier: authentication service is not authoritative\n");
        exit;
        break;
    case -1:
        xlog("L_DBG" ,"verifier: ERROR, returnvalue: -1\n");
        exit;
        break;
    case 1:
        xlog("L_DBG" ,"verifier: verification OK\n");
        route(1); # forward
        exit;
        break;
    default:
        xlog("L_DBG" ,"unknown returnvalue of verifier\n");
        exit;
}
exit;
...
```

null
