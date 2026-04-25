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