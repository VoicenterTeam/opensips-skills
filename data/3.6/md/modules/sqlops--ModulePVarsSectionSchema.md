# SQLops Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5927376)

2.2. [Most recently active contributors(1) to this module](#idp6032032)

**List of Examples**

1.1. [Set `db_url` parameter](#idp4194656)

1.2. [Set `usr_table` parameter](#idp3410384)

1.3. [Set `db_scheme` parameter](#idp183392)

1.4. [Set `use_domain` parameter](#idp188416)

1.5. [Set `ps_id_max_buf_len` parameter](#idp5572160)

1.6. [Set `bigint_to_str` parameter](#idp5577232)

1.7. [Set `uuid_column` parameter](#idp5582128)

1.8. [Set `username_column` parameter](#idp5586944)

1.9. [Set `domain_column` parameter](#idp5591840)

1.10. [Set `attribute_column` parameter](#idp5596816)

1.11. [Set `value_column` parameter](#idp5601712)

1.12. [Set `type_column` parameter](#idp5606528)

1.13. [`sql_query` usage](#idp5620480)

1.14. [`sql_query_one` usage](#idp5642672)

1.15. [`sql_select` usage](#idp5662608)

1.16. [`sql_select_one` usage](#idp5672464)

1.17. [`sql_update` usage](#idp5685856)

1.18. [`sql_insert` usage](#idp5696688)

1.19. [`sql_delete` usage](#idp5708464)

1.20. [`sql_avp_load` usage](#idp5726736)

1.21. [`sql_avp_store` usage](#idp5733104)

1.22. [`sql_avp_delete` usage](#idp5739232)

1.23. [`async sql_query` usage](#idp5745696)

1.24. [`async sql_query_one` usage](#idp5751584)

## Chapter�1.�Admin Guide

## 1.1.�Overview

SQLops (SQL-operations) modules implements a set of script functions for generic SQL standard queries (raw or structure queries). It also provides a dedicated set of functions for DB manipulation (loading/storing/removing) of user AVPs (preferences).

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _a database module_
    

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _None_
    

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
				

  

## 1.4.�Exported Functions

### 1.4.1.� `sql_query(query, [res_col_avps], [db_id])`

Make a database query and store the result in AVPs.

The meaning and usage of the parameters:

*   _query (string)_ - must be a valid SQL query. The parameter can contain pseudo-variables.
    
    You must escape any pseudo-variables manually to prevent SQL injection attacks. You can use the existing transformations _escape.common_ and _unescape.common_ to escape and unescape the content of any pseudo-variable. Failing to escape the variables used in the query makes you vulnerable to SQL injection, e.g. make it possible for an outside attacker to alter your database content. The function returns true if the query was successful, -2 in case the query returned an empty result set, and -1 for all other types of errors.
    
*   _res\_col\_avps (string, optional, no expand)_ - a list with AVP names where to store the result. The format is “$avp(name1);$avp(name2);...”. If this parameter is omitted, the result is stored in “$avp(1);$avp(2);...”. If the result consists of multiple rows, then multiple AVPs with corresponding names will be added. The value type of the AVP (string or integer) will be derived from the type of the columns. If the value in the database is _NULL_, the returned avp will be a string with the _<null>_ value.
    
*   _db\_id (int, optional)_ - reference to a defined DB URL (a numerical id) - see the “db\_url” module parameter. It can be either a constant, or a string/int variable.
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE, LOCAL\_ROUTE and ONREPLY\_ROUTE.

**Example�1.13.�`sql_query` usage**

...
sql\_query("SELECT password, ha1 FROM subscriber WHERE username='$tu'",
	"$avp(pass);$avp(hash)");
sql\_query("DELETE FROM subscriber");
sql\_query("DELETE FROM subscriber", , 2);

$avp(id) = 2;
sql\_query("DELETE FROM subscriber", , $avp(id));
...
				

  

### 1.4.2.� `sql_query_one(query, [res_col_vars], [db_id])`

Similar to [sql\_query()](#func_sql_query "1.4.1.� sql_query(query, [res_col_avps], [db_id])"), it makes a generic raw database query and returns the results, but with the following differences:

*   _returns only one row_ - even if the query results in a multi row result, only the first row will be returned to script.
    
*   _return variables are not limited to AVPs_ - the variables for returning the query result may any kind of variable, of course, as time as it is writeable. NOTE that the number of return vairable MUST match (as number) the number of returned columns. If less variables are provided, the query will fail.
    
*   _NULL is returned_ - any a DB NULL value resulting from the query will be pushed as NULL indicator (and NOT as _<null>_ string) to the script variables.
    

This function can be used from any type of route.

**Example�1.14.�`sql_query_one` usage**

...
sql\_query\_one("SELECT password, ha1 FROM subscriber WHERE username='$tU'",
	"$var(pass);$var(hash)");
# $var(pass) or $var(hash) may be NULL if the corresponding columns
# are not populated
...
sql\_query\_one("SELECT value, type FROM usr\_preferences WHERE username='$fU' and attribute='cfna'",
	"$var(cf\_uri);$var(type)");
# the above query will return only one row, even if there are multiple \`cfna\`
# attributes for the user
...
				

  

### 1.4.3.� `sql_select([columns],table,[filter],[order],[res_col_avps], [db_id])`

Function to perform a structured (not raw) SQL SELECT operation. The query is performed via OpenSIPS internal SQL interface, taking advantages of the prepared-statements support (if the db backend provides something like that). The selected columns are returned into a set of AVPs (one to one matching the selected columns).

### Warning

If using varibales in constructing the query, you must manually escape their values in order to prevent SQL injection attacks. You can use the existing transformations _escape.common_ and _unescape.common_ to escape and unescape the content of any pseudo-variable. Failing to escape the variables used in the query makes you vulnerable to SQL injection, e.g. make it possible for an outside attacker to alter your database content.

The function returns true if the query was successful, -2 in case the query returned an empty result set, and -1 for all other types of errors.

The meaning and usage of the parameters:

*   _columns (string,optional)_ - JSON formated string holding an array of columns to be returned by the select. Ex: “\["col1","col2"\]”. If missing, a “\*” (all columns) select will be performed.
    
*   _table (string, mandatory)_ - the name of the table to be queried.
    
*   _filter (string, optional)_ - JSON formated string holding the "where" filter of the query. This must be an array of (column, operator,value) pairs. The exact JSON syntax of such a pair is “{"column":{"operator":"value"}}”.; operators may be \`>\`, \`<\`, \`=\`, \`!=\` or custom string; The values may be string, integer or \`null\`. To simplify the usage with the \`=\` operator, you can use “{"column":"value"}” If missing, all rows will be selected.
    
*   _order (string, optional)_ - the name of the column to oder by (only ascending).
    
*   _res\_col\_avps (string, optional, no expand)_ - a list with AVP names where to store the result. The format is “$avp(name1);$avp(name2);...”. If this parameter is omitted, the result is stored in “$avp(1);$avp(2);...”. If the result consists of multiple rows, then multiple AVPs with corresponding names will be added. The value type of the AVP (string or integer) will be derived from the type of the columns. If the value in the database is _NULL_, the returned avp will be a string with the _<null>_ value.
    
*   _db\_id (int, optional)_ - reference to a defined DB URL (a numerical id) - see the [db\_url](#param_db_url "1.3.1.�db_url (string)") module parameter. It can be either a constant, or a string/int variable.
    

This function can be used from any type of route.

**Example�1.15.�`sql_select` usage**

...
sql\_select('\["password","ha1"\]', 'subscriber',
	'\[ {"username": "$tu"}, {"domain": {"!=", null}}\]', ,
	'$avp(pass);$avp(hash)');
...
				

  

### 1.4.4.� `sql_select_one([columns],table,[filter],[order],[res_col_vars], [db_id])`

Similar to [sql\_select()](#func_sql_select "1.4.3.� sql_select([columns],table,[filter],[order],[res_col_avps], [db_id])"), it makes a SELECT SQL query and returns the results, but with the following differences:

*   _returns only one row_ - even if the query results in a multi row result, only the first row will be returned to script.
    
*   _return variables are not limited to AVPs_ - the variables for returning the query result may any kind of variable, of course, as time as it is writeable. NOTE that the number of return vairable MUST match (as number) the number of returned columns. If less variables are provided, the query will fail.
    
*   _NULL is returned_ - any a DB NULL value resulting from the query will be pushed as NULL indicator (and NOT as _<null>_ string) to the script variables.
    

This function can be used from any type of route.

**Example�1.16.�`sql_select_one` usage**

...
sql\_select\_one('\["value","type"\]', 'usr\_preferences',
	'\[ {"username": "$tu"}, {"attribute": "cfna"}\]', ,
	'$var(cf\_uri);$var(type)');
# the above query will return only one row, even if there are multiple \`cfna\`
# attributes for the user
...
				

  

### 1.4.5.� `sql_update(columns,table,[filter],[db_id])`

Function to perform a structured (not raw) SQL UPDATE operation. IMPORTANT: please see all the general notes from the [sql\_select()](#func_sql_select "1.4.3.� sql_select([columns],table,[filter],[order],[res_col_avps], [db_id])") function.

The function returns true if the query was successful.

The meaning and usage of the parameters:

*   _columns (string,mandatory)_ - JSON formated string holding an array of (column,value) pairs to be updated by the query. Ex: “\[{"col1":"val1"},{"col2":"val1"}\]”.
    
*   _table (string, mandatory)_ - the name of the table to be queried.
    
*   _filter (string, optional)_ - JSON formated string holding the "where" filter of the query. This must be an array of (column, operator,value) pairs. The exact JSON syntax of such a pair is “{"column":{"operator":"value"}}”.; operators may be \`>\`, \`<\`, \`=\`, \`!=\` or custom string; The values may be string, integer or \`null\`. To simplify the usage with the \`=\` operator, you can use “{"column":"value"}” If missing, all rows will be updated.
    
*   _db\_id (int, optional)_ - reference to a defined DB URL (a numerical id) - see the [db\_url](#param_db_url "1.3.1.�db_url (string)") module parameter. It can be either a constant, or a string/int variable.
    

This function can be used from any type of route.

**Example�1.17.�`sql_update` usage**

...
sql\_update( '\[{"password":"my\_secret"}\]', 'subscriber',
	'\[{"username": "$tu"}\]');
...
				

  

### 1.4.6.� `sql_insert(table,columns,[db_id])`

Function to perform a structured (not raw) SQL INSERT operation. IMPORTANT: please see all the general notes from the [sql\_select()](#func_sql_select "1.4.3.� sql_select([columns],table,[filter],[order],[res_col_avps], [db_id])") function.

The function returns true if the query was successful.

The meaning and usage of the parameters:

*   _table (string, mandatory)_ - the name of the table to be queried.
    
*   _columns (string,mandatory)_ - JSON formated string holding an array of (column,value) pairs to be inserted. Ex: “\[{"col1":"val1"},{"col2":"val1"}\]”.
    
*   _db\_id (int, optional)_ - reference to a defined DB URL (a numerical id) - see the [db\_url](#param_db_url "1.3.1.�db_url (string)") module parameter. It can be either a constant, or a string/int variable.
    

This function can be used from any type of route.

**Example�1.18.�`sql_insert` usage**

...
sql\_insert( 'cc\_agents', '\[{"agentid":"agentX"},{"skills":"info"},{"location":null},{"msrp\_location":"sip:agentX@opensips.com"},{"msrp\_max\_sessions":2}\]' );
...
				

  

### 1.4.7.� `sql_delete(table,[filter],[db_id])`

Function to perform a structured (not raw) SQL DELETE operation. IMPORTANT: please see all the general notes from the [sql\_select()](#func_sql_select "1.4.3.� sql_select([columns],table,[filter],[order],[res_col_avps], [db_id])") function.

The function returns true if the query was successful.

The meaning and usage of the parameters:

*   _table (string, mandatory)_ - the name of the table to delete from.
    
*   _filter (string, optional)_ - JSON formated string holding the "where" filter of the query. This must be an array of (column, operator,value) pairs. The exact JSON syntax of such a pair is “{"column":{"operator":"value"}}”.; operators may be \`>\`, \`<\`, \`=\`, \`!=\` or custom string; The values may be string, integer or \`null\`. To simplify the usage with the \`=\` operator, you can use “{"column":"value"}” If missing, all rows will be updated.
    
*   _db\_id (int, optional)_ - reference to a defined DB URL (a numerical id) - see the [db\_url](#param_db_url "1.3.1.�db_url (string)") module parameter. It can be either a constant, or a string/int variable.
    

This function can be used from any type of route.

**Example�1.19.�`sql_delete` usage**

...
sql\_delete( 'subscriber', '\[{"username": "$tu"}\]');
...
				

  

### 1.4.8.� `sql_replace(table,columns,[db_id])`

Function very similar to [sql\_insert()](#func_sql_insert "1.4.6.� sql_insert(table,columns,[db_id])") function, but performing an SQL REPLACE operation instead. Note that not all SQL backend in OpenSIPS may support a REPLACE operation.

The function returns true if the query was successful.

### 1.4.9.� `sql_avp_load(source, name, [db_id], [prefix]])`

Loads from DB into memory the AVPs corresponding to the given _source_. If given, it sets the script flags for loaded AVPs. It returns true if it loaded some values in AVPs, false otherwise (db error, no avp loaded ...).

AVPs may be preceded by an optional _prefix_, in order to avoid some conflicts.

Meaning of the parameters is as follows:

*   _source (string, no expand)_ - what info is used for identifying the AVPs. Parameter syntax:
    
    *   _source = (pvar|str\_value) \['/'('username'|'domain'|'uri'|'uuid')\])_
        
    *   _pvar = any pseudo variable defined in OpenSIPS. If the pvar is $ru (request uri), $fu (from uri), $tu (to uri) or $ou (original uri), then the implicit flag is 'uri'. Otherwise, the implicit flag is 'uuid'._
        
    
*   _name (string, no expand)_ - which AVPs will be loaded from DB into memory. Parameter syntax is:
    
    *   _name = avp\_spec\['/'(table\_name|'$'db\_scheme)\]_
        
    
*   _db\_id (int, optional)_ - reference to a defined DB URL (a numerical id) - see the “db\_url” module parameter.
    
*   _prefix (string, optional)_ - static string which will precede the names of the AVPs populated by this function.
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE, LOCAL\_ROUTE and ONREPLY\_ROUTE.

**Example�1.20.�`sql_avp_load` usage**

...
sql\_avp\_load("$fu", "$avp(678)");
sql\_avp\_load("$ru/domain", "i/domain\_preferences");
sql\_avp\_load("$avp(uuid)", "$avp(404fwd)/fwd\_table");
sql\_avp\_load("$ru", "$avp(123)/$some\_scheme");

# use DB URL id 3
sql\_avp\_load("$ru", "$avp(1)", 3);

# precede all loaded AVPs by the "caller\_" prefix
sql\_avp\_load("$ru", "$avp(100)", , "caller\_");
xlog("Loaded: $avp(caller\_100)\\n");

...
				

  

### 1.4.10.� `sql_avp_store(source, name, [db_id])`

Stores to DB the AVPs corresponding to the given _source_.

The meaning and usage of the parameters are identical as for _sql\_avp\_load(source, name)_ function. Please refer to its description.

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE, LOCAL\_ROUTE and ONREPLY\_ROUTE.

**Example�1.21.�`sql_avp_store` usage**

...
sql\_avp\_store("$tu", "$avp(678)");
sql\_avp\_store("$ru/username", "$avp(email)");
# use DB URL id 3
sql\_avp\_store("$ru", "$avp(1)", 3);
...
				

  

### 1.4.11.� `sql_avp_delete(source, name, [db_id])`

Deletes from DB the AVPs corresponding to the given _source_.

The meaning and usage of the parameters are identical as for _sql\_avp\_load(source, name)_ function. Please refer to its description.

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE, LOCAL\_ROUTE and ONREPLY\_ROUTE.

**Example�1.22.�`sql_avp_delete` usage**

...
sql\_avp\_delete("$tu", "$avp(678)");
sql\_avp\_delete("$ru/username", "$avp(email)");
sql\_avp\_delete("$avp(uuid)", "$avp(404fwd)/fwd\_table");
# use DB URL id 3
sql\_avp\_delete("$ru", "$avp(1)", 3);
...
				

  

## 1.5.�Exported Asynchronous Functions

### 1.5.1.� `sql_query(query, [dest], [db_id])`

This function takes the same parameters and behaves identically to [sql\_query()](#func_sql_query "1.4.1.� sql_query(query, [res_col_avps], [db_id])"), but asynchronously (after launching the query, the current SIP worker pauses the execution of the current SIP message until the result is available and attempts to process more SIP traffic).

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE, LOCAL\_ROUTE and ONREPLY\_ROUTE.

**Example�1.23.�`async sql_query` usage**

...
{
...
/\* Example of a slow MySQL query - it should take around 5 seconds \*/
async(
	sql\_query(
		"SELECT table\_name, table\_version, SLEEP(0.1) from version",
		"$avp(tb\_name); $avp(tb\_ver); $avp(retcode)"),
	my\_resume\_route);
/\* script execution is halted right after the async() call \*/
}

/\* We will be called when data is ready - meanwhile, the worker is free \*/
route \[my\_resume\_route\]
{
	xlog("Results: \\n$(avp(tb\_name)\[\*\])\\n
-------------------\\n$(avp(tb\_ver)\[\*\])\\n
-------------------\\n$(avp(retcode)\[\*\])\\n");
}
...
				

  

### 1.5.2.� `sql_query_one(query, [dest], [db_id])`

This function takes the same parameters and behaves identically to [sql\_query\_one()](#func_sql_query_one "1.4.2.� sql_query_one(query, [res_col_vars], [db_id])"), but asynchronously (after launching the query, the current SIP worker pauses the execution of the current SIP message until the result is available and attempts to process more SIP traffic).

This function can be used from any route.

**Example�1.24.�`async sql_query_one` usage**

...
{
...
/\* Example of a slow MySQL query - it should take around 5 seconds \*/
async(
	sql\_query\_one(
		"SELECT table\_name, table\_version, SLEEP(0.1) from version",
		"$var(tb\_name); $var(tb\_ver); $var(retcode)"),
	my\_resume\_route);
/\* script execution is halted right after the async() call \*/
}

/\* We will be called when data is ready - meanwhile, the worker is free \*/
route \[my\_resume\_route\]
{
	xlog("Result: $var(tb\_name) | $var(tb\_ver) | $(var(retcode)\\n");
}
...
				

  

## Chapter�2.�Contributors

## 2.1.�By Commit Statistics

**Table�2.1.�Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)**

�

Name

DevScore

Commits

Lines ++

Lines --

1.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

250

74

6054

7542

2.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

105

44

2927

2158

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

54

28

1116

948

4.

Elena-Ramona Modroiu

52

11

4040

390

5.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

21

14

149

246

6.

Elena-Ramona Modroiu

18

5

1051

192

7.

Henning Westerholt ([@henningw](https://github.com/henningw))

12

8

112

133

8.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

9

7

39

2

9.

Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita))

8

5

180

12

10.

Norman Brandinger ([@NormB](https://github.com/NormB))

7

5

37

10

  

**All remaining contributors**: Kobi Eshun ([@ekobi](https://github.com/ekobi)), Andrei Pelinescu-Onciul, Maksym Sobolyev ([@sobomax](https://github.com/sobomax)), Anca Vamanu, Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Klaus Darilion, John Burke ([@john08burke](https://github.com/john08burke)), Andrey Vorobiev, Nick Altmann ([@nikbyte](https://github.com/nikbyte)), Olle E. Johansson, Kennard White, Juli�n Moreno Pati�o, Konstantin Bokarius, Walter Doekes ([@wdoekes](https://github.com/wdoekes)), Andreas Granig, Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Sergio Gutierrez, Edson Gellert Schubert.

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 2.2.�By Commit Activity

**Table�2.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Jun 2005 - May 2025

2.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Oct 2022 - Apr 2025

3.

Norman Brandinger ([@NormB](https://github.com/NormB))

Aug 2006 - Mar 2025

4.

Nick Altmann ([@nikbyte](https://github.com/nikbyte))

Feb 2025 - Feb 2025

5.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Mar 2013 - May 2024

6.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

Jul 2015 - Apr 2024

7.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

Jun 2011 - Jul 2023

8.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Jun 2011 - Mar 2023

9.

John Burke ([@john08burke](https://github.com/john08burke))

Jun 2022 - Jun 2022

10.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Jul 2019

  

**All remaining contributors**: Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Andrey Vorobiev, Juli�n Moreno Pati�o, Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita)), Walter Doekes ([@wdoekes](https://github.com/wdoekes)), Anca Vamanu, Kennard White, Sergio Gutierrez, Kobi Eshun ([@ekobi](https://github.com/ekobi)), Henning Westerholt ([@henningw](https://github.com/henningw)), Olle E. Johansson, Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Elena-Ramona Modroiu, Klaus Darilion, Andreas Granig, Andrei Pelinescu-Onciul, Elena-Ramona Modroiu.

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), John Burke ([@john08burke](https://github.com/john08burke)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita)), Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)), Anca Vamanu, Norman Brandinger ([@NormB](https://github.com/NormB)), Kobi Eshun ([@ekobi](https://github.com/ekobi)), Henning Westerholt ([@henningw](https://github.com/henningw)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Elena-Ramona Modroiu, Klaus Darilion, Andrei Pelinescu-Onciul, Elena-Ramona Modroiu.

_Documentation Copyrights:_

Copyright � 2009-2024 [www.opensips-solutions.com](http://www.opensips-solutions.com/)

Copyright � 2004-2008 Voice Sistem SRL