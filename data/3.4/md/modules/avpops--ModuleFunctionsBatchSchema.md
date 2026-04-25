## 1.5.�Exported Functions

### 1.5.1.� `avp_db_load(source, name, [db_id], [prefix]])`

Loads from DB into memory the AVPs corresponding to the given _source_. If given, it sets the script flags for loaded AVPs. It returns true if it loaded some values in AVPs, false otherwise (db error, no avp loaded ...).

AVPs may be preceded by an optional _prefix_, in order to avoid some conflicts.

Meaning of the parameters is as follows:

*   _source (string, no expand)_ - what info is used for identifying the AVPs. Parameter syntax:
    
    *   _source = (pvar|str\_value) \['/'('username'|'domain'|'uri'|'uuid')\])_
        
    *   _pvar = any pseudo variable defined in OpenSIPS. If the pvar is $ru (request uri), $fu (from uri), $tu (to uri) or $ou (original uri), then the implicit flag is 'uri'. Otherwise, the implicit flag is 'uuid'._
        
    
*   _name (string, no expand)_ - which AVPs will be loaded from DB into memory. Parameter syntax is:
    
    *   _name = avp\_spec\['/'(table\_name|'$'db\_scheme)\]_
        
    *   _avp\_spec = matching\_flags|$avp(avp\_name)|$avp(avp\_alias)_
        
    *   _matching\_flags = 'a' | 'A' | 'i' | 'I' | 's' | 'S' \[script\_flags\]_
        
        'a' or 'A' means matching any of AVP name types ('i' and 's'), the rest have the meaning descriped in 'AVP naming format' chapter.
        
    
*   _db\_id (int, optional)_ - reference to a defined DB URL (a numerical id) - see the “db\_url” module parameter.
    
*   _prefix (string, optional)_ - static string which will precede the names of the AVPs populated by this function.
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE, LOCAL\_ROUTE and ONREPLY\_ROUTE.

**Example�1.12.�`avp_db_load` usage**

...
avp\_db\_load("$fu", "$avp(678)");
avp\_db\_load("$ru/domain", "i/domain\_preferences");
avp\_db\_load("$avp(uuid)", "$avp(404fwd)/fwd\_table");
avp\_db\_load("$ru", "$avp(123)/$some\_scheme");

# use DB URL id 3
avp\_db\_load("$ru", "$avp(1)", 3);

# precede all loaded AVPs by the "caller\_" prefix
avp\_db\_load("$ru", "$avp(100)", , "caller\_");
xlog("Loaded: $avp(caller\_100)\\n");

...
				

  

### 1.5.2.� `avp_db_store(source, name, [db_id])`

Stores to DB the AVPs corresponding to the given _source_.

The meaning and usage of the parameters are identical as for _avp\_db\_load(source, name)_ function. Please refer to its description.

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE, LOCAL\_ROUTE and ONREPLY\_ROUTE.

**Example�1.13.�`avp_db_store` usage**

...
avp\_db\_store("$tu", "$avp(678)");
avp\_db\_store("$ru/username", "$avp(email)");
# use DB URL id 3
avp\_db\_store("$ru", "$avp(1)", 3);
...
				

  

### 1.5.3.� `avp_db_delete(source, name, [db_id])`

Deletes from DB the AVPs corresponding to the given _source_.

The meaning and usage of the parameters are identical as for _avp\_db\_load(source, name)_ function. Please refer to its description.

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE, LOCAL\_ROUTE and ONREPLY\_ROUTE.

**Example�1.14.�`avp_db_delete` usage**

...
avp\_db\_delete("$tu", "$avp(678)");
avp\_db\_delete("$ru/username", "$avp(email)");
avp\_db\_delete("$avp(uuid)", "$avp(404fwd)/fwd\_table");
# use DB URL id 3
avp\_db\_delete("$ru", "$avp(1)", 3);
...
				

  

### 1.5.4.� `avp_db_query(query, [res_col_avps], [db_id])`

Make a database query and store the result in AVPs.

The meaning and usage of the parameters:

