## 1.4.�Exported Functions

### 1.4.1.� `jwt_db_authorize(jwt_token,out_decoded_token,out_sip_username)`

The function will read the first param ( jwt\_token ), extract the tag claim and then try to authenticate it against the DB secrets for the respective profile tag. In case of success, it populates the out\_decoded\_token pvar with the decoded JWT ( in plaintext format header\_json.payload\_json ) and the out\_sip\_username with the SIP username corresponding to that JWT profile.

Negative codes may be interpreted as follows:

*   _\-1 ( error)_ - JWT authentication failed
    

Meaning of the parameters is as follows:

*   _jwt\_token (string)_ - The JWT token to perform auth on
    
    The string may contain pseudo variables.
    
*   _out\_decoded\_token (pvar)_ - PVAR used to store the decoded JWT upon succesful auth
    
*   _out\_sip\_username (pvar)_ - PVAR used to store the SIP username corresponding to the JWT profile, upon succesful auth
    

This function can be used from REQUEST\_ROUTE.

**Example�1.13.�`jwt_db_authorize` usage**

...
if (!jwt\_db\_authorize("$avp(my\_jwt\_token)", $avp(decoded\_token), $avp(sip\_username) )) {
	send\_reply(401,"Unauthorized");
	exit;
} else {
	xlog("Succesful JWT auth - $avp(decoded\_token) \\n");
	if ($fU != $avp(sip\_username)) {
		send\_reply(403,"Forbidden AUTH ID");
		exit;
	}	
}
...

  

### 1.4.2.� `jwt_script_authorize(jwt_token,key, out_decoded_token)`

The function will read the first param ( jwt\_token ), decode it and then try to validate it against the provided key. If the JWT decoding is succesful, the out\_decoded\_token pvar will be populated. Return codes are :

*   \-2 : Failure in decoding the JWT ( out\_decoded\_token will not be populated )
    
*   \-1 : Failure in validating the JWT ( out\_decoded\_token will be populated )
    
*   1 : JWT succesfully validated with the key ( out\_decoded\_token will be populated )
    

Meaning of the parameters is as follows:

*   _jwt\_token (string)_ - The JWT token to perform auth on
    
    The string may contain pseudo variables.
    
*   _key (string)_ - The key to be used for validating the JWT.
    
*   _out\_decoded\_token (pvar)_ - PVAR used to store the decoded JWT
    

This function can be used from REQUEST\_ROUTE.

**Example�1.14.�`jwt_script_authorize` usage**

...
if (!jwt\_script\_authorize("$avp(my\_jwt\_token)",$avp(pub\_key), $avp(decoded\_token))) {
	send\_reply(401,"Unauthorized");
	exit;
} else {
	xlog("Succesful JWT auth - $avp(decoded\_token) \\n");
}
...

  

### 1.4.3.� `extract_pub_key_from_cert(certificate,out_public_key)`

The function will read the first param ( certificate ), decode it and then try to extract the public key with the certificate. If the extraction is succesful, the out\_public\_key will be populated. Useful to be used in conjuction with the jwt\_script\_authorize function, since most providers make their certificates public, but the JWTs are signed with the actual public key embeded in the certificate. Return codes are :

*   \-1 : Failure in extracting the pub key
    
*   1 : out\_public\_key succesfully populated
    

Meaning of the parameters is as follows:

*   _certificate (string)_ - The certificate to read and from which to extract the public key
    
    The string may contain pseudo variables.
    
*   _out\_public\_key (pvar)_ - PVAR used to store the extracted public key
    

This function can be used from REQUEST\_ROUTE.

**Example�1.15.�`extract_pub_key_from_cert` usage**

...
if (extract\_pub\_key\_from\_cert("$avp(my\_certificate)",$avp(my\_pub\_key))) {
    xlog("Succesfully extracted public key - $avp(my\_pub\_key) \\n");
}
...