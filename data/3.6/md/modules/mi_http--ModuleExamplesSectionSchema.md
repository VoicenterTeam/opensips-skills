## 1.6.�Examples

This is an example showing the JSON-RPC request and reply over HTTP for the “ps” MI command.

**Example�1.4.�JSON-RPC request**

POST /mi HTTP/1.1
Accept: application/json
Content-Type: application/json
Host: example.net

{"jsonrpc":"2.0","method":"ps","id":10}

HTTP/1.1 200 OK
Content-Length: 317
Content-Type: application/json
Date: Fri, 01 Nov 2013 12:00:00 GMT

{"jsonrpc":"2.0","result":{"Processes":\[{"ID":0,"PID":9467,"Type":"attendant"},{"ID":1,"PID":9468,"Type":"HTTPD127.0.0.1:8008"},{"ID":3,"PID":9470,"Type":"time\_keeper"},{"ID":4,"PID":9471,"Type":"timer"},{"ID":5,"PID":9472,"Type":"SIPreceiverudp:127.0.0.1:5060"},{"ID":7,"PID":9483,"Type":"Timerhandler"},\]},"id":10}

  

This is an example showing the JSON-RPC request with params and reply over HTTP for the “get\_statistics” MI command.

**Example�1.5.�JSON-RPC request with params**

POST /mi HTTP/1.1
Accept: application/json
Content-Type: application/json
Host: example.net

{"jsonrpc":"2.0","method":"get\_statistics","params":\[\["dialog:","tm:"\]\],"id":10}

HTTP/1.1 200 OK
Content-Length: 317
Content-Type: application/json
Date: Fri, 01 Nov 2013 12:00:00 GMT

{"jsonrpc":"2.0","result":{"dialog:active\_dialogs":0,"dialog:early\_dialogs":0,"dialog:processed\_dialogs":2,"dialog:expired\_dialogs":0,"dialog:failed\_dialogs":2,"dialog:create\_sent":0,"dialog:update\_sent":0,"dialog:delete\_sent":0,"dialog:create\_recv":0,"dialog:update\_recv":0,"dialog:delete\_recv":0,"tm:received\_replies":49252,"tm:relayed\_replies":49220,"tm:local\_replies":370,"tm:UAS\_transactions":49584,"tm:UAC\_transactions":0,"tm:2xx\_transactions":12004,"tm:3xx\_transactions":0,"tm:4xx\_transactions":37580,"tm:5xx\_transactions":0,"tm:6xx\_transactions":0,"tm:inuse\_transactions":60},"id":10}