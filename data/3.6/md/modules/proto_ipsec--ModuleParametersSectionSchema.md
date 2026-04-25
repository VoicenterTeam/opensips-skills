## 1.3.�Exported Parameters

### 1.3.1.�`port` (integer)

Default IPSec port used when no prot is being specified in the _socket_ global parameter.

_Default value is 5062._

**Example�1.1.�Set `port` parameter**

...
modparam("proto\_ipsec", "port", 5100)
...

  

### 1.3.2.�`min_spi` (integer)

This parameter represents the minimum value for the Security Association's (SA) SPI parameter. In conjunction with the _max\_spi_ setting, it defines the SPI range _\[min\_spi, max\_spi\]_ that must be unique within the system.

_Default value is 65536._

**Example�1.2.�Set `min_spi` parameter**

...
modparam("proto\_ipsec", "min\_spi", 10000)
...

  

### 1.3.3.�`max_spi` (integer)

This parameter represents the maximum value for the Security Association's (SA) SPI parameter. In conjunction with the _min\_spi_ setting, it defines the SPI range _\[min\_spi, max\_spi\]_ that must be unique within the system.

_Default value is 262144._

**Example�1.3.�Set `max_spi` parameter**

...
modparam("proto\_ipsec", "max\_spi", 20000)
...

  

### 1.3.4.�`temporary_timeout` (integer)

Sets the timeout (in seconds) a temporary security association can be stored in memory until in is confirmed (or used) by the remote endpoint.

The timeout signifies the duration elapsed after sending the Security Association's (SA) parameters in the 401 reply and when the User Equipment (UE) transmits the initial message over the new secure channel.

_Default value is 30._

**Example�1.4.�Set `temporary_timeout` variable**

param("proto\_ipsec", "temporary\_timeout", 10) # number of seconds

			

  

### 1.3.5.�`default_client_port` (integer)

Default port value to be used when we act as clients in the IPSec communication.

_Default value is not defined - a random socket is being used, but needs to be different from the server socket._

**Example�1.5.�Set `default_client_port` parameter**

...
modparam("proto\_ipsec", "default\_client\_port", 5100)
...

  

### 1.3.6.�`default_server_port` (integer)

Default port value to be used when we act as server in the IPSec communication.

_Default value is not defined - a random socket is being used, but needs to be different from the client socket._

**Example�1.6.�Set `default_server_port` parameter**

...
modparam("proto\_ipsec", "default\_server\_port", 6100)
...

  

### 1.3.7.�`allowed_algorithms` (string)

Whitelists the authentication and encryption algorithms that can be used for IPSec.

Its format is: _alg|ealg|alg=ealg_

Multiple algorithms pairs can be specified separated by comma.

Currently supported algorithms are:

*   Authentication algorithms:
    
    *   hmac-md5-96
    *   hmac-sha-1-96
    *   aes-gmac
    *   null
    
*   Encryption algorithms:
    
    *   des-ede3-cbc
    *   aes-cbc
    *   aes-gcm
    *   null
    

_Default value is none - this means that all algorithms can be used._

**Example�1.7.�Set `allowed_algorithms` parameter**

...
modparam("proto\_ipsec", "allowed\_algorithms", "null")
modparam("proto\_ipsec", "allowed\_algorithms", "hmac-sha-1-96=null")
modparam("proto\_ipsec", "allowed\_algorithms", "hmac-sha-1-96=null,aes-gmac=aes-gcm")
...

  

### 1.3.8.�`disable_deprecated_algorithms` (integer)

Indicates whether we should ignore deprecated algorithms, as defined in TS 33.203 (3G Security: Access Security for IP-based Services). At the moment, this disables the following algorithms:

*   _hmac-md5-96_ and _hmac-sha-1-96_ authentication algorithms
    
*   _des-ede3-cbc_ and _aes-cbc_ encryption algorithms
    

_Default value is false - all algorithms can be used._

**Example�1.8.�Set `disable_deprecated_algorithms` parameter**

...
modparam("proto\_ipsec", "disable\_deprecated\_algorithms", yes)
...