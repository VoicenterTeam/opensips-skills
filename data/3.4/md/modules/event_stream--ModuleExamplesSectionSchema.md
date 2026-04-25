## 1.6.�Examples

**Example�1.4.�Stream socket**

	# calls the 'block\_ip' method
	tcp:127.0.0.1:8080/block\_ip

	# calls the 'E\_PIKE\_BLOCKED' method, if subscribed to the E\_PIKE\_BLOCKED event
	tcp:127.0.0.1:8080

  

### 1.6.2.�JSON-RPC notification

This is an example of an event raised when _reliable\_mode_ is disabled by the pike module when it decides an ip should be blocked:

**Example�1.5.�E\_PIKE\_BLOCKED JSON-RPC notification**

{
	"jsonrpc": "2.0",
	"method": "E\_PIKE\_BLOCKED",
	"params": {
		"ip": "192.168.2.11"
	}
}

  

### 1.6.3.�JSON-RPC Request

This is an example of an event raised in _reliable\_mode_ by the pike module when it decides an ip should be blocked:

**Example�1.6.�E\_PIKE\_BLOCKED JSON-RPC request (reliable\_mode)**

\# request
{
	"id": 915243442,
	"jsonrpc": "2.0",
	"method": "E\_PIKE\_BLOCKED",
	"params": {
		"ip": "192.168.2.11"
	}
}

# reply
{
	"jsonrpc": "2.0",
	"result": 8,
	"id": 915243442
}

  

### 1.6.4.�JSON-RPC Notification with Event's name

when having the _event\_param_ set to _opensips\_event_, the event raised by the pike module will look like the following:

**Example�1.7.�E\_PIKE\_BLOCKED notification with event name**

\# module configuration
modparam("event\_stream", "event\_param", "opensips\_event")

# Stream socket: tcp:HOST:PORT/handle\_cmd

# JSON-RPC command sent
{
	"jsonrpc": "2.0",
	"method": "handle\_cmd",
	"params": {
		"opensips\_event": "E\_PIKE\_BLOCKED"
		"ip": "192.168.2.11"
	}
}

  

### 1.6.5.�Custom JSON-RPC Notification from script

This example contains a snippet to send a custom event from the script using the _event\_stream_ module.

Note that we are only populating values for the event, we are not assinging names to those values. Therefore, the parameters will be sent as an array.

**Example�1.8.�E\_PIKE\_BLOCKED event**

startup\_route {
	subscribe\_event("E\_MY\_EVENT", "tcp:127.0.0.1:8080");
}

route {
	...
	$avp(attr-val) = 3;
	$avp(attr-val) = 5;
	raise\_event("E\_MY\_EVENT", $avp(attr-val));
	...
}

# JSON-RPC command sent
{
	"jsonrpc": "2.0",
	"method": "E\_MY\_EVENT",
	"params": \[3, 5\]
}