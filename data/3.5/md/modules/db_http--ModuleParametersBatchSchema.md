## 1.3.�Exported Parameters

### 1.3.1.�`SSL`(int)

Whether or not to use SSL.

If value is 1 the module will use https otherwise it will use http.

_Default value is “ 0 ”._

**Example�1.2.�Set `SSL` parameter**

...
modparam("db\_http", "SSL",1)
...

  

### 1.3.2.�`cap_raw_query`(int)

Whether or not the server supports raw queries.

_Default value is “0”._

**Example�1.3.�Set `cap_raw_query` parameter**

...
modparam("db\_http", "cap\_raw\_query", 1)
...

  

### 1.3.3.�`cap_replace`(int)

Whether or not the server supports replace capabilities.

_Default value is “0”._

**Example�1.4.�Set `cap_replace` parameter**

...
modparam("db\_http", "cap\_replace", 1)
...

  

### 1.3.4.�`cap_insert_update`(int)

Whether or not the server supports insert\_update capabilities.

_Default value is “0”._

**Example�1.5.�Set `cap_insert_update` parameter**

...
modparam("db\_http", "cap\_insert\_update", 1)
...

  

### 1.3.5.�`cap_last_inserted_id`(int)

Whether or not the server supports last\_inserted\_id capabilities.

_Default value is “0”._

**Example�1.6.�Set `cap_last_inserted_id` parameter**

...
modparam("db\_http", "cap\_last\_inserted\_id", 1)
...

  

### 1.3.6.�`field_delimiter` (str)

Character to be used to delimit fields in the reply.Only one char may be set.

_Default value is “;”_

**Example�1.7.�Set `field_delimiter` parameter**

...
modparam("db\_http", "field\_delimiter",";")
...

  

### 1.3.7.�`row_delimiter` (str)

Character to be used to delimit rows in the reply.Only one char may be set.

_Default value is “\\n”_

**Example�1.8.�Set `row_delimiter` parameter**

...
modparam("db\_http", "row\_delimiter","\\n")
...

  

### 1.3.8.�`quote_delimiter` (str)

Character to be used to quote fields that require quoting in the reply.Only one char may be set.

_Default value is “|”_

**Example�1.9.�Set `quote_delimiter` parameter**

...
modparam("db\_http", "quote\_delimiter","|")
...

  

### 1.3.9.�`value_delimiter` (str)

The delimiter used to separate multiple fields of a single variable (see [Section�1.5.2, “Variables”](#http-variables "1.5.2.�Variables")). Only one char may be set.

_Default value is “,”_

**Example�1.10.�Set `value_delimiter` parameter**

...
modparam("db\_http", "value\_delimiter",";")
...

  

### 1.3.10.�`timeout` (int)

The maximum number of milliseconds that the HTTP ops are allowed to last

_Default value is “30000 ( 30 seconds )”_

**Example�1.11.�Set `timeout` parameter**

...
modparam("db\_http", "timeout",5000)
...

  

### 1.3.11.�`disable_expect` (int)

Disables automatic 'Expect: 100-continue' behavior in libcurl for requests over 1024 bytes in size. This can help reduce latency by saving a network round-trip for large records. For more information on this behavior please seee rfc2616 section 8.2.3.

_Default value is “0 (off)”_

**Example�1.12.�Set `disable_expect` parameter**

...
modparam("db\_http", "disable\_expect",1)
...