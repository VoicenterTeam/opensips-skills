## 1.3.�Exported Parameters

### 1.3.1.�`sctp_port` (integer)

The default port to be used for all SCTP related operation. Be careful as the default port impacts both the SIP listening part (if no port is defined in the SCTP listeners) and the SIP sending part (if the destination SCTP URI has no explicit port).

If you want to change only the listening port for STP, use the port option in the SIP listener defintion.

_Default value is 5060._

**Example�1.1.�Set `sctp_port` parameter**

...
modparam("proto\_sctp", "sctp\_port", 5070)
...