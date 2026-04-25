## 1.3.�Exported Parameters

### 1.3.1.�`db_mode` (integer)

Set caching mode (0) or non-caching mode (1). In caching mode, data is loaded at startup. In non-caching mode, the module check every time a table is requested whether the corresponding file on disk has changed, and if yes, will re-load table from file.

_Default value is “0”._

**Example�1.4.�Set `db_mode` parameter**

...
modparam("db\_text", "db\_mode", 1)
...

  

### 1.3.2.�`buffer_size` (integer)

Size of the buffer used to read the text file.

_Default value is “4096”._

**Example�1.5.�Set `buffer_size` parameter**

...
modparam("db\_text", "buffer\_size", 8192)
...