## 1.3.�Parameters

### 1.3.1.�`db_url` (str)

Database URL.

_Default value is ""._

**Example�1.1.�Set `db_url` parameter**

...
modparam("sipcapture", "db\_url", "mysql://user:passwd@host/dbname")
...

  

### 1.3.2.�`table_name` (str)

Name of the table's name where to store the SIP messages. Since version 2.2 it allows strftime-like suffix for having time formatted table names.

_Default value is "sip\_capture"._

**Example�1.2.�Set `table_name` parameter**

...
modparam("sipcapture", "table\_name", "homer\_capture")

/\* change table name every day \*/
modparam("sipcapture", "table\_name", "homer\_%m\_%d")
/\* if today is 13-04-2014 it will exetend to homer\_04\_13 \*/
...

  

### 1.3.3.�`rtcp_table_name` (str)

Name of the table's name where to store packets captured with report\_capture function. Since version 2.2 it allows strftime-like suffix for having time formatted table names.

_Default value is "rtcp\_capture"._

**Example�1.3.�Set `rtcp_capture` parameter**

...
modparam("sipcapture", "rtcp\_table\_name", "homer\_capture")

/\* change table name every hour \*/
modparam("sipcapture", "rtcp\_table\_name", "homer\_%m\_%d\_%H")
/\* if today is 13-04-2014 13:05 pm it will exetend to homer\_04\_13\_13 \*/
...

  

### 1.3.4.�`capture_on` (integer)

Parameter to enable/disable capture globaly (on(1)/off(0))

_Default value is "0"._

**Example�1.4.�Set `capture_on` parameter**

...
modparam("sipcapture", "capture\_on", 1)
...

  

### 1.3.5.�`hep_capture_on` (integer)

Parameter to enable/disable capture of HEP (on(1)/off(0))

_Default value is "0"._

**Example�1.5.�Set `hep_capture_on` parameter**

...
modparam("sipcapture", "hep\_capture\_on", 1)
...

  

### 1.3.6.�`max_async_queries` (integer)

Parameter to set the maximum number of 'INSERT' queries of captured packets to be done in the same time, only if the DB supports async operations. If OpenSIPS is shut down, the remaining queries shall be executed. The query buffer is limited 65535 chars, so probably no more than 30-40 queries can be done in the same time, depending mostly on the size of the inserted sip message, since it's the biggest part of the query.

_Default value is "5"._

**Example�1.6.�Set `max_async_queries` parameter**

...
modparam("sipcapture", "max\_async\_queries", 3)
...

  

### 1.3.7.�`raw_ipip_capture_on` (integer)

Parameter to enable/disable IPIP capturing (on(1)/off(0))

_Default value is "0"._

**Example�1.7.�Set `raw_ipip_capture_on` parameter**

...
modparam("sipcapture", "raw\_ipip\_capture\_on", 1)
...

  

### 1.3.8.�`raw_moni_capture_on` (integer)

Parameter to enable/disable monitoring/mirroring port capturing (on(1)/off(0)) Only one mode on raw socket can be enabled! Monitoring port capturing currently supported only on Linux.

_Default value is "0"._

**Example�1.8.�Set `raw_moni_capture_on` parameter**

...
modparam("sipcapture", "raw\_moni\_capture\_on", 1)
...
		

  

### 1.3.9.�`raw_socket_listen` (string)

Parameter indicate an listen IP address of RAW socket for IPIP capturing. You can also define a port/portrange for IPIP/Mirroring mode, to capture SIP messages in specific ports:

"10.0.0.1:5060" - the source/destination port of the SIP message must be equal 5060

"10.0.0.1:5060-5090" - the source/destination port of the SIP message must be equal or be between 5060 and 5090.

The port/portrange must be defined if you are planning to use mirroring capture! In this case, the part with IP address will be ignored, but to make parser happy, use i.e. 10.0.0.0

_Default value is ""._

**Example�1.9.�Set `raw_socket_listen` parameter**

...
modparam("sipcapture", "raw\_socket\_listen", "10.0.0.1:5060-5090")
...
modparam("sipcapture", "raw\_socket\_listen", "10.0.0.1:5060")
...

  

### 1.3.10.�`raw_interface` (string)

Name of the interface to bind on the raw socket.

_Default value is ""._

**Example�1.10.�Set `raw_socket_listen` parameter**

...
modparam("sipcapture", "raw\_interface", "eth0")
...

  

### 1.3.11.�`raw_sock_children` (integer)

Parameter define how much children must be created to listen the raw socket.

_Default value is "1"._

**Example�1.11.�Set `raw_socket_listen` parameter**

...
modparam("sipcapture", "raw\_sock\_children", 6)
...

  

### 1.3.12.�`promiscuous_on` (integer)

Parameter to enable/disable promiscuous mode on the raw socket. Linux only.

_Default value is "0"._

**Example�1.12.�Set `promiscuous_on` parameter**

...
modparam("sipcapture", "promiscuous\_on", 1)
...

  

### 1.3.13.�`raw_moni_bpf_on` (integer)

Activate Linux Socket Filter (LSF based on BPF) on the mirroring interface. The structure is defined in linux/filter.h. The default LSF accept a port/portrange from the raw\_socket\_listen param. Currently LSF supported only on Linux.

_Default value is "0"._

**Example�1.13.�Set `raw_moni_bpf_on` parameter**

...
modparam("sipcapture", "raw\_moni\_bpf\_on", 1)
...

  

### 1.3.14.�`capture_node` (str)

Name of the capture node.

_Default value is "homer01"._

**Example�1.14.�Set `capture_node` parameter**

...
modparam("sipcapture", "capture\_node", "homer03")
...

  

### 1.3.15.�`hep_route` (string)

Specifies what path your hep messages should take. Possible values are the following:

*   _none_ - don't go through the script; do directly sip\_capture();
    
*   _sip(default)_ - go through the main request route; here the message is parsed and you can do anything you want with it;
    
*   _any other string value_ - define a route name through which your hep messages should go; the message is not parsed because of efficiency reasons; from here you can modify the hep chunks(if hep version 3 is used) and relay the hep messages to other hep capture nodes;
    

_Default value is sip(going thorugh the main request route)._

**Example�1.15.�Set `hep_route` parameter**

...
modparam("sipcapture", "hep\_route", "my\_hep\_route")
...

route\[my\_hep\_route\] {
	/\* do hep stuff in here \*/
	...
}
...