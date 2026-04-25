## 1.4.�Exported Functions

### 1.4.1.� `db_is_user_in(uri, group)`

This function is to be used for script group membership. The function returns true if username in the given URI is member of the given group and false if not.

Meaning of the parameters is as follows:

*   _uri (string)_ - a SIP URI whose username and optionally domain to be used. Possible values:
    
    *   "Request-URI" - Use Request-URI username and (optionally) domain.
        
    *   "To" - Use To username and (optionally) domain.
        
    *   "From" - Use From username and (optionally) domain.
        
    *   "Credentials" - Use digest credentials username.
        
    *   (default) - parse the given input as a SIP URI
        
    
*   _group (string)_ - the group to check
    

This function can be used from REQUEST\_ROUTE and FAILURE\_ROUTE.

**Example�1.12.�`db_is_user_in` usage**

...
if (db\_is\_user\_in("Request-URI", "ld")) {
	...
}
...
$avp(grouptocheck)="offline";

if (db\_is\_user\_in("Credentials", $avp(grouptocheck))) {
	...
}
...

  

### 1.4.2.� `db_get_user_group(uri, output_avp)`

This function is to be used for regular expression based group membership, using DB support. The function returns true if the username in the given "uri" belongs to at least one group.

All matching group IDs shall be returned in "output\_avp" if [multiple\_gid](#param_multiple_gid "1.3.10.�multiple_gid (integer)") is enabled, otherwise only the first one to match (the records are attempted in reversed order of the results returned by the RDBMS).

Meaning of the parameters is as follows:

*   _uri (string)_ - a SIP URI to be matched against the regular expressions:
    
    *   "Request-URI" - Use Request-URI
        
    *   "To" - Use To URI.
        
    *   "From" - Use From URI
        
    *   "Credentials" - Use digest credentials username and realm.
        
    *   (default) - parse the given input as a SIP URI
        
    
*   _output\_avp (var)_ - a list of matched group IDs
    

This function can be used from REQUEST\_ROUTE and FAILURE\_ROUTE.

**Example�1.13.�`db_get_user_group` usage**

...
if (db\_get\_user\_group("Request-URI", $avp(10))) {
    xdbg("User $ru belongs to the following groups: $(avp(10)\[\*\])\\n");
    ....
};
...

  

### 1.4.3.� `aaa_is_user_in(uri, group)`

This function checks group membership, using AAA support. The function returns true if username in the given "uri" is member of the given group and false if not.

Meaning of the parameters is as follows:

*   _uri (string)_ - a SIP URI whose username and optionally domain to be used, this can be one of:
    
    *   "Request-URI" - Use Request-URI username and (optionally) domain.
        
    *   "To" - Use To username and (optionally) domain.
        
    *   "From" - Use From username and (optionally) domain.
        
    *   "Credentials" - Use digest credentials username.
        
    
*   _group (string)_ - Name of the group to check.
    

This function can be used from REQUEST\_ROUTE.

**Example�1.14.�`aaa_is_user_in` usage**

...
if (aaa\_is\_user\_in("Request-URI", "ld")) {
	...
};
...