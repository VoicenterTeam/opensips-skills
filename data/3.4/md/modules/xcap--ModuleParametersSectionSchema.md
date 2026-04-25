## 1.4.�Exported Parameters

### 1.4.1.�`db_url`(str)

The database url.

_Default value is “mysql://opensips:opensipsrw@localhost/opensips”._

**Example�1.1.�Set `db_url` parameter**

...
modparam("xcap", "db\_url", "dbdriver://username:password@dbhost/dbname")
...
                

  

### 1.4.2.�`xcap_table`(str)

The name of the db table where XCAP documents are stored.

_Default value is “xcap”._

**Example�1.2.�Set `xcap_table` parameter**

...
modparam("xcap", "xcap\_table", "xcap")
...
                

  

### 1.4.3.�`integrated_xcap_server` (int)

This parameter is a flag for the type of XCAP server or servers used. If integrated ones, like OpenXCAP from AG Projects, with direct access to database table, the parameter should be set to a positive value. Apart from updating in xcap table, the integrated server must send an MI command refershWatchers \[pres\_uri\] \[event\] when a user modifies a rules document.

_Default value is “0”._

**Example�1.3.�Set `integrated_xcap_server` parameter**

...
modparam("xcap", "integrated\_xcap\_server", 1)
...