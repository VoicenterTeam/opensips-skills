## 1.3.�Exported Parameters

### 1.3.1.�`enable` (int)

Even when the module is loaded, benchmarking is not enabled per default. This variable may have three different values:

*   \-1 - Globally disable benchmarking
    
*   0 - Enable per-timer enabling. Single timers are inactive by default and can be activated through the MI interface as soon as that feature is implemented.
    
*   1 - Globally enable benchmarking
    

_Default value is “0”._

**Example�1.1.�Set `enable` parameter**

...
modparam("benchmark", "enable", 1)
...

  

### 1.3.2.�`granularity` (int)

Logging normally is not done for every reference to the log\_timer() function, but only every n'th call. n is defined through this variable. A sensible granularity seems to be 100.

If granularity is set to 0, then nothing will be logged automatically. Instead bm\_poll\_results MI command can be used to retrieve the results and clean the local values.

_Default value is “100”._

**Example�1.2.�Set `granularity` parameter**

...
modparam("benchmark", "granularity", 500)
...

  

### 1.3.3.�`loglevel` (int)

Set the log level for the benchmark logs. These levels should be used:

*   \-3 - L\_ALERT
    
*   \-2 - L\_CRIT
    
*   \-1 - L\_ERR
    
*   1 - L\_WARN
    
*   2 - L\_NOTICE
    
*   3 - L\_INFO
    
*   4 - L\_DBG
    

_Default value is “3” (L\_INFO)._

**Example�1.3.�Set `loglevel` parameter**

...
modparam("benchmark", "loglevel", 4)
...

  

This will set the logging level to L\_DBG.