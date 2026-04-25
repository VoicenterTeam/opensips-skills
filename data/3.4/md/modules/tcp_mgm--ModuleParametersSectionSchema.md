## 1.3.�Exported Parameters

### 1.3.1.�`db_url (string)`

Mandatory URL to the SQL database.

**Example�1.1.�Setting the `db_url` parameter**

modparam("tcp\_mgm", "db\_url", "mysql://opensips:opensipsrw@localhost/opensips")

  

### 1.3.2.�`db_table (string)`

The name of the table holding the TCP paths (rules).

Default value is _"tcp\_mgm"_.

**Example�1.2.�Setting the `db_table` parameter**

modparam("tcp\_mgm", "db\_table", "tcp\_mgm")

  

### 1.3.3.�`[column-name]_col (string)`

Use a different name for column _"column-name"_.

**Example�1.3.�Setting the `[column-name]_col` parameter**

modparam("tcp\_mgm", "connect\_timeout\_col", "connect\_to")