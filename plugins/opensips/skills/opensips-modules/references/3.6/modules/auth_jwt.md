# auth_jwt Module Reference
<!-- generated-from: data/3.6/modules/auth_jwt.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 auth_jwt module. Read this file when configuring or debugging the auth_jwt module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Configuration Examples](#configuration-examples)

## Overview

The module implements authentication over JSON Web Tokens. In some cases ( ie. WebRTC ) the user authenticates on another layer ( other than SIP ), so it makes no sense to double-authenticate it on the SIP layer. Thus, the SIP client will simply present the JWT auth token it received from the server, and pass it on to OpenSIPS which will use that for authentication purposes. It relies on two DB tables, one containing JWT profiles ( a profile name and it's SIP username associated to it ) and one containing JWT secrets. Each secret has a corresponding profile, the KEY used for signing the JWT and two timestamps describing a validation interval. Multiple JWT secrets can point to the same JWT profile.

## Dependencies

### OpenSIPs Modules

- `database` — Any database module (currently mysql, postgres, dbtext) , in case the db_url parameter is set (optional)

### External Libraries

- `libjwt-dev` — The following libraries or applications must be installed before running OpenSIPS with this module loaded
- `openssl-dev or libssl-dev` — The following libraries or applications must be installed before running OpenSIPS with this module loaded

## Exported Parameters

### `db_mode` (integer)

If set to 0, the module won't connect to the Database for reading the Keys for decoding JWTs - only jwt_script_authorize will be usable from the script.

*Default value is 0.*

**Example.** 0.

```opensips
modparam("auth\_jwt", "db\_mode", 0)
```
### `db_url` (string)

This is URL of the database to be used. Value of the parameter depends on the database module used. For example for mysql and postgres modules this is something like mysql://username:password@host:port/database. For dbtext module (which stores data in plaintext files) it is directory in which the database resides.

*Default value is mysql://opensipsro:opensipsro@localhost/opensips.*

**Example.** dbdriver://username:password@dbhost/dbname.

```opensips
modparam("auth\_jwt", "db\_url", "dbdriver://username:password@dbhost/dbname")
```
### `end_ts_column` (string)

column holding the jwt secret end unix timestamp.

*Default value is end_ts.*

**Example.** my_end_ts_column.

```opensips
...
modparam("auth\_jwt", "end\_ts", "my\_end\_ts\_column")
...
```
### `load_credentials` (string)

This parameter specifies credentials to be fetched from the JWT profiles table when the authentication is performed. The loaded credentials will be stored in AVPs. If the AVP name is not specificaly given, it will be used a NAME AVP with the same name as the column name.

Parameter syntax:

*   _load_credentials = credential (';' credential)*
    
*   _credential = (avp_specification '=' column_name) | (column_name)_
    
*   _avp_specification = '$avp(' + NAME + ')'_

*Default value is none ( empty ).*

**Example.** $avp(extra_jwt_info)=my_extra_column.

```opensips
# load my_extra_column into $avp(extra_jwt_info)
modparam("auth_jwt", "load_credentials", "$avp(extra_jwt_info)=my_extra_column")
```
### `profiles_table` (string)

Name of the DB table containing the jwt profiles

*Default value is jwt_profiles.*

**Example.** my_profiles.

```opensips
modparam("auth\_jwt", "profiles\_table", "my\_profiles")
```
### `secret_column` (string)

Column holding the actual jwt signing secret.

*Default value is secret.*

**Example.** my_secret_column.

```opensips
...
modparam("auth\_jwt", "secret\_column", "my\_secret\_column")
...
```
### `secret_tag_column` (string)

Column holding the JWT secret associated tag.

*Default value is corresponding_tag.*

**Example.** my_secret_tag_column.

```opensips
...
modparam("auth\_jwt", "secret\_tag\_column", "my\_secret\_tag\_column")
...
```
### `secrets_table` (string)

Name of the DB table containing the jwt secrets

*Default value is jwt_secrets.*

**Example.** my_secrets.

```opensips
modparam("auth\_jwt", "secrets\_table", "my\_secrets")
```
### `start_ts_column` (string)

Column holding the JWT secret start UNIX timestamp.

*Default value is start_ts.*

**Example.** my_start_ts_column.

```opensips
...
modparam("auth\_jwt", "start\_ts", "my\_start\_ts\_column")
...
```
### `tag_claim` (string)

The JWT claim which will be used to identify the JWT profile

*Default value is tag.*

**Example.** my_tag_claim.

```opensips
...
modparam("auth_jwt", "tag_claim", "my_tag_claim")
...
```
### `tag_column` (string)

Column holding the JWT profile tag.

*Default value is tag.*

**Example.** my_tag_column.

```opensips
modparam("auth\_jwt", "tag\_column", "my\_tag\_column")
```
### `username_column` (string)

Column holding the JWT profile associated SIP username.

*Default value is sip_username.*

**Example.** my_username_column.

```opensips
...
modparam("auth\_jwt", "username\_column", "my\_username\_column")
...
```

## Exported Functions

### `extract_pub_key_from_cert(certificate,out_public_key)`

The function will read the first param ( certificate ), decode it and then try to extract the public key with the certificate. If the extraction is succesful, the out_public_key will be populated. Useful to be used in conjuction with the jwt_script_authorize function, since most providers make their certificates public, but the JWTs are signed with the actual public key embeded in the certificate.

**Parameters:**

- `certificate` *(string, required)* — The certificate to read and from which to extract the public key. The string may contain pseudo variables.
- `out_public_key` *(pvar, required)* — PVAR used to store the extracted public key

**Return codes:**

- `-1` — Failure in extracting the pub key
- `1` — out_public_key succesfully populated

**Usable from:** REQUEST_ROUTE

**Related:**

- `jwt_script_authorize`

**Example.** extract_pub_key_from_cert usage.

```opensips
...
if (extract_pub_key_from_cert("$avp(my_certificate)",$avp(my_pub_key))) {
    xlog("Succesfully extracted public key - $avp(my_pub_key) \n");
}
...
```

### `jwt_db_authorize(jwt_token,out_decoded_token,out_sip_username)`

The function will read the first param ( jwt_token ), extract the tag claim and then try to authenticate it against the DB secrets for the respective profile tag. In case of success, it populates the out_decoded_token pvar with the decoded JWT ( in plaintext format header_json.payload_json ) and the out_sip_username with the SIP username corresponding to that JWT profile.

**Parameters:**

- `jwt_token` *(string, required)* — The JWT token to perform auth on. The string may contain pseudo variables.
- `out_decoded_token` *(pvar, required)* — PVAR used to store the decoded JWT upon succesful auth
- `out_sip_username` *(pvar, required)* — PVAR used to store the SIP username corresponding to the JWT profile, upon succesful auth

**Return codes:**

- `-1` — error - JWT authentication failed
- `1` — success

**Usable from:** REQUEST_ROUTE

**Example.** jwt_db_authorize usage.

```opensips
...
if (!jwt_db_authorize("$avp(my_jwt_token)", $avp(decoded_token), $avp(sip_username) )) {
	send_reply(401,"Unauthorized");
	exit;
} else {
	xlog("Succesful JWT auth - $avp(decoded_token) \n");
	if ($fU != $avp(sip_username)) {
		send_reply(403,"Forbidden AUTH ID");
		exit;
	}	
}
...
```

### `jwt_script_authorize(jwt_token,key, out_decoded_token)`

The function will read the first param ( jwt_token ), decode it and then try to validate it against the provided key. If the JWT decoding is succesful, the out_decoded_token pvar will be populated.

**Parameters:**

- `jwt_token` *(string, required)* — The JWT token to perform auth on. The string may contain pseudo variables.
- `key` *(string, required)* — The key to be used for validating the JWT.
- `out_decoded_token` *(pvar, required)* — PVAR used to store the decoded JWT

**Return codes:**

- `-2` — Failure in decoding the JWT ( out_decoded_token will not be populated )
- `-1` — Failure in validating the JWT ( out_decoded_token will be populated )
- `1` — JWT succesfully validated with the key ( out_decoded_token will be populated )

**Usable from:** REQUEST_ROUTE

**Example.** jwt_script_authorize usage.

```opensips
...
if (!jwt_script_authorize("$avp(my_jwt_token)",$avp(pub_key), $avp(decoded_token))) {
	send_reply(401,"Unauthorized");
	exit;
} else {
	xlog("Succesful JWT auth - $avp(decoded_token) \n");
}
...
```

## Configuration Examples

### `db_mode` parameter usage

```opensips
modparam("auth\_jwt", "db\_mode", 0)
```
### `db_url` parameter usage

```opensips
modparam("auth\_jwt", "db\_url", "dbdriver://username:password@dbhost/dbname")
```
### `profiles_table` parameter usage

```opensips
modparam("auth\_jwt", "profiles\_table", "my\_profiles")
```
### `secrets_table` parameter usage

```opensips
modparam("auth\_jwt", "secrets\_table", "my\_secrets")
```
### Set `tag_column` parameter

```opensips
...
modparam("auth\_jwt", "tag\_column", "my\_tag\_column")
...
```
### Set `username_column` parameter

```opensips
...
modparam("auth\_jwt", "username\_column", "my\_username\_column")
...
```
### Set `secret_tag_column` parameter

```opensips
...
modparam("auth\_jwt", "secret\_tag\_column", "my\_secret\_tag\_column")
...
```
### set `secret_column` parameter

```opensips
...
modparam("auth\_jwt", "secret\_column", "my\_secret\_column")
...
```
### set `start_ts` parameter

```opensips
...
modparam("auth\_jwt", "start\_ts", "my\_start\_ts\_column")
...
```
### set `end_ts` parameter

```opensips
...
modparam("auth\_jwt", "end\_ts", "my\_end\_ts\_column")
...
```
### set `tag_claim` parameter

```opensips
...
modparam("auth\_jwt", "tag\_claim", "my\_tag\_claim")
...
```
### `load_credentials` parameter usage

```opensips
# load my\_extra\_column into $avp(extra\_jwt\_info)
modparam("auth\_jwt", "load\_credentials", "$avp(extra\_jwt\_info)=my\_extra\_column")
```
### `jwt_db_authorize` usage

```opensips
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
```
### `jwt_script_authorize` usage

```opensips
...
if (!jwt\_script\_authorize("$avp(my\_jwt\_token)",$avp(pub\_key), $avp(decoded\_token))) {
	send\_reply(401,"Unauthorized");
	exit;
} else {
	xlog("Succesful JWT auth - $avp(decoded\_token) \\n");
}
...
```
### `extract_pub_key_from_cert` usage

```opensips
...
if (extract\_pub\_key\_from\_cert("$avp(my\_certificate)",$avp(my\_pub\_key))) {
    xlog("Succesfully extracted public key - $avp(my\_pub\_key) \\n");
}
...
```
