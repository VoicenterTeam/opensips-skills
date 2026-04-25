## 1.7.�Exported Parameters

### 1.7.1.�`pi_http_root`(string)

Specifies the root path for pi HTTP requests. The link to the OpenSIPS provisioning web interface must be constructed using the following patern: http://\[opensips\_IP\]:\[opensips\_mi\_port\]/\[pi\_http\_root\]

_The default value is "pi"._

**Example�1.1.�Set `pi_http_root` parameter**

...
modparam("pi\_http", "pi\_http\_root", "opensips\_pi")
...

  

### 1.7.2.�`framework`(string)

Specifies the full path for xml framework descriptor.

_There's no default value. This parameter is mandatory._

**Example�1.2.�Set `framework` parameter**

...
modparam("pi\_http", "framework", "/usr/local/etc/opensips/pi\_framework.xml")
...

  

### 1.7.3.�`pi_http_method`(integrer)

Specifies the HTTP request method to be used:

*   0 - use GET HTTP request
    
*   1 - use POST HTTP request
    

_The default value is 0._

**Example�1.3.�Set `pi_http_method` parameter**

...
modparam("pi\_http", "pi\_http\_method", 1)
...