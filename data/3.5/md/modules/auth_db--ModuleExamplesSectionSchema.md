# Auth\_db Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5763472)

2.2. [Most recently active contributors(1) to this module](#idp5866848)

**List of Examples**

1.1. [`db_url` parameter usage](#idp4700336)

1.2. [`calculate_ha1` parameter usage](#idp188960)

1.3. [`use_domain` parameter usage](#idp5530880)

1.4. [`load_credentials` parameter usage](#idp5538160)

1.5. [`skip_version_check` parameter usage](#idp5542800)

1.6. [`user_column` parameter usage](#idp5547296)

1.7. [`domain_column` parameter usage](#idp5551808)

1.8. [`password_column` parameter usage](#idp5556912)

1.9. [`password_column` parameter usage](#idp5561840)

1.10. [`password_column` parameter usage](#idp5566768)

1.11. [Set `uri_user_column` parameter](#idp5571456)

1.12. [Set `uri_domain_column` parameter](#idp5576272)

1.13. [Set `uriuser_column` parameter](#idp5581696)

1.14. [`www_authorize` usage](#idp5599536)

1.15. [proxy\_authorize usage](#idp5615440)

1.16. [`db_is_to_authorized` usage](#idp5622752)

1.17. [`db_does_uri_exist` usage](#idp5633504)

1.18. [`db_get_auth_id` usage](#idp5643760)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This module contains all authentication related functions that need the access to the database. This module should be used together with auth module, it cannot be used independently because it depends on the module. Select this module if you want to use database to store authentication information like subscriber usernames and passwords. If you want to use radius authentication, then use auth\_radius instead.

### 1.1.1.�RFC 8760 Support (Strenghtened Authentication)

Starting with OpenSIPS 3.2, the [auth](auth), [auth\_db](auth_db) and [uac\_auth](uac_auth) modules include support for two new digest authentication algorithms ("SHA-256" and "SHA-512-256"), according to the [RFC 8760](https://datatracker.ietf.org/doc/html/rfc8760) specs.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The module depends on the following modules (in the other words the listed modules must be loaded before this module):

*   _auth_ -- Generic authentication functions
    
*   _database_ -- Any database module (currently mysql, postgres, dbtext)
    

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _none_
    

## 1.3.�Exported Parameters

### 1.3.1.�`db_url` (string)

This is URL of the database to be used. Value of the parameter depends on the database module used. For example for mysql and postgres modules this is something like mysql://username:password@host:port/database. For dbtext module (which stores data in plaintext files) it is directory in which the database resides.

_Default value is “mysql://opensipsro:opensipsro@localhost/opensips”._

**Example�1.1.�`db_url` parameter usage**

modparam("auth\_db", "db\_url", "dbdriver://username:password@dbhost/dbname")

  

### 1.3.2.�`calculate_ha1` (integer)

This parameter tells the server whether it should considered the loaded password (for authentification) as plaintext passwords or a pre-calculated HA1 string.

Possible meanings of this parameter are:

*   _1 (calculate HA1)_ - the loaded password is a plaintext password, so OpenSIPS will internally calculate the HA1. As the passwords will be loaded from the column specified in the [password\_column](#param_password_column "1.3.8.�password_column (string)") parameter, be sure this parameter points to a column holding a plaintext password (by default, this parameter points to the “ha1” column);
    
*   _0 (do **not** calculate HA1)_ - the loaded password is a pre-computed HA1 hash (no calculation needed). The module will load all hashes stored in the [password\_column](#param_password_column "1.3.8.�password_column (string)"), [hash\_column\_sha256](#param_hash_column_sha256 "1.3.9.�hash_column_sha256 (string)") and [hash\_column\_sha512t256](#param_hash_column_sha512t256 "1.3.10.�hash_column_sha512t256 (string)") columns, then use the hash corresponding to the hashing algorithm selected for a given digest authentication challenge.
    
    The content of the hash columns can be generated as follows:
    
    *   password\_column: MD5(username:realm:password)
        
    *   hash\_column\_sha256: SHA-256(username:realm:password)
        
    *   hash\_column\_sha512t256: SHA-512-256(username:realm:password)
        
    

Default value of this parameter is _0 (use hashed passwords)_.

**Example�1.2.�`calculate_ha1` parameter usage**

modparam("auth\_db", "calculate\_ha1", 1)

  

### 1.3.3.�`use_domain` (integer)

If true (not 0), domain will be also used when looking up in the subscriber table. If you have a multi-domain setup, it is strongly recommended to turn on this parameter to avoid username overlapping between domains.

IMPORTANT: before turning on this parameter, be sure that the `domain` column in `subscriber` table is properly populated.

Default value is “0 (false)”.

**Example�1.3.�`use_domain` parameter usage**

modparam("auth\_db", "use\_domain", 1)
		

  

### 1.3.4.�`load_credentials` (string)

This parameter specifies credentials to be fetched from database when the authentication is performed. The loaded credentials will be stored in AVPs. If the AVP name is not specificaly given, it will be used a NAME AVP with the same name as the column name.

Parameter syntax:

*   _load\_credentials = credential (';' credential)\*_
    
*   _credential = (avp\_specification '=' column\_name) | (column\_name)_
    
*   _avp\_specification = '$avp(' + NAME + ')'_
    

Default value of this parameter is “rpid”.

**Example�1.4.�`load_credentials` parameter usage**

\# load rpid column into $avp(13) and email\_address column
# into $avp(email\_address)
modparam("auth\_db", "load\_credentials", "$avp(13)=rpid;email\_address")

  

### 1.3.5.�`skip_version_check` (int)

This parameter specifies not to check the auth table version. This parameter should be set when a custom authentication table is used.

Default value is “0 (false)”.

**Example�1.5.�`skip_version_check` parameter usage**

modparam("auth\_db", "skip\_version\_check", 1)
		

  

### 1.3.6.�`user_column` (string)

This is the name of the column in a 'SUBSCRIBER' like table holding the usernames. Default value is fine for most people. Use the parameter if you really need to change it.

Default value is “username”.

**Example�1.6.�`user_column` parameter usage**

modparam("auth\_db", "user\_column", "user")

  

### 1.3.7.�`domain_column` (string)

This is the name of the column in a 'SUBSCRIBER' like table holding the domains of users. Default value is fine for most people. Use the parameter if you really need to change it.

Default value is “domain”.

**Example�1.7.�`domain_column` parameter usage**

modparam("auth\_db", "domain\_column", "domain")

  

### 1.3.8.�`password_column` (string)

This is the name of the column in a _"subscriber"_ like table holding MD5 HA1 hash strings or plaintext passwords. An MD5 HA1 hash is an MD5 hash of username, password and realm. Storing hashes in the DB (as opposed to passwords directly) is much more secure, because the server does not need to know plaintext passwords and because it is computationally infeasible for an attacker to reverse-obtain a password from an HA1 string.

Default value is “ha1”.

**Example�1.8.�`password_column` parameter usage**

modparam("auth\_db", "password\_column", "password")

  

### 1.3.9.�`hash_column_sha256` (string)

The name of the column holding SHA-256 HA1 hashes ([RFC 8760](https://datatracker.ietf.org/doc/html/rfc8760) support).

Default value is “ha1\_sha256”.

**Example�1.9.�`password_column` parameter usage**

modparam("auth\_db", "hash\_column\_sha256", "ha1\_sha256")

  

### 1.3.10.�`hash_column_sha512t256` (string)

The name of the column holding SHA-512/256 HA1 hashes. ([RFC 8760](https://datatracker.ietf.org/doc/html/rfc8760) support).

Default value is “ha1\_sha512t256”.

**Example�1.10.�`password_column` parameter usage**

modparam("auth\_db", "hash\_column\_sha512t256", "ha1\_sha512t256")

  

### 1.3.11.�`uri_user_column` (string)

Column holding usernames in an 'URI' like table.

_Default value is “username”._

**Example�1.11.�Set `uri_user_column` parameter**

...
modparam("auth\_db", "uri\_user\_column", "username")
...

  

### 1.3.12.�`uri_domain_column` (string)

Column holding domain in an 'URI' like table.

_Default value is “domain”._

**Example�1.12.�Set `uri_domain_column` parameter**

...
modparam("auth\_db", "uri\_domain\_column", "domain")
...

  

### 1.3.13.�`uri_uriuser_column` (string)

Column holding URI username in an 'URI' like table.

_Default value is “uri\_user”._

**Example�1.13.�Set `uriuser_column` parameter**

...
modparam("auth\_db", "uri\_uriuser\_column", "uri\_user")
...

  

## 1.4.�Exported Functions

### 1.4.1.� `www_authorize(realm, table)`

The function verifies the received credentials against a "SUBSCRIBER"-like table according to digest authentication as per [RFC2617](http://www.ietf.org/rfc/rfc2617.txt). If the credentials are verified successfully then the function will succeed and mark the credentials as authorized (marked credentials can be later used by some other functions). If the function was unable to verify the credentials for some reason then it will fail and the script should call `www_challenge` which will challenge the user again.

Negative codes may be interpreted as follows:

*   _\-5 (generic error)_ - some generic error occurred and no reply was sent out;
    
*   _\-4 (no credentials)_ - credentials were not found in request;
    
*   _\-3 (stale nonce)_ - stale nonce;
    
*   _\-2 (invalid password)_ - valid user, but wrong password;
    
*   _\-1 (invalid user)_ - authentication user does not exist.
    

Meaning of the parameters is as follows:

*   _realm (string)_ - Realm is an opaque string that the user agent should present to the user so it can decide what username and password to use. Usually this is domain of the host the server is running on.
    
    If an empty string “” is used then the server will generate it from the request. In case of REGISTER requests To header field domain will be used (because this header field represents a user being registered), for all other messages From header field domain will be used.
    
    The string may contain pseudo variables.
    
*   _table (string)_ - Table to be used to lookup usernames and passwords (usually subscribers table).
    

This function can be used from REQUEST\_ROUTE.

**Example�1.14.�`www_authorize` usage**

...
if (!www\_authorize("siphub.net", "subscriber"))
	www\_challenge("siphub.net", "auth");
...

  

### 1.4.2.� `proxy_authorize(realm, table)`

The function verifies the received credentials against a "SUBSCRIBER"-like table according to digest authentication as per [RFC2617](http://www.ietf.org/rfc/rfc2617.txt). If the credentials are verified successfully then the function will succeed and mark the credentials as authorized (marked credentials can be later used by some other functions). If the function was unable to verify the credentials for some reason then it will fail and the script should call `proxy_challenge` which will challenge the user again.

Negative codes may be interpreted as follows:

*   _\-5 (generic error)_ - some generic error occurred and no reply was sent out;
    
*   _\-4 (no credentials)_ - credentials were not found in request;
    
*   _\-3 (stale nonce)_ - stale nonce;
    
*   _\-2 (invalid password)_ - valid user, but wrong password;
    
*   _\-1 (invalid user)_ - authentication user does not exist.
    

Meaning of the parameters is as follows:

*   _realm (string)_ - Realm is an opaque string that the user agent should present to the user so it can decide what username and password to use. Usually this is domain of the host the server is running on.
    
    If an empty string “” is used then the server will generate it from the request. From header field domain will be used as realm.
    
    The string may contain pseudo variables.
    
*   _table (string)_ - Table to be used to lookup usernames and passwords (usually subscribers table).
    

This function can be used from REQUEST\_ROUTE.

**Example�1.15.�proxy\_authorize usage**

...
if (!proxy\_authorize("", "subscriber"))
	proxy\_challenge("", "auth");  # Realm will be autogenerated
...

  

### 1.4.3.� `db_is_to_authorized(table)`

The function checks against a 'URI' like table to see if the username extracted from the To header URI is allowed/authorized to use the credentials (authentication username) validated by [www\_authorize()](#func_www_authorize "1.4.1.� www_authorize(realm, table)").

The function is part of the mechanism that allows to create mapping between the SIP users (from the FROM/TO headers) and the authentication users (from a SUBSCRIBER-like table) that they use. The mapping is stored into an URI-like table.

Meaning of the parameters is as follows:

*   _table (string)_ - Table to be used to lookup for the URI/AUTH mappings (usually the URI table).
    

This function can be used from REQUEST\_ROUTE.

**Example�1.16.�`db_is_to_authorized` usage**

...
if (!db\_is\_to\_authorized("uri")) {
	xlog("User $tu is not authorized to authenticate with $au credential\\n");
}
...

  

### 1.4.4.� `db_is_from_authorized(table)`

Similar to [db\_is\_to\_authorized()](#func_db_is_to_authorized "1.4.3.� db_is_to_authorized(table)") but instead of checking the TO header URI, the FROM header URI is checked.

### 1.4.5.� `db_does_uri_exist(uri, table)`

Checks if the username@domain from the given URI is an existing user in a 'SUBSCRIBER' like table.

Meaning of the parameters is as follows:

*   _uri (string)_ - The SIP URI to be tested. It must hold a username part for a valid check. Variables are allowed.
    
*   _table (string)_ - Table to be used to search for the URI (usually the SUBSCRIBER table).
    

This function can be used from REQUEST\_ROUTE.

**Example�1.17.�`db_does_uri_exist` usage**

...
if (db\_does\_uri\_exist($ru, "subscriber")) {
	...
}
...

  

### 1.4.6.� `db_get_auth_id(table, uri, auth, realm)`

Checks given uri-string username against an 'URI' like table. Returns true if the user exists in the database, and sets the given variables to the authentication id and realm corresponding to the given uri.

Meaning of the parameters is as follows:

*   _table (string)_ - Table to be used to search for the URI (usually the URI table).
    
*   _uri (string)_ - The input SIP URI to be tested. It must hold a username part for a valid check. Variables are allowed.
    
*   _auth (var)_ - an output variable to store the found authentication id matching the given SIP URI.
    
*   _realm (var)_ - an output variable to store the found authentication realm matching the given SIP URI.
    

This function can be used from REQUEST\_ROUTE ,FAILURE\_ROUTE and LOCAL\_ROUTE.

**Example�1.18.�`db_get_auth_id` usage**

...
if (db\_get\_auth\_id("uri", $ru, $avp(auth\_id), $avp(auth\_realm))) {
	...
}
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

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

51

37

783

380

2.

Jan Janak ([@janakj](https://github.com/janakj))

50

29

1610

424

3.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

29

20

130

382

4.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

23

18

161

137

5.

Henning Westerholt ([@henningw](https://github.com/henningw))

11

9

83

49

6.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

10

8

30

48

7.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

10

5

307

116

8.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

8

4

69

163

9.

Sergio Gutierrez

7

5

13

13

10.

Andrei Pelinescu-Onciul

6

4

81

33

  

**All remaining contributors**: Dan Pascu ([@danpascu](https://github.com/danpascu)), Jiri Kuthan ([@jiriatipteldotorg](https://github.com/jiriatipteldotorg)), Walter Doekes ([@wdoekes](https://github.com/wdoekes)), Anatoly Pidruchny, Kennard White, Konstantin Bokarius, Richard Revels, Juli�n Moreno Pati�o, Norman Brandinger ([@NormB](https://github.com/NormB)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Edson Gellert Schubert, Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita)).

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

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Jun 2011 - Jan 2024

3.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Oct 2004 - Feb 2023

4.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Jun 2005 - Jul 2021

5.

Walter Doekes ([@wdoekes](https://github.com/wdoekes))

Apr 2021 - Apr 2021

6.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Jul 2019

7.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

8.

Juli�n Moreno Pati�o

Feb 2016 - Feb 2016

9.

Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita))

Jan 2015 - Jan 2015

10.

Richard Revels

Sep 2011 - Sep 2011

  

**All remaining contributors**: Kennard White, Dan Pascu ([@danpascu](https://github.com/danpascu)), Sergio Gutierrez, Henning Westerholt ([@henningw](https://github.com/henningw)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Anatoly Pidruchny, Norman Brandinger ([@NormB](https://github.com/NormB)), Jan Janak ([@janakj](https://github.com/janakj)), Andrei Pelinescu-Onciul, Jiri Kuthan ([@jiriatipteldotorg](https://github.com/jiriatipteldotorg)).

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Maksym Sobolyev ([@sobomax](https://github.com/sobomax)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Kennard White, Sergio Gutierrez, Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Henning Westerholt ([@henningw](https://github.com/henningw)), Anatoly Pidruchny, Jan Janak ([@janakj](https://github.com/janakj)).

_Documentation Copyrights:_

Copyright � 2005 Voice Sistem SRL

Copyright � 2002-2003 FhG FOKUS