*   _query (string)_ - must be a valid SQL query. The parameter can contain pseudo-variables.
    
    You must escape any pseudo-variables manually to prevent SQL injection attacks. You can use the existing transformations _escape.common_ and _unescape.common_ to escape and unescape the content of any pseudo-variable. Failing to escape the variables used in the query makes you vulnerable to SQL injection, e.g. make it possible for an outside attacker to alter your database content. The function returns true if the query was successful, -2 in case the query returned an empty result set, and -1 for all other types of errors
    
*   _res\_col\_avps (string, optional, no expand)_ - a list with AVP names where to store the result. The format is “$avp(name1);$avp(name2);...”. If this parameter is omitted, the result is stored in “$avp(1);$avp(2);...”. If the result consists of multiple rows, then multiple AVPs with corresponding names will be added. The value type of the AVP (string or integer) will be derived from the type of the columns. If the value in the database is _NULL_, the returned avp will be a string with the _<null>_ value.
    
*   _db\_id (int, optional)_ - reference to a defined DB URL (a numerical id) - see the “db\_url” module parameter. It can be either a constant, or a string/int variable.
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE, LOCAL\_ROUTE and ONREPLY\_ROUTE.

**Example�1.15.�`avp_db_query` usage**

...
avp\_db\_query("SELECT password, ha1 FROM subscriber WHERE username='$tu'",
	"$avp(pass);$avp(hash)");
avp\_db\_query("DELETE FROM subscriber");
avp\_db\_query("DELETE FROM subscriber", , 2);

$avp(id) = 2;
avp\_db\_query("DELETE FROM subscriber", , $avp(id));
...
				

  

### 1.5.5.� `avp_delete(name)`

Deletes from memory the AVPs with _name_ or, if \*, all AVPs.

Meaning of the parameters is as follows:

*   _name (string, no expand)_ - which AVPs will be deleted from memory. Parameter syntax is:
    
    *   _name = (matching\_flags|avp\_name|avp\_alias)\['/'flag\]_
        
    *   _matching\_flags = please refer to avp\_db\_load() function_
        
    *   _flag = 'g'|'G'_
        
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE, LOCAL\_ROUTE and ONREPLY\_ROUTE.

**Example�1.16.�`avp_delete` usage**

...
avp\_delete("$avp(email)"); # delete topmost (lastly set) value from $avp(email)
avp\_delete("$avp(678)/g"); # fully purge $avp(678)
avp\_delete("i");
avp\_delete("a3");
...
				

  

### 1.5.6.� `avp_pushto(destination, name)`

Pushes the value of AVP(s) into the SIP message.

Meaning of the parameters is as follows:

*   _destination (string, no expand)_ - as what will be the AVP value pushed into SIP message. Parameter syntax:
    
    *   _destination = '$ru' \['/'('username'|'domain')\] | '$du' | '$br'_
        
    *   _$ru '\['/'('username'|'domain')\] - write the AVP in the request URI or in username/domain part of it_
        
    *   _$du - write the AVP in 'dst\_uri' field_
        
    *   _$br - write the AVP directly as a new branch (does not affect RURI)_
        
    
*   _name (string, no expand)_ - which AVP(s)/pseudo-variable should be pushed into the SIP message. Parameter syntax is:
    
    *   _name = ( avp\_name | avp\_alias | pvar\_name )\['/'flags\]_
        
    *   _flags = 'g' - effective only with AVPs_
        
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE, LOCAL\_ROUTE and ONREPLY\_ROUTE.

**Example�1.17.�`avp_pushto` usage**

...
avp\_pushto("$ru/domain", "$fd");
avp\_pushto("$ru", "$avp(678)");
avp\_pushto("$ru/domain", "$avp(backup\_domains)/g");
avp\_pushto("$du", "$avp(679)");
avp\_pushto("$br", "$avp(680)");
...
				

  

### 1.5.7.� `avp_check(name, op_value)`

Checks the value of the AVP(s) against an operator and value.

Meaning of the parameters is as follows:

