## 1.4.�Exported Functions

### 1.4.1.� `check_fraud(user, number, profile_id)`

This method should be called each time a given _user_ calls a given _number_. It will try to match a fraud rule within the given fraud profile and update the stats (see above). Furthermore, the stats will be checked against the rule's thresholds. If any of the stats is above its threshold value, the appropriate event will also be raised (see further details below).

Designed to only work with initial INVITE messages! If a dialog is not already present, one will be created (equivalent of create\_dialog()).

Meaning of the parameters is as follows:

*   _user_ (string) - the user who is making the call. Please keep in mind that the user doesn't have to be registered. This string is only used to keep different stats for different registered users.
    
*   _number_ (string) - the number the user is calling to.
    
*   _profile\_id_ (int) - the fraud profile id (i.e. the subset of fraud rules) in which to try and find a matching fraud rule.
    

The meaning of the return code is as follows:

*   _2_ - no matching fraud rule was found
    
*   _1_ - a matching rule was found, but there is no parameter above the rule's threshlod, i.e - everything is ok
    
*   _\-1_ - there is a parameter above the warning threshold value. Check the raised event for more info
    
*   _\-2_ - there is a parameter above the critical threshold value. Check the raised event for more info
    
*   _\-3_ - something went wrong (internal mechanism failed)
    

This function can be used from REQUEST\_ROUTE and ONREPLY\_ROUTE.