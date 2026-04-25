## 1.3.�Exported Parameters

### 1.3.1.�`db_url` (string)

This is URL of the database to be used.

Default value is “mysql://opensipsro:opensipsro@localhost/opensips”

**Example�1.1.�Setting db\_url parameter**

modparam("domain", "db\_url", "mysql://ser:pass@db\_host/ser")

  

### 1.3.2.�`db_mode` (integer)

Database mode: 0 means non-caching, 1 means caching.

Default value is 0 (non-caching).

**Example�1.2.�db\_mode example**

modparam("domain", "db\_mode", 1)   # Use caching

  

### 1.3.3.�`domain_table` (string)

Name of table containing names of local domains that the proxy is responsible for. Local users must have in their sip uri a host part that is equal to one of these domains.

Default value is “domain”.

**Example�1.3.�Setting domain\_table parameter**

modparam("domain", "domain\_table", "new\_name")

  

### 1.3.4.�`domain_col` (string)

Name of column containing domains in domain table.

Default value is “domain”.

**Example�1.4.�Setting domain\_col parameter**

modparam("domain", "domain\_col", "domain\_name")

  

### 1.3.5.�`attrs_col` (string)

Name of column containing attributes in domain table.

Default value is “attrs”.

**Example�1.5.�Setting attrs\_col parameter**

modparam("domain", "attrs\_col", "attributes")