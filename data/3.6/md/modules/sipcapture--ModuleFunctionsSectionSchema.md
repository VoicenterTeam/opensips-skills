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