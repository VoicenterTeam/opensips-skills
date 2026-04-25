## 1.3.�Exported Parameters

### 1.3.1.�`alloc_limit` (integer)

Since the library does not support a function to return the number of rows in a query, this number is obtained using "count(\*)" query. If we use multiple processes there is the risk ,since "count(\*)" query and the actual "select" query, the number of rows in the result query to have changed, so realloc will be needed if the number is bigger. Using _alloc\_limit_ parameter you can specify the number with which the number of allocated rows in the result is raised.

_Default value is 10._

**Example�1.1.�Set `alloc_limit` parameter**

...
modparam("db\_sqlite", "alloc\_limit", 25)
...

  

### 1.3.2.�`load_extension` (string)

This parameter enables extension loading, similiar to ".load" functionality in sqlite3, extenions like sqlite3-pcre which enables REGEX function. In order to use this functionality you must specify the library path (.so file) and the entry point which represents the function to be called by the sqlite library (read more at sqlite [load\_extension](https://www.sqlite.org/capi3ref.html#sqlite3_load_extension) official documentation), separated by ";" delimiter. The entry point paramter can miss, so you won't need to use the delimitier in this case.

_By default, no extension is loaded._

**Example�1.2.�Set `load_extension` parameter**

...
modparam("db\_sqlite", "load\_extension", "/usr/lib/sqlite3/pcre.so")
modparam("db\_sqlite", "load\_extension", "/usr/lib/sqlite3/pcre.so;sqlite3\_extension\_init")
...

  

### 1.3.3.�`busy_timeout` (integer)

This parameter sets the default busy\_handler for the SQLite library, that sleeps for a specified amount of time when a table is locked. The handler will sleep multiple times until at least the specified "busy\_timeout" duration (in milliseconds) has been reached. Setting this parameter to a value less than or equal to zero turns off all busy handlers. (read more in the [SQLite official documentation](https://www.sqlite.org/capi3ref.html#sqlite3_busy_timeout))

_Default value is 500._

**Example�1.3.�Set `busy_timeout` parameter**

...
modparam("db\_sqlite", "busy\_timeout", 5000)
...

  

### 1.3.4.�`exec_pragma` (string)

This parameter allows configuring an SQLite database with "PRAGMA" statements, (read more in the [SQLite official documentation](https://sqlite.org/pragma.html)) To use this functionality you must specify the exec\_pragma parameter value as "pragma-name=pragma-value". Multiple parameters with the same name can be specified, and they will be executed one by one on every database connection. If a parameter has an incorrect name or syntax, it will be ignored by SQLite without any error messages.

_By default, no PRAGMA statements are executed._

**Example�1.4.�Set `exec_pragma` parameter**

...
modparam("db\_sqlite", "exec\_pragma", "journal\_mode=wal")
modparam("db\_sqlite", "exec\_pragma", "synchronous=normal")
modparam("db\_sqlite", "exec\_pragma", "cache\_size=-2000")
...