## 1.5.�Exported MI Functions

### 1.5.1.�`bdb_reload`

Causes db\_berkeley module to re-read the contents of specified table (or dbenv). The db\_berkeley DB actually loads each table on demand, as opposed to loading all at mod\_init time. The bdb\_reload operation is implemented as a close followed by a reopen. Note- bdb\_reload will fail if a table has not been accessed before (because the close will fail).

Name: _bdb\_reload_

Parameters:

*   _table\_path_ - to reload a particular table provide the tablename as the arguement; to reload all tables provide the db\_path to the db files. The path can be found in opensipsc-cli config variable.
    

MI FIFO Command Format:

		opensips-cli -x mi bdb\_reload subscriber