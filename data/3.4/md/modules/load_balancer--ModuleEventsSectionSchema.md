## 1.8.�Exported Events

### 1.8.1.� `E_LOAD_BALANCER_STATUS`

This event is raised when the module changes the state of a destination, either through MI or probing.

Parameters:

*   _group_ - the group of the destination.
    
*   _uri_ - the URI of the destination.
    
*   _status_ - _disabled_ if the destination was disabled or _enabled_ if the destination is being used.