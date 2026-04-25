## 1.4.�Exported Parameters

### 1.4.1.�`secret` (string)

Secret phrase used to calculate the nonce value. Must be exactly 32-character long.

The default is to use a random value generated from the random source in the core.

If you use multiple servers in your installation, and would like to authenticate on the second server against the nonce generated at the first one its necessary to explicitly set the secret to the same value on all servers. However, the use of a shared (and fixed) secret as nonce is insecure, much better is to stay with the default. Any clients should send the reply to the server that issued the request.

**Example�1.1.�secret parameter example**

modparam("auth", "secret", "johndoessecretphrase")

  

### 1.4.2.�`nonce_expire` (integer)

Nonces have limited lifetime. After a given period of time nonces will be considered invalid. This is to protect replay attacks. Credentials containing a stale nonce will be not authorized, but the user agent will be challenged again. This time the challenge will contain `stale` parameter which will indicate to the client that it doesn't have to disturb user by asking for username and password, it can recalculate credentials using existing username and password.

The value is in seconds and default value is 30 seconds.

**Example�1.2.�nonce\_expire parameter example**

modparam("auth", "nonce\_expire", 15)   # Set nonce\_expire to 15s

  

### 1.4.3.�`rpid_prefix` (string)

Prefix to be added to Remote-Party-ID header field just before the URI returned from either radius or database.

Default value is “”.

**Example�1.3.�rpid\_prefix parameter example**

modparam("auth", "rpid\_prefix", "Whatever <")

  

### 1.4.4.�`rpid_suffix` (string)

Suffix to be added to Remote-Party-ID header field after the URI returned from either radius or database.

Default value is “;party=calling;id-type=subscriber;screen=yes”.

**Example�1.4.�rpid\_suffix parameter example**

modparam("auth", "rpid\_suffix", "@1.2.3.4>")

  

### 1.4.5.�`realm_prefix` (string)

Prefix to be automatically strip from realm. As an alternative to SRV records (not all SIP clients support SRV lookup), a subdomain of the master domain can be defined for SIP purposes (like sip.mydomain.net pointing to same IP address as the SRV record for mydomain.net). By ignoring the realm\_prefix “sip.”, at authentication, sip.mydomain.net will be equivalent to mydomain.net .

Default value is empty string.

**Example�1.5.�realm\_prefix parameter example**

modparam("auth", "realm\_prefix", "sip.")

  

### 1.4.6.�`rpid_avp` (string)

Full AVP specification for the AVP which stores the RPID value. It used to transport the RPID value from authentication backend modules (auth\_db or auth\_radius) or from script to the auth function append\_rpid\_hf and is\_rpid\_user\_e164.

If defined to NULL string, all RPID functions will fail at runtime.

Default value is “$avp(rpid)”.

**Example�1.6.�rpid\_avp parameter example**

modparam("auth", "rpid\_avp", "$avp(caller\_rpid)")
		

  

### 1.4.7.�`username_spec` (string)

This name of the pseudo-variable that will hold the username.

Default value is “NULL”.

**Example�1.7.�`username_spec` parameter usage**

modparam("auth", "username\_spec", "$var(username)")

  

### 1.4.8.�`password_spec` (string)

This name of the pseudo-variable that will hold the password.

Default value is “NULL”.

**Example�1.8.�`password_spec` parameter usage**

modparam("auth", "password\_spec", "$var(password)")

  

### 1.4.9.�`calculate_ha1` (integer)

This parameter tells the server whether it should expect plaintext passwords in the pseudo-variable or a pre-calculated HA1 string.

If the parameter is set to 1 then the server will assume that the “password\_spec” pseudo-variable contains plaintext passwords and it will calculate HA1 strings on the fly. If the parameter is set to 0 then the server assumes the pseudo-variable contains the HA1 strings directly and will not calculate them.

Default value of this parameter is 0.

**Example�1.9.�`calculate_ha1` parameter usage**

modparam("auth", "calculate\_ha1", 1)

  

### 1.4.10.�`disable_nonce_check` (int)

By setting this parameter you disable the security mechanism that protects against intrusion sniffing and does not allow nonces to be reused. But, because of the current implementation, having this enabled breaks auth for an architecture where load is balanced by having more servers with the same dns name. This parameter has to be set in this case.

Default value is “0” (enabled).

**Example�1.10.�`disable_nonce_check` parameter usage**

modparam("auth", "disable\_nonce\_check", 1)