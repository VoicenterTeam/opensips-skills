# osp Module Reference
<!-- generated-from: data/4.0/modules/osp.json
     generator-version: 0.1.0
     opensips-version: 4.0
     doc-type: module -->

Reference for the OpenSIPs 4.0 osp module. Read this file when configuring or debugging the osp module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

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
- `maxfwd` — Max-Forward processor module
- `mi_fifo` — FIFO support for Management Interface
- `options` — OPTIONS server replier module
- `proto_udp` — UDP protocol module - implements UDP-plain transport for SIP
- `registrar` — SIP Registrar implementation module
- `rr` — Record-Route and Route module
- `signaling` — SIP signaling module
- `sipmsgops` — SIP operations module
- `sl` — Stateless replier module
- `sqlops` — SQL operation module
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

**Example.** 0.

```opensips
modparam("osp","append_userphone",0)
```
### `ca_certificates` (string)

These parameters identify files are used for validating peering authorization tokens and establishing a secure channel between OpenSIPS and a peering server using SSL. The files are generated using the 'Enroll' utility from the OSP Toolkit. By default, the proxy will look for pkey.pem, localcert.pem, and cacart_0.pem in the default configuration directory. The default config directory is set at compile time using CFG_DIR and defaults to /usr/local/etc/opensips/. The files may be copied to the expected file location or the parameters below may be changed.

*Default value is cacert_0.pem.*

**Notes:** If use_security_features parameter is set to 0, these parameters will be ignored.

**Example.** /usr/local/etc/opensips/cacert.pem.

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

These parameters are used to tell the OSP module which AVPs are used to store media addresses. All pseudo variables are described in https://opensips.org/Resources/DocsCoreVar.

*Default value is $avp(_osp_destination_media_address_).*

**Example.** $avp(destmedia).

```opensips
modparam("osp", "destination_media_avp", "$avp(destmedia)")
```
### `device_ip` (string)

The device_ip (string) is a recommended parameter that explicitly defines the IP address of OpenSIPS in a peering request message (as SourceAlternate type=transport). The dotted-decimal IP address must be in brackets as shown in the example below.

**Example.** [127.0.0.1]:5060.

