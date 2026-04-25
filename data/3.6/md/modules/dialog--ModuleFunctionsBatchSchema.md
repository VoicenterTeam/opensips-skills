## 1.7.�Exported Functions

### 1.7.1.� `create_dialog([flags])`

The function creats the dialog for the currently processed request. The request must be an initial request. Optionally,the function also receives a string parameter, which specifies special behavior to be done for the current dialog.

Parameters:

*   _flags (string, optional)_ Possible values here are :
    
    *   B - Upon reaching dialog lifetime, BYEs will be triggered both ways
        
    *   P - Ping caller side with OPTIONS messages, once every options\_ping\_interval seconds
        
    *   p - Ping callee side with OPTIONS messages, once every options\_ping\_interval seconds
        
    *   R - Ping caller side with RE-INVITE messages, once every reinvite\_ping\_interval seconds
        
    *   r - Ping callee side with RE-INVITE messages, once every reinvite\_ping\_interval seconds
        
    *   E - Upon detecting a SIP Race condition (see RFC 5407), end the call after race\_condition\_timeout seconds
        
    
    Multiple string flags can be used at the same time, ie. passing "BPp" flags will enable all 3 flags.
    

NOTE: both RE-INVITE and OPTIONS pinging cannot be enabled at the same time for a single dialog leg. If both flags ("_PR_" or "_pr_") are provided only RE-INVITE pinging will be used.

The function returns true if the dialog was successfully created or if the dialog was previously created.

This function can be used from REQUEST\_ROUTE.

**Example�1.54.�`create_dialog()` usage**

...
create\_dialog();
...
#ping caller
create\_dialog("P");
...
#ping caller and callee
create\_dialog("Pp");

#bye on timeout
create\_dialog("B");
...

  

### 1.7.2.� `match_dialog([dlg_match_mode])`

This function is to be used to match a sequential (in-dialog) request to an ongoing dialog.

