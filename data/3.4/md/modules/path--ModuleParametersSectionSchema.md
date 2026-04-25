## 1.3.�Exported Parameters

### 1.3.1.�`use_received` (int)

If set to 1, the “received” parameter of the first Route URI is evaluated and used as destination-URI if present.

_Default value is 0._

**Example�1.1.�Set `use_received` parameter**

...
modparam("path", "use\_received", 1)
...

  

### 1.3.2.�`enable_double_path` (integer)

There are some situations when the server needs to insert two Path header fields instead of one. For example when using two disconnected networks or doing cross-protocol forwarding from UDP->TCP. This parameter enables inserting of 2 Paths.

_Default value is 1 (yes)._

**Example�1.2.�Set `enable_double_path` parameter**

...
modparam("path", "enable\_double\_path", 0)
...