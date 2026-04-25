## 1.4.�Exported Functions

### 1.4.1.� `alias_db_lookup(table_name, [flags])`

The function takes the R-URI and search to see whether it is an alias or not. If it is an alias for a local user, the R-URI is replaced with user's SIP uri.

The function returns TRUE if R-URI is alias and it was replaced by user's SIP uri.

Meaning of the parameters is as follows:

*   _table\_name (string)_ - the name of the table to search for the alias
    
*   _flags (string, optional)_ - set of character flags to control the alias lookup process:
    
    *   **d** - do not use domain URI part in the alias lookup query (use only a username-based lookup). By default, both username and domain are used.
        
    *   **r** - do reverse alias lookup - lookup for the alias mapped to the current URI (URI 2 alias translation); normally, the function looks up for the URI mapped to the alias (alias 2 URI translation).
        
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE.

**Example�1.8.�`alias_db_lookup()` usage**

...
alias\_db\_lookup("dbaliases", "rd");
alias\_db\_lookup("dba\_$(rU{s.substr,0,1})");
...

  

### 1.4.2.� `alias_db_find(table_name, input_uri, output_var, [flags])`

The function is very similar to `alias_db_lookup()`, but instead of using fixed input (RURI) and output (RURI) is able to get the input SIP URI from a pseudo-variable and place the result back also in a pseudo-variable.

The function is useful as the alias lookup does not affect the request itself (no RURI changes), can be used in a reply context (as it does not work with RURI only) and can be used for others URI than the RURI (To URI, From URI, custom URI).

The function returns TRUE if any alias mapping was found and returned.

Meaning of the parameters is as follows:

*   _table\_name (string)_ - the name of the table to search for the alias
    
*   _input\_uri (string)_ - a SIP URI to look up
    
*   _output\_var (var)_ - a variable to hold the SIP URI result
    
*   _flags (string, optional)_ (optional) - set of flags (char based flags) to control the alias lookup process:
    
    *   _d_ - do not use domain URI part in the alias lookup query (use only a username-based lookup). By default, both username and domain are used.
        
    *   _r_ - do revers alias lookup - lookup for the alias mapped to the current URI (URI 2 alias translation); normally, the function looks up for the URI mapped to the alias (alias 2 URI translation).
        
    

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE, LOCAL\_ROUTE, STARTUP\_ROUTE, FAILURE\_ROUTE and ONREPLY\_ROUTE.

**Example�1.9.�`alias_db_find()` usage**

...
# do revers alias lookup and find the alias for the FROM URI
alias\_db\_find("dbaliases", $fu, $avp(from\_alias), "r");
...