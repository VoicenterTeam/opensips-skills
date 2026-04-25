## 1.4.�Exported Parameters

### 1.4.1.�`append_fromtag` (integer)

If turned on, request's from-tag is appended to record-route; that's useful for understanding whether subsequent requests (such as BYE) come from caller (route's from-tag==BYE's from-tag) or callee (route's from-tag==BYE's to-tag)

_Default value is 1 (yes)._

**Example�1.2.�Set `append_fromtag` parameter**

...
modparam("rr", "append\_fromtag", 0)
...

  

### 1.4.2.�`enable_double_rr` (integer)

There are some situations when the server needs to insert two Record-Route header fields instead of one. For example when using two disconnected networks or doing cross-protocol forwarding from UDP->TCP. This parameter enables inserting of 2 Record-Routes. The server will later remove both of them.

_Default value is 1 (yes)._

**Example�1.3.�Set `enable_double_rr` parameter**

...
modparam("rr", "enable\_double\_rr", 0)
...

  

### 1.4.3.�`add_username` (integer)

If set to a non 0 value (which means yes), the username part will be also added in the Record-Route URI.

_Default value is 0 (no)._

**Example�1.4.�Set `add_username` parameter**

...
modparam("rr", "add\_username", 1)
...

  

### 1.4.4.�`enable_socket_mismatch_warning` (integer)

When a preset record-route header is forced in OpenSIPS config and the host from the record-route header is not the same as the host server, a warning will be printed out in the logs. The 'enable\_socket\_mismatch\_warning' parameter enables or disables the warning. When OpenSIPS is behind a NATed firewall, we don't want this warning to be printed for every bridged call.

_Default value is 1 (yes)._

**Example�1.5.�`enable_socket_mismatch_warning` usage**

...
modparam("rr", "enable\_socket\_mismatch\_warning", 0)
...