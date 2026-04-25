## 1.3.�Parameters

### 1.3.1.�`param_subfield_separator` (str)

The character to be used as separator in the subname of the _$isup\_param_ and _$isup\_param\_str_ pseudovariables between the ISUP parameter name and subfield name.

_Default value is "|"._

**Example�1.1.�Set `param_subfield_separator` parameter**

...
modparam("sip\_i", "param\_subfield\_separator", ":")
...

  

### 1.3.2.�`isup_mime_str` (str)

The string to be used for the Content-Type header field of the ISUP MIME body when creating a new ISUP part.

_Default value is "application/ISUP;version=itu-t92+"._

**Example�1.2.�Set `isup_mime_str` parameter**

...
modparam("sip\_i", "isup\_mime\_str", "application/ISUP;base=itu-t92+;version=itu-t")
...

  

### 1.3.3.�`default_part_headers` (str)

The default set of headers (fully defined, including the header termination) to be pushed into the ISUP part together with the _Content-Type_ header.

_Default value is "Content-Disposition:signal;handling=optional\\r\\n"._

**Example�1.3.�Set `default_part_headers` parameter**

...
modparam("sip\_i", "default\_part\_headers", "Content-Disposition:signal;handling=required\\r\\n")
...

  

### 1.3.4.�`country_code` (str)

Country Code that the first part of the number from P-Asserted-Identity is tested against when trying to map the Calling Party Number ISUP parameter from SIP by default. If there is a match, the value assigned to the Nature of Address Indicator subfield is _3_(national), otherwise it is _4_(international).

_Default value is "+1"._

**Example�1.4.�Set `country_code` parameter**

...
modparam("sip\_i", "country\_code", "+4")
...