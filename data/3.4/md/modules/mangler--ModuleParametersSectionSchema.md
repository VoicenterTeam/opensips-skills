## 1.3.�Exported Parameters

### 1.3.1.�`contact_flds_separator` (string)

First char of this parameter is used as separator for encoding/decoding Contact header.

### Warning

First char of this field must be set to a value which is not used inside username,password or other fields of contact. Otherwise it is possible for the decoding step to fail/produce wrong results.

_Default value is “\*”._

**Example�1.1.�Set `db_url` parameter**

...
modparam("mangler", "contact\_flds\_separator", "-")
...

  

then an encoded uri might look sip:user-password-ip-port-protocol@PublicIP