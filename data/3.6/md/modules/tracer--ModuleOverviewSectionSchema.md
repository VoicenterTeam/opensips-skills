# Tracer Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5718752)

2.2. [Most recently active contributors(1) to this module](#idp5825136)

**List of Examples**

1.1. [Set `trace_on` parameter](#idp171632)

1.2. [Set `trace_local_ip` parameter](#idp97872)

1.3. [Set `trace_id` parameter](#idp5530112)

1.4. [Set `syslog_default_facility` parameter](#idp5536144)

1.5. [Set `syslog_default_level` parameter](#idp5541440)

1.6. [Set `file_mode` parameter](#idp5546800)

1.7. [`trace()` usage](#idp5576080)

## Chapter�1.�Admin Guide

## 1.1.�Overview

Offer a possibility to store incoming/outgoing SIP messages in database. Since version 2.2, proto\_hep module needs to be loaded in order to duplicate with hep. All hep parameters moved inside proto\_hep.

The 2.2 version of OpenSIPS came with a major improvement in tracer module. Now all you have to do is call _trace()_ function with the proper parameters and it will do the job for you. Now you can trace messages, transactions and dialogs with the same function. Also, you can trace to multiple databases, multiple hep destinations and sip destinations using only one parameter. All you need now is defining _trace\_id_ parameters in modparam section and switch between them in tracer function. Also you cand turn tracing on and off using _trace\_on_ either globally(for all trace\_ids) or for a certain trace\_id.

IMPORTANT: In 2.2 version support for stateless trace has been removed.

The tracing tracing can be turned on/off using fifo command.

opensips-cli -x mi trace on opensips-cli -x mi trace \[some\_trace\_id\] on

opensips-cli -x mi trace off opensips-cli -x mi trace \[some\_trace\_id\] off

Starting with OpenSIPS 3.0 you can use the _trace\_start_ to create dynamic dynamic tracing destinations based on some custom filters.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _database module_ - mysql, postrgress, dbtext, unixodbc... only if you are using a database type trace id
    
*   _b2b\_logic_ - only if you want to trace B2B sessions.
    
*   _dialog_ - only if you want to trace SIP dialogs (INVITE based).
    
*   _tm_ - only if you want to trace SIP transactions.
    
*   _proto\_hep_ - only if you want to trace / replicate messages over HEP protocol.
    

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _None_.
    

## 1.3.�Exported Parameters

### 1.3.1.�`trace_on` (integer)

Parameter to enable/disable trace (on(1)/off(0))

_Default value is "1"(enabled)._

**Example�1.1.�Set `trace_on` parameter**

...
modparam("tracer", "trace\_on", 1)
...

  

### 1.3.2.�`trace_local_ip` (str)

The address to be used in the fields that specify the source address (protocol, ip and port) for locally generated messages. If not set, the module sets it to the address of the socket that will be used to send the message. Protocol and/or port are optional and if omitted will take the default values: udp and 5060.

_Default value is "NULL"._

**Example�1.2.�Set `trace_local_ip` parameter**

...
#Resulting address: udp:10.1.1.1:5064
modparam("tracer", "trace\_local\_ip", "10.1.1.1:5064")
...

...
#Resulting address: tcp:10.1.1.1:5060
modparam("tracer, "trace\_local\_ip", "tcp:10.1.1.1")
...

...
#Resulting address: tcp:10.1.1.1:5064
modparam("tracer", "trace\_local\_ip", "tcp:10.1.1.1:5064")
...

...
#Resulting address: udp:10.1.1.1:5060
modparam("tracer", "trace\_local\_ip", "10.1.1.1")
...

  

### 1.3.3.�`trace_id` (str)

Specify a destination for the trace. This can be a hep id defined in proto\_hep, a sip uri, a file, a syslog facility or a database url and a table. All parameters inside _trace\_id_ must be separated by _;_, excepting the last one. The parameters are given in key-value format, the possible keys being _uri_ for HEP and SIP IDs and _uri_ and _table_ for databases. The format is _\[id\_name\]key1=value1;key2=value2;_. HEP id's **MUST** be defined in proto\_hep in order to be able to use them here.

When the uri is a _file_, the path to the file has to be specified after the colon. The output is always appended if the file exists, or created if it doesn't, using [file\_mode](#param_file_mode "1.3.6.�file_mode (integer)") permissions.

When the uri is _syslog_, it has to follow the following format: _syslog\[:FACILITY\[:LEVEL\]\]_. The default facility and levels are the ones used by OpenSIPS (_syslog\_facility_ and _log\_level_). These can be tuned using [syslog\_default\_facility](#param_syslog_default_facility "1.3.4.�syslog_default_facility (string)") and [syslog\_default\_level](#param_syslog_default_level "1.3.5.�syslog_default_level (integer)") parameters.

One can declare multiple types of tracing under the same trace id, being identified by their name. So if you define two database url, one hep uri and one sip uri with the same name, when calling trace() with this name tracing shall be done to all the destinations.

All the old parameter such as db\_url, table and duplicate\_uri will form the trace id with the name "default".

_No default value. If not set the module will be useless._

**Example�1.3.�Set `trace_id` parameter**

...
/\*DB trace id\*/
modparam("tracer", "trace\_id",
"\[tid\]
uri=mysql://xxxx:xxxx@10.10.10.10/opensips;
table=new\_sip\_trace;")
/\* hep trace id with the hep id defined in proto\_hep; check proto\_hep docs
 \* for more information \*/
modparam("proto\_hep", "hep\_id",  "\[hid\]10.10.10.10")
modparam("tracer", "trace\_id", "\[tid\]uri=hep:hid")
/\*sip trace id\*/
modparam("tracer", "trace\_id",
"\[tid\]uri=sip:10.10.10.11:5060")
/\* notice that they all have the same name
 \* meaning that calling trace("tid",...)
 \* will do sql, sip and hep tracing \*/
/\*file trace id\*/
modparam("tracer", "trace\_id",
"\[tid\]uri=file:/path/to/file")
/\*syslog trace id at error (level -1)\*/
modparam("tracer", "trace\_id",
"\[tid\]uri=syslog:local0:-1")
...

  

### 1.3.4.�`syslog_default_facility` (string)

When _syslog_ tracing is used, this parameter specifies the log facility to write traces to.

_Default value is the value of _syslog\_facility_._

**Example�1.4.�Set `syslog_default_facility` parameter**

...
modparam("tracer", "syslog\_default\_facility", "LOG\_DAEMON")
...

  

### 1.3.5.�`syslog_default_level` (integer)

When _syslog_ tracing is used, this parameter specifies the level to write traces to.

_Default value is the value of _log\_level_._

**Example�1.5.�Set `syslog_default_level` parameter**

...
modparam("tracer", "syslog\_default\_level", 2) # NOTICE
...

  

### 1.3.6.�`file_mode` (integer)

When _file_ tracing is used, this parameter specifies the permissions to be used to create the trace files. It follows the UNIX conventions.

_Default value is _0600 (rw-------)_._

**Example�1.6.�Set `file_mode` parameter**

...
modparam("tracer", "file\_mode", 0644)
...

  

## 1.4.�Exported Functions

### 1.4.1.� `trace(trace_id, [scope], [type], [trace_attrs], [flags], [correlation_id])`

This function has replaced the _sip\_trace()_ in OpenSIPS 3.0.

Store or replicate current processed SIP message, transaction / dialog or B2B session. It is stored in the form prior applying chages made to it. The traced\_user\_avp parameter is now an argument to trace() function. Since version 2.2, this function also catches internally generated replies in stateless mode(sl\_send\_reply(...)).

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, ONREPLY\_ROUTE, BRANCH\_ROUTE.

Meaning of the parameters is as follows:

*   _trace\_id (string)_ the name of the _trace\_id_ specifying where to do the tracing.
    
*   _scope (string, optional)_ what do you want to trace: dialog, transaction, B2B session or only the message. If not specified, will try the topmost trace that can be done: if dialog module loaded will trace dialogs, else if tm module loaded will trace transaction and if none of these loaded will trace messages.
    
    Types can be the following:
    
    *   _'m'/'M'_ trace messages. Is the only one you should use in stateless mode.
        
    *   _'t'/'T'_ trace transactions. If tm module not loaded, it will be in stateless transaction aware mode meaning that will catch selected requests both in and out and internally generated replies.
        
    *   _'d'/'D'_ trace dialog
        
    *   _'b'/'B'_ trace all the traffic related to the B2B session to be later created
        
    
*   _type (string, optional)_ list of types of messages to be traced by this function; if not set only sip messages shall be traced; if the parameter is set, but _sip_ is not specified, _sip_ shall not be traced; all the parameters from the list shall be separated by '|'
    
    Current possible types to be traced are the following:
    
    *   _sip_ - enable sip messages tracing;
        
    *   _xlog_ - enable xlog messages tracing in current scope(dialog, transaction, B2B session or message);
        
    *   _rest_ - enable rest messages tracing;
        
    
*   _trace\_attrs (string, optional)_ this parameter replaces the traced\_user\_avp from the old version. To avoid duplicating an entry only for this parameter, whatever you put here(string/pvar) shall be stored in the trace\_attrs column in the sip\_trace table.
    
*   _flags (string,pvar)_ are some control flags over the tracing process (how and what to be traced).
    
    *   _C_ - trace only the SIP caller side;
        
    *   _c_ - trace onlt the SIP callee side;
        
    
    If both _C_ and _c_ flags are missing, tracing of both sides/legs is assumed.
    
    NOTE these flags are supported only by transactional and dialog tracing
    
*   _correlation\_id (string,pvar)_ a custom SIP correlation ID to be forced (normally the SIP Call-ID is used) to correlate this traffic (transaction, dialog) with other traffic.
    

**Example�1.7.�`trace()` usage**

...
/\* see declaration of tid in trace\_id section \*/
	$var(trace\_id) = "tid";
	$var(user) = "osip\_user@opensips.org";

...
/\* Example 1: how to trace a dialog sip and xlog \*/
	if (has\_totag()) {
		match\_dialog();
	} else {
		if (is\_method("INVITE") {
			trace($var(trace\_id), "d", "sip|xlog", $var(user));
		}
	}
...
/\* Example 2: how to trace initial INVITE and BYE, sip and rest \*/
	if (has\_totag()) {
		if (is\_method("BYE")) {
			trace($var(trace\_id), "m", "sip|rest", $var(user));
		}
	} else {
		if (is\_method("INVITE")) {
			trace($var(trace\_id), "m", "sip|rest", $var(user));
		}
	}

...
/\* Example 3: trace initial INVITE transaction's only xlog and rest, no sip \*/
	if (!has\_totag()) {
		if (is\_method("INVITE")) {
			trace($var(trace\_id), "t", "xlog|rest", $var(user));
		}
	}
...
/\* Example 4: stateless transaction aware mode!\*/
/\* tm module must not be loaded \*/
	if (is\_method("REGISTER")) {
		trace($var(trace\_id), "t", "xlog|rest", $var(user));
		if (!www\_authorize("", "subscriber")) {
			/\* tracer will also catch the 401 generated by www\_challenge() \*/
			www\_challenge("", "auth");
		}
	}

  

## 1.5.�Exported MI Functions

### 1.5.1.� `trace`

Enable/disable tracing(globally or for a specific trace id) or dump info about trace ids. This command requires named parameters (each parameter is ginven in the format param\_name=param\_value).

Name: _trace_

Parameters:

*   _id_ (optional) - the name of the tracing instance. If this parameter is missing the command will either dump info for all tace ids(and return the global tracing state) or set the global tracing state.
    
*   _mode_ (optional) - possible values are:
    
    *   "on" - enable tracing
        
    *   "off" - disable tracing
        
    
    If the first parameter is missing, the command wil set the global tracing state, otherwise it will set the state for a specific trace id. If you turn global trace on but some of the trace ids had tracing set to off, then they shall not do tracing. If you want to turn the tracing on for all trace ids you will have to set it separately for each of them.
    
    If this parameter is missing but the first is set, the command will only dump info about that specific trace id. If both parameters are missing, the command will return the global tracing state and dump info for each id.
    

MI FIFO Command Format:

\# Display global tracing mode and all trace destinations:
opensips-cli -x mi trace
# Turn off global tracing:
opensips-cli -x mi trace mode=off
# Turn on tracing for destination id tid2:
opensips-cli -x mi trace id=tid2 mode=on
		

### 1.5.2.� `trace_start`

Creates a dynamic tracing destination based using custom filters. This function can be used to debug calls for certain destinations real-time.

Dynamic destinations are not restart persistent!

Name: _trace\_start_

Parameters:

*   _id_ - the name of the tracing instance.
    
*   _uri_ - the destination uri for this instance.
    
*   _filter_ (optional) - used to filter the traffic received by the sender. This parameter should be an array that can contain multiple filters in the _condition=value_ format. Possible values for the _condition_ argument are:
    
    *   caller
        
        \- filter based on the caller (From username)
    *   callee
        
        \- filter based on the callee (R-URI username)
    *   ip
        
        \- filter based on the source IP of the message
    
    The _condition_ parameter can consist of multiple different filters. In order to satisfy the overall condition and send traffic to the desired destination, all conditions have to be satisfied.
    
    If this parameter is missing all traffic is forwarded to the destination.
    
    The filter is applied for any incoming request
    
*   _scope_ - the scope to engage the tracing for. The format received by this parameter is similar to the one received by the _trace()_ function.
    
*   _type_ - the type of messages you want to receive. The format received by this parameter is similar to the one received by the _trace()_ function.
    

MI FIFO Command to start tracing calls from IP 127.0.0.1 to HEP destination 10.0.0.1:9060:

		opensips-cli -x mi trace\_start id=ip\_filter uri=hep:10.0.0.1:9060 filter=ip=127.0.0.1
		

MI FIFO Command to start tracing calls from user Alice to user Bob:

		opensips-cli -x mi trace\_start id=alice\_bob uri=hep:10.0.0.1:9060 filter=caller=Alice filter=caller=Bob
		

### 1.5.3.� `trace_stop`

Stops OpenSIPS from sending traffic to a dynamic trace id created using the _trace\_start_ command.

Name: _trace\_stop_

Parameters:

*   _id_ - the name of the tracing instance to be stopped.
    

MI FIFO Command to stop tracing calls from user Alice to user Bob:

		opensips-cli -x mi trace\_stop alice\_bob
		

## 1.6.�Database setup

Before running OpenSIPS with tracer, you have to setup the database tables where the module will store the data. For that, if the table were not created by the installation script or you choose to install everything by yourself you can use the tracer-create.sql SQL script in the database directories in the opensips/scripts folder as template. You can also find the complete database documentation on the project webpage, [https://opensips.org/docs/db/db-schema-devel.html](https://opensips.org/docs/db/db-schema-devel.html).

## 1.7.�Known issues

ACKs related to a transaction that are leaving OpenSIPS are not traced since they are handled statelessly using forward\_request function. Fixing it would mean to register a fwdcb callback that would be called for all the messages but would be used only by ACKs, which would be highly ineffective.

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

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

115

88

1319

876

2.

Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita))

107

52

2676

1887

3.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

76

54

1665

453

4.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

49

26

2215

191

5.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

26

23

87

80

6.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

24

10

402

568

7.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

17

8

286

335

8.

Henning Westerholt ([@henningw](https://github.com/henningw))

11

6

146

155

9.

Andrei Datcu ([@andrei-datcu](https://github.com/andrei-datcu))

11

5

284

135

10.

Alexandr Dubovikov ([@adubovikov](https://github.com/adubovikov))

7

1

500

4

  

**All remaining contributors**: Maksym Sobolyev ([@sobomax](https://github.com/sobomax)), Dan Pascu ([@danpascu](https://github.com/danpascu)), Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)), Walter Doekes ([@wdoekes](https://github.com/wdoekes)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Dusan Klinec ([@ph4r05](https://github.com/ph4r05)), Zero King ([@l2dy](https://github.com/l2dy)), Andreas Heise, Nick Altmann ([@nikbyte](https://github.com/nikbyte)), Sergio Gutierrez, okhowang, Konstantin Bokarius, Iouri Kharon, Edson Gellert Schubert, Elena-Ramona Modroiu, Eric Tamme ([@etamme](https://github.com/etamme)).

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 2.2.�By Commit Activity

**Table�2.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Jul 2006 - Jul 2024

2.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Jun 2011 - Jul 2024

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Jan 2013 - May 2024

4.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

Mar 2020 - Apr 2024

5.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

Jun 2011 - Dec 2023

6.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Nov 2023

7.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - May 2023

8.

okhowang

Mar 2023 - Mar 2023

9.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Sep 2022

10.

Nick Altmann ([@nikbyte](https://github.com/nikbyte))

Feb 2022 - Feb 2022

  

**All remaining contributors**: Walter Doekes ([@wdoekes](https://github.com/wdoekes)), Zero King ([@l2dy](https://github.com/l2dy)), Dan Pascu ([@danpascu](https://github.com/danpascu)), Eric Tamme ([@etamme](https://github.com/etamme)), Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita)), Dusan Klinec ([@ph4r05](https://github.com/ph4r05)), Andrei Datcu ([@andrei-datcu](https://github.com/andrei-datcu)), Alexandr Dubovikov ([@adubovikov](https://github.com/adubovikov)), Sergio Gutierrez, Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Iouri Kharon, Konstantin Bokarius, Edson Gellert Schubert, Henning Westerholt ([@henningw](https://github.com/henningw)), Andreas Heise, Elena-Ramona Modroiu.

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Nick Altmann ([@nikbyte](https://github.com/nikbyte)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)), Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita)), Andrei Datcu ([@andrei-datcu](https://github.com/andrei-datcu)), Alexandr Dubovikov ([@adubovikov](https://github.com/adubovikov)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Henning Westerholt ([@henningw](https://github.com/henningw)), Elena-Ramona Modroiu.

_Documentation Copyrights:_

Copyright � 2006 Voice Sistem SRL