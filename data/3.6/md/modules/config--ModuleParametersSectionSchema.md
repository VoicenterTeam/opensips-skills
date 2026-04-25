## 1.3.�Exported Parameters

### 1.3.1.�`db_url` (string)

Database URL used to load the initial configuration values, and flush them at runtime using the [config\_flush](#mi_config_flush "1.5.5.�config_flush") MI command.

_Default value is “mysql://opensips:opensipsrw@localhost/opensips”._

**Example�1.1.�Set “db\_url” parameter**

...
modparam("config", "db\_url", "dbdriver://username:password@dbhost/dbname")
...

  

### 1.3.2.�`table_name` (string)

Name of the table where configuration entries are stored.

_Default value is “config”._

**Example�1.2.�Set “table\_name” parameter**

...
modparam("config", "table\_name", "configuration")
...

  

### 1.3.3.�`name_column` (string)

Name of the column storing configuration variable names.

_Default value is “name”._

**Example�1.3.�Set “name\_column” parameter**

...
modparam("config", "name\_column", "key")
...

  

### 1.3.4.�`value_column` (string)

Name of the column storing configuration variable values.

_Default value is “value”._

**Example�1.4.�Set “value\_column” parameter**

...
modparam("config", "value\_column", "val")
...

  

### 1.3.5.�`description_column` (string)

Name of the column storing variable descriptions.

_Default value is “description”._

**Example�1.5.�Set “desctiption\_column” parameter**

...
modparam("config", "description\_column", "desc")
...

  

### 1.3.6.�`enable_restart_persistency` (integer)

Enables restart persistency. Check the [Restart Persistent Memory](#restart_persistent_memory "1.1.1.�Restart Persistent Memory") for more information.

_Default value is “0 / disabled”._

**Example�1.6.�Set “restart\_persistent\_memory” parameter**

...
modparam("config", "restart\_persistent\_memory", yes)
...

  

### 1.3.7.�`hash_size` (integer)

Size of the internal hash table used to store config variables. Must be a power of 2 number, otherwise its value will be rounded to the closest value of 2 smaller than the provided value.

_Default value is “16”._

**Example�1.7.�Set “hash\_size” parameter**

...
modparam("config", "hash\_size", 32)
...