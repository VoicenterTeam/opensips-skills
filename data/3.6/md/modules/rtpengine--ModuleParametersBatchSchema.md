## 1.4.�Exported Parameters

### 1.4.1.�`rtpengine_sock` (string)

Definition of socket(s) used to connect to (a set) RTP proxy. It may specify a UNIX socket or an IPv4/IPv6 UDP socket. If the protocol part (i.e. “udp:”) is missing, the socket is treated as a UNIX socket.

_Default value is “NONE” (disabled)._

**Example�1.1.�Set `rtpengine_sock` parameter**

...
# single rtproxy
modparam("rtpengine", "rtpengine\_sock", "udp:localhost:12221")
# multiple rtproxies for LB
modparam("rtpengine", "rtpengine\_sock",
	"udp:localhost:12221 udp:localhost:12222")
# multiple sets of multiple rtproxies
modparam("rtpengine", "rtpengine\_sock",
	"1 == udp:localhost:12221 udp:localhost:12222")
modparam("rtpengine", "rtpengine\_sock",
	"2 == udp:localhost:12225")
...

  

### 1.4.2.�`rtpengine_disable_tout` (integer)

Once an RTP proxy was found unreachable and marked as disabled, the rtpengine module will not attempt to establish communication to that RTP proxy for rtpengine\_disable\_tout seconds.

_Default value is “60”._

**Example�1.2.�Set `rtpengine_disable_tout` parameter**

...
modparam("rtpengine", "rtpengine\_disable\_tout", 20)
...

  

### 1.4.3.�`rtpengine_tout` (integer)

Timeout value in waiting for reply from RTP proxy.

_Default value is “1”._

**Example�1.3.�Set `rtpengine_tout` parameter**

...
modparam("rtpengine", "rtpengine\_tout", 2)
...

  

### 1.4.4.�`rtpengine_retr` (integer)

How many times the module should retry to send and receive after timeout was generated.

_Default value is “5”._

**Example�1.4.�Set `rtpengine_retr` parameter**

...
modparam("rtpengine", "rtpengine\_retr", 2)
...

  

### 1.4.5.�`rtpengine_timer_interval` (integer)

Frequency to scan rtpengine sets for disabled node probing. Probing is done outside the SIP processing context and in a separate timer routine. Disabled nodes are probed for re-enablement after rtpengine\_disable\_tout seconds. Setting this value too high can lead to unexpectedly large disabled interval as the max interval before probing is (rtpengine\_timer\_interval + rtpengine\_disable\_tout) seconds.

Default value is “5”.

**Example�1.5.�Set `rtpengine_timer_interval` parameter**

...
modparam("rtpengine", "rtpengine\_timer\_interval", 1)
...

  

### 1.4.6.�`notification_sock` (string)

An UDP socket formatted as _IP:port_ that indicates the listening IP and port OpenSIPS will bind for to receive notifications (such as DTMF events) from RTPengine.

Every notification received from RTPengine will trigger an _E\_RTPENGINE\_NOTIFICATION_ event.

_Default value is “none” - notifications are ignored._

**Example�1.6.�Set `notification_sock` parameter**

...
modparam("rtpengine", "notification\_sock", "127.0.0.1:9999")
...

  

### 1.4.7.�`extra_id_pv` (string)

The parameter sets the PV definition to use when the “via-branch=extra” option is used on the rtpengine\_delete(), rtpengine\_offer(), rtpengine\_answer() or rtpengine\_manage() commands.

Default is empty, the “via-branch=extra” option may not be used then.

**Example�1.7.�Set `extra_id_pv` parameter**

...
modparam("rtpengine", "extra\_id\_pv", "$avp(extra\_id)")
...

  

### 1.4.8.�`setid_avp` (string)

The parameter defines an AVP that, if set, determines which RTP proxy set rtpengine\_offer(), rtpengine\_answer(), rtpengine\_delete(), and rtpengine\_manage() functions use.

There is no default value.

**Example�1.8.�Set `setid_avp` parameter**

...
modparam("rtpengine", "setid\_avp", "$avp(setid)")
...

  

### 1.4.9.�`error_pv` (string)

The parameter defines a variable that shall be populated by RTP when one of the rtpengine\_\* functions fail.

There is no default value.

**Example�1.9.�Set `error_pv` parameter**

...
modparam("rtpengine", "error\_pv", "$var(rtpengine\_error)")
...

  

### 1.4.10.�`db_url` (string)

Database URL, used to load RTPEngines sockets from db, instead of specifying them in the script ([rtpengine\_sock](#param_rtpengine_sock "1.4.1.�rtpengine_sock (string)") module parameter).

Default value is “NULL”, no database is used.

**Example�1.10.�Set `db_url` parameter**

...
modparam("rtpengine", "db\_url", 
		"mysql://opensips:opensipsrw@localhost/opensips")
...

  

### 1.4.11.�`db_table` (string)

The table where the RTPEngines sockets are stored. Used when Database URL is provisioned.

Default value is “rtpengine”.

**Example�1.11.�Set `db_table` parameter**

...
modparam("rtpengine", "db\_table", "rtpengine\_new")
...

  

### 1.4.12.�`socket_column` (string)

The name of the rtpengine socket column in the database table.

Default value is “socket”.

**Example�1.12.�Set `socket_column` parameter**

...
modparam("rtpengine", "socket\_column", "sock")
...

  

### 1.4.13.�`set_column` (string)

The name of the rtpengine set column in the database table.

Default value is “set\_id”.

**Example�1.13.�Set `set_column` parameter**

...
modparam("rtpengine", "set\_column", "set\_new")
...

  

### 1.4.14.�`ping_enabled` (integer)

This parameter indicates whether probing should be done for enabled nodes as well.

If this parameter is set, each enabled node is pinged every [rtpengine\_timer\_interval](#param_rtpengine_timer_interval "1.4.5.�rtpengine_timer_interval (integer)") seconds, unless there was any communication with the node since the previous interval.

_Default value is “0” (disabled)._

**Example�1.14.�Set `ping_enabled` parameter**

...
modparam("rtpengine", "ping\_enabled", yes)
...