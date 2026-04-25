## 1.3.�Exported Parameters

### 1.3.1.�`timeout` (fixedpoint)

Timeout value for any operation with BD.

Possible values is from 0.1 to 10.0 seconds.

_Default value is 3.0 (3 second)._

If value of timeout parameter set to 0, module use synchronous mode (without timeout).

**Example�1.1.�Set `timeout` parameter**

...
modparam("db\_oracle", "timeout", 1.5)
...

  

**Example�1.2.�Disable asynchronous mode**

...
modparam("db\_oracle", "timeout", 0)
...

  

### 1.3.2.�`reconnect` (fixedpoint)

Timeout value for connect (create session) operation.

Possible values is from 0.1 to 10.0 seconds.

_Default value is 0.2 (200 milliseconds)._

**Example�1.3.�Set `reconnect` parameter**

...
modparam("db\_oracle", "reconnect", 0.5)
...