```opensips
modparam("osp","device_ip","[127.0.0.1]:5060")
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

These parameters instruct the OSP module to use the defined AVPs to pass the Identity related values. Then the indentity related values can be used by these AVPs. All pseudo variables are described in https://opensips.org/Resources/DocsCoreVar.

*Default value is $avp(_osp_identity_algorithm_).*

**Example.** $avp(idalg).

```opensips
modparam("osp","identity_algorithm_avp","$avp(idalg)")
```
### `identity_canon_avp` (string)

These parameters instruct the OSP module to use the defined AVPs to pass the Identity related values.

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

These parameters instruct the OSP module to use the defined AVPs to pass the Identity related values. Then the indentity related values can be used by these AVPs. All pseudo variables are described in https://opensips.org/Resources/DocsCoreVar.

*Default value is $avp(_osp_identity_signature_).*

**Example.** $avp(idsign).

```opensips
modparam("osp","identity_signature_avp","$avp(idsign)")
```
### `identity_type_avp` (string)

These parameters instruct the OSP module to use the defined AVPs to pass the Identity related values.

*Default value is $avp(_osp_identity_type_).*

**Example.** $avp(idtype).

```opensips
modparam("osp","identity_type_avp","$avp(idtype)")
```
### `local_certificate` (string)

These parameters identify files are used for validating peering authorization tokens and establishing a secure channel between OpenSIPS and a peering server using SSL. The files are generated using the 'Enroll' utility from the OSP Toolkit. By default, the proxy will look for pkey.pem, localcert.pem, and cacart_0.pem in the default configuration directory. The default config directory is set at compile time using CFG_DIR and defaults to /usr/local/etc/opensips/. The files may be copied to the expected file location or the parameters below may be changed.

*Default value is localcert.pem.*

**Notes:** If use_security_features parameter is set to 0, these parameters will be ignored.

**Example.** /usr/local/etc/opensips/localcert.pem.

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

**Example.** 2.

```opensips
modparam("osp","networkid_location",2)
```
### `networkid_parameter` (string)

The networkid_parameter (string) parameter instructs the OSP module to use which parameter name in outbound destination URIs to append destination network ID.

*Default value is networkid.*

**Example.** networkid.

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

*Default value is "".*

**Example.** "".

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

**Example.** /usr/local/etc/opensips/pkey.pem.

```opensips
modparam("osp","private_key","/usr/local/etc/opensips/pkey.pem")
```
### `report_networkid` (integer)

The report_networkid (integer) parameter is used to tell the OSP module if to report network ID in completed call CDRs. If it is set to 0, ths OSP module does not report any network ID. If it is set to 1, the OSP module reports source network ID. If it is set to 2, the OSP module reports destination network ID. If it is set to 3, the OSP module report both source and destination network IDs.

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

The request_date_avp (string) parameter instructs the OSP module to use the defined AVP to pass the SIP request Date header values. Then the request date can be used by "$avp(_osp_request_date_)". All pseudo variables are described in https://opensips.org/Resources/DocsCoreVar.

*Default value is $avp(_osp_request_date_).*

**Example.** $avp(reqdate).

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

The sdp_fingerprint_avp (string) parameter instructs the OSP module to use the defined AVP to pass the SDP fing print attribute values. Then the SDP finger print attributes can be used by "$avp(_osp_sdp_fingerprint_)". All pseudo variables are described in https://opensips.org/Resources/DocsCoreVar.

*Default value is $avp(_osp_sdp_fingerprint_).*

**Example.** $avp(sdpfp).

```opensips
modparam("osp","sdp_fingerprint_avp","$avp(sdpfp)")
```
### `service_provider_avp` (string)

These parameter is used to tell the OSP module which AVP is used to store source service provider information.

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

**Example.** 0.

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
### `sp16_uri` (string)

These sp_uri (string) parameters define peering servers to be used for requesting peering authorization and routing information. At least one peering server must be configured. Others are required only if there are more than one peering servers. Each peering server address takes the form of a standard URL, and consists of up to four components: An optional indication of the protocol to be used for communicating with the peering server. Both HTTP and HTTP secured with SSL/TLS are supported and are indicated by "http://" and "https://" respectively. If the protocol is not explicitly indicated, the OpenSIPS defaults to HTTP secured with SSL. The Internet domain name for the peering server. An IP address may also be used, provided it is enclosed in square brackets such as [172.16.1.1]. An optional TCP port number for communicating with the peering server. If the port number is omitted, the OpenSIPS defaults to port 5045 (for HTTP) or port 1443 (for HTTP secured with SSL). The uniform resource identifier for requests to the peering server. This component is not optional and must be included.
### `sp1_uri` (string)

These sp_uri (string) parameters define peering servers to be used for requesting peering authorization and routing information. At least one peering server must be configured. Others are required only if there are more than one peering servers. Each peering server address takes the form of a standard URL, and consists of up to four components: An optional indication of the protocol to be used for communicating with the peering server. Both HTTP and HTTP secured with SSL/TLS are supported and are indicated by "http://" and "https://" respectively. If the protocol is not explicitly indicated, the OpenSIPS defaults to HTTP secured with SSL. The Internet domain name for the peering server. An IP address may also be used, provided it is enclosed in square brackets such as [172.16.1.1]. An optional TCP port number for communicating with the peering server. If the port number is omitted, the OpenSIPS defaults to port 5045 (for HTTP) or port 1443 (for HTTP secured with SSL). The uniform resource identifier for requests to the peering server. This component is not optional and must be included.

**Example.** http://osptestserver.transnexus.com:5045/osp.

```opensips
modparam("osp","sp1_uri","http://osptestserver.transnexus.com:5045/osp")
```
### `sp1_weight, sp2_weight, ..., sp16_weight` (integer)

These sp_weight (integer) parameters are used for load balancing peering requests to peering servers. These parameters are most effective when configured as factors of 1000. For example, if sp1_uri should manage twice the traffic load of sp2_uri, then set sp1_weight to 2000 and sp2_weight to 1000. Shared load balancing between peering servers is recommended. However, peering servers can be configured as primary and backup by assigning a sp_weight of 0 to the primary server and a non-zero sp_weight to the back-up server.

*Default value is 1000.*

**Example.** 1000.

```opensips
modparam("osp","sp1_weight",1000)
```
### `sp2_uri` (string)

These sp_uri (string) parameters define peering servers to be used for requesting peering authorization and routing information. At least one peering server must be configured. Others are required only if there are more than one peering servers. Each peering server address takes the form of a standard URL, and consists of up to four components: An optional indication of the protocol to be used for communicating with the peering server. Both HTTP and HTTP secured with SSL/TLS are supported and are indicated by "http://" and "https://" respectively. If the protocol is not explicitly indicated, the OpenSIPS defaults to HTTP secured with SSL. The Internet domain name for the peering server. An IP address may also be used, provided it is enclosed in square brackets such as [172.16.1.1]. An optional TCP port number for communicating with the peering server. If the port number is omitted, the OpenSIPS defaults to port 5045 (for HTTP) or port 1443 (for HTTP secured with SSL). The uniform resource identifier for requests to the peering server. This component is not optional and must be included.

**Example.** https://[1.2.3.4]:1443/osp.

```opensips
modparam("osp","sp2_uri","https://[1.2.3.4]:1443/osp")
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

