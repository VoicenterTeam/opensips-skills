## 1.5.�Exported MI Functions

### 1.5.1.�`dbt_dump`

Write back to hard drive modified tables.

Name: _dbt\_dump_.

Parameters: none

MI FIFO Command Format:

opensips-cli -x mi dbt\_dump
		

### 1.5.2.�`dbt_reload`

Causes db\_text module to reload cached tables from disk. Depending on parameters it could be a whole cache or a specified database or a single table. If any table cannot be reloaded from disk - the old version preserved and error reported.

Name: _dbt\_reload_.

Parameters:

*   _db\_name_ (optional) - database name to reload.
    
*   _table\_name_ (optional, but cannot be present without the db\_name parameter) - specific table to reload.
    

MI FIFO Command Format:

opensips-cli -x mi dbt\_reload
		

opensips-cli -x mi dbt\_reload /path/to/dbtext/database
		

opensips-cli -x mi dbt\_reload /path/to/dbtext/database table\_name