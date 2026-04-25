## 1.4.�Exported Functions

### 1.4.1.� `ipsec_create([port_server], [port_client], [algos])`

Creates an IPSec SA/tunnel according to the _Security-Client_ header and the AKA information received in the 401 reply.

This function should only be called on a 401 reply for a REGISTER message.

Upon successful creation of the IPSec tunnel, it builds the _Security-Server_ header and appends it to the reply.

Meaning of the parameters is as follows:

*   _port\_server (integer, optional)_ - the server port to be used in the IPSec communication. It should be an existing IPSec port and is advertised in the _Security-Server_ header. If missing, the [default\_client\_port](#param_default_client_port "1.3.5.�default_client_port (integer)") is considered.
    
*   _port\_client (integer, optional)_ - the client port to be used in the IPSec communication. It should be an existing IPSec port and is advertised in the _Security-Server_ header. If missing, the [default\_server\_port](#param_default_server_port "1.3.6.�default_server_port (integer)") is considered.
    
*   _algos (string, optional)_ - a list of algorithms that should be used for creating this security association. It has the same format as [disable\_allowed\_algorithms](#param_allowed_algorithms "1.3.7.�allowed_algorithms (string)") and overwrites its value when used. If missing, the [disable\_allowed\_algorithms](#param_allowed_algorithms "1.3.7.�allowed_algorithms (string)") is considered.
    

This function can be used from REPLY\_ROUTE.

**Example�1.9.�`ipsec_create()` usage**

...
onreply\_route\[ipsec\] {
	if ($T\_reply\_code == 401)
		if (ipsec\_create())
}
...