**Example.** 2.

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

The timeout (integer) parameter defines the maximum time in milliseconds, to wait for a response from a peering server. If no response is received within this time, the current connection is aborted and the OSP module attempts to contact the next peering server. The default value is 10 seconds.

*Default value is 10.*

**Example.** 10.

```opensips
modparam("osp","timeout",10)
```
### `token_format` (integer)

When OpenSIPS receives a SIP INVITE with a peering token, the OSP module will validate the token to determine whether or not the call has been authorized by a peering server. Peering tokens may, or may not, be digitally signed. The token_format (integer) parameter defines if OpenSIPS will validate signed or unsigned tokens or both. The values for token format are defined below. The default value is 2.

*Default value is 2.*

**Possible values:**

- 0 - Validate only signed tokens. Calls with valid signed tokens are allowed.
- 1 - Validate only unsigned tokens. Calls with valid unsigned tokens are allowed.
- 2 - Validate both signed and unsigned tokens are allowed. Calls with valid tokens are allowed.

**Notes:** If use_security_features parameter is set to 0, signed tokens cannot be validated.

**Example.** 2.

```opensips
modparam("osp","token_format",2)
```
### `use_number_portability` (integer)

The use_number_portability (integer) parameter instructs the OSP module how to use the number portability parameters in the Request URI of the SIP INVITE message. If this value is set to 1, the OSP module uses the number portability parameters in the Request URI when these parameters exist. If this value is set to 0, the OSP module will not use the number portability parameters.

*Default value is 1.*

**Possible values:**

- 0
- 1

**Example.** 1.

```opensips
modparam("osp","use_number_portablity",1)
```
### `use_security_features` (integer)

The use_security_features (integer) parameter instructs the OSP module how to use the OSP security features. If this value is set to 1, the OSP module uses the OSP security features. If this value is set to 0, the OSP module will not use the OSP security features.

*Default value is 0.*

**Possible values:**

- 0
- 1

**Example.** 0.

```opensips
modparam("osp","use_security_features",0)
```
### `user_group_avp` (string)

These parameter is used to tell the OSP module which AVP is used to store source user group information.

*Default value is $avp(_osp_user_group_).*

**Example.** $avp(groupid).

```opensips
modparam("osp", "user_group_avp", "$avp(groupid)")
```
### `user_id_avp` (string)

These parameter is used to tell the OSP module which AVP is used to store source user ID information.

*Default value is $avp(_osp_user_id_).*

**Example.** $avp(userid).

```opensips
modparam("osp", "user_id_avp", "$avp(userid)")
```
### `validate_call_id` (integer)

