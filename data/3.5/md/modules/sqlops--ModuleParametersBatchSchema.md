## 1.3.�Exported Parameters

### 1.3.1.�`db_url` (string)

DB URL for database connection. As the module allows the usage of multiple DBs (DB URLs), the actual DB URL may be preceded by an reference number. This reference number is to be passed to AVPOPS function that what to explicitly use this DB connection. If no reference number is given, 0 is assumed - this is the default DB URL.

_This parameter is optional, it's default value being NULL._

**Example�1.1.�Set `db_url` parameter**

...
# default URL
modparam("sqlops","db\_url","mysql://user:passwd@host/database")
# an additional DB URL
modparam("sqlops","db\_url","1 postgres://user:passwd@host2/opensips")
...
				

  

### 1.3.2.�`usr_table` (string)

DB table to be used for user preferences (AVPs)

_This parameter is optional, it's default value being “usr\_preferences”._

**Example�1.2.�Set `usr_table` parameter**

...
modparam("sqlops","usr\_table","avptable")
...
				

  

### 1.3.3.�`db_scheme` (string)

Definition of a DB scheme to be used for accessing a non-standard User Preference -like table.

Definition of a DB scheme. Scheme syntax is:

*   _db\_scheme = name':'element\[';'element\]\*_
    
*   _element_ =
    
    *   'uuid\_col='string
        
    *   'username\_col='string
        
    *   'domain\_col='string
        
    *   'value\_col='string
        
    *   'value\_type='('integer'|'string')
        
    *   'table='string
        
    

_Default value is “NULL”._

**Example�1.3.�Set `db_scheme` parameter**

...
modparam("sqlops","db\_scheme",
"scheme1:table=subscriber;uuid\_col=uuid;value\_col=first\_name")
...
				

  

### 1.3.4.�`use_domain` (integer)

If the domain part of the a SIP URI should be used for identifying an AVP in DB operations.

_Default value is 0 (no)._

**Example�1.4.�Set `use_domain` parameter**

...
modparam("sqlops","use\_domain",1)
...
				

  

### 1.3.5.�`ps_id_max_buf_len` (integer)

The maximum size of the buffer used to build the query IDs which are used for managing the Prepare Statements when comes to the "sql\_select|update|insert|replace|delete()" functions

If the size is exceeded (when trying to build the PS query ID), the PS support will be dropped for the query. If set to 0, the PS support will be completly disabled.

_Default value is 1024._

**Example�1.5.�Set `ps_id_max_buf_len` parameter**

...
modparam("sqlops","ps\_id\_max\_buf\_len", 2048)
...
				

  

### 1.3.6.�`bigint_to_str` (int)

Controls bigint conversion. By default bigint values are returned as int. If the value stored in bigint is out of the int range, by enabling bigint to string conversion, the bigint value will be returned as string.

_Default value is “0”._

**Example�1.6.�Set `bigint_to_str` parameter**

...
# Return bigint as string
modparam("sqlops","bigint\_to\_str",1)
...
				

  

### 1.3.7.�`uuid_column` (string)

Name of column containing the uuid (unique user id).

_Default value is “uuid”._

**Example�1.7.�Set `uuid_column` parameter**

...
modparam("sqlops","uuid\_column","uuid")
...
				

  

### 1.3.8.�`username_column` (string)

Name of column containing the username.

_Default value is “username”._

**Example�1.8.�Set `username_column` parameter**

...
modparam("sqlops","username\_column","username")
...
				

  

### 1.3.9.�`domain_column` (string)

Name of column containing the domain name.

_Default value is “domain”._

**Example�1.9.�Set `domain_column` parameter**

...
modparam("sqlops","domain\_column","domain")
...
				

  

### 1.3.10.�`attribute_column` (string)

Name of column containing the attribute name (AVP name).

_Default value is “attribute”._

**Example�1.10.�Set `attribute_column` parameter**

...
modparam("sqlops","attribute\_column","attribute")
...
				

  

### 1.3.11.�`value_column` (string)

Name of column containing the AVP value.

_Default value is “value”._

**Example�1.11.�Set `value_column` parameter**

...
modparam("sqlops","value\_column","value")
...
				

  

### 1.3.12.�`type_column` (string)

Name of column containing the AVP type.

_Default value is “type”._

**Example�1.12.�Set `type_column` parameter**

...
modparam("sqlops","type\_column","type")
...