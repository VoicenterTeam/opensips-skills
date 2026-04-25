# SipCapture Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5921344)

2.2. [Most recently active contributors(1) to this module](#idp6023872)

**List of Examples**

1.1. [Set `db_url` parameter](#idp245888)

1.2. [Set `table_name` parameter](#idp5515552)

1.3. [Set `rtcp_capture` parameter](#idp5520416)

1.4. [Set `capture_on` parameter](#idp5525184)

1.5. [Set `hep_capture_on` parameter](#idp5529808)

1.6. [Set `max_async_queries` parameter](#idp5534800)

1.7. [Set `raw_ipip_capture_on` parameter](#idp5539504)

1.8. [Set `raw_moni_capture_on` parameter](#idp5544336)

1.9. [Set `raw_socket_listen` parameter](#idp5550800)

1.10. [Set `raw_socket_listen` parameter](#idp5555552)

1.11. [Set `raw_socket_listen` parameter](#idp5560256)

1.12. [Set `promiscuous_on` parameter](#idp5564976)

1.13. [Set `raw_moni_bpf_on` parameter](#idp5569808)

1.14. [Set `capture_node` parameter](#idp5574240)

1.15. [Set `hep_route` parameter](#idp5582496)

1.16. [`sip_capture` usage](#idp5592592)

1.17. [`sip_capture` usage](#idp5604944)

1.18. [`hep_set` usage](#idp5650928)

1.19. [`hep_set` usage](#idp5667152)

1.20. [`hep_set` usage](#idp5674688)

1.21. [`hep_relay` usage](#idp5679808)

1.22. [`hep_resume_sip` usage](#idp5685008)

1.23. [`sip_capture` usage](#idp5690704)

1.24. [`hep_net` usage](#idp5703568)

1.25. [`HEPVERSION` usage](#idp5708128)

## Chapter�1.�Admin Guide

## 1.1.�Overview

Offer a possibility to store incoming/outgoing SIP messages in database.

OpenSIPs can capture SIP messages in three mode

*   IPIP encapsulation. (ETHHDR+IPHDR+IPHDR+UDPHDR).
    
*   Monitoring/mirroring port.
    
*   Homer encapsulation protocl mode (HEP v1/2/3). With version 2.2 comes the new HEPv3 support using the proto \_hep module. Also header manipulation support for HEPv3 has been added. See [hep\_set()](#func_hep_set "1.4.3.� hep_set(chunk_id, chunk_data, [data_type], [vendor_id])") for more details. If you want more information about hep protocol check this [link](https://github.com/sipcapture/HEP/blob/master/docs/HEP3_rev11.pdf).
    

The capturing can be turned on/off using fifo commad.

opensips-cli -x mi sip\_capture on

opensips-cli -x mi sip\_capture off

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _database module_ - mysql, postrgress, dbtext, unixodbc...
    
*   _proto\_hep module_ - if hep capturing used
    

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _None_.
    

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

  

## 1.4.�Exported Functions

### 1.4.1.� `sip_capture([table_name], [custom_field1], [custom_field2], [custom_field3])`

Save the message into the database.

Meaning of the parameters is as follows:

*   _table\_name (string, optional)_ - the name of the table to store the packet; it can have a strftime-like formatted suffix in order to change it's name based on time; if not set, modparam defined table will be used;
    
    _custom\_field1 (string, optional)_ - custom data to store inside the "custom\_field1" column
    
    _custom\_field2 (string, optional)_ - custom data to store inside the "custom\_field2" column
    
    _custom\_field3 (string, optional)_ - custom data to store inside the "custom\_field3" column
    

This function can be used from REQUEST\_ROUTE,FAILURE\_ROUTE,ONREPLY\_ROUTE,BRANCH\_ROUTE,LOCAL\_ROUTE.

**Example�1.16.�`sip_capture` usage**

...
if (is\_method("REGISTER"))
	sip\_capture();
	...
	/\* table name will change every day \*/
	sip\_capture("homer\_%m\_%d");
	sip\_capture("homer\_%m\_%d", , $hdr(P-Asserted-Identity));
...
	

  

### 1.4.2.� `report_capture(correlation_id, [table_name], [proto_type])`

Save the message into the database. If you want set the protocol type you have to define the table name, even if you pass over it(report\_capture($var(cor\_id),,$var(proto\_type))).

Meaning of the parameters is as follows:

*   _correlation\_id (string)_
    
*   _table\_name (string, optional)_ - the name of the table to store the packet; it can have a strftime-like formatted suffix in order to change it's name based on time;
    
*   _proto\_type (int, optional)_ - protocol type number as defined in hep protocol specification.
    

**VERY IMPORTANT:** Since version 2.3 report\_capture function behaviour will change depending on [homer5\_on](https://opensips.org/docs/modules/2.3.x/proto_hep#idp154080) parameter from [proto\_hep](https://opensips.org/docs/modules/2.3.x/proto_hep). Check [sql](https://github.com/OpenSIPS/opensips/tree/master/modules/sipcapture/sql) folder from the module to check the fields of the tables for each version.

This function can be used from REQUEST\_ROUTE,FAILURE\_ROUTE,ONREPLY\_ROUTE,BRANCH\_ROUTE,LOCAL\_ROUTE.

**Example�1.17.�`sip_capture` usage**

...
	hep\_get("0x0011", "utf8-string", , $var(correlation\_id));
	if ($var(correlation\_id) == null) {
		xlog("NO CORRELATION ID! SET SOMETHING OR DROP");
		$var(correlation\_id) = "absdcef";
	}

	$var(proto\_type) = "3"; /\* 0x03 - SDP protocol \*/

	report\_capture($var(correlation\_id), "rtcp\_log");
	/\* setting the 2nd parameter, even if setting it to null, is mandatory in order to be able to set proto type \*/
	report\_capture($var(correlation\_id), , $var(proto\_type));
	report\_capture($var(correlation\_id), "rtcp\_log", $var(proto\_type));
...
	

  

### 1.4.3.� `hep_set(chunk_id, chunk_data, [data_type], [vendor_id])`

Set a hep chunk. If not exists, it shall be added.

This function can be used from REQUEST\_ROUTE,FAILURE\_ROUTE,ONREPLY\_ROUTE,BRANCH\_ROUTE,LOCAL\_ROUTE.

Meaning of the parameters is as follows:

*   _chunk\_id(string value with hex/int or string identifier of chunk)_ - id of the chunk to be added; most of the generic chunks are in the internal hep structure. For these you can skip the data\_type and vendor\_id since they are already known. Generic chunks that don't have built in support are the followinig: 0x000d(keep alive timer), 0x000e(authenticate key), 0x0011(internal correltion id), 0x0012(vlan ID). You can set these chunks, but only with vendor id 0x0000, other values shall result in an error. Timestamp(0x0009) and timestamp\_us(0x000A) chunks can't be set. For chunks that have built-in support you can also use strings instead of chunk ids as follows:
    
    *   0x0001 - proto\_family(CAN'T BE SET; it shall be automatically updated if you change the type of the source/destination address from IPv4 to IPv6 or else)
        
    *   0x0002 - proto\_id; since it's quite hard to know the int values for the protocol one can change this value using the following string values:
        
        *   UDP
            
        *   TCP
            
        *   TLS
            
        *   SCTP
            
        *   WS
            
        *   WSS
            
        *   BIN
            
        *   HEP
            
        
    *   0x0003 - src\_ip
        
    *   0x0004 - dst\_ip
        
    *   0x0005 - src\_ip
        
    *   0x0006 - dst\_ip
        
    *   0x0007 - src\_port
        
    *   0x0008 - dst\_port
        
    *   0x0009 - timestamp(CAN'T BE SET)
        
    *   0x000A - timestamp\_us(CAN'T BE SET)
        
    *   0x000B - proto\_type; for this variable there are predefined strings which can be set:
        
        *   SIP
            
        *   XMPP
            
        *   SDP
            
        *   RTP
            
        *   RTCP
            
        *   MGCP
            
        *   MEGACO
            
        *   M2UA
            
        *   M3UA
            
        *   IAX
            
        *   H322
            
        *   H321
            
        
    *   0x000C - captagent\_id
        
    *   0x000f - payload
        
    *   0x0010 - payload
        
    
*   _chunk\_data(string)_ - data that the chunk shall contain; internally it shall be converted to the requested data type
    
*   _data\_type (string, optional, default: "utf8-string")_ - data type of the data in the chunk. It can have the following values:
    
    *   uint8 - byte unsigned integer
        
    *   uint16 - word unsigned integer
        
    *   uint32 - 4 byte unsigned integer
        
    *   inet4-addr - IPv4 address in human readable format
        
    *   inet6-addr - IPv6 address in human readable format
        
    *   utf8-string - UTF8 encoded character sequence
        
    *   octet-string - byte array
        
    
*   _vendor id(string value with hex or int, optional, default: "3")_ - there are some vendor ids already defined; check [hep proto docs](http://hep.sipcapture.org/hepfiles/HEP3_rev11.pdf) for more details.
    

**Example�1.18.�`hep_set` usage**

...
/\* modify/add a generic chunk \*/
hep\_set("proto\_type", "H321");

/\* add a custom chunk - int \*/
hep\_set("31", "132", "uint32", "3")

/\* add a custom chunk - IPv4 address \*/
hep\_set("32", "192.168.5.14", "inet4-addr", "3")
...
	

  

### 1.4.4.� `hep_get(chunk_id, data_type, [chunk_data_pv], [vendor_id_pv])`

Set a hep chunk. If not exists, it shall be added.

This function can be used from REQUEST\_ROUTE,FAILURE\_ROUTE,ONREPLY\_ROUTE,BRANCH\_ROUTE,LOCAL\_ROUTE.

Meaning of the parameters is as follows:

*   _chunk\_id (string)_ - same meaning as in [hep\_set()](#func_hep_set "1.4.3.� hep_set(chunk_id, chunk_data, [data_type], [vendor_id])")
    
*   _data\_type (string)_ - same meaning as in [hep\_set()](#func_hep_set "1.4.3.� hep_set(chunk_id, chunk_data, [data_type], [vendor_id])"); can miss if it's a generic chunk
    
*   _chunk\_data\_pv (writable var, optional)_ - will hold the data inside the chunk; some of the generic chunk data come in specific format, as following:
    
    *   0x0001 - proto\_family(string) - AF\_INET/AF\_INET6
        
    *   0x0002 proto\_id(string) - see [hep\_set()](#func_hep_set "1.4.3.� hep_set(chunk_id, chunk_data, [data_type], [vendor_id])") for possible values
        
    *   0x0003/0x0004/0x0005/0x0006 src/dst\_ip(string) - ip addresses in human readable format
        
    *   0x0009 timestamp(string) - time and date in human readable format
        
    *   0x000B proto\_type(string) - see [hep\_set()](#func_hep_set "1.4.3.� hep_set(chunk_id, chunk_data, [data_type], [vendor_id])") for possible values
        
    
*   _vendor\_id\_pv (writable var, optional)_ - will hold the vendor id(int value) of the chunk
    

**Example�1.19.�`hep_set` usage**

...
/\* get a generic chunk \*/
hep\_get("proto\_type", , $var(data), $var(vid));

/\* get custom chunk - you must know what kind of data is there \*/
hep\_set("31", "uint32", $var(data), $var(vid))
...
	

  

### 1.4.5.� `hep_del(chunk_id)`

Removes a hep chunk.

This function can be used from REQUEST\_ROUTE,FAILURE\_ROUTE,ONREPLY\_ROUTE,BRANCH\_ROUTE,LOCAL\_ROUTE.

Meaning of the parameters is as follows:

*   _chunk\_id (string)_ - same meaning as the _chunk\_id_ in [hep\_set()](#func_hep_set "1.4.3.� hep_set(chunk_id, chunk_data, [data_type], [vendor_id])").
    

**Example�1.20.�`hep_set` usage**

...
/\* get a generic chunk \*/
hep\_del("25"); /\* removes chunk with chunk id 25 \*/
...
	

  

### 1.4.6.� `hep_relay()`

Relay a message statefully to destination indicated in current URI. (If the original URI was rewritten by UsrLoc, RR, strip/prefix, etc., the new URI will be taken). The message has to have been a HEP message, version 1, 2 or 3. For version 1 and 2 you can relay only using UDP, for version 3 TCP and UDP can be used.

This function can be used from REQUEST\_ROUTE,FAILURE\_ROUTE,ONREPLY\_ROUTE,BRANCH\_ROUTE,LOCAL\_ROUTE.

**Example�1.21.�`hep_relay` usage**

...
$du="sip:192.168.153.157";
if (!hep\_relay()) {
	xlog("Hep proxying failed!\\n");
	exit;
}

...
	

  

### 1.4.7.� `hep_resume_sip()`

Break hep route execution and resume into the main request route.

WARNING: USE THIS FUNCTION ONLY FROM A ROUTE DEFINED USING _hep\_route_ PARAMETER.

**Example�1.22.�`hep_resume_sip` usage**

...
modparam("sipcapture", "hep\_route", "my\_hep\_route")

route\[my\_hep\_route\] {
	...

	/\* resume execution in the main request route \*/
	hep\_resume\_sip();
}


...
	

  

## 1.5.�Exported Async Functions

### 1.5.1.� `sip_capture()`

Save the message inside the database. The query is being done asnychronously only if the database supports async operations. The query might not be executed exactly at this moment, it depends on the _max\_async\_queries_ parameter.

**Example�1.23.�`sip_capture` usage**

...
{
	async(sip\_capture(), capture\_resume);
}

route\[capture\_resume\] {
	xlog("insert executed\\n");
	/\*continuing logic here \*/
}
...
	

  

## 1.6.�Exported Pseudo-Variables

### 1.6.1.� `$hep_net`

Holds layer 3 and 4 information(IP addresses and ports) about the node from where the hep message was received. The variable is read-only and can be used only if it's referenced by it's name.

Possible values for it's name are the following:

*   _proto\_family_ - can be AF\_INET/AF\_INET6
    
*   _proto\_id_ - it's PROTO\_HEP since you receive the message as hep.
    
*   _src\_ip_ - IPv4/IPv6 address, depending on the proto\_family, of the sending node.
    
*   _dst\_ip_ - IPv4/IPv6 address, depending on the proto\_family, of the receiving node(OpenSIPS hep interface ip on which the message was received).
    
*   _src\_port_ - Sending node port.
    
*   _dst\_port_ - Receiving port(OpenSIPS hep interace port on which the message was received).
    

**Example�1.24.�`hep_net` usage**

...
	/\* received this hep packet on interface 192.168.2.5\*/
	if ($hep\_net(dst\_ip) == "192.168.2.5") {
		/\* received this on 192.168.2.5:6060 interface \*/
		if ($hep\_net(dst\_port) == 6060) {
			...
		/\* received this on 192.168.2.5:6061 interface \*/
		} else if ($hep\_net(dst\_port) == 6061) {
			...
		}
	}
...
	

  

### 1.6.2.� `HEPVERSION (string, int)`

Holds the version of the hep packet received on the interface.

**Example�1.25.�`HEPVERSION` usage**

...
	if ($HEPVERSION == 3) {
		/\* It's a HEPv3 packet\*/
		...
	} else if ($HEPVERSION == 2) {
		/\* It's a HEPv2 packet \*/
		...
	} else if ($HEPVERSION == 1) {
		/\* It's a HEPv1 packet \*/
		...
	}
...
	

  

## 1.7.�MI Commands

### 1.7.1.� `sip_capture`

Name: _sip\_capture_

Parameters:

*   _capture\_mode_ (optional) - turns on/off SIP message capturing. Possible values are:
    
    *   on
        
    *   off
        
    
    if the parameter is missing, the command will return the status of the SIP message capturing (as string “on” or “off” ) without changing anything.
    

MI FIFO Command Format:

		opensips-cli -x mi sip\_capture off
		

## 1.8.�Database setup

Before running OpenSIPS with sipcapture, you have to setup the database tables where the module will store the data. For that, if the table were not created by the installation script or you choose to install everything by yourself you can use the sipcapture-create.sql and reportcapture-create.sql or the sipcapture-st-create.sql SQL script in the database directories in the opensips/scripts folder as template. You can also find the complete database documentation on the project webpage, [https://opensips.org/docs/db/db-schema-devel.html](https://opensips.org/docs/db/db-schema-devel.html).

## 1.9.�Limitation

1\. Only one capturing mode on RAW socket is supported: IPIP or monitoring/mirroring port. Don't activate both at the same time. 2. By default MySQL doesn't support INSERT DELAYED for partitioning table. You can patch MySQL (http://bugs.mysql.com/bug.php?id=50393) or use separate tables (pseudo partitioning) 3. Mirroring port capturing works only on Linux.

## Chapter�2.�Contributors

## 2.1.�By Commit Statistics

**Table�2.1.�Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)**

�

Name

DevScore

Commits

Lines ++

Lines --

1.

Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita))

203

45

5927

6525

2.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

45

24

477

933

3.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

29

24

202

180

4.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

24

21

86

64

5.

Alexandr Dubovikov ([@adubovikov](https://github.com/adubovikov))

22

2

2360

0

6.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

9

7

73

54

7.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

8

6

19

16

8.

Walter Doekes ([@wdoekes](https://github.com/wdoekes))

5

3

7

5

9.

Bence Szigeti

4

2

10

4

10.

Zero King ([@l2dy](https://github.com/l2dy))

4

2

2

3

  

**All remaining contributors**: Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)), Dusan Klinec ([@ph4r05](https://github.com/ph4r05)), Ezequiel Lovelle ([@lovelle](https://github.com/lovelle)), Juli�n Moreno Pati�o, Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)).

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 2.2.�By Commit Activity

**Table�2.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Mar 2014 - May 2024

2.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Jan 2021 - Nov 2023

3.

Bence Szigeti

Jul 2023 - Aug 2023

4.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - May 2023

5.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Aug 2012 - May 2023

6.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Aug 2015 - Apr 2021

7.

Walter Doekes ([@wdoekes](https://github.com/wdoekes))

May 2014 - Apr 2021

8.

Zero King ([@l2dy](https://github.com/l2dy))

Mar 2020 - Mar 2020

9.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

10.

Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita))

Oct 2015 - Apr 2017

  

**All remaining contributors**: Juli�n Moreno Pati�o, Dusan Klinec ([@ph4r05](https://github.com/ph4r05)), Ezequiel Lovelle ([@lovelle](https://github.com/lovelle)), Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)), Alexandr Dubovikov ([@adubovikov](https://github.com/adubovikov)).

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Zero King ([@l2dy](https://github.com/l2dy)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita)), Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)), Alexandr Dubovikov ([@adubovikov](https://github.com/adubovikov)).

_Documentation Copyrights:_

Copyright � 2011 [QSC AG](http://www.qsc.de)