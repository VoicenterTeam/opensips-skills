## 1.9.�Exported Pseudo-Variables

#### 1.�`$cc_state`

Returns the state of a call.

Possible values returned are:

*   _welcome_ - the welcome message is played.
    
*   _dissuading1_ - the first dissuading message is played.
    
*   _dissuading2_ - the second dissuading message is played.
    
*   _queue_ - the call is in queue.
    
*   _preagent_ - the agent is being called.
    
*   _toagent_ - the agent is in call.
    

**Example�1.35.�$rtpquery Usage**

...
	$json(reply) := $rtpquery;
	xlog("Total RTP Stats: $json(reply/totals)\\n");
...
		

  

NONE