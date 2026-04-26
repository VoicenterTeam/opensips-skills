# osp Module Reference
<!-- generated-from: data/3.4/modules/osp.json
     generator-version: 0.1.0
     opensips-version: 3.4
     doc-type: module -->

Reference for the OpenSIPs 3.4 osp module. Read this file when configuring or debugging the osp module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Configuration Examples](#configuration-examples)

## Overview

The OSP module enables OpenSIPS to support secure, multi-lateral peering using the OSP standard defined by ETSI (TS 101 321 V4.1.1). This module will enable your OpenSIPS to:

*   Send a peering authorization request to a peering server.
    
*   Validate a digitally signed peering authorization token received in a SIP INVITE message.
    
*   Report usage information to a peering server.

## Dependencies

### OpenSIPs Modules

- `auth` — Authentication Framework module
- `avpops` — AVP operation module
- `maxfwd` — Max-Forward processor module
- `mi_fifo` — FIFO support for Management Interface
- `options` — OPTIONS server replier module
- `proto_udp` — UDP protocol module - implements UDP-plain transport for SIP
- `registrar` — SIP Registrar implementation module
- `rr` — Record-Route and Route module
- `signaling` — SIP signaling module
- `sipmsgops` — SIP operations module
- `sl` — Stateless replier module
- `tm` — Transaction (stateful) module
- `uac` — UAC functionalies (FROM mangling and UAC auth)
- `uac_auth` — UAC Authentication functionality
- `usrloc` — User location implementation module

### External Libraries

- `OSP Toolkit` — The OSP Toolkit, available from https://github.com/TransNexus/osptoolkit, must be built before building OpenSIPS with the OSP module. For instructions on building OpenSIPS with the OSP Toolkit, see http://www.http://transnexus.com/wp-content/uploads/OSP-Routing-and-CDR-Collection-Server-with-OpenSIPS-1.7.2.pdf. For OpenSIPS 2.4.0, OSP Toolkit 4.16.0 or later versions should be used.

## Exported Parameters

### `append_userphone` (integer)

The append_userphone (integer) parameter instructs the OSP module if to append "user=phone" parameter in URI. If this value is set to 0, the OSP module does not append "user=phone" parameter. If this value is set to 1, the OSP module will append "user=phone" parameter.

*Default value is 0.*

**Possible values:**

- 0
- 1

**Example.** Set the `append_userphone` parameter.

```opensips
modparam("osp","append_userphone",0)
```
### `ca_certificates` (string)

These parameters identify files are used for validating peering authorization tokens and establishing a secure channel between OpenSIPS and a peering server using SSL. The files are generated using the 'Enroll' utility from the OSP Toolkit. By default, the proxy will look for pkey.pem, localcert.pem, and cacart_0.pem in the default configuration directory. The default config directory is set at compile time using CFG_DIR and defaults to /usr/local/etc/opensips/. The files may be copied to the expected file location or the parameters below may be changed.

*Default value is cacert_0.pem.*

**Notes:** If use_security_features parameter is set to 0, these parameters will be ignored.

**Example.** Set the `ca_certificates` parameter.

```opensips
modparam("osp","ca_certificates","/usr/local/etc/opensips/cacert.pem")
```
### `cnam_avp` (string)

The cnam_avp (string) parameter instructs the OSP module to use the defined AVP to pass the CNAM values. Then the CNAM can be used by "$avp(_osp_cnam_)". All pseudo variables are described in https://opensips.org/Resources/DocsCoreVar.

*Default value is $avp(_osp_cnam_).*

**Example.** $avp(cnam).

```opensips
modparam("osp","cnam_avp","$avp(cnam)")
```
### `custom_info_avp` (string)

The custom_info_avp (string) parameter instructs the OSP module to use the defined AVP to pass the custom information values. Then the custom information can be set by "$avp(_osp_custom_info_) = pseudo-variables". All pseudo variables are described in https://opensips.org/Resources/DocsCoreVar.

*Default value is $avp(_osp_custom_info_).*

**Example.** $avp(cinfo).

```opensips
modparam("osp","custom_info_avp","$avp(cinfo)")
```
### `destination_media_avp` (string)

These parameters are used to tell the OSP module which AVPs are used to store media addresses. The default values are "$avp(_osp_source_media_address_)" and "$avp(_osp_destination_media_address_)". All pseudo variables are described in https://opensips.org/Resources/DocsCoreVar.

*Default value is $avp(_osp_destination_media_address_).*

**Notes:** All pseudo variables are described in https://opensips.org/Resources/DocsCoreVar.

**Example.** Set the `destination_media_avp` parameter.

```opensips
modparam("osp", "destination_media_avp", "$avp(destmedia)")
```
### `device_ip` (string)

The device_ip (string) is a recommended parameter that explicitly defines the IP address of OpenSIPS in a peering request message (as SourceAlternate type=transport). The dotted-decimal IP address must be in brackets as shown in the example below.

**Example.** \[127.0.0.1\]:5060.

```opensips
modparam("osp","device_ip","\[127.0.0.1\]:5060")
```
### `enable_crypto_hardware_support` (integer)

The enable_crypto_hardware_support (integer) parameter is used to set the cryptographic hardware acceleration engine in the openssl library. The default value is 0 (no crypto hardware is present). If crypto hardware is used, the value should be set to 1.

*Default value is 0.*

**Possible values:**

- 0
- 1

**Example.** 0.

```opensips
modparam("osp","enable_crypto_hardware_support",0)
```
### `extraheaders_value` (string)

The extraheaders_value (string) parameter instructs the OSP module to append the defined SIP headers in outbound SIP NOTIFY messages.

**Example.** Source: N.

```opensips
modparam("osp", "extraheaders_value", "Source: N")
```
### `identity_algorithm_avp` (string)

These parameters instruct the OSP module to use the defined AVPs to pass the Identity related values. The default values are "$avp(_osp_identity_signature_)", "$avp(_osp_identity_algorithm_)", "$avp(_osp_identity_information_)", "$avp(_osp_identity_type_)", "$avp(_osp_identity_canon_)". Then the indentity related values can be used by these AVPs. All pseudo variables are described in https://opensips.org/Resources/DocsCoreVar.

*Default value is $avp(_osp_identity_algorithm_).*

**Notes:** All pseudo variables are described in https://opensips.org/Resources/DocsCoreVar.

**Example.** Set the `identity_algorithm_avp` parameter.

```opensips
modparam("osp","identity_algorithm_avp","$avp(idalg)")
```
### `identity_canon_avp` (string)

These parameters instruct the OSP module to use the defined AVPs to pass the Identity related values. Then the indentity related values can be used by these AVPs. All pseudo variables are described in https://opensips.org/Resources/DocsCoreVar.

*Default value is $avp(_osp_identity_canon_).*

**Example.** $avp(idcanon).

```opensips
modparam("osp","identity_canon_avp","$avp(idcanon)")
```
### `identity_information_avp` (string)

These parameters instruct the OSP module to use the defined AVPs to pass the Identity related values. Then the indentity related values can be used by these AVPs. All pseudo variables are described in https://opensips.org/Resources/DocsCoreVar.

*Default value is $avp(_osp_identity_information_).*

**Example.** $avp(idinfo).

```opensips
modparam("osp","identity_information_avp","$avp(idinfo)")
```
### `identity_signature_avp` (string)

These parameters instruct the OSP module to use the defined AVPs to pass the Identity related values. The default values are "$avp(_osp_identity_signature_)", "$avp(_osp_identity_algorithm_)", "$avp(_osp_identity_information_)", "$avp(_osp_identity_type_)", "$avp(_osp_identity_canon_)". Then the indentity related values can be used by these AVPs. All pseudo variables are described in https://opensips.org/Resources/DocsCoreVar.

*Default value is $avp(_osp_identity_signature_).*

**Notes:** All pseudo variables are described in https://opensips.org/Resources/DocsCoreVar.

**Example.** Set the `identity_signature_avp` parameter.

```opensips
modparam("osp","identity_signature_avp","$avp(idsign)")
```
### `identity_type_avp` (string)

These parameters instruct the OSP module to use the defined AVPs to pass the Identity related values. Then the indentity related values can be used by these AVPs. All pseudo variables are described in https://opensips.org/Resources/DocsCoreVar.

*Default value is $avp(_osp_identity_type_).*

**Example.** $avp(idtype).

```opensips
modparam("osp","identity_type_avp","$avp(idtype)")
```
### `local_certificate` (string)

These parameters identify files are used for validating peering authorization tokens and establishing a secure channel between OpenSIPS and a peering server using SSL. The files are generated using the 'Enroll' utility from the OSP Toolkit. By default, the proxy will look for pkey.pem, localcert.pem, and cacart_0.pem in the default configuration directory. The default config directory is set at compile time using CFG_DIR and defaults to /usr/local/etc/opensips/. The files may be copied to the expected file location or the parameters below may be changed.

*Default value is localcert.pem.*

**Notes:** If use_security_features parameter is set to 0, these parameters will be ignored.

**Example.** Set the `local_certificate` parameter.

```opensips
modparam("osp","local_certificate","/usr/local/etc/opensips/localcert.pem")
```
### `max_destinations` (integer)

The max_destinations (integer) parameter defines the maximum number of destinations that OpenSIPS requests the peering server to return in a peering response. The OSP module supports up to 12 destinations.

*Default value is 12.*

*Valid range: up to 12.*

**Example.** 12.

```opensips
modparam("osp","max_destinations",12)
```
### `networkid_location` (integer)

The networkid_location (integer) parameter instructs the OSP module where the destination network ID should be appended.

*Default value is 2.*

**Possible values:**

- 0
- 1
- 2

**Example.** Set the `networkid_location` parameter.

```opensips
modparam("osp","networkid_location",2)
```
### `networkid_parameter` (string)

The networkid_parameter (string) parameter instructs the OSP module to use which parameter name in outbound destination URIs to append destination network ID.

*Default value is networkid.*

**Example.** Set the `networkid_parameter` parameter.

```opensips
modparam("osp","networkid_param","networkid")
```
### `parameterstring_location` (integer)

The parameterstring_location (integer) parameter instructs the OSP module where the parameter string should be appended.

*Default value is 0.*

**Possible values:**

- 0 - parameter string is not appended.
- 1 - parameter string is appended as userinfo parameter.
- 2 - parameter string is appended as URI parameter.

**Example.** 0.

```opensips
modparam("osp","parameterstring_location",0)
```
### `parameterstring_value` (string)

The parameterstring_value (string) parameter instructs the OSP module to append the parameter string in outbound URIs.

**Example.** Set the `parameterstring_value` parameter.

```opensips
modparam("osp","parameterstring_value","")
```
### `persistence` (integer)

The persistence (integer) parameter defines the time, in seconds, that an HTTP connection should be maintained after the completion of a communication exchange. The OSP module will maintain the connection for this time period in anticipation of future communication exchanges to the same peering server.

**Example.** 1000.

```opensips
modparam("osp","persistence",1000)
```
### `private_key` (string)

These parameters identify files are used for validating peering authorization tokens and establishing a secure channel between OpenSIPS and a peering server using SSL. The files are generated using the 'Enroll' utility from the OSP Toolkit. By default, the proxy will look for pkey.pem, localcert.pem, and cacart_0.pem in the default configuration directory. The default config directory is set at compile time using CFG_DIR and defaults to /usr/local/etc/opensips/. The files may be copied to the expected file location or the parameters below may be changed.

*Default value is pkey.pem.*

**Notes:** If use_security_features parameter is set to 0, these parameters will be ignored.

**Example.** Set the `private_key` parameter.

```opensips
modparam("osp","private_key","/usr/local/etc/opensips/pkey.pem")
```
### `report_networkid` (integer)

The report_networkid (integer) parameter is used to tell the OSP module if to report network ID in completed call CDRs.

*Default value is 3.*

**Possible values:**

- 0
- 1
- 2
- 3

**Example.** 3.

```opensips
modparam("osp","report_networkid",3)
```
### `request_date_avp` (string)

The request_date_avp (string) parameter instructs the OSP module to use the defined AVP to pass the SIP request Date header values. The default value is "$avp(_osp_request_date_)". Then the request date can be used by "$avp(_osp_request_date_)". All pseudo variables are described in https://opensips.org/Resources/DocsCoreVar.

*Default value is $avp(_osp_request_date_).*

**Notes:** All pseudo variables are described in https://opensips.org/Resources/DocsCoreVar.

**Example.** Set the `request_date_avp` parameter.

```opensips
modparam("osp","request_date_avp","$avp(reqdate)")
```
### `retry_delay` (integer)

The retry_delay (integer) parameter defines the time, in seconds, between retrying connection attempts to an OSP peering server. After exhausting all peering servers the OSP module will delay for this amount of time before resuming connection attempts. This is an optional field with default value is 1 second.

*Default value is 1.*

**Example.** 1.

```opensips
modparam("osp","retry_delay",1)
```
### `retry_limit` (integer)

The retry_limit (integer) parameter defines the maximum number of retries for connection attempts to a peering server. If no connection is established after this many retry attempts to all peering servers, the OSP module will cease connection attempts and return appropriate error codes. This number does not count the initial connection attempt, so that a retry_limit of 1 will result in a total of two connection attempts to every peering server. The default value is 2.

*Default value is 2.*

**Example.** 2.

```opensips
modparam("osp","retry_limit",2)
```
### `sdp_fingerprint_avp` (string)

The sdp_fingerprint_avp (string) parameter instructs the OSP module to use the defined AVP to pass the SDP fing print attribute values. The default value is "$avp(_osp_sdp_fingerprint_)". Then the SDP finger print attributes can be used by "$avp(_osp_sdp_fingerprint_)". All pseudo variables are described in https://opensips.org/Resources/DocsCoreVar.

*Default value is $avp(_osp_sdp_fingerprint_).*

**Notes:** All pseudo variables are described in https://opensips.org/Resources/DocsCoreVar.

**Example.** Set the `sdp_fingerprint_avp` parameter.

```opensips
modparam("osp","sdp_fingerprint_avp","$avp(sdpfp)")
```
### `service_provider_avp` (string)

These parameter is used to tell the OSP module which AVP is used to store source service provider information. All pseudo variables are described in https://opensips.org/Resources/DocsCoreVar.

*Default value is $avp(_osp_service_provider_).*

**Example.** $avp(sp).

```opensips
modparam("osp", "service_provider_avp", "$avp(sp)")
```
### `service_type` (integer)

The service_type (integer) parameter instructs the OSP module what services it should provide. If this value is set to 0, the OSP module provides normal voice service. If this value is set to 1, the OSP module provides ported number query service. If this value is set to 2, the OSP module provides CNAM query service. The default value is 0.

*Default value is 0.*

**Possible values:**

- 0
- 1
- 2

**Example.** Set the `service_type` parameter.

```opensips
modparam("osp","service_type",0)
```
### `source_device_avp` (string)

The source_device_avp (string) parameter instructs the OSP module to use the defined AVP to pass the source device IP value in the indirect work mode. Then the source device IP can be set by "$avp(_osp_source_device_) = pseudo-variables". All pseudo variables are described in https://opensips.org/Resources/DocsCoreVar.

*Default value is $avp(_osp_source_device_).*

**Example.** $avp(srcdev).

```opensips
modparam("osp","source_device_avp","$avp(srcdev)")
```
### `source_media_avp` (string)

These parameters are used to tell the OSP module which AVPs are used to store media addresses. All pseudo variables are described in https://opensips.org/Resources/DocsCoreVar.

*Default value is $avp(_osp_source_media_address_).*

**Example.** $avp(srcmedia).

```opensips
modparam("osp", "source_media_avp", "$avp(srcmedia)")
```
### `source_networkid_avp` (string)

The source_networkid_avp (string) parameter instructs the OSP module to use the defined AVP to pass the source network ID value. Then the source network ID can be set by "$avp(_osp_source_networkid_) = pseudo-variables". All pseudo variables are described in https://opensips.org/Resources/DocsCoreVar.

*Default value is $avp(_osp_source_networkid_).*

**Example.** $avp(snid).

```opensips
modparam("osp","source_networkid_avp","$avp(snid)")
```
### `source_switchid_avp` (string)

The source_switchid_avp (string) parameter instructs the OSP module to use the defined AVP to pass the source switch ID value. Then the source switch ID can be set by "$avp(_osp_source_switchid_) = pseudo-variables". All pseudo variables are described in https://opensips.org/Resources/DocsCoreVar.

*Default value is $avp(_osp_source_switchid_).*

**Example.** $avp(swid).

```opensips
modparam("osp","source_switchid_avp","$avp(swid)")
```
### `sp10_uri` (string)

These sp_uri (string) parameters define peering servers to be used for requesting peering authorization and routing information. At least one peering server must be configured. Others are required only if there are more than one peering servers. Each peering server address takes the form of a standard URL, and consists of up to four components:

*   An optional indication of the protocol to be used for communicating with the peering server. Both HTTP and HTTP secured with SSL/TLS are supported and are indicated by "http://" and "https://" respectively. If the protocol is not explicitly indicated, the OpenSIPS defaults to HTTP secured with SSL.
    
*   The Internet domain name for the peering server. An IP address may also be used, provided it is enclosed in square brackets such as \[172.16.1.1\].
    
*   An optional TCP port number for communicating with the peering server. If the port number is omitted, the OpenSIPS defaults to port 5045 (for HTTP) or port 1443 (for HTTP secured with SSL).
    
    The uniform resource identifier for requests to the peering server. This component is not optional and must be included.

**Example.** http://osptestserver.transnexus.com:5045/osp.

```opensips
modparam("osp","sp1_uri","http://osptestserver.transnexus.com:5045/osp")
modparam("osp","sp2_uri","https://\[1.2.3.4\]:1443/osp")
```
### `sp10_weight` (integer)

These sp_weight (integer) parameters are used for load balancing peering requests to peering servers. These parameters are most effective when configured as factors of 1000. For example, if sp1_uri should manage twice the traffic load of sp2_uri, then set sp1_weight to 2000 and sp2_weight to 1000. Shared load balancing between peering servers is recommended. However, peering servers can be configured as primary and backup by assigning a sp_weight of 0 to the primary server and a non-zero sp_weight to the back-up server. The default values for sp1_weight and sp2_weight are 1000.

**Example.** 1000.

```opensips
modparam("osp","sp1_weight",1000)
```
### `sp11_uri` (string)

These sp_uri (string) parameters define peering servers to be used for requesting peering authorization and routing information. At least one peering server must be configured. Others are required only if there are more than one peering servers. Each peering server address takes the form of a standard URL, and consists of up to four components:

*   An optional indication of the protocol to be used for communicating with the peering server. Both HTTP and HTTP secured with SSL/TLS are supported and are indicated by "http://" and "https://" respectively. If the protocol is not explicitly indicated, the OpenSIPS defaults to HTTP secured with SSL.
    
*   The Internet domain name for the peering server. An IP address may also be used, provided it is enclosed in square brackets such as \[172.16.1.1\].
    
*   An optional TCP port number for communicating with the peering server. If the port number is omitted, the OpenSIPS defaults to port 5045 (for HTTP) or port 1443 (for HTTP secured with SSL).
    
    The uniform resource identifier for requests to the peering server. This component is not optional and must be included.

**Example.** http://osptestserver.transnexus.com:5045/osp.

```opensips
modparam("osp","sp1_uri","http://osptestserver.transnexus.com:5045/osp")
modparam("osp","sp2_uri","https://\[1.2.3.4\]:1443/osp")
```
### `sp11_weight` (integer)

These sp_weight (integer) parameters are used for load balancing peering requests to peering servers. These parameters are most effective when configured as factors of 1000. For example, if sp1_uri should manage twice the traffic load of sp2_uri, then set sp1_weight to 2000 and sp2_weight to 1000. Shared load balancing between peering servers is recommended. However, peering servers can be configured as primary and backup by assigning a sp_weight of 0 to the primary server and a non-zero sp_weight to the back-up server. The default values for sp1_weight and sp2_weight are 1000.

**Example.** 1000.

```opensips
modparam("osp","sp1_weight",1000)
```
### `sp12_uri` (string)

These sp_uri (string) parameters define peering servers to be used for requesting peering authorization and routing information. At least one peering server must be configured. Others are required only if there are more than one peering servers. Each peering server address takes the form of a standard URL, and consists of up to four components:

*   An optional indication of the protocol to be used for communicating with the peering server. Both HTTP and HTTP secured with SSL/TLS are supported and are indicated by "http://" and "https://" respectively. If the protocol is not explicitly indicated, the OpenSIPS defaults to HTTP secured with SSL.
    
*   The Internet domain name for the peering server. An IP address may also be used, provided it is enclosed in square brackets such as \[172.16.1.1\].
    
*   An optional TCP port number for communicating with the peering server. If the port number is omitted, the OpenSIPS defaults to port 5045 (for HTTP) or port 1443 (for HTTP secured with SSL).
    
    The uniform resource identifier for requests to the peering server. This component is not optional and must be included.

**Example.** http://osptestserver.transnexus.com:5045/osp.

```opensips
modparam("osp","sp1_uri","http://osptestserver.transnexus.com:5045/osp")
modparam("osp","sp2_uri","https://\[1.2.3.4\]:1443/osp")
```
### `sp12_weight` (integer)

These sp_weight (integer) parameters are used for load balancing peering requests to peering servers. These parameters are most effective when configured as factors of 1000. For example, if sp1_uri should manage twice the traffic load of sp2_uri, then set sp1_weight to 2000 and sp2_weight to 1000. Shared load balancing between peering servers is recommended. However, peering servers can be configured as primary and backup by assigning a sp_weight of 0 to the primary server and a non-zero sp_weight to the back-up server. The default values for sp1_weight and sp2_weight are 1000.

**Example.** 1000.

```opensips
modparam("osp","sp1_weight",1000)
```
### `sp13_uri` (string)

These sp_uri (string) parameters define peering servers to be used for requesting peering authorization and routing information. At least one peering server must be configured. Others are required only if there are more than one peering servers. Each peering server address takes the form of a standard URL, and consists of up to four components:

*   An optional indication of the protocol to be used for communicating with the peering server. Both HTTP and HTTP secured with SSL/TLS are supported and are indicated by "http://" and "https://" respectively. If the protocol is not explicitly indicated, the OpenSIPS defaults to HTTP secured with SSL.
    
*   The Internet domain name for the peering server. An IP address may also be used, provided it is enclosed in square brackets such as \[172.16.1.1\].
    
*   An optional TCP port number for communicating with the peering server. If the port number is omitted, the OpenSIPS defaults to port 5045 (for HTTP) or port 1443 (for HTTP secured with SSL).
    
    The uniform resource identifier for requests to the peering server. This component is not optional and must be included.

**Example.** http://osptestserver.transnexus.com:5045/osp.

```opensips
modparam("osp","sp1_uri","http://osptestserver.transnexus.com:5045/osp")
modparam("osp","sp2_uri","https://\[1.2.3.4\]:1443/osp")
```
### `sp13_weight` (integer)

These sp_weight (integer) parameters are used for load balancing peering requests to peering servers. These parameters are most effective when configured as factors of 1000. For example, if sp1_uri should manage twice the traffic load of sp2_uri, then set sp1_weight to 2000 and sp2_weight to 1000. Shared load balancing between peering servers is recommended. However, peering servers can be configured as primary and backup by assigning a sp_weight of 0 to the primary server and a non-zero sp_weight to the back-up server. The default values for sp1_weight and sp2_weight are 1000.

**Example.** 1000.

```opensips
modparam("osp","sp1_weight",1000)
```
### `sp14_uri` (string)

These sp_uri (string) parameters define peering servers to be used for requesting peering authorization and routing information. At least one peering server must be configured. Others are required only if there are more than one peering servers. Each peering server address takes the form of a standard URL, and consists of up to four components: An optional indication of the protocol to be used for communicating with the peering server. Both HTTP and HTTP secured with SSL/TLS are supported and are indicated by "http://" and "https://" respectively. If the protocol is not explicitly indicated, the OpenSIPS defaults to HTTP secured with SSL. The Internet domain name for the peering server. An IP address may also be used, provided it is enclosed in square brackets such as \[172.16.1.1\]. An optional TCP port number for communicating with the peering server. If the port number is omitted, the OpenSIPS defaults to port 5045 (for HTTP) or port 1443 (for HTTP secured with SSL). The uniform resource identifier for requests to the peering server. This component is not optional and must be included.

**Example.** http://osptestserver.transnexus.com:5045/osp.

```opensips
modparam("osp","sp1_uri","http://osptestserver.transnexus.com:5045/osp")
modparam("osp","sp2_uri","https://\[1.2.3.4\]:1443/osp")
```
### `sp14_weight` (integer)

These sp_weight (integer) parameters are used for load balancing peering requests to peering servers. These parameters are most effective when configured as factors of 1000. For example, if sp1_uri should manage twice the traffic load of sp2_uri, then set sp1_weight to 2000 and sp2_weight to 1000. Shared load balancing between peering servers is recommended. However, peering servers can be configured as primary and backup by assigning a sp_weight of 0 to the primary server and a non-zero sp_weight to the back-up server. The default values for sp1_weight and sp2_weight are 1000.

**Example.** 1000.

```opensips
modparam("osp","sp1_weight",1000)
```
### `sp15_uri` (string)

These sp_uri (string) parameters define peering servers to be used for requesting peering authorization and routing information. At least one peering server must be configured. Others are required only if there are more than one peering servers. Each peering server address takes the form of a standard URL, and consists of up to four components: An optional indication of the protocol to be used for communicating with the peering server. Both HTTP and HTTP secured with SSL/TLS are supported and are indicated by "http://" and "https://" respectively. If the protocol is not explicitly indicated, the OpenSIPS defaults to HTTP secured with SSL. The Internet domain name for the peering server. An IP address may also be used, provided it is enclosed in square brackets such as \[172.16.1.1\]. An optional TCP port number for communicating with the peering server. If the port number is omitted, the OpenSIPS defaults to port 5045 (for HTTP) or port 1443 (for HTTP secured with SSL). The uniform resource identifier for requests to the peering server. This component is not optional and must be included.

**Example.** http://osptestserver.transnexus.com:5045/osp.

```opensips
modparam("osp","sp1_uri","http://osptestserver.transnexus.com:5045/osp")
modparam("osp","sp2_uri","https://\[1.2.3.4\]:1443/osp")
```
### `sp15_weight` (integer)

These sp_weight (integer) parameters are used for load balancing peering requests to peering servers. These parameters are most effective when configured as factors of 1000. For example, if sp1_uri should manage twice the traffic load of sp2_uri, then set sp1_weight to 2000 and sp2_weight to 1000. Shared load balancing between peering servers is recommended. However, peering servers can be configured as primary and backup by assigning a sp_weight of 0 to the primary server and a non-zero sp_weight to the back-up server. The default values for sp1_weight and sp2_weight are 1000.

**Example.** 1000.

```opensips
modparam("osp","sp1_weight",1000)
```
### `sp16_uri` (string)

These sp_uri (string) parameters define peering servers to be used for requesting peering authorization and routing information. At least one peering server must be configured. Others are required only if there are more than one peering servers. Each peering server address takes the form of a standard URL, and consists of up to four components: An optional indication of the protocol to be used for communicating with the peering server. Both HTTP and HTTP secured with SSL/TLS are supported and are indicated by "http://" and "https://" respectively. If the protocol is not explicitly indicated, the OpenSIPS defaults to HTTP secured with SSL. The Internet domain name for the peering server. An IP address may also be used, provided it is enclosed in square brackets such as \[172.16.1.1\]. An optional TCP port number for communicating with the peering server. If the port number is omitted, the OpenSIPS defaults to port 5045 (for HTTP) or port 1443 (for HTTP secured with SSL). The uniform resource identifier for requests to the peering server. This component is not optional and must be included.

**Example.** http://osptestserver.transnexus.com:5045/osp.

```opensips
modparam("osp","sp1_uri","http://osptestserver.transnexus.com:5045/osp")
modparam("osp","sp2_uri","https://\[1.2.3.4\]:1443/osp")
```
### `sp16_weight` (integer)

These sp_weight (integer) parameters are used for load balancing peering requests to peering servers. These parameters are most effective when configured as factors of 1000. For example, if sp1_uri should manage twice the traffic load of sp2_uri, then set sp1_weight to 2000 and sp2_weight to 1000. Shared load balancing between peering servers is recommended. However, peering servers can be configured as primary and backup by assigning a sp_weight of 0 to the primary server and a non-zero sp_weight to the back-up server. The default values for sp1_weight and sp2_weight are 1000.

**Example.** 1000.

```opensips
modparam("osp","sp1_weight",1000)
```
### `sp1_uri` (string)

These sp_uri (string) parameters define peering servers to be used for requesting peering authorization and routing information. At least one peering server must be configured. Others are required only if there are more than one peering servers. Each peering server address takes the form of a standard URL, and consists of up to four components: * An optional indication of the protocol to be used for communicating with the peering server. Both HTTP and HTTP secured with SSL/TLS are supported and are indicated by "http://" and "https://" respectively. If the protocol is not explicitly indicated, the OpenSIPS defaults to HTTP secured with SSL. * The Internet domain name for the peering server. An IP address may also be used, provided it is enclosed in square brackets such as \[172.16.1.1\]. * An optional TCP port number for communicating with the peering server. If the port number is omitted, the OpenSIPS defaults to port 5045 (for HTTP) or port 1443 (for HTTP secured with SSL). The uniform resource identifier for requests to the peering server. This component is not optional and must be included.

**Example.** Set the `sp1_uri` parameter.

```opensips
modparam("osp","sp1_uri","http://osptestserver.transnexus.com:5045/osp")
```
### `sp1_weight` (integer)

These sp_weight (integer) parameters are used for load balancing peering requests to peering servers. These parameters are most effective when configured as factors of 1000. For example, if sp1_uri should manage twice the traffic load of sp2_uri, then set sp1_weight to 2000 and sp2_weight to 1000. Shared load balancing between peering servers is recommended. However, peering servers can be configured as primary and backup by assigning a sp_weight of 0 to the primary server and a non-zero sp_weight to the back-up server.

*Default value is 1000.*

**Example.** 1000.

```opensips
modparam("osp","sp1_weight",1000)
```
### `sp2_uri` (string)

These sp_uri (string) parameters define peering servers to be used for requesting peering authorization and routing information. At least one peering server must be configured. Others are required only if there are more than one peering servers. Each peering server address takes the form of a standard URL, and consists of up to four components: * An optional indication of the protocol to be used for communicating with the peering server. Both HTTP and HTTP secured with SSL/TLS are supported and are indicated by "http://" and "https://" respectively. If the protocol is not explicitly indicated, the OpenSIPS defaults to HTTP secured with SSL. * The Internet domain name for the peering server. An IP address may also be used, provided it is enclosed in square brackets such as \[172.16.1.1\]. * An optional TCP port number for communicating with the peering server. If the port number is omitted, the OpenSIPS defaults to port 5045 (for HTTP) or port 1443 (for HTTP secured with SSL). The uniform resource identifier for requests to the peering server. This component is not optional and must be included.

**Example.** Set the `sp2_uri` parameter.

```opensips
modparam("osp","sp2_uri","https://\[1.2.3.4\]:1443/osp")
```
### `sp2_weight` (integer)

These sp_weight (integer) parameters are used for load balancing peering requests to peering servers. These parameters are most effective when configured as factors of 1000. For example, if sp1_uri should manage twice the traffic load of sp2_uri, then set sp1_weight to 2000 and sp2_weight to 1000. Shared load balancing between peering servers is recommended. However, peering servers can be configured as primary and backup by assigning a sp_weight of 0 to the primary server and a non-zero sp_weight to the back-up server.

*Default value is 1000.*

**Example.** 1000.

```opensips
modparam("osp","sp1_weight",1000)
```
### `sp3_uri` (string)

These sp_uri (string) parameters define peering servers to be used for requesting peering authorization and routing information. At least one peering server must be configured. Others are required only if there are more than one peering servers. Each peering server address takes the form of a standard URL, and consists of up to four components: * An optional indication of the protocol to be used for communicating with the peering server. Both HTTP and HTTP secured with SSL/TLS are supported and are indicated by "http://" and "https://" respectively. If the protocol is not explicitly indicated, the OpenSIPS defaults to HTTP secured with SSL. * The Internet domain name for the peering server. An IP address may also be used, provided it is enclosed in square brackets such as \[172.16.1.1\]. * An optional TCP port number for communicating with the peering server. If the port number is omitted, the OpenSIPS defaults to port 5045 (for HTTP) or port 1443 (for HTTP secured with SSL). The uniform resource identifier for requests to the peering server. This component is not optional and must be included.
### `sp3_weight` (integer)

These sp_weight (integer) parameters are used for load balancing peering requests to peering servers. These parameters are most effective when configured as factors of 1000. For example, if sp1_uri should manage twice the traffic load of sp2_uri, then set sp1_weight to 2000 and sp2_weight to 1000. Shared load balancing between peering servers is recommended. However, peering servers can be configured as primary and backup by assigning a sp_weight of 0 to the primary server and a non-zero sp_weight to the back-up server. The default values for sp1_weight and sp2_weight are 1000.

**Notes:** These parameters are most effective when configured as factors of 1000. Shared load balancing between peering servers is recommended. However, peering servers can be configured as primary and backup by assigning a sp_weight of 0 to the primary server and a non-zero sp_weight to the back-up server.

**Example.** 1000.

```opensips
modparam("osp","sp3_weight",1000)
```
### `sp4_uri` (string)

These sp_uri (string) parameters define peering servers to be used for requesting peering authorization and routing information. At least one peering server must be configured. Others are required only if there are more than one peering servers. Each peering server address takes the form of a standard URL, and consists of up to four components: An optional indication of the protocol to be used for communicating with the peering server. Both HTTP and HTTP secured with SSL/TLS are supported and are indicated by "http://" and "https://" respectively. If the protocol is not explicitly indicated, the OpenSIPS defaults to HTTP secured with SSL. The Internet domain name for the peering server. An IP address may also be used, provided it is enclosed in square brackets such as [172.16.1.1]. An optional TCP port number for communicating with the peering server. If the port number is omitted, the OpenSIPS defaults to port 5045 (for HTTP) or port 1443 (for HTTP secured with SSL). The uniform resource identifier for requests to the peering server. This component is not optional and must be included.

**Example.** http://osptestserver.transnexus.com:5045/osp.

```opensips
modparam("osp","sp4_uri","http://osptestserver.transnexus.com:5045/osp")
```
### `sp4_weight` (integer)

These sp_weight (integer) parameters are used for load balancing peering requests to peering servers. These parameters are most effective when configured as factors of 1000. For example, if sp1_uri should manage twice the traffic load of sp2_uri, then set sp1_weight to 2000 and sp2_weight to 1000. Shared load balancing between peering servers is recommended. However, peering servers can be configured as primary and backup by assigning a sp_weight of 0 to the primary server and a non-zero sp_weight to the back-up server. The default values for sp1_weight and sp2_weight are 1000.

**Notes:** These parameters are most effective when configured as factors of 1000. Shared load balancing between peering servers is recommended. However, peering servers can be configured as primary and backup by assigning a sp_weight of 0 to the primary server and a non-zero sp_weight to the back-up server.

**Example.** 1000.

```opensips
modparam("osp","sp4_weight",1000)
```
### `sp5_uri` (string)

These sp_uri (string) parameters define peering servers to be used for requesting peering authorization and routing information. At least one peering server must be configured. Others are required only if there are more than one peering servers. Each peering server address takes the form of a standard URL, and consists of up to four components: An optional indication of the protocol to be used for communicating with the peering server. Both HTTP and HTTP secured with SSL/TLS are supported and are indicated by "http://" and "https://" respectively. If the protocol is not explicitly indicated, the OpenSIPS defaults to HTTP secured with SSL. The Internet domain name for the peering server. An IP address may also be used, provided it is enclosed in square brackets such as [172.16.1.1]. An optional TCP port number for communicating with the peering server. If the port number is omitted, the OpenSIPS defaults to port 5045 (for HTTP) or port 1443 (for HTTP secured with SSL). The uniform resource identifier for requests to the peering server. This component is not optional and must be included.

**Example.** http://osptestserver.transnexus.com:5045/osp.

```opensips
modparam("osp","sp5_uri","http://osptestserver.transnexus.com:5045/osp")
```
### `sp5_weight` (integer)

These sp_weight (integer) parameters are used for load balancing peering requests to peering servers. These parameters are most effective when configured as factors of 1000. For example, if sp1_uri should manage twice the traffic load of sp2_uri, then set sp1_weight to 2000 and sp2_weight to 1000. Shared load balancing between peering servers is recommended. However, peering servers can be configured as primary and backup by assigning a sp_weight of 0 to the primary server and a non-zero sp_weight to the back-up server. The default values for sp1_weight and sp2_weight are 1000.

**Notes:** These parameters are most effective when configured as factors of 1000. Shared load balancing between peering servers is recommended. However, peering servers can be configured as primary and backup by assigning a sp_weight of 0 to the primary server and a non-zero sp_weight to the back-up server.

**Example.** 1000.

```opensips
modparam("osp","sp5_weight",1000)
```
### `sp6_uri` (string)

These sp_uri (string) parameters define peering servers to be used for requesting peering authorization and routing information. At least one peering server must be configured. Others are required only if there are more than one peering servers. Each peering server address takes the form of a standard URL, and consists of up to four components: An optional indication of the protocol to be used for communicating with the peering server. Both HTTP and HTTP secured with SSL/TLS are supported and are indicated by "http://" and "https://" respectively. If the protocol is not explicitly indicated, the OpenSIPS defaults to HTTP secured with SSL. The Internet domain name for the peering server. An IP address may also be used, provided it is enclosed in square brackets such as [172.16.1.1]. An optional TCP port number for communicating with the peering server. If the port number is omitted, the OpenSIPS defaults to port 5045 (for HTTP) or port 1443 (for HTTP secured with SSL). The uniform resource identifier for requests to the peering server. This component is not optional and must be included.

**Example.** http://osptestserver.transnexus.com:5045/osp.

```opensips
modparam("osp","sp6_uri","http://osptestserver.transnexus.com:5045/osp")
```
### `sp6_weight` (integer)

These sp_weight (integer) parameters are used for load balancing peering requests to peering servers. These parameters are most effective when configured as factors of 1000. For example, if sp1_uri should manage twice the traffic load of sp2_uri, then set sp1_weight to 2000 and sp2_weight to 1000. Shared load balancing between peering servers is recommended. However, peering servers can be configured as primary and backup by assigning a sp_weight of 0 to the primary server and a non-zero sp_weight to the back-up server. The default values for sp1_weight and sp2_weight are 1000.

**Notes:** These parameters are most effective when configured as factors of 1000. Shared load balancing between peering servers is recommended. However, peering servers can be configured as primary and backup by assigning a sp_weight of 0 to the primary server and a non-zero sp_weight to the back-up server.

**Example.** 1000.

```opensips
modparam("osp","sp6_weight",1000)
```
### `sp7_uri` (string)

These sp_uri (string) parameters define peering servers to be used for requesting peering authorization and routing information. At least one peering server must be configured. Others are required only if there are more than one peering servers. Each peering server address takes the form of a standard URL, and consists of up to four components: An optional indication of the protocol to be used for communicating with the peering server. Both HTTP and HTTP secured with SSL/TLS are supported and are indicated by "http://" and "https://" respectively. If the protocol is not explicitly indicated, the OpenSIPS defaults to HTTP secured with SSL. The Internet domain name for the peering server. An IP address may also be used, provided it is enclosed in square brackets such as [172.16.1.1]. An optional TCP port number for communicating with the peering server. If the port number is omitted, the OpenSIPS defaults to port 5045 (for HTTP) or port 1443 (for HTTP secured with SSL). The uniform resource identifier for requests to the peering server. This component is not optional and must be included.

**Example.** http://osptestserver.transnexus.com:5045/osp.

```opensips
modparam("osp","sp7_uri","http://osptestserver.transnexus.com:5045/osp")
```
### `sp7_weight` (integer)

These sp_weight (integer) parameters are used for load balancing peering requests to peering servers. These parameters are most effective when configured as factors of 1000. For example, if sp1_uri should manage twice the traffic load of sp2_uri, then set sp1_weight to 2000 and sp2_weight to 1000. Shared load balancing between peering servers is recommended. However, peering servers can be configured as primary and backup by assigning a sp_weight of 0 to the primary server and a non-zero sp_weight to the back-up server. The default values for sp1_weight and sp2_weight are 1000.

**Notes:** These parameters are most effective when configured as factors of 1000. Shared load balancing between peering servers is recommended. However, peering servers can be configured as primary and backup by assigning a sp_weight of 0 to the primary server and a non-zero sp_weight to the back-up server.

**Example.** 1000.

```opensips
modparam("osp","sp7_weight",1000)
```
### `sp8_uri` (string)

These sp_uri (string) parameters define peering servers to be used for requesting peering authorization and routing information. At least one peering server must be configured. Others are required only if there are more than one peering servers. Each peering server address takes the form of a standard URL, and consists of up to four components: An optional indication of the protocol to be used for communicating with the peering server. Both HTTP and HTTP secured with SSL/TLS are supported and are indicated by "http://" and "https://" respectively. If the protocol is not explicitly indicated, the OpenSIPS defaults to HTTP secured with SSL. The Internet domain name for the peering server. An IP address may also be used, provided it is enclosed in square brackets such as [172.16.1.1]. An optional TCP port number for communicating with the peering server. If the port number is omitted, the OpenSIPS defaults to port 5045 (for HTTP) or port 1443 (for HTTP secured with SSL). The uniform resource identifier for requests to the peering server. This component is not optional and must be included.

**Example.** http://osptestserver.transnexus.com:5045/osp.

```opensips
modparam("osp","sp8_uri","http://osptestserver.transnexus.com:5045/osp")
```
### `sp8_weight` (integer)

These sp_weight (integer) parameters are used for load balancing peering requests to peering servers. These parameters are most effective when configured as factors of 1000. For example, if sp1_uri should manage twice the traffic load of sp2_uri, then set sp1_weight to 2000 and sp2_weight to 1000. Shared load balancing between peering servers is recommended. However, peering servers can be configured as primary and backup by assigning a sp_weight of 0 to the primary server and a non-zero sp_weight to the back-up server. The default values for sp1_weight and sp2_weight are 1000.

**Example.** 1000.

```opensips
modparam("osp","sp1_weight",1000)
```
### `sp9_uri` (string)

These sp_uri (string) parameters define peering servers to be used for requesting peering authorization and routing information. At least one peering server must be configured. Others are required only if there are more than one peering servers. Each peering server address takes the form of a standard URL, and consists of up to four components:

*   An optional indication of the protocol to be used for communicating with the peering server. Both HTTP and HTTP secured with SSL/TLS are supported and are indicated by "http://" and "https://" respectively. If the protocol is not explicitly indicated, the OpenSIPS defaults to HTTP secured with SSL.
    
*   The Internet domain name for the peering server. An IP address may also be used, provided it is enclosed in square brackets such as \[172.16.1.1\].
    
*   An optional TCP port number for communicating with the peering server. If the port number is omitted, the OpenSIPS defaults to port 5045 (for HTTP) or port 1443 (for HTTP secured with SSL).
    
    The uniform resource identifier for requests to the peering server. This component is not optional and must be included.

**Example.** http://osptestserver.transnexus.com:5045/osp.

```opensips
modparam("osp","sp1_uri","http://osptestserver.transnexus.com:5045/osp")
modparam("osp","sp2_uri","https://\[1.2.3.4\]:1443/osp")
```
### `sp9_weight` (integer)

These sp_weight (integer) parameters are used for load balancing peering requests to peering servers. These parameters are most effective when configured as factors of 1000. For example, if sp1_uri should manage twice the traffic load of sp2_uri, then set sp1_weight to 2000 and sp2_weight to 1000. Shared load balancing between peering servers is recommended. However, peering servers can be configured as primary and backup by assigning a sp_weight of 0 to the primary server and a non-zero sp_weight to the back-up server. The default values for sp1_weight and sp2_weight are 1000.

**Example.** 1000.

```opensips
modparam("osp","sp1_weight",1000)
```
### `ssl_lifetime` (integer)

The ssl_lifetime (integer) parameter defines the lifetime, in seconds, of a single SSL session key. Once this time limit is exceeded, the OSP module will negotiate a new session key. Communication exchanges in progress will not be interrupted when this time limit expires. This is an optional field with default value is 200 seconds.

*Default value is 200.*

**Example.** 200.

```opensips
modparam("osp","ssl_lifetime",200)
```
### `support_nonsip_protocol` (integer)

The support_nonsip_protocol (integer) parameter is used to tell the OSP module if non-SIP signaling protocol destination devices are supported.

*Default value is 0.*

**Example.** 0.

```opensips
modparam("osp","support_nonsip_protocol",0)
```
### `switchid_location` (integer)

The switchid_location (integer) parameter instructs the OSP module where the destination switch ID should be appended.

*Default value is 2.*

**Possible values:**

- 0
- 1
- 2

**Example.** Set the `switchid_location` parameter.

```opensips
modparam("osp","switchid_location",2)
```
### `switchid_parameter` (string)

The switchid_parameter (string) parameter instructs the OSP module to use which parameter name in outbound destination URIs to append destination switch ID.

*Default value is switchid.*

**Example.** switchid.

```opensips
modparam("osp","switchid_param","switchid")
```
### `timeout` (integer)

The timeout (integer) parameter defines the maximum time in milliseconds, to wait for a response from a peering server. If no response is received within this time, the current connection is aborted and the OSP module attempts to contact the next peering server.

*Default value is 10.*

**Example.** 10.

```opensips
modparam("osp","timeout",10)
```
### `token_format` (integer)

When OpenSIPS receives a SIP INVITE with a peering token, the OSP module will validate the token to determine whether or not the call has been authorized by a peering server. Peering tokens may, or may not, be digitally signed. The token_format (integer) parameter defines if OpenSIPS will validate signed or unsigned tokens or both. The values for token format are defined below.

*Default value is 2.*

**Possible values:**

- 0 - Validate only signed tokens. Calls with valid signed tokens are allowed.
- 1 - Validate only unsigned tokens. Calls with valid unsigned tokens are allowed.
- 2 - Validate both signed and unsigned tokens are allowed. Calls with valid tokens are allowed.

**Notes:** If use_security_features parameter is set to 0, signed tokens cannot be validated.

**Example.** Set the `token_format` parameter.

```opensips
modparam("osp","token_format",2)
```
### `use_number_portability` (integer)

The use_number_portability (integer) parameter instructs the OSP module how to use the number portability parameters in the Request URI of the SIP INVITE message. If this value is set to 1, the OSP module uses the number portability parameters in the Request URI when these parameters exist. If this value is set to 0, the OSP module will not use the number portability parameters.

*Default value is 1.*

**Possible values:**

- 0
- 1

**Example.** Set the `use_number_portability` parameter.

```opensips
modparam("osp","use_number_portablity",1)
```
### `use_security_features` (integer)

The use_security_features (integer) parameter instructs the OSP module how to use the OSP security features. If this value is set to 1, the OSP module uses the OSP security features. If this value is set to 0, the OSP module will not use the OSP security features.

*Default value is 0.*

**Possible values:**

- 0
- 1

**Example.** Set the `use_security_features` parameter.

```opensips
modparam("osp","use_security_features",0)
```
### `user_group_avp` (string)

These parameter is used to tell the OSP module which AVP is used to store source user group information. All pseudo variables are described in https://opensips.org/Resources/DocsCoreVar.

*Default value is $avp(_osp_user_group_).*

**Example.** $avp(groupid).

```opensips
modparam("osp", "user_group_avp", "$avp(groupid)")
```
### `user_id_avp` (string)

These parameter is used to tell the OSP module which AVP is used to store source user ID information.

*Default value is $avp(_osp_user_id_).*

**Notes:** All pseudo variables are described in https://opensips.org/Resources/DocsCoreVar.

**Example.** $avp(userid).

```opensips
modparam("osp", "user_id_avp", "$avp(userid)")
```
### `validate_call_id` (integer)

The validate_call_id (integer) parameter instructs the OSP module to validate call id in the peering token.

*Default value is 1.*

**Possible values:**

- 0
- 1

**Example.** 1.

```opensips
modparam("osp","validate_call_id",1)
```
### `work_mode` (integer)

The work_mode (integer) parameter instructs the OSP module what mode it should work in. If this value is set to 0, the OSP module works in direct mode. If this value is set to 1, the OSP module works in indirect mode. The default value is 0.

*Default value is 0.*

**Possible values:**

- 0
- 1

**Example.** Set the `work_mode` parameter.

```opensips
modparam("osp","work_mode",0)
```

## Exported Functions

### `checkcallingtranslation()`

This function is used to check if the calling number is translated. Before calling checkcallingtranslation, prepareosproute should be called. If the calling number does been translated, the original Remote-Party-ID, if it exists, should be removed from the INVITE message. And a new Remote-Party-ID header should be added (a RPID value for the RPID AVP has been set by prepareosproute). If the calling number is not translated, nothing should be done.

**Return codes:**

- `1` — Calling number is translated
- `-1` — Calling number is not translated

**Usable from:** BRANCH_ROUTE

**Related:**

- `prepareosproute`

**Example.** checkcallingtranslation usage.

```opensips
if (checkcallingtranslation()) {
  # Remove the Remote_Party-ID from the received message
  # Otherwise it will be forwarded on to the next hop
  remove_hf("Remote-Party-ID");

  # Append a new Remote_Party
  append_rpid_hf();
}
```

### `checkospheader()`

This function checks for the existence of the OSP-Auth-Token header field.

**Usable from:** REQUEST_ROUTE

**Example.** checkospheader usage.

```opensips
...
if (checkospheader()) {
  log(1,"OSP header field found.\n");
} else {
  log(1,"no OSP header field present\n");
};
...
```

### `checkosproute()`

This function is used to check if there is any route for the call.

**Return codes:**

- `1` — There is at least one route for the call
- `-1` — There is not any route for the call

**Usable from:** REQUEST_ROUTE

**Example.** checkosproute usage.

```opensips
if (checkosproute()) {
  log(1,"There is at least one route for the call\\n");
} else {
  log(1,"There is not any route for the call\\n");
};
```

### `getlocaladdress()`

This function gets the receiving IP address of SIP response and stores it as proxy egress address.

**Usable from:** ONREPLY_ROUTE

**Example.** getlocaladress usage.

```opensips
...
if (getlocaladdress()) {
  log(1,"Obtain proxy local egress address\n");
} else {
  log(1,"Failed to get proxy local egress address\n");
};
...
```

### `prepareallosproutes()`

This function tries to prepare all the routes in the list returned by the peering server. The message is then forked off to the destinations. If unsuccessful in preparing the routes a SIP 500 is sent back and a trace message is logged.

**Return codes:**

- `1` — Routes are prepared
- `-1` — Could not prepare the routes

**Usable from:** REQUEST_ROUTE

**Example.** prepareallosproutes usage.

```opensips
if (prepareallosproutes()) {
  log(1,"Routes are prepared, now forking the call\\n");
} else {
  log(1,"Could not prepare the routes. No destination available\\n");
};
```

### `prepareospresponse()`

This function tries to prepare all the routes in the list returned by the peering server into SIP 300 Redirect or SIP 380 Alternative Service message. The message is then replied to the source. If unsuccessful in preparing the routes a SIP 500 is sent back and a trace message is logged.

**Return codes:**

- `1` — Response is prepared
- `-1` — Could not prepare the response

**Usable from:** REQUEST_ROUTE

**Example.** prepareospresponse usage.

```opensips
if (prepareospresponse()) {
  log(1,"Response is prepared.\\n");
} else {
  log(1,"Could not prepare the response.\\n");
};
```

### `prepareosproute()`

This function tries to prepare the INVITE to be forwarded using the destination in the list returned by the peering server. If the calling number is translated, a RPID value for the RPID AVP will be set. If the route could not be prepared, the function returns 'FALSE' back to the script, which can then decide how to handle the failure. Note, if checkosproute has been called and returns 'TRUE' before calling prepareosproute, prepareosproute should not return 'FALSE' because checkosproute has confirmed that there is at least one route.

**Return codes:**

- `1` — successfully prepared the route
- `-1` — could not prepare the route

**Usable from:** BRANCH_ROUTE

**Related:**

- `checkosproute`

**Example.** prepareosproute usage.

```opensips
if (prepareosproute()) {
  log(1,"successfully prepared the route, now relaying call\\n");
} else {
  log(1,"could not prepare the route, there is not route\\n");
};
```

### `processsubscribe([cachedcnamrecord])`

This function should be called after receiving a SUBSCRIBE for CNAM message and there is a cached CNAM record for this message. This function generates a NOTIFY message including the cached CNAM record, then sends the NOTIFY message to the device sending the SUBSCRIBE message.

**Parameters:**

- `cachedcnamrecord` *(string, optional)* — Cached CNAM record.

**Usable from:** REQUEST_ROUTE

**Example.** processsubscribe usage.

```opensips
...
if (is_method("SUBSCRIBE")) {
    if (($var(sevent) == "calling-name") && (is_myself("$rd"))) {
        if ($var(cnamrecord) != NULL) {
            processsubscribe($(var(cnamrecord){s.b64decode}));
        } else {
            t_relay("1.2.3.4", 0x02);
        }
    } else {
        t_relay();
    }
}
...
```

### `reportospusage(release)`

This function should be called after receiving a BYE message. If the message contains an OSP cookie, the function will forward originating and/or terminating duration usage information to a peering server. The function returns TRUE if the BYE includes an OSP cookie. The actual usage message will be send on a different thread and will not delay BYE processing. The function should be called before relaying the message.

**Parameters:**

- `release` *(integer, required)* — Source device releases the call (0) or Destination device releases the call (1).
  - `0`
  - `1`

**Return codes:**

- `TRUE` — BYE includes an OSP cookie
- `FALSE` — BYE does not include OSP cookie

**Usable from:** REQUEST_ROUTE

**Example.** reportospusage usage.

```opensips
...
if (is_direction("downstream")) {
  log(1,"This BYE message is from SOURCE\n");
  if (!reportospusage(0)) {
    log(1,"This BYE message does not include OSP usage information\n");
  }
} else {
  log(1,"This BYE message is from DESTINATION\n");
  if (!reportospusage(1)) {
    log(1,"This BYE message does not include OSP usage information\n");
  }
}
...
```

### `requestosprouting()`

This function launches a query to the peering server requesting the IP address of one or more destination peers serving the called party. If destination peers are available, the peering server will return the IP address and a peering authorization token for each destination peer. The OSP-Auth-Token Header field is inserted into the SIP message and the SIP uri is rewritten to the IP address of destination peer provided by the peering server.

**Return codes:**

- `1` — the transaction was accepted by the peering server, the uri is being rewritten
- `-1` — address of the called party is not a valid E164 number, on errors (peering servers are not available, authentication failed or there is no route to destination or the route is blocked)

**Usable from:** REQUEST_ROUTE

**Example.** requestosprouting usage.

```opensips
...
if (requestosprouting()) {
  log(1,"successfully queried OSP server, now relaying call\n");
} else {
  log(1,"Authorization request was rejected from OSP server\n");
};
...
```

### `setrequestdate()`

This function gets the receiving IP address of SIP response and stores it as proxy egress address.

**Usable from:** REQUEST_ROUTE

**Example.** setrequestdate usage.

```opensips
...
if (setrequest()) {
  log(1,"Set request date\n");
} else {
  log(1,"Failed to set request date\n");
};
...
```

### `validateospheader()`

This function validates an OSP-Token specified in the OSP-Auth-Tokenheader field of the SIP message. If a peering token is present, it will be validated locally. If no OSP header is found or the header token is invalid or expired, -1 is returned; on successful validation 1 is returned.

**Return codes:**

- `1` — on successful validation
- `-1` — If no OSP header is found or the header token is invalid or expired

**Usable from:** REQUEST_ROUTE

**Example.** validateospheader usage.

```opensips
...
if (validateospheader()) {
  log(1,"valid OSP header found\n");
} else {
  log(1,"OSP header not found, invalid or expired\n");
};
...
```

## Configuration Examples

### Instructing the module to work in direct mode

Instructs the OSP module to work in direct mode.

```opensips
modparam("osp","work_mode",0)
```
### Instructing the module to provide normal voice service

Instructs the OSP module to provide normal voice service.

```opensips
modparam("osp","service_type",0)
```
### Setting the OSP servers

Defines peering servers to be used for requesting peering authorization and routing information.

```opensips
modparam("osp","sp1_uri","http://osptestserver.transnexus.com:5045/osp")
modparam("osp","sp2_uri","https://\[1.2.3.4\]:1443/osp")
```
### Setting the OSP server weights

Used for load balancing peering requests to peering servers.

```opensips
modparam("osp","sp1_weight",1000)
```
### Setting the device IP address

Explicitly defines the IP address of OpenSIPS in a peering request message.

```opensips
modparam("osp","device_ip","\[127.0.0.1\]:5060")
```
### Instructing the module not to use OSP security features

Instructs the OSP module not to use OSP security features.

```opensips
modparam("osp","use_security_features",0)
```
### Setting the token format

Defines if OpenSIPS will validate signed or unsigned tokens or both.

```opensips
modparam("osp","token_format",2)
```
### Set authorization files

Identifies files used for validating peering authorization tokens and establishing a secure channel.

```opensips
modparam("osp","private_key","/usr/local/etc/opensips/pkey.pem")
modparam("osp","local_certificate","/usr/local/etc/opensips/localcert.pem")
modparam("osp","ca_certificates","/usr/local/etc/opensips/cacert.pem")
```
### Setting the hardware support

Sets the cryptographic hardware acceleration engine in the openssl library.

```opensips
modparam("osp","enable_crypto_hardware_support",0)
```
### Setting the ssl lifetime

Defines the lifetime, in seconds, of a single SSL session key.

```opensips
modparam("osp","ssl_lifetime",200)
```
### Setting the persistence

Defines the time, in seconds, that an HTTP connection should be maintained after the completion of a communication exchange.

```opensips
modparam("osp","persistence",1000)
```
### Setting the retry delay

Defines the time, in seconds, between retrying connection attempts to an OSP peering server.

```opensips
modparam("osp","retry_delay",1)
```
### Setting the retry limit

Defines the maximum number of retries for connection attempts to a peering server.

```opensips
modparam("osp","retry_limit",2)
```
### Setting the timeout

Defines the maximum time in milliseconds, to wait for a response from a peering server.

```opensips
modparam("osp","timeout",10)
```
### Setting support non-SIP destination devices

Tells the OSP module if non-SIP signaling protocol destination devices are supported.

```opensips
modparam("osp","support_nonsip_protocol",0)
```
### Setting the number of destination

Defines the maximum number of destinations that OpenSIPS requests the peering server to return in a peering response.

```opensips
modparam("osp","max_destinations",12)
```
### Setting report network ID flag

Tells the OSP module if to report network ID in completed call CDRs.

```opensips
modparam("osp","report_networkid",3)
```
### Instructing the module to validate call id

Instructs the OSP module to validate call id in the peering token.

```opensips
modparam("osp","validate_call_id",1)
```
### Instructing the module to use number portability parameters in Request URI

Instructs the OSP module how to use the number portability parameters in the Request URI of the SIP INVITE message.

```opensips
modparam("osp","use_number_portablity",1)
```
### Append user=phone parameter

Instructs the OSP module if to append "user=phone" parameter in URI.

```opensips
modparam("osp","append_userphone",0)
```
### Append networkid location

Instructs the OSP module where the destination network ID should be appended.

```opensips
modparam("osp","networkid_location",2)
```
### Networkid parameter name

Instructs the OSP module to use which parameter name in outbound destination URIs to append destination network ID.

```opensips
modparam("osp","networkid_param","networkid")
```
### Append switchid location

Instructs the OSP module where the destination switch ID should be appended.

```opensips
modparam("osp","switchid_location",2)
```
### Networkid parameter name

Instructs the OSP module to use which parameter name in outbound destination URIs to append destination switch ID.

```opensips
modparam("osp","switchid_param","switchid")
```
### Append parameter string location

Instructs the OSP module where the parameter string should be appended.

```opensips
modparam("osp","parameterstring_location",0)
```
### Parameter string value

Instructs the OSP module to append the parameter string in outbound URIs.

```opensips
modparam("osp","parameterstring_value","")
```
### Setting the source device IP AVP

Instructs the OSP module to use the defined AVP to pass the source device IP value in the indirect work mode.

```opensips
modparam("osp","source_device_avp","$avp(srcdev)")
```
### Setting the source network ID AVP

Instructs the OSP module to use the defined AVP to pass the source network ID value.

```opensips
modparam("osp","source_networkid_avp","$avp(snid)")
```
### Setting the source switch ID AVP

Instructs the OSP module to use the defined AVP to pass the source switch ID value.

```opensips
modparam("osp","source_switchid_avp","$avp(swid)")
```
### Setting the custom info AVP

Instructs the OSP module to use the defined AVP to pass the custom information values.

```opensips
modparam("osp","custom_info_avp","$avp(cinfo)")
```
### Setting the CNAM AVP

Instructs the OSP module to use the defined AVP to pass the CNAM values.

```opensips
modparam("osp","cnam_avp","$avp(cnam)")
```
### Setting the NOTIFY extra headers

Instructs the OSP module to append the defined SIP headers in outbound SIP NOTIFY messages.

```opensips
modparam("osp", "extraheaders_value", "Source: N")
```
### Setting the media address AVPs

Tells the OSP module which AVPs are used to store media addresses.

```opensips
modparam("osp", "source_media_avp", "$avp(srcmedia)")
modparam("osp", "destination_media_avp", "$avp(destmedia)")
```
### Setting the request date AVP

Instructs the OSP module to use the defined AVP to pass the SIP request Date header values.

```opensips
modparam("osp","request_date_avp","$avp(reqdate)")
```
### Setting the SDP finger print AVP

Instructs the OSP module to use the defined AVP to pass the SDP fing print attribute values.

```opensips
modparam("osp","sdp_fingerprint_avp","$avp(sdpfp)")
```
### Setting the Identity related AVPs

Instructs the OSP module to use the defined AVPs to pass the Identity related values.

```opensips
modparam("osp","identity_signature_avp","$avp(idsign)")
modparam("osp","identity_algorithm_avp","$avp(idalg)")
modparam("osp","identity_information_avp","$avp(idinfo)")
modparam("osp","identity_type_avp","$avp(idtype)")
modparam("osp","identity_canon_avp","$avp(idcanon)")
```
### Setting the source service provider AVP

Tells the OSP module which AVP is used to store source service provider information.

```opensips
modparam("osp", "service_provider_avp", "$avp(sp)")
```
### Setting the source user group AVP

Tells the OSP module which AVP is used to store source user group information.

```opensips
modparam("osp", "user_group_avp", "$avp(groupid)")
```
### Setting the source user ID AVP

Tells the OSP module which AVP is used to store source user ID information.

```opensips
modparam("osp", "user_id_avp", "$avp(userid)")
```
### checkospheader usage

Checks for the existence of the OSP-Auth-Token header field.

```opensips
...
if (checkospheader()) {
  log(1,"OSP header field found.\\n");
} else {
  log(1,"no OSP header field present\\n");
};
...
```
### validateospheader usage

Validates an OSP-Token specified in the OSP-Auth-Tokenheader field of the SIP message.

```opensips
...
if (validateospheader()) {
  log(1,"valid OSP header found\\n");
} else {
  log(1,"OSP header not found, invalid or expired\\n");
};
...
```
### getlocaladress usage

Gets the receiving IP address of SIP response and stores it as proxy egress address.

```opensips
...
if (getlocaladdress()) {
  log(1,"Obtain proxy local egress address\\n");
} else {
  log(1,"Failed to get proxy local egress address\\n");
};
...
```
### setrequestdate usage

Gets the receiving IP address of SIP response and stores it as proxy egress address.

```opensips
...
if (setrequest()) {
  log(1,"Set request date\\n");
} else {
  log(1,"Failed to set request date\\n");
};
...
```
### requestosprouting usage

Launches a query to the peering server requesting the IP address of one or more destination peers serving the called party.

```opensips
...
if (requestosprouting()) {
  log(1,"successfully queried OSP server, now relaying call\\n");
} else {
  log(1,"Authorization request was rejected from OSP server\\n");
};
...
```
### checkosproute usage

Checks if there is any route for the call.

```opensips
...
if (checkosproute()) {
  log(1,"There is at least one route for the call\\n");
} else {
  log(1,"There is not any route for the call\\n");
};
...
```
### prepareosproute usage

Tries to prepare the INVITE to be forwarded using the destination in the list returned by the peering server.

```opensips
...
if (prepareosproute()) {
  log(1,"successfully prepared the route, now relaying call\\n");
} else {
  log(1,"could not prepare the route, there is not route\\n");
};
...
```
### prepareospresponse usage

Tries to prepare all the routes in the list returned by the peering server into SIP 300 Redirect or SIP 380 Alternative Service message.

```opensips
...
if (prepareospresponse()) {
  log(1,"Response is prepared.\\n");
} else {
  log(1,"Could not prepare the response.\\n");
};
...
```
### prepareallosproutes usage

Tries to prepare all the routes in the list returned by the peering server.

```opensips
...
if (prepareallosproutes()) {
  log(1,"Routes are prepared, now forking the call\\n");
} else {
  log(1,"Could not prepare the routes. No destination available\\n");
};
...
```
### checkcallingtranslation usage

Checks if the calling number is translated.

```opensips
...
if (checkcallingtranslation()) {
  # Remove the Remote_Party\-ID from the received message
  # Otherwise it will be forwarded on to the next hop
  remove_hf("Remote-Party-ID");

  # Append a new Remote_Party
  append_rpid_hf();
}
...
```
### reportospusage usage

Should be called after receiving a BYE message to forward originating and/or terminating duration usage information to a peering server.

```opensips
...
if (is_direction("downstream")) {
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
```
### processsubscribe usage

Should be called after receiving a SUBSCRIBE for CNAM message and there is a cached CNAM record for this message.

```opensips
...
if (is_method("SUBSCRIBE")) {
    if (($var(sevent) == "calling-name") && (is_myself("$rd"))) {
        if ($var(cnamrecord) != NULL) {
            processsubscribe($(var(cnamrecord){s.b64decode}));
        } else {
            t_relay("1.2.3.4", 0x02);
        }
    } else {
        t_relay();
    }
}
...
```
