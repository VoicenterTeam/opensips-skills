# Perl Virtual Database Module

---

**List of Tables**

3.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5603872)

3.2. [Most recently active contributors(1) to this module](#idp5699248)

## Chapter�1.�Admin Guide

## 1.1.�Overview

The Perl Virtual Database (VDB) provides a virtualization framework for OpenSIPS's database access. It does not handle a particular database engine itself but lets the user relay database requests to arbitrary Perl functions.

This module cannot be used "out of the box". The user has to supply functionality dedicated to the client module. See below for options.

The module can be used in all current OpenSIPS modules that need database access. Relaying of insert, update, query and delete operations is supported.

Modules can be configured to use the db\_perlvdb module as database backend using the db\_url\_parameter:

modparam("acc", "db\_url", "perlvdb:OpenSIPS::VDB::Adapter::AccountingSIPtrace")

This configuration options tells acc module that it should use the db\_perlvdb module which will in turn use the Perl class OpenSIPS::VDB::Adapter::AccountingSIPtrace to relay the database requests.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _perl_ -- Perl module
    

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _None_ (Besides the ones mentioned in the perl module documentation).
    

## 1.3.�Exported Parameters

_None_.

## 1.4.�Exported Functions

_None_.

## Chapter�2.�Developer Guide

## 2.1.�Introduction

OpenSIPS uses a database API for requests of numerous different types of data. Four primary operations are supported:

*   query
    
*   insert
    
*   update
    
*   delete
    

This module relays these database requests to user implemented Perl functions.

## 2.2.�Base class OpenSIPS::VDB

A client module has to be configured to use the db\_perlvdb module in conjunction with a Perl class to provide the functions. The configured class needs to inherit from the base class `OpenSIPS::VDB`.

Derived classes have to implement the necessary functions "query", "insert", "update" and/or "delete". The client module specifies the necessary functions. To find out which functions are called from a module, its processes may be evaluated with the `OpenSIPS::VDB::Adapter::Describe` class which will log incoming requests (without actually providing any real functionality).

While users can directly implement their desired functionality in a class derived from OpenSIPS::VDB, it is advisable to split the implementation into an Adapter that transforms the relational structured parameters into pure Perl function arguments, and add a virtual table (VTab) to provide the relaying to an underlying technology.

## 2.3.�Data types

Before introducing the higher level concepts of this module, the used datatypes will briefly be explained. The OpenSIPS Perl library includes some data types that have to be used in this module:

### 2.3.1.�OpenSIPS::VDB::Value

A value includes a data type flag and a value. Valid data types are DB\_INT, DB\_DOUBLE, DB\_STRING, DB\_STR, DB\_DATETIME, DB\_BLOB, DB\_BITMAP. A new variable may be created with

my $val = new OpenSIPS::VDB::Value(DB\_STRING, "foobar");

Value objects contain the type() and data() methods to get or set the type and data attributes.

### 2.3.2.�OpenSIPS::VDB::Pair

The Pair class is derived from the Value class and additionally contains a column name (key). A new variable may be created with

my $pair = new OpenSIPS::VDB::Pair("foo", DB\_STRING, "bar");

where foo is the key and bar is the value. Additonally to the methods of the Value class, it contains a key() method to get or set the key attribute.

### 2.3.3.�OpenSIPS::VDB::ReqCond

The ReqCond class is used for select condition and is derived from the Pair class. It contains an addtional operator attribute. A new variable may be created with

my $cond = new OpenSIPS::VDB::ReqCond("foo", ">", DB\_INT, 5);

where foo is the key, "greater" is the operator and 5 is the value to compare. Additonally to the methods of the Pair class, it contains an op() method to get or set the operator attribute.

### 2.3.4.�OpenSIPS::VDB::Column

This class represents a column definition or database schema. It contains an array for the column names and an array for the column types. Both arrays need to have the same length. A new variable may be created with

my @types = { DB\_INT, DB\_STRING };
my @names = { "id", "vals" };
my $cols = new OpenSIPS::VDB::Column(\\@types, \\@names);

The class contains the methods type() and name() to get or set the type and name arrays.

### 2.3.5.�OpenSIPS::VDB::Result

The Result class represents a query result. It contains a schema (class Column) and an array of rows, where each row is an array of Values. The object methods coldefs() and rows() may be used to get and set the object attributes.

## 2.4.�Adapters

Adapters should be used to turn the relational structured database request into pure Perl function arguments. The alias\_db function alias\_db\_lookup for example takes a user/host pair, and turns it into another user/host pair. The Alias adapter turns the ReqCond array into two separate scalars that are used as parameters for a VTab call.

Adapter classes have to inherit from the OpenSIPS::VDB base class and may provide one or more functions with the names insert, update, replace, query and/or delete, depending on the module which is to be used with the adapter. While modules such as alias\_db only require a query function, others -- such as siptrace -- depend on inserts only.

### 2.4.1.�Function parameters

The implemented functions need to deal with the correct data types. The parameter and return types are listed in this section.

_insert()_ is passed an array of OpenSIPS::VDB::Pair objects. It should return an integer value.

_replace()_ is passed an array of OpenSIPS::VDB::Pair objects. This function is currently not used by any publicly available modules. It should return an integer value.

_delete()_ is passed an array of OpenSIPS::VDB::ReqCond objects. It should return an integer value.

_update()_ is passed an array of OpenSIPS::VDB::ReqCond objects (which rows to update) and an array of OpenSIPS::VDB::Pair objects (new data). It should return an integer value.

_query()_ is passed an array of OpenSIPS::VDB::ReqCond objects (which rows to select), an array of strings (which column names to return) and a single string by which column to sort. It should return an object of type OpenSIPS::VDB::Result.

## 2.5.�VTabs

VTabs (virtual tables) provide a particular implementation for an adapter. The Alias adapter e.g. calls a function with two parameters (user, host) and expects a hash to be returned with the two elements username and domain, or undef (when no result is found). A sample VTab implementation for the Alias adapter demonstrates this technique with a Perl hash that contains the alias data.

The standard Adapter/VTab pattern lets the user choose between three options on how to implement VTabs:

*   _Single function_. When a function is used as a virtual table, it is passed the operation name (insert, replace, update, query, delete) as its first parameter. The function may be implemented in the main namespace.
    

*   _Package/class_. The defined class needs to have an init() function. It will be called during the first call of that VTab. Addtionally, the package has to define the necessary functions insert, replace, update, delete and/or query. These functions will be called in a function context (first parameter is the class name).
    

*   _Object_. The defined class needs to have a new() function which will return a reference to the newly created object. This object needs to define the necessary functions insert, replace, update, delete and/or query. These functions will be called in a method context (first parameter is a reference to the object).
    

## Chapter�3.�Contributors

## 3.1.�By Commit Statistics

**Table�3.1.�Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)**

