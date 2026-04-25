# AVPops Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5975696)

2.2. [Most recently active contributors(1) to this module](#idp6080096)

**List of Examples**

1.1. [AVP naming examples](#idp208752)

1.2. [Set `avp_url` parameter](#idp165200)

1.3. [Set `avp_table` parameter](#idp170256)

1.4. [Set `use_domain` parameter](#idp5567632)

1.5. [Set `uuid_column` parameter](#idp5572448)

1.6. [Set `username_column` parameter](#idp5577264)

1.7. [Set `domain_column` parameter](#idp5582160)

1.8. [Set `attribute_column` parameter](#idp5587136)

1.9. [Set `value_column` parameter](#idp5592032)

1.10. [Set `type_column` parameter](#idp5596848)

1.11. [Set `db_scheme` parameter](#idp5607584)

1.12. [`avp_db_load` usage](#idp5625472)

1.13. [`avp_db_store` usage](#idp5632224)

1.14. [`avp_db_delete` usage](#idp5638352)

1.15. [`avp_db_query` usage](#idp5651488)

1.16. [`avp_delete` usage](#idp5661168)

1.17. [`avp_pushto` usage](#idp5674160)

1.18. [`avp_check` usage](#idp5696912)

1.19. [`avp_copy` usage](#idp5707648)

1.20. [`avp_subst` usage](#idp5722016)

1.21. [`avp_op` usage](#idp5737840)

1.22. [`is_avp_set` usage](#idp5746512)

1.23. [`avp_shuffle` usage](#idp5754544)

1.24. [`avp_print` usage](#idp5759584)

1.25. [`async avp_db_query` usage](#idp5778128)

## Chapter�1.�Admin Guide

## 1.1.�Overview

AVPops (AVP-operations) modules implements a set of script functions which allow access and manipulation of user AVPs (preferences) and pseudo-variables. AVPs are a powerful tool for implementing services/preferences per user/domain. Now they are usable directly from configuration script. Functions for interfacing DB resources (loading/storing/removing), functions for swapping information between AVPs and SIP messages, function for testing/checking the value of an AVP.

AVPs are persistent per SIP transaction, being available in "route", "branch\_route" and "failure\_route". To make them available in "onreply\_route" armed via TM module, set "onreply\_avp\_mode" parameter of TM module (note that in the default "onreply\_route", the AVPs of the transaction are not available).

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _Optionally a database module_
    

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _None_
    

## 1.3.�AVP naming format

The format of the parameters specifying an AVP in functions exported by this module is: **$avp(avp\_name)**.

*   _avp\_name_ = string | integer
    
    string - might be any alphanumeric string, wich contain following characters: \[a-z\] \[A-Z\] \[0-9\] '\_'
    

**Example�1.1.�AVP naming examples**

...
$avp(11) - the AVP identified by name 11
$avp(foo) - the AVP identified by the string 'foo'
...
				

  

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
				

  

## 1.6.�Exported Asynchronous Functions

### 1.6.1.� `avp_db_query(query, [dest], [db_id])`

This function takes the same parameters and behaves identically to [avp\_db\_query()](#func_avp_db_query "1.5.4.� avp_db_query(query, [res_col_avps], [db_id])"), but asynchronously (after launching the query, the current SIP worker pauses the execution of the current SIP message until the result is available and attempts to process more SIP traffic).

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE, LOCAL\_ROUTE and ONREPLY\_ROUTE.

**Example�1.25.�`async avp_db_query` usage**

...
{
...
/\* Example of a slow MySQL query - it should take around 5 seconds \*/
async(
	avp\_db\_query(
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

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

104

44

2927

2158

2.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

67

49

690

716

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

54

28

1112

946

4.

Elena-Ramona Modroiu

51

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

8

6

25

2

9.

Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita))

8

5

180

12

10.

Kobi Eshun ([@ekobi](https://github.com/ekobi))

7

1

300

146

  

**All remaining contributors**: Andrei Pelinescu-Onciul, Anca Vamanu, Maksym Sobolyev ([@sobomax](https://github.com/sobomax)), Norman Brandinger ([@NormB](https://github.com/NormB)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Klaus Darilion, John Burke ([@john08burke](https://github.com/john08burke)), Andrey Vorobiev, Nick Altmann ([@nikbyte](https://github.com/nikbyte)), Olle E. Johansson, Kennard White, Juli�n Moreno Pati�o, Konstantin Bokarius, Walter Doekes ([@wdoekes](https://github.com/wdoekes)), Andreas Granig, Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Sergio Gutierrez, Edson Gellert Schubert, Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)).

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 2.2.�By Commit Activity

**Table�2.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Nick Altmann ([@nikbyte](https://github.com/nikbyte))

Feb 2025 - Feb 2025

2.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Mar 2013 - May 2024

3.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Jun 2011 - Mar 2023

4.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Oct 2022 - Feb 2023

5.

John Burke ([@john08burke](https://github.com/john08burke))

Jun 2022 - Jun 2022

6.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Jun 2005 - Mar 2020

7.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Jul 2019

8.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

9.

Andrey Vorobiev

Apr 2016 - Apr 2016

10.

Juli�n Moreno Pati�o

Feb 2016 - Feb 2016

  

**All remaining contributors**: Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita)), Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)), Walter Doekes ([@wdoekes](https://github.com/wdoekes)), Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)), Anca Vamanu, Kennard White, Norman Brandinger ([@NormB](https://github.com/NormB)), Sergio Gutierrez, Kobi Eshun ([@ekobi](https://github.com/ekobi)), Henning Westerholt ([@henningw](https://github.com/henningw)), Olle E. Johansson, Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Elena-Ramona Modroiu, Klaus Darilion, Andreas Granig, Andrei Pelinescu-Onciul, Elena-Ramona Modroiu.

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), John Burke ([@john08burke](https://github.com/john08burke)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)), Anca Vamanu, Norman Brandinger ([@NormB](https://github.com/NormB)), Kobi Eshun ([@ekobi](https://github.com/ekobi)), Henning Westerholt ([@henningw](https://github.com/henningw)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Elena-Ramona Modroiu, Klaus Darilion, Andrei Pelinescu-Onciul, Elena-Ramona Modroiu.

_Documentation Copyrights:_

Copyright � 2004-2008 Voice Sistem SRL