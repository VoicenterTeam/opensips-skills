## 1.5.�Exported Functions

### 1.5.1.� `cc_handle_call( flowID [,param])`

This must be used only for initial INVITE requests - the function pushes the call to be handled by the call center module (via a certain flow/queue).

This function can be used from REQUEST\_ROUTE.

Parameters:

*   _flowID (string)_ - the ID of the flow to handle this call (push the call to that flow).
    
*   _param (string, optional)_ - an opaque string to be passed as parameter to the "callcenter" and "agent" B2B scenarios. It is intended for custom integration of the call center module and it is 100% up to the script writer about the value and purpose of this parameter, OpenSIPS will not touch or interpret it. You can retrieve the value of this parameter using the _$b2b\_logic.ctx_ variable with the name defined in the [b2b\_logic\_ctx\_param](#param_b2b_logic_ctx_param "1.4.32.�b2b_logic_ctx_param (string)") parameter.
    

The function returns TRUE back to the script if the call was successfully pushed and handled by the Call Center engine. IMPORTANT: you must not do any signaling on the call (reply, relay) after this point.

In case of error, FALSE is returned to the script with the following return codes:

*   **\-1** - unable to get the flow ID from the parameter;
    
*   **\-2** - unable to parse the FROM URI;
    
*   **\-3** - flow with FlowID not found;
    
*   **\-4** - no agents logged in the flow;
    
*   **\-5** - internal error;
    

**Example�1.33.�`cc_handle_call` usage**

...
if (is\_method("INVITE") and !has\_totag()) {
	if (!cc\_handle\_call("tech\_support")) {
		send\_reply(403,"Cannot handle call");
		exit;
	}
}
...

  

### 1.5.2.� `cc_agent_login(agentID, state)`

This function sets the login (on or off) state for an agent.

This function can be used from REQUEST\_ROUTE.

Parameters:

*   _agentID (string)_ - the ID of the agent
    
*   _state (int)_ - an integer value giving the new state - 0 means logged off, anything else means logged in.
    

**Example�1.34.�`cc_agent_login` usage**

...
# log off the 'agentX' agent
cc\_agent\_login("agentX",0);
...