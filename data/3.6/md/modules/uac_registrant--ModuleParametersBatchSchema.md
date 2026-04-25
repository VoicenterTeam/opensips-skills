## 1.3.�Exported Parameters

### 1.3.1.�`hash_size` (integer)

The size of the hash table internally used to keep the registrants. A larger table distributes better the registration load in time but consumes more memory. The hash size is a power of number two.

_Default value is 1._

**Example�1.1.�Set `hash_size` parameter**

...
modparam("uac\_registrant", "hash\_size", 2)
...

  

### 1.3.2.�`timer_interval` (integer)

Defines the periodic timer for checking the registrations status.

_Default value is 100._

**Example�1.2.�Set `timer_interval` parameter**

...
modparam("uac\_registrant", "timer\_interval", 120)
...

  

### 1.3.3.�`failure_retry_interval` (integer)

Defines a custom interval to retry the registration upon error/failure. Normally, after any kind of failure (timeout, credentials, internal error), the registration is re-taken after "expires" seconds. The parameter here, if set, overrides that value.

_Default value is 0 (not set)._

**Example�1.3.�Set `failure_retry_interval` parameter**

...
modparam("uac\_registrant", "failure\_retry\_interval", 3600)
...

  

### 1.3.4.�`enable_clustering` (integer)

This parameter enables the clustering support in the module. This is used to share this registration between all the nodes in the cluster. When using this option, you should define (for each registrant record) a sharing tag - this sharing tag will control at the cluster level which node is entitled to perform the registation (only the node having that tag as active will do the registation, the onther nodes being idle).

_Default value is 0 / off._

**Example�1.4.�Set `enable_clustering` parameter**

...
modparam("uac\_registrant", "enable\_clustering", 1)
...

  

### 1.3.5.�`db_url` (string)

Database where to load the registrants from.

_Default value is “NULL” (use default DB URL from core)._

**Example�1.5.�Set “db\_url” parameter**

...
modparam("uac\_registrant", "db\_url", "mysql://user:passw@localhost/database")
...

  

### 1.3.6.�`table_name` (string)

The database table that holds the registrant records.

_Default value is “registrant”._

**Example�1.6.�Set “table\_name” parameter**

...
modparam("uac\_registrant", "table\_name", "my\_registrant")
...

  

### 1.3.7.�`registrar_column` (string)

The column's name in the database storing the URI pointing to the remote registrar (mandatory field). OpenSIPS expects a valid URI.

_Default value is “registrar”._

**Example�1.7.�Set “registrar\_column” parameter**

...
modparam("uac\_registrant", "registrar\_column", "registrant\_uri")
...

  

### 1.3.8.�`proxy_column` (string)

The column's name in the database storing the URI pointing to the outbond proxy (not mandatory field). An empty or NULL value means no outbound proxy, otherwise OpenSIPS expects a valid URI.

_Default value is “proxy”._

**Example�1.8.�Set “proxy\_column” parameter**

...
modparam("uac\_registrant", "proxy\_column", "proxy\_uri")
...

  

### 1.3.9.�`aor_column` (string)

The column's name in the database storing the URI defining the address of record (mandatory field). The URI stored here will be used in the To URI of the REGISTER. OpenSIPS expects a valid URI.

_Default value is “aor”._

**Example�1.9.�Set “aor\_column” parameter**

...
modparam("uac\_registrant", "aor\_column", "to\_uri")
...

  

### 1.3.10.�`third_party_registrant_column` (string)

The column's name in the database storing the URI defining the third party registrant (not mandatory field). The URI stored here will be used in the From URI of the REGISTER. An empty or NULL value means no third party registration (the From URI will be identical to To URI), otherwise OpenSIPS expects a valid URI.

_Default value is “third\_party\_registrant”._

**Example�1.10.�Set “third\_party\_registrant\_column” parameter**

...
modparam("uac\_registrant", "third\_party\_registrant\_column", "from\_uri")
...

  

### 1.3.11.�`username_column` (string)

The column's name in the database storing the username for authentication (mandatory if the registrar requires authentication).

_Default value is “username”._

**Example�1.11.�Set “username\_column” parameter**

...
modparam("uac\_registrant", "username\_column", "auth\_username")
...

  

### 1.3.12.�`password_column` (string)

The column's name in the database storing the password for authentication (mandatory if the registrar requires authntication).

_Default value is “password”._

**Example�1.12.�Set “password\_column” parameter**

...
modparam("uac\_registrant", "password\_column", "auth\_passowrd")
...

  

### 1.3.13.�`binding_URI_column` (string)

The column's name in the database storing the binding URI in REGISTER (mandatory field). The URI stored here will be used in the Contact URI of the REGISTER. OpenSIPS expects a valid URI.

_Default value is “binding\_URI”._

**Example�1.13.�Set “binding\_URI\_column” parameter**

...
modparam("uac\_registrant", "binding\_URI\_column", "contact\_uri")
...

  

### 1.3.14.�`binding_params_column` (string)

The column's name in the database storing the binding params in REGISTER (not mandatory field). If not NULL or not empty, the string stored here will be added as params to the Contact URI in REGISTER (it MUST start with “;”.

If the following two params are present, then the binding will be enforced to be unique (if two bindings are received in a 200ok, a complete binding removal will be performed before re-registering):

*   _reg-id_
    
*   _+sip.instance_
    

Example of params that will force unique binding:

;reg-id=1;+sip.instance="<urn:uuid:11111111-AABBCCDDEEFF>"
		

_Default value is “binding\_params”._

**Example�1.14.�Set “binding\_params\_column” parameter**

...
modparam("uac\_registrant", "binding\_params\_column", "contact\_params")
...

  

### 1.3.15.�`expiry_column` (string)

The column's name in the database storing the expiration time (not mandatory).

_Default value is “expiry”._

**Example�1.15.�Set “expiry\_column” parameter**

...
modparam("uac\_registrant", "expiry\_column", "registration\_timeout")
...

  

### 1.3.16.�`forced_socket_column` (string)

The column's name in the database storing the socket for sending the REGISTER (not mandatory). If a forced socket is provided, the socket MUST be explicitely set as a global listening socket in the config (see “listen” core parameter).

_Default value is “forced\_socket”._

**Example�1.16.�Set “forced\_socket\_column” parameter**

...
modparam("uac\_registrant", "forced\_socket\_column", "fs")
...

  

### 1.3.17.�`cluster_shtag_column` (string)

The column's name in the database storing the cluster sharing tag in \[tag\_name/cluster\_id\] format (not mandatory). If a cluster sharing tag is provided, the REGISTER requests will be fired out only when the tag is active.

_Default value is “cluster\_shtag”._

**Example�1.17.�Set “cluster\_shtag\_column” parameter**

...
modparam("uac\_registrant", "cluster\_shtag\_column", "sh")
...

  

### 1.3.18.�`state_column` (string)

The column's name in the database storing the current state of the registrant. When a registrant is disabled, OpenSIPS will no longer send REGISTERs for it. A value of _0_ for this column means enabled and _1_ disabled.

_Default value is “state”._

**Example�1.18.�Set “state\_column” parameter**

...
modparam("uac\_registrant", "state\_column", "status")
...