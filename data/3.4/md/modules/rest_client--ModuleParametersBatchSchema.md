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