The validate_call_id (integer) parameter instructs the OSP module to validate call id in the peering token. If this value is set to 1, the OSP module validates that the call id in the SIP INVITE message matches the call id in the peering token. If they do not match the INVITE is rejected. If this value is set to 0, the OSP module will not validate the call id in the peering token.

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

**Example.** 0.

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
...
if (checkcallingtranslation()) {
  # Remove the Remote_Party-ID from the received message
  # Otherwise it will be forwarded on to the next hop
  remove_hf("Remote-Party-ID");

  # Append a new Remote_Party
  append_rpid_hf();
}
...
```

### `checkospheader()`

This function checks for the existence of the OSP-Auth-Token header field.

**Usable from:** REQUEST_ROUTE

**Example.** checkospheader usage.

```opensips
...
if (checkospheader()) {
  log(1,"OSP header field found.\\n");
} else {
  log(1,"no OSP header field present\\n");
};
...
```

### `checkosproute()`

This function is used to check if there is any route for the call.

**Return codes:**

- `1` — There is at least one route for the call
- `-1` — There is not any route for the call

**Usable from:** REQUEST_ROUTE

**Related:**

- `prepareosproute`

**Example.** checkosproute usage.

```opensips
...
if (checkosproute()) {
  log(1,"There is at least one route for the call\\n");
} else {
  log(1,"There is not any route for the call\\n");
};
...
```

### `getlocaladdress()`

This function gets the receiving IP address of SIP response and stores it as proxy egress address.

**Usable from:** ONREPLY_ROUTE

**Example.** getlocaladress usage.

```opensips
...
if (getlocaladdress()) {
  log(1,"Obtain proxy local egress address\\n");
} else {
  log(1,"Failed to get proxy local egress address\\n");
};
...
```

### `prepareallosproutes()`

This function tries to prepare all the routes in the list returned by the peering server. The message is then forked off to the destinations. If unsuccessful in preparing the routes a SIP 500 is sent back and a trace message is logged.

**Return codes:**

- `1` — Routes prepared successfully
- `-1` — Could not prepare the routes

**Usable from:** REQUEST_ROUTE

**Example.** prepareallosproutes usage.

```opensips
...
if (prepareallosproutes()) {
  log(1,"Routes are prepared, now forking the call\\n");
} else {
  log(1,"Could not prepare the routes. No destination available\\n");
};
...
```

### `prepareospresponse()`

This function tries to prepare all the routes in the list returned by the peering server into SIP 300 Redirect or SIP 380 Alternative Service message. The message is then replied to the source. If unsuccessful in preparing the routes a SIP 500 is sent back and a trace message is logged.

**Return codes:**

- `1` — Response prepared successfully
- `-1` — Could not prepare the response

**Usable from:** REQUEST_ROUTE

**Example.** prepareospresponse usage.

```opensips
...
if (prepareospresponse()) {
  log(1,"Response is prepared.\\n");
} else {
  log(1,"Could not prepare the response.\\n");
};
...
```

### `prepareosproute()`

This function tries to prepare the INVITE to be forwarded using the destination in the list returned by the peering server. If the calling number is translated, a RPID value for the RPID AVP will be set. If the route could not be prepared, the function returns 'FALSE' back to the script, which can then decide how to handle the failure. Note, if checkosproute has been called and returns 'TRUE' before calling prepareosproute, prepareosproute should not return 'FALSE' because checkosproute has confirmed that there is at least one route.

**Return codes:**

- `1` — Route prepared successfully
- `-1` — Route could not be prepared

**Usable from:** BRANCH_ROUTE

**Related:**

- `checkosproute`

**Example.** prepareosproute usage.

```opensips
...
if (prepareosproute()) {
  log(1,"successfully prepared the route, now relaying call\\n");
} else {
  log(1,"could not prepare the route, there is not route\\n");
};
...
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

- `release` *(integer, required)* — Specifies which device releases the call.
  - `0`
  - `1`

**Return codes:**

- `TRUE` — if the BYE includes an OSP cookie
- `FALSE` — if the BYE does not include an OSP cookie

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

