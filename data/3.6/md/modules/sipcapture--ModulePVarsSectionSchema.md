## 1.6.�Exported Pseudo-Variables

### 1.6.1.� `$hep_net`

Holds layer 3 and 4 information(IP addresses and ports) about the node from where the hep message was received. The variable is read-only and can be used only if it's referenced by it's name.

Possible values for it's name are the following:

*   _proto\_family_ - can be AF\_INET/AF\_INET6
    
*   _proto\_id_ - it's PROTO\_HEP since you receive the message as hep.
    
*   _src\_ip_ - IPv4/IPv6 address, depending on the proto\_family, of the sending node.
    
*   _dst\_ip_ - IPv4/IPv6 address, depending on the proto\_family, of the receiving node(OpenSIPS hep interface ip on which the message was received).
    
*   _src\_port_ - Sending node port.
    
*   _dst\_port_ - Receiving port(OpenSIPS hep interace port on which the message was received).
    

**Example�1.24.�`hep_net` usage**

...
	/\* received this hep packet on interface 192.168.2.5\*/
	if ($hep\_net(dst\_ip) == "192.168.2.5") {
		/\* received this on 192.168.2.5:6060 interface \*/
		if ($hep\_net(dst\_port) == 6060) {
			...
		/\* received this on 192.168.2.5:6061 interface \*/
		} else if ($hep\_net(dst\_port) == 6061) {
			...
		}
	}
...
	

  

### 1.6.2.� `HEPVERSION (string, int)`

Holds the version of the hep packet received on the interface.

**Example�1.25.�`HEPVERSION` usage**

...
	if ($HEPVERSION == 3) {
		/\* It's a HEPv3 packet\*/
		...
	} else if ($HEPVERSION == 2) {
		/\* It's a HEPv2 packet \*/
		...
	} else if ($HEPVERSION == 1) {
		/\* It's a HEPv1 packet \*/
		...
	}
...