## 1.3.�Exported Parameters

### 1.3.1.�`accept` (string)

This parameter is the content of the Accept header field. If “”, the header is not added in the reply. Note: it is not clearly written in RFC3261 if a proxy should accept any content (the default “\*/\*”) because it does not care about content. Or if it does not accept any content, which is “”.

_Default value is “\*/\*”._

**Example�1.1.�Set `accept` parameter**

...
modparam("options", "accept", "application/\*")
...

  

### 1.3.2.�`accept_encoding` (string)

This parameter is the content of the Accept-Encoding header field. If “”, the header is not added in the reply. Please do not change the default value because OpenSIPS does not support any encodings yet.

_Default value is “”._

**Example�1.2.�Set `accept_encoding` parameter**

...
modparam("options", "accept\_encoding", "gzip")
...

  

### 1.3.3.�`accept_language` (string)

This parameter is the content of the Accept-Language header field. If “”, the header is not added in the reply. You can set any language code which you prefer for error descriptions from other devices, but presumably there are not much devices around which support other languages then the default English.

_Default value is “en”._

**Example�1.3.�Set `accept_language` parameter**

...
modparam("options", "accept\_language", "de")
...

  

### 1.3.4.�`support` (string)

This parameter is the content of the Support header field. If “”, the header is not added in the reply. Please do not change the default value, because OpenSIPS currently does not support any of the SIP extensions registered at the IANA.

_Default value is “”._

**Example�1.4.�Set `support` parameter**

...
modparam("options", "support", "100rel")
...