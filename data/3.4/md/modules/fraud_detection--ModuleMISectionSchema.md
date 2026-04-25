## 1.5.�Exported MI Functions

### 1.5.1.� `show_fraud_stats`

Show the current statistics for all dials of a _user_ to a _prefix_.

NOTE: Since the fraud statistics are refreshed on-the-fly, as check\_fraud() is called, **this function will return stale data** if check\_fraud() has not been called at least once for the (user, prefix) pair within a newly matching time interval!

Name: _show\_fraud\_stats_

Parameters:

*   user
    
*   prefix
    

### 1.5.2.� `fraud_reload`

Reload the all the fraud rules.

Name: _fraud\_reload_

Parameters: _none_