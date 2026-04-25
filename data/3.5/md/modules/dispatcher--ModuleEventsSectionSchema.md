## 1.6.�Exported Events

### 1.6.1.� `E_DISPATCHER_STATUS`

This event is raised when the dispatcher module marks a destination as activated or deactivated.

Parameters:

*   _partition_ - the partition name of the destination.
    
*   _group_ - the group of the destination.
    
*   _address_ - the address of the destination.
    
*   _status_ - _active_ if the destination gets activated or _inactive_ if the destination is detected unresponsive.