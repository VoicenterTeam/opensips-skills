## 1.4.�Exported Functions

### 1.4.1.� `sr_set_status( group, status, [details])`

Sets a new status (and details) for a Status/Report group.

Meaning of the parameters is as follows:

*   _group_ (string) - the name of the SR group; you can change the status only for the groups defined via this module (as parameter).
    
*   _status_ (int) - the new status value ( strict positive meaning OK, strict negative meaning NOT OK, 0 is not accepts, it is converted to 1 automatically).
    
*   _details_ (string, optional) - a descripting text to detail the status value
    

This function can be used from any route.

**Example�1.2.�`sr_set_status` usage**

...
sr\_set\_status( "script\_caching", 1, "completed");
...

  

### 1.4.2.� `sr_add_report( group, report)`

Adds a new report/log to a Status/Report group.This must have been defined via this module too.

Meaning of the parameters is as follows:

*   _group_ (string) - the name of the SR group; you can change the status only for the groups defined via this module (as parameter).
    
    _report_ (string) - the log to be added.
    

This function can be used from any route.

**Example�1.3.�`sr_add_report` usage**

...
sr\_add\_report("security","IP $si detected as attacker");
...