## 1.5.�Exported Parameters

### 1.5.1.�`rtpproxy_sock` (string)

Definition of socket(s) used to connect to (a set) RTPProxy. It may specify a UNIX socket, an IPv4/IPv6 UDP socket or an IPv4/IPv6 TCP socket. If the protocol part (i.e. “udp:”) is missing, the socket is treated as a UNIX socket.

The definition also supports to specify a different IP that will be advertised instead of the one returned by RTPProxy. This is useful when having multiple RTPProxy servers that are located behind NAT, and listen only on private intefaces, but need to advertise a public one.

_Default value is “NONE” (disabled)._

**Example�1.1.�Set `rtpproxy_sock` parameter**

...
# single rtpproxy with specific weight
modparam("rtpproxy", "rtpproxy\_sock", "udp:localhost:22222=2")

# single rtpproxy with advertised address + weight
modparam("rtpproxy", "rtpproxy\_sock", "udp:localhost:22222|8.8.8.8=2")

# multiple rtproxies for LB
modparam("rtpproxy", "rtpproxy\_sock",
	"udp:localhost:22222 udp:localhost:22223 tcp:remote1:33422 tcp6:remote2:32322")

# multiple sets of multiple rtproxies
modparam("rtpproxy", "rtpproxy\_sock", "1 == udp:localhost:22222 udp:localhost:22223")
modparam("rtpproxy", "rtpproxy\_sock", "2 == udp:localhost:22223")
modparam("rtpproxy", "rtpproxy\_sock", "2 == udp:localhost:22223|8.8.8.8")
...

  

### 1.5.2.�`rtpproxy_disable_tout` (integer)

Once RTPProxy was found unreachable and marked as disable, rtpproxy will not attempt to establish communication to RTPProxy for rtpproxy\_disable\_tout seconds.

_Default value is “60”._

**Example�1.2.�Set `rtpproxy_disable_tout` parameter**

...
modparam("rtpproxy", "rtpproxy\_disable\_tout", 20)
...

  

### 1.5.3.�`rtpproxy_timeout` (string)

Timeout value in waiting for reply from RTPProxy.

_Default value is “1”._

**Example�1.3.�Set `rtpproxy_timeout` parameter to 200ms**

...
modparam("rtpproxy", "rtpproxy\_timeout", "0.2")
...

  

### 1.5.4.�`rtpproxy_autobridge` (integer)

Enable auto-bridging feature. Does not properly function when doing serial/parallel forking!

_Default value is “0”._

**Example�1.4.�Enable auto-bridging feature**

...
modparam("rtpproxy", "rtpproxy\_autobridge", 1)
...

  

### 1.5.5.�`rtpproxy_retr` (integer)

How many times rtpproxy should retry to send and receive after timeout was generated.

_Default value is “5”._

**Example�1.5.�Set `rtpproxy_retr` parameter**

...
modparam("rtpproxy", "rtpproxy\_retr", 2)
...

  

### 1.5.6.�`default_set` (integer)

The parameter indicates the default RTPProxy set to be used when provisioning an engine in the config file without an explicit set, or when calling one of the _rtpproxy\_\*()_ functions without an explicit set.

_Default value is set “0”._

**Example�1.6.�Set `default_set` parameter**

...
modparam("rtpproxy", "default\_set", 1)
...

  

### 1.5.7.�`nortpproxy_str` (string)

The parameter sets the SDP attribute used by rtpproxy to mark the packet SDP informations have already been mangled.

If empty string, no marker will be added or checked.

### Note

The string must be a complete SDP line, including the EOH (\\r\\n).

_Default value is “a=nortpproxy:yes\\r\\n”._

**Example�1.7.�Set `nortpproxy_str` parameter**

...
modparam("rtpproxy", "nortpproxy\_str", "a=sdpmangled:yes\\r\\n")
...

  

### 1.5.8.�`db_url` (string)

The database url. This parameter should be set if you want to use a database table from where to load or reload definitions of socket(s) used to connect to (a set) RTPProxy. The record from the database table will be read at start up (added to the ones defined with the rtpproxy\_sock module parameter) and when the MI command rtpproxy\_reload is issued(the definitions will be replaced with the ones from the database table).

_Default value is “NULL”._

**Example�1.8.�Set `db_url` parameter**

...
modparam("rtpproxy", "db\_url", 
		"mysql://opensips:opensipsrw@192.168.2.132/opensips")
...

  

### 1.5.9.�`db_table` (string)

The name of the database table containing definitions of socket(s) used to connect to (a set) RTPProxy.

_Default value is “rtpproxy\_sockets”._

**Example�1.9.�Set `db_table` parameter**

...
modparam("rtpproxy", "db\_table", "nh\_sockets") 
...

  

### 1.5.10.�`rtpp_socket_col` (string)

The name rtpp socket column in the database table.

_Default value is “rtpproxy\_sock”._

**Example�1.10.�Set `rtpp_socket_col` parameter**

...
modparam("rtpproxy", "rtpp\_socket\_col", "rtpp\_socket") 
...

  

### 1.5.11.�`set_id_col` (string)

The name set id column in the database table.

_Default value is “set\_id”._

**Example�1.11.�Set `set_id` parameter**

...
modparam("rtpproxy", "set\_id\_col", "rtpp\_set\_id") 
...

  

### 1.5.12.�`rtpp_notify_socket` (string)

The socket OpenSIPS listens for notifications from RTPProxy. Currently OpenSIPS can receive RTP timeout and DTMF events.

_Default value is “NULL” - no notifications are received._

**Example�1.12.�Set `rtpp_notify_socket` parameter**

...
modparam("rtpproxy", "rtpp\_notify\_socket", "tcp:10.10.10.10:9999")

# use an UNIX socket
modparam("rtpproxy", "rtpp\_notify\_socket", "unix:/tmp/rtpproxy.unix")
# or
modparam("rtpproxy", "rtpp\_notify\_socket", "/tmp/rtpproxy.unix")
...

  

### 1.5.13.�`generated_sdp_port_min` (integer)

When RTPProxy module needs to generate an SDP body, use this value as the minimum value of the port.

_Default value is “35000”._

**Example�1.13.�Set `generated_sdp_port_min` parameter**

...
modparam("rtpproxy", "generated\_sdp\_port\_min", 10000)
...
		

  

### 1.5.14.�`generated_sdp_port_max` (integer)

When RTPProxy module needs to generate an SDP body, use this value as the maximum value of the port.

_Default value is “65000”._

**Example�1.14.�Set `generated_sdp_port_max` parameter**

...
modparam("rtpproxy", "generated\_sdp\_port\_max", 30000)
...
		

  

### 1.5.15.�`generated_sdp_media_ip` (string)

When RTPProxy module needs to generate an SDP body, use this value as the media\_ip in the _c=_ and the _o=_.

_Default value is “127.0.0.1”._

**Example�1.15.�Set `generated_sdp_media_ip` parameter**

...
modparam("rtpproxy", "generated\_sdp\_media\_ip", "10.0.0.1")
...