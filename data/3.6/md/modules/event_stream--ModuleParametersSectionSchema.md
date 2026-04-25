## 1.4.�Exported Parameters

### 1.4.1.�`reliable_mode` (integer)

This parameter controls the way the _event\_stream_ module communicates with the JSON-RPC server. If enabled, (set to _1_), each event is translated to a JSON-RPC request. If disabled, each event will be sent as a JSON-RPC notification - there will be no reply expected by our client.

Note that if you need a reliable communication with the JSON-RPC server, where each event sent needs to be confirmed (by a JSON-RPC response), you must set this parameter to _1/yes_. If you are using this module in a failover setup (using the _event\_virtual_ module), it is recommended to set this parameter to _1/yes_.

_Default value is “0 (disabled)”._

**Example�1.1.�Set `reliable_mode` parameter**

...
modparam("event\_stream", "reliable\_mode", yes)
...

  

### 1.4.2.�`timeout` (integer)

Specified the amount of milliseconds the module waits for a command to complete. In _reliable\_mode_, it specifies the time module waits the request to be sent and a reply received. In non-_reliable\_mode_, it represents only the time opensips takes to send the JSON-RPC notification.

NOTE that if the event is not using names for its parameters, the event will be the first parameter in the JSON-RPC command.

_Default value is “1000 milliseconds = 1 second”._

**Example�1.2.�Set `timeout` parameter**

...
# only wait for 200 milliseonds for a reply
modparam("event\_stream", "timeout", 200)
...

  

### 1.4.3.�`event_param` (string)

By default, the name of the event subscribed to is not send in the JSON-RPC command. If one needs to send the name of the event as well, you can use this parameter to specify the name of JSON object within the params that will contain the name of the event.

_Default value is “disabled” - event is not added._

**Example�1.3.�Set `event_param` parameter**

...
modparam("event\_stream", "event\_param", "opensips\_event")
# json resulted will contain the "opensips\_event": EVENT token
...