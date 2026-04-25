## 1.5.�Exported Parameters

### 1.5.1.�`db_url` (string)

The database URL where the sockets are fetched from.

_Default value is “mysql://opensips:opensipsrw@localhost/opensips”._

**Example�1.1.�Set “db\_url” parameter**

...
modparam("sockets\_mgm", "db\_url", "dbdriver://username:password@dbhost/dbname")
...

  

### 1.5.2.�`table_name` (string)

The database table name where the sockets are stored.

_Default value is “sockets”._

**Example�1.2.�Set “table\_name” parameter**

...
modparam("sockets\_mgm", "table\_name", "sockets\_def")
...

  

### 1.5.3.�`socket_column` (string)

The database table column where the socket definition is stored.

_Default value is “socket”._

**Example�1.3.�Set “socket\_column” parameter**

...
modparam("sockets\_mgm", "socket\_column", "sock")
...

  

### 1.5.4.�`advertised_column` (string)

The database table column where the advertised definition is stored.

_Default value is “advertised”._

**Example�1.4.�Set “advertised\_column” parameter**

...
modparam("sockets\_mgm", "advertised\_column", "adv")
...

  

### 1.5.5.�`tag_column` (string)

The database table column where the tag definition is stored.

_Default value is “tag”._

**Example�1.5.�Set “tag\_column” parameter**

...
modparam("sockets\_mgm", "tag\_column", "sock")
...

  

### 1.5.6.�`flags_column` (string)

The database table column where the flags definition is stored.

_Default value is “flags”._

**Example�1.6.�Set “flags\_column” parameter**

...
modparam("sockets\_mgm", "flags\_column", "sock")
...

  

### 1.5.7.�`tos_column` (string)

The database table column where the tos definition is stored.

_Default value is “tos”._

**Example�1.7.�Set “tos\_column” parameter**

...
modparam("sockets\_mgm", "tos\_column", "sock")
...

  

### 1.5.8.�`processes` (integer)

The number of processes designated to handle UDP sockets.

_Default value is “8”._

**Example�1.8.�Set “processes” parameter**

...
modparam("sockets\_mgm", "processes", 32)
...

  

### 1.5.9.�`max_sockets` (integer)

The maximum number of sockets that can be defined dynamically. See the [Limitations](#limitations "1.3.�Limitations") section for more information.

_Default value is “100”._

**Example�1.9.�Set “max\_sockets” parameter**

...
modparam("sockets\_mgm", "max\_sockets", 2000)
...