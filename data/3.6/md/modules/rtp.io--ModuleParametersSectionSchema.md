## 1.3.�Exported Parameters

### 1.3.1.�`rtpproxy_args`(string)

Command-line parameteres passed down to the embedded RTPProxy module upon initialization. Refer to the RTPProxy documentation for the full list.

_Parameter has no default value._

**Example�1.1.�Set `rtpproxy_args` parameter**

...
modparam("rtp.io", "rtpproxy\_args", "-m 12000 -M 15000 -l 0.0.0.0 -6 /::")
...