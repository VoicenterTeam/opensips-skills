## 1.3.�Exported Parameters

### 1.3.1.�`backend` (string)

The mode you are using the module; it can be either component or server.

_Default value is "component"._

**Example�1.1.�Set `backend` parameter**

...
 modparam("xmpp", "backend", "server")
...

  

### 1.3.2.�`xmpp_domain` (string)

The xmpp domain of the component or the server, depending on the mode we are in.

_Default value is "127.0.0.1"._

**Example�1.2.�Set `xmpp_domain` parameter**

...
 modparam("xmpp", "xmpp\_domain", "xmpp.opensips.org")
...

  

### 1.3.3.�`xmpp_host` (string)

The ip address or the name of the local jabber server, if the backend is set to "component"; or the address to bind to in the server mode.

_Default value is "127.0.0.1"._

**Example�1.3.�Set `xmpp_host` parameter**

...
 modparam("xmpp", "xmpp\_host", "xmpp.opensips.org")
...

  

### 1.3.4.�`sip_domain` (string)

This parameter must be set only if the xmpp module is used in component mode and the domain that is the host for the jabber server is the same as the domain of the sip server(when using the same domain name for the SIP service and for the XMPP service). In this case, if we were to add buddies in xmpp accounts with that domain, then all the messages that will reach the jabber server will be considered to be for local xmpp users. It is necessary therefore to make a translate the sip domain name into another domain when sending messages in xmpp. This parameter is exactly the name that should be used as the SIP domain name in XMPP. Usage example: If the sip and xmpp domain is opensips.org and this parameter is set to sip.opensips.org, than in all the requests sent in xmpp the sip users will have the domain translated to sip.opensips.org. Also, in XMPP account the SIP buddies must have this domain: sip.opensips.org, and it will be translated to the real one opensips.org when traversing the gateway.

_Default value is NULL._

**Example�1.4.�Set `xmpp_host` parameter**

...
 modparam("xmpp", "sip\_domain", "sip.opensips.org")
...

  

### 1.3.5.�`xmpp_port` (integer)

In the component mode, this is the port of the jabber router we connect to. In the server mode, it is the transport address to bind to.

_Default value is "5347", if backend is set to "component" and "5269", if backend is set to "server"._

**Example�1.5.�Set `xmpp_port` parameter**

...
 modparam("xmpp", "xmpp\_port", 5269)
...

  

### 1.3.6.�`xmpp_password` (string)

The password of the local jabber server.

_Default value is "secret"; if changed here, it must also be changed in the c2s.xml, added by the jabber server. This is how the default configuration for the jabberd2 looks like:_

			<router>
	............... 
	<!-- Username/password to authenticate as --&gt;
    <user>jabberd</user>;          <!-- default: jabberd -->;
    <pass>secret</pass>;           <!-- default: secret -->;	
			

**Example�1.6.�Set `xmpp_password` parameter**

...
 modparam("xmpp", "xmpp\_password", "secret")
...

  

### 1.3.7.�`outbound_proxy` (string)

The SIP address used as next hop when sending the message. Very useful when using OpenSIPS with a domain name not in DNS, or when using a separate OpenSIPS instance for xmpp processing. If not set, the message will be sent to the address in destination URI.

_Default value is NULL._

**Example�1.7.�Set `outbound_proxy` parameter**

...
 modparam("xmpp", "outbound\_proxy", "sip:opensips.org;transport=tcp")
...