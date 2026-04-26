# cgrates Module Reference
<!-- generated-from: data/4.0/modules/cgrates.json
     generator-version: 0.1.0
     opensips-version: 4.0
     doc-type: module -->

Reference for the OpenSIPs 4.0 cgrates module. Read this file when configuring or debugging the cgrates module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Exported Pseudo-Variables](#exported-pseudo-variables)
- [Configuration Examples](#configuration-examples)

## Overview

_CGRateS_ is an open-source rating engine used for carrier-grade, multi-tenant, real-time billing. It is able to do both postpaid and prepaid rating for multiple concurrent sessions with different balance units (eg: Monetary, SMS, Internet Traffic). CGRateS can also export accurate CDRs in various formats.

This module can be used to communicate with the CGRateS engine in order to do call authorization and accounting for billing purposes. The OpenSIPS module does not do any billing by itself, but provides an interface to communicate with the CGRateS engine using efficient JSON-RPC APIs in both synchronous and asynchronous ways. For each command the user can provide a set of parameters that will be forwarded to the CGRateS engine, using the _$cgr()_ variable. You can find usage examples in the following sections.

The module also has support for multiple parallel billing sessions to CGRateS. This can be useful in scenarios that involve complex billing logic, such as double billing (both customer and carrier billing), or multi-leg calls (serial/parallel forking). Each billing session is independent and has a specific _tag_ that can be use throughout the call lifetime.

The module can be used to implement the following features:

## How It Works

The authorization is used to check if an account is allowed to start a new call and it has enough credit to call to that destination. This is done using the _cgrates_auth()_ command, which returns the number of seconds a call is allowed to run in the _$cgr_ret_ pseudo-variable.

Usage example:

		...
		if (cgrates_auth("$fU", "$rU"))
			xlog("Call is allowed to run $cgr_ret seconds\\n");
		}
		...

The accounting mode is used to start and stop a CGRateS session. This can be used for both prepaid and postpaid billing. The _cgrates_acc()_ function starts the CGRateS session when the call is answered (the 200 OK message is received) and ends it when the call is ended (a BYE message is received). This is done automatically using the _dialog_ module.

Note that it is important to first authorize the call (using the _cgrates_auth()_ command) before starting accounting. If you do not do this and the user is not authorized to call, the dialog will be immediately closed, resulting in a 0-duration call. If the call is allowed to go on, the dialog lifetime will be set to the duration indicated by the CGRateS engine. Therefore, the dialog will be automatically ended if the call would have been longer.

After the call is ended (by a BYE message), the CGRateS session is also ended. At this point, you can generate a CDR. To do this, you have to set the _cdr_ flag to the _cgrates_acc()_ command. CDRs can also be generated for missed calls by using the _missed_ flag.

Usage example:

		...
		if (!cgrates_auth("$fU", "$rU")) {
			sl_send_reply(403, "Forbidden");
			exit;
		}
		xlog("Call is allowed to run $cgr_ret seconds\\n");
		# do accounting for this call
		cgrates_acc("cdr", "$fU", "$rU");
		...

Note that when using the _cdr_ flag, CDRs are exported by the CGRateS engine in various formats, not by OpenSIPS. Check the CGRateS documentation for more information.

You can use the _cgrates_cmd()_ to send arbitrary commands to the CGRateS engine, and use the _$cgr_ret_ pseudo-variable to retrieve the response.

The following example simulates the _cgrates_auth()_ CGRateS call:

		...
		$cgr_opt(Tenant) = $fd; # or $cgr(Tenant) = $fd; /\* in compat mode \*/
		$cgr(Account) = $fU;
		$cgr(OriginID) = $ci;
		$cgr(SetupTime) = "" + $Ts;
		$cgr(RequestType) = "\*prepaid";
		$cgr(Destination) = $rU;
		cgrates_cmd("SessionSv1.AuthorizeEvent");
		xlog("Call is allowed to run $cgr_ret(MaxUsage) seconds\\n");
		...

Multiple CGRateS engines can be provisioned to use in a failover manner: in case one engine is down, the next one is used. Currently there is no load balancing logic between the servers, but this is a feature one of the CGRateS component does starting with newer versions.

Each CGRateS engine has assigned up to _max_async_connections_ connections, plus one used for synchronous commands. If a connection fails (due to network issues, or server issues), it is marked as closed and a new one is tried. If all connections to that engine are down, then the entire engine is marked as disabled, and a new engine is queried. After an engine is down for more than _retry_timeout_ seconds, OpenSIPS tries to connect once again to that server. If it succeeds, that server is enabled. Otherwise, the other engines are used, until none is available and the command fails.

The module supports two different versions of CGRateS: the _compat_mode_ one, which works with pre-rc8 releases, and a new one which works with the post-rc8 releases. The difference between the two versions consist in the way the requests and responses to and from CGRateS are built. In the non-_compat_mode_/new version, a new variable, _$cgr_opt()_, is available, and can be used to tune the request options. This variable should not be used in _compat_mode_ mode to avoid abiguities, but if it is used, it behaves exactly as _$cgr()_. By default _compat_mode_ is disabled.

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

This parameter is used to specify a CGRateS engine connection. The format is _IP\[:port\]_. The port is optional, and if missing, _2014_ is used. This parameter can have multiple values, for each server used for failover. At least one server should be provisioned.

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

`cgrates_acc()` starts an accounting session on the CGRateS engine for the current dialog. It also ends the session when the dialog is ended. This function requires a dialog, so in case create_dialog() was not previously used, it will internally call that function.

Note that the `cgrates_acc()` function does not send any message to the CGRateS engine when it is called, but only when the call is answered and the CGRateS session should be started (a 200 OK message is received).

When called in _REQUEST_ROUTE_ or _FAILURE_ROUTE_, accounting for this session is done for all the branches created. When called in _BRANCH_ROUTE_ or _ONREPLY_ROUTE_, acccounting is done only if that branch is successful (terminates with a 2xx reply code).

The `cgrates_acc()` function should only be called on initial INVITEs. For more infirmation check [Section 1.3, “Accounting”](#accounting "1.3. Accounting").

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

`cgrates_auth()` does call authorization through using the CGRateS engine.

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

`cgrates_cmd()` can send arbitrary commands to the CGRateS engine.

**Parameters:**

- `command` *(string, required)* — the command sent to the CGRateS engine.
- `session` *(string, optional)* — the tag of the session that will be started if the branch/call completes with success. This parameter indicates what set of data from the _$cgr()_ variable should be considered. If missing, the default set is used.

**Return codes:**

- `1` — successful call - the CGRateS account is allowed to make the call.
- `-1` — OpenSIPS returned an internal error (i.e. server is out of memory).
- `-2` — the CGRateS engine returned error.
- `-3` — No suitable CGRateS server found. message type (not an initial INVITE).

**Usable from:** any route

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

Pseudo-variable used to set different parameters for the CGRateS command. Each name-value pair will be encoded as a string - value attribute in the JSON message sent to CGRateS. The name-values pairs are stored in the transaction (if tm module is loaded). Therefore the values are accessible in the reply. When the cgrates_acc() function is called, all the name-value pairs are moved in the dialog. Therefore the values will be accessible along the dialog's lifetime. This variable consists of serveral sets of name-value pairs. Each set corresponds to a session. The variable can be indexed by a session tag. The sets are completely indepdendent from one another. if the session tag does not exist, the default (no name) one is used. When assigned with the := operator, the value is treated as a JSON, rather than a string/integer. However, the evaluation of the JSON is late, therefore when the CGRateS request is built, if the module is unable to parse the JSON, the value is sent as a string.

- **Type:** string / integer / JSON
- **Read/write:** read-write
- **Scope:** transaction, dialog
### `$cgr_opt(name) / $(cgr_opt(name)[session])`

Used to tune the request parameter of a CGRateS request when used in non-compat_mode. Note: for all request options integer values act as boolean values: 0 disables the feature and 1(or different than 0 value) enables it. String variables are passed just as they are set.

- **Type:** integer / string
- **Read/write:** read-write
- **Scope:** request, transaction

**Possible values:**

- Tenant
- GetAttributes
- GetMaxUsage
- GetSuppliers
### `$cgr_ret(name)`

Returns the reply message of a CGRateS command in script, or when used in the non-compat mode, one of the objects within the reply.

- **Type:** string / integer
- **Read/write:** read-only
- **Scope:** reply

## Configuration Examples

### Set `cgrates_engine` parameter

This parameter is used to specify a CGRateS engine connection. The format is IP[:port]. The port is optional, and if missing, 2014 is used.

```opensips
...
modparam("cgrates", "cgrates_engine", "127.0.0.1")
modparam("cgrates", "cgrates_engine", "127.0.0.1:2013")
...
```
### Set `bind_ip` parameter

IP used to bind the socket that communicates with the CGRateS engines. This is useful to set when the engine is runing in a local, secure LAN, and you want to use that network to communicate with your servers.

```opensips
...
modparam("cgrates", "bind_ip", "10.0.0.100")
...
```
### Set `max_async_connections` parameter

The maximum number of simultaneous asynchronous connections to a CGRateS engine.

```opensips
...
modparam("cgrates", "max_async_connections", 20)
...
```
### Set `retry_timeout` parameter

The number of seconds after which a disabled connection/engine is retried.

```opensips
...
modparam("cgrates", "retry_timeout", 120)
...
```
### Set `compat_mode` parameter

Indicates whether OpenSIPS should use the old (compat_mode) CGRateS version API (pre-rc8).

```opensips
...
modparam("cgrates", "compat_mode", 1)
...
```
### cgrates_acc() usage

cgrates_acc() starts an accounting session on the CGRateS engine for the current dialog. It also ends the session when the dialog is ended.

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
### cgrates_auth() usage

cgrates_auth() does call authorization through using the CGRateS engine.

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
### cgrates_auth() usage with attributes parsing

Demonstrates cgrates_auth() usage with attributes parsing.

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
### cgrates_cmd() usage

cgrates_cmd() can send arbitrary commands to the CGRateS engine.

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
### $cgr(name) simple usage

Pseudo-variable used to set different parameters for the CGRateS command.

```opensips
		...
		if (!has_totag()) {
			...
			$cgr_opt(Tenant) = $fd; # set the From domain as a tenant
			$cgr(RequestType) = "\*prepaid"; # do prepaid accounting
			$cgr(AttributeIDs) := '["+5551234"]'; # treat as array
			if (!cgrates_auth("$fU", "$rU")) {
				sl_send_reply(403, "Forbidden");
				exit;
			}
		}
		...
		
```
### $cgr(name) multiple sessions usage

Demonstrates $cgr(name) usage with multiple sessions.

```opensips
		...
		if (!has_totag()) {
			...
			# first session - authorize the user
			$cgr_opt(Tenant) = $fd; # set the From domain as a tenant
			$cgr(RequestType) = "\*prepaid"; # do prepaid accounting
			if (!cgrates_auth("$fU", "$rU")) {
				sl_send_reply(403, "Forbidden");
				exit;
			}

			# second session - authorize the carrier
			$(cgr_opt(Tenant)\[carrier\]) = $td;
			$(cgr(RequestType)\[carrier\]) = "\*postpaid";
			if (!cgrates_auth("$tU", "$fU", "carrier")) {
				# use a different carrier
				return;
			}

			# if everything is successful start accounting on both
			cgrates_acc("cdr", "$fU", "rU");
			cgrates_acc("cdr", "$tU", "$fU", "carrier");
		}
		...
		
```
### $cgr_opt(name) usage

Used to tune the request parameter of a CGRateS request when used in non-compat_mode.

```opensips
		...
		$cgr_opt(Tenant) = "cgrates.org";
		$cgr_opt(GetMaxUsage) = 1; # also retrieve the max usage
		if (!cgrates_auth("$fU", "$rU")) {
			# call rejected
		}
		...
		
```
### $cgr_ret(name) usage

Returns the reply message of a CGRateS command in script, or when used in the non-compat mode, one of the objects within the reply.

```opensips
		...
		cgrates_auth("$fU", "$rU");

		# in compat mode
		xlog("Call is allowed to run $cgr_ret seconds\\n");

		# in non-compat mode
		xlog("Call is allowed to run $cgr_ret(MaxUsage) seconds\\n");
		...
		
```
### `async cgrates_auth` usage

Does the CGRateS authorization call in an asynchronous way. Script execution is suspended until the CGRateS engine sends the reply back.

```opensips
route {
	...
	async(cgrates_auth("$fU", "$rU"), auth_reply);
}

route \[auth_reply\]
{
	if ($rc < 0) {
		xlog("Call not authorized: code=$cgr_ret!\\n");
		send_reply(403, "Forbidden");
		exit;
	}
	...
}
```
### `async cgrates_cmd compat_mode` usage

Can run an arbitrary CGRateS command in an asynchronous way. The execution is suspended until the CGRateS engine sends the reply back.

```opensips
route {
	...
	$cgr(Tenant) = $fd;
	$cgr(Account) = $fU;
	$cgr(OriginID) = $ci;
	$cgr(SetupTime) = "" + $Ts;
	$cgr(RequestType) = "\*prepaid";
	$cgr(Destination) = $rU;
	async(cgrates_cmd("SMGenericV1.GetMaxUsage"), auth_reply);
}

route \[auth_reply\]
{
	if ($rc < 0) {
		xlog("Call not authorized: code=$cgr_ret!\\n");
		send_reply(403, "Forbidden");
		exit;
	}
	...
}
```
### `async cgrates_cmd new` usage

Can run an arbitrary CGRateS command in an asynchronous way. The execution is suspended until the CGRateS engine sends the reply back.

```opensips
route {
	...
	$cgr_opt(Tenant) = $fd;
	$cgr(Account) = $fU;
	$cgr(OriginID) = $ci;
	$cgr(SetupTime) = "" + $Ts;
	$cgr(RequestType) = "\*prepaid";
	$cgr(Destination) = $rU;
	async(cgrates_cmd("SessionSv1.AuthorizeEventWithDigest"), auth_reply);
}

route \[auth_reply\]
{
	if ($rc < 0) {
		xlog("Call not authorized: MaxUsage=$cgr_ret(MaxUsage)!\\n");
		send_reply(403, "Forbidden");
		exit;
	}
	...
}
```
