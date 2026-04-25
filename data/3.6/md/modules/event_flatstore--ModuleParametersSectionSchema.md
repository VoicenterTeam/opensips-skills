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

  

### 1.5.3.�`escape_delimiter` (string)

Optional replacement sequence that will be written _instead of_ the [`delimiter`](#param_delimiter "1.5.2.�delimiter (string)") whenever this character (or sequence) occurs inside a string parameter. This allows you to keep the log file parse-friendly even when user data itself may contain delimiter symbols.

If set, its length _must be exactly equal_ to the length of `delimiter`.

_Default value is “""” (escaping disabled)._

**Example�1.3.�Enable escaping of ',' with '|'**

...
modparam("event\_flatstore", "delimiter", ",")
modparam("event\_flatstore", "escape\_delimiter", "|")
...
	

  

### 1.5.4.�`file_permissions` (string)

Sets the permissions for the newly created logs. It expects a string representation of a octal value.

_Default value is “644”._

**Example�1.4.�Set `file_permissions` parameter**

...
modparam("event\_flatstore", "file\_permissions", "664")
...

  

### 1.5.5.�`suppress_event_name` (int)

Suppresses the name of the event in the log file.

_Default value is “0/OFF” (the event's name is printed)._

**Example�1.5.�Set `suppress_event_name` parameter**

...
modparam("event\_flatstore", "suppress\_event\_name", 1)
...

  

### 1.5.6.�`rotate_period` (int)

When used, it triggers a file auto-rotate. The period is matched against the absolute time of the machine, can be useful to trigger auto-rotate every minute, or every hour.

_Default value is “0/OFF” (the file is never auto-rotated)_

**Example�1.6.�Set `rotate_period` parameter**

...
modparam("event\_flatstore", "rotate\_period", 60) # rotate every minute
modparam("event\_flatstore", "rotate\_period", 3660) # rotate every hour
...

  
\`

### 1.5.7.�`rotate_count` (int|string)

Defines after how many written lines the log file is rotated. The value may exceed the 32-bit integer limit; in that case pass it _as a string_, e.g. "5000000000".

_Default value is “0/OFF”._

**Example�1.7.�Rotate after five billion lines**

...
modparam("event\_flatstore", "rotate\_count", "5000000000")
...
		

  

### 1.5.8.�`rotate_size` (int|string)

Sets the maximum size of a file before it is rotated. A size suffix of “k”, “m” or “g” (multiples of 1024) may be provided. Very large values can be supplied as strings, e.g. "8589934592" for 8 GiB.

_Default value is “0/OFF”._

**Example�1.8.�Rotate at 2 GiB**

...
modparam("event\_flatstore", "rotate\_size", "2g")
...

  

### 1.5.9.�`suffix` (string)

Modifies the file that OpenSIPS writes events into by appending a suffix to the the file specified in the flatstore _socket_.

The suffix can contain string formats (i.e. variables mixed with strings). The path of the resulted file is evaluated when the first event is raised/written in the file after a reload happend, or when the _rotate\_period_, if specified, triggers a rotate.

This parameter does not affect the matching of the event socket - the matching will be done exclusively using the flatstore _socket_ registered.

_Default value is “""” (no suffix is added)_

**Example�1.9.�Set `suffix` parameter**

...
modparam("event\_flatstore", "suffix", "$time(%Y)")
...