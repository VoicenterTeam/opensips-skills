## 1.4.�Exported Functions

### 1.4.1.� `enum_query([suffix], [service], [number])`

The function performs an ENUM query on a given E.164 "number" (or R-URI username if "number" is missing) and rewrites the Request-URI with the result of the query. See [Overview](#overview "1.1.�Overview") for more information.

Meaning of the parameters is as follows:

*   _suffix (string, optional)_ - suffix to be appended to the domain name, [domain\_suffix](#param_domain_suffix "1.3.1.�domain_suffix (string)") if missing
    
*   _service (string, optional)_ - service string to be used in the service field
    
*   _number (string, optional)_ - a specific E.164 number packed as a string on which the ENUM query is performed (if missing the R-URI username ($rU) will be used).
    

This function can be used from REQUEST\_ROUTE.

**Example�1.9.�`enum_query` usage**

...
# search for "e2u+sip" in freenum.org 
enum\_query("freenum.org.", , $avp(number));
...
# search for "e2u+sip" in default tree (configured as parameter)
enum\_query();
...
# search for "e2u+voice:sip" in e164.arpa
enum\_query("e164.arpa.", "voice");
...
# search for service type "sip" or "voice:sip" or "video:sip"
# note the '+' sign in front of the second parameter
enum\_query("e164.arpa.", "+sip+voice:sip+video:sip", $avp(number));
...
# querying for service sip and voice:sip
enum\_query("e164.arpa.");
enum\_query("e164.arpa.", "voice");
# or use instead
enum\_query("e164.arpa.", "+sip+voice:sip");
...

  

### 1.4.2.� `i_enum_query([suffix], [service])`

The function performs an enum query and rewrites the Request-URI with the result of the query. This the Infrastructure-ENUM version of enum\_query(). The only difference to enum\_query() is in the calculation of the FQDN where NAPTR records are looked for.

Meaning of the parameters is as follows:

*   _suffix (string, optional)_ - suffix to be appended to the domain name, [i\_enum\_suffix](#param_i_enum_suffix "1.3.3.�i_enum_suffix (string)") if missing
    
*   _service (string, optional)_ - service string to be used in the service field
    

See ftp://ftp.rfc-editor.org/in-notes/internet-drafts/draft-haberler-carrier-enum-01.txt for the rationale behind this function.

### 1.4.3.� `isn_query([suffix], [service])`

The function performs a ISN query and rewrites the Request-URI with the result of the query. See [Overview](#overview "1.1.�Overview") for more information.

Meaning of the parameters is as follows:

*   _suffix (string, optional)_ - suffix to be appended to the domain name, [isn\_suffix](#param_isn_suffix "1.3.4.�isn_suffix (string)") if missing
    
*   _service (string, optional)_ - service string to be used in the service field
    

This function can be used from REQUEST\_ROUTE.

See ftp://www.ietf.org/rfc/rfc3872.txt and ftp://www.ietf.org/rfc/rfc2871.txt for information regarding the ITAD part of the ISN string.

**Example�1.10.�`isn_query` usage**

...
# search for "e2u+sip" in freenum.org 
isn\_query("freenum.org.");
...
# search for "e2u+sip" in default tree (configured as parameter)
isn\_query();
...
# search for "e2u+voice:sip" in freenum.org
isn\_query("freenum.org.", "voice");
...

  

### 1.4.4.�`is_from_user_enum([suffix], [service])`

Checks if the user part of from URI is found in an enum lookup. Returns 1 if yes and -1 if not.

Meaning of the parameters is as follows:

*   _suffix (string, optional)_ - suffix to be appended to the domain name, [domain\_suffix](#param_domain_suffix "1.3.1.�domain_suffix (string)") if missing
    
*   _service (string, optional)_ - service string to be used in the service field
    

This function can be used from REQUEST\_ROUTE.

**Example�1.11.�`is_from_user_enum` usage**

...
if (is\_from\_user\_enum()) {
	....
};
...