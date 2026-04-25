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