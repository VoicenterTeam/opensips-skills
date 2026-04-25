## 1.3.�Exported Parameters

### 1.3.1.�`vendors_db_url` (str)

The DB URL for querying the Vendors used by the module

_Default value is “NULL”._

**Example�1.1.�Setting the `vendors_db_url` parameter**

...
modparam("rate\_cacher", "vendors\_db\_url", "mysql://opensips:opensipsrw@localhost/opensips")
...

  

### 1.3.2.�`vendors_db_table` (str)

The DB Table for querying the Vendors used by the module

_Default value is “rc\_vendors”._

**Example�1.2.�Setting the `vendors_db_table` parameter**

...
modparam("rate\_cacher", "vendors\_db\_table", "my\_vendors\_view")
...

  

### 1.3.3.�`vendors_hash_size` (int)

The size of the hash table internally used to keep the vendors. A larger table is much faster but consumes more memory. The hash size must be a power of 2 number.

_Default value is “256”._

**Example�1.3.�Setting the `vendors_hash_size` parameter**

...
modparam("rate\_cacher", "vendors\_hash\_size", 1024)
...

  

### 1.3.4.�`clients_db_url` (str)

The DB URL for querying the Clients used by the module

_Default value is “NULL”._

**Example�1.4.�Setting the `clients_db_url` parameter**

...
modparam("rate\_cacher", "clients\_db\_url", "mysql://opensips:opensipsrw@localhost/opensips")
...

  

### 1.3.5.�`clients_db_table` (str)

The DB Table for querying the Clients used by the module

_Default value is “rc\_clients”._

**Example�1.5.�Setting the `clients_db_table` parameter**

...
modparam("rate\_cacher", "clients\_db\_table", "my\_clients\_view")
...

  

### 1.3.6.�`clients_hash_size` (int)

The size of the hash table internally used to keep the clients. A larger table is much faster but consumes more memory. The hash size must be a power of 2 number.

_Default value is “256”._

**Example�1.6.�Setting the `vendors_hash_size` parameter**

...
modparam("rate\_cacher", "clients\_hash\_size", 1024)
...

  

### 1.3.7.�`rates_db_url` (str)

The DB URL for querying the Ratesheets used by the module

_Default value is “NULL”._

**Example�1.7.�Setting the `rates_db_url` parameter**

...
modparam("rate\_cacher", "rates\_db\_url", "mysql://opensips:opensipsrw@localhost/opensips")
...

  

### 1.3.8.�`rates_db_table` (str)

The DB Table for querying the Ratesheets used by the module

_Default value is “rc\_ratesheets”._

**Example�1.8.�Setting the `rates_db_table` parameter**

...
modparam("rate\_cacher", "rates\_db\_table", "my\_clients\_view")
...