## 1.4.�Exported Parameters

### 1.4.1.�`use_struct_param` (integer)

When raising an event, pack the name and value of the parameters in a XMLRPC structure. This provides an easier way for some XMLRPC server implementations to interpret the parameters. Set it to zero to disable or to non-zero to enable it.

_Default value is “0 (disabled)”._

**Example�1.1.�Set `use_struct_param` parameter**

...
modparam("event\_xmlrpc", "use\_struct\_param", 1)
...