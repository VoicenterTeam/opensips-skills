## 1.3.�Exported Parameters

### 1.3.1.�`max_limit` (integer)

Set an upper limit for the max-forward value in the outgoing requests. If the header is present, the decremented value is not allowed to exceed this max\_limits - if it does, the header value will by decreased to “max\_limit”.

Note: This check is done when calling the mf\_process\_maxfwd\_header() header.

The range of values stretches from 1 to 256, which is the maximum MAX-FORWARDS value allowed by RFC 3261.

_Default value is “256”._

**Example�1.1.�Set `max_limit` parameter**

...
modparam("maxfwd", "max\_limit", 32)
...