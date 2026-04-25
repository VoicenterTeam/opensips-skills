## 1.3.�Exported Parameters

### 1.3.1.� `cachedb_url` (str)

The URL for the CacheDB back-end to be used. It can be set more than one time.

**Example�1.1.�Set `cachedb_url` parameter**

...
modparam("db\_cachedb","cachedb\_url","mongodb:mycluster://127.0.0.1:27017/db.col")
...