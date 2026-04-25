# b2b_entities Module Reference
<!-- generated-from: data/3.5/modules/b2b_entities.json
     generator-version: 0.1.0
     opensips-version: 3.5
     doc-type: module -->

Reference for the OpenSIPs 3.5 b2b_entities module. Read this file when configuring or debugging the b2b_entities module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Exported MI Functions](#exported-mi-functions)
- [Exported Events](#exported-events)
- [Configuration Examples](#configuration-examples)

## Overview

The B2BUA implementation in OpenSIPS is separated in two layers:

*   a lower one(coded in this module)- which implements the basic functions of a UAS and UAC
*   a upper one - which represents the logic engine of B2BUA, responsible of actually implementing the B2BUA services using the functions offered by the low level.

This module stores records corresponding to the dialogs in which the B2BUA is involved. It exports an API to be called from other modules which offers functions for creating a new dialog record, for sending requests or replies in one dialog and will also notify the upper level module when a request or reply is received inside one stored dialog. The records are separated in two types: b2b server entities and b2b client entities depending on the mode they are created. An entity created for a received initial message will be a server entity, while a entity that will send an initial request(create a new dialog) will be a b2b client entity. The name corresponds to the behavior in the first transaction - if UAS - server entity and if UAC - client entity. This module does not implement a B2BUA alone, but needs a B2B logic implementing module.

The module is able to respond to authentication challanges if the uac_auth module is loaded first. The list of credentials for b2b authentication is also provided by the uac_auth module.

## Dependencies

### OpenSIPs Modules

- `a db module`
- `tm`
- `uac_auth` — mandatory if authentication is required (optional)

### External Libraries

None.

## Exported Parameters

### `advertised_contact` (str)

Contact to use in generated messages for UA session started with the [ua_session_client_start](#mi_ua_session_client_start "1.5.2. ua_session_client_start") MI function.

**Example.** opensips@10.10.10.10:5060.

```opensips
...
modparam("b2b_entities", "advertised_contact", "opensips@10.10.10.10:5060")
...
```
### `b2b_key_prefix` (string)

The string to use when generating the key ( it is inserted in the SIP messages as callid or to tag. It is useful to set this prefix if you use more instances of opensips B2BUA cascaded in the same architecture. Sometimes opensips B2BUA looks at the callid or totag to see if it has the format it uses to determine if the request was sent by it.

*Default value is B2B.*

**Example.** B2B1.

```opensips
modparam("b2b_entities", "b2b_key_prefix", "B2B1")
```
### `cachedb_key_prefix` (string)

Prefix to use for every key set in the NoSQL database.

*Default value is b2be$.*

**Example.** b2b.

```opensips
modparam("b2b_entities", "cachedb_key_prefix", "b2b")
```
### `cachedb_url` (string)

URL of a NoSQL database to be used. Only Redis is supported at the moment.

**Example.** redis://localhost:6379/.

```opensips
modparam("b2b_entities", "cachedb_url", "redis://localhost:6379/")
```
### `client_hsize` (integer)

The size of the hash table that stores the b2b client entities. It is the 2 logarithmic value of the real size.

*Default value is 9.*

**Example.** 10.

```opensips
... modparam("b2b_entities", "client_hsize", 10) ...
```
### `cluster_id` (int)

The ID of the cluster this instance belongs to. Setting this parameter enables clustering support for the OpenSIPS B2BUA by replicating the B2B entities (B2B dialogs) between instances. This also ensures restart persistency through the _clusterer_ module's data "sync" mechanism. This OpenSIPS cluster exposes the **"b2be-entities-repl"** capability in order to mark nodes as eligible for becoming data donors during an arbitrary sync request. Consequently, the cluster must have _at least one node_ marked with the **"seed"** value as the _clusterer.flags_ column/property in order to be fully functional. Consult the [clusterer - Capabilities](clusterer#capabilities) chapter for more details.

*Default value is 0.*

**Example.** 10.

```opensips
...
modparam("b2b_entities", "cluster_id", 10)
...
```
### `db_mode` (integer)

The B2B modules have support for the 3 type of database storage

*Default value is 2.*

**Possible values:**

- 0 - NO DB STORAGE
- 1 - WRITE THROUGH (synchronous write in database)
- 2 - WRITE BACK (update in db from time to time)

**Example.** 1.

```opensips
modparam("b2b_entities", "db_mode", 1)
```
### `db_table` (str)

The name of the table that will be used for storing B2B entities

*Default value is b2b_entities.*

**Example.** some table name.

```opensips
...
modparam("b2b_entities", "db_table", "some table name")
...
```
### `db_url` (string)

Database URL. It is not compulsory, if not set data is not stored in database.

**Example.** mysql://opensips:opensipsrw@127.0.0.1/opensips.

```opensips
... modparam("b2b_entities", "db_url", "mysql://opensips:opensipsrw@127.0.0.1/opensips") ...
```
### `passthru_prack` (int)

This parameter allows to control, whether a PRACK should be generated locally (=0) or if we request it to be end-to-end (=1).

*Default value is 0.*

**Possible values:**

- 0
- 1

**Example.** 1.

```opensips
...
modparam("b2b_entities", "passthru_prack", 1)
...
```
### `script_reply_route` (string)

The name of the b2b script route that will be called when B2B replies are received.

**Example.** b2b_reply.

```opensips
... modparam("b2b_entities", "script_reply_route", "b2b_reply") ...
```
### `script_req_route` (string)

The name of the b2b script route that will be called when B2B requests are received.

**Example.** b2b_request.

```opensips
... modparam("b2b_entities", "script_req_route", "b2b_request") ...
```
### `server_hsize` (integer)

The size of the hash table that stores the b2b server entities. It is the 2 logarithmic value of the real size.

*Default value is 9.*

**Example.** 10.

```opensips
... modparam("b2b_entities", "server_hsize", 10) ...
```
### `ua_default_timeout` (str)

Default timeout, in seconds, for UA session started with the [ua_session_server_init()](#func_ua_session_server_init "1.4.1. ua_session_server_init([key], [flags])") function or the [ua_session_client_start](#mi_ua_session_client_start "1.5.2. ua_session_client_start") MI function. After this interval a BYE will be sent and the session will be deleted.

*Default value is 43200.*

**Example.** 7200.

```opensips
...
modparam("b2b_entities", "ua_default_timeout", 7200)
...
```
### `update_period` (integer)

The time interval at which to update the info in database.

*Default value is 100.*

**Example.** 60.

```opensips
modparam("b2b_entities", "update_period", 60)
```

## Exported Functions

### `ua_session_reply(key, method, code, [reason], [body], [extra_headers], [content_type])`

Sends a reply for a UA session started with the ua_session_server_init() function or the ua_session_client_start MI function.

**Parameters:**

- `body` *(string, optional)* — body to include in the SIP message.
- `code` *(int, required)* — reply code.
- `content_type` *(string, optional)* — Content-Type header. If the parameter is missing and a body is provided, "Content-Type: application/sdp" will be used.
- `extra_headers` *(string, optional)* — extra headers to include in the SIP message.
- `key` *(string, required)* — b2b entity key of the UA session.
- `method` *(string, required)* — name of the SIP method that is replied to.
- `reason` *(string, optional)* — reply reason string.

**Usable from:** REQUEST_ROUTE, EVENT_ROUTE

**Related:**

- `ua_session_client_start`
- `ua_session_server_init`

**Example.** ua_session_reply usage.

```opensips
ua_session_reply($var(b2b_key), "INVITE", 180, "Ringing");
```

### `ua_session_server_init([key], [flags])`

This function initializes a new UA session by processing an initial INVITE. Further requests/replies received belonging to this session will only be handled via the E_UA_SESSION event.

**Parameters:**

- `flags` *(string, optional)* — configures options for this UA session via the following flags:
  - `t[nn]`
  - `a`
  - `r`
  - `d`
  - `h`
  - `b`
  - `n`
- `key` *(var, optional)* — Variable to return the b2b entity key of the new UA session.

**Usable from:** REQUEST_ROUTE

**Related:**

- `ua_session_client_start`
- `ua_session_reply`

**Example.** ua_session_server_init usage.

```opensips
if(is_method("INVITE") && !has_totag()) {
   ua_session_server_init($var(b2b_key), "arhb");

   ua_session_reply($var(b2b_key), "INVITE", 200, "OK", $var(my_sdp));
   
   exit;
}
```

### `ua_session_terminate(key, [extra_headers])`

Terminate a UA session started with the ua_session_server_init() function or the ua_session_client_start MI function.

**Parameters:**

- `extra_headers` *(string, optional)* — extra headers to include in the SIP message
- `key` *(string, required)* — b2b entity key of the UA session.

**Usable from:** REQUEST_ROUTE, EVENT_ROUTE

**Related:**

- `ua_session_client_start`
- `ua_session_server_init`

**Example.** ua_session_terminate usage.

```opensips
ua_session_terminate($var(b2b_key));
```

### `ua_session_update(key, method, [body], [extra_headers], [content_type])`

Sends a sequential request for a UA session started with the ua_session_server_init() function or the ua_session_client_start MI function.

**Parameters:**

- `body` *(string, optional)* — body to include in the SIP message.
- `content_type` *(string, optional)* — Content-Type header. If the parameter is missing and a body is provided, "Content-Type: application/sdp" will be used.
- `extra_headers` *(string, optional)* — extra headers to include in the SIP message.
- `key` *(string, required)* — b2b entity key of the UA session.
- `method` *(string, required)* — name of the SIP method for this request.

**Usable from:** REQUEST_ROUTE, EVENT_ROUTE

**Related:**

- `ua_session_client_start`
- `ua_session_server_init`

**Example.** ua_session_update usage.

```opensips
ua_session_update($var(b2b_key), "OPTIONS");
```

## Exported MI Functions

### `b2be_list`

This command can be used to list the internals of the b2b entities.

**Example.**

```opensips-cli
opensips-cli -x mi b2be_list
```

### `ua_session_client_start`

This command starts a new UAC session by sending an initial INVITE. Further requests/replies received belonging to this session will only be handled via the [E_UA_SESSION](#event_E_UA_SESSION "1.6.1. E_UA_SESSION") event.

**Parameters:**

- `body` *(string, optional)* — message body
- `content_type` *(string, optional)* — Content Type header to use. If missing and a body is provided, "Content-Type: application/sdp" will be used.
- `extra_headers` *(string, optional)* — extra headers
- `flags` *(string, optional)* — flags with the same meaning as for the flags paramater of ua_session_server_init([key], [flags]).
- `from` *(string, required)* — From URI; can also be specified as: display_name,uri in order to set a Display Name, eg. Alice,sip:alice@opensips.org
- `proxy` *(string, optional)* — URI of the outbound proxy to send the INVITE to
- `ruri` *(string, required)* — Request URI
- `socket` *(string, optional)* — OpenSIPS sending socket
- `to` *(string, required)* — To URI; can also be specified as: display_name,uri in order to set a Display Name, eg. Alice,sip:alice@opensips.org.

**Example.**

```opensips-cli
opensips-cli -x mi ua_session_client_start ruri=sip:bob@opensips.org \
to=sip:bob@opensips.org from=sip:alice@opensips.org flags=arhb
```

### `ua_session_list`

List information about UA sessions started with [ua_session_server_init()](#func_ua_session_server_init "1.4.1. ua_session_server_init([key], [flags])") function or the [ua_session_client_start](#mi_ua_session_client_start "1.5.2. ua_session_client_start") MI function.

**Parameters:**

- `key` *(string, optional)* — b2b entity key of the UA session to list. If missing, all sessions will be listed.

**Example.**

```opensips-cli
opensips-cli -x mi ua_session_list
```

### `ua_session_reply`

Sends a reply for a UA session started with the [ua_session_server_init()](#func_ua_session_server_init "1.4.1. ua_session_server_init([key], [flags])") function or the [ua_session_client_start](#mi_ua_session_client_start "1.5.2. ua_session_client_start") MI function.

**Parameters:**

- `body` *(string, optional)* — body to include in the SIP message
- `code` *(integer, required)* — reply code
- `content_type` *(string, optional)* — Content-Type header. If the parameter is missing and a body is provided, "Content-Type: application/sdp" will be used.
- `extra_headers` *(string, optional)* — extra headers to include in the SIP message
- `key` *(string, required)* — b2b entity key of the UA session.
- `method` *(string, required)* — name of the SIP method that is replied to.
- `reason` *(string, required)* — reply reason string

**Example.**

```opensips-cli
opensips-cli -x mi ua_session_reply key=B2B.436.1925389.1649338095 method=OPTIONS code=200 reason=OK
```

### `ua_session_terminate`

Terminate a UA session started with the [ua_session_server_init()](#func_ua_session_server_init "1.4.1. ua_session_server_init([key], [flags])") function or the [ua_session_client_start](#mi_ua_session_client_start "1.5.2. ua_session_client_start") MI function.

**Parameters:**

- `extra_headers` *(string, optional)* — extra headers to include in the SIP message
- `key` *(string, required)* — b2b entity key of the UA session.

**Example.**

```opensips-cli
opensips-cli -x mi ua_session_terminate key=B2B.436.1925389.1649338095
```

### `ua_session_update`

Sends a sequential request for a UA session started with the [ua_session_server_init()](#func_ua_session_server_init "1.4.1. ua_session_server_init([key], [flags])") function or the [ua_session_client_start](#mi_ua_session_client_start "1.5.2. ua_session_client_start") MI function.

**Parameters:**

- `body` *(string, optional)* — body to include in the SIP message.
- `content_type` *(string, optional)* — Content-Type header. If the parameter is missing and a body is provided, "Content-Type: application/sdp" will be used.
- `extra_headers` *(string, optional)* — extra headers to include in the SIP message.
- `key` *(string, required)* — b2b entity key of the UA session.
- `method` *(string, required)* — name of the SIP method for this request.

**Example.**

```opensips-cli
opensips-cli -x mi ua_session_update key=B2B.436.1925389.1649338095 method=OPTIONS
```

## Exported Events

### `E_UA_SESSION`

This event is triggered for requests/replies belonging to an ongoing UA session started with the ua_session_server_init() function or the ua_session_client_start MI function.

Note that replies will not be reported at all unless the _r_ flag was set when initiating the UA session. Also ACK requests are only reported if the _a_ flag was set.

**Parameters:**

- `key` *(string)* — b2b entity key of the UA session.
- `entity_type` *(string)* — indicates whether this is a _UAS_ or _UAc_ entity.
- `event_type` *(string)* — the type of event: NEW - for initial INVITE requests, handled with the ua_session_server_init() function. EARLY - for 1xx provisional responses. ANSWERED - for 2xx successful responses. REJECTED - for 3xx-6xx failure responses. UPDATED - for any sequential requests, including ACK but excluding BYE/CANCEL. TERMINATED - for BYE or CANCEL requests.
- `status` *(integer)* — the reply status code if the message is a SIP reply
- `reason` *(string)* — the reply reason if the message is a SIP reply
- `method` *(string)* — the SIP method name
- `body` *(string)* — SIP message body
- `headers` *(string)* — full list of all SIP headers in the message.

## Configuration Examples

### Set server_hsize parameter

The size of the hash table that stores the b2b server entities. It is the 2 logarithmic value of the real size.

```opensips
...
modparam("b2b_entities", "server_hsize", 10)
...
```
### Set client_hsize parameter

The size of the hash table that stores the b2b client entities. It is the 2 logarithmic value of the real size.

```opensips
...
modparam("b2b_entities", "client_hsize", 10)
...
```
### Set script_req_route parameter

The name of the b2b script route that will be called when B2B requests are received.

```opensips
...
modparam("b2b_entities", "script_req_route", "b2b_request")
...
```
### Set script_repl_route parameter

The name of the b2b script route that will be called when B2B replies are received.

```opensips
...
modparam("b2b_entities", "script_reply_route", "b2b_reply")
...
```
### Set db_url parameter

Database URL. It is not compulsory, if not set data is not stored in database.

```opensips
...
modparam("b2b_entities", "db_url", "mysql://opensips:opensipsrw@127.0.0.1/opensips")
...
```
### Set cachedb_url parameter

URL of a NoSQL database to be used. Only Redis is supported at the moment.

```opensips
...
modparam("b2b_entities", "cachedb_url", "redis://localhost:6379/")
...
```
### Set cachedb_key_prefix parameter

Prefix to use for every key set in the NoSQL database.

```opensips
...
modparam("b2b_entities", "cachedb_key_prefix", "b2b")
...
```
### Set update_period parameter

The time interval at which to update the info in database.

```opensips
...
modparam("b2b_entities", "update_period", 60)
...
```
### Set b2b_key_prefix parameter

The string to use when generating the key ( it is inserted in the SIP messages as callid or to tag. It is useful to set this prefix if you use more instances of opensips B2BUA cascaded in the same architecture. Sometimes opensips B2BUA looks at the callid or totag to see if it has the format it uses to determine if the request was sent by it.

```opensips
...
modparam("b2b_entities", "b2b_key_prefix", "B2B1")
...
```
### Set db_mode parameter

The B2B modules have support for the 3 type of database storage

*   NO DB STORAGE - set this parameter to 0
*   WRITE THROUGH (synchronous write in database) - set this parameter to 1
*   WRITE BACK (update in db from time to time) - set this parameter to 2

```opensips
...
modparam("b2b_entities", "db_mode", 1)
...
```
### Set db_table parameter

The name of the table that will be used for storing B2B entities

```opensips
...
modparam("b2b_entities", "db_table", "some table name")
...
```
### Set cluster_id parameter

The ID of the cluster this instance belongs to. Setting this parameter enables clustering support for the OpenSIPS B2BUA by replicating the B2B entities (B2B dialogs) between instances. This also ensures restart persistency through the clusterer module's data "sync" mechanism.

```opensips
...
modparam("b2b_entities", "cluster_id", 10)
...
```
### Set passthru_prack parameter

This parameter allows to control, whether a PRACK should be generated locally (=0) or if we request it to be end-to-end (=1).

```opensips
...
modparam("b2b_entities", "passthru_prack", 1)
...
```
### Set advertised_contact parameter

Contact to use in generated messages for UA session started with the ua_session_client_start MI function.

```opensips
...
modparam("b2b_entities", "advertised_contact", "opensips@10.10.10.10:5060")
...
```
### Set ua_default_timeout parameter

Default timeout, in seconds, for UA session started with the ua_session_server_init() function or the ua_session_client_start MI function. After this interval a BYE will be sent and the session will be deleted.

```opensips
...
modparam("b2b_entities", "ua_default_timeout", 7200)
...
```
### ua_session_server_init usage

This function initializes a new UA session by processing an initial INVITE. Further requests/replies received belonging to this session will only be handled via the E_UA_SESSION event.

```opensips
...
if(is_method("INVITE") && !has_totag()) {
   ua_session_server_init($var(b2b_key), "arhb");

   ua_session_reply($var(b2b_key), "INVITE", 200, "OK", $var(my_sdp));
   
   exit;
}
...
```
### ua_session_update usage

Sends a sequential request for a UA session started with the ua_session_server_init() function or the ua_session_client_start MI function.

```opensips
...
ua_session_update($var(b2b_key), "OPTIONS");
...
```
### ua_session_reply usage

Sends a reply for a UA session started with the ua_session_server_init() function or the ua_session_client_start MI function.

```opensips
...
ua_session_reply($var(b2b_key), "INVITE", 180, "Ringing");
...
```
### ua_session_terminate usage

Terminate a UA session started with the ua_session_server_init() function or the ua_session_client_start MI function.

```opensips
...
ua_session_terminate($var(b2b_key));
...
```
### b2b_api_t structure

This function binds the b2b_entities modules and fills the structure the exported functions that will be described in detail.

```opensips
...
typedef struct b2b_api {
	b2b_server_new_t          server_new;
	b2b_client_new_t          client_new;

	b2b_send_request_t        send_request;
	b2b_send_reply_t          send_reply;

	b2b_entity_delete_t       entity_delete;

	b2b_restore_linfo_t       restore_logic_info;
	b2b_update_b2bl_param_t   update_b2bl_param;
}b2b_api_t;
...
```
