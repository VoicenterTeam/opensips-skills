## 1.4.�Exported Functions

### 1.4.1.� `janus_send_requeest(janus_id, janus_command[, response_var])`

Run an arbitrary command on an arbitrary Janus socket. The janus\_id must be defined in the database

The current OpenSIPS worker will block until an answer from Janus arrives. The timeout for this operation can be controlled via the **janus\_cmd\_timeout** param.

Meaning of the parameters is as follows:

*   _janus\_id_ (string) - the ID of the janus connection as defined in the databsae.
    
*   _janus\_command_ (string) - the JANUS command to run.
    
*   _response\_var (var, optional)_ - a variable which will hold the text result of the Janus command.
    

**Return value**

*   1 (success) - the Janus command executed successfully and any output variables were successfully written to. Note that this does not say anything about the nature of the Janus answer (it may well be a "-ERR" type of response)
    
*   \-1 (failure) - internal error or the Janus command failed to execute
    

This function can be used from any route.

**Example�1.8.� `_janus_send_request()_` usage**

...
# if the DB contains: 
#       id: 1
# janus\_id: test\_janus
# janus\_url: janusws://my\_janus\_host:80/janus?room=abcd

	$var(rc) = janus\_send\_request("test\_janus", "{
  "janus": "attach",
  "plugin": "janus.plugin.videoroom",
  "transaction": "abcdef123456",
  "session\_id": 987654321
}", $var(response));
	if (!$var(rc)) {
		xlog("failed to execute Janus command ($var(rc))\\n");
		return -1;
	}
	xlog("Janus response is $var(response) \\n");
...
...

  

### 1.4.2.�Exported Events

#### 1.4.2.1.� `E_JANUS_EVENT`

This event is raised when a notification is received from a Janus server.

Parameters represent the janus\_id and the janus\_url that originated the notification, and the full janus\_body of the event received

*   _janus\_id_ - the janus id as defined in the database
    
*   _janus\_url_ - the janus url as defined in the database
    
*   _janus\_body_ - full body of the notification received from janus
    

**Example�1.9.� `_E_JANUS_EVENT_` example**

...
# if the DB contains: 
#       id: 1
# janus\_id: test\_janus
# janus\_url: janusws://my\_janus\_host:80/janus?room=abcd

event\_route\[E\_JANUS\_EVENT\] {
	xlog("Received janus event from $param(janus\_id) - $param(janus\_url) - $param(janus\_body) \\n");
	$json(janus\_body) := $param(janus\_body);
	$avp(janus\_sender) =  $json(janus\_body/sender);
	if ($avp(janus\_sender) != NULL) {
		xlog("Received event from sender $avp(janus\_sender) \\n");
	}
}
...
...