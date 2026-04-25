## 1.4.�Exported Pseudo-Variables

### 1.4.1.�`$xml(path)`

This module exports the _$xml(path)_ variable.

#### 1.4.1.1.�Variable lifetime

The xml variables will be available to the process that created them from the moment they were initialized. They will not reset per message or per transaction. If you want to use them on a per message basis you should initialize them each time.

#### 1.4.1.2.�Accessing the $xml(path) variable

Accessing elements and attributes is based on the tree representation of the XML document thus a complete path from the root node is required. The in-memory equivalent of an XML document is an "XML object" which must be initilized with a well-formed block of XML data before use. In consequence, the path must start with the object name, followed by any number of nodes leading to the desired element.

The grammar that describes the path is:

path = name | name(identifier)+(acces)?

identifier = element(index)?

element = /string | /$var

index = \[integer\] | \[$var\]

access = .val | .attr/string | .attr/$var

In order to select between nodes with identical names on a certain level in the tree, an index can be provided, starting from 0.

The sequence of nodes in the path can be followed by _.val_ in order to access the last node's text content or by _.attr/attr\_name_ in order to access it's attribute named _attr\_name_. Otherwise the entire element (start-tag, end-tag, children elements and content) is accessed.

Assiging NULL to the variable removes the entire element or it's text content or attribute acording to the access mode.

If you want to insert an element, you must assign a string value (containg a well-formed block of XML data that has a root node) to the parent node. Note that assigning a value directly to a node does not replace it with that value.

IMPORTANT: In XML all characters in the content of the document are significant including blanks and formatting line breaks. An element and it's content will be returned WITH all the whitespaces and newlines and when adding a new node under an existing one, if you want to insert it with indentation, you must include the needed characters in the assigned string.

Other script variables can be used as element names, attribute names and indexes in the path. Variables that will be used as indexes must contain integer values. Variables that will be used as element or attribute names should contain string values.

**Example�1.1.�Creating a document**

...
$xml(my\_doc) = "<doc></doc>";        # init object

$xml(my\_doc/doc) = "<list></list>";  # add a "list" node

$xml(my\_doc/doc/list) = "<item>some\_value</item>";    # add an "item" node to the list

$xml(my\_doc/doc/list) = "<item>another\_value</item>"; # add another item to the list

$xml(my\_doc/doc/list/item\[1\].val) = "new\_val";        # set text content of previous item

$xml(my\_doc/doc/list.attr/sort) = "asc";              # add attribute "sort" to list node

$xml(my\_doc/doc/list.attr/sort) = NULL;               # remove previous attribute

$xml(my\_doc/doc/list/item\[1\]) = NULL;                 # remove second item

$xml(my\_doc/doc/list.val) = "end";                    # add text content to list which now has
                                                      # mixed content

$xml(my\_doc/doc/list.val) = NULL;                     # remove the text content

xlog("$xml(my\_doc/doc/list)\\n");                      # display the entire list

xlog("$xml(my\_doc)\\n");                               # display the entire document

$xml(my\_doc) = NULL;                                  # clear the entire document
...
				

  

**Example�1.2.�Inserting nodes with indentation**

...
$xml(my\_doc) = "<doc>\\n</doc>";
$xml(my\_doc/doc) = "\\t<list></list>\\n";
$xml(my\_doc/doc/list) = "\\n\\t\\t<item></item>\\n\\t";

# this creates the following document:
# <doc>
#	<list>
#		<item></item>
#	</list>
# </doc>
#
# without the explicit formating characters the document would be:
# <doc><list><item></item></list></doc>
...
				

  

**Example�1.3.�Using script variables in path**

...
# accessing the attribute of second item in list
$var(my\_list) = "list";
$var(my\_idx) = 1;
$var(my\_attr) = "sort";
xlog("$xml(my\_doc/doc/$var(my\_list)/item\[$var(my\_idx)\].attr/$var(my\_attr))\\n");
...