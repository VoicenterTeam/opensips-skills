## 1.4.�Exported Functions

### 1.4.1.�`is_from_local([attrs_var])`

Checks based on domain table if host part of From header uri is one of the local domains that the proxy is responsible for. The argument is optional and if present it should contain a writable variable that will be populated with the attributes from the database.

This function can be used from REQUEST\_ROUTE.

**Example�1.6.�is\_from\_local usage**

...
if (is\_from\_local()) {
	...
};
...
if (is\_from\_local($var(attrs))) {
	xlog("Domain attributes are $var(attrs)\\n");
	...
};
...
		

  

### 1.4.2.�`is_uri_host_local([attrs_var])`

If called from route or failure route block, checks based on domain table if host part of Request-URI is one of the local domains that the proxy is responsible for. If called from branch route, the test is made on host part of URI of first branch, which thus must have been appended to the transaction before is\_uri\_host\_local() is called. The argument is optional and if present it should contain a writable variable that will be populated with the attributes from the database.

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE.

**Example�1.7.�is\_uri\_host\_local usage**

...
if (is\_uri\_host\_local()) {
	...
};
...
if (is\_uri\_host\_local($var(attrs))) {
	xlog("Domain attributes are $var(attrs)\\n");
	...
};
		

  

### 1.4.3.�`is_domain_local(domain, [attrs_var])`

This function checks if the domain contained in the first parameter is local.

This function is a generalized form of the is\_from\_local() and is\_uri\_host\_local() functions, being able to completely replace them and also extends them by allowing the domain to be taken from any of the above mentioned sources. The following equivalences exist:

*   is\_domain\_local($rd) is same as is\_uri\_host\_local()
    
*   is\_domain\_local($fd) is same as is\_from\_local()
    

Parameters:

*   _domain_ (string)
    
*   _attrs\_var_ (var, optional) - a writable variable that will be populated with the attributes from the database.
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE.

**Example�1.8.�is\_domain\_local usage**

...
if (is\_domain\_local($rd)) {
	...
};
if (is\_domain\_local($fd)) {
	...
};
if (is\_domain\_local($avp(some\_avp\_alias))) {
	...
};
if (is\_domain\_local($avp(850))) {
	...
};
if (is\_domain\_local($avp(some\_avp))) {
	...
};
if (is\_domain\_local($avp(some\_avp), $avp(attrs))) {
	xlog("Domain attributes are $avp(attrs)\\n");
	...
};
...