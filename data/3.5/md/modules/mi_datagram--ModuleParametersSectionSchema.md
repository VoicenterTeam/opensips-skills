## 1.4.�Exported Parameters

### 1.4.1.�`socket_name` (string)

The name of a UNIX SOCKET or an IP address. The UNIX datagram or UDP socket will be created using this parameter in order to read the external commands. Both IPv4 and IPv6 are supported.

_Default value is NONE._

**Example�1.1.�Set `socket_name` parameter**

...
modparam("mi\_datagram", "socket\_name", "/tmp/opensips.sock")
...
modparam("mi\_datagram", "socket\_name", "udp:192.168.2.133:8080")
...

  

### 1.4.2.�`children_count` (string)

The number of child processes to be created. Each child process will be a datagram server.

_Default value is 1._

**Example�1.2.�Set `children_count` parameter**

...
modparam("mi\_datagram", "children\_count", 3)
...

  

### 1.4.3.�`unix_socket_mode` (integer)

Permission to be used for creating the listening UNIX datagram socket. Not necessary for a UDP socket. It follows the UNIX conventions.

_Default value is 0660 (rw-rw----)._

**Example�1.3.�Set `unix_socket_mode` parameter**

...
modparam("mi\_datagram", "unix\_socket\_mode", 0600)
...

  

### 1.4.4.�`unix_socket_group` (integer) `unix_socket_group` (string)

Group to be used for creating the listening UNIX socket.

_Default value is the inherited one._

**Example�1.4.�Set `unix_socket_group` parameter**

...
modparam("mi\_datagram", "unix\_socket\_group", 0)
modparam("mi\_datagram", "unix\_socket\_group", "root")
...

  

### 1.4.5.�`unix_socket_user` (integer) `unix_socket_group` (string)

User to be used for creating the listening UNIX socket.

_Default value is the inherited one._

**Example�1.5.�Set `unix_socket_user` parameter**

...
modparam("mi\_datagram", "unix\_socket\_user", 0)
modparam("mi\_datagram", "unix\_socket\_user", "root")
...

  

### 1.4.6.�`socket_timeout` (integer)

The reply will expire after trying to sent it for socket\_timeout milliseconds.

_Default value is 2000._

**Example�1.6.�Set `socket_timeout` parameter**

...
modparam("mi\_datagram", "socket\_timeout", 2000)
...

  

### 1.4.7.�`trace_destination` (string)

Trace destination as defined in the tracing module. Currently the only tracing module is **proto\_hep**. This is where traced mi messages will go.

**WARNING:** A tracing module must be loaded in order for this parameter to work. (for example **proto\_hep**).

_Default value is none(not defined)._

**Example�1.7.�Set `trace_destination` parameter**

...
modparam("proto\_hep", "trace\_destination", "\[hep\_dest\]10.0.0.2;transport=tcp;version=3")

modparam("mi\_datagram", "trace\_destination", "hep\_dest")
...

  

### 1.4.8.�`trace_bwlist` (string)

Filter traced mi commands based on a blacklist or a whitelist. **trace\_destination** must be defined for this parameter to have any purpose. Whitelists can be defined using 'w' or 'W', blacklists using 'b' or 'B'. The type is separate by the actual blacklist by ':'. The mi commands in the list must be separated by ','.

Defining a blacklists means all the commands that are not blacklisted will be traced. Defining a whitelist means all the commands that are not whitelisted will not be traced. **WARNING:** One can't define both a whitelist and a blacklist. Only one of them is allowed. Defining the parameter a second time will just overwrite the first one.

**WARNING:** A tracing module must be loaded in order for this parameter to work. (for example **proto\_hep)**.

_Default value is none(not defined)._

**Example�1.8.�Set `trace_destination` parameter**

...
## blacklist ps and which mi commands
## all the other commands shall be traced
modparam("mi\_datagram", "trace\_bwlist", "b: ps, which")
...
## allow only sip\_trace mi command
## all the other commands will not be traced
modparam("mi\_datagram", "trace\_bwlist", "w: sip\_trace")
...

  

### 1.4.9.�`pretty_printing` (int)

Indicates whether the JSONRPC responses sent through MI should be pretty-printed or not.

_Default value is “0 - no pretty-printing”._

**Example�1.9.�Set `pretty_printing` parameter**

...
modparam("mi\_fifo", "pretty\_printing", 1)
...