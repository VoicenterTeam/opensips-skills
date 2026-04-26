# uac_registrant Module Reference
<!-- generated-from: data/4.0/modules/uac_registrant.json
     generator-version: 0.1.0
     opensips-version: 4.0
     doc-type: module -->

Reference for the OpenSIPs 4.0 uac_registrant module. Read this file when configuring or debugging the uac_registrant module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported MI Functions](#exported-mi-functions)
- [Exported Events](#exported-events)
- [Configuration Examples](#configuration-examples)

## Overview

The module enable OpenSIPS to register itself on a remote SIP registrar.

## How It Works

At startup, the registrant records are loaded into a hash table in memory and a timer is started. The hash index is computed over the AOR field.

The timer interval for checking records in a hash bucket is computed by dividing the timer_interval module param by the number of hash buckets. When the timer fires for the first time, the first hash bucket will be checked and REGISTERs will be sent out for each record that is found. On the next timeout fire, the second hash bucket will be checked and so on. If the configured timer_interval module param is lower then the number of buckets, the module will fail to start.

Example: setting the timer_interval module to 8 with a hash_size of 2, will result in having 4 hash buckets (2^2=4) and buckets will be checked one by one every 2s (8/4=2).

Each registrant has it's own state. Registrant's status can be inspected via "uac_registrant:list" MI command.

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
modparam("uac_registrant", "aor_column", "to_uri")
```
### `binding_URI_column` (string)

The column's name in the database storing the binding URI in REGISTER (mandatory field). The URI stored here will be used in the Contact URI of the REGISTER. OpenSIPS expects a valid URI.

*Default value is binding_URI.*

**Example.** contact_uri.

```opensips
modparam("uac_registrant", "binding_URI_column", "contact_uri")
```
### `binding_params_column` (string)

The column's name in the database storing the binding params in REGISTER (not mandatory field). If not NULL or not empty, the string stored here will be added as params to the Contact URI in REGISTER (it MUST start with “;”.

If the following two params are present, then the binding will be enforced to be unique (if two bindings are received in a 200ok, a complete binding removal will be performed before re-registering):

*   _reg-id_
    
*   _+sip.instance_
    
Example of params that will force unique binding:

;reg-id=1;+sip.instance="<urn:uuid:11111111-AABBCCDDEEFF>"

*Default value is binding_params.*

**Example.** contact_params.

```opensips
modparam("uac_registrant", "binding_params_column", "contact_params")
```
### `cluster_shtag_column` (string)

The column's name in the database storing the cluster sharing tag in \[tag_name/cluster_id\] format (not mandatory). If a cluster sharing tag is provided, the REGISTER requests will be fired out only when the tag is active.

*Default value is cluster_shtag.*

**Example.** sh.

```opensips
modparam("uac_registrant", "cluster_shtag_column", "sh")
```
### `db_url` (string)

Database where to load the registrants from.

*Default value is “NULL” (use default DB URL from core).*

**Example.** "mysql://user:passw@localhost/database".

```opensips
modparam("uac_registrant", "db_url", "mysql://user:passw@localhost/database")
```
### `enable_clustering` (integer)

This parameter enables the clustering support in the module. This is used to share this registration between all the nodes in the cluster. When using this option, you should define (for each registrant record) a sharing tag - this sharing tag will control at the cluster level which node is entitled to perform the registation (only the node having that tag as active will do the registation, the onther nodes being idle).

*Default value is 0 / off.*

**Example.** 1.

```opensips
modparam("uac_registrant", "enable_clustering", 1)
```
### `expiry_column` (string)

The column's name in the database storing the expiration time (not mandatory).

*Default value is expiry.*

**Example.** registration_timeout.

```opensips
modparam("uac_registrant", "expiry_column", "registration_timeout")
```
### `failure_retry_interval` (integer)

Defines a custom interval to retry the registration upon error/failure. Normally, after any kind of failure (timeout, credentials, internal error), the registration is re-taken after "expires" seconds. The parameter here, if set, overrides that value.

*Default value is 0 (not set).*

**Example.** 3600.

```opensips
modparam("uac_registrant", "failure_retry_interval", 3600)
```
### `forced_socket_column` (string)

The column's name in the database storing the socket for sending the REGISTER (not mandatory). If a forced socket is provided, the socket MUST be explicitely set as a global listening socket in the config (see “socket” core parameter).

*Default value is forced_socket.*

**Example.** fs.

```opensips
modparam("uac_registrant", "forced_socket_column", "fs")
```
### `hash_size` (integer)

The size of the hash table internally used to keep the registrants. A larger table distributes better the registration load in time but consumes more memory. The hash size is a power of number two.

*Default value is 1.*

**Example.** 2.

```opensips
modparam("uac_registrant", "hash_size", 2)
```
### `password_column` (string)

The column's name in the database storing the password for authentication (mandatory if the registrar requires authntication).

*Default value is password.*

**Example.** auth_passowrd.

```opensips
modparam("uac_registrant", "password_column", "auth_passowrd")
```
### `proxy_column` (string)

The column's name in the database storing the URI pointing to the outbond proxy (not mandatory field). An empty or NULL value means no outbound proxy, otherwise OpenSIPS expects a valid URI.

*Default value is proxy.*

**Example.** proxy_uri.

```opensips
modparam("uac_registrant", "proxy_column", "proxy_uri")
```
### `registrar_column` (string)

The column's name in the database storing the URI pointing to the remote registrar (mandatory field). OpenSIPS expects a valid URI.

*Default value is registrar.*

**Example.** registrant_uri.

```opensips
modparam("uac_registrant", "registrar_column", "registrant_uri")
```
### `reregister_expiry_percentage` (integer)

Percentage describing how much sooner a RE-REGISTER needs to be send based on the Expiry. a 100 value means the RE-REGISTER will be send right on the edge of expiry ( old behavior ), which might lead to registration loss. a 90 value means the RE-REGISTER will be sent sooner , at 90% of the Expiry, etc.

*Default value is 100.*

**Example.** 90.

```opensips
modparam("uac_registrant", "reregister_expiry_percentage", 90)
```
### `state_column` (string)

The column's name in the database storing the current state of the registrant. When a registrant is disabled, OpenSIPS will no longer send REGISTERs for it. A value of _0_ for this column means enabled and _1_ disabled.

*Default value is state.*

**Example.** status.

```opensips
modparam("uac_registrant", "state_column", "status")
```
### `table_name` (string)

The database table that holds the registrant records.

*Default value is registrant.*

**Example.** my_registrant.

```opensips
modparam("uac_registrant", "table_name", "my_registrant")
```
### `third_party_registrant_column` (string)

The column's name in the database storing the URI defining the third party registrant (not mandatory field). The URI stored here will be used in the From URI of the REGISTER. An empty or NULL value means no third party registration (the From URI will be identical to To URI), otherwise OpenSIPS expects a valid URI.

*Default value is third_party_registrant.*

**Example.** from_uri.

```opensips
modparam("uac_registrant", "third_party_registrant_column", "from_uri")
```
### `timer_interval` (integer)

Defines the periodic timer for checking the registrations status.

*Default value is 100.*

**Example.** 120.

```opensips
modparam("uac_registrant", "timer_interval", 120)
```
### `username_column` (string)

The column's name in the database storing the username for authentication (mandatory if the registrar requires authentication).

*Default value is username.*

**Example.** auth_username.

```opensips
modparam("uac_registrant", "username_column", "auth_username")
```

## Exported MI Functions

### `uac_registrant:delete`

Replaces obsolete MI command: _reg_delete_. Deletes the in-memory contents of the AOR/Contact/Registrar. No Database queries are done when calling this MI command, all parameters are passed via MI.

**Parameters:**

- `aor` *(string, required)* — URI defining the address
- `contact` *(string, required)* — Contact URI
- `registrar` *(string, required)* — URI pointing to the remote registrar

**Returns:** Deletes the in-memory contents of the AOR/Contact/Registrar. No Database queries are done when calling this MI command, all parameters are passed via MI.

**Example.** Delete a registrant record.

```bash
opensips-cli -x mi uac_registrant:delete aor=sip:vlad@test.com contact=sip:test@localhost registrar=sip:127.0.0.1:5061
```

### `uac_registrant:disable`

Replaces obsolete MI command: _reg_disable_. Disables a specific registrant. OpenSIPS will immediately send an unREGISTER if the registrant was previously enabled and will update the state in the database.

**Parameters:**

- `aor` *(string, optional)* — URI defining the address of record. If provided, _contact_ and _registrar_ parameters are also required and only a specific record will be disabled.
- `contact` *(string, optional)* — Contact URI. If provided, _aor_ and _registrar_ parameters are also required and only a specific record will be disabled.
- `registrar` *(string, optional)* — URI pointing to the remote registrar. If provided, _aor_ and _contact_ parameters are also required and only a specific record will be disabled.

**Returns:** Disables a specific registrant. OpenSIPS will immediately send an unREGISTER if the registrant was previously enabled and will update the state in the database.

**Example.** Disable a specific registrant.

```bash
opensips-cli -x mi uac_registrant:disable sip:alice@opensips.org  sip:alice@127.0.0.1:5060 sip:opensips.org
```

### `uac_registrant:enable`

Replaces obsolete MI command: _reg_enable_. Enables a specific registrant. OpenSIPS will immediately send a REGISTER if the registrant was previously disabled and will update the state in the database.

**Parameters:**

- `aor` *(string, required)* — URI defining the address of record.
- `contact` *(string, required)* — Contact URI.
- `registrar` *(string, required)* — URI pointing to the remote registrar.

**Returns:** Enables a specific registrant. OpenSIPS will immediately send a REGISTER if the registrant was previously disabled and will update the state in the database.

**Example.** Enable a specific registrant.

```bash
opensips-cli -x mi uac_registrant:enable sip:alice@opensips.org  sip:alice@127.0.0.1:5060 sip:opensips.org
```

### `uac_registrant:force_register`

Replaces obsolete MI command: _reg_force_register_. Forces the re-registration (or registation) of a specific registrant (depending on its state). Note that the registrant must be enabled.

**Parameters:**

- `aor` *(string, required)* — URI defining the address of record. If provided, _contact_ and _registrar_ parameters are also required and only a specific record will be forced to re-register.
- `contact` *(string, required)* — Contact URI. If provided, _aor_ and _registrar_ parameters are also required and only a specific record will be forced to re-register.
- `registrar` *(string, required)* — URI pointing to the remote registrar. If provided, _aor_ and _contact_ parameters are also required and only a specific record will be forced to re-register.

**Returns:** Forces the re-registration (or registation) of a specific registrant (depending on its state). Note that the registrant must be enabled.

**Example.** Force re-registration of a specific registrant.

```bash
opensips-cli -x mi uac_registrant:force_register sip:alice@opensips.org  sip:alice@127.0.0.1:5060 sip:opensips.org
```

### `uac_registrant:list`

Replaces obsolete MI command: _reg_list_. Lists the registrant records and their status.

**Parameters:**

- `aor` *(string, optional)* — URI defining the address of record. If provided, _contact_ and _registrar_ parameters are also required and only a specific record will be listed.
- `contact` *(string, optional)* — Contact URI. If provided, _aor_ and _registrar_ parameters are also required and only a specific record will be listed.
- `registrar` *(string, optional)* — URI pointing to the remote registrar. If provided, _aor_ and _contact_ parameters are also required and only a specific record will be listed.

**Returns:** Lists the registrant records and their status.

**Example.** List all registrant records.

```bash
opensips-cli -x mi uac_registrant:list
```

**Example.** List a specific registrant record.

```bash
opensips-cli -x mi uac_registrant:list sip:alice@opensips.org  sip:alice@127.0.0.1:5060 sip:opensips.org
```

### `uac_registrant:reload`

Replaces obsolete MI command: _reg_reload_. Reloads the registrant records from the database.

**Parameters:**

- `aor` *(string, optional)* — URI defining the address of record. If provided, _contact_ and _registrar_ parameters are also required and only a specific record will be reloaded.
- `contact` *(string, optional)* — Contact URI. If provided, _aor_ and _registrar_ parameters are also required and only a specific record will be reloaded.
- `registrar` *(string, optional)* — URI pointing to the remote registrar. If provided, _aor_ and _contact_ parameters are also required and only a specific record will be reloaded.

**Returns:** Reloads the registrant records from the database.

**Example.** Reload all registrant records.

```bash
opensips-cli -x mi uac_registrant:reload
```

**Example.** Reload a specific registrant record.

```bash
opensips-cli -x mi reg_leload sip:alice@opensips.org  sip:alice@127.0.0.1:5060 sip:opensips.org
```

### `uac_registrant:upsert`

Replaces obsolete MI command: _reg_upsert_. Inserts or updates the in-memory contents of the AOR/Contact/Registrar. No Database queries are done when calling this MI command, all parameters are passed via MI.

**Parameters:**

- `aor` *(string, required)* — URI defining the address
- `binding_params` *(string, required)* — params to be added to the registration
- `cluster_shtag` *(string, required)* — the sharing tag for this registration
- `contact` *(string, required)* — Contact URI
- `expiry` *(integer, required)* — number of seconds that the registration will be valid
- `forced_socket` *(string, required)* — opensips socket to send out the register out through
- `password` *(string, required)* — the password for auth purposes
- `proxy` *(string, required)* — URI of a registration proxy
- `registrar` *(string, required)* — URI pointing to the remote registrar
- `state` *(integer, required)* — 0 for enabled, 1 for disabled
- `third_party_registrant` *(string, required)* — 3rd party registrant
- `username` *(string, required)* — the username for auth purposes

**Returns:** Inserts or updates the in-memory contents of the AOR/Contact/Registrar. No Database queries are done when calling this MI command, all parameters are passed via MI.

**Example.** Upsert a registrant record.

```bash
opensips-cli -x mi uac_registrant:upsert aor=sip:vlad@test.com contact=sip:test@localhost registrar=sip:127.0.0.1:5061 proxy="" third_party_registrant="" username="vlad" password="1234" binding_params="" expiry=60 forced_socket="" cluster_shtag="" state=0
```

## Exported Events

### `E_REGISTRANT_AUTHENTICATING`

This event is raised when the initial REGISTER has been challenged and a new REGISTER with credentials has been sent out.

**Parameters:**

- `aor` *(string)* — the AOR
- `contact` *(string)* — the Contact
- `registrar` *(string)* — the Registrar
### `E_REGISTRANT_AUTHENTICATING_UNREGISTER`

This event is raised when a de-REGISTER is challenged and auth is sent by OpenSIPS.

**Parameters:**

- `aor` *(string)* — the AOR
- `contact` *(string)* — the Contact
- `registrar` *(string)* — the Registrar
### `E_REGISTRANT_INTERNAL_ERROR`

This event is raised when a REGISTER procesing was stopped due to an internal OpenSIPS error.

**Parameters:**

- `aor` *(string)* — the AOR
- `contact` *(string)* — the Contact
- `registrar` *(string)* — the Registrar
### `E_REGISTRANT_REGISTERED`

This event is raised when a REGISTER has been 200 OKd.

**Parameters:**

- `aor` *(string)* — the AOR
- `contact` *(string)* — the Contact
- `registrar` *(string)* — the Registrar
### `E_REGISTRANT_REGISTERING`

This event is raised when the module sent the initial REGISTER and started the registration process.

**Parameters:**

- `aor` *(string)* — the AOR
- `contact` *(string)* — the Contact
- `registrar` *(string)* — the Registrar
### `E_REGISTRANT_REGISTER_TIMEOUT`

This event is raised when a REGISTER received no reply from the registrar.

**Parameters:**

- `aor` *(string)* — the AOR
- `contact` *(string)* — the Contact
- `registrar` *(string)* — the Registrar
### `E_REGISTRANT_REGISTRAR_ERROR`

This event is raised when a REGISTER is rejected by the registrar with a non-standard sip code.

**Parameters:**

- `aor` *(string)* — the AOR
- `contact` *(string)* — the Contact
- `registrar` *(string)* — the Registrar
### `E_REGISTRANT_UNREGISTERING`

This event is raised when a de-REGISTER is sent by OpenSIPS.

**Parameters:**

- `aor` *(string)* — the AOR
- `contact` *(string)* — the Contact
- `registrar` *(string)* — the Registrar
### `E_REGISTRANT_WRONG_CREDENTIALS`

This event is raised when a REGISTER with credentials was still rejected by the registrar

**Parameters:**

- `aor` *(string)* — the AOR
- `contact` *(string)* — the Contact
- `registrar` *(string)* — the Registrar

## Configuration Examples

### Set `hash_size` parameter

Set `hash_size` parameter

```opensips
...
modparam("uac_registrant", "hash_size", 2)
...
```
### Set `timer_interval` parameter

Set `timer_interval` parameter

```opensips
...
modparam("uac_registrant", "timer_interval", 120)
...
```
### Set `failure_retry_interval` parameter

Set `failure_retry_interval` parameter

```opensips
...
modparam("uac_registrant", "failure_retry_interval", 3600)
...
```
### Set `enable_clustering` parameter

Set `enable_clustering` parameter

```opensips
...
modparam("uac_registrant", "enable_clustering", 1)
...
```
### Set “db_url” parameter

Set “db_url” parameter

```opensips
...
modparam("uac_registrant", "db_url", "mysql://user:passw@localhost/database")
...
```
### Set “table_name” parameter

Set “table_name” parameter

```opensips
...
modparam("uac_registrant", "table_name", "my_registrant")
...
```
### Set “registrar_column” parameter

Set “registrar_column” parameter

```opensips
...
modparam("uac_registrant", "registrar_column", "registrant_uri")
...
```
### Set “proxy_column” parameter

Set “proxy_column” parameter

```opensips
...
modparam("uac_registrant", "proxy_column", "proxy_uri")
...
```
### Set “aor_column” parameter

Set “aor_column” parameter

```opensips
...
modparam("uac_registrant", "aor_column", "to_uri")
...
```
### Set “third_party_registrant_column” parameter

Set “third_party_registrant_column” parameter

```opensips
...
modparam("uac_registrant", "third_party_registrant_column", "from_uri")
...
```
### Set “username_column” parameter

Set “username_column” parameter

```opensips
...
modparam("uac_registrant", "username_column", "auth_username")
...
```
### Set “password_column” parameter

Set “password_column” parameter

```opensips
...
modparam("uac_registrant", "password_column", "auth_passowrd")
...
```
### Set “binding_URI_column” parameter

Set “binding_URI_column” parameter

```opensips
...
modparam("uac_registrant", "binding_URI_column", "contact_uri")
...
```
### Set “binding_params_column” parameter

Set “binding_params_column” parameter

```opensips
...
modparam("uac_registrant", "binding_params_column", "contact_params")
...
```
### Set “expiry_column” parameter

Set “expiry_column” parameter

```opensips
...
modparam("uac_registrant", "expiry_column", "registration_timeout")
...
```
### Set “forced_socket_column” parameter

Set “forced_socket_column” parameter

```opensips
...
modparam("uac_registrant", "forced_socket_column", "fs")
...
```
### Set “cluster_shtag_column” parameter

Set “cluster_shtag_column” parameter

```opensips
...
modparam("uac_registrant", "cluster_shtag_column", "sh")
...
```
### Set “state_column” parameter

Set “state_column” parameter

```opensips
...
modparam("uac_registrant", "state_column", "status")
...
```
### Set “reregister_expiry_percentage” parameter

Set “reregister_expiry_percentage” parameter

```opensips
...
modparam("uac_registrant", "reregister_expiry_percentage", 90)
...
```
