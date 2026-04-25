## 1.4.�Exported MI Functions

### 1.4.1.� `msrp_trace`

Name: _msrp\_trace_

Parameters:

*   trace\_mode(optional): set MSRP tracing on and off. This parameter can be missing and the command will show the current tracing status for this module( on or off ); Possible values:
    
    *   on
        
    *   off
        
    

MI FIFO Command Format:

			:msrp\_trace:\_reply\_fifo\_file\_
			trace\_mode
			\_empty\_line\_