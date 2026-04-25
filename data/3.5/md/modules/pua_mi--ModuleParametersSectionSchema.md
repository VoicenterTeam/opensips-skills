## 1.3.�Exported Parameters

### 1.3.1.�`presence_server` (str)

The the address of the presence server. If set, it will be used as outbound proxy when sending PUBLISH requests.

**Example�1.1.�Set `presence_server` parameter**

...
modparam("pua\_mi", "presence\_server", "sip:pa@opensips.org:5075")
...