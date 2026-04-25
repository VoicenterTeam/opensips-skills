## 1.3.�Exported Parameters

### 1.3.1.�`enable_long_quoting` (boolean)

Enable this parameter if your input JSONs contain signed integers which do not fit into 4 bytes (e.g. larger than 2147483647, etc.). If the parameter is enabled, 4-byte integers will continue to be returned as integers, while larger values will be returned as strings, in order to avoid the integer overflow.

_Default value is _false_._

**Example�1.1.�Set `enable_long_quoting` parameter**

...
modparam("json", "enable\_long\_quoting", true)
...
# normalize the "gateway\_id" int/string value to be always a string
$var(gateway\_id) = "" + $json(body/gateway\_id);
...