## 1.6.�Exported Functions

### 1.6.1.�`aka_www_authorize([realm]])`

The function verifies credentials according to [RFC3310](http://www.ietf.org/rfc/rfc3310.txt), by using an authentication vector priorly allocated by an `aka_www_challenge()` call, using the _av\_mgm_ manager. If the credentials are verified successfully the function will succeed, otherwise it will fail with an appropriate error code, as follows:

*   _\-6 (sync request)_ - the _auts_ parameter was was present, thus a sync was requested;
    
*   _\-5 (generic error)_ - some generic error occurred and no reply was sent out;
    
*   _\-4 (no credentials)_ - credentials were not found in request;
    
*   _\-3 (unknown nonce)_ - authentication vector with the corresponding nonce was not found;
    
*   _\-2 (invalid password)_ - password does not match the authentication vector;
    
*   _\-1 (invalid username)_ - no username found in the Authorize header;
    

In case the function succeeds, the _WWW-Authenticate_ header is being added to the reply, containing the challenge information, as well as the _Integrity-Key_ and the _Confidentiality-Key_ values associated to the AV being used.

Meaning of the parameters is as follows:

*   _realm (string)_ - Realm is a opaque string that the user agent should present to the user so he can decide what username and password to use. This is usually one of the domains the proxy is responsible for. If an empty string “” is used then the server will generate realm from host part of From header field URI.
    

If the credentials are verified successfully then the function will succeed and mark the credentials as authorized (marked credentials can be later used by some other functions).

This function can be used from REQUEST\_ROUTE.

**Example�1.9.�`aka_www_authorize` usage**

		
...
if (!aka\_www\_authorize("diameter", "siphub.com"))
	aka\_www\_challenge("diameter", "siphub.com", "auth");
...

  

### 1.6.2.�`aka_proxy_authorize([realm]])`

The function behaves the same as [aka\_www\_authorize()](#func_aka_www_authorize "1.6.1.�aka_www_authorize([realm]])"), but it authenticates the user from a proxy perspective. It receives the same parameters, with the same meaning, and returns the same values.

This function can be used from REQUEST\_ROUTE.

**Example�1.10.�`aka_proxy_authorize` usage**

		
...
if (!aka\_proxy\_authorize("siphub.com"))
	aka\_proxy\_challenge("diameter", "siphub.com", "auth");
...

  

### 1.6.3.�`aka_www_challenge([av_mgm[, realm[ ,qop[, alg]]]])`

The function challenges a user agent. It fetches an authentication vector for each algorigthm used through the _av\_mgm_ Manager and generate one or more WWW-Authenticate header fields containing digest challenges. It will put the header field(s) into a response generated from the request the server is processing and will send the reply. Upon reception of such a reply the user agent should compute credentials using the used authentication vector annd retry the request. For more information regarding digest authentication see RFC2617, RFC3261, RFC3310 and RFC8760.

Meaning of the parameters is as follows:

*   _av\_mgm_ (string, optional) - the AV Manager to be used for this challenge, in case an AV is not already available for the challenged user identity. In case it is missing the value of the [default\_av\_mgm](#param_default_av_mgm "1.5.1.�default_av_mgm (string)") is being used.
    
    _realm_ (string) - Realm is an opaque string that the user agent should present to the user so it can decide what username and password to use. Usually this is domain of the host the server is running on. If missing, the value of the _From domain_ is being used.
    
*   _qop_ (string, optional) - Value of this parameter can be either “auth”, “auth-int” or both (separated by _,_). When this parameter is set the server will put a qop parameter in the challenge. It is recommended to use the qop parameter, however there are still some user agents that cannot handle qop properly so we made this optional. On the other hand there are still some user agents that cannot handle request without a qop parameter too. If missing, the value of the [default\_qop](#param_default_qop "1.5.2.�default_qop (string)") is being used.
    
*   _algorithms_ (string, optional) - Value of this parameter is a comma-separated list of digest algorithms to be offered for the UAC to use for authentication. Possible values are:
    
    *   “AKAv1-MD5”
    *   “AKAv1-MD5-sess”
    *   “AKAv1-SHA-256”
    *   “AKAv1-SHA-256-sess”
    *   “AKAv1-SHA-512-256”
    *   “AKAv1-SHA-512-256-sess”
    *   “AKAv2-MD5”
    *   “AKAv2-MD5-sess”
    *   “AKAv2-SHA-256”
    *   “AKAv2-SHA-256-sess”
    *   “AKAv2-SHA-512-256”
    *   “AKAv2-SHA-512-256-sess”
    
    When the value is empty or not set, the only offered digest the value of the [default\_algorithm](#param_default_algorithm "1.5.3.�default_algorithm (string)") is being used.
    

Possible return codes:

*   _\-1_ - generic parsing error, generated when there is not enoough data to build the challange
    
*   _\-2_ - no AV vector could not be fetched
    
*   _\-3_ - authentication headers could not be built
    
*   _\-5_ - a reply could not be sent
    
*   _positive_ - the number of successful chalanges being sent in the reply; this value can be lower than the number of algorithms being requested in case there was a timeout waiting for some AVs.
    

This function can be used from REQUEST\_ROUTE.

**Example�1.11.�aka\_www\_challenge usage**

...
if (!aka\_www\_authorize("siphub.com")) {
	aka\_www\_challenge(,"siphub.com", "auth-int", "AKAv1-MD5");
}
...

  

### 1.6.4.�`aka_proxy_challenge([realm]])`

The function behaves the same as [aka\_www\_challenge()](#func_aka_www_challenge "1.6.3.�aka_www_challenge([av_mgm[, realm[ ,qop[, alg]]]])"), but it challenges the user from a proxy perspective. It receives the same parameters, with the same meaning, the only difference being that in case of the _realm_ is missing, then it is taken from the the _To domain_, rather than from _From domain_. The header added is _Proxy-Authenticate_, rather than _WWW-Authenticate_ The rest of the parameters, behavior, as well as return values are the same.

This function can be used from REQUEST\_ROUTE.

**Example�1.12.�`aka_proxy_challenge` usage**

		
...
if (!aka\_proxy\_authorize("siphub.com"))
	aka\_proxy\_challenge(,"siphub.com", "auth");
...

  

### 1.6.5.�`aka_av_add(public_identity, private_identity, authenticate, authorize, confidentiality_key, integrity_key[, algorithms])`

Adds an authentication vector for the user identitied by _public\_identity_ and _private\_identity_.

Meaning of the parameters is as follows:

*   _public\_identity_ (string) - the public identity (IMPU) of the user to add authentication vector for.
    
*   _private\_identity_ (string) - the private identity (IMPI) of the user to add authentication vector for.
    
*   _authenticate_ (string) - the concatenation of the authentication challenge RAND and the token AUTN, encoded in hexa format.
    
*   _authorize_ (string) - the authorization string (XRES) used for authorizing the user, encoded in hexa format.
    
*   _confidentiality\_key_ (string) - the Confidentiality-Key used in the AKA IPSec process, encoded in hexa format.
    
*   _integrity\_key_ (string) - the Integrity-Key used in the AKA IPSec process, encoded in hexa format.
    
*   _algorithms_ (string, optional) - AKA algorithms this AV should be used for. If missing, the AV can be used for any AKA algorithm.
    

This function can be used from any route.

**Example�1.13.�`aka_av_add` usage**

		
...
aka\_av\_add("sip:test@siphub.com", "test@siphub.com",
			"KFQ/MpR3cE3V9PxucEQS5KED8uUNYIAALFyk59sIJI4=", /\* authenticate \*/
			"00000262c0000014000028af2d6398cbe26eea69", /\* authorize \*/
			"db7f8c4a58e17083974bba3b936d34c4", /\* ck \*/
			"6151667b9ef815c1dcb87473685f062a"  /\* ik \*/);
...

  

### 1.6.6.�`aka_av_drop(public_identity, private_identity, authenticate)`

Drops the authentication vector corresponding to the _authenticate/nonce_ value for an user identitied by _public\_identity_ and _private\_identity_.

Meaning of the parameters is as follows:

*   _public\_identity_ (string) - the public identity (IMPU) of the user to drop authentication vector for.
    
*   _private\_identity_ (string) - the private identity (IMPI) of the user to drop authentication vector for.
    
*   _authenticate_ (string) - the authenticate/nonce that identifies the authentication vector to be dropped.
    

This function can be used from any route.

**Example�1.14.�`aka_av_drop` usage**

		
...
aka\_av\_drop("sip:test@siphub.com", "test@siphub.com",
			"KFQ/MpR3cE3V9PxucEQS5KED8uUNYIAALFyk59sIJI4=");
...

  

### 1.6.7.�`aka_av_drop_all(public_identity, private_identity[, count])`

Drops all authentication vectors for an user identitied by _public\_identity_ and _private\_identity_. This function is useful when a synchronization must be done.

Meaning of the parameters is as follows:

*   _public\_identity_ (string) - the public identity (IMPU) of the user to drop authentication vectors for.
    
*   _private\_identity_ (string) - the private identity (IMPI) of the user to drop authentication vectors for.
    
*   _count_ (variable, optional) - a variable to return the number of authentication vectors dropped.
    

This function can be used from any route.

**Example�1.15.�`aka_av_drop_all` usage**

		
...
aka\_av\_drop\_all("sip:test@siphub.com", "test@siphub.com", $var(count));
...

  

### 1.6.8.�`aka_av_fail(public_identity, private_identity[, count])`

Marks the engine that an authentication vector query for a user has failed, unlocking the processing of the message.

_Note:_ this function is useful when you know that fetching a new authentication vector is not possible (due to various reasons) - calling it will resume the message procesing, using only the available AVs fetched so far.

Meaning of the parameters is as follows:

*   _public\_identity_ (string) - the public identity (IMPU) of the user to drop authentication vectors for.
    
*   _private\_identity_ (string) - the private identity (IMPI) of the user to drop authentication vectors for.
    
*   _count_ (integer, optional) - the number of authentication vectors that failed. If missing, _1_ is considered.
    

This function can be used from any route.

**Example�1.16.�`aka_av_fail` usage**

...
aka\_av\_fail("sip:test@siphub.com", "test@siphub.com", 3);
...