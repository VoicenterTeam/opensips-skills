## 1.3.�Exported Parameters

### 1.3.1.�`get_route` (string)

The name of the script route to be run in order to retrieve the status of a feature.

_Default value is “dfks\_get”._

**Example�1.1.�Set parameter**

...
modparam("presence\_dfks", "get\_route", "dfks\_get")
...

  

### 1.3.2.�`set_route` (string)

The name of the script route to be run when a feature status update from a SIP phone is received.

_Default value is “dfks\_get”._

**Example�1.2.�Set parameter**

...
modparam("presence\_dfks", "set\_route", "dfks\_set")
...