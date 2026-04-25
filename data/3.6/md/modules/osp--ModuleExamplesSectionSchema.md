# OSP Module for Secure, Multi-Lateral Peering

---

**List of Tables**

3.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp6018912)

3.2. [Most recently active contributors(1) to this module](#idp6082432)

**List of Examples**

1.1. [Instructing the module to work in direct mode](#idp166432)

1.2. [Instructing the module to provide normal voice service](#idp170192)

1.3. [Setting the OSP servers](#idp5579504)

1.4. [Setting the OSP server weights](#idp5584192)

1.5. [Setting the device IP address](#idp5587616)

1.6. [Instructing the module not to use OSP security features](#idp5591072)

1.7. [Setting the token format](#idp5596384)

1.8. [Set authorization files](#idp5601360)

1.9. [Setting the hardware support](#idp5605504)

1.10. [Setting the ssl lifetime](#idp5609008)

1.11. [Setting the persistence](#idp5612480)

1.12. [Setting the retry delay](#idp5615952)

1.13. [Setting the retry limit](#idp5619600)

1.14. [Setting the timeout](#idp5623056)

1.15. [Setting support non-SIP destination devices](#idp5626384)

1.16. [Setting the number of destination](#idp5629776)

1.17. [Setting report network ID flag](#idp5633360)

1.18. [Instructing the module to validate call id](#idp5636928)

1.19. [Instructing the module to use number portability parameters in Request URI](#idp5640496)

1.20. [Append user=phone parameter](#idp5644048)

1.21. [Append networkid location](#idp5648512)

1.22. [Networkid parameter name](#idp5651872)

1.23. [Append switchid location](#idp5656336)

1.24. [Networkid parameter name](#idp5659696)

1.25. [Append parameter string location](#idp5664160)

1.26. [Parameter string value](#idp5667472)

1.27. [Setting the source device IP AVP](#idp328096)

1.28. [Setting the source network ID AVP](#idp331952)

1.29. [Setting the source switch ID AVP](#idp335712)

1.30. [Setting the custom info AVP](#idp5690416)

1.31. [Setting the CNAM AVP](#idp5693856)

1.32. [Setting the NOTIFY extra headers](#idp5697184)

1.33. [Setting the media address AVPs](#idp5700640)

1.34. [Setting the request date AVP](#idp5704288)

1.35. [Setting the SDP finger print AVP](#idp5707808)

1.36. [Setting the Identity related AVPs](#idp5712944)

1.37. [Setting the source service provider AVP](#idp5716656)

1.38. [Setting the source user group AVP](#idp5720144)

1.39. [Setting the source user ID AVP](#idp5723616)

1.40. [checkospheader usage](#idp5728816)

1.41. [validateospheader usage](#idp5733040)

1.42. [getlocaladress usage](#idp5737088)

1.43. [setrequestdate usage](#idp5741152)

1.44. [requestosprouting usage](#idp5746720)

1.45. [checkosproute usage](#idp5750784)

1.46. [prepareosproute usage](#idp5755296)

1.47. [prepareospresponse usage](#idp5759568)

1.48. [prepareallosproutes usage](#idp5763760)

1.49. [checkcallingtranslation usage](#idp5768192)

1.50. [reportospusage usage](#idp5774960)

1.51. [processsubscribe usage](#idp5781200)

## Chapter�1.�Admin Guide

## 1.1.�Overview

The OSP module enables OpenSIPS to support secure, multi-lateral peering using the OSP standard defined by ETSI (TS 101 321 V4.1.1). This module will enable your OpenSIPS to:

*   Send a peering authorization request to a peering server.
    
*   Validate a digitally signed peering authorization token received in a SIP INVITE message.
    
*   Report usage information to a peering server.
    

## 1.2.�Dependencies

The OSP module depends on the following modules which must be loaded before the OSP module.

*   _auth_ -- Authentication Framework module
    
*   _sqlops_ -- SQL operation module
    
*   _maxfwd_ -- Max-Forward processor module
    
*   _mi\_fifo_ -- FIFO support for Management Interface
    
*   _options_ -- OPTIONS server replier module
    
*   _proto\_udp_ -- UDP protocol module - implements UDP-plain transport for SIP
    
*   _registrar_ -- SIP Registrar implementation module
    
*   _rr_ -- Record-Route and Route module
    
*   _signaling_ -- SIP signaling module
    
*   _sipmsgops_ -- SIP operations module
    
*   _sl_ -- Stateless replier module
    
*   _tm_ -- Transaction (stateful) module
    
*   _uac_ -- UAC functionalies (FROM mangling and UAC auth)
    
*   _uac\_auth_ -- UAC Authentication functionality
    
*   _usrloc_ -- User location implementation module
    
*   _OSP Toolkit_ -- The OSP Toolkit, available from https://github.com/TransNexus/osptoolkit, must be built before building OpenSIPS with the OSP module. For instructions on building OpenSIPS with the OSP Toolkit, see http://www.http://transnexus.com/wp-content/uploads/OSP-Routing-and-CDR-Collection-Server-with-OpenSIPS-1.7.2.pdf. For OpenSIPS 2.4.0, OSP Toolkit 4.16.0 or later versions should be used.
    

## 1.3.�Exported Parameters

### 1.3.1.�`work_mode`

The work\_mode (integer) parameter instructs the OSP module what mode it should work in. If this value is set to 0, the OSP module works in direct mode. If this value is set to 1, the OSP module works in indirect mode. The default value is 0.

**Example�1.1.�Instructing the module to work in direct mode**

modparam("osp","work\_mode",0)
        

  

### 1.3.2.�`service_type`

The service\_type (integer) parameter instructs the OSP module what services it should provide. If this value is set to 0, the OSP module provides normal voice service. If this value is set to 1, the OSP module provides ported number query service. If this value is set to 2, the OSP module provides CNAM query service. The default value is 0.

**Example�1.2.�Instructing the module to provide normal voice service**

modparam("osp","service\_type",0)
        

  

### 1.3.3.�`sp1_uri`, `sp2_uri`, ..., `sp16_uri`

These sp\_uri (string) parameters define peering servers to be used for requesting peering authorization and routing information. At least one peering server must be configured. Others are required only if there are more than one peering servers. Each peering server address takes the form of a standard URL, and consists of up to four components:

*   An optional indication of the protocol to be used for communicating with the peering server. Both HTTP and HTTP secured with SSL/TLS are supported and are indicated by "http://" and "https://" respectively. If the protocol is not explicitly indicated, the OpenSIPS defaults to HTTP secured with SSL.
    
*   The Internet domain name for the peering server. An IP address may also be used, provided it is enclosed in square brackets such as \[172.16.1.1\].
    
*   An optional TCP port number for communicating with the peering server. If the port number is omitted, the OpenSIPS defaults to port 5045 (for HTTP) or port 1443 (for HTTP secured with SSL).
    
    The uniform resource identifier for requests to the peering server. This component is not optional and must be included.
    

**Example�1.3.�Setting the OSP servers**

modparam("osp","sp1\_uri","http://osptestserver.transnexus.com:5045/osp")
modparam("osp","sp2\_uri","https://\[1.2.3.4\]:1443/osp")
        

  

### 1.3.4.�`sp1_weight`, `sp2_weight`, ..., `sp16_weight`

These sp\_weight (integer) parameters are used for load balancing peering requests to peering servers. These parameters are most effective when configured as factors of 1000. For example, if sp1\_uri should manage twice the traffic load of sp2\_uri, then set sp1\_weight to 2000 and sp2\_weight to 1000. Shared load balancing between peering servers is recommended. However, peering servers can be configured as primary and backup by assigning a sp\_weight of 0 to the primary server and a non-zero sp\_weight to the back-up server. The default values for sp1\_weight and sp2\_weight are 1000.

**Example�1.4.�Setting the OSP server weights**

modparam("osp","sp1\_weight",1000)
        

  

### 1.3.5.�`device_ip`

The device\_ip (string) is a recommended parameter that explicitly defines the IP address of OpenSIPS in a peering request message (as SourceAlternate type=transport). The dotted-decimal IP address must be in brackets as shown in the example below.

**Example�1.5.�Setting the device IP address**

modparam("osp","device\_ip","\[127.0.0.1\]:5060")
        

  

### 1.3.6.�`use_security_features`

The use\_security\_features (integer) parameter instructs the OSP module how to use the OSP security features. If this value is set to 1, the OSP module uses the OSP security features. If this value is set to 0, the OSP module will not use the OSP security features. The default value is 0.

**Example�1.6.�Instructing the module not to use OSP security features**

modparam("osp","use\_security\_features",0)
        

  

### 1.3.7.�`token_format`

When OpenSIPS receives a SIP INVITE with a peering token, the OSP module will validate the token to determine whether or not the call has been authorized by a peering server. Peering tokens may, or may not, be digitally signed. The token\_format (integer) parameter defines if OpenSIPS will validate signed or unsigned tokens or both. The values for token format are defined below. The default value is 2.

If use\_security\_features parameter is set to 0, signed tokens cannot be validated.

0 - Validate only signed tokens. Calls with valid signed tokens are allowed.

1 - Validate only unsigned tokens. Calls with valid unsigned tokens are allowed.

2 - Validate both signed and unsigned tokens are allowed. Calls with valid tokens are allowed.

**Example�1.7.�Setting the token format**

modparam("osp","token\_format",2)
        

  

### 1.3.8.�`private_key`, `local_certificate`, `ca_certificates`

These parameters identify files are used for validating peering authorization tokens and establishing a secure channel between OpenSIPS and a peering server using SSL. The files are generated using the 'Enroll' utility from the OSP Toolkit. By default, the proxy will look for pkey.pem, localcert.pem, and cacart\_0.pem in the default configuration directory. The default config directory is set at compile time using CFG\_DIR and defaults to /usr/local/etc/opensips/. The files may be copied to the expected file location or the parameters below may be changed.

If use\_security\_features parameter is set to 0, these parameters will be ignored.

**Example�1.8.�Set authorization files**

If the default CFG\_DIR value was used at compile time, the files will be loaded from:

modparam("osp","private\_key","/usr/local/etc/opensips/pkey.pem")
modparam("osp","local\_certificate","/usr/local/etc/opensips/localcert.pem")
modparam("osp","ca\_certificates","/usr/local/etc/opensips/cacert.pem")
        

  

### 1.3.9.�`enable_crypto_hardware_support`

The enable\_crypto\_hardware\_support (integer) parameter is used to set the cryptographic hardware acceleration engine in the openssl library. The default value is 0 (no crypto hardware is present). If crypto hardware is used, the value should be set to 1.

**Example�1.9.�Setting the hardware support**

modparam("osp","enable\_crypto\_hardware\_support",0)
        

  

### 1.3.10.�`ssl_lifetime`

The ssl\_lifetime (integer) parameter defines the lifetime, in seconds, of a single SSL session key. Once this time limit is exceeded, the OSP module will negotiate a new session key. Communication exchanges in progress will not be interrupted when this time limit expires. This is an optional field with default value is 200 seconds.

**Example�1.10.�Setting the ssl lifetime**

modparam("osp","ssl\_lifetime",200)
        

  

### 1.3.11.�`persistence`

The persistence (integer) parameter defines the time, in seconds, that an HTTP connection should be maintained after the completion of a communication exchange. The OSP module will maintain the connection for this time period in anticipation of future communication exchanges to the same peering server.

**Example�1.11.�Setting the persistence**

modparam("osp","persistence",1000)
        

  

### 1.3.12.�`retry_delay`

The retry\_delay (integer) parameter defines the time, in seconds, between retrying connection attempts to an OSP peering server. After exhausting all peering servers the OSP module will delay for this amount of time before resuming connection attempts. This is an optional field with default value is 1 second.

**Example�1.12.�Setting the retry delay**

modparam("osp","retry\_delay",1)
        

  

### 1.3.13.�`retry_limit`

The retry\_limit (integer) parameter defines the maximum number of retries for connection attempts to a peering server. If no connection is established after this many retry attempts to all peering servers, the OSP module will cease connection attempts and return appropriate error codes. This number does not count the initial connection attempt, so that a retry\_limit of 1 will result in a total of two connection attempts to every peering server. The default value is 2.

**Example�1.13.�Setting the retry limit**

modparam("osp","retry\_limit",2)
        

  

### 1.3.14.�`timeout`

The timeout (integer) parameter defines the maximum time in milliseconds, to wait for a response from a peering server. If no response is received within this time, the current connection is aborted and the OSP module attempts to contact the next peering server. The default value is 10 seconds.

**Example�1.14.�Setting the timeout**

modparam("osp","timeout",10)
        

  

### 1.3.15.�`support_nonsip_protocol`

The support\_nonsip\_protocol (integer) parameter is used to tell the OSP module if non-SIP signaling protocol destination devices are supported. The default value is 0.

**Example�1.15.�Setting support non-SIP destination devices**

modparam("osp","support\_nonsip\_protocol",0)
        

  

### 1.3.16.�`max_destinations`

The max\_destinations (integer) parameter defines the maximum number of destinations that OpenSIPS requests the peering server to return in a peering response. The OSP module supports up to 12 destinations. The default value is 12.

**Example�1.16.�Setting the number of destination**

modparam("osp","max\_destinations",12)
        

  

### 1.3.17.�`report_networkid`

The report\_networkid (integer) parameter is used to tell the OSP module if to report network ID in completed call CDRs. If it is set to 0, ths OSP module does not report any network ID. If it is set to 1, the OSP module reports source network ID. If it is set to 2, the OSP module reports destination network ID. If it is set to 3, the OSP module report both source and destination network IDs. The default value is 3.

**Example�1.17.�Setting report network ID flag**

modparam("osp","report\_networkid",3)
        

  

### 1.3.18.�`validate_call_id`

The validate\_call\_id (integer) parameter instructs the OSP module to validate call id in the peering token. If this value is set to 1, the OSP module validates that the call id in the SIP INVITE message matches the call id in the peering token. If they do not match the INVITE is rejected. If this value is set to 0, the OSP module will not validate the call id in the peering token. The default value is 1.

**Example�1.18.�Instructing the module to validate call id**

modparam("osp","validate\_call\_id",1)
        

  

### 1.3.19.�`use_number_portability`

The use\_number\_portability (integer) parameter instructs the OSP module how to use the number portability parameters in the Request URI of the SIP INVITE message. If this value is set to 1, the OSP module uses the number portability parameters in the Request URI when these parameters exist. If this value is set to 0, the OSP module will not use the number portability parameters. The default value is 1.

**Example�1.19.�Instructing the module to use number portability parameters in Request URI**

modparam("osp","use\_number\_portablity",1)
        

  

### 1.3.20.�`append_userphone`

The append\_userphone (integer) parameter instructs the OSP module if to append "user=phone" parameter in URI. If this value is set to 0, the OSP module does not append "user=phone" parameter. If this value is set to 1, the OSP module will append "user=phone" parameter. The default value is 0

**Example�1.20.�Append user=phone parameter**

modparam("osp","append\_userphone",0)
        

  

### 1.3.21.�`networkid_location`

The networkid\_location (integer) parameter instructs the OSP module where the destination network ID should be appended. The default value is 2

0 - network ID is not appended.

1 - network ID is appended as userinfo parameter.

2 - network ID is appended as URI parameter.

**Example�1.21.�Append networkid location**

modparam("osp","networkid\_location",2)
        

  

### 1.3.22.�`networkid_parameter`

The networkid\_parameter (string) parameter instructs the OSP module to use which parameter name in outbound destination URIs to append destination network ID. The default value is "networkid"

**Example�1.22.�Networkid parameter name**

modparam("osp","networkid\_param","networkid")
        

  

### 1.3.23.�`switchid_location`

The switchid\_location (integer) parameter instructs the OSP module where the destination switch ID should be appended. The default value is 2

0 - switch ID is not appended.

1 - switch ID is appended as userinfo parameter.

2 - switch ID is appended as URI parameter.

**Example�1.23.�Append switchid location**

modparam("osp","switchid\_location",2)
        

  

### 1.3.24.�`switchid_parameter`

The switchid\_parameter (string) parameter instructs the OSP module to use which parameter name in outbound destination URIs to append destination switch ID. The default value is "switchid"

**Example�1.24.�Networkid parameter name**

modparam("osp","switchid\_param","switchid")
        

  

### 1.3.25.�`parameterstring_location`

The parameterstring\_location (integer) parameter instructs the OSP module where the parameter string should be appended. The default value is 0

0 - parameter string is not appended.

1 - parameter string is appended as userinfo parameter.

2 - parameter string is appended as URI parameter.

**Example�1.25.�Append parameter string location**

modparam("osp","parameterstring\_location",0)
        

  

### 1.3.26.�`parameterstring_value`

The parameterstring\_value (string) parameter instructs the OSP module to append the parameter string in outbound URIs. The default value is ""

**Example�1.26.�Parameter string value**

modparam("osp","parameterstring\_value","")
        

  

### 1.3.27.�`source_device_avp`

The source\_device\_avp (string) parameter instructs the OSP module to use the defined AVP to pass the source device IP value in the indirect work mode. The default value is "$avp(\_osp\_source\_device\_)". Then the source device IP can be set by "$avp(\_osp\_source\_device\_) = pseudo-variables". All pseudo variables are described in https://opensips.org/Resources/DocsCoreVar.

**Example�1.27.�Setting the source device IP AVP**

modparam("osp","source\_device\_avp","$avp(srcdev)")
        

  

### 1.3.28.�`source_networkid_avp`

The source\_networkid\_avp (string) parameter instructs the OSP module to use the defined AVP to pass the source network ID value. The default value is "$avp(\_osp\_source\_networkid\_)". Then the source network ID can be set by "$avp(\_osp\_source\_networkid\_) = pseudo-variables". All pseudo variables are described in https://opensips.org/Resources/DocsCoreVar.

**Example�1.28.�Setting the source network ID AVP**

modparam("osp","source\_networkid\_avp","$avp(snid)")
        

  

### 1.3.29.�`source_switchid_avp`

The source\_switchid\_avp (string) parameter instructs the OSP module to use the defined AVP to pass the source switch ID value. The default value is "$avp(\_osp\_source\_switchid\_)". Then the source switch ID can be set by "$avp(\_osp\_source\_switchid\_) = pseudo-variables". All pseudo variables are described in https://opensips.org/Resources/DocsCoreVar.

**Example�1.29.�Setting the source switch ID AVP**

modparam("osp","source\_switchid\_avp","$avp(swid)")
        

  

### 1.3.30.�`custom_info_avp`

The custom\_info\_avp (string) parameter instructs the OSP module to use the defined AVP to pass the custom information values. The default value is "$avp(\_osp\_custom\_info\_)". Then the custom information can be set by "$avp(\_osp\_custom\_info\_) = pseudo-variables". All pseudo variables are described in https://opensips.org/Resources/DocsCoreVar.

**Example�1.30.�Setting the custom info AVP**

modparam("osp","custom\_info\_avp","$avp(cinfo)")
        

  

### 1.3.31.�`cnam_avp`

The cnam\_avp (string) parameter instructs the OSP module to use the defined AVP to pass the CNAM values. The default value is "$avp(\_osp\_cnam\_)". Then the CNAM can be used by "$avp(\_osp\_cnam\_)". All pseudo variables are described in https://opensips.org/Resources/DocsCoreVar.

**Example�1.31.�Setting the CNAM AVP**

modparam("osp","cnam\_avp","$avp(cnam)")
        

  

### 1.3.32.�`extraheaders_value`

The extraheaders\_value (string) parameter instructs the OSP module to append the defined SIP headers in outbound SIP NOTIFY messages. The default value is empty.

**Example�1.32.�Setting the NOTIFY extra headers**

modparam("osp", "extraheaders\_value", "Source: N")
        

  

### 1.3.33.�`source_media_avp, destination_media_avp`

These parameters are used to tell the OSP module which AVPs are used to store media addresses. The default values are "$avp(\_osp\_source\_media\_address\_)" and "$avp(\_osp\_destination\_media\_address\_)". All pseudo variables are described in https://opensips.org/Resources/DocsCoreVar.

**Example�1.33.�Setting the media address AVPs**

modparam("osp", "source\_media\_avp", "$avp(srcmedia)")
modparam("osp", "destination\_media\_avp", "$avp(destmedia)")
        

  

### 1.3.34.�`request_date_avp`

The request\_date\_avp (string) parameter instructs the OSP module to use the defined AVP to pass the SIP request Date header values. The default value is "$avp(\_osp\_request\_date\_)". Then the request date can be used by "$avp(\_osp\_request\_date\_)". All pseudo variables are described in https://opensips.org/Resources/DocsCoreVar.

**Example�1.34.�Setting the request date AVP**

modparam("osp","request\_date\_avp","$avp(reqdate)")
        

  

### 1.3.35.�`sdp_fingerprint_avp`

The sdp\_fingerprint\_avp (string) parameter instructs the OSP module to use the defined AVP to pass the SDP fing print attribute values. The default value is "$avp(\_osp\_sdp\_fingerprint\_)". Then the SDP finger print attributes can be used by "$avp(\_osp\_sdp\_fingerprint\_)". All pseudo variables are described in https://opensips.org/Resources/DocsCoreVar.

**Example�1.35.�Setting the SDP finger print AVP**

modparam("osp","sdp\_fingerprint\_avp","$avp(sdpfp)")
        

  

### 1.3.36.�`identity_signature_avp`, `identity_algorithm_avp`, `identity_information_avp`, `identity_type_avp`, `identity_canon_avp`

These parameters instruct the OSP module to use the defined AVPs to pass the Identity related values. The default values are "$avp(\_osp\_identity\_signature\_)", "$avp(\_osp\_identity\_algorithm\_)", "$avp(\_osp\_identity\_information\_)", "$avp(\_osp\_identity\_type\_)", "$avp(\_osp\_identity\_canon\_)". Then the indentity related values can be used by these AVPs. All pseudo variables are described in https://opensips.org/Resources/DocsCoreVar.

**Example�1.36.�Setting the Identity related AVPs**

modparam("osp","identity\_signature\_avp","$avp(idsign)")
modparam("osp","identity\_algorithm\_avp","$avp(idalg)")
modparam("osp","identity\_information\_avp","$avp(idinfo)")
modparam("osp","identity\_type\_avp","$avp(idtype)")
modparam("osp","identity\_canon\_avp","$avp(idcanon)")
        

  

### 1.3.37.�`service_provider_avp`

These parameter is used to tell the OSP module which AVP is used to store source service provider information. The default value is "$avp(\_osp\_service\_provider\_)". All pseudo variables are described in https://opensips.org/Resources/DocsCoreVar.

**Example�1.37.�Setting the source service provider AVP**

modparam("osp", "service\_provider\_avp", "$avp(sp)")
        

  

### 1.3.38.�`user_group_avp`

These parameter is used to tell the OSP module which AVP is used to store source user group information. The default value is "$avp(\_osp\_user\_group\_)". All pseudo variables are described in https://opensips.org/Resources/DocsCoreVar.

**Example�1.38.�Setting the source user group AVP**

modparam("osp", "user\_group\_avp", "$avp(groupid)")
        

  

### 1.3.39.�`user_id_avp`

These parameter is used to tell the OSP module which AVP is used to store source user ID information. The default value is "$avp(\_osp\_user\_id\_)". All pseudo variables are described in https://opensips.org/Resources/DocsCoreVar.

**Example�1.39.�Setting the source user ID AVP**

modparam("osp", "user\_id\_avp", "$avp(userid)")
        

  

## 1.4.�Exported Functions

### 1.4.1.�`checkospheader()`

This function checks for the existence of the OSP-Auth-Token header field.

This function can be used from REQUEST\_ROUTE.

**Example�1.40.�checkospheader usage**

...
if (checkospheader()) {
  log(1,"OSP header field found.\\n");
} else {
  log(1,"no OSP header field present\\n");
};
...
        

  

### 1.4.2.�`validateospheader()`

This function validates an OSP-Token specified in the OSP-Auth-Tokenheader field of the SIP message. If a peering token is present, it will be validated locally. If no OSP header is found or the header token is invalid or expired, -1 is returned; on successful validation 1 is returned.

This function can be used from REQUEST\_ROUTE.

**Example�1.41.�validateospheader usage**

...
if (validateospheader()) {
  log(1,"valid OSP header found\\n");
} else {
  log(1,"OSP header not found, invalid or expired\\n");
};
...
        

  

### 1.4.3.�`getlocaladdress()`

This function gets the receiving IP address of SIP response and stores it as proxy egress address.

This function can be used from ONREPLY\_ROUTE.

**Example�1.42.�getlocaladress usage**

...
if (getlocaladdress()) {
  log(1,"Obtain proxy local egress address\\n");
} else {
  log(1,"Failed to get proxy local egress address\\n");
};
...
        

  

### 1.4.4.�`setrequestdate()`

This function gets the receiving IP address of SIP response and stores it as proxy egress address.

This function can be used from REQUEST\_ROUTE.

**Example�1.43.�setrequestdate usage**

...
if (setrequest()) {
  log(1,"Set request date\\n");
} else {
  log(1,"Failed to set request date\\n");
};
...
        

  

### 1.4.5.�`requestosprouting()`

This function launches a query to the peering server requesting the IP address of one or more destination peers serving the called party. If destination peers are available, the peering server will return the IP address and a peering authorization token for each destination peer. The OSP-Auth-Token Header field is inserted into the SIP message and the SIP uri is rewritten to the IP address of destination peer provided by the peering server.

The address of the called party must be a valid E164 number, otherwise this function returns -1. If the transaction was accepted by the peering server, the uri is being rewritten and 1 returned, on errors (peering servers are not available, authentication failed or there is no route to destination or the route is blocked) -1 is returned.

This function can be used from REQUEST\_ROUTE.

**Example�1.44.�requestosprouting usage**

...
if (requestosprouting()) {
  log(1,"successfully queried OSP server, now relaying call\\n");
} else {
  log(1,"Authorization request was rejected from OSP server\\n");
};
...
        

  

### 1.4.6.�`checkosproute()`

This function is used to check if there is any route for the call.

This function can be used from REQUEST\_ROUTE.

**Example�1.45.�checkosproute usage**

...
if (checkosproute()) {
  log(1,"There is at least one route for the call\\n");
} else {
  log(1,"There is not any route for the call\\n");
};
...
        

  

### 1.4.7.�`prepareosproute()`

This function tries to prepare the INVITE to be forwarded using the destination in the list returned by the peering server. If the calling number is translated, a RPID value for the RPID AVP will be set. If the route could not be prepared, the function returns 'FALSE' back to the script, which can then decide how to handle the failure. Note, if checkosproute has been called and returns 'TRUE' before calling prepareosproute, prepareosproute should not return 'FALSE' because checkosproute has confirmed that there is at least one route.

This function can be used from BRANCH\_ROUTE.

**Example�1.46.�prepareosproute usage**

...
if (prepareosproute()) {
  log(1,"successfully prepared the route, now relaying call\\n");
} else {
  log(1,"could not prepare the route, there is not route\\n");
};
...
        

  

### 1.4.8.�`prepareospresponse()`

This function tries to prepare all the routes in the list returned by the peering server into SIP 300 Redirect or SIP 380 Alternative Service message. The message is then replied to the source. If unsuccessful in preparing the routes a SIP 500 is sent back and a trace message is logged.

This function can be used from REQUEST\_ROUTE.

**Example�1.47.�prepareospresponse usage**

...
if (prepareospresponse()) {
  log(1,"Response is prepared.\\n");
} else {
  log(1,"Could not prepare the response.\\n");
};
...
        

  

### 1.4.9.�`prepareallosproutes()`

This function tries to prepare all the routes in the list returned by the peering server. The message is then forked off to the destinations. If unsuccessful in preparing the routes a SIP 500 is sent back and a trace message is logged.

This function can be used from REQUEST\_ROUTE.

**Example�1.48.�prepareallosproutes usage**

...
if (prepareallosproutes()) {
  log(1,"Routes are prepared, now forking the call\\n");
} else {
  log(1,"Could not prepare the routes. No destination available\\n");
};
...
        

  

### 1.4.10.�`checkcallingtranslation()`

This function is used to check if the calling number is translated. Before calling checkcallingtranslation, prepareosproute should be called. If the calling number does been translated, the original Remote-Party-ID, if it exists, should be removed from the INVITE message. And a new Remote-Party-ID header should be added (a RPID value for the RPID AVP has been set by prepareosproute). If the calling number is not translated, nothing should be done.

This function can be used from BRANCH\_ROUTE.

**Example�1.49.�checkcallingtranslation usage**

...
if (checkcallingtranslation()) {
  # Remove the Remote\_Party-ID from the received message
  # Otherwise it will be forwarded on to the next hop
  remove\_hf("Remote-Party-ID");

  # Append a new Remote\_Party
  append\_rpid\_hf();
}
...
        

  

### 1.4.11.�`reportospusage()`

This function should be called after receiving a BYE message. If the message contains an OSP cookie, the function will forward originating and/or terminating duration usage information to a peering server. The function returns TRUE if the BYE includes an OSP cookie. The actual usage message will be send on a different thread and will not delay BYE processing. The function should be called before relaying the message.

Meaning of the parameter is as follows:

*   0 - Source device releases the call.
    
*   1 - Destination device releases the call.
    

This function can be used from REQUEST\_ROUTE.

**Example�1.50.�reportospusage usage**

...
if (is\_direction("downstream")) {
  log(1,"This BYE message is from SOURCE\\n");
  if (!reportospusage(0)) {
    log(1,"This BYE message does not include OSP usage information\\n");
  }
} else {
  log(1,"This BYE message is from DESTINATION\\n");
  if (!reportospusage(1)) {
    log(1,"This BYE message does not include OSP usage information\\n");
  }
}
...
        

  

### 1.4.12.�`processsubscribe([cachedcnamrecord])`

This function should be called after receiving a SUBSCRIBE for CNAM message and there is a cached CNAM record for this message. This function generates a NOTIFY message including the cached CNAM record, then sends the NOTIFY message to the device sending the SUBSCRIBE message.

Meaning of the parameter is as follows:

*   _cachedcnamrecord_ (string) - Cached CNAM record.
    

This function can be used from REQUEST\_ROUTE.

**Example�1.51.�processsubscribe usage**

...
if (is\_method("SUBSCRIBE")) {
    if (($var(sevent) == "calling-name") && (is\_myself("$rd"))) {
        if ($var(cnamrecord) != NULL) {
            processsubscribe($(var(cnamrecord){s.b64decode}));
        } else {
            t\_relay("1.2.3.4", 0x02);
        }
    } else {
        t\_relay();
    }
}
...
        

  

## Chapter�2.�Developer Guide

The functions of the OSP modules are not used by other OpenSIPS modules.

## Chapter�3.�Contributors

## 3.1.�By Commit Statistics

**Table�3.1.�Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)**

�

Name

DevScore

Commits

Lines ++

Lines --

1.

Di-Shi Sun ([@di-shi](https://github.com/di-shi))

278

101

10368

5372

2.

Dmitry Isakbayev

43

5

4120

159

3.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

37

31

232

217

4.

Di-Shi Sun

18

2

1006

386

5.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

17

13

117

126

6.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

15

13

81

48

7.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

13

10

83

62

8.

Zero King ([@l2dy](https://github.com/l2dy))

10

8

20

23

9.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

10

7

70

66

10.

Ancuta Onofrei

9

1

206

318

  

**All remaining contributors**: Maksym Sobolyev ([@sobomax](https://github.com/sobomax)), Dan Pascu ([@danpascu](https://github.com/danpascu)), Henning Westerholt ([@henningw](https://github.com/henningw)), Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)), Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)), Konstantin Bokarius, fabriziopicconi, Andreas Granig, Ezequiel Lovelle ([@lovelle](https://github.com/lovelle)), Juli�n Moreno Pati�o, Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Ralf Zerres, Edson Gellert Schubert.

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 3.2.�By Commit Activity

**Table�3.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Jan 2006 - May 2025

2.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Sep 2020 - Jun 2024

3.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Jun 2011 - Feb 2024

4.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Mar 2014 - May 2023

5.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - May 2023

6.

Zero King ([@l2dy](https://github.com/l2dy))

Mar 2020 - Mar 2020

7.

Dan Pascu ([@danpascu](https://github.com/danpascu))

Nov 2008 - Jul 2019

8.

Ralf Zerres

May 2019 - May 2019

9.

Di-Shi Sun

Oct 2018 - Feb 2019

10.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

  

**All remaining contributors**: Di-Shi Sun ([@di-shi](https://github.com/di-shi)), Juli�n Moreno Pati�o, Ezequiel Lovelle ([@lovelle](https://github.com/lovelle)), fabriziopicconi, Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)), Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)), Henning Westerholt ([@henningw](https://github.com/henningw)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Ancuta Onofrei, Dmitry Isakbayev, Andreas Granig.

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�4.�Documentation

## 4.1.�Contributors

**Last edited by:** Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Zero King ([@l2dy](https://github.com/l2dy)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Di-Shi Sun, Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Di-Shi Sun ([@di-shi](https://github.com/di-shi)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Dmitry Isakbayev.

_Documentation Copyrights:_

Copyright � 2003 FhG FOKUS