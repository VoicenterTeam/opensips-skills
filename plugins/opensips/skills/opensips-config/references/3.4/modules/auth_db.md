# auth_db Module Reference
<!-- generated-from: data/3.4/modules/auth_db.json
     generator-version: 0.1.0
     opensips-version: 3.4
     doc-type: module -->

Reference for the OpenSIPs 3.4 auth_db module. Read this file when configuring or debugging the auth_db module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Configuration Examples](#configuration-examples)

## Overview

This module contains all authentication related functions that need the access to the database. This module should be used together with auth module, it cannot be used independently because it depends on the module. Select this module if you want to use database to store authentication information like subscriber usernames and passwords. If you want to use radius authentication, then use auth_radius instead.

Starting with OpenSIPS 3.2, the auth, auth_db and uac_auth modules include support for two new digest authentication algorithms ("SHA-256" and "SHA-512-256"), according to the RFC 8760 specs.

## Dependencies

### OpenSIPs Modules

- `auth` — Generic authentication functions
- `database` — Any database module (currently mysql, postgres, dbtext)

### External Libraries

None.

## Exported Parameters

### `calculate_ha1` (integer)

This parameter tells the server whether it should considered the loaded password (for authentification) as plaintext passwords or a pre-calculated HA1 string. Possible meanings of this parameter are: 1 (calculate HA1) - the loaded password is a plaintext password, so OpenSIPS will internally calculate the HA1. As the passwords will be loaded from the column specified in the password_column parameter, be sure this parameter points to a column holding a plaintext password (by default, this parameter points to the “ha1” column); 0 (do **not** calculate HA1) - the loaded password is a pre-computed HA1 hash (no calculation needed). The module will load all hashes stored in the password_column, hash_column_sha256 and hash_column_sha512t256 columns, then use the hash corresponding to the hashing algorithm selected for a given digest authentication challenge. The content of the hash columns can be generated as follows: password_column: MD5(username:realm:password); hash_column_sha256: SHA-256(username:realm:password); hash_column_sha512t256: SHA-512-256(username:realm:password).

*Default value is 0 (use hashed passwords).*

**Possible values:**

- 1 (calculate HA1)
- 0 (do not calculate HA1)

**Example.** 1.

```opensips
modparam("auth_db", "calculate_ha1", 1)
```
### `db_url` (string)

This is URL of the database to be used. Value of the parameter depends on the database module used. For example for mysql and postgres modules this is something like mysql://username:password@host:port/database. For dbtext module (which stores data in plaintext files) it is directory in which the database resides.

*Default value is mysql://opensipsro:opensipsro@localhost/opensips.*

**Example.** dbdriver://username:password@dbhost/dbname.

```opensips
modparam("auth_db", "db_url", "dbdriver://username:password@dbhost/dbname")
```
### `domain_column` (string)

This is the name of the column in a 'SUBSCRIBER' like table holding the domains of users. Default value is fine for most people. Use the parameter if you really need to change it.

*Default value is domain.*

**Example.** domain.

```opensips
modparam("auth_db", "domain_column", "domain")
```
### `hash_column_sha256` (string)

The name of the column holding SHA-256 HA1 hashes ([RFC 8760](https://datatracker.ietf.org/doc/html/rfc8760) support).

*Default value is ha1_sha256.*

**Example.** ha1_sha256.

```opensips
modparam("auth_db", "hash_column_sha256", "ha1_sha256")
```
### `hash_column_sha512t256` (string)

The name of the column holding SHA-512/256 HA1 hashes. ([RFC 8760](https://datatracker.ietf.org/doc/html/rfc8760) support).

*Default value is ha1_sha512t256.*

**Example.** ha1_sha512t256.

```opensips
modparam("auth_db", "hash_column_sha512t256", "ha1_sha512t256")
```
### `load_credentials` (string)

This parameter specifies credentials to be fetched from database when the authentication is performed. The loaded credentials will be stored in AVPs. If the AVP name is not specificaly given, it will be used a NAME AVP with the same name as the column name. Parameter syntax: load_credentials = credential (';' credential)*; credential = (avp_specification '=' column_name) | (column_name); avp_specification = '$avp(' + NAME + ')'.

*Default value is rpid.*

**Example.** $avp(13)=rpid;email_address.

```opensips
modparam("auth_db", "load_credentials", "$avp(13)=rpid;email_address")
```
### `password_column` (string)

This is the name of the column in a _"subscriber"_ like table holding MD5 HA1 hash strings or plaintext passwords. An MD5 HA1 hash is an MD5 hash of username, password and realm. Storing hashes in the DB (as opposed to passwords directly) is much more secure, because the server does not need to know plaintext passwords and because it is computationally infeasible for an attacker to reverse-obtain a password from an HA1 string.

*Default value is ha1.*

**Example.** password.

```opensips
modparam("auth_db", "password_column", "password")
```
### `skip_version_check` (int)

This parameter specifies not to check the auth table version. This parameter should be set when a custom authentication table is used.

*Default value is 0 (false).*

**Possible values:**

- 0 (false)
- 1 (true)

**Example.** 1.

```opensips
modparam("auth_db", "skip_version_check", 1)
```
### `uri_domain_column` (string)

Column holding domain in an 'URI' like table.

*Default value is domain.*

**Example.** domain.

```opensips
modparam("auth_db", "uri_domain_column", "domain")
```
### `uri_uriuser_column` (string)

Column holding URI username in an 'URI' like table.

*Default value is uri_user.*

**Example.** uri_user.

```opensips
modparam("auth_db", "uri_uriuser_column", "uri_user")
```
### `uri_user_column` (string)

Column holding usernames in an 'URI' like table.

*Default value is username.*

**Example.** username.

```opensips
modparam("auth_db", "uri_user_column", "username")
```
### `use_domain` (integer)

If true (not 0), domain will be also used when looking up in the subscriber table. If you have a multi-domain setup, it is strongly recommended to turn on this parameter to avoid username overlapping between domains. IMPORTANT: before turning on this parameter, be sure that the `domain` column in `subscriber` table is properly populated.

*Default value is 0 (false).*

**Possible values:**

- 0 (false)
- 1 (true)

**Example.** 1.

```opensips
modparam("auth_db", "use_domain", 1)
```
### `user_column` (string)

This is the name of the column in a 'SUBSCRIBER' like table holding the usernames. Default value is fine for most people. Use the parameter if you really need to change it.

*Default value is username.*

**Example.** user.

```opensips
modparam("auth_db", "user_column", "user")
```

## Exported Functions

### `db_does_uri_exist(uri, table)`

Checks if the username@domain from the given URI is an existing user in a 'SUBSCRIBER' like table.

**Parameters:**

- `table` *(string, required)* — Table to be used to search for the URI (usually the SUBSCRIBER table).
- `uri` *(string, required)* — The SIP URI to be tested. It must hold a username part for a valid check. Variables are allowed.

**Return codes:**

- `true` — username@domain from the given URI is an existing user
- `false` — username@domain from the given URI is not an existing user

**Usable from:** REQUEST_ROUTE

**Example.** `db_does_uri_exist` usage.

```opensips
...
if (db_does_uri_exist($ru, "subscriber")) {
	...
}
...
```

### `db_get_auth_id(table, uri, auth, realm)`

Checks given uri-string username against an 'URI' like table. Returns true if the user exists in the database, and sets the given variables to the authentication id and realm corresponding to the given uri.

**Parameters:**

- `auth` *(var, required)* — an output variable to store the found authentication id matching the given SIP URI.
- `realm` *(var, required)* — an output variable to store the found authentication realm matching the given SIP URI.
- `table` *(string, required)* — Table to be used to search for the URI (usually the URI table).
- `uri` *(string, required)* — The input SIP URI to be tested. It must hold a username part for a valid check. Variables are allowed.

**Return codes:**

- `true` — user exists in the database
- `false` — user does not exist in the database

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, LOCAL_ROUTE

**Example.** `db_get_auth_id` usage.

```opensips
...
if (db_get_auth_id("uri", $ru, $avp(auth_id), $avp(auth_realm))) {
	...
}
...
```

### `db_is_from_authorized(table)`

Similar to db_is_to_authorized() but instead of checking the TO header URI, the FROM header URI is checked.

**Parameters:**

- `table` *(string, required)* — 

**Related:**

- `db_is_to_authorized`

### `db_is_to_authorized(table)`

The function checks against a 'URI' like table to see if the username extracted from the To header URI is allowed/authorized to use the credentials (authentication username) validated by www_authorize().

The function is part of the mechanism that allows to create mapping between the SIP users (from the FROM/TO headers) and the authentication users (from a SUBSCRIBER-like table) that they use. The mapping is stored into an URI-like table.

**Parameters:**

- `table` *(string, required)* — Table to be used to lookup for the URI/AUTH mappings (usually the URI table).

**Return codes:**

- `true` — username extracted from To header URI is allowed/authorized
- `false` — username extracted from To header URI is not allowed/authorized

**Usable from:** REQUEST_ROUTE

**Related:**

- `www_authorize`

**Example.** `db_is_to_authorized` usage.

```opensips
...
if (!db_is_to_authorized("uri")) {
	xlog("User $tu is not authorized to authenticate with $au credential\n");
}
...
```

### `proxy_authorize(realm, table)`

The function verifies the received credentials against a "SUBSCRIBER"-like table according to digest authentication as per RFC2617. If the credentials are verified successfully then the function will succeed and mark the credentials as authorized (marked credentials can be later used by some other functions). If the function was unable to verify the credentials for some reason then it will fail and the script should call `proxy_challenge` which will challenge the user again.

**Parameters:**

- `realm` *(string, required)* — Realm is an opaque string that the user agent should present to the user so it can decide what username and password to use. Usually this is domain of the host the server is running on.

If an empty string “” is used then the server will generate it from the request. From header field domain will be used as realm.

The string may contain pseudo variables.
- `table` *(string, required)* — Table to be used to lookup usernames and passwords (usually subscribers table).

**Return codes:**

- `-5` — generic error
- `-4` — no credentials
- `-3` — stale nonce
- `-2` — invalid password
- `-1` — invalid user
- `positive` — credentials verified successfully

**Usable from:** REQUEST_ROUTE

**Related:**

- `proxy_challenge`

**Example.** proxy_authorize usage.

```opensips
...
if (!proxy_authorize("", "subscriber"))
	proxy_challenge("", "auth");  # Realm will be autogenerated
...
```

### `www_authorize(realm, table)`

The function verifies the received credentials against a "SUBSCRIBER"-like table according to digest authentication as per RFC2617. If the credentials are verified successfully then the function will succeed and mark the credentials as authorized (marked credentials can be later used by some other functions). If the function was unable to verify the credentials for some reason then it will fail and the script should call `www_challenge` which will challenge the user again.

**Parameters:**

- `realm` *(string, required)* — Realm is an opaque string that the user agent should present to the user so it can decide what username and password to use. Usually this is domain of the host the server is running on.

If an empty string “” is used then the server will generate it from the request. In case of REGISTER requests To header field domain will be used (because this header field represents a user being registered), for all other messages From header field domain will be used.

The string may contain pseudo variables.
- `table` *(string, required)* — Table to be used to lookup usernames and passwords (usually subscribers table).

**Return codes:**

- `-5` — generic error
- `-4` — no credentials
- `-3` — stale nonce
- `-2` — invalid password
- `-1` — invalid user
- `positive` — credentials verified successfully

**Usable from:** REQUEST_ROUTE

**Related:**

- `www_challenge`

**Example.** `www_authorize` usage.

```opensips
...
if (!www_authorize("siphub.net", "subscriber"))
	www_challenge("siphub.net", "auth");
...
```

## Configuration Examples

### `db_url` parameter usage

Sets the URL of the database to be used.

```opensips
modparam("auth_db", "db_url", "dbdriver://username:password@dbhost/dbname")
```
### `calculate_ha1` parameter usage

Tells the server to consider the loaded password as plaintext passwords (calculate HA1).

```opensips
modparam("auth_db", "calculate_ha1", 1)
```
### `use_domain` parameter usage

Enables domain usage when looking up in the subscriber table.

```opensips
modparam("auth_db", "use_domain", 1)
```
### `load_credentials` parameter usage

Specifies credentials to be fetched from database when the authentication is performed.

```opensips
# load rpid column into $avp(13) and email_address column
# into $avp(email_address)
modparam("auth_db", "load_credentials", "$avp(13)=rpid;email_address")
```
### `skip_version_check` parameter usage

Specifies not to check the auth table version.

```opensips
modparam("auth_db", "skip_version_check", 1)
```
### `user_column` parameter usage

Sets the name of the column in a 'SUBSCRIBER' like table holding the usernames.

```opensips
modparam("auth_db", "user_column", "user")
```
### `domain_column` parameter usage

Sets the name of the column in a 'SUBSCRIBER' like table holding the domains of users.

```opensips
modparam("auth_db", "domain_column", "domain")
```
### `password_column` parameter usage

Sets the name of the column in a 'subscriber' like table holding MD5 HA1 hash strings or plaintext passwords.

```opensips
modparam("auth_db", "password_column", "password")
```
### `password_column` parameter usage

Sets the name of the column holding SHA-256 HA1 hashes.

```opensips
modparam("auth_db", "hash_column_sha256", "ha1_sha256")
```
### `password_column` parameter usage

Sets the name of the column holding SHA-512/256 HA1 hashes.

```opensips
modparam("auth_db", "hash_column_sha512t256", "ha1_sha512t256")
```
### Set `uri_user_column` parameter

Sets the column holding usernames in an 'URI' like table.

```opensips
...
modparam("auth_db", "uri_user_column", "username")
...
```
### Set `uri_domain_column` parameter

Sets the column holding domain in an 'URI' like table.

```opensips
...
modparam("auth_db", "uri_domain_column", "domain")
...
```
### Set `uriuser_column` parameter

Sets the column holding URI username in an 'URI' like table.

```opensips
...
modparam("auth_db", "uri_uriuser_column", "uri_user")
...
```
### `www_authorize` usage

Verifies the received credentials against a 'SUBSCRIBER'-like table according to digest authentication.

```opensips
...
if (!www_authorize("siphub.net", "subscriber"))
	www_challenge("siphub.net", "auth");
...
```
### proxy_authorize usage

Verifies the received credentials against a 'SUBSCRIBER'-like table according to digest authentication.

```opensips
...
if (!proxy_authorize("", "subscriber"))
	proxy_challenge("", "auth");  # Realm will be autogenerated
...
```
### `db_is_to_authorized` usage

Checks if the username extracted from the To header URI is allowed/authorized to use the credentials.

```opensips
...
if (!db_is_to_authorized("uri")) {
	xlog("User $tu is not authorized to authenticate with $au credential\\n");
}
...
```
### `db_does_uri_exist` usage

Checks if the username@domain from the given URI is an existing user in a 'SUBSCRIBER' like table.

```opensips
...
if (db_does_uri_exist($ru, "subscriber")) {
	...
}
...
```
### `db_get_auth_id` usage

Checks given uri-string username against an 'URI' like table and sets variables to the authentication id and realm.

```opensips
...
if (db_get_auth_id("uri", $ru, $avp(auth_id), $avp(auth_realm))) {
	...
}
...
```