*   _name (string, no expand)_ - which AVP(s) should be checked. Parameter syntax is:
    
    *   _name = ( pseudo-variable )_
        
    
*   _op\_value (string, no expand)_ - define the operator, the value and flags for checking. Parameter syntax is:
    
    *   _op\_value = operator '/' value \['/'flags\]_
        
    *   _operator = 'eq' | 'ne' | 'lt' | 'le' | 'gt' | 'ge' | 're' | 'fm' | 'and' | 'or' | 'xor'_
        
    *   _value = pseudo-variable | fix\_value_
        
    *   _fix\_value = 'i:'integer | 's:'string | string_
        
    *   _flags = 'g' | 'G' | 'i' | 'I'_
        
    
    Operator meaning:
    
    *   _eq_ \- equal
        
    *   _ne_ \- not equal
        
    *   _lt_ \- less than
        
    *   _le_ \- less or equal
        
    *   _gt_ \- greater than
        
    *   _ge_ \- greater or equal
        
    *   _re_ \- regexp (regular exression match)
        
    *   _fm_ \- fast match (see: man fnmatch)
        
    *   _and_ \- bitwise 'and'
        
    *   _or_ \- bitwise 'or'
        
    *   _xor_ \- bitwise 'xor'
        
    
    Integer values can be given in hexadecimal using notation: 'i:0xhex\_number' (e.g.,: 'i:0xabcd');
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE, LOCAL\_ROUTE and ONREPLY\_ROUTE.

**Example�1.18.�`avp_check` usage**

...
avp\_check("$avp(678)", "lt/345/g");
avp\_check("$fd", "eq/$td/I");
avp\_check("$avp(foo)", "gt/$avp($bar)/g");
avp\_check("$avp(foo)", "re/sip:.\*@bar.net/g");
avp\_check("$avp(foo)", "fm/$avp(fm\_avp)/g");
...
				

  

### 1.5.8.� `avp_copy(from_avp, to_avp)`

Copy / move an avp under a new name.

Meaning of the parameters is as follows:

*   _from\_avp (string, no expand)_ - which AVP(s) should be copied/moved. Parameter syntax is:
    
    *   _from\_avp = ( avp\_name | avp\_alias )_
        
    
*   _to\_avp (string, no expand)_ - the new name of the copied/moved AVP(s). Parameter syntax is:
    
    *   _to\_avp = ( avp\_name | avp\_alias ) \['/'flags\]_
        
    *   _flags = 'g' | 'G' | 'd' | 'D' | 'n' | 'N' | 's' | 'S'_
        
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE, LOCAL\_ROUTE and ONREPLY\_ROUTE.

**Example�1.19.�`avp_copy` usage**

...
avp\_copy("$avp(foo)", "$avp(bar)/g");
avp\_copy("$avp(old)", "$avp(new)/gd"); # also deletes $avp(old)
...
				

  

### 1.5.9.� `avp_subst(avps, subst)`

Perl/sed-like subst applied to AVPs having string value.

Meaning of the parameters is as follows:

*   _avps (string, no expand)_ - source AVP, destination AVP and flags. Parameter syntax is:
    
    *   _avps = src\_avp \[ '/' dst\_avp \[ '/' flags \] \]_
        
    *   _src\_avp = ( avp\_name | avp\_alias )_
        
    *   _dst\_avp = ( avp\_name | avp\_alias ) - if dst\_avp is missing then the value of src\_avp will be replaced_
        
    *   _flags = ( d | D | g | G ) -- (d, D - delete source avp; g, G - apply to all avps matching src\_avp name)_
        
    
*   _subst (string)_ - perl/sed-like reqular expression. Parameter syntax is:
    
    *   _subst = "/regexp/replacement/flags"_
        
    *   _regexp - regular expression_
        
    *   _replacement - replacement string, can include pseudo-variables and \\1, ..., \\9 for matching tokens, \\0 for whole matching text_
        
    *   _flags = 'g' | 'G' | 'i' | 'i' (g, G - replace all matching tokens; i, I - match ignore case)_
        
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE, LOCAL\_ROUTE and ONREPLY\_ROUTE.

