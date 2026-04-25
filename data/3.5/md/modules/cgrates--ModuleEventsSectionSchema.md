# CGRateS Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5874864)

2.2. [Most recently active contributors(1) to this module](#idp5966368)

**List of Examples**

1.1. [Set `cgrates_engine` parameter](#idp5579392)

1.2. [Set `bind_ip` parameter](#idp5584608)

1.3. [Set `max_async_connections` parameter](#idp5589536)

1.4. [Set `retry_timeout` parameter](#idp5594528)

1.5. [Set `compat_mode` parameter](#idp5599456)

1.6. [cgrates\_acc() usage](#idp5636624)

1.7. [cgrates\_auth() usage](#idp5653696)

1.8. [cgrates\_auth() usage with attributes parsing](#idp5655248)

1.9. [cgrates\_cmd() usage](#idp5669232)

1.10. [$cgr(name) simple usage](#idp5678272)

1.11. [$cgr(name) multiple sessions usage](#idp5680000)

1.12. [$cgr\_opt(name) usage](#idp5691248)

1.13. [$cgr\_ret(name) usage](#idp5694752)

1.14. [`async cgrates_auth` usage](#idp5711616)

1.15. [`async cgrates_cmd compat_mode` usage](#idp5725232)

1.16. [`async cgrates_cmd new` usage](#idp5727664)

## Chapter�1.�Admin Guide

## 1.1.�Overview

[_CGRateS_](http://www.cgrates.org/) is an open-source rating engine used for carrier-grade, multi-tenant, real-time billing. It is able to do both postpaid and prepaid rating for multiple concurrent sessions with�different balance units (eg: Monetary, SMS, Internet Traffic).�CGRateS�can also export�accurate CDRs in various formats.

This module can be used to communicate with the CGRates engine in order to do call authorization and accounting for billing purposes. The OpenSIPS module does not do any billing by itself, but provides an interface to communicate with the CGRateS engine using efficient [JSON-RPC](http://json-rpc.org/) APIs in both synchronous and asynchronous ways. For each command the user can provide a set of parameters that will be forwarded to the CGRateS engine, using the _$cgr()_ variable. You can find usage examples in the following sections.

The module also has support for multiple parallel billing sessions to CGRateS. This can be useful in scenarios that involve complex billing logic, such as double billing (both customer and carrier billing), or multi-leg calls (serial/parallel forking). Each billing session is independent and has a specific _tag_ that can be use throughout the call lifetime.

The module can be used to implement the following features:

## 1.2.�Authorization

The authorization is used to check if an account is allowed to start a new call and it has enough credit to call to that destination. This is done using the _cgrates\_auth()_ command, which returns the number of seconds a call is allowed to run in the _$cgr\_ret_ pseudo-variable.

Usage example:

		...
		if (cgrates\_auth("$fU", "$rU"))
			xlog("Call is allowed to run $cgr\_ret seconds\\n");
		}
		...
		

## 1.3.�Accounting

The accounting mode is used to start and stop a CGRateS session. This can be used for both prepaid and postpaid billing. The _cgrates\_acc()_ function starts the CGRateS session when the call is answered (the 200 OK message is received) and ends it when the call is ended (a BYE message is received). This is done automatically using the _dialog_ module.

Note that it is important to first authorize the call (using the _cgrates\_auth()_ command) before starting accounting. If you do not do this and the user is not authorized to call, the dialog will be immediately closed, resulting in a 0-duration call. If the call is allowed to go on, the dialog lifetime will be set to the duration indicated by the CGRateS engine. Therefore, the dialog will be automatically ended if the call would have been longer.

After the call is ended (by a BYE message), the CGRateS session is also ended. At this point, you can generate a CDR. To do this, you have to set the _cdr_ flag to the _cgrates\_acc()_ command. CDRs can also be generated for missed calls by using the _missed_ flag.

Usage example:

		...
		if (!cgrates\_auth("$fU", "$rU")) {
			sl\_send\_reply(403, "Forbidden");
			exit;
		}
		xlog("Call is allowed to run $cgr\_ret seconds\\n");
		# do accounting for this call
		cgrates\_acc("cdr", "$fU", "$rU");
		...
		

Note that when using the _cdr_ flag, CDRs are exported by the CGRateS engine in various formats, not by OpenSIPS. Check the CGRateS documentation for more information.

## 1.4.�Other Commands

You can use the _cgrates\_cmd()_ to send arbitrary commands to the CGRateS engine, and use the _$cgr\_ret_ pseudo-variable to retrieve the response.

The following example simulates the _cgrates\_auth()_ CGRateS call:

		...
		$cgr\_opt(Tenant) = $fd; # or $cgr(Tenant) = $fd; /\* in compat mode \*/
		$cgr(Account) = $fU;
		$cgr(OriginID) = $ci;
		$cgr(SetupTime) = "" + $Ts;
		$cgr(RequestType) = "\*prepaid";
		$cgr(Destination) = $rU;
		cgrates\_cmd("SessionSv1.AuthorizeEvent");
		xlog("Call is allowed to run $cgr\_ret(MaxUsage) seconds\\n");
		...
		

## 1.5.�CGRateS Failover

Multiple CGRateS engines can be provisioned to use in a failover manner: in case one engine is down, the next one is used. Currently there is no load balancing logic between the servers, but this is a feature one of the CGRateS component does starting with newer versions.

Each CGRateS engine has assigned up to _max\_async\_connections_ connections, plus one used for synchronous commands. If a connection fails (due to network issues, or server issues), it is marked as closed and a new one is tried. If all connections to that engine are down, then the entire engine is marked as disabled, and a new engine is queried. After an engine is down for more than _retry\_timeout_ seconds, OpenSIPS tries to connect once again to that server. If it succeeds, that server is enabled. Otherwise, the other engines are used, until none is available and the command fails.

## 1.6.�CGRateS Compatibility

The module supports two different versions of CGRateS: the _compat\_mode_ one, which works with pre-rc8 releases, and a new one which works with the post-rc8 releases. The difference between the two versions consist in the way the requests and responses to and from CGRateS are built. In the non-_compat\_mode_/new version, a new variable, _$cgr\_opt()_, is available, and can be used to tune the request options. This variable should not be used in _compat\_mode_ mode to avoid abiguities, but if it is used, it behaves exactly as _$cgr()_. By default _compat\_mode_ is disabled.

## 1.7.�Dependencies

### 1.7.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _dialog_ -- in case CGRateS accounting is used.
    

### 1.7.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _libjson_
    

## 1.8.�Exported Parameters

### 1.8.1.�`cgrates_engine` (string)

This parameter is used to specify a CGRateS engine connection. The format is _IP\[:port\]_. The port is optional, and if missing, _2014_ is used.

This parameter can have multiple values, for each server used for failover. At least one server should be provisioned.

_Default value is “None”._

**Example�1.1.�Set `cgrates_engine` parameter**

...
modparam("cgrates", "cgrates\_engine", "127.0.0.1")
modparam("cgrates", "cgrates\_engine", "127.0.0.1:2013")
...

  

### 1.8.2.�`bind_ip` (string)

IP used to bind the socket that communicates with the CGRateS engines. This is useful to set when the engine is runing in a local, secure LAN, and you want to use that network to communicate with your servers. The parameter is optional.

_Default value is “not set - any IP is used”._

**Example�1.2.�Set `bind_ip` parameter**

...
modparam("cgrates", "bind\_ip", "10.0.0.100")
...

  

### 1.8.3.�`max_async_connections` (integer)

The maximum number of simultaneous asynchronous connections to a CGRateS engine.

_Default value is “10”._

**Example�1.3.�Set `max_async_connections` parameter**

...
modparam("cgrates", "max\_async\_connections", 20)
...

  

### 1.8.4.�`retry_timeout` (integer)

The number of seconds after which a disabled connection/engine is retried.

_Default value is “60”._

**Example�1.4.�Set `retry_timeout` parameter**

...
modparam("cgrates", "retry\_timeout", 120)
...

  

### 1.8.5.�`compat_mode` (integer)

Indicates whether OpenSIPS should use the old (compat\_mode) CGRateS version API (pre-rc8).

_Default value is “false (0)”._

**Example�1.5.�Set `compat_mode` parameter**

...
modparam("cgrates", "compat\_mode", 1)
...

  

## 1.9.�Exported Functions

### 1.9.1.� `cgrates_acc([flags[, account[, destination[, session]]]])`

`cgrates_acc()` starts an accounting session on the CGRateS engine for the current dialog. It also ends the session when the dialog is ended. This function requires a dialog, so in case create\_dialog() was not previously used, it will internally call that function.

Note that the `cgrates_acc()` function does not send any message to the CGRateS engine when it is called, but only when the call is answered and the CGRateS session should be started (a 200 OK message is received).

When called in _REQUEST\_ROUTE_ or _FAILURE\_ROUTE_, accounting for this session is done for all the branches created. When called in _BRANCH\_ROUTE_ or _ONREPLY\_ROUTE_, acccounting is done only if that branch is successful (terminates with a 2xx reply code).

The `cgrates_acc()` function should only be called on initial INVITEs. For more infirmation check [Section�1.3, “Accounting”](#accounting "1.3.�Accounting").

Meaning of the parameters is as follows:

*   _flags_ (string, optional) - indicates whether OpenSIPS should generate a CDR at the end of the call. If the parameter is missing, no CDR is generated - the session is only passed through CGRateS. The following values can be used, separated by '|':
    
    *   _cdr_ - also generate a CDR;
        
    *   _missed_ - generate a CDR even for missed calls; this flag only makes sense if the _cdr_ flag is used;
        
    
*   _account_ (string, optional) - the account that will be charged in CGrateS. If not specified, the user in the From header is used.
    
*   _destination_ (string, optional) - the dialled number. If not present the request URI user is used.
    
*   _session_ (string, optional) - the tag of the session that will be started if the branch/call completes with success. This parameter indicates what set of data from the _$cgr()_ variable should be considered. If missing, the default set is used.
    

The function can return the following values:

*   _1_ - successful call - the CGRateS accouting was successfully setup for the call.
    
*   _\-1_ - OpenSIPS returned an internal error (i.e. the dialog cannot be created, or the server is out of memory).
    
*   _\-2_ - the SIP message is invalid: either it has missing headers, or it is not an initial INVITE.
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE and LOCAL\_ROUTE.

**Example�1.6.�cgrates\_acc() usage**

		...
		if (!has\_totag()) {
			...
			if (cgrates\_auth($fU, $rU))
				cgrates\_acc("cdr|missed", $fU, $rU);
			...
		}
		...
		

  

### 1.9.2.� `cgrates_auth([account[, destination[, session]]])`

`cgrates_auth()` does call authorization through using the CGRateS engine.

Meaning of the parameters is as follows:

*   _account_ (string, optional) - the account that will be checked in CGrateS. If not specified, the user in the From header is used.
    
*   _destination_ (string, optional) - the dialled number. If not present the request URI user is used.
    
*   _session_ (string, optional) - the tag of the session that will be started if the branch/call completes with success. This parameter indicates what set of data from the _$cgr()_ variable should be considered. If missing, the default set is used.
    

The function can return the following values:

*   _1_ - successful call - the CGRateS account is allowed to make the call.
    
*   _\-1_ - OpenSIPS returned an internal error (i.e. server is out of memory).
    
*   _\-2_ - the CGRateS engine returned error.
    
*   _\-3_ - No suitable CGRateS server found. message type (not an initial INVITE).
    
*   _\-4_ - the SIP message is invalid: either it has missing headers, or it is not an initial INVITE.
    
*   _\-5_ - CGRateS returned an invalid message.
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE and LOCAL\_ROUTE.

**Example�1.7.�cgrates\_auth() usage**

		...
		if (!has\_totag()) {
			...
			if (!cgrates\_auth($fU, $rU)) {
				sl\_send\_reply(403, "Forbidden");
				exit;
			}
			...
		}
		...
		

  

**Example�1.8.�cgrates\_auth() usage with attributes parsing**

		...
		if (!has\_totag()) {
			...
			$cgr\_opt(GetAttributes) = 1;
			if (!cgrates\_auth($fU, $rU)) {
				sl\_send\_reply(403, "Forbidden");
				exit;
			}
			# move attributes from AttributesDigest variable to plain AVPs
			$var(idx) = 0;
			while ($(cgr\_ret(AttributesDigest){s.select,$var(idx),,}) != NULL) {
				$avp($(cgr\_ret(AttributesDigest){s.select,$var(idx),,}{s.select,0,:}))
					= $(cgr\_ret(AttributesDigest){s.select,$var(idx),,}{s.select,1,:});
				$var(idx) = $var(idx) + 1;
			}
			...
		}
		...
		

  

### 1.9.3.� `cgrates_cmd(command[, session])`

`cgrates_cmd()` can send arbitrary commands to the CGRateS engine.

Meaning of the parameters is as follows:

*   _command_ (string) - the command sent to the CGRateS engine.
    
*   _session_ (string, optional) - the tag of the session that will be started if the branch/call completes with success. This parameter indicates what set of data from the _$cgr()_ variable should be considered. If missing, the default set is used.
    

The function can return the following values:

*   _1_ - successful call - the CGRateS account is allowed to make the call.
    
*   _\-1_ - OpenSIPS returned an internal error (i.e. server is out of memory).
    
*   _\-2_ - the CGRateS engine returned error.
    
*   _\-3_ - No suitable CGRateS server found. message type (not an initial INVITE).
    

This function can be used from any route.

**Example�1.9.�cgrates\_cmd() usage**

		...
		# cgrates\_auth($fU, $rU); simulation
		$cgr\_opt(Tenant) = $fd;
		$cgr(Account) = $fU;
		$cgr(OriginID) = $ci;
		$cgr(SetupTime) = "" + $Ts;
		$cgr(RequestType) = "\*prepaid";
		$cgr(Destination) = $rU;
		cgrates\_cmd("SessionSv1.AuthorizeEvent");
		xlog("Call is allowed to run $cgr\_ret seconds\\n");
		...
		

  

## 1.10.�Exported Pseudo-Variables

### 1.10.1.�`$cgr(name) / $(cgr(name)[session])`

Pseudo-variable used to set different parameters for the CGRateS command. Each name-value pair will be encoded as a _string - value_ attribute in the JSON message sent to CGRateS.

The name-values pairs are stored in the transaction (if tm module is loaded). Therefore the values are accessible in the reply.

When the _cgrates\_acc()_ function is called, all the name-value pairs are moved in the dialog. Therefore the values will be accessible along the dialog's lifetime.

This variable consists of serveral sets of name-value pairs. Each set corresponds to a session. The variable can be indexed by a _session tag_. The sets are completely indepdendent from one another. if the _session tag_ does not exist, the default (no name) one is used.

When assigned with the _:=_ operator, the value is treated as a JSON, rather than a string/integer. However, the evaluation of the JSON is late, therefore when the CGRateS request is built, if the module is unable to parse the JSON, the value is sent as a string.

**Example�1.10.�$cgr(name) simple usage**

		...
		if (!has\_totag()) {
			...
			$cgr\_opt(Tenant) = $fd; # set the From domain as a tenant
			$cgr(RequestType) = "\*prepaid"; # do prepaid accounting
			$cgr(AttributeIDs) := '\["+5551234"\]'; # treat as array
			if (!cgrates\_auth("$fU", "$rU")) {
				sl\_send\_reply(403, "Forbidden");
				exit;
			}
		}
		...
		

  

**Example�1.11.�$cgr(name) multiple sessions usage**

		...
		if (!has\_totag()) {
			...
			# first session - authorize the user
			$cgr\_opt(Tenant) = $fd; # set the From domain as a tenant
			$cgr(RequestType) = "\*prepaid"; # do prepaid accounting
			if (!cgrates\_auth("$fU", "$rU")) {
				sl\_send\_reply(403, "Forbidden");
				exit;
			}

			# second session - authorize the carrier
			$(cgr\_opt(Tenant)\[carrier\]) = $td;
			$(cgr(RequestType)\[carrier\]) = "\*postpaid";
			if (!cgrates\_auth("$tU", "$fU", "carrier")) {
				# use a different carrier
				return;
			}

			# if everything is successful start accounting on both
			cgrates\_acc("cdr", "$fU", "rU");
			cgrates\_acc("cdr", "$tU", "$fU", "carrier");
		}
		...
		

  

### 1.10.2.�`$cgr_opt(name) / $(cgr_opt(name)[session])`

Used to tune the request parameter of a CGRateS request when used in non-_compat\_mode_.

_Note:_ for all request options integer values act as boolean values: _0_ disables the feature and _1_(or different than 0 value) enables it. String variables are passed just as they are set.

Possible values at the time the documentation was written:

*   _Tenant_ - tune CGRateS Tenant.
    
*   _GetAttributes_ - requests the account attributes from the CGRateS DB.
    
*   _GetMaxUsage_ - request the maximum time the call is allowed to run.
    
*   _GetSuppliers_ - request an array with all the suppliers for that can terminate that call.
    

**Example�1.12.�$cgr\_opt(name) usage**

		...
		$cgr\_opt(Tenant) = "cgrates.org";
		$cgr\_opt(GetMaxUsage) = 1; # also retrieve the max usage
		if (!cgrates\_auth("$fU", "$rU")) {
			# call rejected
		}
		...
		

  

### 1.10.3.�`$cgr_ret(name)`

Returns the reply message of a CGRateS command in script, or when used in the non-compat mode, one of the objects within the reply.

**Example�1.13.�$cgr\_ret(name) usage**

		...
		cgrates\_auth("$fU", "$rU");

		# in compat mode
		xlog("Call is allowed to run $cgr\_ret seconds\\n");

		# in non-compat mode
		xlog("Call is allowed to run $cgr\_ret(MaxUsage) seconds\\n");
		...
		

  

## 1.11.�Exported Asynchronous Functions

### 1.11.1.� `cgrates_auth([account[, destination[, session]]])`

Does the CGRateS authorization call in an asynchronous way. Script execution is suspended until the CGRateS engine sends the reply back.

Meaning of the parameters is as follows:

*   _account_ - the account that will be checked in CGRateS. This parameter is optional, and if not specified, the user in the From header is used.
    
*   _destination_ - the dialled number. Optional parameter, if not present the request URI user is used.
    
*   _session_ - the tag of the session that will be started if the branch/call completes with success. This parameter indicates what set of data from the _$cgr()_ variable should be considered. If missing, the default set is used.
    

The function can return the following values:

*   _1_ - successful call - the CGRateS account is allowed to make the call.
    
*   _\-1_ - OpenSIPS returned an internal error (i.e. server is out of memory).
    
*   _\-2_ - the CGRateS engine returned error.
    
*   _\-3_ - No suitable CGRateS server found. message type (not an initial INVITE).
    
*   _\-4_ - the SIP message is invalid: either it has missing headers, or it is not an initial INVITE.
    
*   _\-5_ - CGRateS returned an invalid message.
    

**Example�1.14.�`async cgrates_auth` usage**

route {
	...
	async(cgrates\_auth("$fU", "$rU"), auth\_reply);
}

route \[auth\_reply\]
{
	if ($rc < 0) {
		xlog("Call not authorized: code=$cgr\_ret!\\n");
		send\_reply(403, "Forbidden");
		exit;
	}
	...
}

  

### 1.11.2.� `cgrates_cmd(command[, session])`

Can run an arbitrary CGRateS command in an asynchronous way. The execution is suspended until the CGRateS engine sends the reply back.

Meaning of the parameters is as follows:

*   _command_ - the command sent to the CGRateS engine. This is a mandatory parameter.
    
*   _session_ - the tag of the session that will be started if the branch/call completes with success. This parameter indicates what set of data from the _$cgr()_ variable should be considered. If missing, the default set is used.
    

The function can return the following values:

*   _1_ - successful call - the CGRateS account is allowed to make the call.
    
*   _\-1_ - OpenSIPS returned an internal error (i.e. server is out of memory).
    
*   _\-2_ - the CGRateS engine returned error.
    
*   _\-3_ - No suitable CGRateS server found. message type (not an initial INVITE).
    

**Example�1.15.�`async cgrates_cmd compat_mode` usage**

route {
	...
	$cgr(Tenant) = $fd;
	$cgr(Account) = $fU;
	$cgr(OriginID) = $ci;
	$cgr(SetupTime) = "" + $Ts;
	$cgr(RequestType) = "\*prepaid";
	$cgr(Destination) = $rU;
	async(cgrates\_cmd("SMGenericV1.GetMaxUsage"), auth\_reply);
}

route \[auth\_reply\]
{
	if ($rc < 0) {
		xlog("Call not authorized: code=$cgr\_ret!\\n");
		send\_reply(403, "Forbidden");
		exit;
	}
	...
}

  

**Example�1.16.�`async cgrates_cmd new` usage**

route {
	...
	$cgr\_opt(Tenant) = $fd;
	$cgr(Account) = $fU;
	$cgr(OriginID) = $ci;
	$cgr(SetupTime) = "" + $Ts;
	$cgr(RequestType) = "\*prepaid";
	$cgr(Destination) = $rU;
	async(cgrates\_cmd("SessionSv1.AuthorizeEventWithDigest"), auth\_reply);
}

route \[auth\_reply\]
{
	if ($rc < 0) {
		xlog("Call not authorized: MaxUsage=$cgr\_ret(MaxUsage)!\\n");
		send\_reply(403, "Forbidden");
		exit;
	}
	...
}

  

## Chapter�2.�Contributors

## 2.1.�By Commit Statistics

**Table�2.1.�Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)**

�

Name

DevScore

Commits

Lines ++

Lines --

1.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

191

98

7282

1864

2.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

16

10

138

190

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

14

11

56

65

4.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

7

5

18

18

5.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

6

4

20

21

6.

wuhanck

3

1

3

3

7.

James Stanley

3

1

1

1

8.

Bradley Jokinen

2

1

6

0

9.

Razvan

2

1

4

0

  

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 2.2.�By Commit Activity

**Table�2.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Dec 2016 - Jun 2025

2.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Nov 2017 - Apr 2024

3.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Jul 2017 - Nov 2023

4.

James Stanley

Mar 2023 - Mar 2023

5.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Mar 2023

6.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Mar 2017 - Mar 2020

7.

Razvan

Dec 2018 - Dec 2018

8.

wuhanck

Apr 2018 - Apr 2018

9.

Bradley Jokinen

Jul 2017 - Jul 2017

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)).

_Documentation Copyrights:_

Copyright � 2017 Răzvan Crainea