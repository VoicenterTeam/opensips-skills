# cgrates Module Reference
<!-- generated-from: data/3.4/modules/cgrates.json
     generator-version: 0.1.0
     opensips-version: 3.4
     doc-type: module -->

Reference for the OpenSIPs 3.4 cgrates module. Read this file when configuring or debugging the cgrates module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Exported Pseudo-Variables](#exported-pseudo-variables)

## Overview

CGRateS is an open-source rating engine used for carrier-grade, multi-tenant, real-time billing. It is able to do both postpaid and prepaid rating for multiple concurrent sessions with different balance units (eg: Monetary, SMS, Internet Traffic). CGRateS can also export accurate CDRs in various formats.

This module can be used to communicate with the CGRateS engine in order to do call authorization and accounting for billing purposes. The OpenSIPS module does not do any billing by itself, but provides an interface to communicate with the CGRateS engine using efficient JSON-RPC APIs in both synchronous and asynchronous ways. For each command the user can provide a set of parameters that will be forwarded to the CGRateS engine, using the $cgr() variable. You can find usage examples in the following sections.

The module also has support for multiple parallel billing sessions to CGRateS. This can be useful in scenarios that involve complex billing logic, such as double billing (both customer and carrier billing), or multi-leg calls (serial/parallel forking). Each billing session is independent and has a specific tag that can be use throughout the call lifetime.

The module can be used to implement the following features:

## Dependencies

### OpenSIPs Modules

- `dialog` — in case CGRateS accounting is used

### External Libraries

- `libjson`

## Exported Parameters

### `bind_ip` (string)

IP used to bind the socket that communicates with the CGRateS engines. This is useful to set when the engine is runing in a local, secure LAN, and you want to use that network to communicate with your servers. The parameter is optional.

*Default value is not set - any IP is used.*

**Example.** 10.0.0.100.

```opensips
modparam("cgrates", "bind_ip", "10.0.0.100")
```
### `cgrates_engine` (string)

This parameter is used to specify a CGRateS engine connection. The format is _IP\[:port\]_. The port is optional, and if missing, _2014_ is used.

This parameter can have multiple values, for each server used for failover. At least one server should be provisioned.

*Default value is None.*

**Example.** 127.0.0.1.

```opensips
modparam("cgrates", "cgrates_engine", "127.0.0.1")
modparam("cgrates", "cgrates_engine", "127.0.0.1:2013")
```
### `compat_mode` (integer)

Indicates whether OpenSIPS should use the old (compat_mode) CGRateS version API (pre-rc8).

*Default value is false (0).*

**Example.** 1.

```opensips
modparam("cgrates", "compat_mode", 1)
```
### `max_async_connections` (integer)

The maximum number of simultaneous asynchronous connections to a CGRateS engine.

*Default value is 10.*

**Example.** 20.

```opensips
modparam("cgrates", "max_async_connections", 20)
```
### `retry_timeout` (integer)

The number of seconds after which a disabled connection/engine is retried.

*Default value is 60.*

**Example.** 120.

```opensips
modparam("cgrates", "retry_timeout", 120)
```

## Exported Functions

### `cgrates_acc([flags[, account[, destination[, session]]]])`

starts an accounting session on the CGRateS engine for the current dialog. It also ends the session when the dialog is ended. This function requires a dialog, so in case create_dialog() was not previously used, it will internally call that function.

Note that the `cgrates_acc()` function does not send any message to the CGRateS engine when it is called, but only when the call is answered and the CGRateS session should be started (a 200 OK message is received).

When called in _REQUEST_ROUTE_ or _FAILURE_ROUTE_, accounting for this session is done for all the branches created. When called in _BRANCH_ROUTE_ or _ONREPLY_ROUTE_, acccounting is done only if that branch is successful (terminates with a 2xx reply code).

The `cgrates_acc()` function should only be called on initial INVITEs.

**Parameters:**

- `account` *(string, optional)* — the account that will be charged in CGrateS. If not specified, the user in the From header is used.
- `destination` *(string, optional)* — the dialled number. If not present the request URI user is used.
- `flags` *(string, optional)* — indicates whether OpenSIPS should generate a CDR at the end of the call. If the parameter is missing, no CDR is generated - the session is only passed through CGRateS. The following values can be used, separated by '|':
  - `cdr`
  - `missed`
- `session` *(string, optional)* — the tag of the session that will be started if the branch/call completes with success. This parameter indicates what set of data from the _$cgr()_ variable should be considered. If missing, the default set is used.

**Return codes:**

- `1` — successful call - the CGRateS accouting was successfully setup for the call.
- `-1` — OpenSIPS returned an internal error (i.e. the dialog cannot be created, or the server is out of memory).
- `-2` — the SIP message is invalid: either it has missing headers, or it is not an initial INVITE.

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE

**Related:**

- `cgrates_auth`

**Example.** cgrates_acc() usage.

```opensips
		...
		if (!has_totag()) {
			...
			if (cgrates_auth($fU, $rU))
				cgrates_acc("cdr|missed", $fU, $rU);
			...
		}
		...
		
```

### `cgrates_auth([account[, destination[, session]]])`

does call authorization through using the CGRateS engine.

**Parameters:**

- `account` *(string, optional)* — the account that will be checked in CGrateS. If not specified, the user in the From header is used.
- `destination` *(string, optional)* — the dialled number. If not present the request URI user is used.
- `session` *(string, optional)* — the tag of the session that will be started if the branch/call completes with success. This parameter indicates what set of data from the _$cgr()_ variable should be considered. If missing, the default set is used.

**Return codes:**

- `1` — successful call - the CGRateS account is allowed to make the call.
- `-1` — OpenSIPS returned an internal error (i.e. server is out of memory).
- `-2` — the CGRateS engine returned error.
- `-3` — No suitable CGRateS server found. message type (not an initial INVITE).
- `-4` — the SIP message is invalid: either it has missing headers, or it is not an initial INVITE.
- `-5` — CGRateS returned an invalid message.

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE

**Example.** cgrates_auth() usage.

```opensips
		...
		if (!has_totag()) {
			...
			if (!cgrates_auth($fU, $rU)) {
				sl_send_reply(403, "Forbidden");
				exit;
			}
			...
		}
		...
		
```

**Example.** cgrates_auth() usage with attributes parsing.

```opensips
		...
		if (!has_totag()) {
			...
			$cgr_opt(GetAttributes) = 1;
			if (!cgrates_auth($fU, $rU)) {
				sl_send_reply(403, "Forbidden");
				exit;
			}
			# move attributes from AttributesDigest variable to plain AVPs
			$var(idx) = 0;
			while ($(cgr_ret(AttributesDigest){s.select,$var(idx),,}) != NULL) {
				$avp($(cgr_ret(AttributesDigest){s.select,$var(idx),,}{s.select,0,:}))
					= $(cgr_ret(AttributesDigest){s.select,$var(idx),,}{s.select,1,:});
				$var(idx) = $var(idx) + 1;
			}
			...
		}
		...
		
```

### `cgrates_cmd(command[, session])`

can send arbitrary commands to the CGRateS engine.

**Parameters:**

- `command` *(string, required)* — the command sent to the CGRateS engine.
- `session` *(string, optional)* — the tag of the session that will be started if the branch/call completes with success. This parameter indicates what set of data from the _$cgr()_ variable should be considered. If missing, the default set is used.

**Return codes:**

- `1` — successful call - the CGRateS account is allowed to make the call.
- `-1` — OpenSIPS returned an internal error (i.e. server is out of memory).
- `-2` — the CGRateS engine returned error.
- `-3` — No suitable CGRateS server found. message type (not an initial INVITE).

**Usable from:** any route

**Related:**

- `cgrates_auth`

**Example.** cgrates_cmd() usage.

```opensips
		...
		# cgrates_auth($fU, $rU); simulation
		$cgr_opt(Tenant) = $fd;
		$cgr(Account) = $fU;
		$cgr(OriginID) = $ci;
		$cgr(SetupTime) = "" + $Ts;
		$cgr(RequestType) = "\*prepaid";
		$cgr(Destination) = $rU;
		cgrates_cmd("SessionSv1.AuthorizeEvent");
		xlog("Call is allowed to run $cgr_ret seconds\\n");
		...
```

## Exported Pseudo-Variables

### `$cgr(name) / $(cgr(name)[session])`

Pseudo-variable used to set different parameters for the CGRateS command. Each name-value pair will be encoded as a _string - value_ attribute in the JSON message sent to CGRateS. The name-values pairs are stored in the transaction (if tm module is loaded). Therefore the values are accessible in the reply. When the _cgrates_acc()_ function is called, all the name-value pairs are moved in the dialog. Therefore the values will be accessible along the dialog's lifetime. This variable consists of serveral sets of name-value pairs. Each set corresponds to a session. The variable can be indexed by a _session tag_. The sets are completely indepdendent from one another. if the _session tag_ does not exist, the default (no name) one is used. When assigned with the _:=_ operator, the value is treated as a JSON, rather than a string/integer. However, the evaluation of the JSON is late, therefore when the CGRateS request is built, if the module is unable to parse the JSON, the value is sent as a string.

- **Type:** string
- **Read/write:** read-write
- **Scope:** transaction, dialog
### `$cgr_opt(name) / $(cgr_opt(name)[session])`

Used to tune the request parameter of a CGRateS request when used in non-_compat_mode_. _Note:_ for all request options integer values act as boolean values: _0_ disables the feature and _1_(or different than 0 value) enables it. String variables are passed just as they are set.

- **Type:** string
- **Read/write:** read-write
- **Scope:** transaction, dialog

**Possible values:**

- Tenant
- GetAttributes
- GetMaxUsage
- GetSuppliers
### `$cgr_ret(name)`

Returns the reply message of a CGRateS command in script, or when used in the non-compat mode, one of the objects within the reply.

- **Type:** string
- **Read/write:** read-only
- **Scope:** request
