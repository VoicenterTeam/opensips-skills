## 1.3.�Exported Parameters

### 1.3.1.�`auto_reconnect` (int)

Turns on or off the auto\_reconnect mode.

_Default value is “1”, this means it is enabled._

**Example�1.1.�Set the “auto\_reconnect” parameter**

...
modparam("db\_unixodbc", "auto\_reconnect", 0)
...

  

### 1.3.2.�`use_escape_common` (int)

Escape values in query using internal escape\_common() function. It escapes single quote ''', double quote '"', backslash '\\', and NULL characters.

You should enable this parameter if you know that the ODBC driver considers the above characters as special (for marking begin and end of a value, escape other characters ...). It prevents against SQL injection.

_Default value is “0” (0 = disabled; 1 = enabled)._

**Example�1.2.�Set the “use\_escape\_common” parameter**

...
modparam("db\_unixodbc", "use\_escape\_common", 1)
...