## 1.4.�Exported Functions

### 1.4.1.� `set_deny_filter(filter,flags)`

Sets additional deny filters. Maximum 6 may be combined. This additional filter will apply only to the current message - it will not have a global effect.

Parameters:

*   _filter_ (string) - regular expression
    
*   _flags_ (string)
    
    Default or previous added deny filter may be reset depending of the parameter value:
    
    *   _reset\_all_ - reset both default and previous added deny filters;
        
    *   _reset\_default_ - reset only the default deny filter;
        
    *   _reset\_added_ - reset only the previous added deny filters;
        
    *   _empty_ - no reset, just add the filter.
        
    

This function can be used from FAILURE\_ROUTE.

**Example�1.4.�`set_deny_filter` usage**

...
set\_deny\_filter(".\*@domain2.net","reset\_all");
set\_deny\_filter(".\*@domain1.net","");
...
				

  

### 1.4.2.� `set_accept_filter(filter,flags)`

Sets additional accept filters. Maximum 6 may be combined. This additional filter will apply only to the current message - it will not have a global effect.

Parameters:

*   _filter_ (string) - regular expression
    
*   _flags_ (string)
    
    Default or previous added deny filter may be reset depending of the parameter value:
    
    *   _reset\_all_ - reset both default and previous added accept filters;
        
    *   _reset\_default_ - reset only the default accept filter;
        
    *   _reset\_added_ - reset only the previous added accept filters;
        
    *   _empty_ - no reset, just add the filter.
        
    

This function can be used from FAILURE\_ROUTE.

**Example�1.5.�`set_accept_filter` usage**

...
set\_accept\_filter(".\*@domain2.net","reset\_added");
set\_accept\_filter(".\*@domain1.net","");
...
				

  

### 1.4.3.� `get_redirects([max_total], [max_branch])`

The function may be called only from failure routes. It will extract the contacts from all 3xx branches and append them as new branches. Note that the function will not forward the new branches, this must be done explicitly from script.

How many contacts (in total and per branch) are selected depends on the _max\_total_ and _max\_branch_ parameters:

*   max\_total (int, optional) - max overall number of contacts to be selected
    
*   max\_branch (int, optional) - max number of contacts per branch to be selected
    

Both “max\_total” and “max\_branch” default to 0 (unlimited).

NOTE that during the selection process, each set of contacts from a specific branch are ordered based on “q” value.

This function can be used from FAILURE\_ROUTE.

**Example�1.6.�`get_redirects` usage**

...
# no restrictions
get\_redirects();
...
# no limits per branch, but not more than 6 overall contacts
get\_redirects(6);
...
# max 2 contacts per branch, but no overall limit
get\_redirects(, 2);
...