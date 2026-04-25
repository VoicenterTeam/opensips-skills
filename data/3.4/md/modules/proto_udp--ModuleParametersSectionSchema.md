## 1.3.�Exported Parameters

### 1.3.1.�`udp_port` (integer)

The default port to be used for all UDP related operation. Be careful as the default port impacts both the SIP listening part (if no port is defined in the UDP listeners) and the SIP sending part (if the destination URI has no explicit port).

If you want to change only the listening port for UDP, use the port option in the SIP listener defintion.

_Default value is 5060._

**Example�1.1.�Set `udp_port` parameter**

...
modparam("proto\_udp", "udp\_port", 5070)
...