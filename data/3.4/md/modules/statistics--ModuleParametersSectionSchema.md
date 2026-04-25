## 1.5.�Exported Parameters

### 1.5.1.�`variable` (string)

Name of a new statistic variable. The name may be followed by additional flag which describe the variable behavior:

*   _no\_reset_ : variable cannot be reset.
    

**Example�1.1.�variable example**

modparam("statistics", "variable", "register\_counter")
modparam("statistics", "variable", "active\_calls/no\_reset")

  

### 1.5.2.�`stat_groups` (string)

A comma-separated values string, specifying the statistic groups that may be used throughout the OpenSIPS script. Groups cannot contain leading or trailing whitespace characters.

**Example�1.2.�setting the stat\_groups parameter**

modparam("statistics", "stat\_groups", "method, packet, response")

  

### 1.5.3.�`stat_series_profile` (string)

Used to define a statistic series profile. Has the following format: _name: \[attr=value\]\*_, where _name_ represents the name of the profile, and _attr=value_ contains multiple settings of the defined profile. Possible attributes and their values are:

*   _algorithm_ - indicates the way data should be stored and accumulated over the specified timeframe. Possible values are: _accumulate_, _average_ and _percentage_, as described in the **[Section�1.3, “Statistic Series”](#section_stat_series "1.3.�Statistic Series")** paragraph (default is _accumulate_)
    
*   _hash\_size_ - each statistic defined/used is stored in a hash map attached to the profile; this setting tunes the size of the hash (default is: 8)
    
*   _group_ - indicates the group where the statistics beloging to this profile are grouped (as described in **[stat\_groups](#param_stat_groups "1.5.2.�stat_groups (string)")** (default is to use the same group as the profile)
    
*   _window_ - the number of seconds a timeframe has; all older values (out of the specified window) are discarded (default is _60_ seconds)
    
*   _slots_ - the number of slots per window; used to tune the granularity of the circular buffer; the higher the number of slots is, the more accurate the resulted statistic; (default is the same value of the _window_ parameter)
    
*   _percentage\_factor_ - used for _percentage_ algorithm profiles to specify the percentage factor to be used (defaults to _100_)
    

This parameter can be set multiple times, for each profile needed.

**Example�1.3.�setting the stat\_series\_profile parameter**

...
# define a statistic that accumulates average values in the last minute
modparam("statistics", "stat\_series\_profile", "avg: algorithm=average")
...
# define a statistic that accumulates average values in the 10 minutes
# with 1 minute granularity (10 slots out of the 600s window)
modparam("statistics", "stat\_series\_profile", "avg\_10m: algorithm=average window=600 slots=10")
...
# define a statistic that computes the percentage of values in the last hour
# with 10 minutes granularity (6 slots out of the 3600s window)
modparam("statistics", "stat\_series\_profile", "perc\_1h: algorithm=percentage window=3600 slots=6")
...