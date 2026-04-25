## 1.3.�Exported Parameters

### 1.3.1.�`http_root`(string)

Specifies the root path for xmlrpc requests: http://\[opensips\_IP\]:\[opensips\_httpd\_port\]/\[http\_root\]

_The default value is "RPC2"._

**Example�1.1.�Set `http_root` parameter**

...
modparam("mi\_xmlrpc\_ng", "http\_root", "opensips\_mi\_xmlrpc")
...

  

### 1.3.2.�`trace_destination` (string)

Trace destination as defined in the tracing module. Currently the only tracing module is **proto\_hep**. This is where traced mi messages will go.

**WARNING:** A tracing module must be loaded in order for this parameter to work. (for example **proto\_hep**).

_Default value is none(not defined)._

**Example�1.2.�Set `trace_destination` parameter**

...
modparam("proto\_hep", "trace\_destination", "\[hep\_dest\]10.0.0.2;transport=tcp;version=3")

modparam("mi\_xmlrpc\_ng", "trace\_destination", "hep\_dest")
...

  

### 1.3.3.�`trace_bwlist` (string)

Filter traced mi commands based on a blacklist or a whitelist. **trace\_destination** must be defined for this parameter to have any purpose. Whitelists can be defined using 'w' or 'W', blacklists using 'b' or 'B'. The type is separate by the actual blacklist by ':'. The mi commands in the list must be separated by ','.

Defining a blacklists means all the commands that are not blacklisted will be traced. Defining a whitelist means all the commands that are not whitelisted will not be traced. **WARNING:** One can't define both a whitelist and a blacklist. Only one of them is allowed. Defining the parameter a second time will just overwrite the first one.

**WARNING:** A tracing module must be loaded in order for this parameter to work. (for example **proto\_hep)**.

_Default value is none(not defined)._

**Example�1.3.�Set `trace_destination` parameter**

...
## blacklist ps and which mi commands
## all the other commands shall be traced
modparam("mi\_xmlrpc\_ng", "trace\_bwlist", "b: ps, which")
...
## allow only sip\_trace mi command
## all the other commands will not be traced
modparam("mi\_xmlrpc\_ng", "trace\_bwlist", "w: sip\_trace")
...