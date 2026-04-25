# Auth\_aaa Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5657552)

2.2. [Most recently active contributors(1) to this module](#idp5758656)

**List of Examples**

1.1. [“SIP-AVP” AAA AVP examples](#idp2198880)

1.2. [`aaa_url` parameter usage](#idp249904)

1.3. [`auth_service_type` parameter usage](#idp166400)

1.4. [Set `check_service_type` parameter](#idp172480)

1.5. [`use_ruri_flag` parameter usage](#idp5571792)

1.6. [`aaa_www_authorize` usage](#idp5587584)

1.7. [`proxy_authorize` usage](#idp5598336)

1.8. [`aaa_does_uri_exist` usage](#idp5607280)

1.9. [`aaa_does_uri_user_exist` usage](#idp5612528)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This module contains functions that are used to perform digest authentication and some URI checks against an AAA server. In order to perform the authentication, the proxy will pass along the credentials to the AAA server which will in turn send a reply containing result of the authentication. So basically the whole authentication is done in the AAA server. Before sending the request to the AAA server we perform some sanity checks over the credentials to make sure that only well formed credentials will get to the server.

## 1.2.�Additional Credentials

When performing authentication, the AAA server may include in the response additional credentials. This scheme is very useful in fetching additional user information from the AAA server without making extra queries.

The additional credentials are embedded in the AAA reply as AVPs “SIP-AVP”. The syntax of the value is:

*   _value = SIP\_AVP\_NAME SIP\_AVP\_VALUE_
    
*   _SIP\_AVP\_NAME = STRING\_NAME | '#'ID\_NUMBER_
    
*   _SIP\_AVP\_VALUE = ':'STRING\_VALUE | '#'NUMBER\_VALUE_
    

All additional credentials will be stored as OpenSIPS AVPs (SIP\_AVP\_NAME = SIP\_AVP\_VALUE).

The RPID value may be fetch via this mechanism.

**Example�1.1.�“SIP-AVP” AAA AVP examples**

....
"email:joe@yahoo.com"
    - STRING NAME AVP (email) with STRING VALUE (joe@yahoo.com)
"#14:joe@yahoo.com"
    - ID AVP (14) with STRING VALUE (joe@yahoo.com)
"age#28"
    - STRING NAME AVP (age) with INTEGER VALUE (28)
"#14#28"
    - ID AVP (14) with INTEGER VALUE (28)
....
		

  

## 1.3.�Dependencies

### 1.3.1.�OpenSIPS Modules

The module depends on the following modules (in the other words the listed modules must be loaded before this module):

*   _auth_ -- Authentication framework, only if the auth functions are used from script
    
*   _an aaa implementing module_ -- for example aaa\_radius
    

### 1.3.2.�External Libraries or Applications

This module does not depend on any external library.

## 1.4.�Exported Parameters

### 1.4.1.�`aaa_url` (string)

This is the url representing the AAA protocol used and the location of the configuration file of this protocol.

The syntax for the url is the following: "name\_of\_the\_aaa\_protocol\_used:path\_of\_the\_configuration\_file"

**Example�1.2.�`aaa_url` parameter usage**

		
modparam("auth\_aaa", "aaa\_url", "radius:/etc/radiusclient-ng/radiusclient.conf")
		

  

### 1.4.2.�`auth_service_type` (integer)

This is the value of the Service-Type aaa attribute to be used when performing an authentication operation. The default should be fine for most people. See your aaa client include files for numbers to be put in this parameter if you need to change it.

Default value is “15”.

**Example�1.3.�`auth_service_type` parameter usage**

		
modparam("auth\_aaa", "auth\_service\_type", 15)
		

  

### 1.4.3.�`check_service_type` (integer)

AAA service type used by `aaa_does_uri_exist` and `aaa_does_uri_user_exist` checks.

_Default value is 10 (Call-Check)._

**Example�1.4.�Set `check_service_type` parameter**

...
modparam("auth\_aaa", "check\_service\_type", 11)
...

  

### 1.4.4.�`use_ruri_flag` (string)

When this parameter is set to the value other than "NULL" and the request being authenticated has flag with matching number set via setflag() function, use Request URI instead of uri parameter value from the Authorization / Proxy-Authorization header field to perform AAA authentication. This is intended to provide workaround for misbehaving NAT / routers / ALGs that alter request in the transit, breaking authentication. At the time of this writing, certain versions of Linksys WRT54GL are known to do that.

Default value is “NULL” (not set).

**Example�1.5.�`use_ruri_flag` parameter usage**

		
modparam("auth\_aaa", "use\_ruri\_flag", "USE\_RURI\_FLAG")
		

  

## 1.5.�Exported Functions

### 1.5.1.�`aaa_www_authorize(realm, [uri_user])`

The function verifies credentials according to [RFC2617](http://www.ietf.org/rfc/rfc2617.txt). If the credentials are verified successfully then the function will succeed and mark the credentials as authorized (marked credentials can be later used by some other functions). If the function was unable to verify the credentials for some reason then it will fail and the script should call `www_challenge` which will challenge the user again.

Negative codes may be interpreted as follows:

*   _\-5 (generic error)_ - some generic error occurred and no reply was sent out;
    
*   _\-4 (no credentials)_ - credentials were not found in request;
    
*   _\-3 (stale nonce)_ - stale nonce;
    

This function will, in fact, perform sanity checks over the received credentials and then pass them along to the aaa server which will verify the credentials and return whether they are valid or not.

Meaning of the parameter is as follows:

*   _realm (string)_ - Realm is a opaque string that the user agent should present to the user so he can decide what username and password to use. Usually this is domain of the host the server is running on.
    
    If an empty string “” is used then the server will generate it from the request. In case of REGISTER requests To header field domain will be used (because this header field represents a user being registered), for all other messages From header field domain will be used.
    
    The string may contain pseudo variables.
    
*   _uri\_user (string, optional)_ - value passed to the Radius server as value of the SIP-URI-User check item. If this parameter is not present, the server will generate the SIP-URI-User check item value from the username part of the To header field URI.
    

This function can be used from REQUEST\_ROUTE.

**Example�1.6.�`aaa_www_authorize` usage**

		
...
if (!aaa\_www\_authorize("siphub.net"))
	www\_challenge("siphub.net", "auth");
...

  

### 1.5.2.�`aaa_proxy_authorize(realm, [uri_user])`

The function verifies credentials according to [RFC2617](http://www.ietf.org/rfc/rfc2617.txt). If the credentials are verified successfully then the function will succeed and mark the credentials as authorized (marked credentials can be later used by some other functions). If the function was unable to verify the credentials for some reason then it will fail and the script should call `proxy_challenge` which will challenge the user again. For more about the negative return codes, see the above function.

This function will, in fact, perform sanity checks over the received credentials and then pass them along to the aaa server which will verify the credentials and return whether they are valid or not.

Meaning of the parameters is as follows:

*   _realm (string)_ - Realm is a opaque string that the user agent should present to the user so he can decide what username and password to use. This is usually one of the domains the proxy is responsible for. If an empty string “” is used then the server will generate realm from host part of From header field URI.
    
    The string may contain pseudo variables.
    
*   _uri\_user (string, optional)_ - value passed to the Radius server as value of the SIP-URI-User check item. If this parameter is not present, the server will generate the SIP-URI-User check item value from the username part of the To header field URI.
    

This function can be used from REQUEST\_ROUTE.

**Example�1.7.�`proxy_authorize` usage**

		
...
if (!aaa\_proxy\_authorize(""))    # Realm and URI user will be autogenerated
	proxy\_challenge("", "auth");
...
if (!aaa\_proxy\_authorize($pd, $pU))    # Realm and URI user are taken
	proxy\_challenge($pd, "auth");  # from P-Preferred-Identity
                                       # header field
...

  

### 1.5.3.� `aaa_does_uri_exist([sip_uri])`

Checks from Radius if the SIP URI stored in the "sip\_uri" parameter (or user@host part of the Request-URI if "sip\_uri" is not given) belongs to a local user. Can be used to decide if 404 or 480 should be returned after lookup has failed. If yes, loads AVP based on SIP-AVP reply items returned from Radius. Each SIP-AVP reply item must have a string value of form:

*   _value = SIP\_AVP\_NAME SIP\_AVP\_VALUE_
    
*   _SIP\_AVP\_NAME = STRING\_NAME | '#'ID\_NUMBER_
    
*   _SIP\_AVP\_VALUE = ':'STRING\_VALUE | '#'NUMBER\_VALUE_
    

Returns 1 if Radius returns Access-Accept, -1 if Radius returns Access-Reject, and -2 in case of internal error.

This function can be used from REQUEST\_ROUTE.

**Example�1.8.�`aaa_does_uri_exist` usage**

...
if (aaa\_does\_uri\_exist()) {
	...
};
...

  

### 1.5.4.� `aaa_does_uri_user_exist([sip_uri])`

Similar to aaa\_does\_uri\_exist, but check is done based only on Request-URI user part or user stored in "sip\_uri". The user should thus be unique among all users, such as an E.164 number.

This function can be used from REQUEST\_ROUTE.

**Example�1.9.�`aaa_does_uri_user_exist` usage**

...
if (aaa\_does\_uri\_user\_exist()) {
	...
};
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

Jan Janak ([@janakj](https://github.com/janakj))

87

24

3294

2182

2.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

44

31

892

255

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

24

20

96

144

4.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

15

13

67

55

5.

Irina-Maria Stanescu

15

8

185

299

6.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

13

8

171

175

7.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

9

7

12

14

8.

Juha Heinanen ([@juha-h](https://github.com/juha-h))

8

5

142

53

9.

Andrei Pelinescu-Onciul

7

5

8

2

10.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

7

2

55

213

  

**All remaining contributors**: Jiri Kuthan ([@jiriatipteldotorg](https://github.com/jiriatipteldotorg)), Henning Westerholt ([@henningw](https://github.com/henningw)), Ancuta Onofrei, Anatoly Pidruchny, Peter Nixon, Konstantin Bokarius, Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Edson Gellert Schubert.

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

Jan 2013 - May 2024

2.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Dec 2003 - Feb 2023

3.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Jun 2005 - May 2020

4.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Feb 2012 - Sep 2019

5.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Apr 2019

6.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

7.

Irina-Maria Stanescu

Aug 2009 - Apr 2010

8.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

Oct 2005 - Mar 2008

9.

Konstantin Bokarius

Mar 2008 - Mar 2008

10.

Edson Gellert Schubert

Feb 2008 - Feb 2008

  

**All remaining contributors**: Juha Heinanen ([@juha-h](https://github.com/juha-h)), Henning Westerholt ([@henningw](https://github.com/henningw)), Ancuta Onofrei, Anatoly Pidruchny, Peter Nixon, Jan Janak ([@janakj](https://github.com/janakj)), Andrei Pelinescu-Onciul, Jiri Kuthan ([@jiriatipteldotorg](https://github.com/jiriatipteldotorg)).

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Irina-Maria Stanescu, Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Maksym Sobolyev ([@sobomax](https://github.com/sobomax)), Henning Westerholt ([@henningw](https://github.com/henningw)), Anatoly Pidruchny, Juha Heinanen ([@juha-h](https://github.com/juha-h)), Jan Janak ([@janakj](https://github.com/janakj)).

_Documentation Copyrights:_

Copyright � 2005-2009 Voice Sistem SRL

Copyright � 2002-2003 FhG FOKUS