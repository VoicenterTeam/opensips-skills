# AUTH\_JWT Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5712848)

2.2. [Most recently active contributors(1) to this module](#idp5794208)

**List of Examples**

1.1. [`db_mode` parameter usage](#idp259776)

1.2. [`db_url` parameter usage](#idp161632)

1.3. [`profiles_table` parameter usage](#idp165984)

1.4. [`secrets_table` parameter usage](#idp170272)

1.5. [Set `tag_column` parameter](#idp5567104)

1.6. [Set `username_column` parameter](#idp5571920)

1.7. [Set `secret_tag_column` parameter](#idp5576736)

1.8. [set `secret_column` parameter](#idp5581552)

1.9. [set `start_ts` parameter](#idp5586368)

1.10. [set `end_ts` parameter](#idp5591184)

1.11. [set `tag_claim` parameter](#idp5596000)

1.12. [`load_credentials` parameter usage](#idp5603600)

1.13. [`jwt_db_authorize` usage](#idp5615840)

1.14. [`jwt_script_authorize` usage](#idp5628160)

1.15. [`extract_pub_key_from_cert` usage](#idp5638640)

## Chapter�1.�Admin Guide

## 1.1.�Overview

The module implements authentication over JSON Web Tokens. In some cases ( ie. WebRTC ) the user authenticates on another layer ( other than SIP ), so it makes no sense to double-authenticate it on the SIP layer. Thus, the SIP client will simply present the JWT auth token it received from the server, and pass it on to OpenSIPS which will use that for authentication purposes. It relies on two DB tables, one containing JWT profiles ( a profile name and it's SIP username associated to it ) and one containing JWT secrets. Each secret has a corresponding profile, the KEY used for signing the JWT and two timestamps describing a validation interval. Multiple JWT secrets can point to the same JWT profile.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The module depends on the following modules (in the other words the listed modules must be loaded before this module):

*   _database_ -- Any database module (currently mysql, postgres, dbtext) , in case the db\_url parameter is set
    

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _libjwt-dev_
    
*   _openssl-dev_ or _libssl-dev_
    

## 1.3.�Exported Parameters

### 1.3.1.�`db_mode` (int)

If set to 0, the module won't connect to the Database for reading the Keys for decoding JWTs - only jwt\_script\_authorize will be usable from the script.

_Default value is “0”._

**Example�1.1.�`db_mode` parameter usage**

modparam("auth\_jwt", "db\_mode", 0)

  

### 1.3.2.�`db_url` (string)

This is URL of the database to be used. Value of the parameter depends on the database module used. For example for mysql and postgres modules this is something like mysql://username:password@host:port/database. For dbtext module (which stores data in plaintext files) it is directory in which the database resides.

_Default value is “mysql://opensipsro:opensipsro@localhost/opensips”._

**Example�1.2.�`db_url` parameter usage**

modparam("auth\_jwt", "db\_url", "dbdriver://username:password@dbhost/dbname")

  

### 1.3.3.�`profiles_table` (string)

Name of the DB table containing the jwt profiles

Default value of this parameter is jwt\_profiles.

**Example�1.3.�`profiles_table` parameter usage**

modparam("auth\_jwt", "profiles\_table", "my\_profiles")

  

### 1.3.4.�`secrets_table` (string)

Name of the DB table containing the jwt secrets

Default value of this parameter is jwt\_secrets.

**Example�1.4.�`secrets_table` parameter usage**

modparam("auth\_jwt", "secrets\_table", "my\_secrets")

  

### 1.3.5.�`tag_column` (string)

Column holding the JWT profile tag.

_Default value is “tag”._

**Example�1.5.�Set `tag_column` parameter**

...
modparam("auth\_jwt", "tag\_column", "my\_tag\_column")
...

  

### 1.3.6.�`username_column` (string)

Column holding the JWT profile associated SIP username.

_Default value is “sip\_username”._

**Example�1.6.�Set `username_column` parameter**

...
modparam("auth\_jwt", "username\_column", "my\_username\_column")
...

  

### 1.3.7.�`secret_tag_column` (string)

Column holding the JWT secret associated tag.

_Default value is “corresponding\_tag”._

**Example�1.7.�Set `secret_tag_column` parameter**

...
modparam("auth\_jwt", "secret\_tag\_column", "my\_secret\_tag\_column")
...

  

### 1.3.8.�`secret_column` (string)

Column holding the actual jwt signing secret.

_default value is “secret”._

**Example�1.8.�set `secret_column` parameter**

...
modparam("auth\_jwt", "secret\_column", "my\_secret\_column")
...

  

### 1.3.9.�`start_ts_column` (string)

Column holding the JWT secret start UNIX timestamp.

_default value is “start\_ts”._

**Example�1.9.�set `start_ts` parameter**

...
modparam("auth\_jwt", "start\_ts", "my\_start\_ts\_column")
...

  

### 1.3.10.�`end_ts_column` (string)

column holding the jwt secret end unix timestamp.

_default value is “end\_ts”._

**Example�1.10.�set `end_ts` parameter**

...
modparam("auth\_jwt", "end\_ts", "my\_end\_ts\_column")
...

  

### 1.3.11.�`tag_claim` (string)

The JWT claim which will be used to identify the JWT profile

_default value is “tag”._

**Example�1.11.�set `tag_claim` parameter**

...
modparam("auth\_jwt", "tag\_claim", "my\_tag\_claim")
...

  

### 1.3.12.�`load_credentials` (string)

This parameter specifies credentials to be fetched from the JWT profiles table when the authentication is performed. The loaded credentials will be stored in AVPs. If the AVP name is not specificaly given, it will be used a NAME AVP with the same name as the column name.

Parameter syntax:

*   _load\_credentials = credential (';' credential)\*_
    
*   _credential = (avp\_specification '=' column\_name) | (column\_name)_
    
*   _avp\_specification = '$avp(' + NAME + ')'_
    

Default value of this parameter is “none ( empty )”.

**Example�1.12.�`load_credentials` parameter usage**

\# load my\_extra\_column into $avp(extra\_jwt\_info)
modparam("auth\_jwt", "load\_credentials", "$avp(extra\_jwt\_info)=my\_extra\_column")

  

## 1.4.�Exported Functions

### 1.4.1.� `jwt_db_authorize(jwt_token,out_decoded_token,out_sip_username)`

The function will read the first param ( jwt\_token ), extract the tag claim and then try to authenticate it against the DB secrets for the respective profile tag. In case of success, it populates the out\_decoded\_token pvar with the decoded JWT ( in plaintext format header\_json.payload\_json ) and the out\_sip\_username with the SIP username corresponding to that JWT profile.

Negative codes may be interpreted as follows:

*   _\-1 ( error)_ - JWT authentication failed
    

Meaning of the parameters is as follows:

*   _jwt\_token (string)_ - The JWT token to perform auth on
    
    The string may contain pseudo variables.
    
*   _out\_decoded\_token (pvar)_ - PVAR used to store the decoded JWT upon succesful auth
    
*   _out\_sip\_username (pvar)_ - PVAR used to store the SIP username corresponding to the JWT profile, upon succesful auth
    

This function can be used from REQUEST\_ROUTE.

**Example�1.13.�`jwt_db_authorize` usage**

...
if (!jwt\_db\_authorize("$avp(my\_jwt\_token)", $avp(decoded\_token), $avp(sip\_username) )) {
	send\_reply(401,"Unauthorized");
	exit;
} else {
	xlog("Succesful JWT auth - $avp(decoded\_token) \\n");
	if ($fU != $avp(sip\_username)) {
		send\_reply(403,"Forbidden AUTH ID");
		exit;
	}	
}
...

  

### 1.4.2.� `jwt_script_authorize(jwt_token,key, out_decoded_token)`

The function will read the first param ( jwt\_token ), decode it and then try to validate it against the provided key. If the JWT decoding is succesful, the out\_decoded\_token pvar will be populated. Return codes are :

*   \-2 : Failure in decoding the JWT ( out\_decoded\_token will not be populated )
    
*   \-1 : Failure in validating the JWT ( out\_decoded\_token will be populated )
    
*   1 : JWT succesfully validated with the key ( out\_decoded\_token will be populated )
    

Meaning of the parameters is as follows:

*   _jwt\_token (string)_ - The JWT token to perform auth on
    
    The string may contain pseudo variables.
    
*   _key (string)_ - The key to be used for validating the JWT.
    
*   _out\_decoded\_token (pvar)_ - PVAR used to store the decoded JWT
    

This function can be used from REQUEST\_ROUTE.

**Example�1.14.�`jwt_script_authorize` usage**

...
if (!jwt\_script\_authorize("$avp(my\_jwt\_token)",$avp(pub\_key), $avp(decoded\_token))) {
	send\_reply(401,"Unauthorized");
	exit;
} else {
	xlog("Succesful JWT auth - $avp(decoded\_token) \\n");
}
...

  

### 1.4.3.� `extract_pub_key_from_cert(certificate,out_public_key)`

The function will read the first param ( certificate ), decode it and then try to extract the public key with the certificate. If the extraction is succesful, the out\_public\_key will be populated. Useful to be used in conjuction with the jwt\_script\_authorize function, since most providers make their certificates public, but the JWTs are signed with the actual public key embeded in the certificate. Return codes are :

*   \-1 : Failure in extracting the pub key
    
*   1 : out\_public\_key succesfully populated
    

Meaning of the parameters is as follows:

*   _certificate (string)_ - The certificate to read and from which to extract the public key
    
    The string may contain pseudo variables.
    
*   _out\_public\_key (pvar)_ - PVAR used to store the extracted public key
    

This function can be used from REQUEST\_ROUTE.

**Example�1.15.�`extract_pub_key_from_cert` usage**

...
if (extract\_pub\_key\_from\_cert("$avp(my\_certificate)",$avp(my\_pub\_key))) {
    xlog("Succesfully extracted public key - $avp(my\_pub\_key) \\n");
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

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

20

6

1521

16

2.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

5

3

8

8

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

5

3

4

6

4.

pavelkohout396

3

1

24

2

5.

Alexandra Titoc

3

1

5

4

6.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

3

1

3

3

  

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 2.2.�By Commit Activity

**Table�2.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

pavelkohout396

Feb 2026 - Feb 2026

2.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Mar 2020 - Aug 2025

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

May 2023 - Sep 2024

4.

Alexandra Titoc

Sep 2024 - Sep 2024

5.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

Mar 2020 - Jul 2023

6.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Feb 2023

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)).