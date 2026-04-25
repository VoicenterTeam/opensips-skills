## 1.3.�Exported Parameters

_None_.

### 1.3.1.�`db_mode` (integer)

Set caching mode (0) or non-caching mode (1). In caching mode, data is loaded at startup. In non-caching mode, the module check every time a table is requested whether the corresponding file on disk has changed, and if yes, will re-load table from file.

_Default value is “0”._

**Example�1.4.�Set `db_mode` parameter**

...
modparam("db\_text", "db\_mode", 1)
...