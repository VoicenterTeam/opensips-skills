## 1.6.�Exported MI Functions

### 1.6.1.�`bm_enable_global`

Enables/disables the module.

Parameters:

*   _enable_ - value may be -1, 0 or 1. See discription of "enable" parameter.
    

MI FIFO Command Format:

			opensips-cli -x mi bm\_enable\_global 1
			

### 1.6.2.�`bm_enable_timer`

Enable or disable a single timer.

Parameters:

*   _timer_ - timer name
    
*   _enable_ - enable (1) or disable (0) timer
    

MI FIFO Command Format:

**Example�1.6.�Enabling a timer**

...
opensips-cli -x mi bm\_enable\_timer test 1
...

  

### 1.6.3.�`bm_granularity`

Modifies the benchmarking granularity.

Parameters:

*   _granularity_ - See discription of "granularity" parameter.
    

MI FIFO Command Format:

			opensips-cli -x mi bm\_granularity 300
			

### 1.6.4.�`bm_loglevel`

Modifies the module log level.

Parameters:

*   _log\_level_ - See discription of "loglevel" parameter.
    

MI FIFO Command Format:

			opensips-cli -x mi bm\_loglevel 4
			

### 1.6.5.�`bm_poll_results`

Returns the current and global results for each timer. This command is only available if the "granularity" variable is set to 0. It can be used to get results in stable time intervals instead of every N messages. Each timer will have 2 nodes - the local and the global values. Format of the values is the same as the one normally used in logfile. This way of getting the results allows to interface with external graphing applications like Munin.

If there were no new calls to _bm\_log\_timer_ since last check, then all current values of a timer will be equal 0. Each call to _bm\_poll\_results_ will reset current values (but not global ones).

**Example�1.7.�Getting the results via FIFO interface**

...
opensips-cli -x mi bm\_poll\_results
register\_timer
	3/40/12/14/13.333333
	9/204/12/97/22.666667
security\_check\_timer
	3/21/7/7/7.000000
	9/98/7/41/10.888889
...