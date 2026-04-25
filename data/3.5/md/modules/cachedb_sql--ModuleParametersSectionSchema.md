## 1.5.�Exported Parameters

### 1.5.1.�`cachedb_url` (string)

The url of the Database that OpenSIPS will connect to in order to use the from script cache\_store,cache\_fetch, etc operations.

The format to follow is : sql:\[conn\_id\]-dburl

The parameter can be set multiple times to create multiple connections accessible from the OpenSIPS script.

**Example�1.1.�Set `db_url` parameter**

...
modparam("cachedb\_sql", "cachedb\_url", "sql:1st-mysql://root:vlad@localhost/opensips\_sql")
...
	

  

**Example�1.2.�Usage example**

...
modparam("cachedb\_sql", "cachedb\_url", "sql:1st-mysql://root:vlad@localhost/opensips\_sql")
modparam("cachedb\_sql", "cachedb\_url", "sql:2nd-postgres://root:vlad@localhost/opensips\_pg")
...
...
cache\_store("sql:1st-mysql","key","$ru value");
cache\_store("sql:2nd-postgres","counter","10");
...
	

  

### 1.5.2.�`db_table` (string)

The table of the Database that OpenSIPS will connect to in order to use the from script cache\_store,cache\_fetch, etc operations.

**Example�1.3.�Set `db_url` parameter**

...
modparam("cachedb\_sql", "db\_table","my\_table");
...
	

  

### 1.5.3.�`key_column` (string)

The column where the key will be stored

**Example�1.4.�Set `key_column` parameter**

...
modparam("cachedb\_sql", "key\_column","some\_name");
...
	

  

### 1.5.4.�`value_column` (string)

The column where the value will be stored

**Example�1.5.�Set `value_column` parameter**

...
modparam("cachedb\_sql", "value\_column","some\_name");
...
	

  

### 1.5.5.�`counter_column` (string)

The column where the counter value will be stored

**Example�1.6.�Set `counter_column` parameter**

...
modparam("cachedb\_sql", "counter\_column","some\_name");
...
	

  

### 1.5.6.�`expires_column` (string)

The column where the expires will be stored

**Example�1.7.�Set `expires_column` parameter**

...
modparam("cachedb\_sql", "expires\_column","some\_name");
...
	

  

### 1.5.7.�`cache_clean_period` (int)

The interval in seconds at which the expired keys will be removed from the database. Default value is 60 ( seconds )

**Example�1.8.�Set `cache_clean_period` parameter**

...
modparam("cachedb\_sql", "cache\_clean\_period",10);
...
	

  

### 1.5.8.�Exported Functions

The module does not export functions to be used in configuration script.