**Example�1.20.�`avp_subst` usage**

...
# if avp 678 has a string value in e-mail format, replace the
# domain part with the value of domain part from R-URI
avp\_subst("$avp(678)", "/(.\*)@(.\*)/\\1@$rd/");

# if any avp 678 has a string value in e-mail format, replace the
# domain part with the value of domain part from R-URI
# and place the result in avp 679
avp\_subst("$avp(678)/$avp(679)/g", "/(.\*)@(.\*)/\\1@$rd/");
...
				

  

IMPORTANT NOTE: if the replacement string includes src\_avp or dst\_avp you will get something that you may not expect. In case you have many src\_avp and you make the substitution to be applied to all of them, after the first src\_avp is processed, it will be added in avp list and next processing will use it.

### 1.5.10.� `avp_op(name, op_value)`

Different integer operations with avps.

Meaning of the parameters is as follows:

*   _name (string, no expand)_ - 'source\_avp/destination\_avp' - which AVP(s) should be processed and where to store the result. If 'destination\_avp' is missing, same name as 'source\_avp' is used to store the result.
    
    Parameter syntax is:
    
    *   _name = ( source\_avp\[/destination\_avp\] )_
        
        _source\_avp = ( avp\_name | avp\_alias )_
        
        _destination\_avp = ( avp\_name | avp\_alias )_
        
    
*   _op\_value (string, no expand)_ - define the operation, the value and flags. Parameter syntax is:
    
    *   _op\_value = operator '/' value \['/'flags\]_
        
    *   _operator = 'add' | 'sub' | 'mul' | 'div' | 'mod' | 'and' | 'or' | 'xor' | 'not'_
        
    *   _value = pseudo-variable | fix\_value_
        
    *   _fix\_value = 'i:'integer_
        
    *   _flags = 'g' | 'G' | 'd' | 'D'_
        
    
    Integer values can be given in hexadecimal using notation 'i:0xhex\_number' (e.g.,: 'i:0xabcd');
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE, LOCAL\_ROUTE and ONREPLY\_ROUTE.

**Example�1.21.�`avp_op` usage**

...
avp\_op("$avp(678)", "add/345/g");
avp\_op("$avp(number)", "sub/$avp(number2)/d");
...
				

  

### 1.5.11.� `is_avp_set(name)`

Check if any AVP with _name_ is set.

Meaning of the parameters is as follows:

*   _name (string, no expand)_ - name of AVP to look for. Parameter syntax is:
    
    *   _name = avp\_name|avp\_alias \[ '/' flags \])_
        
        _flags = ('e'|'s'|'n') - e = empty value; s = value string; n = value number (int)_
        
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE, LOCAL\_ROUTE and ONREPLY\_ROUTE.

**Example�1.22.�`is_avp_set` usage**

...
if(is\_avp\_set("$avp(foo)"))
    xlog("AVP with name 'foo' is set!\\n");
...
				

  

### 1.5.12.� `avp_shuffle(name)`

Randomly shuffles AVPs with _name_.

Meaning of the parameters is as follows:

*   _name (string, no expand)_ - name of AVP to shuffle. Parameter syntax is:
    
    *   _name = avp\_name_
        
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE, LOCAL\_ROUTE and ONREPLY\_ROUTE.

**Example�1.23.�`avp_shuffle` usage**

...
$avp(foo) := "str1";
$avp(foo)  = "str2";
$avp(foo)  = "str3";
xlog("Initial AVP list is: $(avp(foo)\[\*\])\\n");       # str3 str2 str1
if(avp\_shuffle("$avp(foo)"))
    xlog("Shuffled AVP list is: $(avp(foo)\[\*\])\\n");  # str1, str3, str2 (for example)
...
				

  

### 1.5.13.� `avp_print()`

Prints the list with all the AVPs from memory. This is only a helper/debug function.

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE, LOCAL\_ROUTE and ONREPLY\_ROUTE.

**Example�1.24.�`avp_print` usage**

...
avp\_print();
...