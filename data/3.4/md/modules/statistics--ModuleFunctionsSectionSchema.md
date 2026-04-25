## 1.6.�Exported Functions

### 1.6.1.� `update_stat(variable, value)`

Updates the value of the statistic variable with the new value.

Meaning of the parameters is as follows:

*   _variable_ (string) - variable to be updated;
    
*   _value_ (int) - value to update with; it may be also negative.
    

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE, FAILURE\_ROUTE and ONREPLY\_ROUTE.

**Example�1.4.�`update_stat` usage**

...
update\_stat("register\_counter", 1);
...
$var(a\_calls) = "active\_calls";
update\_stat($var(a\_calls), -1);
...

  

### 1.6.2.� `reset_stat(variable)`

Resets to zero the value of the statistic variable.

Meaning of the parameters is as follows:

*   _variable_ (string) - variable to be reset-ed
    

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE, FAILURE\_ROUTE and ONREPLY\_ROUTE.

**Example�1.5.�`reset_stat` usage**

...
reset\_stat("register\_counter");
...
$var(reg\_counter) = "register\_counter";
update\_stat($var(reg\_counter));
...

  

### 1.6.3.� `stat_iter_init(group, iter)`

Re-initializes "iter" in order to begin iterating through all statistics belonging to the given "group".

Meaning of the parameters is as follows:

*   _group_ (string)
    
*   _iter_ (string) - internally matched to a corresponding iterator
    

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE, FAILURE\_ROUTE and ONREPLY\_ROUTE.

**Example�1.6.�`stat_iter_init` usage**

...
stat\_iter\_init("packet", "iter");
...

  

### 1.6.4.� `stat_iter_next(name, val, iter)`

Attempts to fetch the current statistic to which "iter" points. If successful, the relevant data will be written to "name" and "val", while also advancing "iter". Returns negative when reaching the end of iteration.

Meaning of the parameters is as follows:

*   _name_ (var)
    
*   _val_ (var)
    
*   _iter_ (string) - internally matched to a corresponding iterator
    

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE, FAILURE\_ROUTE and ONREPLY\_ROUTE.

**Example�1.7.�`stat_iter_next` usage**

...
# periodically clear packet-related data
timer\_route \[clear\_packet\_stats, 7200\] {
	stat\_iter\_init("packet", "iter");
	while (stat\_iter\_next($var(stat), $var(val), "iter"))
		reset\_stat("packet:$var(stat)");
}
...

  

### 1.6.5.� `update_stat_series(profile, variable, value)`

Updates the value of a series statistic.

Meaning of the parameters is as follows:

*   _profile_ (string) - the profile as defined in **[stat\_series\_profile](#param_stat_series_profile "1.5.3.�stat_series_profile (string)")**
    
*   _variable_ (string) - variable to be updated;
    
*   _value_ (int) - value to update with; it may be also negative; when using _percentage_ algorithm, the resulted value represents the percentage of positive values out of the total number of values (positive + negative)
    

This function can be used from any route.

**Example�1.8.�`update_stat_series` usage**

...
# account failed calls
update\_stat\_series("perc\_1h", "ASR\_1h", -1);

# account successful calls
update\_stat\_series("perc\_1h", "ASR\_1h", 1);

# compute average PDD
update\_stat\_series("avg", "PDD", $var(pdd\_ms));
...