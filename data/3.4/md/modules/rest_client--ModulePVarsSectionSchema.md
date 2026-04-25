# rest\_client Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5894192)

2.2. [Most recently active contributors(1) to this module](#idp5996512)

**List of Examples**

1.1. [Setting the `curl_timeout` parameter](#idp260848)

1.2. [Setting the `connection_timeout` parameter](#idp5518016)

1.3. [Setting the `connect_poll_interval` parameter](#idp5523552)

1.4. [Setting the `max_async_transfers` parameter](#idp5528992)

1.5. [Setting the `max_transfer_size` parameter](#idp5534656)

1.6. [Setting the `ssl_verifypeer` parameter](#idp5539664)

1.7. [Setting the `ssl_verifyhost` parameter](#idp5544640)

1.8. [Setting the `ssl_capath` parameter](#idp5548400)

1.9. [Setting the `curl_http_version` parameter](#idp5559968)

1.10. [Setting the `enable_expect_100` parameter](#idp5565072)

1.11. [Setting the `no_concurrent_connects` parameter](#idp5572480)

1.12. [Setting the `curl_conn_lifetime` parameter](#idp251696)

1.13. [`rest_get` usage](#idp5615504)

1.14. [`rest_post` usage](#idp5643216)

1.15. [`rest_put` usage](#idp5678544)

1.16. [`rest_append_hf` usage](#idp5687696)

1.17. [`rest_init_client_tls` usage](#idp5694928)

1.18. [`async rest_get` usage](#idp5701120)

1.19. [`async rest_post` usage](#idp5707776)

1.20. [`async rest_put` usage](#idp5714512)

1.21. [`rest.escape` usage](#idp5722656)

1.22. [`rest.unescape` usage](#idp5727728)

## Chapter�1.�Admin Guide

## 1.1.�Overview

The _rest\_client_ module provides a means of interacting with an HTTP server by doing RESTful queries, such as GET, POST and PUT.

## 1.2.�TCP Connection Reusage

Unless specified otherwise by the server through a "Connection: close" indication, the module will keep and reuse the TCP connections it creates as much as possible, regardless if the script writer performs blocking or asynchronous HTTP requests. These connections are not shared among OpenSIPS workers — each worker maintains its own set of connections.

## 1.3.�Dependencies

### 1.3.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _No dependencies on other OpenSIPS modules._.
    

### 1.3.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _libcurl_.
    

## 1.4.�Exported Parameters

### 1.4.1.�`curl_timeout` (integer)

The maximum allowed time for any HTTP(S) transfer to complete. This interval is inclusive of the initial connect time window, hence the value of this parameter must be greater than or equal to [connection\_timeout](#param_connection_timeout "1.4.2.�connection_timeout (integer)").

_Default value is “20” seconds._

**Example�1.1.�Setting the `curl_timeout` parameter**

...
modparam("rest\_client", "curl\_timeout", 10)
...

  

### 1.4.2.�`connection_timeout` (integer)

The maximum allowed time to establish a connection with the server.

_Default value is “20” seconds._

**Example�1.2.�Setting the `connection_timeout` parameter**

...
modparam("rest\_client", "connection\_timeout", 4)
...

  

### 1.4.3.�`connect_poll_interval` (integer)

Only relevant with async requests. Allows complete control over how quickly we want to detect libcurl's completed blocking TCP/TLS handshakes, so the async transfers can be put in the background. A lower [connect\_poll\_interval](#param_connect_poll_interval "1.4.3.�connect_poll_interval (integer)") may speed up all async HTTP transfers, but will also increase CPU usage.

_Default value is “20” milliseconds._

**Example�1.3.�Setting the `connect_poll_interval` parameter**

...
modparam("rest\_client", "connect\_poll\_interval", 2)
...

  

### 1.4.4.�`max_async_transfers` (integer)

Maximum number of asynchronous HTTP transfers _a single_ OpenSIPS worker is allowed to run simultaneously. As long as this threshold is reached for a worker, all new async transfers it attempts to perform will be done in a blocking manner, with appropriate logging warnings.

_Default value is “100”._

**Example�1.4.�Setting the `max_async_transfers` parameter**

...
modparam("rest\_client", "max\_async\_transfers", 300)
...

  

### 1.4.5.�`max_transfer_size` (integer)

The maximum allowed size of a single transfer (download). Reaching this limit during a transfer will cause the transfer to stop immediately, returning error -10 at script level. A value of **0** will disable the check.

_Default value is “10240” (KB)._

**Example�1.5.�Setting the `max_transfer_size` parameter**

...
modparam("rest\_client", "max\_transfer\_size", 64)
...

  

### 1.4.6.�`ssl_verifypeer` (integer)

Set this to 0 in order to disable the verification of the remote peer's certificate. Verification is done using a default bundle of CA certificates which come with libcurl.

_Default value is “1” (enabled)._

**Example�1.6.�Setting the `ssl_verifypeer` parameter**

...
modparam("rest\_client", "ssl\_verifypeer", 0)
...

  

### 1.4.7.�`ssl_verifyhost` (integer)

Set this to 0 in order to disable the verification that the remote peer actually corresponds to the server listed in the certificate.

_Default value is “1” (enabled)._

**Example�1.7.�Setting the `ssl_verifyhost` parameter**

...
modparam("rest\_client", "ssl\_verifyhost", 0)
...

  

### 1.4.8.�`ssl_capath` (integer)

An optional path for CA certificates to be used for host verifications.

**Example�1.8.�Setting the `ssl_capath` parameter**

...
modparam("rest\_client", "ssl\_capath", "/home/opensips/ca\_certificates")
...

  

### 1.4.9.�`curl_http_version` (integer)

Use a specific HTTP version for all requests. Possible values:

*   0 (default) - use whatever is deemed fit by libcurl
    
*   1 - enforce HTTP 1.0 requests
    
*   2 - enforce HTTP 1.1 requests
    
*   3 - attempt HTTP 2 requests. Fall back to HTTP 1.1 if HTTP 2 cannot be negotiated with the server. Requires libcurl 7.33.0+.
    
*   4 - attempt HTTP 2 over TLS (HTTPS) only. Fall back to HTTP 1.1 if HTTP 2 cannot be negotiated with the HTTPS server. For clear text HTTP servers, use HTTP 1.1. Requires libcurl 7.47.0+.
    
*   5 - Issue non-TLS HTTP requests using HTTP 2 without HTTP 1.1 Upgrade. It requires prior knowledge that the server supports HTTP 2 straight away. HTTPS requests will still do HTTP/2 the standard way with negotiated protocol version in the TLS handshake. Requires libcurl 7.49.0+.
    

_more details [_here_](https://curl.haxx.se/libcurl/c/CURLOPT_HTTP_VERSION.html), where the documentation for this setting was inspired (read: pilfered) from_

**Example�1.9.�Setting the `curl_http_version` parameter**

...
modparam("rest\_client", "curl\_http\_version", 3)
...

  

### 1.4.10.�`enable_expect_100` (boolean)

Include a "Expect: 100-continue" HTTP header field whenever the body size of a POST or PUT request exceeds 1024 bytes. Once enabled, the timeout for waiting for a "100 Continue" reply from the server is 1 second, after which the body upload will begin.

_Default value is “false” (disabled)._

**Example�1.10.�Setting the `enable_expect_100` parameter**

...
modparam("rest\_client", "enable\_expect\_100", true)
...

  

### 1.4.11.�`no_concurrent_connects` (boolean)

Set to _true_ in order to only allow one OpenSIPS worker to connect to a given URL hostname at a time. While a worker is connecting, all other workers will receive error code **\-4 (already connecting)** when attempting to perform any rest\_client operation to the same hostname, regardless if the operation is sync or async.

For sync transfers, the scope of the worker process serialization extends to the entire cURL transfer (TCP connect + upload + download), as all three phases take place within a single cURL library call.

This parameter may be useful in order to prevent system outages caused by concurrent blocking of all OpenSIPS workers on a failed (hanging) HTTP service, with no more free workers being left to process incoming SIP packets.

_Default value is “false” (disabled)._

**Example�1.11.�Setting the `no_concurrent_connects` parameter**

...
modparam("rest\_client", "no\_concurrent\_connects", true)
...

  

### 1.4.12.�`curl_conn_lifetime` (integer)

Only relevant when [no\_concurrent\_connects](#param_no_concurrent_connects "1.4.11.�no_concurrent_connects (boolean)") is enabled. By setting this parameter, script developers can leverage the connection reusage capabilities of libcURL and entirely skip the "no concurrent transfers" logic on a given SIP worker, should that worker already be known to have a TCP connection to the target URL hostname (established by a previous rest\_xxx() function call).

The parameter denotes the lifetime, in seconds, of TCP connections kept within libcURL for reusage, a setting which is often operating system dependant, and which may also be affected by enabling/disabling keepalives. Consult your operating system's and/or libcurl's documentation for further information on the max lifetime of your cURL TCP connections.

_Default value is _0_ (disabled)._

**Example�1.12.�Setting the `curl_conn_lifetime` parameter**

...
modparam("rest\_client", "curl\_conn\_lifetime", 1800)
...

  

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
		

  

## 1.6.�Exported Asynchronous Functions

### 1.6.1.� `rest_get(url, body_pv[, [ctype_pv][, [retcode_pv]]])`

Perform an asynchronous HTTP GET. This function behaves exactly the same as **[rest\_get()](#func_rest_get "1.5.1.� rest_get(url, body_pv, [ctype_pv], [retcode_pv])")** (in terms of input, output and processing), but in a non-blocking manner. Script execution is suspended until the entire content of the HTTP response is available.

**Example�1.18.�`async rest_get` usage**

route {
	...
	async(rest\_get("http://getcredit.org/?account=$fU",
	               $var(credit), , $var(rcode)), resume);
}

route \[resume\] {
	$var(rc) = $rc;
	if ($var(rc) < 0) {
		xlog("async rest\_get() failed with $var(rc), acc=$fU\\n");
		send\_reply(500, "Server Internal Error");
		exit;
	}

	if ($var(rcode) != 200) {
		xlog("L\_INFO", "async rest\_get() rcode=$var(rcode), acc=$fU\\n");
		send\_reply(403, "Forbidden");
		exit;
	}

	...
}

  

### 1.6.2.� `rest_post(url, send_body_pv, [send_ctype_pv], recv_body_pv[, [recv_ctype_pv][, [retcode_pv]]])`

Perform an asynchronous HTTP POST. This function behaves exactly the same as **[rest\_post()](#func_rest_post "1.5.2.� rest_post(url, send_body, [send_ctype], recv_body_pv, [recv_ctype_pv], [retcode_pv])")** (in terms of input, output and processing), but in a non-blocking manner. Script execution is suspended until the entire content of the HTTP response is available.

**Example�1.19.�`async rest_post` usage**

route {
	...
	async(rest\_post("http://myserver.org/register\_user",
	                $fU, , $var(body), $var(ct), $var(rcode)), resume);
}

route \[resume\] {
	$var(rc) = $rc;
	if ($var(rc) < 0) {
		xlog("async rest\_post() failed with $var(rc), user=$fU\\n");
		send\_reply(500, "Server Internal Error 1");
		exit;
	}
	if ($var(rcode) != 200) {
		xlog("async rest\_post() rcode=$var(rcode), user=$fU\\n");
		send\_reply(500, "Server Internal Error 2");
		exit;
	}

	...
}

  

### 1.6.3.� `rest_put(url, send_body_pv, [send_ctype_pv], recv_body_pv[, [recv_ctype_pv][, [retcode_pv]]])`

Perform an asynchronous HTTP PUT. This function behaves exactly the same as **[rest\_put()](#func_rest_put "1.5.3.� rest_put(url, send_body, [send_ctype], recv_body_pv[, [recv_ctype_pv][, [retcode_pv]]])")** (in terms of input, output and processing), but in a non-blocking manner. Script execution is suspended until the entire content of the HTTP response is available.

**Example�1.20.�`async rest_put` usage**

route {
	...
	async(rest\_put("http://myserver.org/users/$fU", $var(userinfo), ,
	               $var(body), $var(ct), $var(rcode)), resume);
}

route \[resume\] {
	$var(rc) = $rc;
	if ($var(rc) < 0) {
		xlog("async rest\_put() failed with $var(rc), user=$fU\\n");
		send\_reply(500, "Server Internal Error 3");
		exit;
	}
	if ($var(rcode) != 200) {
		xlog("async rest\_put() rcode=$var(rcode), user=$fU\\n");
		send\_reply(500, "Server Internal Error 4");
		exit;
	}

	...
}

  

## 1.7.�Exported script transformations

The module also provides a way for encoding and decoding parameters contained in an arbitrary script variable, in accordance with RFC3986. This is done by applying a transformation to a script variable containing the data to be encoded. The value of the original variable is not altered and a corresponding string value is returned. The transformation is performed through libcurl API method curl\_easy\_escape (or curl\_escape for libcurl < 7.15.4).

### 1.7.1.� `{rest.escape}`

The result of this transformation is to produce percent encoded string value which can be safely used in URI construction.

There are no parameters for this transformation.

**Example�1.21.�`rest.escape` usage**

...
# This example would produce log entry: "Output: call%40example.com%26safe%3Dfalse"
$var(tmp) = "call@example.com&safe=false";
xlog("Output: $(var(tmp){rest.escape})\\n");

# Encode call ID before transmission:
$var(rc) = rest\_get("https://call-info.org/?id=$(ci{rest.escape})", $var(body\_pv));
...
                

  

### 1.7.2.� `{rest.unescape}`

The result of this transformation is to decode percent encoded string values.

There are no parameters for this transformation.

**Example�1.22.�`rest.unescape` usage**

...
# This example would produce log entry: "Output: 1+1=2!"
$var(tmp) = "1%2B1%3D2%21";
xlog("Output: $(var(tmp){rest.unescape})\\n");

# This example would produce log entry: "OpenSIPs, tastes better with every SIP!"
$var(tmp) = "OpenSIPs%2C%20tastes%20better%20with%20every%20SIP%21";
xlog("$(var(tmp){rest.unescape})\\n");
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

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

150

87

4035

1786

2.

Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita))

23

12

663

262

3.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

17

8

336

345

4.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

15

13

41

17

5.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

8

6

115

48

6.

Jarrod Baumann ([@jarrodb](https://github.com/jarrodb))

6

3

131

32

7.

Agalya Ramachandran ([@AgalyaR](https://github.com/AgalyaR))

6

2

354

1

8.

Callum Guy ([@spacetourist](https://github.com/spacetourist))

6

2

281

8

9.

Ryan Bullock ([@rrb3942](https://github.com/rrb3942))

5

2

91

77

10.

Aron Podrigal ([@ar45](https://github.com/ar45))

4

2

15

7

  

**All remaining contributors**: Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Maksym Sobolyev ([@sobomax](https://github.com/sobomax)), John Burke ([@john08burke](https://github.com/john08burke)), Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)), Andrey Vorobiev ([@andrey-vorobiev](https://github.com/andrey-vorobiev)).

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 2.2.�By Commit Activity

**Table�2.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Mar 2013 - Feb 2026

2.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Oct 2014 - Nov 2025

3.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

Nov 2025 - Nov 2025

4.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Oct 2025

5.

Aron Podrigal ([@ar45](https://github.com/ar45))

Sep 2024 - Sep 2024

6.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Oct 2020 - Feb 2023

7.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - May 2021

8.

John Burke ([@john08burke](https://github.com/john08burke))

Apr 2021 - Apr 2021

9.

Callum Guy ([@spacetourist](https://github.com/spacetourist))

Jan 2020 - Jan 2020

10.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Aug 2015 - Nov 2019

  

**All remaining contributors**: Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita)), Andrey Vorobiev ([@andrey-vorobiev](https://github.com/andrey-vorobiev)), Ryan Bullock ([@rrb3942](https://github.com/rrb3942)), Agalya Ramachandran ([@AgalyaR](https://github.com/AgalyaR)), Jarrod Baumann ([@jarrodb](https://github.com/jarrodb)).

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Callum Guy ([@spacetourist](https://github.com/spacetourist)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Agalya Ramachandran ([@AgalyaR](https://github.com/AgalyaR)), Jarrod Baumann ([@jarrodb](https://github.com/jarrodb)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)).

_Documentation Copyrights:_

Copyright � 2013 [www.opensips-solutions.com](http://www.opensips-solutions.com/)