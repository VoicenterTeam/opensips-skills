## 1.7.�Exported Pseudo-Variables

### 1.7.1.�`$env(name)`

This PV provides access to the environment variable 'name'.

**Example�1.36.�`env(name) pseudo-variable` usage**

...
xlog("PATH environment variable is $env(PATH)\\n");
...
				 

  

### 1.7.2.�`$RANDOM`

Returns a random value from the \[0 - 2^31) range.

**Example�1.37.�`RANDOM pseudo-variable` usage**

...
$avp(10) = ($RANDOM / 16777216); # 2^24
if ($avp(10) < 10) {
   $avp(10) = 10;
}
append\_to\_reply("Retry-After: $avp(10)\\n");
sl\_send\_reply(503, "Try later");
exit;
# normal message processing follows
   
				 

  

### 1.7.3.�`$ctime(name)`

The PV provides access to broken-down time attributes.

The “name” can be:

*   _sec_ - return seconds (int 0-59)
    
*   _min_ - return minutes (int 0-59)
    
*   _hour_ - return hours (int 0-23)
    
*   _mday_ - return the day of month (int 0-59)
    
*   _mon_ - return the month (int 1-12)
    
*   _year_ - return the year (int, e.g., 2008)
    
*   _wday_ - return the day of week (int, 1=Sunday - 7=Saturday)
    
*   _yday_ - return the day of year (int, 1-366)
    
*   _isdst_ - return daylight saving time status (int, 0 - DST off, >0 DST on)
    

**Example�1.38.�`ctime(name) pseudo-variable` usage**

...
if ($ctime(year) == 2008) {
	xlog("request: $rm from $fu to $ru in year 2008\\n");
}
...
				 

  

### 1.7.4.�`$shv(name)`

It is a class of pseudo-variables stored in shared memory. The value of $shv(name) is visible across all opensips processes. Each “shv” has single value and it is initialized to integer 0. You can use “shvset” parameter to initialize the shared variable. The module exports a set of MI functions to get/set the value of shared variables.

**Example�1.39.�`shv(name) pseudo-variable` usage**

...
modparam("cfgutils", "shvset", "debug=i:1")
...
if ($shv(debug) == 1) {
	xlog("request: $rm from $fu to $ru\\n");
}
...