This function launches a query to the peering server requesting the IP address of one or more destination peers serving the called party. If destination peers are available, the peering server will return the IP address and a peering authorization token for each destination peer. The OSP-Auth-Token Header field is inserted into the SIP message and the SIP uri is rewritten to the IP address of destination peer provided by the peering server. The address of the called party must be a valid E164 number, otherwise this function returns -1. If the transaction was accepted by the peering server, the uri is being rewritten and 1 returned, on errors (peering servers are not available, authentication failed or there is no route to destination or the route is blocked) -1 is returned.

**Return codes:**

- `-1` — The address of the called party must be a valid E164 number, otherwise this function returns -1. If the transaction was accepted by the peering server, the uri is being rewritten and 1 returned, on errors (peering servers are not available, authentication failed or there is no route to destination or the route is blocked) -1 is returned.
- `1` — If the transaction was accepted by the peering server, the uri is being rewritten and 1 returned

**Usable from:** REQUEST_ROUTE

**Example.** requestosprouting usage.

```opensips
...
if (requestosprouting()) {
  log(1,"successfully queried OSP server, now relaying call\\n");
} else {
  log(1,"Authorization request was rejected from OSP server\\n");
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
  log(1,"Set request date\\n");
} else {
  log(1,"Failed to set request date\\n");
};
...
```

### `validateospheader()`

This function validates an OSP-Token specified in the OSP-Auth-Tokenheader field of the SIP message. If a peering token is present, it will be validated locally. If no OSP header is found or the header token is invalid or expired, -1 is returned; on successful validation 1 is returned.

**Return codes:**

- `-1` — If no OSP header is found or the header token is invalid or expired
- `1` — on successful validation

**Usable from:** REQUEST_ROUTE

**Example.** validateospheader usage.

```opensips
...
if (validateospheader()) {
  log(1,"valid OSP header found\\n");
} else {
  log(1,"OSP header not found, invalid or expired\\n");
};
...
```

## Configuration Examples

### Instructing the module to work in direct mode

Instructing the module to work in direct mode

```opensips
modparam("osp","work_mode",0)
```
### Instructing the module to provide normal voice service

Instructing the module to provide normal voice service

```opensips
modparam("osp","service_type",0)
```
### Setting the OSP servers

Setting the OSP servers

```opensips
modparam("osp","sp1_uri","http://osptestserver.transnexus.com:5045/osp")
modparam("osp","sp2_uri","https://[1.2.3.4]:1443/osp")
```
### Setting the OSP server weights

Setting the OSP server weights

```opensips
modparam("osp","sp1_weight",1000)
```
### Setting the device IP address

Setting the device IP address

```opensips
modparam("osp","device_ip","[127.0.0.1]:5060")
```
### Instructing the module not to use OSP security features

Instructing the module not to use OSP security features

```opensips
modparam("osp","use_security_features",0)
```
### Setting the token format

Setting the token format

```opensips
modparam("osp","token_format",2)
```
### Set authorization files

If the default CFG_DIR value was used at compile time, the files will be loaded from:

```opensips
modparam("osp","private_key","/usr/local/etc/opensips/pkey.pem")
modparam("osp","local_certificate","/usr/local/etc/opensips/localcert.pem")
modparam("osp","ca_certificates","/usr/local/etc/opensips/cacert.pem")
```
### Setting the hardware support

Setting the hardware support

```opensips
modparam("osp","enable_crypto_hardware_support",0)
```
### Setting the ssl lifetime

Setting the ssl lifetime

```opensips
modparam("osp","ssl_lifetime",200)
```
### Setting the persistence

Setting the persistence

```opensips
modparam("osp","persistence",1000)
```
### Setting the retry delay

Setting the retry delay

```opensips
modparam("osp","retry_delay",1)
```
### Setting the retry limit

Setting the retry limit

```opensips
modparam("osp","retry_limit",2)
```
### Setting the timeout

Setting the timeout

```opensips
modparam("osp","timeout",10)
```
### Setting support non-SIP destination devices

Setting support non-SIP destination devices

```opensips
modparam("osp","support_nonsip_protocol",0)
```
### Setting the number of destination

Setting the number of destination

