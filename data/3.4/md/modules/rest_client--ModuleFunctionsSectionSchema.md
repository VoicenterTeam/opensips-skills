## 1.5.�Exported Functions

### 1.5.1.� `rest_get(url, body_pv, [ctype_pv], [retcode_pv])`

Perform a blocking HTTP GET on the given _url_ and return a representation of the resource.

Parameters:

*   _url_ (string)
    
*   _body\_pv_ (var) - output variable which will hold the body of the HTTP response.
    
*   _ctype\_pv_ (var, optional) - output variable which will contain the value of the "Content-Type:" header of the response.
    
*   _retcode\_pv_ (var, optional) - output variable which will retain the status code of the HTTP response. A **0** status code value means no HTTP reply arrived at all.
    

**Return Codes**

*   **1** - Success
    
*   **\-1** - Connection Refused.
    
*   **\-2** - Connection Timeout (the [connection\_timeout](#param_connection_timeout "1.4.2.�connection_timeout (integer)") was exceeded before a TCP connection could be established)
    
*   **\-3** - Transfer Timeout (the [curl\_timeout](#param_curl_timeout "1.4.1.�curl_timeout (integer)") was exceeded before the last byte was received). The _retcode\_pv_ may be set to 200 or 0, depending whether a 200 OK was received or not. If it was, the _body\_pv_ will contain partially downloaded data, use at your own risk! (we recommend you only use this data for logging / debugging purposes)
    
*   **\-4** - Already Connecting (another OpenSIPS worker is already connecting to this URL hostname. Consult [no\_concurrent\_connects](#param_no_concurrent_connects "1.4.11.�no_concurrent_connects (boolean)") for more info).
    
*   **\-10** - Internal Error (out of memory, unexpected libcurl error, etc.)
    

This function can be used from any route.

**Example�1.13.�`rest_get` usage**

...
# Example of querying a REST service to get the credit of an account
$var(rc) = rest\_get("https://getcredit.org/?account=$fU",
                    $var(credit),
                    $var(ct),
                    $var(rcode));
if ($var(rc) < 0) {
	xlog("rest\_get() failed with $var(rc), acc=$fU\\n");
	send\_reply(500, "Server Internal Error");
	exit;
}

if ($var(rcode) != 200) {
	xlog("L\_INFO", "rest\_get() rcode=$var(rcode), acc=$fU\\n");
	send\_reply(403, "Forbidden");
	exit;
}
...

  

### 1.5.2.� `rest_post(url, send_body, [send_ctype], recv_body_pv, [recv_ctype_pv], [retcode_pv])`

Perform a blocking HTTP POST on the given _url_.

Note that the _send\_body_ parameter can also accept a format-string but it cannot be larger than 1024 bytes. For larger messages, you must build them in a pseudo-variable and pass it to the function.

Parameters:

*   _url_ (string)
    
*   _send\_body_ (string) - The request body.
    
*   _send\_ctype_ (string, optional) - The MIME Content-Type header for the request. The default is _"application/x-www-form-urlencoded"_
    
*   _recv\_body\_pv_ (var) - output variable which will hold the body of the HTTP response.
    
*   _recv\_ctype\_pv_ (var, optional) - output variable which will contain the value of the "Content-Type" header of the response
    
*   _retcode\_pv_ (var, optional) - output variable which will retain the status code of the HTTP response. A **0** status code value means no HTTP reply arrived at all.
    

**Return Codes**

*   **1** - Success
    
*   **\-1** - Connection Refused.
    
*   **\-2** - Connection Timeout (the [connection\_timeout](#param_connection_timeout "1.4.2.�connection_timeout (integer)") was exceeded before a TCP connection could be established)
    
*   **\-3** - Transfer Timeout (the [curl\_timeout](#param_curl_timeout "1.4.1.�curl_timeout (integer)") was exceeded before the last byte was received). The _retcode\_pv_ may be set to 200 or 0, depending whether a 200 OK was received or not. If it was, the _body\_pv_ will contain partially downloaded data, use at your own risk! (we recommend you only use this data for logging / debugging purposes)
    
*   **\-4** - Already Connecting (another OpenSIPS worker is already connecting to this URL hostname. Consult [no\_concurrent\_connects](#param_no_concurrent_connects "1.4.11.�no_concurrent_connects (boolean)") for more info).
    
*   **\-10** - Internal Error (out of memory, unexpected libcurl error, etc.)
    

This function can be used from any route.

**Example�1.14.�`rest_post` usage**

...
# Creating a resource using a RESTful service with an HTTP POST request
$var(rc) = rest\_post("https://myserver.org/register\_user",
                     $fU, , $var(body), $var(ct), $var(rcode));
if ($var(rc) < 0) {
	xlog("rest\_post() failed with $var(rc), user=$fU\\n");
	send\_reply(500, "Server Internal Error 1");
	exit;
}

if ($var(rcode) != 200) {
	xlog("rest\_post() rcode=$var(rcode), user=$fU\\n");
	send\_reply(500, "Server Internal Error 2");
	exit;
}
...

  

### 1.5.3.� `rest_put(url, send_body, [send_ctype], recv_body_pv[, [recv_ctype_pv][, [retcode_pv]]])`

Perform a blocking HTTP PUT on the given _url_.

Similar to [rest\_post()](#func_rest_post "1.5.2.� rest_post(url, send_body, [send_ctype], recv_body_pv, [recv_ctype_pv], [retcode_pv])"), the _send\_body\_pv_ parameter can also accept a format-string but it cannot be larger than 1024 bytes. For larger messages, you must build them in a pseudo-variable and pass it to the function.

Parameters:

*   _url_ (string)
    
*   _send\_body_ (string) - The request body.
    
*   _send\_ctype_ (string, optional) - The MIME Content-Type header for the request. The default is _"application/x-www-form-urlencoded"_
    
*   _recv\_body\_pv_ (var) - output variable which will hold the body of the HTTP response.
    
*   _recv\_ctype\_pv_ (var, optional) - output variable which will contain the value of the "Content-Type" header of the response
    
*   _retcode\_pv_ (var, optional) - output variable which will retain the status code of the HTTP response. A **0** status code value means no HTTP reply arrived at all.
    

**Return Codes**

*   **1** - Success
    
*   **\-1** - Connection Refused.
    
*   **\-2** - Connection Timeout (the [connection\_timeout](#param_connection_timeout "1.4.2.�connection_timeout (integer)") was exceeded before a TCP connection could be established)
    
*   **\-3** - Transfer Timeout (the [curl\_timeout](#param_curl_timeout "1.4.1.�curl_timeout (integer)") was exceeded before the last byte was received). The _retcode\_pv_ may be set to 200 or 0, depending whether a 200 OK was received or not. If it was, the _body\_pv_ will contain partially downloaded data, use at your own risk! (we recommend you only use this data for logging / debugging purposes)
    
*   **\-4** - Already Connecting (another OpenSIPS worker is already connecting to this URL hostname. Consult [no\_concurrent\_connects](#param_no_concurrent_connects "1.4.11.�no_concurrent_connects (boolean)") for more info).
    
*   **\-10** - Internal Error (out of memory, unexpected libcurl error, etc.)
    

This function can be used from any route.

**Example�1.15.�`rest_put` usage**

...
# Creating/Updating a resource using a RESTful service with an HTTP PUT request
$var(rc) = rest\_put("https://myserver.org/users/$fU",
                    $var(userinfo), , $var(body), $var(ct), $var(rcode));
if ($var(rc) < 0) {
	xlog("rest\_put() failed with $var(rc), user=$fU\\n");
	send\_reply(500, "Server Internal Error 3");
	exit;
}

if ($var(rcode) != 200) {
	xlog("rest\_put() rcode=$var(rcode), user=$fU\\n");
	send\_reply(500, "Server Internal Error 4");
	exit;
}
...

  

### 1.5.4.� `rest_append_hf(txt)`

Append _txt_ to the HTTP headers of the subsequent request. Multiple headers can be appended by making multiple calls before executing a request.

The contents of _txt_ should adhere to the specification for HTTP headers (ex. Field: Value)

Parameters

*   _txt_ (string)
    

This function can be used from any route.

**Example�1.16.�`rest_append_hf` usage**

...
# Example of querying a REST service requiring additional headers

rest\_append\_hf("Authorization: Bearer mF\_9.B5f-4.1JqM");
$var(rc) = rest\_get("http://getcredit.org/?account=$fU", $var(credit));
...
		

  

### 1.5.5.� `rest_init_client_tls(tls_client_domain)`

Force a specific TLS domain to be used at most once, during the next GET/POST/PUT request. Refer to the tls\_mgm module for additional info regarding TLS client domains.

If using this function, you must also ensure that tls\_mgm is loaded and properly configured.

Parameters

*   _tls\_client\_domain_ (string)
    

This function can be used from any route.

**Example�1.17.�`rest_init_client_tls` usage**

...
rest\_init\_client\_tls("dom1");
if (!rest\_get("https://example.com"))
    xlog("query failed\\n");
...