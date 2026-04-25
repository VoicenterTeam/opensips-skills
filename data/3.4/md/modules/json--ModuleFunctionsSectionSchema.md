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