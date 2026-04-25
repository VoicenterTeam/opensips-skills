# Python Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5926096)

2.2. [Most recently active contributors(1) to this module](#idp6010976)

**List of Examples**

1.1. [Set `script_name` parameter](#idp5884576)

1.2. [Set `mod_init_function` parameter](#idp5889488)

1.3. [Set `child_init_method` parameter](#idp5894384)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This module can be used to efficiently run Python code directly from the OpenSIPS script, without executing the _python_ interpreter.

The module provides the means to load a python module and run its functions. Each function has to receive the SIP message as parameter, and optionally some extra arguments passed from the script.

In order to run Python functions, one has to load the module that contains them, by specifying the script name using the _script\_name_ parameter. The module has to contain the following components:

*   A class that contains all the methods that can be invoked from the script.
    
*   A method within the class that is called when a SIP child is created. The method should receive an integer parameter, which represents the rank of the child, and must return 0 or positive in case the function was executed successfully, or negative otherwise. The name of this method is specified by the _child\_init\_method_ parameter.
    
*   A global function that initializes the Python module and returns an object from the class whose functions will be invoked by the script. The name of the global function is indicated by the _mod\_init\_method_ parameter.
    

A minimal example of a Python script that satisfies these requirements is:

	def mod\_init():
		return SIPMsg()

	class SIPMsg:
        def child\_init(self, rank):
	        return 0
		

A function from the object returned above can be executed from the script using the _python\_exec()_ script function. The python method has to receive the following parameters:

*   The SIP message, that has the structure detailed below
    
*   Optionally, a string passed from the script
    

The SIP message received as parameter by the function has the following fields and methods:

*   _Type_ - the type of the message, either _SIP\_REQUEST_ or _SIP\_REPLY_
    
*   _Method_ - the method of the message
    
*   _Status_ - the status of the message, available only for replies
    
*   _RURI_ - the R-URI of the message, available only for requests
    
*   _src\_address_ - the (IP, port) tuple representing source address of the message
    
*   _dst\_address_ - the (IP, port) tuple representing the destination address (OpenSIPS address) of the message
    
*   _copy()_ - copies the current SIP message in a new object
    
*   _rewrite\_ruri()_ - changes the R-URI of the message; available only for requests
    
*   _set\_dst\_uri()_ - sets the destination URI of the message; available only for requests
    
*   _getHeader()_ - returns the header of a message
    
*   _call\_function()_ - calls built-in script function or function exported by other module
    
*   _get\_pseudoVar(name)_ - returns the value of the the pseudo-variable specified by the _name_ as Unicode string.
    
*   _set\_pseudoVar(name, value)_ - sets pseudo-variable using Unicode string _value_.
    

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _None_.
    

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _python-dev_ - provides the Python bindings.
    

## 1.3.�Exported Parameters

### 1.3.1.�`script_name` (string)

The script that contains the Python module.

_Default value is “/usr/local/etc/opensips/handler.py”._

**Example�1.1.�Set `script_name` parameter**

...
modparam("python", "script\_name", "/usr/local/bin/opensips\_handler.py")
...

  

### 1.3.2.�`mod_init_function` (string)

The method used to initialize the Python module and return the object.

_Default value is “mod\_init”._

**Example�1.2.�Set `mod_init_function` parameter**

...
modparam("python", "mod\_init\_function", "module\_initializer")
...

  

### 1.3.3.�`child_init_method` (string)

The method called for each child process.

_Default value is “child\_init”._

**Example�1.3.�Set `child_init_method` parameter**

...
modparam("python", "child\_init\_method", "child\_initializer")
...

  

## 1.4.�Exported Functions

### 1.4.1.� `python_exec(method_name [, extra_args])`

This function is used to execute a method from the Python module loaded.

This function can be used from REQUEST\_ROUTE, ONREPLY\_ROUTE, FAILURE\_ROUTE and BRANCH\_ROUTE.

Meaning of the parameters is as follows:

*   _method\_name_ (string) - name of the method called
    
*   _extra\_args_ (string, optional) - extra arguments that can be passed from the script to the python function.
    

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

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

24

11

1321

25

2.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

21

14

502

101

3.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

13

9

204

113

4.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

9

6

30

61

5.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

6

4

36

48

6.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

5

3

7

7

7.

importos

3

1

104

4

  

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 2.2.�By Commit Activity

**Table�2.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Mar 2015 - Sep 2025

2.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Aug 2025

3.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Dec 2009 - Oct 2024

4.

importos

Nov 2020 - Nov 2020

5.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Jul 2014 - Jan 2020

6.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Nov 2019

7.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Oct 2014 - Apr 2019

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** importos, Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)).

_Documentation Copyrights:_

Copyright � 2009 Sippy Software, Inc.