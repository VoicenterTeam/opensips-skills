## 1.8.�Exported Events

### 1.8.1.� `E_CALLCENTER_AGENT_REPORT`

This event is raised when the status of an agent changes.

Parameters:

*   _agent\_id_ - the id of the agent.
    
*   _state_ - the status of the agent:
    
    *   offline
    *   free
    *   incall
    *   wrapup
    
*   _wrapup\_ends_ - the timestamp when the wrapup state will end; published only if the state is "wrapup"
    
*   _flow\_id_ - the flow ID that delivered the call for this agent; published only if the state is "incall"