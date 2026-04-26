# XML Module Module Reference
<!-- generated-from: data/4.0/modules/xml-module.json
     generator-version: 0.1.0
     opensips-version: 4.0
     doc-type: module -->

Reference for the OpenSIPs 4.0 XML Module module. Read this file when configuring or debugging the XML Module module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Pseudo-Variables](#exported-pseudo-variables)
- [Configuration Examples](#configuration-examples)

## Overview

This module exposes a script variable that provides basic parsing and manipulation of XML documents or blocks of XML data. The variable provides ways to access entire XML elements, their text content or their attributes. You can modify the content and attributes as well as adding or removing nodes in the XML tree. The processing does not take into account any DTDs or schemas in terms of validation.

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

- `libxml2` — Most Linux and BSD distributions include libxml but the library can also be downloaded from: xmlsoft.org

## Exported Pseudo-Variables

### `$xml(path)`

This module exports the $xml(path) variable. The xml variables will be available to the process that created them from the moment they were initialized. They will not reset per message or per transaction. If you want to use them on a per message basis you should initialize them each time. Accessing elements and attributes is based on the tree representation of the XML document thus a complete path from the root node is required. The in-memory equivalent of an XML document is an "XML object" which must be initilized with a well-formed block of XML data before use. In consequence, the path must start with the object name, followed by any number of nodes leading to the desired element. The grammar that describes the path is: path = name | name(identifier)+(acces)? identifier = element(index)? element = /string | /$var index = [integer] | [$var] access = .val | .attr/string | .attr/$var In order to select between nodes with identical names on a certain level in the tree, an index can be provided, starting from 0. The sequence of nodes in the path can be followed by .val in order to access the last node's text content or by .attr/attr_name in order to access it's attribute named attr_name. Otherwise the entire element (start-tag, end-tag, children elements and content) is accessed. Assiging NULL to the variable removes the entire element or it's text content or attribute acording to the access mode. If you want to insert an element, you must assign a string value (containg a well-formed block of XML data that has a root node) to the parent node. Note that assigning a value directly to a node does not replace it with that value. IMPORTANT: In XML all characters in the content of the document are significant including blanks and formatting line breaks. An element and it's content will be returned WITH all the whitespaces and newlines and when adding a new node under an existing one, if you want to insert it with indentation, you must include the needed characters in the assigned string. Other script variables can be used as element names, attribute names and indexes in the path. Variables that will be used as indexes must contain integer values. Variables that will be used as element or attribute names should contain string values.

- **Type:** string
- **Read/write:** read-write
- **Scope:** process

## Configuration Examples

### Creating a document

Creating a document

```opensips
$xml(my_doc) = "<doc></doc>";        # init object

$xml(my_doc/doc) = "<list></list>";  # add a "list" node

$xml(my_doc/doc/list) = "<item>some_value</item>";    # add an "item" node to the list

$xml(my_doc/doc/list) = "<item>another_value</item>"; # add another item to the list

$xml(my_doc/doc/list/item\[1\].val) = "new_val";        # set text content of previous item

$xml(my_doc/doc/list.attr/sort) = "asc";              # add attribute "sort" to list node

$xml(my_doc/doc/list.attr/sort) = NULL;               # remove previous attribute

$xml(my_doc/doc/list/item\[1\]) = NULL;                 # remove second item

$xml(my_doc/doc/list.val) = "end";                    # add text content to list which now has
                                                      # mixed content

$xml(my_doc/doc/list.val) = NULL;                     # remove the text content

xlog("$xml(my_doc/doc/list)\\n");                      # display the entire list

xlog("$xml(my_doc)\\n");                               # display the entire document

$xml(my_doc) = NULL;                                  # clear the entire document
```
### Inserting nodes with indentation

Inserting nodes with indentation

```opensips
$xml(my_doc) = "<doc>\\n</doc>";
$xml(my_doc/doc) = "\\t<list></list>\\n";
$xml(my_doc/doc/list) = "\\n\\t\\t<item></item>\\n\\t";

# this creates the following document:
# <doc>
#	<list>
#		<item></item>
#	</list>
# </doc>
#
# without the explicit formating characters the document would be:
# <doc><list><item></item></list></doc>
```
### Using script variables in path

Using script variables in path

```opensips
# accessing the attribute of second item in list
$var(my_list) = "list";
$var(my_idx) = 1;
$var(my_attr) = "sort";
xlog("$xml(my_doc/doc/$var(my_list)/item\[$var(my_idx)\].attr/$var(my_attr))\\n");
```
