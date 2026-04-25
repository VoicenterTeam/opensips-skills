## 1.3.�Exported Parameters

### 1.3.1.�`connect_timeout` (integer)

The amount of milliseconds OpenSIPS waits to connect to the the JSON-RPC server, until it times out.

_Default value is “500 milliseconds”._

**Example�1.1.�Set `connect_timeout` parameter**

...
modparam("jsonrpc", "connect\_timeout", 200)
...

  

### 1.3.2.�`write_timeout` (integer)

The amount of milliseconds OpenSIPS waits to send a RPC command to the JSON-RPC server, until it times out.

_Default value is “500 milliseconds”._

**Example�1.2.�Set `write_timeout` parameter**

...
modparam("jsonrpc", "write\_timeout", 300)
...

  

### 1.3.3.�`read_timeout` (integer)

The amount of milliseconds OpenSIPS waits for the JSON-RPC server to respond to a JSON-RPC request, until it times out. Note that these parameter only affects the _jsonrpc\_request_ command.

_Default value is “500 milliseconds”._

**Example�1.3.�Set `read_timeout` parameter**

...
modparam("jsonrpc", "read\_timeout", 300)
...