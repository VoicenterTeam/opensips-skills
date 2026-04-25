## 1.7.�Exported MI Functions

### 1.7.1.� `cc_reload`

Command to reload flows and agents definition from database.

It takes no parameter.

MI FIFO Command usage:

opensips-cli -x mi cc\_reload

### 1.7.2.� `cc_agent_login`

Command to login an agent into the Call Center engine.

Parameters:

*   _agent\_id_ - ID of the agent
    
*   _state_ - the new login state (0 - log off, 1 - log in)
    

MI FIFO Command usage:

opensips-cli -x mi cc\_agent\_login agentX 0

### 1.7.3.� `cc_list_queue`

Command to list all the calls in queuing - for each call, the following attributes will be printed: the call id, the calling user info, the flow of the call, for how long the call is in the queue, the ETW for the call, call priority and the call skill (inherited from the flow).

It takes no parameter.

MI FIFO Command usage:

opensips-cli -x mi cc\_list\_queue

### 1.7.4.� `cc_list_flows`

Command to list all the flows - for each flow, the following attributes will be printed: the flow ID, the avg. call duration, how many calls were processed, how many agents are logged, and how many onging calls are.

It takes no parameter.

MI FIFO Command usage:

opensips-cli -x mi cc\_list\_flows

### 1.7.5.� `cc_list_agents`

Command to list all the agents - for each agent, the following attributes will be printed: agent ID, agent login state, agent state (free, wrapup, incall) and info on ongoing sessions.

It takes no parameter.

MI FIFO Command usage:

opensips-cli -x mi cc\_list\_agents

### 1.7.6.� `cc_list_calls`

Command to list all the ongoing calls - for each call, the following attributes will be printed: call ID, call state (welcome, queued, toagent, ended), call duration, flow it belongs to, agent serving the call (if any).

It takes no parameter.

MI FIFO Command usage:

opensips-cli -x mi cc\_list\_agents

### 1.7.7.� `cc_dispatch_call_to_agent`

This function sends a given call (from the queue) to a given agent. For the operation to succeed, several conditions must be met:

*   the call must be in the queue
    
*   the agent must be logged in
    
*   the agent must support the skill required by the call
    
*   the agent must support the media (RTP/MSRP) requiref by the call
    
*   the agent must have available sessions for the requested media
    

It takes two parameters.

*   _call\_id_ - the ID of the call, as provided by the queue listing MI command [cc\_list\_queue](#mi_cc_list_queue "1.7.3.� cc_list_queue")
    
*   _agent\_id_ - the ID of the call, as provided by the agents listing MI command [cc\_list\_agents](#mi_cc_list_agents "1.7.5.� cc_list_agents")
    

IMPORTANT: in order to be used, you need to be sure that the internal call dispatching is DISABLED via the [chat\_internal\_call\_dispatching](#param_internal_call_dispatching "1.4.8.�internal_call_dispatching (int)") module parameter or the [cc\_internal\_call\_dispatching](#mi_cc_internal_call_dispatching "1.7.8.� cc_internal_call_dispatching") MI command.

MI FIFO Command usage:

opensips-cli -x mi cc\_dispatch\_call\_to\_agent B2B452.dee2.33 agentX

### 1.7.8.� `cc_internal_call_dispatching`

Command to inspect and/or change the [chat\_internal\_call\_dispatching](#param_internal_call_dispatching "1.4.8.�internal_call_dispatching (int)") setting

It takes one optional parameter `dispatching` if the value of the setting should be changed. A 0 value means disabling the internal dispatching, a non zero means to enable it.

MI FIFO Command usage:

opensips-cli -x mi cc\_internal\_call\_dispatching 0

### 1.7.9.� `cc_reset_stats`

Command to reset all counter-like statistics.

It takes no parameter.

MI FIFO Command usage:

opensips-cli -x mi cc\_reset\_stats