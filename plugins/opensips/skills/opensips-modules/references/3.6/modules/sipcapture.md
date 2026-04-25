# sipcapture Module Reference
<!-- generated-from: data/3.6/modules/sipcapture.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 sipcapture module. Read this file when configuring or debugging the sipcapture module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Exported Pseudo-Variables](#exported-pseudo-variables)
- [Exported MI Functions](#exported-mi-functions)
- [Configuration Examples](#configuration-examples)

## Overview

Offer a possibility to store incoming/outgoing SIP messages in database.

## How It Works

OpenSIPs can capture SIP messages in three mode

*   IPIP encapsulation. (ETHHDR+IPHDR+IPHDR+UDPHDR).
    
*   Monitoring/mirroring port.
    
*   Homer encapsulation protocl mode (HEP v1/2/3). With version 2.2 comes the new HEPv3 support using the proto _hep module. Also header manipulation support for HEPv3 has been added. See [hep_set()](#func_hep_set "1.4.3. hep_set(chunk_id, chunk_data, [data_type], [vendor_id])") for more details. If you want more information about hep protocol check this [link](https://github.com/sipcapture/HEP/blob/master/docs/HEP3_rev11.pdf).

The capturing can be turned on/off using fifo commad.

opensips-cli -x mi sip_capture on

opensips-cli -x mi sip_capture off

## Dependencies

### OpenSIPs Modules

- `database module` — mysql, postrgress, dbtext, unixodbc...

### External Libraries

None.

### Optional Modules

- `proto_hep module`

## Exported Parameters

### `capture_node` (string)

Name of the capture node.

*Default value is homer01.*

**Example.** homer03.

```opensips
modparam("sipcapture", "capture_node", "homer03")
```
### `capture_on` (integer)

Parameter to enable/disable capture globaly (on(1)/off(0))

*Default value is 0.*

**Possible values:**

- 0
- 1

**Example.** 1.

```opensips
modparam("sipcapture", "capture_on", 1)
```
### `db_url` (string)

Database URL.

**Example.** mysql://user:passwd@host/dbname.

```opensips
modparam("sipcapture", "db_url", "mysql://user:passwd@host/dbname")
```
### `hep_capture_on` (integer)

Parameter to enable/disable capture of HEP (on(1)/off(0))

*Default value is 0.*

**Possible values:**

- 0
- 1

**Example.** 1.

```opensips
modparam("sipcapture", "hep_capture_on", 1)
```
### `hep_route` (string)

Specifies what path your hep messages should take. Possible values are the following: * _none_ - don't go through the script; do directly sip_capture(); * _sip(default)_ - go through the main request route; here the message is parsed and you can do anything you want with it; * _any other string value_ - define a route name through which your hep messages should go; the message is not parsed because of efficiency reasons; from here you can modify the hep chunks(if hep version 3 is used) and relay the hep messages to other hep capture nodes;

*Default value is sip(going thorugh the main request route)..*

**Possible values:**

- none
- sip
- any other string value

**Example.** my_hep_route.

```opensips
modparam("sipcapture", "hep_route", "my_hep_route")
...
route[my_hep_route] {
	/* do hep stuff in here */
	...
}
```
### `max_async_queries` (integer)

Parameter to set the maximum number of 'INSERT' queries of captured packets to be done in the same time, only if the DB supports async operations. If OpenSIPS is shut down, the remaining queries shall be executed. The query buffer is limited 65535 chars, so probably no more than 30-40 queries can be done in the same time, depending mostly on the size of the inserted sip message, since it's the biggest part of the query.

*Default value is 5.*

**Example.** 3.

```opensips
modparam("sipcapture", "max_async_queries", 3)
```
### `promiscuous_on` (integer)

Parameter to enable/disable promiscuous mode on the raw socket. Linux only.

*Default value is 0.*

**Notes:** Linux only.

**Example.** 1.

```opensips
modparam("sipcapture", "promiscuous_on", 1)
```
### `raw_interface` (string)

Name of the interface to bind on the raw socket.

**Example.** eth0.

```opensips
modparam("sipcapture", "raw_interface", "eth0")
```
### `raw_ipip_capture_on` (integer)

Parameter to enable/disable IPIP capturing (on(1)/off(0))

*Default value is 0.*

**Possible values:**

- 0
- 1

**Example.** 1.

```opensips
modparam("sipcapture", "raw_ipip_capture_on", 1)
```
### `raw_moni_bpf_on` (integer)

Activate Linux Socket Filter (LSF based on BPF) on the mirroring interface. The structure is defined in linux/filter.h. The default LSF accept a port/portrange from the raw_socket_listen param. Currently LSF supported only on Linux.

*Default value is 0.*

**Notes:** Currently LSF supported only on Linux.

**Example.** 1.

```opensips
modparam("sipcapture", "raw_moni_bpf_on", 1)
```
### `raw_moni_capture_on` (integer)

Parameter to enable/disable monitoring/mirroring port capturing (on(1)/off(0)) Only one mode on raw socket can be enabled! Monitoring port capturing currently supported only on Linux.

*Default value is 0.*

**Possible values:**

- 0
- 1

**Notes:** Only one mode on raw socket can be enabled! Monitoring port capturing currently supported only on Linux.

**Example.** 1.

```opensips
modparam("sipcapture", "raw_moni_capture_on", 1)
```
### `raw_sock_children` (integer)

Parameter define how much children must be created to listen the raw socket.

*Default value is 1.*

**Example.** 6.

```opensips
modparam("sipcapture", "raw_sock_children", 6)
```
### `raw_socket_listen` (string)

Parameter indicate an listen IP address of RAW socket for IPIP capturing. You can also define a port/portrange for IPIP/Mirroring mode, to capture SIP messages in specific ports:

"10.0.0.1:5060" - the source/destination port of the SIP message must be equal 5060

"10.0.0.1:5060-5090" - the source/destination port of the SIP message must be equal or be between 5060 and 5090.

The port/portrange must be defined if you are planning to use mirroring capture! In this case, the part with IP address will be ignored, but to make parser happy, use i.e. 10.0.0.0

**Example.** 10.0.0.1:5060-5090.

```opensips
modparam("sipcapture", "raw_socket_listen", "10.0.0.1:5060-5090")
...
modparam("sipcapture", "raw_socket_listen", "10.0.0.1:5060")
```
### `rtcp_table_name` (string)

Name of the table's name where to store packets captured with report_capture function. Since version 2.2 it allows strftime-like suffix for having time formatted table names.

*Default value is rtcp_capture.*

**Example.** homer_capture.

```opensips
modparam("sipcapture", "rtcp_table_name", "homer_capture")

/* change table name every hour */
modparam("sipcapture", "rtcp_table_name", "homer_%m_%d_%H")
/* if today is 13-04-2014 13:05 pm it will exetend to homer_04_13_13 */
```
### `table_name` (string)

Name of the table's name where to store the SIP messages. Since version 2.2 it allows strftime-like suffix for having time formatted table names.

*Default value is sip_capture.*

**Example.** homer_capture.

```opensips
modparam("sipcapture", "table_name", "homer_capture")

/* change table name every day */
modparam("sipcapture", "table_name", "homer_%m_%d")
/* if today is 13-04-2014 it will exetend to homer_04_13 */
```

## Exported Functions

### `hep_del(chunk_id)`

Removes a hep chunk.

**Parameters:**

- `chunk_id` *(string, required)* — same meaning as the chunk_id in hep_set().

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE

**Related:**

- `hep_set`

**Example.** hep_set usage.

```opensips
...
/* get a generic chunk */
hep_del("25"); /* removes chunk with chunk id 25 */
...

```

### `hep_get(chunk_id, data_type, [chunk_data_pv], [vendor_id_pv])`

Set a hep chunk. If not exists, it shall be added.

**Parameters:**

- `chunk_data_pv` *(writable var, optional)* — will hold the data inside the chunk; some of the generic chunk data come in specific format, as following:

*   0x0001 - proto_family(string) - AF_INET/AF_INET6
    
*   0x0002 proto_id(string) - see hep_set() for possible values
    
*   0x0003/0x0004/0x0005/0x0006 src/dst_ip(string) - ip addresses in human readable format
    
*   0x0009 timestamp(string) - time and date in human readable format
    
*   0x000B proto_type(string) - see hep_set() for possible values
- `chunk_id` *(string, required)* — same meaning as in hep_set()
- `data_type` *(string, required)* — same meaning as in hep_set(); can miss if it's a generic chunk
- `vendor_id_pv` *(writable var, optional)* — will hold the vendor id(int value) of the chunk

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE

**Related:**

- `hep_set`

**Example.** hep_set usage.

```opensips
...
/* get a generic chunk */
hep_get("proto_type", , $var(data), $var(vid));

/* get custom chunk - you must know what kind of data is there */
hep_set("31", "uint32", $var(data), $var(vid))
...

```

### `hep_relay()`

Relay a message statefully to destination indicated in current URI. (If the original URI was rewritten by UsrLoc, RR, strip/prefix, etc., the new URI will be taken). The message has to have been a HEP message, version 1, 2 or 3. For version 1 and 2 you can relay only using UDP, for version 3 TCP and UDP can be used.

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE

**Example.** hep_relay usage.

```opensips
...
$du="sip:192.168.153.157";
if (!hep_relay()) {
	xlog("Hep proxying failed!\n");
	exit;
}

...

```

### `hep_resume_sip()`

Break hep route execution and resume into the main request route.

WARNING: USE THIS FUNCTION ONLY FROM A ROUTE DEFINED USING _hep_route_ PARAMETER.

**Usable from:** hep_route

**Example.** hep_resume_sip usage.

```opensips
...
modparam("sipcapture", "hep_route", "my_hep_route")

route[my_hep_route] {
	...

	/* resume execution in the main request route */
	hep_resume_sip();
}

...

```

### `hep_set(chunk_id, chunk_data, [data_type], [vendor_id])`

Set a hep chunk. If not exists, it shall be added.

**Parameters:**

- `chunk_data` *(string, required)* — data that the chunk shall contain; internally it shall be converted to the requested data type
- `chunk_id` *(string, required)* — id of the chunk to be added; most of the generic chunks are in the internal hep structure. For these you can skip the data_type and vendor_id since they are already known. Generic chunks that don't have built in support are the followinig: 0x000d(keep alive timer), 0x000e(authenticate key), 0x0011(internal correltion id), 0x0012(vlan ID). You can set these chunks, but only with vendor id 0x0000, other values shall result in an error. Timestamp(0x0009) and timestamp_us(0x000A) chunks can't be set. For chunks that have built-in support you can also use strings instead of chunk ids as follows:

*   0x0001 - proto_family(CAN'T BE SET; it shall be automatically updated if you change the type of the source/destination address from IPv4 to IPv6 or else)
    
*   0x0002 - proto_id; since it's quite hard to know the int values for the protocol one can change this value using the following string values:
    
    *   UDP
        
    *   TCP
        
    *   TLS
        
    *   SCTP
        
    *   WS
        
    *   WSS
        
    *   BIN
        
    *   HEP

*   0x0003 - src_ip
    
*   0x0004 - dst_ip
    
*   0x0005 - src_ip
    
*   0x0006 - dst_ip
    
*   0x0007 - src_port
    
*   0x0008 - dst_port
    
*   0x0009 - timestamp(CAN'T BE SET)
    
*   0x000A - timestamp_us(CAN'T BE SET)
    
*   0x000B - proto_type; for this variable there are predefined strings which can be set:
    
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

*   0x000C - captagent_id
    
*   0x000f - payload
    
*   0x0010 - payload
  - `proto_family`
  - `proto_id`
  - `src_ip`
  - `dst_ip`
  - `src_port`
  - `dst_port`
  - `timestamp`
  - `timestamp_us`
  - `proto_type`
  - `captagent_id`
  - `payload`
- `data_type` *(string, optional)* — data type of the data in the chunk. It can have the following values:
  - `uint8`
  - `uint16`
  - `uint32`
  - `inet4-addr`
  - `inet6-addr`
  - `utf8-string`
  - `octet-string`
- `vendor_id` *(string, optional)* — there are some vendor ids already defined; check hep proto docs for more details.

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE

**Example.** hep_set usage.

```opensips
...
/* modify/add a generic chunk */
hep_set("proto_type", "H321");

/* add a custom chunk - int */
hep_set("31", "132", "uint32", "3")

/* add a custom chunk - IPv4 address */
hep_set("32", "192.168.5.14", "inet4-addr", "3")
...

```

### `report_capture(correlation_id, [table_name], [proto_type])`

Save the message into the database. If you want set the protocol type you have to define the table name, even if you pass over it(report_capture($var(cor_id),,$var(proto_type))).

**VERY IMPORTANT:** Since version 2.3 report_capture function behaviour will change depending on [homer5_on](https://opensips.org/docs/modules/2.3.x/proto_hep#idp154080) parameter from [proto_hep](https://opensips.org/docs/modules/2.3.x/proto_hep). Check [sql](https://github.com/OpenSIPS/opensips/tree/master/modules/sipcapture/sql) folder from the module to check the fields of the tables for each version.

**Parameters:**

- `correlation_id` *(string, required)* — 
- `proto_type` *(int, optional)* — protocol type number as defined in hep protocol specification
- `table_name` *(string, optional)* — the name of the table to store the packet; it can have a strftime-like formatted suffix in order to change it's name based on time

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE

**Related:**

- `hep_get`

**Example.** sip_capture usage.

```opensips
...
	hep_get("0x0011", "utf8-string", , $var(correlation_id));
	if ($var(correlation_id) == null) {
		xlog("NO CORRELATION ID! SET SOMETHING OR DROP");
		$var(correlation_id) = "absdcef";
	}

	$var(proto_type) = "3"; /* 0x03 - SDP protocol */

	report_capture($var(correlation_id), "rtcp_log");
	/* setting the 2nd parameter, even if setting it to null, is mandatory in order to be able to set proto type */
	report_capture($var(correlation_id), , $var(proto_type));
	report_capture($var(correlation_id), "rtcp_log", $var(proto_type));
...

```

### `sip_capture([table_name], [custom_field1], [custom_field2], [custom_field3])`

Save the message into the database.

**Parameters:**

- `custom_field1` *(string, optional)* — custom data to store inside the "custom_field1" column
- `custom_field2` *(string, optional)* — custom data to store inside the "custom_field2" column
- `custom_field3` *(string, optional)* — custom data to store inside the "custom_field3" column
- `table_name` *(string, optional)* — the name of the table to store the packet; it can have a strftime-like formatted suffix in order to change it's name based on time; if not set, modparam defined table will be used

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE

**Example.** sip_capture usage.

```opensips
...
if (is_method("REGISTER"))
	sip_capture();
	...
	/* table name will change every day */
	sip_capture("homer_%m_%d");
	sip_capture("homer_%m_%d", , $hdr(P-Asserted-Identity));
...

```

## Exported Pseudo-Variables

### `$HEPVERSION`

Holds the version of the hep packet received on the interface.

- **Type:** string, int
- **Read/write:** read-only
- **Scope:** 

**Possible values:**

- 1
- 2
- 3
### `$hep_net`

Holds layer 3 and 4 information(IP addresses and ports) about the node from where the hep message was received. The variable is read-only and can be used only if it's referenced by it's name.

- **Type:** string
- **Read/write:** read-only
- **Scope:** 

**Possible values:**

- proto_family
- proto_id
- src_ip
- dst_ip
- src_port
- dst_port

## Exported MI Functions

### `sip_capture`

Turns on/off SIP message capturing.

**Parameters:**

- `capture_mode` *(string, optional)* — turns on/off SIP message capturing. Possible values are: on, off. if the parameter is missing, the command will return the status of the SIP message capturing (as string “on” or “off” ) without changing anything.

**Returns:** The status of the SIP message capturing (as string “on” or “off” ) if the parameter is missing.

**Example.** Turns off SIP message capturing.

```opensips-cli
opensips-cli -x mi sip_capture off
```

## Configuration Examples

### Set `db_url` parameter

Database URL.

```opensips
...
modparam("sipcapture", "db_url", "mysql://user:passwd@host/dbname")
...
```
### Set `table_name` parameter

Name of the table's name where to store the SIP messages. Since version 2.2 it allows strftime-like suffix for having time formatted table names.

```opensips
...
modparam("sipcapture", "table_name", "homer_capture")

/* change table name every day */
modparam("sipcapture", "table_name", "homer_%m_%d")
/* if today is 13-04-2014 it will exetend to homer_04_13 */
...
```
### Set `rtcp_capture` parameter

Name of the table's name where to store packets captured with report_capture function. Since version 2.2 it allows strftime-like suffix for having time formatted table names.

```opensips
...
modparam("sipcapture", "rtcp_table_name", "homer_capture")

/* change table name every hour */
modparam("sipcapture", "rtcp_table_name", "homer_%m_%d_%H")
/* if today is 13-04-2014 13:05 pm it will exetend to homer_04_13_13 */
...
```
### Set `capture_on` parameter

Parameter to enable/disable capture globaly (on(1)/off(0))

```opensips
...
modparam("sipcapture", "capture_on", 1)
...
```
### Set `hep_capture_on` parameter

Parameter to enable/disable capture of HEP (on(1)/off(0))

```opensips
...
modparam("sipcapture", "hep_capture_on", 1)
...
```
### Set `max_async_queries` parameter

Parameter to set the maximum number of 'INSERT' queries of captured packets to be done in the same time, only if the DB supports async operations.

```opensips
...
modparam("sipcapture", "max_async_queries", 3)
...
```
### Set `raw_ipip_capture_on` parameter

Parameter to enable/disable IPIP capturing (on(1)/off(0))

```opensips
...
modparam("sipcapture", "raw_ipip_capture_on", 1)
...
```
### Set `raw_moni_capture_on` parameter

Parameter to enable/disable monitoring/mirroring port capturing (on(1)/off(0)) Only one mode on raw socket can be enabled! Monitoring port capturing currently supported only on Linux.

```opensips
...
modparam("sipcapture", "raw_moni_capture_on", 1)
...
```
### Set `raw_socket_listen` parameter

Parameter indicate an listen IP address of RAW socket for IPIP capturing. You can also define a port/portrange for IPIP/Mirroring mode, to capture SIP messages in specific ports.

```opensips
...
modparam("sipcapture", "raw_socket_listen", "10.0.0.1:5060-5090")
...
modparam("sipcapture", "raw_socket_listen", "10.0.0.1:5060")
...
```
### Set `raw_socket_listen` parameter

Name of the interface to bind on the raw socket.

```opensips
...
modparam("sipcapture", "raw_interface", "eth0")
...
```
### Set `raw_socket_listen` parameter

Parameter define how much children must be created to listen the raw socket.

```opensips
...
modparam("sipcapture", "raw_sock_children", 6)
...
```
### Set `promiscuous_on` parameter

Parameter to enable/disable promiscuous mode on the raw socket. Linux only.

```opensips
...
modparam("sipcapture", "promiscuous_on", 1)
...
```
### Set `raw_moni_bpf_on` parameter

Activate Linux Socket Filter (LSF based on BPF) on the mirroring interface. The structure is defined in linux/filter.h.

```opensips
...
modparam("sipcapture", "raw_moni_bpf_on", 1)
...
```
### Set `capture_node` parameter

Name of the capture node.

```opensips
...
modparam("sipcapture", "capture_node", "homer03")
...
```
### Set `hep_route` parameter

Specifies what path your hep messages should take.

```opensips
...
modparam("sipcapture", "hep_route", "my_hep_route")
...

route[my_hep_route] {
	/* do hep stuff in here */
	...
}
...
```
### `sip_capture` usage

Save the message into the database.

```opensips
...
if (is_method("REGISTER"))
	sip_capture();
	...
	/* table name will change every day */
	sip_capture("homer_%m_%d");
	sip_capture("homer_%m_%d", , $hdr(P-Asserted-Identity));
...
```
### `sip_capture` usage

Save the message into the database. If you want set the protocol type you have to define the table name, even if you pass over it(report_capture($var(cor_id),,$var(proto_type))).

```opensips
...
	hep_get("0x0011", "utf8-string", , $var(correlation_id));
	if ($var(correlation_id) == null) {
		xlog("NO CORRELATION ID! SET SOMETHING OR DROP");
		$var(correlation_id) = "absdcef";
	}

	$var(proto_type) = "3"; /* 0x03 - SDP protocol */

	report_capture($var(correlation_id), "rtcp_log");
	/* setting the 2nd parameter, even if setting it to null, is mandatory in order to be able to set proto type */
	report_capture($var(correlation_id), , $var(proto_type));
	report_capture($var(correlation_id), "rtcp_log", $var(proto_type));
...
```
### `hep_set` usage

Set a hep chunk. If not exists, it shall be added.

```opensips
...
/* modify/add a generic chunk */
hep_set("proto_type", "H321");

/* add a custom chunk - int */
hep_set("31", "132", "uint32", "3")

/* add a custom chunk - IPv4 address */
hep_set("32", "192.168.5.14", "inet4-addr", "3")
...
```
### `hep_set` usage

Get a hep chunk.

```opensips
...
/* get a generic chunk */
hep_get("proto_type", , $var(data), $var(vid));

/* get custom chunk - you must know what kind of data is there */
hep_set("31", "uint32", $var(data), $var(vid))
...
```
### `hep_set` usage

Removes a hep chunk.

```opensips
...
/* get a generic chunk */
hep_del("25"); /* removes chunk with chunk id 25 */
...
```
### `hep_relay` usage

Relay a message statefully to destination indicated in current URI.

```opensips
...
$du="sip:192.168.153.157";
if (!hep_relay()) {
	xlog("Hep proxying failed!\\n");
	exit;
}

...
```
### `hep_resume_sip` usage

Break hep route execution and resume into the main request route.

```opensips
...
modparam("sipcapture", "hep_route", "my_hep_route")

route[my_hep_route] {
	...

	/* resume execution in the main request route */
	hep_resume_sip();
}

...
```
### `sip_capture` usage

Save the message inside the database. The query is being done asnychronously only if the database supports async operations.

```opensips
...
{
	async(sip_capture(), capture_resume);
}

route[capture_resume] {
	xlog("insert executed\\n");
	/*continuing logic here */
}
...
```
### `hep_net` usage

Holds layer 3 and 4 information(IP addresses and ports) about the node from where the hep message was received.

```opensips
...
	/* received this hep packet on interface 192.168.2.5*/
	if ($hep_net(dst_ip) == "192.168.2.5") {
		/* received this on 192.168.2.5:6060 interface */
		if ($hep_net(dst_port) == 6060) {
			...
		/* received this on 192.168.2.5:6061 interface */
		} else if ($hep_net(dst_port) == 6061) {
			...
		}
	}
...
```
### `HEPVERSION` usage

Holds the version of the hep packet received on the interface.

```opensips
...
	if ($HEPVERSION == 3) {
		/* It's a HEPv3 packet*/
		...
	} else if ($HEPVERSION == 2) {
		/* It's a HEPv2 packet */
		...
	} else if ($HEPVERSION == 1) {
		/* It's a HEPv1 packet */
		...
	}
...
```
