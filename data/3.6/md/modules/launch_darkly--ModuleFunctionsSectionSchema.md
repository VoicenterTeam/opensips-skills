## 1.4.�Exported Functions

### 1.4.1.� `ld_feature_enabled( flag, user, [user_extra], [fallback])`

Function to evaluate a LaunchDarkly boolean feature flag

Returns _1_ if the flag was found TRUE or _\-1_ otherwise.

In case of error, the fallback (TRUE or FALSE) value will be returned In such cases, a "fallback" TRUE is returned as 2 and a fallback FALSE as -2, so you can may a difference between a real TRUE (returned by the LD service) and a fallback TRUE due to an error.

This function can be used from any route.

The function has the following parameters:

*   _flag_ (string) - the key of the flag to evaluate. May not be NULL or empty.
    
*   _user_ (string) - the user to evaluate the flag against. May not be NULL or empty.
    
*   _user\_extra_ (AVP, optional) - an AVP holding one or multiple key-value attributes to be attached to the user. The format of the AVP value is "key=value".
    
*   _fallback_ (int, optional) - the value to be returned on error. By default FALSE will be returned.
    

**Example�1.5.�`ld_feature_enabled()` function usage**

	...
	$avp(extra) = "domainId=123456";
	if (ld\_feature\_enabled("my-flag","opensips", $avp(extra), false))
		xlog("-------TRUE\\n");
	else
		xlog("-------FALSE\\n");
	...