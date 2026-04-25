## 1.5.�Exported Pseudo-Variables

### 1.5.1.�`$ipsec`

Populated for a request that is being received over an IPSec tunnel, it contains information about the local IPSec endpoint.

The following fields can be retrieved:

*   _ik_ - integrity key being used by the IPSec tunnel.
    
*   _ck_ - confidentiality key being used by the IPSec tunnel.
    
*   _alg_ - authentication algorithm being used.
    
*   _ealg_ - encryption algorithm being used.
    
*   _ip_ - local IP bound for this tunnel.
    
*   _spi-c_ - local SPI chosen for receiving messages through the client channel.
    
*   _spi-s_ - local SPI chosen for receiving messages through the server channel.
    
*   _port-c_ - local port chosen for communicating through the client channel.
    
*   _port-c_ - local port chosen for communicating through the server channel.
    

**Example�1.10.�`$ipsec(field)` usage**

...
xlog("Using $ipsec(ip):$ipsec(port-c) and $ipsec(ip):$ipsec(port-s) socket\\n");
...

  

### 1.5.2.�`$ipsec_ue`

Populated for a request that is being received over an IPSec tunnel, it contains information about the remote IPSec endpoint.

The following fields can be retrieved:

*   _ik_ - integrity key being used by the IPSec tunnel.
    
*   _ck_ - confidentiality key being used by the IPSec tunnel.
    
*   _alg_ - authentication algorithm being used.
    
*   _ealg_ - encryption algorithm being used.
    
*   _ip_ - remote IP of the UE that uses this tunnel.
    
*   _spi-c_ - remote SPI chosen for sending messages through the client channel.
    
*   _spi-s_ - remote SPI chosen for sending messages through the server channel.
    
*   _port-c_ - remote port chosen for communicating through the client channel.
    
*   _port-c_ - remote port chosen for communicating through the server channel.
    

**Example�1.11.�`$ipsec_ue(field)` usage**

...
xlog("Using $ipsec\_ue(ip):$ipsec\_ue(port-c) and $ipsec\_ue(ip):$ipsec\_ue(port-s) socket\\n");
...