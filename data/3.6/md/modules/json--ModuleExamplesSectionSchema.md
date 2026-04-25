# JSON Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp30767312)

2.2. [Most recently active contributors(1) to this module](#idp30866512)

**List of Examples**

1.1. [Set `enable_long_quoting` parameter](#idp27614736)

1.2. [Accessing the $json variable](#idp25358912)

1.3. [Iterating through an array using variables](#idp25360736)

1.4. [iteration over $json object keys](#idp30687456)

1.5. [iteration over $json object values](#idp30688976)

1.6. [iteration over $json array values](#idp30690624)

1.7. [Appending integers to arrays](#idp30697600)

1.8. [Deleting the last element in an array](#idp30698992)

1.9. [Adding a string value to a json object](#idp30700384)

1.10. [Initializing an array](#idp30703104)

1.11. [Setting a boolean or null value](#idp30704496)

1.12. [Adding a json to another json](#idp30706000)

1.13. [Creating a reference](#idp30719184)

1.14. [\[LOGICAL ERROR\] Creating a circular reference](#idp30721744)

1.15. [Using json\_merge](#idp30725968)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This module introduces a new type of variable that provides both serialization and de-serialization from JSON format.

The variable provides ways to access objects and arrays to add,replace or delete values from the script.

The correct approach is to consider a json object as a hashtable ( you can put (key;value) pairs, and you can delete and get values by key) and a json array as an array ( you can append, delete and replace values).

Since the JSON format can have objects inside other objects you can have multiple nested hashtables or arrays and you can access these using paths.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

This module does not depend on other modules.

### 1.2.2.�External Libraries or Applications

*   _libjson_ The libjson C library can be downloaded from: http://oss.metaparadigm.com/json-c/
    

## 1.3.�Exported Parameters

### 1.3.1.�`enable_long_quoting` (boolean)

Enable this parameter if your input JSONs contain signed integers which do not fit into 4 bytes (e.g. larger than 2147483647, etc.). If the parameter is enabled, 4-byte integers will continue to be returned as integers, while larger values will be returned as strings, in order to avoid the integer overflow.

_Default value is _false_._

**Example�1.1.�Set `enable_long_quoting` parameter**

...
modparam("json", "enable\_long\_quoting", true)
...
# normalize the "gateway\_id" int/string value to be always a string
$var(gateway\_id) = "" + $json(body/gateway\_id);
...

  

## 1.4.�Exported Pseudo-Variables

### 1.4.1.�`$json(id)`

The `json` variable provides methods to access fields in json objects and indexes in json arrays.

#### 1.4.1.1.�Variable lifetime

The json variables will be available to the process that created them from the moment they were initialized. They will not reset per message or per transaction. If you want to use the on a per message basis you should initialize them each time.

#### 1.4.1.2.�Accessing the $json(id) variable

The grammar that describes the id is:

id = name(identifier)\*

identifier = key | index

key = /string | /$var

index = \[integer\] | \[$var\] | \[\]

The "\[\]" index represents appending to the array. It should only be used when trying to set a value and not when trying to get one.

Negative indexes can be used to access an array starting from the end. So "\[-1\]" signifies the last element.

IMPORTANT: The id strictly complies to this grammar. You should be careful when using spaces because they will NOT be ignored. This was done to allow keys that contain spaces.

Variables can be used as indexes or keys. Variables that will be used as indexes must contain integer values. Variables that will be used as keys should contain string values.

Trying to get a value from a non-existing path (key or value) will return the NULL value and notice messages will be placed in the log describing the value of the json and the path used.

Trying to replace or insert a value in a non-existing path will cause an error in setting the value and notice messages will be printed in the log describing the value of the json and the path used

**Example�1.2.�Accessing the $json variable**

...
$json(obj1/key) = "value"; #replace or insert the (key,value)
			   #pair into the json object;
			   
$json(matrix1\[1\]\[2\]) = 1;  #replace the element at index 2 in the element
			   #at index 1 in an array

xlog("$json(name/key1\[0\]\[-1\]/key2)"); # a more complex example

...
		

  

**Example�1.3.�Iterating through an array using variables**

...

$json(ar1) := "\[1,2,3,4\]";

$var(i) = 0;

while( $json(ar1\[$var(i)\]) )
{

	#print each value
	xlog("Found:\[$json(ar1\[$var(i)\])\]\\n");

	#increment each value
	$json(ar1\[$var(i)\])  = $json(ar1\[$var(i)\]) + 1 ;

	$var(i) = $var(i) + 1;

}


...
		

  

#### 1.4.1.3.�Traversal

Dynamic traversal of a JSON object or array is possible by using a for each statement, similarly to the indexed pseudo variables iteration. However, note that indexing the $json variable is not supported in any other statements (this refers to indexing the entire variable and not to the indexes accepted in the grammar of the _id_).

In order to explicitly iterate over a JSON object keys or values, you can use the _.keys_ or _.values_ suffix for the path specified in the _id_.

**Example�1.4.�iteration over $json object keys**

...
$json(foo) := "{\\"a\\": 1, \\"b\\": 2, \\"c\\": 3}";
for ($var(k) in $(json(foo.keys)\[\*\]))
    xlog("$var(k) ");
...
		

  

**Example�1.5.�iteration over $json object values**

...
$json(foo) := "{\\"a\\": 1, \\"b\\": 2, \\"c\\": 3}";
for ($var(v) in $(json(foo.values)\[\*\]))
    xlog("$var(v) ");

# equivalent to:

$json(foo) := "{\\"a\\": 1, \\"b\\": 2, \\"c\\": 3}";
for ($var(v) in $(json(foo)\[\*\]))
    xlog("$var(v) ");
...
		

  

**Example�1.6.�iteration over $json array values**

...
$json(foo) := "\[1, 2, 3\]";
for ($var(v) in $(json(foo)\[\*\]))
    xlog("$var(v) ");
...
		

  

#### 1.4.1.4.� Returned values from $json(id)

If the value specified by the id is an integer it will be returned as an integer value.

If the value specified by the id is a string it will be returned as a string.

If the value specified by the id is any other type of json ( null, boolean, object, array ) the serialized version of the object will be returned as a string value. Using this and the ":=" operator you can duplicate json objects and put them in other json objects ( for string or integer you may use the "=" operator).

If the id does not exist a NULL value will be returned.

#### 1.4.1.5.� Operators for the $json(id) variable

There are 2 operators available for this variable.

##### 1.4.1.5.1.� The "=" operator

This will cause the value to be taken as is and be added to the json object ( e.g. string value or integer value ).

Setting a value to NULL will cause it to be deleted.

**Example�1.7.�Appending integers to arrays**

...
$json(array1\[\]) = 1;
...
			

  

**Example�1.8.�Deleting the last element in an array**

...
$json(array1\[-1\]) = NULL;
...
			

  

**Example�1.9.�Adding a string value to a json object**

...
$json(object1/some\_key) = "some\_value";
...
			

  

##### 1.4.1.5.2.� The ":=" operator

This will cause the value to be taken and interpreted as a json object ( e.g. this operator should be used to parse json inputs ).

**Example�1.10.�Initializing an array**

...
$json(array1) := "\[\]";
...
			

  

**Example�1.11.�Setting a boolean or null value**

...
$json(array1\[\]) := "null";
$json(array1\[\]) := "true";
$json(array1\[\]) := "false";
...
			

  

**Example�1.12.�Adding a json to another json**

...

$json(array) := "\[1,2,3\]";
$json(object) := "{}";
$json(object/array) := $json(array) ;
...
			

  

### 1.4.2.�`$json_pretty(id)`

The `json_pretty` variable has the same purpose as the `json` variable, but prints the JSON object in a pretty format, adding spaces and tabs to make the output more readable.

### 1.4.3.�`$json_compact(id)`

The `json_compact` variable has the same purpose as the `json` variable, but prints the JSON object in a more compact form, without formatting spaces.

## 1.5.�Exported Functions

### 1.5.1.� `json_link($json(dest_id), $json(source_id))`

This function can be used to link json objects together. This will work simillar to setting a value to an object, the only difference is that the second object is not copied, only a reference is created.

Changes to any of the objects will be visible in both of them.

You can use this method either to create references so each time you access the field you don't have to go through the full path (for speed efficiency and shorter code), or if you have an object that must be added to many other objects and you don't want to copy it each time (space and speed efficiency).

You can think of this object exactly as a reference in an object-oriented language. Modifying fields referenced by the variable will cause modifications in all the objects, BUT modifying the variable itsef will not cause any changes to other objects.

WARNING: You should be careful when using references. If you accidentally create a circular reference and try to get the value from the object you will crash OPENSIPS.

**Example�1.13.�Creating a reference**

...

$json(b) := "\[{},{},{}\]";

json\_link($json(stub), $json(b\[0\]));

$json(stub/ana) = "are"; #add to the stub
$json(stub/ar) := "\[\]";
$json(stub/ar\[\]) = 1;
$json(stub/ar\[\]) = 2;
$json(stub/ar\[\]) = 3;

$json(b\[0\]/ar\[0\]) = NULL; # delete from the original object

xlog("\\nTest link :\\n$json(stub)\\n$json(b)\\n\\n");

/\*Output:

Test link :
{ "ana": "are", "ar": \[ 2, 3 \] }
\[ { "ana": "are", "ar": \[ 2, 3 \] }, { }, { } \]

\*/

$json(stub) = NULL; #delete the stub, no change will happen to the source


xlog("\\nTest link :\\n$json(stub)\\n$json(b)\\n\\n");

/\* Output:

Test link :
<null>
\[ { "ana": "are", "ar": \[ 2, 3 \] }, { }, { } \]

\*/





...
			

  

**Example�1.14.�\[LOGICAL ERROR\] Creating a circular reference**

...

$json(b) := "\[1\]";

/\* NEVER do this, it is meant only to show where problems might occur  \*/
json\_link($json(b\[0\]), $json(b)); # replace 1 with a reference to b

xlog("\\nTest link :\\n$json(stub)\\n$json(b)\\n\\n");

/\* this will cause OPENSIPS to crash because it will continuously try
 to get b, then b\[0\], then b ... \*/


...
			

  

### 1.5.2.� `json_merge(main_json_var,patch_json_var,output_var))`

The function can be used to patch merge patch\_json\_var into main\_json\_var and the output will be populated into the output\_var

**Example�1.15.�Using json\_merge**

...

$json(val1) := "{}";
$json(val1/test1) = "test\_val1";
$json(val1/common\_val) = "val\_from1";

$json(val2) := "{}";
$json(val2/test2) = "test\_val2";
$json(val1/common\_val) = "val\_from2";

json\_merge($json(val1),$json(val2),$var(merged\_json));
xlog("we merged and got $var(merged\_json) \\n");
# will print : 
# we merged and got {"test1":"test\_val1","common\_val":"val\_from2","test2":"test\_val2"} 
			

  

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

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

20

17

84

92

2.

Andrei Dragus

19

4

1556

12

3.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

14

11

48

76

4.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

10

7

131

19

5.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

8

6

27

30

6.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

8

4

195

75

7.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

5

3

12

12

8.

Bj�rn Esser ([@besser82](https://github.com/besser82))

5

2

124

44

9.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

4

2

17

4

10.

Nick Altmann ([@nikbyte](https://github.com/nikbyte))

3

1

47

15

  

**All remaining contributors**: Anca Vamanu, Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Bence Szigeti, Juli�n Moreno Pati�o.

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 2.2.�By Commit Activity

**Table�2.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

Jul 2014 - Jan 2025

2.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Oct 2013 - Dec 2024

3.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Jan 2021 - Nov 2023

4.

Bence Szigeti

Nov 2023 - Nov 2023

5.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Feb 2012 - Sep 2019

6.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Dec 2010 - Apr 2019

7.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Apr 2019

8.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

9.

Nick Altmann ([@nikbyte](https://github.com/nikbyte))

Jan 2018 - Jan 2018

10.

Bj�rn Esser ([@besser82](https://github.com/besser82))

Dec 2017 - Dec 2017

  

**All remaining contributors**: Juli�n Moreno Pati�o, Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)), Anca Vamanu, Andrei Dragus.

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Nick Altmann ([@nikbyte](https://github.com/nikbyte)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Andrei Dragus.

_Documentation Copyrights:_

Copyright � 2009 Voice Sistem SRL