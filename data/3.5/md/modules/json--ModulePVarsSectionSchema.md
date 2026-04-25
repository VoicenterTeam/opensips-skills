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