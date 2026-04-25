## 1.4.�Exported Parameters

### 1.4.1.�`db_url` (string)

DB URL for database connection. As the module allows the usage of multiple DBs (DB URLs), the actual DB URL may be preceded by an reference number. This reference number is to be passed to AVPOPS function that what to explicitly use this DB connection. If no reference number is given, 0 is assumed - this is the default DB URL.

_This parameter is optional, it's default value being NULL._

**Example�1.2.�Set `avp_url` parameter**

...
# default URL
modparam("avpops","db\_url","mysql://user:passwd@host/database")
# an additional DB URL
modparam("avpops","db\_url","1 postgres://user:passwd@host2/opensips")
...
				

  

### 1.4.2.�`avp_table` (string)

DB table to be used.

_This parameter is optional, it's default value being NULL._

**Example�1.3.�Set `avp_table` parameter**

...
modparam("avpops","avp\_table","avptable")
...
				

  

### 1.4.3.�`use_domain` (integer)

If the domain part of the an URI should be used for identifying an AVP in DB operations.

_Default value is 0 (no)._

**Example�1.4.�Set `use_domain` parameter**

...
modparam("avpops","use\_domain",1)
...
				

  

### 1.4.4.�`uuid_column` (string)

Name of column containing the uuid (unique user id).

_Default value is “uuid”._

**Example�1.5.�Set `uuid_column` parameter**

...
modparam("avpops","uuid\_column","uuid")
...
				

  

### 1.4.5.�`username_column` (string)

Name of column containing the username.

_Default value is “username”._

**Example�1.6.�Set `username_column` parameter**

...
modparam("avpops","username\_column","username")
...
				

  

### 1.4.6.�`domain_column` (string)

Name of column containing the domain name.

_Default value is “domain”._

**Example�1.7.�Set `domain_column` parameter**

...
modparam("avpops","domain\_column","domain")
...
				

  

### 1.4.7.�`attribute_column` (string)

Name of column containing the attribute name (AVP name).

_Default value is “attribute”._

**Example�1.8.�Set `attribute_column` parameter**

...
modparam("avpops","attribute\_column","attribute")
...
				

  

### 1.4.8.�`value_column` (string)

Name of column containing the AVP value.

_Default value is “value”._

**Example�1.9.�Set `value_column` parameter**

...
modparam("avpops","value\_column","value")
...
				

  

### 1.4.9.�`type_column` (string)

Name of column containing the AVP type.

_Default value is “type”._

**Example�1.10.�Set `type_column` parameter**

...
modparam("avpops","type\_column","type")
...
				

  

### 1.4.10.�`db_scheme` (string)

Definition of a DB scheme to be used for non-standard access to Database information.

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

**Example�1.11.�Set `db_scheme` parameter**

...
modparam("avpops","db\_scheme",
"scheme1:table=subscriber;uuid\_col=uuid;value\_col=first\_name")
...