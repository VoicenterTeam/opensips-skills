## 1.7.�Exported Functions

### 1.7.1.� `dp_translate(id, input, [out_var], [attrs_var], [partition])`

Will try to translate the src string into dest string according to the translation rules with dialplan ID equal to id.

Meaning of the parameters is as follows:

*   _id_ (int) - the dialplan id to be used for matching rules
    
*   _input_ (string) - input string to be used for rule matching and for computing the output string.
    
*   _out\_var_ (var, optional) - variable to be populated/written with the output string (if provided by the translation rule), on a successful translation.
    
*   _attrs\_var_ (var, optional) - variable to be populated/written with the "attributes" field of the translation rule, on a successful translation. If the field is NULL or empty-string, the variable will be set to empty-string.
    
*   _partition_ (string, optional) - the name of the partition (set of data) to be used for locating the DP ID.
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, LOCAL\_ROUTE, BRANCH\_ROUTE, STARTUP\_ROUTE, TIMER\_ROUTE and EVENT\_ROUTE.

**Example�1.15.�`dp_translate` usage**

...
dp\_translate(240, $ru, $var(out));
xlog("translated into '$var(out)' \\n");
...
	

  

**Example�1.16.�`dp_translate` usage**

...
$avp(src) = $ruri.user;
dp\_translate($var(x), $avp(src), $var(y), $var(attrs));
xlog("translated to var $var(y) with attributes: '$var(attrs)'\\n");
...
	

  

**Example�1.17.�`dp_translate` usage**

...
$var(id) = 10;
dp\_translate($var(id), $avp(in), , $avp(attrs), "example\_partition");
xlog("matched with attributes '$avp(attrs) against example\_partition'\\n");
...
	

  

**Example�1.18.�`dp_translate` usage**

...
dp\_translate(10, $var(in), , , $var(part));
xlog("'$var(in)' matched against partition '$var(part)'\\n")
...