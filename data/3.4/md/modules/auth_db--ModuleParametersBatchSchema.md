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