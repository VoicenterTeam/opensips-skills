## 1.5.�Exported Functions

### 1.5.1.� `loose_route()`

The function performs routing of SIP requests which contain a route set. The name is a little bit confusing, as this function also routes requests which are in the “strict router” format.

This function is usually used to route in-dialog requests (like ACK, BYE, reINVITE). Nevertheless also out-of-dialog requests can have a “pre-loaded route set” and my be routed with loose\_route. It also takes care of translating between strict-routers and loose-router.

The loose\_route() function analyzes the Route headers in the requests. If there is no Route header, the function returns FALSE and routing should be done exclusivly via RURI. If a Route header is found, the function returns TRUE and behaves as described in section 16.12 of RFC 3261. The only exception is for requests with preload Route headers (intial requests, carrying a Route header): if there is only one Route header indicating the local proxy, then the Route header is removed and the function returns FALSE.

The function is able to automatically detecting if it deals with a 'strict' or 'loose' routing scenario (the difference is how the SIP path is stored across the RURI and Route hdrs). To make the difference between the two scenarios OpenSIPS has to determine which SIP URI holds its address/domain - the RURI (then it is a strict routing scenario) or the top Route URI (then it is a loose route scenario). In order to check if the SIP URI holds its address/domain, OpenSIPS checks the host URI against the listening IPs/interfaces (as a static component) and the domains listed from the "domain" module/table (as the dynamic component).

If there is a Route header but other parsing errors occur ( like parsing the TO header to get the TAG ), the function also returns FALSE.

Make sure your loose\_routing function can't be used by attackers to bypass proxy authorization.

The loose\_routing topic is very complex. See the RFC3261 for more details (grep for “route set” is a good starting point in this comprehensive RFC).

This function can be used from REQUEST\_ROUTE.

**Example�1.6.�`loose_route` usage**

...
loose\_route();
...

  

### 1.5.2.� `record_route()` and `record_route(string)`

The function adds a new Record-Route header field. The header field will be inserted in the message before any other Record-Route header fields.

If any string is passed as parameter, it will be appended as URI parameter to the Record-Route header. The string must follow the “;name=value” scheme.

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE and FAILURE\_ROUTE.

**Example�1.7.�`record_route` usage**

...
record\_route();
...

  

### 1.5.3.� `record_route_preset(string [, string2])`

This function will put the string into Record-Route, don't use unless you know what you are doing.

Meaning of the parameters is as follows:

*   _string_ - String to be inserted into the first header field; it may contain pseudo-variables.
    
*   _string2_ (optional) - String to be inserted into the second header field.
    

Note: If 'string2' is present, then the 'string' param is pointing to the outbound interface and the 'string2' param is pointing to the inbound interface.

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE and FAILURE\_ROUTE.

**Example�1.8.�`record_route_preset` usage**

...
record\_route\_preset("1.2.3.4:5090");
...

  

### 1.5.4.� `add_rr_param(param)`

Adds a parameter to the Record-Route URI (param must be in “;name=value” format. The function may be called also before or after the record\_route() call (see [record\_route()](#func_record_route "1.5.2.� record_route() and record_route(string)")).

Meaning of the parameters is as follows:

*   _param_ (string) - the URI parameter to be added. It must follow the “;name=value” scheme.
    

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE and FAILURE\_ROUTE.

**Example�1.9.�`add_rr_param` usage**

...
add\_rr\_param(";nat=yes");
...

  

### 1.5.5.� `check_route_param(re)`

The function checks if the URI parameters of the local Route header (corresponding to the local server) matches the given regular expression. It must be call after loose\_route() (see [loose\_route()](#func_loose_route "1.5.1.� loose_route()")).

Meaning of the parameters is as follows:

*   _re_ (string) - regular expression to check against the Route URI parameters.
    

This function can be used from REQUEST\_ROUTE.

**Example�1.10.�`check_route_param` usage**

...
if (check\_route\_param("nat=yes")) {
    setflag(6);
}
...

  

### 1.5.6.� `is_direction(dir)`

The function checks the flow direction of the request. As for checking it's used the “ftag” Route header parameter, the append\_fromtag (see [append\_fromtag](#param_append_fromtag "1.4.1.�append_fromtag (integer)") module parameter must be enabled. Also this must be called only after loose\_route() (see [loose\_route()](#func_loose_route "1.5.1.� loose_route()")).

The function returns true if the “dir” is the same with the request's flow direction.

The “downstream” (UAC to UAS) direction is relative to the initial request that created the dialog.

Meaning of the parameters is as follows:

*   _dir_ (string) - the direction to be checked. It may be “upstream” (from UAS to UAC) or “downstream” (UAC to UAS).
    

This function can be used from REQUEST\_ROUTE.

**Example�1.11.�`is_direction` usage**

...
if (is\_direction("upstream")) {
    xdbg("upstream request ($rm)\\n");
}
...

  

### 1.5.7.�Exported Pseudo-Variables

Exported pseudo-variables are listed in the next sections.

#### 1.5.7.1.�$rr\_params

_$rr\_params_ - the whole string of the Route parameters - this is available only after calling loose\_route()