## 1.4.�Exported Functions

### 1.4.1.� `radius_send_auth(input_set_name, output_set_name)`

This function can be used from the script to make custom radius authentication request. The function takes two parameters.

Parameters:

*   _input\_set\_name_ (string) - the name of the set that contains the list of attributes and pvars that will form the authentication request (see the “sets” module parameter).
    
*   _output\_set\_name_ (string) - the name of the set that contains the list of attributes and pvars that will be extracted form the authentication reply (see the “sets” module parameter).
    

The sets must be defined using the “sets” exported parameter.

The function return TRUE (retcode 1) if authentication was successful, FALSE (retcode -1) if an error (any kind of error) occurred during authentication processes or FALSE (retcode -2) if authentication was rejected or denied by RADIUS server.

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, ONREPLY\_ROUTE, BRANCH\_ROUTE, ERROR\_ROUTE and LOCAL\_ROUTE.

**Example�1.5.�`radius_send_auth` usage**

...
radius\_send\_auth("set1","set2");
switch ($rc) {
	case 1:
		xlog("authentication ok \\n");
		break;
	case -1:
		xlog("error during authentication\\n");
		break;
	case -2:
		xlog("authentication denied \\n");
		break;
}
...

		

  

### 1.4.2.� `radius_send_acct(input_set_name)`

This function can be used from the script to make custom radius authentication request. The function takes only one string parameter that represents the name of the set that contains the list of attributes and pvars that will form the accounting request.

Only one set is needed as a parameter because no AVPs can be extracted from the accounting replies.

The set must be defined using the "sets" exported parameter.

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, ONREPLY\_ROUTE, BRANCH\_ROUTE, ERROR\_ROUTE and LOCAL\_ROUTE.

**Example�1.6.�`radius_send_acct` usage**

...
radius\_send\_acct("set1");
...