## 1.5.�Exported Parameters

### 1.5.1.�`max_open_sockets` (integer)

Defines the maximum number of simultaneously opened files by the module. If the maximum limit is reached, an error message will be thrown, and further subscriptions will only be possible after at least one of the current subscriptions will expire.

_Default value is “100”._

**Example�1.1.�Set `max_open_sockets` parameter**

...
modparam("event\_flatstore", "max\_open\_sockets", 200)
...

  

### 1.5.2.�`delimiter` (string)

Sets the separator between the parameters of the event in the logging file.

_Default value is “,”._

**Example�1.2.�Set `delimiter` parameter**

...
modparam("event\_flatstore", "delimiter", ";")
...

  

### 1.5.3.�`file_permissions` (string)

Sets the permissions for the newly created logs. It expects a string representation of a octal value.

_Default value is “644”._

**Example�1.3.�Set `file_permissions` parameter**

...
modparam("event\_flatstore", "file\_permissions", "664")
...

  

### 1.5.4.�`suppress_event_name` (int)

Suppresses the name of the event in the log file.

_Default value is “0/OFF” (the event's name is printed)._

**Example�1.4.�Set `suppress_event_name` parameter**

...
modparam("event\_flatstore", "suppress\_event\_name", 1)
...