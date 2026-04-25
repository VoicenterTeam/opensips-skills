## 1.6.�Exported MI Functions

### 1.6.1.� `b2b_trigger_scenario`

This command initializes a new B2B session where OpenSIPS will start a call from the middle. The initial entities to be connected are specified through the command's parameters and further scenario logic can be implemented in the b2b\_logic dedicated routes.

Name: _b2b\_trigger\_scenario_

Parameters:

*   _senario\_id_ : ID for the scenario of this B2B session.
    
*   _entity1_ - first entity to be connected; specified in the following format: _id,dest\_uri\[,from\_dname\]_ where:
    
    *   _id_ - ID used to reference this entity in further B2B actions
        
    *   _dest\_uri_ - URI of the new destination
        
    *   _from\_dname (optional)_ - Display name to use in the From header.
        
    
*   _entity2_ - second entity to be connected; specified in the same format as _entity1_
    
*   _context (array, optional)_ - array of B2B context values, in the format: _key=value_
    

MI FIFO Command Format:

	opensips-cli -x mi b2b\_trigger\_scenario marketing client1,sip:bob@opensips.org client2,sip:322@opensips.org:5070 agent\_uri=sip:alice@opensips.org
		

### 1.6.2.� `b2b_bridge`

This command can be used by an external application to tell B2BUA to bridge a call party from an on going dialog to another destination. By default the caller is bridged to the new uri and BYE is set to the callee. You can instead bridge the callee if you send 1 as the third parameter.

Name: _b2b\_bridge_

Parameters:

*   _dialog\_id_ : the _b2b\_logic key_, or the _callid;from-tag;to-tag_ of the ongoing dialog.
    
*   _new\_uri_ - the uri of the new destination
    
*   _flag_ (optional) - used to specify that the callee must be bridged to the new destination. If not present the caller will be bridged. Possible values are '0' or '1'.
    
*   _prov\_media\_uri_ (optional) - the uri of a media server able to play provisional media starting from the beginning of the bridging scenario to the end of it. It is optional. If not present, no other entity will be envolved in the bridging scenario
    

MI FIFO Command Format:

	opensips-cli -x mi b2b\_bridge 1020.30 sip:alice@opensips.org
	

opensips-cli Command Format:

	opensips-cli -x mi b2b\_bridge 1020.30 sip:alice@opensips.org
	

### 1.6.3.� `b2b_list`

This command can be used to list the internals of b2b\_logic entities.

Name: _b2b\_list_

Parameters: _none_

MI FIFO Command Format:

	opensips-cli -x mi b2b\_list
	

### 1.6.4.� `b2b_terminate_call`

Terminates an ongoing B2B session.

Name: _b2b\_terminate\_call_

Parameters:

*   _key_ : the _b2b\_logic key_ or the _callid;from-tag;to-tag_ of one of call legs of the ongoing session.
    

MI FIFO Command Format:

	opensips-cli -x mi b2b\_terminate\_call 159.0