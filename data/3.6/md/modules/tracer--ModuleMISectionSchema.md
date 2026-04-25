## 1.5.�Exported MI Functions

### 1.5.1.� `trace`

Enable/disable tracing(globally or for a specific trace id) or dump info about trace ids. This command requires named parameters (each parameter is ginven in the format param\_name=param\_value).

Name: _trace_

Parameters:

*   _id_ (optional) - the name of the tracing instance. If this parameter is missing the command will either dump info for all tace ids(and return the global tracing state) or set the global tracing state.
    
*   _mode_ (optional) - possible values are:
    
    *   "on" - enable tracing
        
    *   "off" - disable tracing
        
    
    If the first parameter is missing, the command wil set the global tracing state, otherwise it will set the state for a specific trace id. If you turn global trace on but some of the trace ids had tracing set to off, then they shall not do tracing. If you want to turn the tracing on for all trace ids you will have to set it separately for each of them.
    
    If this parameter is missing but the first is set, the command will only dump info about that specific trace id. If both parameters are missing, the command will return the global tracing state and dump info for each id.
    

MI FIFO Command Format:

\# Display global tracing mode and all trace destinations:
opensips-cli -x mi trace
# Turn off global tracing:
opensips-cli -x mi trace mode=off
# Turn on tracing for destination id tid2:
opensips-cli -x mi trace id=tid2 mode=on
		

### 1.5.2.� `trace_start`

Creates a dynamic tracing destination based using custom filters. This function can be used to debug calls for certain destinations real-time.

Dynamic destinations are not restart persistent!

Name: _trace\_start_

Parameters:

*   _id_ - the name of the tracing instance.
    
*   _uri_ - the destination uri for this instance.
    
*   _filter_ (optional) - used to filter the traffic received by the sender. This parameter should be an array that can contain multiple filters in the _condition=value_ format. Possible values for the _condition_ argument are:
    
    *   caller
        
        \- filter based on the caller (From username)
    *   callee
        
        \- filter based on the callee (R-URI username)
    *   ip
        
        \- filter based on the source IP of the message
    
    The _condition_ parameter can consist of multiple different filters. In order to satisfy the overall condition and send traffic to the desired destination, all conditions have to be satisfied.
    
    If this parameter is missing all traffic is forwarded to the destination.
    
    The filter is applied for any incoming request
    
*   _scope_ - the scope to engage the tracing for. The format received by this parameter is similar to the one received by the _trace()_ function.
    
*   _type_ - the type of messages you want to receive. The format received by this parameter is similar to the one received by the _trace()_ function.
    

MI FIFO Command to start tracing calls from IP 127.0.0.1 to HEP destination 10.0.0.1:9060:

		opensips-cli -x mi trace\_start id=ip\_filter uri=hep:10.0.0.1:9060 filter=ip=127.0.0.1
		

MI FIFO Command to start tracing calls from user Alice to user Bob:

		opensips-cli -x mi trace\_start id=alice\_bob uri=hep:10.0.0.1:9060 filter=caller=Alice filter=caller=Bob
		

### 1.5.3.� `trace_stop`

Stops OpenSIPS from sending traffic to a dynamic trace id created using the _trace\_start_ command.

Name: _trace\_stop_

Parameters:

*   _id_ - the name of the tracing instance to be stopped.
    

MI FIFO Command to stop tracing calls from user Alice to user Bob:

		opensips-cli -x mi trace\_stop alice\_bob