```opensips
modparam("osp","max_destinations",12)
```
### Setting report network ID flag

Setting report network ID flag

```opensips
modparam("osp","report_networkid",3)
```
### Instructing the module to validate call id

Instructing the module to validate call id

```opensips
modparam("osp","validate_call_id",1)
```
### Instructing the module to use number portability parameters in Request URI

Instructing the module to use number portability parameters in Request URI

```opensips
modparam("osp","use_number_portablity",1)
```
### Append user=phone parameter

Append user=phone parameter

```opensips
modparam("osp","append_userphone",0)
```
### Append networkid location

Append networkid location

```opensips
modparam("osp","networkid_location",2)
```
### Networkid parameter name

Networkid parameter name

```opensips
modparam("osp","networkid_param","networkid")
```
### Append switchid location

Append switchid location

```opensips
modparam("osp","switchid_location",2)
```
### Networkid parameter name

Networkid parameter name

```opensips
modparam("osp","switchid_param","switchid")
```
### Append parameter string location

Append parameter string location

```opensips
modparam("osp","parameterstring_location",0)
```
### Parameter string value

Parameter string value

```opensips
modparam("osp","parameterstring_value","")
```
### Setting the source device IP AVP

Setting the source device IP AVP

```opensips
modparam("osp","source_device_avp","$avp(srcdev)")
```
### Setting the source network ID AVP

Setting the source network ID AVP

```opensips
modparam("osp","source_networkid_avp","$avp(snid)")
```
### Setting the source switch ID AVP

Setting the source switch ID AVP

```opensips
modparam("osp","source_switchid_avp","$avp(swid)")
```
### Setting the custom info AVP

Setting the custom info AVP

```opensips
modparam("osp","custom_info_avp","$avp(cinfo)")
```
### Setting the CNAM AVP

Setting the CNAM AVP

```opensips
modparam("osp","cnam_avp","$avp(cnam)")
```
### Setting the NOTIFY extra headers

Setting the NOTIFY extra headers

```opensips
modparam("osp", "extraheaders_value", "Source: N")
```
### Setting the media address AVPs

Setting the media address AVPs

```opensips
modparam("osp", "source_media_avp", "$avp(srcmedia)")
modparam("osp", "destination_media_avp", "$avp(destmedia)")
```
### Setting the request date AVP

Setting the request date AVP

```opensips
modparam("osp","request_date_avp","$avp(reqdate)")
```
### Setting the SDP finger print AVP

Setting the SDP finger print AVP

```opensips
modparam("osp","sdp_fingerprint_avp","$avp(sdpfp)")
```
### Setting the Identity related AVPs

Setting the Identity related AVPs

```opensips
modparam("osp","identity_signature_avp","$avp(idsign)")
modparam("osp","identity_algorithm_avp","$avp(idalg)")
modparam("osp","identity_information_avp","$avp(idinfo)")
modparam("osp","identity_type_avp","$avp(idtype)")
modparam("osp","identity_canon_avp","$avp(idcanon)")
```
### Setting the source service provider AVP

Setting the source service provider AVP

```opensips
modparam("osp", "service_provider_avp", "$avp(sp)")
```
### Setting the source user group AVP

Setting the source user group AVP

```opensips
modparam("osp", "user_group_avp", "$avp(groupid)")
```
### Setting the source user ID AVP

Setting the source user ID AVP

```opensips
modparam("osp", "user_id_avp", "$avp(userid)")
```
### checkospheader usage

checkospheader usage

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

validateospheader usage

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

getlocaladress usage

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

setrequestdate usage

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

requestosprouting usage

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

checkosproute usage

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

prepareosproute usage

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

prepareospresponse usage

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

prepareallosproutes usage

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

checkcallingtranslation usage

```opensips
...
if (checkcallingtranslation()) {
  # Remove the Remote_Party-ID from the received message
  # Otherwise it will be forwarded on to the next hop
  remove_hf("Remote-Party-ID");

  # Append a new Remote_Party
  append_rpid_hf();
}
...
```
### reportospusage usage

reportospusage usage

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

processsubscribe usage

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
