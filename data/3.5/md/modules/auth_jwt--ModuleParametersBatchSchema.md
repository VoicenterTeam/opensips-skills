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