## 1.3.�Exported Parameters

### 1.3.1.�`default_domain`(str)

The default domain for the registered users to be used when constructing the uri for the registrar callback.

_Default value is “NULL”._

**Example�1.1.�Set `default_domain` parameter**

...
modparam("pua\_bla", "default\_domain", "opensips.org")
...

  

### 1.3.2.�`header_name`(str)

The name of the header to be added to Publish requests. It will contain the uri of the user agent that sent the Notify that is transformed into Publish. It stops sending a Notification with the same information to the sender.

_Default value is “NULL”._

**Example�1.2.�Set `header_name` parameter**

...
modparam("pua\_bla", "header\_name", "Sender")
...

  

### 1.3.3.�`outbound_proxy`(str)

The outbound\_proxy uri to be used when sending Subscribe requests.

_Default value is “NULL”._

**Example�1.3.�Set `outbound_proxy` parameter**

...
modparam("pua\_bla", "outbound\_proxy", "sip:proxy@opensips.org")
...

  

### 1.3.4.�`server_address`(str)

The IP address of the server.

**Example�1.4.�Set `server_address` parameter**

...
modparam("pua\_bla", "server\_address", "sip:bla@160.34.23.12")
...

  

### 1.3.5.�`presence_server`(str)

The address of the presence server - will be used as an outbound proxy when sending PUBLISH requests. It is optional.

_Default value is “NULL”._

**Example�1.5.�Set `presence_server` parameter**

...
modparam("pua\_bla", "presence\_server", "sip:pa@opensips.org")
...