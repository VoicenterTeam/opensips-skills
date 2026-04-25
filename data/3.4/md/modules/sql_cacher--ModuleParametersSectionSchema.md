## 1.3.�Exported Parameters

### 1.3.1.�`cache_table` (string)

This parameter can be set multiple times in order to cache multiple SQL tables or even the same table but with a different configuration. The module distinguishes those different entries by an “id” string.

The caching entry is specified via this parameter that has it's own subparameters. Each of those parameters are separated by a delimiter configured by [spec\_delimiter](#param_spec_delimiter "1.3.2.�spec_delimiter (string)") and have the following format:

_param\_name=param\_value_

The parameters are:

*   _id_ : cache entry id
    
*   _db\_url_ : the URL of the SQL database
    
*   _cachedb\_url_ : the URL of the CacheDB database
    
*   _table_ : SQL database table name
    
*   _key_ : SQL database column name of the “key” column
    
*   _key\_type_ : data type for the SQL "key" column:
    
    *   string
        
    *   int
        
    
    If not present, default value is “string”
    
*   _columns_ : names of the columns to be cached from the SQL database, separated by a delimiter configured by [columns\_delimiter](#param_columns_delimiter "1.3.4.�columns_delimiter (string)").
    
    If not present, all the columns from the table will be cached
    
*   _on\_demand_ : specifies the type of caching:
    
    *   0 : full caching
        
    *   1 : on demand
        
    
    If not present, default value is “0”
    
*   _expire_ : expire period for the values stored in the cache for the on demand caching type in seconds
    
    If not present, default value is “1 hour”
    

The parameters must be given in the exact order specified above.

Overall, the parameter does not have a default value, it must be set at least once in order to cache any table.

**Example�1.1.�`cache_table` parameter usage**

   
modparam("sql\_cacher", "cache\_table",
"id=caching\_name
db\_url=mysql://root:opensips@localhost/opensips\_2\_2
cachedb\_url=mongodb:mycluster://127.0.0.1:27017/db.col
table=table\_name
key=column\_name\_0
columns=column\_name\_1 column\_name\_2 column\_name\_3
on\_demand=0")
   

  

### 1.3.2.�`spec_delimiter` (string)

The delimiter to be used in the caching entry specification provided in the _cache\_table_ parameter to separate the subparameters. It must be a single character.

The default value is newline.

**Example�1.2.�`spec_delimiter` parameter usage**

   
modparam("sql\_cacher", "spec\_delimiter", "\\n")
   

  

### 1.3.3.�`pvar_delimiter` (string)

The delimiter to be used in the “$sql\_cached\_value” pseudovariable to separate the caching id, the desired column name and the value of the key. It must be a single character.

The default value is “:”.

**Example�1.3.�`pvar_delimiter` parameter usage**

   
modparam("sql\_cacher", "pvar\_delimiter", " ")
   

  

### 1.3.4.�`columns_delimiter` (string)

The delimiter to be used in the _columns_ subparameter of the caching entry specification provided in the _cache\_table_ parameter to separate the desired columns names. It must be a single character.

The default value is “ ”(space).

**Example�1.4.�`columns_delimiter` parameter usage**

   
modparam("sql\_cacher", "columns\_delimiter", ",")
   

  

### 1.3.5.�`sql_fetch_nr_rows` (integer)

The number of rows to be fetched into OpenSIPS private memory in one chunk from the SQL database driver. When querying large tables, adjust this parameter accordingly to avoid the filling of OpenSIPS private memory.

The default value is “100”.

**Example�1.5.�`sql_fetch_nr_rows` parameter usage**

   
modparam("sql\_cacher", "sql\_fetch\_nr\_rows", 1000)
   

  

### 1.3.6.�`full_caching_expire` (integer)

Expire period for the values stored in cache for the full caching type in seconds. This is the longest time that deleted or modified data remains in cache.

The default value is “24 hours”.

**Example�1.6.�`full_caching_expire` parameter usage**

   
modparam("sql\_cacher", "full\_caching\_expire", 3600)
   

  

### 1.3.7.�`reload_interval` (integer)

This parameter represents how many seconds before the data expires (for full caching) the automatic reloading is triggered.

The default value is “60 s”.

**Example�1.7.�`reload_interval` parameter usage**

   
modparam("sql\_cacher", "reload\_interval", 5)