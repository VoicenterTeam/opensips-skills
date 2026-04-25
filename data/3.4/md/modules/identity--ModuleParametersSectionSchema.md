## 1.3.�Exported Parameters

### 1.3.1.�`privKey` (string)

Filename of private RSA-key of authentication service. This file must be in PEM format.

**Example�1.1.�Set `privKey` parameter**

...
modparam("identity", "privKey", "/etc/openser/privkey.pem")
...

  

### 1.3.2.�`authCert` (string)

Filename of certificate which belongs to `privKey`. This file must be in PEM format.

**Example�1.2.�Set `authCert` parameter**

...
modparam("identity", "authCert", "/etc/openser/cert.pem")
...

  

### 1.3.3.�`certUri` (string)

URI from which the certificate of the authentication service can be acquired. This string will be placed in the Identity-Info header.

**Example�1.3.�Set `certUri` parameter**

...
modparam("identity", "certUri", "http://www.myserver.com/cert.pem")
...

  

### 1.3.4.�`verCert` (string)

Path containing certificates for the verifier. Certificates must be in PEM format. The URI in the Identity-Info header field is used to find the corresponding certificate for the request. For this purpose the verifier replaces every character which is not alphanumeric, no “\_” and no “.” with a “\-”. A “.” at the beginning of the URI is forbidden. If the URI is “http://www.test.com/cert.pem” the verifier will look for the file “http---www.test.com-cert.pem”, for example. It is also possible to store a whole certificate chain in a file. In this case certificates must be in right order, end certificate first.

**Example�1.4.�Set `verCert` parameter**

...
modparam("identity", "verCert", "/etc/openser/verCert/")
...

  

### 1.3.5.�`caList` (string)

File containing all trusted (root) certificates for the verifier. Certificates must be in PEM format.

**Example�1.5.�Set `caList` parameter**

...
modparam("identity", "caList", "/etc/openser/caList.pem")
...

  

### 1.3.6.�`crlList` (string)

File containing certificate revocation lists (crls) for the verifier. Setting this parameter is only necessary if `useCrls` is set to “1”.

**Example�1.6.�Set `crlList` parameter**

...
modparam("identity", "crlList", "/etc/openser/crls.pem")
...

  

### 1.3.7.�`useCrls` (integer)

Switch to decide whether to use revocation lists (“1”) or not (“0”).

_Default value is “0”._

**Example�1.7.�Set `privKey` parameter**

...
modparam("identity", "useCrls", 1)
...