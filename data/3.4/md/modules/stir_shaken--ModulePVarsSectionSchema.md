## 1.5.�Exported Pseudo-Variables

### 1.5.1.� `$identity(field)`

This is a read-only pseudo-variable that provides access to the parsed information from the Identity header, through the following subnames:

*   _header_ - the entire PASSporT header;
    
*   _x5u_ - the value of the 'x5u' PASSporT claim;
    
*   _payload_ - the entire PASSporT payload;
    
*   _attest_ - the value of the 'attest' PASSporT claim;
    
*   _dest_ - the value of the 'tn' member of the 'dest' PASSporT claim;
    
*   _iat_ - the value of the 'iat' PASSporT claim;
    
*   _orig_ - the value of the 'tn' member of the 'orig' PASSporT claim;
    
*   _origid_ - the value of the 'origid' PASSporT claim;
    

**Example�1.14.�`identity` usage**

...
	# acquire the certificate to use for the verification process
	$var(rc) = rest\_get($identity(x5u), $var(cert));
	if ($var(rc) < 0) {
		send\_reply(436, "Bad Identity Info");
		exit;
	}
	...
	xlog("Verified caller:$identity(orig), attestation level: $identity(attest)\\n");
...