# acc Module Reference
<!-- generated-from: data/3.5/modules/acc.json
     generator-version: 0.1.0
     opensips-version: 3.5
     doc-type: module -->

Reference for the OpenSIPs 3.5 acc module. Read this file when configuring or debugging the acc module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Exported Pseudo-Variables](#exported-pseudo-variables)
- [Exported Events](#exported-events)
- [Configuration Examples](#configuration-examples)

## Overview

The ACC module is used to account transaction information to different backends such as syslog, SQL, AAA.

To account a transaction and to choose which set of backends to be used, the script writer only has to mark the transaction for accounting by using the do_accounting() script function. Note that the function is not actually doing the accounting at that very time, it is just setting a marker - the actual accounting will be done later when the transaction or dialog will be completed.

Even so, the module allows the script writer to force accounting on the spot in special cases via some other script functions.

The accounting module will log by default a fixed set of attributes for the transaction - if you customize your accounting by adding more information to be logged, please see the next chapter about extra accounting - Section 1.2, “Extra accounting”.

The fixed minimal accounting information is:

*   Request Method name
    
*   From header TAG parameter
    
*   To header TAG parameter
    
*   Call-Id
    
*   3-digit Status code from final reply
    
*   Reason phrase from final reply
    
*   Timestamp when transaction was completed

If a value is not present in the request, the empty string is accounted instead.

Note that:

*   A single INVITE may produce multiple accounting reports -- that's most likely due to the SIP forking feature.
    
*   Since version 2.2, all flags used for accounting have been replaced with the do_accounting() function. No need to worry anymore whether you have set the flags or not, or be confused by various flag names, now you only have to call the function and it will do all the work for you.
    
*   OpenSIPS now supports session/dialog accounting. It can automatically correlate INVITEs with BYEs for generating proper CDRs, for example for billing purposes.
    
*   If a UA fails in the middle of a conversation, a proxy will never find out about it. In general, a better practice is to account from an end-device (such as PSTN gateway), which best knows about call status (including media status and PSTN status in case of the gateway).

The SQL, Event Interface and AAA backend support are compiled in the module.

A very comprehensive description of how the accounting module works in terms accounting scope, accounting events and accounting backends can be found in this online Advanced Accounting Tutorial.

### 1.1.1.General Example

loadmodule "modules/acc/acc.so"

if ($ru=~"sip:+40") /\* calls to Romania \*/ {
    if (!proxy_authorize("sip_domain.net" /\* realm \*/,
    "subscriber" /\* table name \*/))  {
        proxy_challenge("sip_domain.net" /\* realm \*/, "0" /\* no qop \*/ );
        exit;
    }

    if (is_method("INVITE") && $au!=$fU) {
        xlog("FROM URI != digest username\\n");
        sl_send_reply(403,"Forbidden");
    }

    do_accounting("log"); /\* set for accounting via syslog \*/
    t_relay(); /\* enter stateful mode now \*/
};

## Dependencies

### OpenSIPs Modules

- `aaa module` — Required for AAA support (optional)
- `database module` — If SQL support is used (optional)
- `dialog` — Dialog, if “cdr” option is used (optional)
- `rr` — Record Route, if “detect_direction” module parameter is enabled (optional)
- `tm` — Transaction Manager

### External Libraries

None.

## Exported Parameters

### `aaa_url` (string)

This is the url representing the AAA protocol used and the location of the configuration file of this protocol. If the parameter is set to empty string, the AAA accounting support will be disabled.

*Default value is NULL.*

**Example.** radius:/etc/radiusclient-ng/radiusclient.conf.

```opensips
modparam("acc", "aaa_url", "radius:/etc/radiusclient-ng/radiusclient.conf")
```
### `acc_callid_column` (string)

Column name in accounting table to store the request's Callid value.

*Default value is callid.*

**Example.** callid.

```opensips
modparam("acc", "acc_callid_column", "callid")
```
### `acc_from_tag_column` (string)

Column name in accounting table to store the From header TAG parameter.

*Default value is from_tag.*

**Example.** from_tag.

```opensips
modparam("acc", "acc_from_tag_column", "from_tag")
```
### `acc_method_column` (string)

Column name in accounting table to store the request's method name as string.

*Default value is method.*

**Example.** method.

```opensips
modparam("acc", "acc_method_column", "method")
```
### `acc_sip_code_column` (string)

Column name in accounting table to store the final reply's numeric code value in string format.

*Default value is sip_code.*

**Example.** sip_code.

```opensips
modparam("acc", "acc_sip_code_column", "sip_code")
```
### `acc_sip_reason_column` (string)

Column name in accounting table to store the final reply's reason phrase value.

*Default value is sip_reason.*

**Example.** sip_reason.

```opensips
modparam("acc", "acc_sip_reason_column", "sip_reason")
```
### `acc_time_column` (string)

Column name in accounting table to store the time stamp of the transaction completion in date-time format.

*Default value is time.*

**Example.** time.

```opensips
modparam("acc", "acc_time_column", "time")
```
### `acc_to_tag_column` (string)

Column name in accounting table to store the To header TAG parameter.

*Default value is to_tag.*

**Example.** to_tag.

```opensips
modparam("acc", "acc_to_tag_column", "to_tag")
```
### `db_table_acc` (string)

Table name of accounting successful calls -- database specific.

*Default value is acc.*

**Example.** myacc_table.

```opensips
modparam("acc", "db_table_acc", "myacc_table")
```
### `db_table_missed_calls` (string)

Table name for accounting missed calls -- database specific.

*Default value is missed_calls.*

**Example.** myMC_table.

```opensips
modparam("acc", "db_table_missed_calls", "myMC_table")
```
### `db_url` (string)

SQL address -- database specific. If is set to NULL or empty string, the SQL support is disabled.

*Default value is NULL.*

**Example.** mysql://user:password@localhost/opensips.

```opensips
modparam("acc", "db_url", "mysql://user:password@localhost/opensips")
```
### `detect_direction` (integer)

Controls the direction detection for sequential requests. If enabled (non zero value), for sequential requests with upstream direction (from callee to caller), the FROM and TO will be swapped (the direction will be preserved as in the original request). It affects all values related to TO and FROM headers (body, URI, username, domain, TAG).

*Default value is 0.*

**Example.** 1.

```opensips
modparam("acc", "detect_direction", 1)
```
### `early_media` (integer)

Should be early media (any provisional reply with body) accounted too ?

*Default value is 0.*

**Example.** 1.

```opensips
modparam("acc", "early_media", 1)
```
### `extra_fields` (string)

Defines the tag-log_value set to be used in extra fields accounting. See [Section 1.2, “Extra accounting”](#ACC-extra-id "1.2. Extra accounting") for a detailed description of the Extra accounting. If empty, extra accounting support will be disabled.

*Default value is 0.*

**Example.** log: a->My_a_Field; b.

```opensips
modparam("acc", "extra_fields", "log: a->My_a_Field; b")
```
### `leg_fields` (string)

Defines the tag-log_value set to be used in multi-leg accounting. See [Section 1.3, “Multi Call-Legs accounting”](#multi-call-legs "1.3. Multi Call-Legs accounting") for a detailed description of the Multi Call-Legs accounting. If empty, multi-leg accounting support will be disabled.

*Default value is 0.*

**Example.** log: a->My_a_Field; b.

```opensips
modparam("acc", "leg_fields", "log: a->My_a_Field; b")
```
### `log_facility` (string)

Log facility to which accounting messages are issued to syslog. This allows to easily seperate the accounting specific logging from the other log messages.

*Default value is LOG_DAEMON.*

**Example.** LOG_DAEMON.

```opensips
modparam("acc", "log_facility", "LOG_DAEMON")
```
### `log_level` (integer)

Log level at which accounting messages are issued to syslog.

*Default value is L_NOTICE.*

**Example.** 2.

```opensips
modparam("acc", "log_level", 2)   # Set log_level to 2
```
### `report_cancels` (integer)

By default, CANCEL reporting is disabled -- most accounting applications wants to see INVITE's cancellation status. Turn on if you explicitly want to account CANCEL transactions.

*Default value is 0.*

**Example.** 1.

```opensips
modparam("acc", "report_cancels", 1)
```
### `service_type` (integer)

AAA service type used for accounting.

*Default value is not-set.*

**Example.** 15.

```opensips
modparam("acc", "service_type", 15)
```

## Exported Functions

### `acc_aaa_request(comment)`

Like acc_log_request, acc_aaa_request reports on a request. It reports to aaa server as configured in “aaa_url”.

**Parameters:**

- `comment` *(string, required)* — Comment describing how the request completed - this string has to contain a reply code followed by a reply reason phrase (ex: "404 Nobody home"). Variables are accepted in this string.

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE

**Related:**

- `acc_log_request`

**Example.** Example 1.24. acc_aaa_request usage.

```opensips
...
acc_aaa_request("403 Destination not allowed");
...

```

### `acc_db_request(comment, table)`

Like acc_log_request, acc_db_request reports on a request. The report is sent to database at “db_url”, in the table referred to in the second action parameter.

**Parameters:**

- `comment` *(string, required)* — Comment describing how the request completed - this string has to contain a reply code followed by a reply reason phrase (ex: "480 Nobody Home"). Variables are accepted in this string.
- `table` *(string, required)* — Database table to be used.

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE

**Related:**

- `acc_log_request`

**Example.** Example 1.23. acc_db_request usage.

```opensips
...
acc_db_request("Some comment", "Some table");
acc_db_request("$T_reply_code $(<reply>rr)", "acc");
...

```

### `acc_evi_request(comment)`

Like acc_log_request, acc_evi_request reports on a request. The report is packed as an event sent through the OpenSIPS Event Interface as _E_ACC_EVENT_ if the reply code is a positive one (lower than 300), or _E_ACC_MISSED_EVENT_ for negative or no codes. More information on this in [Exported Events](#exported_events "1.9.Exported Events").

**Parameters:**

- `comment` *(string, required)* — Comment describing how the request completed - this string has to contain a reply code followed by a reply reason phrase (ex: "404 Nobody home")

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE

**Related:**

- `acc_log_request`

**Example.** Example 1.25. acc_evi_request usage.

```opensips
...
acc_evi_request("403 Destination not allowed");
...

```

### `acc_load_ctx_from_dlg()`

The function loads and exposes the accounting context of the currently in-use dialog. By dialog context, it means, from script level, you will read/write the accounting variables from the other dialog. The current accounting context is stashed until an unload operation is done.

Note that this functions makes sense only when used together with the _load_dialog_ctx()_ function from the dialog module. After loading the context of another dialog, by using the _acc_load_ctx_from_dlg()_ function, you can also access the accounting context of the loaded dialog.

NOTE: you cannot perform a new load until doing an unload - no nested loadings are allowed.

**Usable from:** any type of route

**Related:**

- `acc_unload_ctx_from_dlg`
- `load_dialog_ctx`

**Example.** Example 1.27. acc_load_ctx_from_dlg usage.

```opensips
...
if ( load_dialog_ctx("$var(callid)") ) {
	# we now have the dialog context of the new dialog
	acc_load_ctx_from_dlg();
	# we have now also the accouting context of that dialog
	xlog("The accounting caller of call '$var(callid)' "
		"is '$acc_extra(caller)'\n");
	acc_unload_ctx_from_dlg();
	unload_dialog_ctx();
}

...

```

### `acc_log_request(comment)`

acc_request reports on a request, for example, it can be used to report on missed calls to off-line users who are replied 404 - Not Found. To avoid multiple reports on UDP request retransmission, you would need to embed the action in stateful processing.

**Parameters:**

- `comment` *(string, required)* — Comment describing how the request completed - this string has to contain a reply code followed by a reply reason phrase (ex: "480 Nobody Home"). Variables are accepted in this string.

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE

**Example.** Example 1.22. acc_log_request usage.

```opensips
...
acc_log_request("403 Destination not allowed");
...

```

### `acc_new_leg()`

Creates a new leg and increments [$acc_current_leg](#pv_acc_current_leg "1.7.3.$acc_current_leg (read-only)") only if multi-leg accounting is used. All values of the new leg will be initialized to null.

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE

**Example.** Example 1.26. acc_new_leg usage.

```opensips
...
	acc_new_leg();
...

```

### `acc_unload_ctx_from_dlg()`

The function off-loads a previosuly loaded accounting context, exposing whatever accounting context was present before doing the load.

NOTE: you MUST perform from script an explicit unload for each load you did!

**Usable from:** any type of route

**Related:**

- `acc_load_ctx_from_dlg`

**Example.** Example 1.27. acc_load_ctx_from_dlg usage.

```opensips
...
if ( load_dialog_ctx("$var(callid)") ) {
	# we now have the dialog context of the new dialog
	acc_load_ctx_from_dlg();
	# we have now also the accouting context of that dialog
	xlog("The accounting caller of call '$var(callid)' "
		"is '$acc_extra(caller)'\n");
	acc_unload_ctx_from_dlg();
	unload_dialog_ctx();
}

...

```

### `do_accounting(type, [flags], [table])`

do_accounting() replaces all the *_flag and, *_missed_flag, cdr_flag, failed transaction_flag and the db_table_avp modparams. Just call do_accounting(), select where and how you want the accounting to take place, and the function will do all the work for you.

When called multiple times, the function behaves _additively_.

**Parameters:**

- `flags` *(string, optional)* — flags for the accounting type you have selected. All the types have to be separated by '|'.
  - `cdr`
  - `missed`
  - `failed`
- `table` *(string, optional)* — table where to do the accounting; it replaces old table_avp parameter;
- `type` *(string, required)* — the type of accounting you want to do. All types have to be separated by '|'.
  - `log`
  - `db`
  - `aaa`
  - `evi`

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE

**Example.** Example 1.20. do_accounting usage.

```opensips
		...
		if (!has_totag()) {
			if (is_method("INVITE")) {
			/* enable cdr and missed calls accounting in the database
			 * and to syslog; db accounting shall be done in "my_acc" table */
				do_accounting("db|log", "cdr|missed", "my_acc");
			}
		}
		...
		if (is_method("BYE")) {
			/* do normal accounting via aaa */
			do_accounting("aaa");
		}
		...

```

### `drop_accounting([type], [flags])`

drop_accounting() resets flags and types of accounting set with do_accounting(). If called with no arguments all accounting will be stopped. If called with only one argument all accounting for that type will be stopped. If called with two arguments normal accounting will still be enabled.

When called multiple times, the function behaves _additively_.

**Parameters:**

- `flags` *(string, optional)* — flags to be reset for the accouting type you have selected. All the types have to be separated by '|'.
  - `cdr`
  - `missed`
  - `failed`
- `type` *(string, optional)* — the type of accounting you want to stop. All the types have to be separated by '|'.
  - `log`
  - `db`
  - `aaa`
  - `evi`

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE

**Related:**

- `do_accounting`

**Example.** Example 1.21. drop_accounting usage.

```opensips
		...
		acc_log_request("403 Destination not allowed");
		if (!has_totag()) {
			if (is_method("INVITE")) {
			/* enable cdr and missed calls accounting in the database
			 * and to syslog; db accounting shall be done in "my_acc" table */
				do_accounting("db|log", "cdr|missed", "my_acc");
			}
		}
		...
		/* later in your script */
		if (...) { /* you don't want accounting anymore */
			/* stop all syslog accounting */
			drop_accounting("log");
			/* or stop missed calls and cdr accounting for syslog;
			 * normal accounting will still be enabled */
			drop_accounting("log", "missed|cdr");
			/* or stop all types of accounting  */
			drop_accounting();
		}
		...

```

## Exported Pseudo-Variables

### `$(acc_leg(tag_name)[leg_index])`

This variable can be addressed with the tag names defined using leg_fields and a valid leg index (<= $acc_current_leg). This variable cannot be used unless do_accounting() is used. The variable also accepts negative indexes, which start from -1 (the lastly added leg).

# the "caller" value of the current leg
$acc_leg(caller)

# the "caller" value of the lastly added leg
$(acc_leg(caller)[-1]) # equivalent to $acc_leg(caller)
                       # equivalent to $(acc_leg(caller)[$acc_current_leg])

# the "caller" value of the next-to-last leg
$(acc_leg(caller)[-2])

- **Type:** string
- **Read/write:** read-write
- **Scope:** transaction
### `$acc_current_leg`

Holds the index of the current leg, starting from 0. Calling acc_new_leg() will increment this index.

- **Type:** integer
- **Read/write:** read-only
- **Scope:** transaction
### `$acc_extra(tag_name)`

This variable can addresed with the tag names defined using extra_fields. If do_accounting() isn't called, this variable is visible during the whole processing of one message, enabling calling acc_XXX_request(). If do_accounting() is called, the variable will be visible from the first call of this function until the actual accounting is being made.

- **Type:** string
- **Read/write:** read-write
- **Scope:** request

## Exported Events

### `E_ACC_CDR`

The event raised when a CDR is generated. Note that this event will only be triggered if the auto CDR accounting is used.

**Parameters:**

- `method` *(string)* — Request method name
- `from_tag` *(string)* — From header tag parameter
- `to_tag` *(string)* — To header tag parameter
- `callid` *(string)* — Message Call-id
- `sip_code` *(integer)* — The status code from the final reply
- `sip_reason` *(string)* — The status reason from the final reply
- `time` *(integer)* — The timestamp when the call was established
- `evi_extra*` *(string)* — Extra parameters added by the evi_extra parameter.
- `evi_extra_bye*` *(string)* — Extra parameters added by the evi_extra_bye parameter
- `multi_leg_info*` *(string)* — Extra parameters added by the multi_leg_info parameter
- `multi_leg_bye_info*` *(string)* — Extra parameters added by the multi_leg_bye_info parameter
- `duration` *(integer)* — The call duration in seconds
- `ms_duration` *(integer)* — The call duration in milliseconds
- `setuptime` *(integer)* — The call setup time in seconds
- `created` *(integer)* — The timestamp when the call was created (the initial Invite was received)
### `E_ACC_EVENT`

This event is triggered when old-style accounting is used. It is generated when the requests (INVITE and BYE) transaction have positive final replies, or by the `acc_evi_request()` function that has a positive reply code in comment.

**Parameters:**

- `method` *(string)* — Request method name
- `from_tag` *(string)* — From header tag parameter
- `to_tag` *(string)* — To header tag parameter
- `callid` *(string)* — Message Call-id
- `sip_code` *(integer)* — The status code from the final reply
- `sip_reason` *(string)* — The status reason from the final reply
- `time` *(integer)* — The timestamp when the transaction was created
- `evi_extra*` *(string)* — Extra parameters added by the evi_extra parameter.
- `multi_leg_info*` *(string)* — Extra parameters added by the multi_leg_info parameter
### `E_ACC_MISSED_EVENT`

This event is triggered when old-style accounting is used. It is generated when the requests (INVITE and BYE) transaction have negative final replies, or by the `acc_evi_request()` function that has a negative reply code in comment.

**Parameters:**

- `method` *(string)* — Request method name
- `from_tag` *(string)* — From header tag parameter
- `to_tag` *(string)* — To header tag parameter
- `callid` *(string)* — Message Call-id
- `sip_code` *(integer)* — The status code from the final reply
- `sip_reason` *(string)* — The status reason from the final reply
- `time` *(integer)* — The timestamp when the transaction was created
- `evi_extra*` *(string)* — Extra parameters added by the evi_extra parameter.
- `multi_leg_info*` *(string)* — Extra parameters added by the multi_leg_info parameter
- `created` *(integer)* — Timestamp when the call was created
- `setuptime` *(integer)* — The call setup time in seconds

## Configuration Examples

### General Example

General example of ACC module usage.

```opensips
loadmodule "modules/acc/acc.so"

if ($ru=~"sip:+40") /* calls to Romania */ {
    if (!proxy_authorize("sip_domain.net" /* realm */,
    "subscriber" /* table name */))  {
        proxy_challenge("sip_domain.net" /* realm */, "0" /* no qop */ );
        exit;
    }

    if (is_method("INVITE") && $au!=$fU) {
        xlog("FROM URI != digest username\n");
        sl_send_reply(403,"Forbidden");
    }

    do_accounting("log"); /* set for accounting via syslog */
    t_relay(); /* enter stateful mode now */
};
```
### early_media example

Should be early media (any provisional reply with body) accounted too ? Default value is 0 (no).

```opensips
modparam("acc", "early_media", 1)
```
### report_cancels example

By default, CANCEL reporting is disabled -- most accounting applications wants to see INVITE's cancellation status. Turn on if you explicitly want to account CANCEL transactions. Default value is 0 (no).

```opensips
modparam("acc", "report_cancels", 1)
```
### detect_direction example

Controls the direction detection for sequential requests. If enabled (non zero value), for sequential requests with upstream direction (from callee to caller), the FROM and TO will be swapped (the direction will be preserved as in the original request). It affects all values related to TO and FROM headers (body, URI, username, domain, TAG). Default value is 0 (disabled).

```opensips
modparam("acc", "detect_direction", 1)
```
### Setting extra_fields example:

Defines the tag-log_value set to be used in extra fields accounting. If empty, extra accounting support will be disabled. Default value is 0 (disabled).

```opensips
# for syslog-based accounting, use any text you want to be printed
# if setting $acc_extra(a) you will see "My_a_Field=<value> in logs
# if setting $acc_extra(b) you will see "b=<value> in logs
modparam("acc", "extra_fields", "log: a->My_a_Field; b")
# for mysql-based accounting, use the names of the columns
# $acc_extra(a) = <value>  results in setting col_a with <value> in db
modparam("acc", "extra_fields", "db: a->col_a; col_b")
# for AAA-based accounting, use the names of the AAA AVPs
modparam("acc", "extra_fields","aaa:a->AAA_SRC;b->AAA_DST")
# evi definition example
modparam("acc", "extra_fields","a->2345;b->2346")
```
### Setting leg_fields example:

Defines the tag-log_value set to be used in multi-leg accounting. If empty, multi-leg accounting support will be disabled. Default value is 0 (disabled).

```opensips
# for syslog-based accounting, use any text you want to be printed
# if setting $(acc_leg(a)[0]) you will see "My_a_Field=<value> in logs
# if setting $(acc_leg(b)[0]) you will see "b=<value> in logs
modparam("acc", "leg_fields", "log: a->My_a_Field; b")
# for mysql-based accounting, use the names of the columns
# $acc_leg(a) = <value>  results in setting col_a with <value> in db
modparam("acc", "leg_fields", "db: a->col_a; col_b")
# for AAA-based accounting, use the names of the AAA AVPs
modparam("acc", "leg_fields","aaa:a->AAA_LEG_SRC;b->AAA_LEG_DST")
# evi definition example
modparam("acc", "leg_fields","a->2345;b->2346")
```
### log_level example

Log level at which accounting messages are issued to syslog. Default value is L_NOTICE.

```opensips
modparam("acc", "log_level", 2)   # Set log_level to 2
```
### log_facility example

Log facility to which accounting messages are issued to syslog. This allows to easily seperate the accounting specific logging from the other log messages. Default value is LOG_DAEMON.

```opensips
modparam("acc", "log_facility", "LOG_DAEMON")
```
### Set aaa_url parameter

This is the url representing the AAA protocol used and the location of the configuration file of this protocol. If the parameter is set to empty string, the AAA accounting support will be disabled. Default value is “NULL”.

```opensips
...
modparam("acc", "aaa_url", "radius:/etc/radiusclient-ng/radiusclient.conf")
...
```
### service_type example

AAA service type used for accounting. Default value is not-set.

```opensips
# Default value of service type for SIP is 15
modparam("acc", "service_type", 15)
```
### db_table_acc example

Table name of accounting successful calls -- database specific. Default value is “acc”

```opensips
modparam("acc", "db_table_acc", "myacc_table")
```
### db_table_missed_calls example

Table name for accounting missed calls -- database specific. Default value is “missed_calls”

```opensips
modparam("acc", "db_table_missed_calls", "myMC_table")
```
### db_url example

SQL address -- database specific. If is set to NULL or empty string, the SQL support is disabled. Default value is “NULL” (SQL disabled).

```opensips
modparam("acc", "db_url", "mysql://user:password@localhost/opensips")
```
### acc_method_column example

Column name in accounting table to store the request's method name as string. Default value is “method”.

```opensips
modparam("acc", "acc_method_column", "method")
```
### acc_from_tag_column example

Column name in accounting table to store the From header TAG parameter. Default value is “from_tag”.

```opensips
modparam("acc", "acc_from_tag_column", "from_tag")
```
### acc_to_tag_column example

Column name in accounting table to store the To header TAG parameter. Default value is “to_tag”.

```opensips
modparam("acc", "acc_to_tag_column", "to_tag")
```
### acc_callid_column example

Column name in accounting table to store the request's Callid value. Default value is “callid”.

```opensips
modparam("acc", "acc_callid_column", "callid")
```
### acc_sip_code_column example

Column name in accounting table to store the final reply's numeric code value in string format. Default value is “sip_code”.

```opensips
modparam("acc", "acc_sip_code_column", "sip_code")
```
### acc_sip_reason_column example

Column name in accounting table to store the final reply's reason phrase value. Default value is “sip_reason”.

```opensips
modparam("acc", "acc_sip_reason_column", "sip_reason")
```
### acc_time_column example

Column name in accounting table to store the time stamp of the transaction completion in date-time format. Default value is “time”.

```opensips
modparam("acc", "acc_time_column", "time")
```
### do_accounting usage

do_accounting() replaces all the *_flag and, *_missed_flag, cdr_flag, failed transaction_flag and the db_table_avp modparams. Just call do_accounting(), select where and how you want the accounting to take place, and the function will do all the work for you. When called multiple times, the function behaves additively.

```opensips
		...
		if (!has_totag()) {
			if (is_method("INVITE")) {
			/* enable cdr and missed calls accounting in the database
			 * and to syslog; db accounting shall be done in "my_acc" table */
				do_accounting("db|log", "cdr|missed", "my_acc");
			}
		}
		...
		if (is_method("BYE")) {
			/* do normal accounting via aaa */
			do_accounting("aaa");
		}
		...
```
### drop_accounting usage

drop_accounting() resets flags and types of accounting set with do_accounting(). If called with no arguments all accounting will be stopped. If called with only one argument all accounting for that type will be stopped. If called with two arguments normal accounting will still be enabled. When called multiple times, the function behaves additively.

```opensips
		...
		acc_log_request("403 Destination not allowed");
		if (!has_totag()) {
			if (is_method("INVITE")) {
			/* enable cdr and missed calls accounting in the database
			 * and to syslog; db accounting shall be done in "my_acc" table */
				do_accounting("db|log", "cdr|missed", "my_acc");
			}
		}
		...
		/* later in your script */
		if (...) { /* you don't want accounting anymore */
			/* stop all syslog accounting */
			drop_accounting("log");
			/* or stop missed calls and cdr accounting for syslog;
			 * normal accounting will still be enabled */
			drop_accounting("log", "missed|cdr");
			/* or stop all types of accounting  */
			drop_accounting();
		}
		...
```
### acc_log_request usage

acc_request reports on a request, for example, it can be used to report on missed calls to off-line users who are replied 404 - Not Found. To avoid multiple reports on UDP request retransmission, you would need to embed the action in stateful processing.

```opensips
...
acc_log_request("403 Destination not allowed");
...
```
### acc_db_request usage

Like acc_log_request, acc_db_request reports on a request. The report is sent to database at “db_url”, in the table referred to in the second action parameter.

```opensips
...
acc_db_request("Some comment", "Some table");
acc_db_request("$T_reply_code $(<reply>rr)", "acc");
...
```
### acc_aaa_request usage

Like acc_log_request, acc_aaa_request reports on a request. It reports to aaa server as configured in “aaa_url”.

```opensips
...
acc_aaa_request("403 Destination not allowed");
...
```
### acc_evi_request usage

Like acc_log_request, acc_evi_request reports on a request. The report is packed as an event sent through the OpenSIPS Event Interface as E_ACC_EVENT if the reply code is a positive one (lower than 300), or E_ACC_MISSED_EVENT for negative or no codes.

```opensips
...
acc_evi_request("403 Destination not allowed");
...
```
### acc_new_leg usage

Creates a new leg and increments $acc_current_leg only if multi-leg accounting is used. All values of the new leg will be initialized to null.

```opensips
...
	acc_new_leg();
...
```
### acc_load_ctx_from_dlg usage

The function loads and exposes the accounting context of the currently in-use dialog. By dialog context, it means, from script level, you will read/write the accounting variables from the other dialog. The current accounting context is stashed until an unload operation is done.

```opensips
...
if ( load_dialog_ctx("$var(callid)") ) {
	# we now have the dialog context of the new dialog
	acc_load_ctx_from_dlg();
	# we have now also the accouting context of that dialog
	xlog("The accounting caller of call '$var(callid)' "
		"is '$acc_extra(caller)'\n");
	acc_unload_ctx_from_dlg();
	unload_dialog_ctx();
}

...
```
