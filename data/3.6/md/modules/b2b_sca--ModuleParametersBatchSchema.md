## 1.4.�Exported Parameters

### 1.4.1.�`hash_size`(integer)

The size of the hash table internally used to keep the shared calls. A larger table means faster acces at the expense of memory. The hash size is a power of number two.

_The default value is "10"._

**Example�1.1.�Set `hash_size` parameter**

...
modparam("b2b\_sca", "hash\_size", "5")
...

  

### 1.4.2.�`presence_server`(string)

The address of the presence server, where the PUBLISH messages should be sent (not compulsory). If not set, the PUBLISH requests will be routed based on watcher's URI.

_The default value is "NULL"._

**Example�1.2.�Set `presence_server` parameter**

...
modparam("b2b\_sca", "presence\_server", "sip:opensips.org")
...

  

### 1.4.3.�`watchers_avp_spec`(string)

AVP that will hold one or more watcher URI(s). If not set, no PUBLISH requests will be sent out. The watchers\_avp\_spec MUST be set before calling sca\_init\_request();

_The default value is "NULL"._

**Example�1.3.�Set `watchers_avp_spec` parameter**

...
modparam("b2b\_sca", "watchers\_avp\_spec", "$avp(watchers\_avp\_spec)")
...
route {
	...
	$avp(watchers\_avp\_spec) = "sip:first\_watcher@opensip.org";
	$avp(watchers\_avp\_spec) = "sip:second\_watcher@opensip.org";
	...
}

  

### 1.4.4.�`shared_line_spec_param`(string)

Mandatory parameter. Opaque string identifing the shared line/call. The shared\_line\_spec\_param MUST be set before calling sca\_init\_request();

_The default value is "NULL"._

**Example�1.4.�Set `shared_line_spec_param` parameter**

...
modparam("b2b\_sca", "shared\_line\_spec\_param", "$var(shared\_line)")
...

  

### 1.4.5.�`appearance_name_addr_spec_param`(string)

Mandatory parameter. It must be a valid SIP URI. It will populate the _appearance-uri_ SIP parameter inside the _Call-Info_ SIP header. The appearance\_name\_addr\_spec\_param MUST be set before calling sca\_init\_request();

_The default value is "NULL"._

**Example�1.5.�Set `appearance_name_addr_spec_param` parameter**

...
modparam("b2b\_sca", "appearance\_name\_addr\_spec\_param", "")
...

  

### 1.4.6.�`db_url`(string)

This is URL of the database to be used.

_The default value is "NULL"._

**Example�1.6.�Set `db_url` parameter**

...
modparam("b2b\_sca", "db\_url", "\[dbdriver\]://\[\[username\]:\[password\]\]@\[dbhost\]/\[dbname\]")
...

  

### 1.4.7.�`db_mode`(integer)

The b2b\_sca module can utilize database for persistent call appearance storage. Using a database ensure that active call appearances will survive machine restarts or SW crashes. The following databse accessing modes are available for b2b\_sca module:

*   NO DB STORAGE - set this parameter to 0
*   WRITE THROUGH (synchronous write in database) - set this parameter to 1

_The default value is 0 (NO DB STORAGE)._

**Example�1.7.�Set `db_mode` parameter**

...
modparam("b2b\_sca", "db\_mode", 1)
...

  

### 1.4.8.�`table_name`(string)

Identifies the table name from the defined database.

_The default value is "b2b\_sca"._

**Example�1.8.�Set `table_name` parameter**

...
modparam("b2b\_sca", "table\_name", "sla")
...

  

### 1.4.9.�`shared_line_column`(string)

The column's name in the database storing the shared call/line id. See "shared\_line\_spec\_param" parameter.

_The default value is "shared\_line"._

**Example�1.9.�Set `shared_line_column` parameter**

...
modparam("b2b\_sca", "shared\_line\_column", "")
...

  

### 1.4.10.�`watchers_column`(string)

The column's name in the database storing the list of watchers. See "watchers\_avp\_spec" parameter.

_The default value is "watchers"._

**Example�1.10.�Set `watchers_column` parameter**

...
modparam("b2b\_sca", "watchers\_column", "")
...

  

### 1.4.11.�`app[index]_shared_entity_column`(string)

The column's name in the database storing the shared entity of a particular appearance. See "sca\_init\_request" for more info.

_The default value is "app\[index\]\_shared\_entity"._ Index is an integer between 1 and 10.

**Example�1.11.�Set `app[index]_shared_entity_column` parameter**

...
modparam("b2b\_sca", "app1\_shared\_entity\_column", "first\_shared\_entity")
modparam("b2b\_sca", "app2\_shared\_entity\_column", "second\_shared\_entity")
...

  

### 1.4.12.�`app[index]_call_state_column`(string)

The column's name in the database storing the call state of a particular appearance. The following states are stored:

*   1 - alerting,
*   2 - active,
*   3 - held,
*   4 - held-private.

_The default value is "app\[index\]\_call\_state"._ Index is an integer between 1 and 10.

**Example�1.12.�Set `app[index]_call_state_column` parameter**

...
modparam("b2b\_sca", "app1\_call\_state\_column", "first\_call\_state")
modparam("b2b\_sca", "app2\_call\_state\_column", "second\_call\_state")
...

  

### 1.4.13.�`app[index]_call_info_uri_column`(string)

The column's name in the database storing the call info URI of a particular appearance.

_The default value is "app\[index\]\_call\_info\_uri"._ Index is an integer between 1 and 10.

**Example�1.13.�Set `app[index]_call_info_uri_column` parameter**

...
modparam("b2b\_sca", "app1\_call\_info\_uri\_column", "first\_call\_info\_uri")
modparam("b2b\_sca", "app2\_call\_info\_uri\_column", "second\_call\_info\_uri")
...

  

### 1.4.14.�`app[index]_call_info_appearance_uri_column`(string)

The column's name in the database storing the call info appearance URI of a particular appearance. For each appearance, the value is extracted from the "appearance\_name\_addr\_spec\_param" parameter.

_The default value is "app\[index\]\_call\_info\_appearance\_uri"._ Index is an integer between 1 and 10.

**Example�1.14.�Set `app[index]_call_info_appearance_uri_column` parameter**

...
modparam("b2b\_sca", "app1\_call\_info\_appearance\_uri\_column", "first\_call\_info\_appearance\_uri")
modparam("b2b\_sca", "app2\_call\_info\_appearance\_uri\_column", "second\_call\_info\_appearance\_uri")
...

  

### 1.4.15.�`appindex_b2bl_key_column`(string)

The column's name in the database storing the b2b\_logic key of a particular appearance.

_The default value is "app\[index\]\_b2bl\_key"._ Index is an integer between 1 and 10.

**Example�1.15.�Set `app[index]_b2bl_key_column` parameter**

...
modparam("b2b\_sca", "app1\_b2bl\_key\_column", "first\_b2bl\_key")
modparam("b2b\_sca", "app2\_b2bl\_key\_column", "second\_b2bl\_key")
...