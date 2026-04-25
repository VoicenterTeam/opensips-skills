## 1.3.�Exported Parameters

### 1.3.1.�`db_url` (string)

Url to the database containing the routing data.

_Default value is “mysql://opensipsro:opensipsro@localhost/opensips”._

**Example�1.1.�Set `db_url` parameter**

...
modparam("userblacklist", "db\_url", "dbdriver://username:password@dbhost/dbname")
...
		

  

### 1.3.2.�`db_table` (string)

Name of the table where the user blacklist data is stored.

_Default value is “userblacklist”._

**Example�1.2.�Set `db_table` parameter**

...
modparam("userblacklist", "db\_table", "userblacklist")
...
		    

  

### 1.3.3.�`use_domain` (integer)

If set to non-zero value, the domain column in the userblacklist is used.

_Default value is “0”._

**Example�1.3.�Set `use_domain` parameter**

...
modparam("userblacklist", "use\_domain", 0)
...