## 1.4.�Exported Parameters

### 1.4.1.�`ip`(string)

The IP address used by the HTTP server to listen for incoming requests.

_The default value is "\*"_ (bind to all IPv6 and IPv4 interfaces).

**Example�1.1.�Set `ip` parameter**

...
modparam("httpd", "ip", "127.0.0.1")
...

  

### 1.4.2.�`port`(integer)

The port number used by the HTTP server to listen for incoming requests.

_The default value is 8888._ Ports lower than 1024 are not accepted.

**Example�1.2.�Set `port` parameter**

...
modparam("httpd", "port", 8000)
...

  

### 1.4.3.�`buf_size` (integer)

It specifies the maximum length (in bytes) of the buffer used to write in the html response.

If the size of the buffer is set to zero, it will be automatically set to a quarter of the size of the pkg memory.

_The default value is 0._

**Example�1.3.�Set `buf_size` parameter**

...
modparam("httpd", "buf\_size", 524288)
...

  

### 1.4.4.�`post_buf_size` (integer)

It specifies the length (in bytes) of the POST HTTP requests processing buffer. For large POST request, the default value might require to be increased.

_The default value is 1024. The minumal value is 256._

**Example�1.4.�Set `post_buf_size` parameter**

...
modparam("httpd", "post\_buf\_size", 4096)
...

  

### 1.4.5.�`tls_cert_file` (string)

Public certificate file for httpd. It will be used as server-side certificate for incoming TLS connections.

_The default value is ""_

**Example�1.5.�Set `tls_cert_file` parameter**

...
modparam("httpd", "tls\_cert\_file", "/etc/opensips/tls/server.pem")
...

  

### 1.4.6.�`tls_key_file` (string)

Private key of the above certificate. I must be kept in a safe place with tight permissions!

_The default value is ""_

**Example�1.6.�Set `tls_key_file` parameter**

...
modparam("httpd", "tls\_key\_file", "/etc/opensips/tls/server.key")
...

  

### 1.4.7.�`tls_ciphers` (string)

You can specify the list of algorithms for authentication and encryption that you allow. To obtain a list of ciphers and then choose, use the gnutls-cli application:

*   gnutls-cli -l
    

### Warning

Do not use the NULL algorithms (no encryption) ... never!!!

_The default value is "SECURE256:+SECURE192:-VERS-ALL:+VERS-TLS1.2"_

**Example�1.7.�Set `tls_key_file` parameter**

...
modparam("httpd", "tls\_ciphers", "SECURE256:+SECURE192:-VERS-ALL:+VERS-TLS1.2")
...