## 1.6.�Exported Events

### 1.6.1.� `E_DROUTING_STATUS`

This event is raised when the module changes the state of a gateway, either through an MI command, probing or script function.

Parameters:

*   _partition_ - the name of the partition.
    
*   _gwid_ - the gateway identifier.
    
*   _address_ - the address of the gateway.
    
*   _status_ - _disabled MI_ if the gateway was disabled using MI commands, _probing_ if the gateway is being pinged, _inactive_ if it was disabled from the script or _active_ if the gateway is enabled.