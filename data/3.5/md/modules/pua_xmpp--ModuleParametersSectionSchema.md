## 1.3.�Exported Parameters

### 1.3.1.�`server_address`(str)

The IP address of the server.

**Example�1.1.�Set `server_address` parameter**

...
modparam("pua\_xmpp", "server\_address", "sip:sa@opensips.org:5060")
...

  

### 1.3.2.�`presence_server` (str)

The the address of the presence server. If set, it will be used as outbound proxy when sending PUBLISH requests.

**Example�1.2.�Set `presence_server` parameter**

...
modparam("pua\_xmpp", "presence\_server", "sip:pa@opensips.org:5075")
...