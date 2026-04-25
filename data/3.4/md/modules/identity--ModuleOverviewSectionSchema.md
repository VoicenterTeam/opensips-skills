# Identity Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5596752)

2.2. [Most recently active contributors(1) to this module](#idp5696272)

**List of Examples**

1.1. [Set `privKey` parameter](#idp4550960)

1.2. [Set `authCert` parameter](#idp261376)

1.3. [Set `certUri` parameter](#idp250224)

1.4. [Set `verCert` parameter](#idp168848)

1.5. [Set `caList` parameter](#idp173056)

1.6. [Set `crlList` parameter](#idp5520304)

1.7. [Set `privKey` parameter](#idp5525968)

1.8. [`authservice()` usage](#idp5537344)

1.9. [`verifier()` usage](#idp5558208)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This module adds support for SIP Identity (see RFC 4474).

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _No dependencies on other OpenSIPS modules_.
    

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _openssl (libssl)_.
    

## 1.3.�Exported Parameters

### 1.3.1.�`privKey` (string)

Filename of private RSA-key of authentication service. This file must be in PEM format.

**Example�1.1.�Set `privKey` parameter**

...
modparam("identity", "privKey", "/etc/openser/privkey.pem")
...

  

### 1.3.2.�`authCert` (string)

Filename of certificate which belongs to `privKey`. This file must be in PEM format.

**Example�1.2.�Set `authCert` parameter**

...
modparam("identity", "authCert", "/etc/openser/cert.pem")
...

  

### 1.3.3.�`certUri` (string)

URI from which the certificate of the authentication service can be acquired. This string will be placed in the Identity-Info header.

**Example�1.3.�Set `certUri` parameter**

...
modparam("identity", "certUri", "http://www.myserver.com/cert.pem")
...

  

### 1.3.4.�`verCert` (string)

Path containing certificates for the verifier. Certificates must be in PEM format. The URI in the Identity-Info header field is used to find the corresponding certificate for the request. For this purpose the verifier replaces every character which is not alphanumeric, no “\_” and no “.” with a “\-”. A “.” at the beginning of the URI is forbidden. If the URI is “http://www.test.com/cert.pem” the verifier will look for the file “http---www.test.com-cert.pem”, for example. It is also possible to store a whole certificate chain in a file. In this case certificates must be in right order, end certificate first.

**Example�1.4.�Set `verCert` parameter**

...
modparam("identity", "verCert", "/etc/openser/verCert/")
...

  

### 1.3.5.�`caList` (string)

File containing all trusted (root) certificates for the verifier. Certificates must be in PEM format.

**Example�1.5.�Set `caList` parameter**

...
modparam("identity", "caList", "/etc/openser/caList.pem")
...

  

### 1.3.6.�`crlList` (string)

File containing certificate revocation lists (crls) for the verifier. Setting this parameter is only necessary if `useCrls` is set to “1”.

**Example�1.6.�Set `crlList` parameter**

...
modparam("identity", "crlList", "/etc/openser/crls.pem")
...

  

### 1.3.7.�`useCrls` (integer)

Switch to decide whether to use revocation lists (“1”) or not (“0”).

_Default value is “0”._

**Example�1.7.�Set `privKey` parameter**

...
modparam("identity", "useCrls", 1)
...

  

## 1.4.�Exported Functions

### 1.4.1.� `authservice()`

This function performs the steps of an authentication service. Before you call this function, you have to ensure that

*   the server is responsible for this request (from URI matches local SIP domain)
    
*   the sender of the request is authorized to claim the identity given in the From header field.
    

This function returns the following values:

*   \-3: Date header field does not match validity period of cert. Identity header has not been added.
    
*   \-2: message out of time (e.g. message to old), Identity header has not been added.
    
*   \-1: An error occurred.
    
*   1: everything OK, Identity header has been added.
    

This function can be used from REQUEST\_ROUTE.

**Example�1.8.�`authservice()` usage**

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

if(!proxy\_authorize("mysipdomain.de","subscriber"))
{
    proxy\_challenge("mysipdomain.de",0);
    exit;
}

if ($au!=$fU)
{
    sl\_send\_reply(403, "Use From=ID");
    exit;
}
consume\_credentials();
        
authservice();
switch($retcode)
{
    case -3:
        xlog("L\_DBG" ,"authservice: Date header field does not match validity period of cert\\n");
        break;
    case -2:
        xlog("L\_DBG" ,"authservice: msg out of time (max. +- 10 minutes allowed)\\n");
        break;
    case -1:
        xlog("L\_DBG" ,"authservice: ERROR, returnvalue: -1\\n");
        break;
    case 1:
        xlog("L\_DBG" ,"authservice: everything OK\\n");
        break;
    default:
        xlog("L\_DBG" ,"unknown returnvalue of authservice\\n");
        
}

route(1); #forward with ($retcode=1) or without ($retcode!=1) Identity header
...

  

### 1.4.2.� `verifier()`

This function performs the steps of an verifier. The returned code tells you the result of the verification:

*   \-438: Signature does not correspond to the message. 438-response should be send.
    
*   \-437: Certificate cannot be validated. 437-response should be send.
    
*   \-436: Certificate is not available. 436-response should be send.
    
*   \-428: Message does not have an Identity header. 428-response should be send.
    
*   \-3: Error verifying Date header field.
    
*   \-2: Authentication service is not authoritative.
    
*   \-1: An unknown error occurred.
    
*   1: verification OK
    

This function can be used from REQUEST\_ROUTE.

**Example�1.9.�`verifier()` usage**

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
        xlog("L\_DBG" ,"verifier: returnvalue: -438\\n");
        sl\_send\_reply(438, "Invalid Identity Header");
        exit;
        break;
    case -437:
        xlog("L\_DBG" ,"verifier: returnvalue: -437\\n");
        sl\_send\_reply(437, "Unsupported Certificate");
        exit;
        break;
    case -436:
        xlog("L\_DBG" ,"verifier: returnvalue: -436\\n");
        sl\_send\_reply(436, "Bad Identity-Info");
        exit;
        break;
    case -428:
        xlog("L\_DBG" ,"verifier: returnvalue: -428\\n");
        sl\_send\_reply(428, "Use Identity Header");
        exit;
        break;
    case -3:
        xlog("L\_DBG" ,"verifier: error verifying Date header field\\n");
        exit;
        break;
    case -2:
        xlog("L\_DBG" ,"verifier: authentication service is not authoritative\\n");
        exit;
        break;
    case -1:
        xlog("L\_DBG" ,"verifier: ERROR, returnvalue: -1\\n");
        exit;
        break;
    case 1:
        xlog("L\_DBG" ,"verifier: verification OK\\n");
        route(1); # forward
        exit;
        break;
    default:
        xlog("L\_DBG" ,"unknown returnvalue of verifier\\n");
        exit;
}
exit;
...

  

## 1.5.�Known Limitations

*   Certificates are not downloaded. They have to be stored locally.
    
*   Call-IDs of valid requests containing an Identity header are not recorded. Hence the verifier does not provide full replay protection.
    
*   Authentication service and verifier use the original request. Changes resulting from message processing in OpenSER script are ignored.
    

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

Alexander Christ

22

1

2571

0

2.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

14

12

28

19

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

12

9

23

69

4.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

11

9

82

24

5.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

6

4

15

16

6.

Sergio Gutierrez

4

2

7

2

7.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

4

2

3

20

8.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

3

1

18

2

9.

Juli�n Moreno Pati�o

3

1

2

2

10.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

3

1

1

1

  

**All remaining contributors**: Sa�l Ibarra Corretg� ([@saghul](https://github.com/saghul)).

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 2.2.�By Commit Activity

**Table�2.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Mar 2014 - May 2024

2.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Sep 2020 - Feb 2023

3.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Aug 2015 - Jan 2021

4.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Apr 2019

5.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Jul 2009 - Apr 2019

6.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

7.

Juli�n Moreno Pati�o

Feb 2016 - Feb 2016

8.

Sa�l Ibarra Corretg� ([@saghul](https://github.com/saghul))

Oct 2014 - Oct 2014

9.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

Jan 2013 - Jan 2013

10.

Sergio Gutierrez

Feb 2009 - Feb 2009

  

**All remaining contributors**: Alexander Christ.

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Alexander Christ.

_Documentation Copyrights:_

Copyright � 2007 Alexander Christ, Cologne University of Applied Sciences