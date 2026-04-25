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