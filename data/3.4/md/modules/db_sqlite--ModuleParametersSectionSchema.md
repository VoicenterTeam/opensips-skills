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

**Example�1.2.�Set `db_sqlite_alloc_limit` parameter**

...
modparam("db\_sqlite", "load\_extension", "/usr/lib/sqlite3/pcre.so")
modparam("db\_sqlite", "load\_extension", "/usr/lib/sqlite3/pcre.so;sqlite3\_extension\_init")
...