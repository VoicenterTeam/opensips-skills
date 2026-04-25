# uac_registrant Module Reference
<!-- generated-from: data/3.6/modules/uac_registrant.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 uac_registrant module. Read this file when configuring or debugging the uac_registrant module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported MI Functions](#exported-mi-functions)
- [Configuration Examples](#configuration-examples)

## Overview

The module enable OpenSIPS to register itself on a remote SIP registrar.

## How It Works

At startup, the registrant records are loaded into a hash table in memory and a timer is started. The hash index is computed over the AOR field.

The timer interval for checking records in a hash bucket is computed by dividing the timer_interval module param by the number of hash buckets. When the timer fires for the first time, the first hash bucket will be checked and REGISTERs will be sent out for each record that is found. On the next timeout fire, the second hash bucket will be checked and so on. If the configured timer_interval module param is lower then the number of buckets, the module will fail to start.

Example: setting the timer_interval module to 8 with a hash_size of 2, will result in having 4 hash buckets (2^2=4) and buckets will be checked one by one every 2s (8/4=2).

Each registrant has it's own state. Registrant's status can be inspected via "reg_list" MI comand.

UAC registrant states:

*   _0_ - NOT_REGISTERED_STATE - the initial state (no REGISTER has been sent out yet);
    
*   _1_ - REGISTERING_STATE - waiting for a reply from the registrar after a REGISTER without authentication header was sent;
    
*   _2_ - AUTHENTICATING_STATE - waiting for a reply from the registrar after a REGISTER with authentication header was sent;
    
*   _3_ - REGISTERED_STATE - the uac is successfully registered;
    
*   _4_ - REGISTER_TIMEOUT_STATE : no reply received from the registrar;
    
*   _5_ - INTERNAL_ERROR_STATE - some errors were found/encountered during the processing of a reply;
    
*   _6_ - WRONG_CREDENTIALS_STATE - credentials rejected by the registrar;
    
*   _7_ - REGISTRAR_ERROR_STATE - error reply received from the registrar;
    
*   _8_ - UNREGISTERING_STATE - waiting for a reply from the registrar after an unREGISTER without authentication header was sent;
    
*   _9_ - AUTHENTICATING_UNREGISTER_STATE - waiting for a reply from the registrar after an unREGISTER with authentication header was sent;

## Dependencies

### OpenSIPs Modules

- `uac_auth` — UAC authentication module

### External Libraries

None.

## Exported Parameters

### `aor_column` (string)

The column's name in the database storing the URI defining the address of record (mandatory field). The URI stored here will be used in the To URI of the REGISTER. OpenSIPS expects a valid URI.

*Default value is aor.*

**Example.** to_uri.

```opensips
modparam("uac\_registrant", "aor\_column", "to\_uri")
```
### `binding_URI_column` (string)

The column's name in the database storing the binding URI in REGISTER (mandatory field). The URI stored here will be used in the Contact URI of the REGISTER. OpenSIPS expects a valid URI.

*Default value is “binding\_URI”.*

**Example.** contact_uri.

```opensips
modparam("uac\_registrant", "binding\_URI\_column", "contact\_uri")
```
### `binding_params_column` (string)

The column's name in the database storing the binding params in REGISTER (not mandatory field). If not NULL or not empty, the string stored here will be added as params to the Contact URI in REGISTER (it MUST start with “;”.

If the following two params are present, then the binding will be enforced to be unique (if two bindings are received in a 200ok, a complete binding removal will be performed before re-registering):

*   _reg-id_
    
*   _+sip.instance_
    
Example of params that will force unique binding:

;reg-id=1;+sip.instance="<urn:uuid:11111111-AABBCCDDEEFF>"

*Default value is “binding\_params”.*

**Example.** contact_params.

```opensips
modparam("uac\_registrant", "binding\_params\_column", "contact\_params")
```
### `cluster_shtag_column` (string)

The column's name in the database storing the cluster sharing tag in \[tag\_name/cluster\_id\] format (not mandatory). If a cluster sharing tag is provided, the REGISTER requests will be fired out only when the tag is active.

*Default value is cluster_shtag.*

**Example.** sh.

```opensips
modparam("uac\_registrant", "cluster\_shtag\_column", "sh")
```
### `db_url` (string)

Database where to load the registrants from.

*Default value is “NULL” (use default DB URL from core).*

**Example.** mysql://user:passw@localhost/database.

```opensips
modparam("uac\_registrant", "db\_url", "mysql://user:passw@localhost/database")
```
### `enable_clustering` (integer)

This parameter enables the clustering support in the module. This is used to share this registration between all the nodes in the cluster. When using this option, you should define (for each registrant record) a sharing tag - this sharing tag will control at the cluster level which node is entitled to perform the registation (only the node having that tag as active will do the registation, the onther nodes being idle).

*Default value is 0 / off.*

**Possible values:**

- 0
- 1

**Example.** 1.

```opensips
modparam("uac\_registrant", "enable\_clustering", 1)
```
### `expiry_column` (string)

The column's name in the database storing the expiration time (not mandatory).

*Default value is “expiry”.*

**Example.** registration_timeout.

```opensips
modparam("uac\_registrant", "expiry\_column", "registration\_timeout")
```
### `failure_retry_interval` (integer)

Defines a custom interval to retry the registration upon error/failure. Normally, after any kind of failure (timeout, credentials, internal error), the registration is re-taken after "expires" seconds. The parameter here, if set, overrides that value.

*Default value is 0 (not set).*

**Example.** 3600.

```opensips
modparam("uac\_registrant", "failure\_retry\_interval", 3600)
```
### `forced_socket_column` (string)

The column's name in the database storing the socket for sending the REGISTER (not mandatory). If a forced socket is provided, the socket MUST be explicitely set as a global listening socket in the config (see “listen” core parameter).

*Default value is forced_socket.*

**Example.** fs.

```opensips
modparam("uac\_registrant", "forced\_socket\_column", "fs")
```
### `hash_size` (integer)

The size of the hash table internally used to keep the registrants. A larger table distributes better the registration load in time but consumes more memory. The hash size is a power of number two.

*Default value is 1.*

**Example.** 2.

```opensips
modparam("uac\_registrant", "hash\_size", 2)
```
### `password_column` (string)

The column's name in the database storing the password for authentication (mandatory if the registrar requires authntication).

*Default value is “password”.*

**Example.** auth_passowrd.

```opensips
modparam("uac\_registrant", "password\_column", "auth\_passowrd")
```
### `proxy_column` (string)

The column's name in the database storing the URI pointing to the outbond proxy (not mandatory field). An empty or NULL value means no outbound proxy, otherwise OpenSIPS expects a valid URI.

*Default value is proxy.*

**Example.** proxy_uri.

```opensips
modparam("uac\_registrant", "proxy\_column", "proxy\_uri")
```
### `registrar_column` (string)

The column's name in the database storing the URI pointing to the remote registrar (mandatory field). OpenSIPS expects a valid URI.

*Default value is registrar.*

**Example.** registrant_uri.

```opensips
modparam("uac\_registrant", "registrar\_column", "registrant\_uri")
```
### `state_column` (string)

The column's name in the database storing the current state of the registrant. When a registrant is disabled, OpenSIPS will no longer send REGISTERs for it. A value of _0_ for this column means enabled and _1_ disabled.

*Default value is state.*

**Example.** status.

```opensips
modparam("uac\_registrant", "state\_column", "status")
```
### `table_name` (string)

The database table that holds the registrant records.

*Default value is registrant.*

**Example.** my_registrant.

```opensips
modparam("uac\_registrant", "table\_name", "my\_registrant")
```
### `third_party_registrant_column` (string)

The column's name in the database storing the URI defining the third party registrant (not mandatory field). The URI stored here will be used in the From URI of the REGISTER. An empty or NULL value means no third party registration (the From URI will be identical to To URI), otherwise OpenSIPS expects a valid URI.

*Default value is third_party_registrant.*

**Example.** from_uri.

```opensips
modparam("uac\_registrant", "third\_party\_registrant\_column", "from\_uri")
```
### `timer_interval` (integer)

Defines the periodic timer for checking the registrations status.

*Default value is 100.*

**Example.** 120.

```opensips
modparam("uac\_registrant", "timer\_interval", 120)
```
### `username_column` (string)

The column's name in the database storing the username for authentication (mandatory if the registrar requires authentication).

*Default value is “username”.*

**Example.** auth_username.

```opensips
modparam("uac\_registrant", "username\_column", "auth\_username")
```

## Exported MI Functions

### `reg_disable`

Disables a specific registrant. OpenSIPS will immediately send an unREGISTER if the registrant was previously enabled and will update the state in the database.

**Parameters:**

- `aor` *(string, optional)* — URI defining the address of record. If provided, _contact_ and _registrar_ parameters are also required and only a specific record will be disabled.
- `contact` *(string, optional)* — Contact URI. If provided, _aor_ and _registrar_ parameters are also required and only a specific record will be disabled.
- `registrar` *(string, optional)* — URI pointing to the remote registrar. If provided, _aor_ and _contact_ parameters are also required and only a specific record will be disabled.

**Example.**

```opensips-cli
opensips-cli -x mi reg_disable sip:alice@opensips.org  sip:alice@127.0.0.1:5060 sip:opensips.org
```

### `reg_enable`

Enables a specific registrant. OpenSIPS will immediately send a REGISTER if the registrant was previously disabled and will update the state in the database.

**Parameters:**

- `aor` *(string, required)* — URI defining the address of record.
- `contact` *(string, required)* — Contact URI.
- `registrar` *(string, required)* — URI pointing to the remote registrar.

**Example.**

```opensips-cli
opensips-cli -x mi reg_enable sip:alice@opensips.org  sip:alice@127.0.0.1:5060 sip:opensips.org
```

### `reg_force_register`

Forces the re-registration (or registation) of a specific registrant (depending on its state). Note that the registrant must be enabled.

**Parameters:**

- `aor` *(string, optional)* — URI defining the address of record. If provided, _contact_ and _registrar_ parameters are also required and only a specific record will be forced to re-register.
- `contact` *(string, optional)* — Contact URI. If provided, _aor_ and _registrar_ parameters are also required and only a specific record will be forced to re-register.
- `registrar` *(string, optional)* — URI pointing to the remote registrar. If provided, _aor_ and _contact_ parameters are also required and only a specific record will be forced to re-register.

**Example.**

```opensips-cli
opensips-cli -x mi reg_force_register sip:alice@opensips.org  sip:alice@127.0.0.1:5060 sip:opensips.org
```

### `reg_list`

Lists the registrant records and their status.

**Parameters:**

- `aor` *(string, optional)* — URI defining the address of record. If provided, _contact_ and _registrar_ parameters are also required and only a specific record will be listed.
- `contact` *(string, optional)* — Contact URI. If provided, _aor_ and _registrar_ parameters are also required and only a specific record will be listed.
- `registrar` *(string, optional)* — URI pointing to the remote registrar. If provided, _aor_ and _contact_ parameters are also required and only a specific record will be listed.

**Example.**

```opensips-cli
opensips-cli -x mi reg_list
```

**Example.**

```opensips-cli
opensips-cli -x mi reg_list sip:alice@opensips.org  sip:alice@127.0.0.1:5060 sip:opensips.org
```

### `reg_reload`

Reloads the registrant records from the database.

**Parameters:**

- `aor` *(string, optional)* — URI defining the address of record. If provided, _contact_ and _registrar_ parameters are also required and only a specific record will be reloaded.
- `contact` *(string, optional)* — Contact URI. If provided, _aor_ and _registrar_ parameters are also required and only a specific record will be reloaded.
- `registrar` *(string, optional)* — URI pointing to the remote registrar. If provided, _aor_ and _contact_ parameters are also required and only a specific record will be reloaded.

**Example.**

```opensips-cli
opensips-cli -x mi reg_reload
```

**Example.**

```opensips-cli
opensips-cli -x mi reg_leload sip:alice@opensips.org  sip:alice@127.0.0.1:5060 sip:opensips.org
```

## Configuration Examples

### Set `hash_size` parameter

The size of the hash table internally used to keep the registrants. A larger table distributes better the registration load in time but consumes more memory. The hash size is a power of number two.

```opensips
...
modparam("uac\_registrant", "hash\_size", 2)
...
```
### Set `timer_interval` parameter

Defines the periodic timer for checking the registrations status.

```opensips
...
modparam("uac\_registrant", "timer\_interval", 120)
...
```
### Set `failure_retry_interval` parameter

Defines a custom interval to retry the registration upon error/failure. Normally, after any kind of failure (timeout, credentials, internal error), the registration is re-taken after "expires" seconds. The parameter here, if set, overrides that value.

```opensips
...
modparam("uac\_registrant", "failure\_retry\_interval", 3600)
...
```
### Set `enable_clustering` parameter

This parameter enables the clustering support in the module. This is used to share this registration between all the nodes in the cluster. When using this option, you should define (for each registrant record) a sharing tag - this sharing tag will control at the cluster level which node is entitled to perform the registation (only the node having that tag as active will do the registation, the onther nodes being idle).

```opensips
...
modparam("uac\_registrant", "enable\_clustering", 1)
...
```
### Set “db\_url” parameter

Database where to load the registrants from.

```opensips
...
modparam("uac\_registrant", "db\_url", "mysql://user:passw@localhost/database")
...
```
### Set “table\_name” parameter

The database table that holds the registrant records.

```opensips
...
modparam("uac\_registrant", "table\_name", "my\_registrant")
...
```
### Set “registrar\_column” parameter

The column's name in the database storing the URI pointing to the remote registrar (mandatory field). OpenSIPS expects a valid URI.

```opensips
...
modparam("uac\_registrant", "registrar\_column", "registrant\_uri")
...
```
### Set “proxy\_column” parameter

The column's name in the database storing the URI pointing to the outbond proxy (not mandatory field). An empty or NULL value means no outbound proxy, otherwise OpenSIPS expects a valid URI.

```opensips
...
modparam("uac\_registrant", "proxy\_column", "proxy\_uri")
...
```
### Set “aor\_column” parameter

The column's name in the database storing the URI defining the address of record (mandatory field). The URI stored here will be used in the To URI of the REGISTER. OpenSIPS expects a valid URI.

```opensips
...
modparam("uac\_registrant", "aor\_column", "to\_uri")
...
```
### Set “third\_party\_registrant\_column” parameter

The column's name in the database storing the URI defining the third party registrant (not mandatory field). The URI stored here will be used in the From URI of the REGISTER. An empty or NULL value means no third party registration (the From URI will be identical to To URI), otherwise OpenSIPS expects a valid URI.

```opensips
...
modparam("uac\_registrant", "third\_party\_registrant\_column", "from\_uri")
...
```
### Set “username\_column” parameter

The column's name in the database storing the username for authentication (mandatory if the registrar requires authentication).

```opensips
...
modparam("uac\_registrant", "username\_column", "auth\_username")
...
```
### Set “password\_column” parameter

The column's name in the database storing the password for authentication (mandatory if the registrar requires authntication).

```opensips
...
modparam("uac\_registrant", "password\_column", "auth\_passowrd")
...
```
### Set “binding\_URI\_column” parameter

The column's name in the database storing the binding URI in REGISTER (mandatory field). The URI stored here will be used in the Contact URI of the REGISTER. OpenSIPS expects a valid URI.

```opensips
...
modparam("uac\_registrant", "binding\_URI\_column", "contact\_uri")
...
```
### Set “binding\_params\_column” parameter

The column's name in the database storing the binding params in REGISTER (not mandatory field). If not NULL or not empty, the string stored here will be added as params to the Contact URI in REGISTER (it MUST start with ";".

If the following two params are present, then the binding will be enforced to be unique (if two bindings are received in a 200ok, a complete binding removal will be performed before re-registering):

*   _reg-id_
    
*   _+sip.instance_

```opensips
...
modparam("uac\_registrant", "binding\_params\_column", "contact\_params")
...
```
### Set “expiry\_column” parameter

The column's name in the database storing the expiration time (not mandatory).

```opensips
...
modparam("uac\_registrant", "expiry\_column", "registration\_timeout")
...
```
### Set “forced\_socket\_column” parameter

The column's name in the database storing the socket for sending the REGISTER (not mandatory). If a forced socket is provided, the socket MUST be explicitely set as a global listening socket in the config (see "listen" core parameter).

```opensips
...
modparam("uac\_registrant", "forced\_socket\_column", "fs")
...
```
### Set “cluster\_shtag\_column” parameter

The column's name in the database storing the cluster sharing tag in \[tag\_name/cluster\_id\] format (not mandatory). If a cluster sharing tag is provided, the REGISTER requests will be fired out only when the tag is active.

```opensips
...
modparam("uac\_registrant", "cluster\_shtag\_column", "sh")
...
```
### Set “state\_column” parameter

The column's name in the database storing the current state of the registrant. When a registrant is disabled, OpenSIPS will no longer send REGISTERs for it. A value of _0_ for this column means enabled and _1_ disabled.

```opensips
...
modparam("uac\_registrant", "state\_column", "status")
...
```
