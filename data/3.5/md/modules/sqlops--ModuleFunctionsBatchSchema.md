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