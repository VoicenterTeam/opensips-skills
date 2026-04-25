## 1.8.�Exported MI Functions

### 1.8.1.� `rl_list`

Lists the parameters and variabiles in the ratelimit module.

Name: _rl\_list_

Parameters:

*   _pipe_ (optional) - indicates the name of the single pipe to be listed.
    
*   _filter_ (optional) - a pattern used to filter the active pipes to be listed. The filter is a shell wildcard pattern (see glob(7)).
    
*   _filter\_out_ (optional) - a pattern used to filter out the active pipes NOT to be listed. The filter is a shell wildcard pattern (see glob(7)).
    

Note that you cannot combine multiple paramters when calling this function. If using parameters, only one is accepted.

If no parameter are passed to the function, all the active pipes are listed.

MI FIFO Command Format:

		opensips-cli -x mi rl\_list pipe=gw\_10.0.0.1
		opensips-cli -x mi rl\_list filter=gw\_\*
		

### 1.8.2.� `rl_dump_pipe`

Exposes all the details about the current runtime data (specific to the pipe's algorithm) of a pipe. Currently make sense for SBT.

Name: _rl\_dump\_pipe_

Parameters:

*   _pipe_ - indicates the name of the pipe.
    

MI FIFO Command Format:

		opensips-cli -x mi rl\_dump\_pipe gw\_10.0.0.1
		

### 1.8.3.� `rl_reset_pipe`

Resets the counter of a specified pipe.

Name: _rl\_reset\_pipe_

Parameters:

*   _pipe_ - indicates the name of the pipe whose counter should be reset.
    

MI FIFO Command Format:

		opensips-cli -x mi rl\_reset\_pipe gw\_10.0.0.1
		

### 1.8.4.� `rl_set_pid`

Sets the PID Controller parameters for the Feedback Algorithm.

Name: _rl\_set\_pid_

Parameters:

*   _ki_ - the integral parameter.
    
*   _kp_ - the proportional parameter.
    
*   _kd_ - the derivative parameter.
    

MI FIFO Command Format:

		opensips-cli -x mi rl\_set\_pid 0.5 0.5 0.5
		

### 1.8.5.� `rl_get_pid`

Gets the list of in use PID Controller parameters.

Name: _rl\_get\_pid_

Parameters: _none_

MI FIFO Command Format:

		opensips-cli -x mi rl\_get\_pid
		

### 1.8.6.� `rl_bin_status`

Dumps each destination used for replication, as well as the timestamp of the last message received from them.

Name: _rl\_bin\_status_

Parameters: _none_

MI FIFO Command Format:

		opensips-cli -x mi rl\_bin\_status