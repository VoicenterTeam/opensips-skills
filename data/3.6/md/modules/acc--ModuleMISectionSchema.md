# Acc Module

---

**List of Tables**

3.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp6111392)

3.2. [Most recently active contributors(1) to this module](#idp6226160)

**List of Examples**

1.1. [early\_media example](#idp5572784)

1.2. [report\_cancels example](#idp5576656)

1.3. [detect\_direction example](#idp5581104)

1.4. [Setting _extra\_fields_ example:](#idp5585824)

1.5. [Setting _leg\_fields_ example:](#idp5591792)

1.6. [log\_level example](#idp5596720)

1.7. [log\_facility example](#idp5600640)

1.8. [Set `aaa_url` parameter](#idp5605568)

1.9. [service\_type example](#idp5609712)

1.10. [db\_table\_acc example](#idp5614192)

1.11. [db\_table\_missed\_calls example](#idp5618320)

1.12. [db\_url example](#idp5622576)

1.13. [acc\_method\_column example](#idp5626800)

1.14. [acc\_from\_tag\_column example](#idp5630944)

1.15. [acc\_to\_tag\_column example](#idp5635088)

1.16. [acc\_callid\_column example](#idp5639232)

1.17. [acc\_sip\_code\_column example](#idp5643392)

1.18. [acc\_sip\_reason\_column example](#idp5647536)

1.19. [acc\_time\_column example](#idp5651792)

1.20. [do\_accounting usage](#idp5684224)

1.21. [drop\_accounting usage](#idp5701488)

1.22. [acc\_log\_request usage](#idp5709216)

1.23. [acc\_db\_request usage](#idp5718256)

1.24. [acc\_aaa\_request usage](#idp5726304)

1.25. [acc\_evi\_request usage](#idp5735392)

1.26. [acc\_new\_leg usage](#idp5740224)

1.27. [acc\_load\_ctx\_from\_dlg usage](#idp5746512)

## Chapter�1.�Admin Guide

## 1.1.�Overview

The ACC module is used to account transaction information to different backends such as syslog, SQL, AAA.

To account a transaction and to choose which set of backends to be used, the script writer only has to mark the transaction for accounting by using the [do\_accounting()](#func_do_accounting "1.8.1.� do_accounting(type, [flags], [table])") script function. Note that the function is not actually doing the accounting at that very time, it is just setting a marker - the actual accounting will be done later when the transaction or dialog will be completed.

Even so, the module allows the script writer to force accounting on the spot in special cases via some other script functions.

The accounting module will log by default a fixed set of attributes for the transaction - if you customize your accounting by adding more information to be logged, please see the next chapter about extra accounting - [Section�1.2, “Extra accounting”](#ACC-extra-id "1.2.�Extra accounting").

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
    
*   Since version 2.2, all flags used for accounting have been replaced with the do\_accounting() function. No need to worry anymore whether you have set the flags or not, or be confused by various flag names, now you only have to call the function and it will do all the work for you.
    
*   OpenSIPS now supports session/dialog accounting. It can automatically correlate INVITEs with BYEs for generating proper CDRs, for example for billing purposes.
    
*   If a UA fails in the middle of a conversation, a proxy will never find out about it. In general, a better practice is to account from an end-device (such as PSTN gateway), which best knows about call status (including media status and PSTN status in case of the gateway).
    

The SQL, Event Interface and AAA backend support are compiled in the module.

A very comprehensive description of how the accounting module works in terms accounting scope, accounting events and accounting backends can be found in this online [Advanced Accounting Tutorial](https://www.opensips.org/Documentation/Tutorials-Advanced-Accounting/).

### 1.1.1.�General Example

loadmodule "modules/acc/acc.so"

if ($ru=~"sip:+40") /\* calls to Romania \*/ {
    if (!proxy\_authorize("sip\_domain.net" /\* realm \*/,
    "subscriber" /\* table name \*/))  {
        proxy\_challenge("sip\_domain.net" /\* realm \*/, "0" /\* no qop \*/ );
        exit;
    }

    if (is\_method("INVITE") && $au!=$fU) {
        xlog("FROM URI != digest username\\n");
        sl\_send\_reply(403,"Forbidden");
    }

    do\_accounting("log"); /\* set for accounting via syslog \*/
    t\_relay(); /\* enter stateful mode now \*/
};

## 1.2.�Extra accounting

### 1.2.1.�Overview

Along the static default information, the ACC module allows dynamic selection of extra information to be logged using the acc\_extra pseudovariable. This allows you to log any pseudo-variable (AVPs, parts of the request, parts of the reply, etc).

### 1.2.2.�Definitions and syntax

Selection of extra information is done via _extra\_field_ parameter by specifying tags and log\_names for the additional information. This information is defined via acc\_extra pseudovariable, referenced with the define tag. If the tag is not specified, its value will be considered to be the same as the log\_value. Accounting backend(log, db, aaa, evi) is specified at the beginning of the definition, separated by ':' from the rest. The syntax of the parameter is:

*   _backend : tag -> log\_name (';'tag -> log\_name)\*_
    
*   _backend : tag (';' tag)\*_
    

Extra values are consistent during the whole call. Setting a value during a request, will cause it to remain visible during all replies. Also, concerning CDR logging, setting a value on the initial INVITE will result in having that value throughout the dialog.

Via _log\_name_ you define how/where the _data_ will be logged. Its meaning depends of the accounting support which is used:

*   _LOG accounting_ - log\_name will be just printed along with the data in _log\_name=data_ format;
    
*   _DB accounting_ - log\_name will be the name of the DB column where the data will be stored._IMPORTANT_: add in db _acc_ table the columns corresponding to each extra data;
    
*   _AAA accounting_ - log\_name will be the AVP name used for packing the data into AAA message. The log\_name will be translated to AVP number via the dictionary. _IMPORTANT_: add in AAA dictionary the _log\_name_ attribute.
    
*   _Events accounting_ - log\_name will be the name of the parameter in the event raised.
    

### 1.2.3.�How it works

Declaring an extra in the format of

modparam("acc", "extra\_fields", "log: a -> test\_a")

will enable you to set the value for _test\_a_ field of the log only by setting _$acc\_extra(a)_ variable. Otherwise, the field shall be logged with no value(null).

### 1.2.4.�Radius accounting dependencies

If radius accounting is used, except from a radius client library which is mandatory, **dictionary.rfc2866** must be included for the module to work properly.

## 1.3.�Multi Call-Legs accounting

### 1.3.1.�Overview

A SIP call can have multiple legs due forwarding actions. For example user A calls user B which forwards the call to user C. There is only one SIP call but with 2 legs ( A to B and B to C). Accounting the legs of a call is required for proper billing of the calls (if C is a PSTN number and the call is billed, user B must pay for the call - as last party modifing the call destination-, and not A - as initiator of the call. Call forwarding on server is only one example which shows the necessity of the having an accounting engine with multiple legs support.

### 1.3.2.�Configuration

First how it works: The idea is to have a variable to store a set of values for each leg. The meaning of the variable content is strictly decided by the script writer - it can be the origin and source of the leg, its status or any other related information. By default there is defined only one leg. Script writer has to decide when is the time to create a new leg, by using _acc\_new\_leg()_ script function. When creating a new leg, all the values for that leg will be set to NULL by default.

When the accounting information for the call will be written/sent, all the call-leg pairs will be added.

By default, the multiple call-leg support is disabled - it can be enabled just by setting _acc\_leg_ variable `leg_fields` module parameter. Note that the last one only makes sense only for CDRs that are generated automatically by OpenSIPS.

### 1.3.3.�Logged data

For each call, all the values from the _acc\_leg_ variable will be logged. How the information will be actually logged, depends of the data backend:

*   _syslog_ -- all leg-sets will be added to one record string as acc\_leg(leg1)=xxx, acc\_leg(leg2)=xxxx ,... sets.
    
*   _database_ -- each pair will be separately logged (due DB data structure constraints); several records will be written, the difference between them being only the fields corresponding to the call-leg info.
    
    ### Note
    
    You will need to add in your DB (all acc related tables) the colums for call-leg info (a column for each leg value of the set).
    
*   _AAA_ -- all sets will be added to the same AAA accounting message as AAA AVPs - for each call-leg a set of AAA AVPs will be added (corresponding to the per-leg set)
    
    ### Note
    
    You will need to add in your dictionary the AAA AVPs used in call-leg set definition.
    
*   _events_ -- each pair will appear as a different parameter-value pair in the event. Similar to the database behavior, multiple events will be raised, and the only difference between them is the leg information.
    

_Important!!!_ In order to use _RADIUS_, one must include the AVPs which are located in $(opensips\_install\_dir)/etc/dictionary.opensips, both in opensips radius config script dictionary and radius server dictionary. Most important are the last three AVPs (IDs : 227, 228, 229) which you won't find in any SIP dictionary (at least at this moment) because they are only used in openSips.

## 1.4.�CDRs accounting

### 1.4.1.�Overview

ACC module can now also maintain session/dialog accounting. This allows you to log useful information like call duration, call start time and setup time.

### 1.4.2.�Configuration

In order to have CDRs accounting, first you need to set the _cdr_ flag when calling [do\_accounting()](#func_do_accounting "1.8.1.� do_accounting(type, [flags], [table])") script function for the initial INVITE of the dialog.

### 1.4.3.�How it works

This type of accounting is based on the dialog module. When an initial INVITE is received, if the _cdr_ flag is set, then the dialog creation time is saved. Once the call is answered and the ACK is received, other information like extra values or leg values are saved. When the corresponding BYE is received, the call duration is computed and all information is stored to the desired backend.

## 1.5.�Dependencies

### 1.5.1.�OpenSIPS Modules

The module depends on the following modules (in the other words the listed modules must be loaded before this module):

*   _tm_ -- Transaction Manager
    
*   _a database module_ -- If SQL support is used.
    
*   _rr_ -- Record Route, if “detect\_direction” module parameter is enabled.
    
*   _an aaa module_
    
*   _dialog_ -- Dialog, if “cdr” option is used
    

### 1.5.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   none.
    

## 1.6.�Exported Parameters

### 1.6.1.�`early_media` (integer)

Should be early media (any provisional reply with body) accounted too ?

Default value is 0 (no).

**Example�1.1.�early\_media example**

modparam("acc", "early\_media", 1)

  

### 1.6.2.�`report_cancels` (integer)

By default, CANCEL reporting is disabled -- most accounting applications wants to see INVITE's cancellation status. Turn on if you explicitly want to account CANCEL transactions.

Default value is 0 (no).

**Example�1.2.�report\_cancels example**

modparam("acc", "report\_cancels", 1)

  

### 1.6.3.�`detect_direction` (integer)

Controls the direction detection for sequential requests. If enabled (non zero value), for sequential requests with upstream direction (from callee to caller), the FROM and TO will be swapped (the direction will be preserved as in the original request).

It affects all values related to TO and FROM headers (body, URI, username, domain, TAG).

Default value is 0 (disabled).

**Example�1.3.�detect\_direction example**

modparam("acc", "detect\_direction", 1)

  

### 1.6.4.�`extra_fields` (string)

Defines the tag-log\_value set to be used in extra fields accounting. See [Section�1.2, “Extra accounting”](#ACC-extra-id "1.2.�Extra accounting") for a detailed description of the Extra accounting.

If empty, extra accounting support will be disabled.

Default value is 0 (disabled).

**Example�1.4.�Setting _extra\_fields_ example:**

\# for syslog-based accounting, use any text you want to be printed
# if setting $acc\_extra(a) you will see "My\_a\_Field=<value> in logs
# if setting $acc\_extra(b) you will see "b=<value> in logs
modparam("acc", "extra\_fields", "log: a->My\_a\_Field; b")
# for mysql-based accounting, use the names of the columns
# $acc\_extra(a) = <value>  results in setting col\_a with <value> in db
modparam("acc", "extra\_fields", "db: a->col\_a; col\_b")
# for AAA-based accounting, use the names of the AAA AVPs
modparam("acc", "extra\_fields","aaa:a->AAA\_SRC;b->AAA\_DST")
# evi definition example
modparam("acc", "extra\_fields","a->2345;b->2346")

  

### 1.6.5.�`leg_fields` (string)

Defines the tag-log\_value set to be used in multi-leg accounting. See [Section�1.3, “Multi Call-Legs accounting”](#multi-call-legs "1.3.�Multi Call-Legs accounting") for a detailed description of the Multi Call-Legs accounting.

If empty, multi-leg accounting support will be disabled.

Default value is 0 (disabled).

**Example�1.5.�Setting _leg\_fields_ example:**

\# for syslog-based accounting, use any text you want to be printed
# if setting $(acc\_leg(a)\[0\]) you will see "My\_a\_Field=<value> in logs
# if setting $(acc\_leg(b)\[0\]) you will see "b=<value> in logs
modparam("acc", "leg\_fields", "log: a->My\_a\_Field; b")
# for mysql-based accounting, use the names of the columns
# $acc\_leg(a) = <value>  results in setting col\_a with <value> in db
modparam("acc", "leg\_fields", "db: a->col\_a; col\_b")
# for AAA-based accounting, use the names of the AAA AVPs
modparam("acc", "leg\_fields","aaa:a->AAA\_LEG\_SRC;b->AAA\_LEG\_DST")
# evi definition example
modparam("acc", "leg\_fields","a->2345;b->2346")

  

### 1.6.6.�`log_level` (integer)

Log level at which accounting messages are issued to syslog.

Default value is L\_NOTICE.

**Example�1.6.�log\_level example**

modparam("acc", "log\_level", 2)   # Set log\_level to 2

  

### 1.6.7.�`log_facility` (string)

Log facility to which accounting messages are issued to syslog. This allows to easily seperate the accounting specific logging from the other log messages.

Default value is LOG\_DAEMON.

**Example�1.7.�log\_facility example**

modparam("acc", "log\_facility", "LOG\_DAEMON")

  

### 1.6.8.�`aaa_url` (string)

This is the url representing the AAA protocol used and the location of the configuration file of this protocol.

If the parameter is set to empty string, the AAA accounting support will be disabled.

Default value is “NULL”.

**Example�1.8.�Set `aaa_url` parameter**

...
modparam("acc", "aaa\_url", "radius:/etc/radiusclient-ng/radiusclient.conf")
...

  

### 1.6.9.�`service_type` (integer)

AAA service type used for accounting.

Default value is not-set.

**Example�1.9.�service\_type example**

\# Default value of service type for SIP is 15
modparam("acc", "service\_type", 15)

  

### 1.6.10.�`db_table_acc` (string)

Table name of accounting successful calls -- database specific.

Default value is “acc”

**Example�1.10.�db\_table\_acc example**

modparam("acc", "db\_table\_acc", "myacc\_table")

  

### 1.6.11.�`db_table_missed_calls` (string)

Table name for accounting missed calls -- database specific.

Default value is “missed\_calls”

**Example�1.11.�db\_table\_missed\_calls example**

modparam("acc", "db\_table\_missed\_calls", "myMC\_table")

  

### 1.6.12.�`db_url` (string)

SQL address -- database specific. If is set to NULL or empty string, the SQL support is disabled.

Default value is “NULL” (SQL disabled).

**Example�1.12.�db\_url example**

modparam("acc", "db\_url", "mysql://user:password@localhost/opensips")

  

### 1.6.13.�`acc_method_column` (string)

Column name in accounting table to store the request's method name as string.

Default value is “method”.

**Example�1.13.�acc\_method\_column example**

modparam("acc", "acc\_method\_column", "method")

  

### 1.6.14.�`acc_from_tag_column` (string)

Column name in accounting table to store the From header TAG parameter.

Default value is “from\_tag”.

**Example�1.14.�acc\_from\_tag\_column example**

modparam("acc", "acc\_from\_tag\_column", "from\_tag")

  

### 1.6.15.�`acc_to_tag_column` (string)

Column name in accounting table to store the To header TAG parameter.

Default value is “to\_tag”.

**Example�1.15.�acc\_to\_tag\_column example**

modparam("acc", "acc\_to\_tag\_column", "to\_tag")

  

### 1.6.16.�`acc_callid_column` (string)

Column name in accounting table to store the request's Callid value.

Default value is “callid”.

**Example�1.16.�acc\_callid\_column example**

modparam("acc", "acc\_callid\_column", "callid")

  

### 1.6.17.�`acc_sip_code_column` (string)

Column name in accounting table to store the final reply's numeric code value in string format.

Default value is “sip\_code”.

**Example�1.17.�acc\_sip\_code\_column example**

modparam("acc", "acc\_sip\_code\_column", "sip\_code")

  

### 1.6.18.�`acc_sip_reason_column` (string)

Column name in accounting table to store the final reply's reason phrase value.

Default value is “sip\_reason”.

**Example�1.18.�acc\_sip\_reason\_column example**

modparam("acc", "acc\_sip\_reason\_column", "sip\_reason")

  

### 1.6.19.�`acc_time_column` (string)

Column name in accounting table to store the time stamp of the transaction completion in date-time format.

Default value is “time”.

**Example�1.19.�acc\_time\_column example**

modparam("acc", "acc\_time\_column", "time")

  

## 1.7.�Exported Pseudo-Variables

### 1.7.1.�$acc\_extra(tag\_name)

This variable can addresed with the tag names defined using [extra\_fields](#param_extra_fields "1.6.4.�extra_fields (string)"). If [do\_accounting()](#func_do_accounting "1.8.1.� do_accounting(type, [flags], [table])") isn't called, this variable is visible during the whole processing of one message, enabling calling _acc\_XXX\_request()_. If [do\_accounting()](#func_do_accounting "1.8.1.� do_accounting(type, [flags], [table])") is called, the variable will be visible from the first call of this function until the actual accounting is being made.

### 1.7.2.�$(acc\_leg(tag\_name)\[leg\_index\])

This variable can be addressed with the tag names defined using [leg\_fields](#param_leg_fields "1.6.5.�leg_fields (string)") and a valid leg index (<= [$acc\_current\_leg](#pv_acc_current_leg "1.7.3.�$acc_current_leg (read-only)")). This variable cannot be used unless [do\_accounting()](#func_do_accounting "1.8.1.� do_accounting(type, [flags], [table])") is used. The variable also accepts negative indexes, which start from -1 (the lastly added leg).

\# the "caller" value of the current leg
$acc\_leg(caller)

# the "caller" value of the lastly added leg
$(acc\_leg(caller)\[-1\]) # equivalent to $acc\_leg(caller)
                       # equivalent to $(acc\_leg(caller)\[$acc\_current\_leg\])

# the "caller" value of the next-to-last leg
$(acc\_leg(caller)\[-2\])

### 1.7.3.�$acc\_current\_leg (read-only)

Holds the index of the current leg, starting from 0. Calling [acc\_new\_leg()](#func_acc_new_leg "1.8.7.� acc_new_leg()") will increment this index.

## 1.8.�Exported Functions

### 1.8.1.� `do_accounting(type, [flags], [table])`

`do_accounting()` replaces all the \*\_flag and, \*\_missed\_flag, cdr\_flag, failed transaction\_flag and the db\_table\_avp modparams. Just call do\_accounting(), select where and how you want the accounting to take place, and the function will do all the work for you.

When called multiple times, the function behaves _additively_.

Meaning of the parameters is as follows:

*   _type (string)_ - the type of accounting you want to do. All types have to be separated by '|'. The following parameters can be used:
    
    *   _log_ - syslog accounting;
        
    *   _db_ - database accounting;
        
    *   _aaa_ - aaa specific accounting;
        
    *   _evi_ - Event Interface accounting;
        
    
*   _flags (string, optional)_ - flags for the accounting type you have selected. All the types have to be separated by '|'. The following parameters can be used:
    
    *   _cdr_ - enables dialog-level accounting. OpenSIPS will internally detect dialog termination (generation/receipt of a BYE request), and store the CDR as soon as the BYE request is replied to. By enabling the "cdr" flag, the following additional fields will be populated: duration, ms\_duration, setuptime, created. (requires dialog module support)
        
    *   _missed_ - log missed calls; take care that this flag will be deactivated after the first missed call; you will have to reactivate it in the _failure\_route_ if you want to account each destination that did not respond to the call;
        
    *   _failed_ - flag which indicates if the transaction should also be accounted in case of failure (status>=300);
        
    
*   _table (string, optional)_ - table where to do the accounting; it replaces old table\_avp parameter;
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE and LOCAL\_ROUTE.

**Example�1.20.�do\_accounting usage**

		...
		if (!has\_totag()) {
			if (is\_method("INVITE")) {
			/\* enable cdr and missed calls accounting in the database
			 \* and to syslog; db accounting shall be done in "my\_acc" table \*/
				do\_accounting("db|log", "cdr|missed", "my\_acc");
			}
		}
		...
		if (is\_method("BYE")) {
			/\* do normal accounting via aaa \*/
			do\_accounting("aaa");
		}
		...
		

  

### 1.8.2.� `drop_accounting([type], [flags])`

`drop_accounting()` resets flags and types of accounting set with do\_accounting(). If called with no arguments all accounting will be stopped. If called with only one argument all accounting for that type will be stopped. If called with two arguments normal accounting will still be enabled.

When called multiple times, the function behaves _additively_.

Meaning of the parameters is as follows:

*   _type (string, optional)_ - the type of accounting you want to stop. All the types have to be separated by '|'. The following parameters can be used:
    
    *   _log_ - stop syslog accounting;
        
    *   _db_ - stop database accounting;
        
    *   _aaa_ - stop aaa specific accounting;
        
    *   _evi_ - stop Event Interface accounting;
        
    
*   _flags (string, optional)_ - flags to be reset for the accouting type you have selected. All the types have to be separated by '|'. The following parameters can be used:
    
    *   _cdr_ - stop CDR accounting;
        
    *   _missed_ - stop logging missed calls;
        
    *   _failed_ - stop failed transaction accounting;
        
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE and LOCAL\_ROUTE.

**Example�1.21.�drop\_accounting usage**

		...
		acc\_log\_request("403 Destination not allowed");
		if (!has\_totag()) {
			if (is\_method("INVITE")) {
			/\* enable cdr and missed calls accounting in the database
			 \* and to syslog; db accounting shall be done in "my\_acc" table \*/
				do\_accounting("db|log", "cdr|missed", "my\_acc");
			}
		}
		...
		/\* later in your script \*/
		if (...) { /\* you don't want accounting anymore \*/
			/\* stop all syslog accounting \*/
			drop\_accounting("log");
			/\* or stop missed calls and cdr accounting for syslog;
			 \* normal accounting will still be enabled \*/
			drop\_accounting("log", "missed|cdr");
			/\* or stop all types of accounting  \*/
			drop\_accounting();
		}
		...
		

  

### 1.8.3.� `acc_log_request(comment)`

`acc_request` reports on a request, for example, it can be used to report on missed calls to off-line users who are replied 404 - Not Found. To avoid multiple reports on UDP request retransmission, you would need to embed the action in stateful processing.

Meaning of the parameters is as follows:

*   _comment (string)_ - Comment describing how the request completed - this string has to contain a reply code followed by a reply reason phrase (ex: "480 Nobody Home"). Variables are accepted in this string.
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE and LOCAL\_ROUTE.

**Example�1.22.�acc\_log\_request usage**

...
acc\_log\_request("403 Destination not allowed");
...

  

### 1.8.4.� `acc_db_request(comment, table)`

Like `acc_log_request`, `acc_db_request` reports on a request. The report is sent to database at “db\_url”, in the table referred to in the second action parameter.

Meaning of the parameters is as follows:

*   _comment (string)_ - Comment describing how the request completed - this string has to contain a reply code followed by a reply reason phrase (ex: "480 Nobody Home"). Variables are accepted in this string.
    
*   _table (string)_ - Database table to be used.
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE and LOCAL\_ROUTE.

**Example�1.23.�acc\_db\_request usage**

...
acc\_db\_request("Some comment", "Some table");
acc\_db\_request("$T\_reply\_code $(<reply>rr)", "acc");
...

  

### 1.8.5.� `acc_aaa_request(comment)`

Like `acc_log_request`, `acc_aaa_request` reports on a request. It reports to aaa server as configured in “aaa\_url”.

Meaning of the parameters is as follows:

*   _comment (string)_ - Comment describing how the request completed - this string has to contain a reply code followed by a reply reason phrase (ex: "404 Nobody home"). Variables are accepted in this string.
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE and LOCAL\_ROUTE.

**Example�1.24.�acc\_aaa\_request usage**

...
acc\_aaa\_request("403 Destination not allowed");
...

  

### 1.8.6.� `acc_evi_request(comment)`

Like `acc_log_request`, `acc_evi_request` reports on a request. The report is packed as an event sent through the OpenSIPS Event Interface as _E\_ACC\_EVENT_ if the reply code is a positive one (lower than 300), or _E\_ACC\_MISSED\_EVENT_ for negative or no codes. More information on this in [Exported Events](#exported_events "1.9.�Exported Events").

Meaning of the parameters is as follows:

*   _comment (string)_ - Comment describing how the request completed - this string has to contain a reply code followed by a reply reason phrase (ex: "404 Nobody home")
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE and LOCAL\_ROUTE.

**Example�1.25.�acc\_evi\_request usage**

...
acc\_evi\_request("403 Destination not allowed");
...

  

### 1.8.7.� `acc_new_leg()`

Creates a new leg and increments [$acc\_current\_leg](#pv_acc_current_leg "1.7.3.�$acc_current_leg (read-only)") only if multi-leg accounting is used. All values of the new leg will be initialized to null.

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE and LOCAL\_ROUTE.

**Example�1.26.�acc\_new\_leg usage**

...
	acc\_new\_leg();
...

  

### 1.8.8.� `acc_load_ctx_from_dlg()`

The function loads and exposes the accounting context of the currently in-use dialog. By dialog context, it means, from script level, you will read/write the accounting variables from the other dialog. The current accounting context is stashed until an unload operation is done.

Note that this functions makes sense only when used together with the _load\_dialog\_ctx()_ function from the dialog module. After loading the context of another dialog, by using the _acc\_load\_ctx\_from\_dlg()_ function, you can also access the accounting context of the loaded dialog.

NOTE: you cannot perform a new load until doing an unload - no nested loadings are allowed.

This function can be used from any type of route.

**Example�1.27.�acc\_load\_ctx\_from\_dlg usage**

...
if ( load\_dialog\_ctx("$var(callid)") ) {
	# we now have the dialog context of the new dialog
	acc\_load\_ctx\_from\_dlg();
	# we have now also the accouting context of that dialog
	xlog("The accounting caller of call '$var(callid)' "
		"is '$acc\_extra(caller)'\\n");
	acc\_unload\_ctx\_from\_dlg();
	unload\_dialog\_ctx();
}

...

  

### 1.8.9.� `acc_unload_ctx_from_dlg()`

The function off-loads a previosuly loaded accounting context, exposing whatever accounting context was present before doing the load.

NOTE: you MUST perform from script an explicit unload for each load you did!

This function can be used from any type of route.

For usage example, see the [acc\_load\_ctx\_from\_dlg()](#func_acc_load_ctx_from_dlg "1.8.8.� acc_load_ctx_from_dlg()").

## 1.9.�Exported Events

### 1.9.1.� `E_ACC_CDR`

The event raised when a CDR is generated. Note that this event will only be triggered if the auto CDR accounting is used.

Parameters:

*   _method_ - Request method name
    
*   _from\_tag_ - From header tag parameter
    
*   _to\_tag_ - To header tag parameter
    
*   _callid_ - Message Call-id
    
*   _sip\_code_ - The status code from the final reply
    
*   _sip\_reason_ - The status reason from the final reply
    
*   _time_ - The timestamp when the call was established
    
*   _evi\_extra\*_ - Extra parameters added by the _evi\_extra_ parameter.
    
*   _evi\_extra\_bye\*_ - Extra parameters added by the _evi\_extra\_bye_ parameter
    
*   _multi\_leg\_info\*_ - Extra parameters added by the _multi\_leg\_info_ parameter
    
*   _multi\_leg\_bye\_info\*_ - Extra parameters added by the _multi\_leg\_bye\_info_ parameter
    
*   _duration_ - The call duration in seconds
    
*   _ms\_duration_ - The call duration in milliseconds
    
*   _setuptime_ - The call setup time in seconds
    
*   _created_ - The timestamp when the call was created (the initial Invite was received)
    

### 1.9.2.� `E_ACC_EVENT`

This event is triggered when old-style accounting is used. It is generated when the requests (INVITE and BYE) transaction have positive final replies, or by the `acc_evi_request()` function that has a positive reply code in comment.

Parameters:

*   _method_ - Request method name
    
*   _from\_tag_ - From header tag parameter
    
*   _to\_tag_ - To header tag parameter
    
*   _callid_ - Message Call-id
    
*   _sip\_code_ - The status code from the final reply
    
*   _sip\_reason_ - The status reason from the final reply
    
*   _time_ - The timestamp when the transaction was created
    
*   _evi\_extra\*_ - Extra parameters added by the _evi\_extra_ parameter
    
*   _multi\_leg\_info\*_ - Extra parameters added by the _multi\_leg\_info_ parameter
    

### 1.9.3.� `E_ACC_MISSED_EVENT`

This event is triggered when old-style accounting is used. It is generated when the requests (INVITE and BYE) transaction have negative final replies, or by the `acc_evi_request()` function that has a negative reply code in comment.

Parameters:

*   _method_ - Request method name
    
*   _from\_tag_ - From header tag parameter
    
*   _to\_tag_ - To header tag parameter
    
*   _callid_ - Message Call-id
    
*   _sip\_code_ - The status code from the final reply
    
*   _sip\_reason_ - The status reason from the final reply
    
*   _time_ - The timestamp when the transaction was created
    
*   _evi\_extra\*_ - Extra parameters added by the _evi\_extra_ parameter
    
*   _multi\_leg\_info\*_ - Extra parameters added by the _multi\_leg\_info_ parameter
    
*   _created_ - Timestamp when the call was created
    
*   _setuptime_ - The call setup time in seconds
    

## Chapter�2.�Frequently Asked Questions

$

**2.1.**

What happened with old report\_ack parameter

The parameter is considered obsolete. It was removed as acc module is doing SIP transaction based accouting and according to SIP RFC, end2end ACKs are a different transaction (still part of the same dialog). ACKs can be individually accouted as any other sequential (in-dialog) request.

**2.2.**

What happened with old log\_fmt parameter

The parameter became obsolete with the restructure of the data logged by ACC module (refer to the Overview chapter). For similar behaviour you can use the extra accouting (see the corresponding chapter).

**2.3.**

What happened with old multi\_leg\_enabled parameter

The parameter became obsolete by the addition of the new multi\_leg\_info parameter. The multi-leg accouting is automatically enabled when multi\_leg\_info is defined.

**2.4.**

What happened with old src\_leg\_avp\_id and dst\_leg\_avp\_id parameters

The parameter was replaced by the more generic new parameter multi\_leg\_info. This allows logging (per-leg) of more information than just dst and src.

**2.5.**

Where can I find more about OpenSIPS?

Take a look at [https://opensips.org/](https://opensips.org/).

**2.6.**

Where can I post a question about this module?

First at all check if your question was already answered on one of our mailing lists:

*   User Mailing List - [http://lists.opensips.org/cgi-bin/mailman/listinfo/users](http://lists.opensips.org/cgi-bin/mailman/listinfo/users)
    
*   Developer Mailing List - [http://lists.opensips.org/cgi-bin/mailman/listinfo/devel](http://lists.opensips.org/cgi-bin/mailman/listinfo/devel)
    

E-mails regarding any stable OpenSIPS release should be sent to `<[users@lists.opensips.org](mailto:users@lists.opensips.org)>` and e-mails regarding development versions should be sent to `<[devel@lists.opensips.org](mailto:devel@lists.opensips.org)>`.

If you want to keep the mail private, send it to `<[users@lists.opensips.org](mailto:users@lists.opensips.org)>`.

**2.7.**

How can I report a bug?

Please follow the guidelines provided at: [https://github.com/OpenSIPS/opensips/issues](https://github.com/OpenSIPS/opensips/issues).

## Chapter�3.�Contributors

## 3.1.�By Commit Statistics

**Table�3.1.�Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)**

�

Name

DevScore

Commits

Lines ++

Lines --

1.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

228

114

4306

4609

2.

Jan Janak ([@janakj](https://github.com/janakj))

147

16

5587

5074

3.

Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita))

140

39

3730

4180

4.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

102

67

2705

677

5.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

75

55

985

608

6.

Jiri Kuthan ([@jiriatipteldotorg](https://github.com/jiriatipteldotorg))

57

26

2272

660

7.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

26

23

115

88

8.

Elena-Ramona Modroiu

25

4

2267

5

9.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

22

11

353

478

10.

Henning Westerholt ([@henningw](https://github.com/henningw))

20

15

184

131

  

**All remaining contributors**: Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)), Maksym Sobolyev ([@sobomax](https://github.com/sobomax)), Irina-Maria Stanescu, Karel Kozlik, Andrei Pelinescu-Onciul, Alexandra Titoc, Dan Pascu ([@danpascu](https://github.com/danpascu)), Juha Heinanen ([@juha-h](https://github.com/juha-h)), Elena-Ramona Modroiu, Ryan Bullock ([@rrb3942](https://github.com/rrb3942)), Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)), Walter Doekes ([@wdoekes](https://github.com/wdoekes)), Sergio Gutierrez, Peter Nixon, Alex Massover, Nils Ohlmeier, Konstantin Bokarius, Alexey Vasilyev ([@vasilevalex](https://github.com/vasilevalex)), Jesus Rodrigues, Julien Blache, Juli�n Moreno Pati�o, Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Dusan Klinec ([@ph4r05](https://github.com/ph4r05)), Edson Gellert Schubert.

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 3.2.�By Commit Activity

**Table�3.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Aug 2010 - Dec 2024

2.

Alexandra Titoc

Sep 2024 - Sep 2024

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Jan 2013 - May 2024

4.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Dec 2003 - Nov 2023

5.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Dec 2003 - May 2023

6.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Mar 2023

7.

Alexey Vasilyev ([@vasilevalex](https://github.com/vasilevalex))

Mar 2022 - Mar 2022

8.

Walter Doekes ([@wdoekes](https://github.com/wdoekes))

Apr 2021 - Apr 2021

9.

Dan Pascu ([@danpascu](https://github.com/danpascu))

Jul 2004 - Sep 2018

10.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

  

**All remaining contributors**: Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita)), Juli�n Moreno Pati�o, Dusan Klinec ([@ph4r05](https://github.com/ph4r05)), Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)), Ryan Bullock ([@rrb3942](https://github.com/rrb3942)), Irina-Maria Stanescu, Alex Massover, Sergio Gutierrez, Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)), Henning Westerholt ([@henningw](https://github.com/henningw)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Elena-Ramona Modroiu, Jesus Rodrigues, Julien Blache, Peter Nixon, Juha Heinanen ([@juha-h](https://github.com/juha-h)), Jan Janak ([@janakj](https://github.com/janakj)), Jiri Kuthan ([@jiriatipteldotorg](https://github.com/jiriatipteldotorg)), Andrei Pelinescu-Onciul, Elena-Ramona Modroiu, Nils Ohlmeier, Karel Kozlik.

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�4.�Documentation

## 4.1.�Contributors

**Last edited by:** Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita)), Ryan Bullock ([@rrb3942](https://github.com/rrb3942)), Irina-Maria Stanescu, Sergio Gutierrez, Henning Westerholt ([@henningw](https://github.com/henningw)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Elena-Ramona Modroiu, Jan Janak ([@janakj](https://github.com/janakj)), Maksym Sobolyev ([@sobomax](https://github.com/sobomax)), Elena-Ramona Modroiu.

_Documentation Copyrights:_

Copyright � 2009-2013 OpenSIPS Solutions

Copyright � 2004-2009 Voice Sistem SRL

Copyright � 2002-2003 FhG FOKUS