# JSON-RPC Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5619568)

2.2. [Most recently active contributors(1) to this module](#idp5705568)

**List of Examples**

1.1. [Set `connect_timeout` parameter](#idp4198576)

1.2. [Set `write_timeout` parameter](#idp208544)

1.3. [Set `read_timeout` parameter](#idp165168)

1.4. [`jsonrpc_request()` function usage](#idp5579248)

1.5. [`jsonrpc_notification()` function usage](#idp5598672)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This module is an implementation of an JSON-RPC v2.0 client [http://www.jsonrpc.org/specification](http://www.jsonrpc.org/specification). that can send a call to a JSON-RPC server over a TCP connection.

NOTE that the current version of this module does not support TCP connection reusage, nor asynchronous commands.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _none_.
    

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _none_
    

## 1.3.�Exported Parameters

### 1.3.1.�`connect_timeout` (integer)

The amount of milliseconds OpenSIPS waits to connect to the the JSON-RPC server, until it times out.

_Default value is “500 milliseconds”._

**Example�1.1.�Set `connect_timeout` parameter**

...
modparam("jsonrpc", "connect\_timeout", 200)
...

  

### 1.3.2.�`write_timeout` (integer)

The amount of milliseconds OpenSIPS waits to send a RPC command to the JSON-RPC server, until it times out.

_Default value is “500 milliseconds”._

**Example�1.2.�Set `write_timeout` parameter**

...
modparam("jsonrpc", "write\_timeout", 300)
...

  

### 1.3.3.�`read_timeout` (integer)

The amount of milliseconds OpenSIPS waits for the JSON-RPC server to respond to a JSON-RPC request, until it times out. Note that these parameter only affects the _jsonrpc\_request_ command.

_Default value is “500 milliseconds”._

**Example�1.3.�Set `read_timeout` parameter**

...
modparam("jsonrpc", "read\_timeout", 300)
...

  

## 1.4.�Exported Functions

### 1.4.1.� `jsonrpc_request(destination, method, params, ret_var)`

Does a JSON-RPC request to the JSON-RPC server indicated in the _destination_ parameter, and waits for a reply from it.

This function can be used from any route.

The function has the following parameters:

*   _destination_ (string) - address of the JSON-RPC server. The format needs to be _IP:port_.
    
*   _method_ (string) - the method used in the RPC request.
    
*   _params_ (string) - these are the parameters sent to the RPC method. This parameter needs to be a properly formated JSON array, or JSON object, according the the JSON-RPC specifications.
    
*   _ret\_var_ a writeable variable used to store the result of the JSON-RPC command. If the command returns an error, the variable will be populated with the error JSON, otherwise, with the body of the JSON-RPC result.
    

The function has the following return codes:

*   _1_ - JSON-RPC command executed successfully, and the server returned success. You can check the _ret\_pvar_ variable for the result.
    
*   _\-1_ - There was an internal error during processing.
    
*   _\-2_ - There was a connection (timeout or connect) error with the destination.
    
*   _\-3_ - The JSON-RPC was successfully run, but the server returned an error. Check the _ret\_pvar_ value to find out more information.
    

**Example�1.4.�`jsonrpc_request()` function usage**

	...
	if (!jsonrpc\_request("127.0.0.1", "add", "\[1,2\]", $var(ret))) {
		xlog("JSON-RPC command failed with $var(ret)\\n");
		exit;
	}
	xlog(JSON-RPC command returned $var(ret)\\n");
	# parse $var(ret) as JSON, or whatever the function returns
	...
	

  

### 1.4.2.� `jsonrpc_notification(destination, method, params)`

Does a JSON-RPC notification to the JSON-RPC server indicated in the _destination_ parameter, but unlike [jsonrpc\_request()](#func_jsonrpc_request "1.4.1.� jsonrpc_request(destination, method, params, ret_var)"), it does not wait for a reply from the JSON-RPC server.

This function can be used from any route.

The function receives the same parameters as [jsonrpc\_request()](#func_jsonrpc_request "1.4.1.� jsonrpc_request(destination, method, params, ret_var)"), except for the _ret\_pvar_. Also, the same values are returned.

**Example�1.5.�`jsonrpc_notification()` function usage**

	...
	if (!jsonrpc\_notification("127.0.0.1", "block\_ip", "{ \\"ip": \\"$si\\" }")) {
		xlog("JSON-RPC notification failed with $rc!\\n");
		exit;
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

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

16

7

931

11

2.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

6

4

16

32

3.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

6

2

33

128

4.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

5

3

4

2

5.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

3

1

3

3

6.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

3

1

1

1

7.

rdondeti

2

1

12

0

  

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 2.2.�By Commit Activity

**Table�2.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

rdondeti

Mar 2026 - Mar 2026

2.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Dec 2018 - Apr 2023

3.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Feb 2023

4.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Mar 2018 - Nov 2019

5.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

Apr 2019 - Apr 2019

6.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Apr 2018 - Nov 2018

7.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)).

_Documentation Copyrights:_

Copyright � 2018 [www.opensips-solutions.com](http://www.opensips-solutions.com/)