By default, dialog matching is performed according to the [dlg\_match\_mode](#param_dlg_match_mode "1.6.7.�dlg_match_mode (integer)") module parameter. A specific matching mode may be enforced by specifying the optional "dlg\_match\_mode" parameter. Possible values for this parameter are "DID\_ONLY", "DID\_FALLBACK" and "DID\_NONE".

As sequential requests are automatically matched to the dialog when doing "loose\_route()" from script, this function is intended to: (A) control the place in your script where the dialog matching is done and (B) to cope with bogus sequential requests that do not have Route headers, so they are not handled by loose\_route().

Parameters:

*   _dlg\_match\_mode (string, optional)_
    

The function returns true if a dialog exists for the request.

This function can be used from REQUEST\_ROUTE.

**Example�1.55.�`match_dialog()` usage**

...
    if (has\_totag()) {
        loose\_route();

        # example 1: match according to [dlg\_match\_mode](#param_dlg_match_mode "1.6.7.�dlg_match_mode (integer)")
        if ($DLG\_status == NULL && !match\_dialog())
            xlog("cannot match request to a dialog\\n");

        # example 2: override [dlg\_match\_mode](#param_dlg_match_mode "1.6.7.�dlg_match_mode (integer)")
        if ($DLG\_status == NULL && !match\_dialog("DID\_FALLBACK"))
            xlog("cannot match request to a dialog\\n");
    }
...

  

### 1.7.3.� `validate_dialog()`

The function checks the current received requests against the dialog (internal data) it belongs to. Performing several tests, the function will help to detect the bogus injected in-dialog requests (like malicious BYEs).

The performed tests are related to CSEQ sequence checking and routing information checking (contact and route set).

The function returns true if a dialog exists for the request and if the request is valid (according to dialog data). If the request is invalid, the following return codes are returned :

*   _\-1_ - invalid cseq
    
*   _\-2_ - invalid remote target
    
*   _\-3_ - invalid route set
    
*   _\-4_ - other errors ( parsing, no dlg, etc )
    

This function can be used from REQUEST\_ROUTE.

**Example�1.56.�`validate_dialog()` usage**

...
    if (has\_totag()) {
        loose\_route();
        if ($DLG\_status!=NULL && !validate\_dialog() ) {
            xlog(" in-dialog bogus request \\n");
        } else {
            xlog(" in-dialog valid request - $DLG\_dir !\\n");
        }
    }
...

  

### 1.7.4.� `fix_route_dialog()`

The function forces an in dialog SIP message to contain the ruri, route headers and dst\_uri, as specified by the internal data of the dialog it belongs to. The function will prevent the existence of bogus injected in-dialog requests ( like malicious BYEs )

This function can be used from REQUEST\_ROUTE.

**Example�1.57.�`fix_route_dialog()` usage**

...
    if (has\_totag()) {
        loose\_route();
        if ($DLG\_status!=NULL)
            if (!validate\_dialog())
                fix\_route\_dialog();
    }
...

  

### 1.7.5.� `get_dialog_info(attr,avp,key,key_val,no_dlgs)`

The function extracts a dialog value from another dialog. It first searches through all existing (ongoing) dialogs for all dialogs that have a dialog variable named "key" with the value "key\_val" (so a dialog where $dlg\_val(key)=="key\_val"). If found, it returns the value of the dialog variable "attr" from all the founds dialog in the "avp" pseudo-variable, otherwise nothing is written in "avp", and a negative error code is returned.

NOTE: the function does not require to be called in the context of a dialog - you can use it whenever / whereever for searching for other dialogs.

Meaning of the parameters is as follows:

*   _attr (string)_ - the name of the dialog variable (from the found dialog) to be returned;
    
*   _avp (var)_ - an avp where to store the values of the "attr" dialog variable. Since the function checks through all dialogs, this needs to be an actual AVP in order to support pushing values from all matched dialogs.
    
*   _key (string)_ - name of a dialog variable to be used a search key (when looking after the target dialog)
    
*   _key\_val (var)_ - the value of the dialog variable that is used as key in searching the target dialog.
    
*   _no\_dlgs (var)_ - the total number of dialogs containing the key variable
    

This function can be used from ALL ROUTES.

**Example�1.58.�`get_dialog_info` usage**

...
if ( get\_dialog\_info("callee",$avp(callee\_array),"caller",$fu,$var(dlg\_no)) ) {
	xlog("caller $fu has $var(dlg\_no) other ongoing calls, talking with :");	
	$var(it) = 0;
	while ($var(it) < $var(dlg\_no)) {
		$var(current\_callee) = $(avp(callee\_array)\[$var(it)\]);
		xlog(" $var(current\_callee) ");
		$var(it) = $var(it) + 1;
	}

	xlog("\\n");
}

# create dialog for current call and place the caller and callee attributes
create\_dialog();
$dlg\_val(caller) = $fu;
$dlg\_val(callee) = $ru;
...

  

### 1.7.6.� `get_dialog_vals(names,vals,callid)`

The function fetches all the dialog variables of another dialog. It first searches through all existing (ongoing) dialogs based on the given SIP CallID. If found, it returns all the dialog variables as two parallel arrays of names and values (using the given variables "names" and "vals"). As these variables have to hold arrays, they must be AVPs.

NOTE: the function does not require to be called in the context of a dialog - you can use it whenever / whereever for searching for other dialogs.

Meaning of the parameters is as follows:

*   _names (var)_ - an AVP variable to hold all the names of the variables from the found dialog.
    
*   _vals (var)_ - an AVP variable to hold all the values of the variables from the found dialog.
    
*   _callid (string)_ - the callid of a dialog to be searched (and have the variables fetched).
    

This function can be used from any type of route.

**Example�1.59.�`get_dialog_vals` usage**

...
if ( get\_dialog\_vals($avp(d\_names),$avp(d\_vals),$var(callid)) ) {
	xlog("the call $var(callid) has the variables:\\n);
	$var(i) = 0;
	while ( $(avp(d\_names)\[$var(i)\])!=NULL ) {
		xlog("var $var(i) is $(avp(d\_names)\[$var(i)\])='$(avp(d\_vals)\[$var(i)\])'\\n");
		$var(i) = $var(i) + 1;
	}
}
...

  

### 1.7.7.� `get_dialogs_by_val(name,value,out_avp,out_dlg_no)`

The function looks up through the whole dialog table for dialogs containing a $dlg\_val with the provided name and value, and returns all the $DLG\_ctx\_json variables for the matched dialogs, storing them in the provided out\_avp. The total number of matched dialogs is returned in the out\_dlgs\_no variable

NOTE: the function does not require to be called in the context of a dialog - you can use it whenever / whereever for searching for other dialogs.

Meaning of the parameters is as follows:

*   _name (string)_ - the name of the dialog variable used for the lookup
    
*   _value (var)_ - the value of the above dialog val
    
*   _out\_avp (var)_ - the AVP which will be populated will the dialog JSONs for all the matched calls
    
*   _dlg\_no (var)_ - the out var which will contain the total number of matched dialogs
    

This function can be used from any type of route.

**Example�1.60.�`get_dialog_vals` usage**

...
if ( get\_dialogs\_by\_val("caller",$fU,$avp(dlg\_jsons),$avp(dlg\_no)) ) {
	xlog("Caller $fU has $avp(dlg\_no) other calls \\n);
	$var(i) = 0;
	while ( $(avp(dlg\_jsons)\[$var(i)\])!=NULL ) {
		$json(dlg\_info) := $(avp(dlg\_jsons)\[$var(i)\]); 
		# fetch any info for the above call and process it
		$var(i) = $var(i) + 1;
	}
}
...

  

### 1.7.8.� `get_dialogs_by_profile(name,value,out_avp,out_dlg_no)`

The function looks up through the whole dialog table for dialogs configured to be within the provided dialog profile name, and optionally with the provided profile value. The function returns all the $DLG\_ctx\_json variables for the matched dialogs, storing them in the provided out\_avp. The total number of matched dialogs is returned in the out\_dlgs\_no variable

NOTE: the function does not require to be called in the context of a dialog - you can use it whenever / whereever for searching for other dialogs.

Meaning of the parameters is as follows:

*   _name (string)_ - the name of the dialog profile used for the lookup
    
*   _value (string)_ - the value of the above dialog profile ( optional )
    
*   _out\_avp (var)_ - the AVP which will be populated will the dialog JSONs for all the matched calls
    
*   _dlg\_no (var)_ - the out var which will contain the total number of matched dialogs
    

This function can be used from any type of route.

**Example�1.61.�`get_dialog_vals` usage**

...
if ( get\_dialogs\_by\_profile("caller",$fU,$avp(dlg\_jsons),$avp(dlg\_no)) ) {
	xlog("Caller $fU has $avp(dlg\_no) other calls \\n);
	$var(i) = 0;
	while ( $(avp(dlg\_jsons)\[$var(i)\])!=NULL ) {
		$json(dlg\_info) := $(avp(dlg\_jsons)\[$var(i)\]); 
		# fetch any info for the above call and process it
		$var(i) = $var(i) + 1;
	}
}
...

  

### 1.7.9.� `load_dialog_ctx( dialog [, id_type])`

The function loads and switches to the context of the given dialog. The context of a dialog is given by the dialog flags, variables, profiles and any other value/state related to the dialog. By switching to the context of another dialog, you will see at the script level, by default, all the data from the new dialog.

NOTE: you cannot perform a new load until doing an unload - no nested loadings are possible.

Meaning of the parameters is as follows:

*   _dialog (string)_ - the identifier of the dialog to be loaded, it may be a SIP Call-ID or a Dialog ID.
    
*   _id\_type (string,optional)_ - what kind of dialog identified was used in the first parameter. It can be _callid_ (SIP Call-ID) or _did_ (internal Dialog ID). By default callid will be assumed.
    

This function can be used from any type of route.

**Example�1.62.�`load_dialog_ctx` usage**

...
if (load\_dialog\_ctx("$var(callid)")) {
	xlog("The dialog '$var(callid)' already has a duration "
	     "of $DLG\_lifetime seconds\\n");
	if (is\_in\_profile("inboundCall"))
		xlog("this dialog is an inbound call\\n");
	unload\_dialog\_ctx();
}
...

  

### 1.7.10.� `unload_dialog_ctx()`

The function off-loads the loaded context of another dialog, exposing whatever dialog context was present before doing the load.

NOTE: you MUST perform from script an explicit unload for each load you did, otherwise the loaded dialog will remain hanged for ever.

This function can be used from any type of route.

For usage example, see the [load\_dialog\_ctx()](#func_load_dialog_ctx "1.7.9.� load_dialog_ctx( dialog [, id_type])")

### 1.7.11.� `set_dlg_profile(profile, [value], [clear_values])`

Inserts the current dialog into a profile. Note that if the profile does not support values, this will be silently discarded. A dialog may be inserted in the same profile multiple times.

NOTE: the dialog must be created before using this function (use create\_dialog() function before).

Meaning of the parameters is as follows:

*   _profile (string)_ - name of the profile to be added to.
    
*   _value (string, optional)_ - string value to define the belonging of the dialog to the profile - note that the profile must support values.
    
*   _clear\_values (boolean, optional)_ - if set to _true_ (1), all values of the profile will be cleared before setting the given value. Default: _false_.
    

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE, REPLY\_ROUTE and FAILURE\_ROUTE.

**Example�1.63.�`set_dlg_profile` usage**

...
set\_dlg\_profile("inboundCall");

# Set a new value (all other values are kept intact)
set\_dlg\_profile("caller", $fu);

# Set a new value while removing all previous values
set\_dlg\_profile("caller", $fu, true);
...

  

### 1.7.12.� `unset_dlg_profile(profile, [value])`

Removes the current dialog from a profile.

NOTE: the dialog must be created before using this function (use create\_dialog() function before).

Meaning of the parameters is as follows:

*   _profile (string)_ - name of the profile to be removed from.
    
*   _value (string, optional)_ - string value to define the belonging of the dialog to the profile - note that the profile must support values.
    
    NEW in 3.4: for profiles with value, by omitting this parameter you can now clear all values of the given profile.
    

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE, REPLY\_ROUTE and FAILURE\_ROUTE.

**Example�1.64.�`unset_dlg_profile` usage**

...
unset\_dlg\_profile("inboundCall");
unset\_dlg\_profile("caller", $fu);
...
# Remove all values in a profile
unset\_dlg\_profile("caller");
...

  

### 1.7.13.� `is_in_profile(profile,[value])`

Checks if the current dialog belongs to a profile. If the profile supports values, the check can be reinforced to take into account a specific value - if the dialog was inserted into the profile for a specific value. If no value is passed, only simply belonging of the dialog to the profile is checked. Note that if the profile does not support values, this will be silently discarded.

NOTE: the dialog must be created before using this function (use create\_dialog() function before).

Meaning of the parameters is as follows:

*   _profile (string)_ - name of the profile to be checked against.
    
*   _value (string. optional)_ - string value to toughen the check.
    

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE, REPLY\_ROUTE and FAILURE\_ROUTE.

**Example�1.65.�`is_in_profile` usage**

...
if (is\_in\_profile("inboundCall")) {
	log("this request belongs to a inbound call\\n");
}
...
if (is\_in\_profile("caller","XX")) {
	log("this request belongs to a call of user XX\\n");
}
...

  

### 1.7.14.� `get_profile_size(profile,[value],size)`

Returns the number of dialogs belonging to a profile. If the profile supports values, the check can be reinforced to take into account a specific value - how many dialogs were inserted into the profile with a specific value. If not value is passed, only simply belonging of the dialog to the profile is checked. Note that the profile does not supports values, this will be silently discarded.

Meaning of the parameters is as follows:

*   _profile (string)_ - name of the profile to get the size for.
    
*   _value (string, optional)_ - string value to toughen the check.
    
*   _size (var)_ - an AVP or script variable to return the profile size in.
    

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE, REPLY\_ROUTE and FAILURE\_ROUTE.

**Example�1.66.�`get_profile_size` usage**

modparam("dialog", "profiles\_no\_value", "inboundCalls")
modparam("dialog", "profiles\_with\_value", "caller")
...
get\_profile\_size("inboundCalls",,$var(size));
xlog("inboundCalls: $var(size)\\n");
...
get\_profile\_size("caller", $fu, $var(size));
xlog("currently, the user $fu has $var(size) active outgoing calls\\n");
...

  

### 1.7.15.� `set_dlg_flag(flag)`

Sets the dialog flag named _flag_ to true. The dialog flags are dialog persistent and they can be accessed (set and test) for all requests belonging to the dialog.

Parameters:

*   _flag (string, static)_ - The flag name.
    

NOTE: the dialog must be created before using this function (use create\_dialog() function before).

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE, REPLY\_ROUTE and FAILURE\_ROUTE.

**Example�1.67.�`set_dlg_flag` usage**

...
set\_dlg\_flag("MY\_DLG\_FLAG");
...

  

### 1.7.16.� `test_and_set_dlg_flag(flag, value)`

Atomically checks if the dialog flag named _flag_ is equal to _value_. If true, changes the value with the opposite one. This operation is done under the dialog lock.

*   _flag (string, static)_ - The flag name.
    
*   _value (int)_ - The value should be 0 (false) or 1 (true).
    

NOTE: the dialog must be created before using this function (use create\_dialog() function before).

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE, REPLY\_ROUTE and FAILURE\_ROUTE.

**Example�1.68.�`test_and_set_dlg_flag` usage**

...
test\_and\_set\_dlg\_flag("MY\_DLG\_FLAG", 0);
...

  

### 1.7.17.� `reset_dlg_flag(flag)`

Resets the dialog flag named _flag_ to false. The dialog flags are dialog persistent and they can be accessed (set and test) for all requests belonging to the dialog.

Parameters:

*   _flag (string, static)_ - The flag name.
    

NOTE: the dialog must be created before using this function (use create\_dialog() function before).

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE, REPLY\_ROUTE and FAILURE\_ROUTE.

**Example�1.69.�`reset_dlg_flag` usage**

...
reset\_dlg\_flag("MY\_DLG\_FLAG");
...

  

### 1.7.18.� `is_dlg_flag_set(flag)`

Returns true if the dialog flag named _flag_ is set. The dialog flags are dialog persistent and they can be accessed (set and test) for all requests belonging to the dialog.

Parameters:

*   _flag (string, static)_ - The flag name.
    

NOTE: the dialog must be created before using this function (use create\_dialog() function before).

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE, REPLY\_ROUTE and FAILURE\_ROUTE.

**Example�1.70.�`is_dlg_flag_set` usage**

...
if (is\_dlg\_flag\_set("MY\_DLG\_FLAG")) {
	xlog("dialog flag MY\_DLG\_FLAG is set\\n");
}
...

  

### 1.7.19.� `store_dlg_value(name,val)`

Attaches to the dialog the value from the variable _val_ under the name _name_. The values attached to dialogs are dialog persistent and they can be accessed (read and write) for all requests belonging to the dialog.

Parameters:

*   _name (string)_
    
*   _val (var)_
    

NOTE: the dialog must be created before using this function (use create\_dialog() function before).

Same functionality may be obtain by assigning a value to pseudo variable _$dlg\_val(name)_.

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE, REPLY\_ROUTE and FAILURE\_ROUTE.

**Example�1.71.�`store_dlg_value` usage**

...
store\_dlg\_value("inv\_src\_ip",$si);
store\_dlg\_value("account type",$var(account));
# or
$dlg\_val(account\_type) = "prepaid";
...

  

### 1.7.20.� `fetch_dlg_value(name,val)`

Fetches from the dialog the value of attribute named _name_. The values attached to dialogs are dialog persistent and they can be accessed (read and write) for all requests belonging to the dialog.

Parameters:

*   _name (string)_
    
*   _val (var)_
    

NOTE: the dialog must be created before using this function (use create\_dialog() function before).

Same functionality may be obtain by reading the pseudo variable _$dlg\_val(name)_.

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE, REPLY\_ROUTE and FAILURE\_ROUTE.

**Example�1.72.�`fetch_dlg_value` usage**

...
fetch\_dlg\_value("inv\_src\_ip",$avp(2));
fetch\_dlg\_value("account type",$var(account));
# or
$var(account) = $dlg\_val(account\_type);
...

  

### 1.7.21.� `set_dlg_sharing_tag(tag_name)`

Marks the current dialog with the sharing tag _tag\_name_. From this point on, actions like in-dialog pinging, BYEs on timeout etc. will depend on the tag state(no action in "backup" state, normal operation in "active" state).

For more details see the [Dialog clustering](#dialog-clustering "1.4.�Dialog clustering") chapter.

Parameters:

*   _tag\_name (string)_
    

NOTE: the dialog must be created before using this function (use create\_dialog() function before).

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE, REPLY\_ROUTE and FAILURE\_ROUTE.

**Example�1.73.�`set_dlg_sharing_tag` usage**

...
set\_dlg\_sharing\_tag("vip1");
...

  

### 1.7.22.� `dlg_on_answer([route_name])`

The function arms a script route to be executed when the current dialog will be later answered. When the route will be executed, the dialog context will be exposed, but with no valid SIP message (just a phony one).

You must use this function AFTER creating the dialog and before the dialog being answered.

If the parameter is missing, the function does a reset of any route previously set; there will be no triggering.

Parameters:

*   _route\_name (string,optional)_ - the name of the script route to be executed.
    

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE, REPLY\_ROUTE and FAILURE\_ROUTE.

**Example�1.74.�`dlg_on_answer` usage**

...
create\_dialog();
dlg\_on\_answer("dlg\_answered");
...
route\[dlg\_answered\] {
	xlog("The dialog $DLG\_did was answered\\n");
}

  

### 1.7.23.� `dlg_on_timeout([route_name])`

The function arms a script route to be executed when (and if) the current dialog will timeout (as duration). When the route will be executed, the dialog context will be exposed, but with no valid SIP message (just a phony one)

When the route is executed, the dialog is not yet terminated, just its lifetime reached the set limit. In the timeout route you can increase the dialog expiration timeout (and the dialog will continue) or you can let the dialog to be terminated (after the end of this route).

You must use this function AFTER creating the dialog and before the dialog being answered.

You must use this function AFTER creating the dialog and before the dialog being answered.

Parameters:

*   _route\_name (string,optional)_ - the name of the script route to be executed.
    

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE, REPLY\_ROUTE and FAILURE\_ROUTE.

**Example�1.75.�`dlg_on_timeout` usage**

...
create\_dialog();
$DLG\_timeout=120;
dlg\_on\_timeout("dlg\_timeout");
...
route\[dlg\_timeout\] {
	xlog("The dialog $DLG\_did timed out\\n");
	if (\_some\_prolongation\_condition)
		$DLG\_timeout = 60; # give it 1 min more
}

  

### 1.7.24.� `dlg_on_hangup([route_name])`

The function arms a script route to be executed when the current dialog will be terminated. When the route will be executed, the dialog context will be exposed, but with no valid SIP message (just a phony one). Note that the dialog will be already terminated and there is nothing you can do about it besides reading data from its context.

You must use this function AFTER creating the dialog and before the dialog being answered.

If the parameter is missing, the function does a reset of any route previously set; there will be no triggering.

Parameters:

*   _route\_name (string,optional)_ - the name of the script route to be executed.
    

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE, REPLY\_ROUTE and FAILURE\_ROUTE.

**Example�1.76.�`dlg_on_hangup` usage**

...
create\_dialog();
dlg\_on\_hangup("dlg\_hangup");
...
route\[dlg\_hangup\] {
	xlog("The dialog $DLG\_did terminated after $DLG\_lifetime secs\\n");
}

  

### 1.7.25.� `dlg_send_sequential(method, leg, [, body] [, content-type] [, headers])`

Used to send an in-dialog request towards one if the dialog's legs. The function assumes that is runs inside a dialog context - if you are running it from a different context (such as an event\_route), make sure you first load the dialog context using the [load\_dialog\_ctx()](#func_load_dialog_ctx "1.7.9.� load_dialog_ctx( dialog [, id_type])") function.

Parameters:

*   _method (string)_ - the method of the request sent.
    
*   _leg (string)_ - the leg where the request is sent. Must be either _caller_ or _callee_.
    
*   _body (string, optional)_ - an optional body sent in the request. If missing, no body is sent.
    
*   _content-type (string, optional)_ - the content type of the body sent. Make sure you specify this every time you send a request with a body, otherwise there are high changes that your UAC will reject the request.
    
*   _headers (string, optional)_ - additional headers attached to the request sent.
    

This function can be used from ANY route.

**Example�1.77.�`dlg_send_sequential` usage to convert DTMF codes**

...
event\_route\[E\_RTPPROXY\_DTMF\] {
    if (load\_dialog\_ctx("$param(id)", "did")) {
        if ($param(stream) == 0) {
            $var(direction) = "callee";
        } else {
            $var(direction) = "caller";
        }
        dlg\_send\_sequential($var(direction), "INFO",
                "Signal=$param(digit)\\nDuration=160",
                "application/dtmf-relay");
        unload\_dialog\_ctx();
    }
}
...

  

### 1.7.26.� `dlg_inc_cseq([tag, ][inc])`

Increments the dialog's generated CSeq associated to the leg identified by the dialog's tag.

Parameters:

*   _tag (string, optional)_ - the tag to increment the CSeq value for. If missing, the message's _To_ tag is used to identify the leg to increment the CSeq for.
    
*   _inc (integer, optional)_ - the value used to increment/decrement (if negative) the CSeq of the identified leg. If not used, the value is incremented with _1_.
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, ONREPLY\_ROUTE, BRANCH\_ROUTE and LOCAL\_ROUTE routes.

**Example�1.78.�`dlg_inc_cseq` usage**

...
route {
	...
	if (has\_totag()) {
		if (loose\_route())
			dlg\_inc\_cseq(); # increment upstream CSeq after each in-dialog request
	}
}
...