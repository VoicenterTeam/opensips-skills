## 1.4.�Exported Functions

### 1.4.1.� `add_path([user])`

This function adds a Path header in the form “Path: <sip:user@1.2.3.4;lr>”.

Meaning of the parameters is as follows:

*   _user_ (string, optional) - The username to be inserted as user part.
    

This function can be used from REQUEST\_ROUTE.

**Example�1.3.�`add_path(user)` usage**

...
if (!add\_path("loadbalancer")) {
	sl\_send\_reply(503, "Internal Path Error");
	...
};
...

  

### 1.4.2.� `add_path_received([user])`

This function adds a Path header in the form “Path: <sip:user@1.2.3.4;received=sip:2.3.4.5:1234;lr>”, setting 'user' as username part of address, it's own outgoing address as domain-part, and the address the request has been received from as received-parameter.

Meaning of the parameters is as follows:

*   _user_ (string, optional) - The username to be inserted as user part.
    

This function can be used from REQUEST\_ROUTE.

**Example�1.4.�`add_path_received(user)` usage**

...
if (!add\_path\_received("inbound")) {
	sl\_send\_reply(503, "Internal Path Error");
	...
};
...