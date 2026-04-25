## 1.4.�Exported Functions

### 1.4.1.� `bm_start_timer(name)`

Start timer “name”. A later call to “bm\_log\_timer()” logs this timer..

**Example�1.4.�`bm_start_timer` usage**

...
bm\_start\_timer("test");
...

  

### 1.4.2.� `bm_log_timer(name)`

This function logs the timer with the given ID. The following data are logged:

*   _Last msgs_ is the number of calls in the last logging interval. This equals the granularity variable.
    

*   _Last sum_ is the accumulated duration in the current logging interval (i.e. for the last “granularity” calls).
    

*   _Last min_ is the minimum duration between start/log\_timer calls during the last interval.
    

*   _Last max_ - maximum duration.
    

*   _Last average_ is the average duration between bm\_start\_timer() and bm\_log\_timer() since the last logging.
    

*   _Global msgs_ number of calls to log\_timer.
    

*   _Global sum_ total duration in microseconds.
    

*   _Global min_... You get the point. :)
    

*   _Global max_ also obvious.
    

*   _Global avg_ possibly the most interesting value.
    

**Example�1.5.�`bm_log_timer` usage**

...
bm\_log\_timer("test");
...