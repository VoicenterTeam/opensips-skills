## 1.5.�Exported Parameters

### 1.5.1.�`default_av_mgm` (string)

The default AV Manager used in case the functions do not provide them explicitly.

**Example�1.1.�`default_av_mgm` parameter usage**

		
modparam("auth\_aka", "default\_av\_mgm", "diameter") # fetch AVs through the Cx interface
		

  

### 1.5.2.�`default_qop` (string)

The default qop parameter used during challenge, if the functions do not provide them explicitly.

Default value is _auth_.

**Example�1.2.�`default_qop` parameter usage**

		
modparam("auth\_aka", "default\_qop", "auth,auth-int")
		

  

### 1.5.3.�`default_algorithm` (string)

The default algorithm to be advertise during challenge, if the functions do not provide them explicitly. _Note_ that at least one of the algorithms provided should be an AKA one, otherwise it makes no sense to use this module.

Default value is _AKAv1-MD5_.

_WARNING:_ only AKAv1\* algorithms are currently supported.

**Example�1.3.�`default_algorithm` parameter usage**

		
modparam("auth\_aka", "default\_algorithm", "AKAv2-MD5")
		

  

### 1.5.4.�`hash_size` (integer)

The size of the hash that stores the AVs for each user. Must be a power of 2 number.

Default value is _4096_.

**Example�1.4.�`hash_size` parameter usage**

		
modparam("auth\_aka", "hash\_size", 1024)
		

  

### 1.5.5.�`sync_timeout` (integer)

The amount of milliseconds a synchronous call should wait for getting an authentication vector.

Must be a positive value. A value of _0_ indicates to wait indefinitely.

Default value is _100_ ms.

**Example�1.5.�`sync_timeout` parameter usage**

		
modparam("auth\_aka", "sync\_timeout", 200)
		

  

### 1.5.6.�`async_timeout` (integer)

The amount of milliseconds an asynchronous call should wait for getting an authentication vector.

Must be a positive value, greater than 0.

_NOTE:_ the current timeout mechanism only has seconds granularity, therefore you should configure this parameter as a multiple of 1000.

Default value is _1000_ ms.

**Example�1.6.�`async_timeout` parameter usage**

modparam("auth\_aka", "async\_timeout", 2000)
		

  

### 1.5.7.�`unused_timeout` (integer)

The amount of seconds an authentication vector that has not been used can stay in memory. Once this timeout is reached, the authentication vector is removed.

Must be a positive value, greater than 0.

Default value is _60_ s.

**Example�1.7.�`unused_timeout` parameter usage**

modparam("auth\_aka", "unused\_timeout", 120)
		

  

### 1.5.8.�`unused_timeout` (integer)

The amount of seconds an authentication vector that is being used in the authentication process shall stay in memory. Once this timeout is reached, the authentication vector is removed, and the authentication using it will fail.

Must be a positive value, greater than 0.

Default value is _30_ s.

**Example�1.8.�`pending_timeout` parameter usage**

modparam("auth\_aka", "pending\_timeout", 10)