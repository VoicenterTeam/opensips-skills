## 1.3.�Exported Parameters

### 1.3.1.�`aaa_url` (string)

This is the url representing the AAA protocol used and the location of the configuration file of this protocol.

If the parameter is set to empty string, the AAA accounting support will be disabled (even if compiled).

Default value is “NULL”.

**Example�1.1.�Set `aaa_url` parameter**

...
modparam("peering", "aaa\_url", "radius:/etc/radiusclient-ng/radiusclient.conf")
...

  

### 1.3.2.�`verify_destination_service_type` (integer)

This is the value of the Service-Type AAA attribute to be used, when sender of SIP Request verifies request's destination using verify\_destination() function.

Default value is dictionary value of “Sip-Verify-Destination” Service-Type.

**Example�1.2.�`verify_destination_service_type` parameter usage**

...
modparam("peering", "verify\_destination\_service\_type", 21)
...

  

### 1.3.3.�`verify_source_service_type` (integer)

This is the value of the Service-Type AAA attribute to be used, when receiver of SIP Request verifies request's source using verify\_source() function.

Default value is dictionary value of “Sip-Verify-Source” Service-Type.

**Example�1.3.�`verify_source_service_type` parameter usage**

...
modparam("peering", "verify\_source\_service\_type", 22)
...