�

Name

DevScore

Commits

Lines ++

Lines --

1.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

26

19

257

202

2.

Bastian Friedrich

18

2

1820

18

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

14

12

25

57

4.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

11

9

27

14

5.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

9

7

27

25

6.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

5

3

5

21

7.

Henning Westerholt ([@henningw](https://github.com/henningw))

4

2

14

13

8.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

4

2

10

10

9.

Ancuta Onofrei

3

1

13

20

10.

Konstantin Bokarius

3

1

3

5

  

**All remaining contributors**: Juli�n Moreno Pati�o, Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Edson Gellert Schubert.

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 3.2.�By Commit Activity

**Table�3.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Mar 2014 - May 2024

2.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Aug 2015 - Aug 2023

3.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Oct 2022 - Feb 2023

4.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Jul 2007 - Apr 2019

5.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Apr 2019

6.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

7.

Juli�n Moreno Pati�o

Feb 2016 - Feb 2016

8.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

Oct 2007 - Mar 2008

9.

Konstantin Bokarius

Mar 2008 - Mar 2008

10.

Edson Gellert Schubert

Feb 2008 - Feb 2008

  

**All remaining contributors**: Henning Westerholt ([@henningw](https://github.com/henningw)), Ancuta Onofrei, Bastian Friedrich.

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�4.�Documentation

## 4.1.�Contributors

**Last edited by:** Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Bastian Friedrich.

_Documentation Copyrights:_

Copyright � 2007 Collax GmbH