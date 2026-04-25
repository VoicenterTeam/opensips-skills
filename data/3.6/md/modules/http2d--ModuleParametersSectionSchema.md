## 1.3.�Exported Parameters

### 1.3.1.�`ip (string)`

The listening IPv4 address.

Default value is _"127.0.0.1"_.

**Example�1.1.�Setting the `ip` parameter**

modparam("http2d", "ip", "127.0.0.2")

  

### 1.3.2.�`port (integer)`

The listening port.

Default value is _443_.

**Example�1.2.�Setting the `port` parameter**

modparam("http2d", "port", 5000)

  

### 1.3.3.�`tls_cert_path (string)`

File path to the TLS certificate, in PEM format.

Default value is _NULL_ (not set).

**Example�1.3.�Setting the `tls_cert_path` parameter**

modparam("http2d", "tls\_cert\_path", "/etc/pki/http2/cert.pem")

  

### 1.3.4.�`tls_cert_key (string)`

File path to the TLS private key, in PEM format.

Default value is _NULL_ (not set).

**Example�1.4.�Setting the `tls_cert_key` parameter**

modparam("http2d", "tls\_cert\_key", "/etc/pki/http2/private/key.pem")

  

### 1.3.5.�`max_headers_size (integer)`

The maximum amount of bytes allowed for all header field names and values combined in a single HTTP/2 request processed by the server. Once this threshold is reached, extra headers will no longer be provided at script level and will be reported as errors instead.

Default value is _8192_ bytes.

**Example�1.5.�Setting the `max_headers_size` parameter**

modparam("http2d", "max\_headers\_size", 16384)

  

### 1.3.6.�`response_timeout (integer)`

The maximum amount of time, in milliseconds, that the library will allow the opensips.cfg processing to take for a given HTTP/2 request.

Once this timeout is reached, the module will auto-generate a 408 (request timeout) reply.

Default value is _2000_ ms.

**Example�1.6.�Setting the `response_timeout` parameter**

modparam("http2d", "response\_timeout", 5000)