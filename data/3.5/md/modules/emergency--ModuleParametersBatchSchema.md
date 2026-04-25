## 1.3.�Exported Parameters

### 1.3.1.�`db_url` (string)

The database url must be specified.

_Default value is “NULL”._

**Example�1.1.�Setting the `db_url` parameter**

...
modparam("emergency", "db\_url", "mysql://opensips:opensipsrw@localhost/opensips”)
...
		

  

### 1.3.2.�`db_table_routing` (string)

The name of the db table storing routing information to emergency calls.

_Default value is “emergency\_routing”._

**Example�1.2.�Setting the `db_table_routing` parameter**

...
modparam("emergency", "db\_table\_routing", "emergency\_routing")
...
		

  

### 1.3.3.�`db_table_report` (string)

The name of the db table that stores the emergency call report.

_Default value is “emergency\_report”._

**Example�1.3.�Setting the `db_table_report` parameter**

...
modparam("emergency", "db\_table\_report", "emergency\_report")
...
		

  

### 1.3.4.�`db_table_provider` (string)

The name of the db table that stores the nodes information of organization involved in emergency calls.

_Default value is “emergency\_service\_provider”._

**Example�1.4.�Setting the `db_table_provider` parameter**

...
modparam("emergency", "db\_table\_provider", "emergency\_service\_provider")
...
		

  

### 1.3.5.�`proxy_role` (integer)

This parameter define what role the opensips will take to treat emergency call:

0 – The opensips is the Call Server in scenario I. In this role the opensips implements the V2 interface, directly queries the VPC for ESGWRI/ESQK, selects the proper ESGW given the ESGWRI and routes calls Via the PSTN using the LRO if routing fails.

1 – The opensips is the Call Server in scenario II that sends the INVITE on emergency call to a Routing Proxy provider. The Routing Proxy provider implements the V2 interface.

2 - The opensips is the Routing Proxy in scenario II. In this role the opensips implements the V2 interface, directly queries the VPC for ESGWRI/ESQK, selects the proper ESGW given the ESGWRI and routes calls Via the PSTN using the LRO if routing fails.

3 - The opensips is the Redirect Proxy in scenario III that receives the INVITE on emergency call from Call Server. The Redirect Server obtains the ESGWRI/ESQK from the VPC and sends in the SIP 3xx response to the Call Server.

4 - The opensips is the Call Server in scenario III that sends the INVITE on emergency call to a Redirect Server. The Redirect Server obtains the ESGWRI/ESQK from the VPC. It returns the call to the opensips with the ESGWRI/ESQK in the header contact in the SIP response. The opensips selects the proper ESGW based on the ESGWRI.

_Default value is “0”._

**Example�1.5.�Setting the `proxy_role` parameter**

...
modparam("emergency", "proxy\_role", 0))
...
		

  

### 1.3.6.�`url_vpc` (string)

The VPC url that opensips request the routing information to emergency call. This VPC url has IP:Port format

_Default value is “empty string”._

**Example�1.6.�Setting the `url_vpc` parameter**

...
modparam("emergency", "url\_vpc", “192.168.0.103:5060”)
...
		

  

### 1.3.7.�`emergency_codes` (string)

Local emergency number. Opensips uses this number to recognize a emergency call beyond the username default defined by RFC-5031 (urn:service.sos.). Along with the number should be given a brief description about this code. The format is code\_number-description. It can register multiple emergency numbers.

_Default value is “NULLg”._

**Example�1.7.�Setting the `emergency_codes` parameter**

...
modparam("emergency", "emergency\_codes", “911-us emegency code”)
...
		

  

### 1.3.8.�`timer_interval` (interger)

Sets the time interval polling to make the copy in memory of the db\_table\_routing.

_Default value is “10”._

**Example�1.8.�Setting the `timer_interval` parameter**

...
modparam("emergency","timer\_interval",20)
...
		

  

### 1.3.9.�`contingency_hostname` (string)

The contingency\_hostname is the url of the server que will route the call to the PSTN using the number of contingency.

_Default value is “NULL”._

**Example�1.9.�Setting the `contingency_hostname` parameter**

...
modparam("emergency","contingency\_hostname",“176.34,29.102:5060”)
...
		

  

### 1.3.10.�`emergency_call_server` (string)

The emergency\_call\_server is the url of the Routing Proxy/Redirect Server that will handle the emergency call in cenario II. Its is mandatory if Opensips act as Call Server in scenario II (proxy\_role = 1 and flag\_third\_enterprise = 0) or Call Server in scenario III (proxy\_role = 2).

_Default value is “NULL”._

**Example�1.10.�Setting the `emergency_call_server` parameter**

...
modparam("emergency","emergency\_call\_server",“124.78.29.123:5060”)
...