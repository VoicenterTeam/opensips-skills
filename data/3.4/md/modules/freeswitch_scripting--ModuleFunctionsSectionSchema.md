## 1.4.�Exported Functions

### 1.4.1.� `freeswitch_esl(command, freeswitch_url[, response_var])`

Run an arbitrary command on an arbitrary FreeSWITCH ESL socket. The socket need not necessarily be defined in the database or through **[fs\_subscribe](#param_fs_subscribe "1.3.8.�fs_subscribe (string)")**. However, if this is the case, then the "password" part of the URL becomes mandatory.

The current OpenSIPS worker will block until an answer from FreeSWITCH arrives. The timeout for this operation can be controlled via the **esl\_cmd\_timeout** parameter of the freeswitch connection manager module.

Meaning of the parameters is as follows:

*   _command_ (string) - the ESL command string to execute.
    
*   _freeswitch\_url_ (string) - the ESL interface to connect to. The syntax is: \[fs://\]\[\[username\]:password@\]host\[:port\]\[?event1\[,event2\]...\]. The "?events" part of the URL will be silently discarded.
    
*   _response\_var (var, optional)_ - a variable which will hold the text result of the ESL command.
    

**Return value**

*   1 (success) - the ESL command executed successfully and any output variables were successfully written to. Note that this does not say anything about the nature of the ESL answer (it may well be a "-ERR" type of response)
    
*   \-1 (failure) - internal error or the ESL command failed to execute
    

This function can be used from any route.

**Example�1.9.� `_freeswitch_esl()_` usage**

...
	# ESL socket 10.0.0.10 is defined in the database (password "ClueCon")
	$var(rc) = freeswitch\_esl("bgapi originate {origination\_uuid=123456789}user/1010 9386\\njob-uuid: foobar", "10.0.0.10", "$var(response)");
	if ($var(rc) < 0) {
		xlog("failed to execute ESL command ($var(rc))\\n");
		return -1;
	}
...
	# ESL socket 10.0.0.10 is new, we must specify a password
	$var(rc) = freeswitch\_esl("bgapi originate {origination\_uuid=123456789}user/1010 9386\\njob-uuid: foobar", ":ClueCon@10.0.0.10", $var(response));
	if ($var(rc) < 0) {
		xlog("failed to execute ESL command ($var(rc))\\n");
		return -1;
	}
...