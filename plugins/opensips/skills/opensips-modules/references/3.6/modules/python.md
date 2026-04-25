# python Module Reference
<!-- generated-from: data/3.6/modules/python.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 python module. Read this file when configuring or debugging the python module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Configuration Examples](#configuration-examples)

## Overview

This module can be used to efficiently run Python code directly from the OpenSIPS script, without executing the _python_ interpreter.

The module provides the means to load a python module and run its functions. Each function has to receive the SIP message as parameter, and optionally some extra arguments passed from the script.

## How It Works

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

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

- `python-dev` — provides the Python bindings

## Exported Parameters

### `child_init_method` (string)

The method called for each child process.

*Default value is child_init.*

**Example.** child_initializer.

```opensips
modparam("python", "child\_init\_method", "child\_initializer")
```
### `mod_init_function` (string)

The method used to initialize the Python module and return the object.

*Default value is mod_init.*

**Example.** module_initializer.

```opensips
modparam("python", "mod\_init\_function", "module\_initializer")
```
### `script_name` (string)

The script that contains the Python module.

*Default value is /usr/local/etc/opensips/handler.py.*

**Example.** /usr/local/bin/opensips_handler.py.

```opensips
modparam("python", "script\_name", "/usr/local/bin/opensips\_handler.py")
```

## Exported Functions

### `python_exec(method_name [, extra_args])`

This function is used to execute a method from the Python module loaded.

**Parameters:**

- `extra_args` *(string, optional)* — extra arguments that can be passed from the script to the python function.
- `method_name` *(string, required)* — name of the method called

**Usable from:** REQUEST_ROUTE, ONREPLY_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE

## Configuration Examples

### Set `script_name` parameter

Sets the script_name parameter to a specific path.

```opensips
...
modparam("python", "script\_name", "/usr/local/bin/opensips\_handler.py")
...
```
### Set `mod_init_function` parameter

Sets the mod_init_function parameter.

```opensips
...
modparam("python", "mod\_init\_function", "module\_initializer")
...
```
### Set `child_init_method` parameter

Sets the child_init_method parameter.

```opensips
...
modparam("python", "child\_init\_method", "child\_initializer")
...
```
