## 1.4.�Exported Parameters

### 1.4.1.�`aaa_url` (string)

This is the url representing the AAA protocol used and the location of the configuration file of this protocol.

The syntax for the url is the following: "name\_of\_the\_aaa\_protocol\_used:path\_of\_the\_configuration\_file"

**Example�1.2.�`aaa_url` parameter usage**

		
modparam("auth\_aaa", "aaa\_url", "radius:/etc/radiusclient-ng/radiusclient.conf")
		

  

### 1.4.2.�`auth_service_type` (integer)

This is the value of the Service-Type aaa attribute to be used when performing an authentication operation. The default should be fine for most people. See your aaa client include files for numbers to be put in this parameter if you need to change it.

Default value is “15”.

**Example�1.3.�`auth_service_type` parameter usage**

		
modparam("auth\_aaa", "auth\_service\_type", 15)
		

  

### 1.4.3.�`check_service_type` (integer)

AAA service type used by `aaa_does_uri_exist` and `aaa_does_uri_user_exist` checks.

_Default value is 10 (Call-Check)._

**Example�1.4.�Set `check_service_type` parameter**

...
modparam("auth\_aaa", "check\_service\_type", 11)
...

  

### 1.4.4.�`use_ruri_flag` (string)

When this parameter is set to the value other than "NULL" and the request being authenticated has flag with matching number set via setflag() function, use Request URI instead of uri parameter value from the Authorization / Proxy-Authorization header field to perform AAA authentication. This is intended to provide workaround for misbehaving NAT / routers / ALGs that alter request in the transit, breaking authentication. At the time of this writing, certain versions of Linksys WRT54GL are known to do that.

Default value is “NULL” (not set).

**Example�1.5.�`use_ruri_flag` parameter usage**

		
modparam("auth\_aaa", "use\_ruri\_flag", "USE\_RURI\_FLAG")