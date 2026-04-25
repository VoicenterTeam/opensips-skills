## 1.5.�Exported MI Functions

### 1.5.1.� `ds_set_state`

Sets the status for a destination address (can be use to mark the destination as active or inactive).

Name: _ds\_set\_state_

Parameters:

*   _state_ : state of the destination address
    
    *   “a”: active
        
    *   “i”: inactive
        
    *   “p”: probing
        
    
*   _group_: partition name followed by colon and destination group id. If the partition name is omitted, the default partition will be used
    
*   _address_: address of the destination in the group
    

MI FIFO Command Format:

opensips-cli -x mi ds\_set\_state a 2 sip:10.0.0.202

### 1.5.2.� `ds_list`

It lists the groups and included destinations of all the partitions.

Name: _ds\_list_

Parameters:

*   _full_ (optional) - adds the weight, priority and description fields to the listing
    
*   _partition_ (optional) - return only destinations and sets in the provided partition.
    

MI FIFO Command Format:

opensips-cli -x mi ds\_list

### 1.5.3.� `ds_reload`

It reloads the groups and included destinations for a specified partition or all partitions.

Name: _ds\_reload_

Parameters:

*   _partition_ (optional) - name of the partition to be reloaded. default partition is "default".
    
*   _inherit\_state_ (optional) : whether inherit old state of the destination , default is y.
    
    *   “n”: no inherit state
        
    *   “y”: inherit state
        
    

MI FIFO Command Format:

opensips-cli -x mi ds\_reload
opensips-cli -x mi ds\_reload inherit\_state=n

### 1.5.4.� `ds_push_script_attrs`

Pushes script attrs for the dispatcher entry defined by IP, Port, setid, and optionally partition.

Name: _ds\_push\_script\_attrs_

Parameters:

*   _attrs_ : new attributes to be pushed
    
*   _ip_: IP for which we are pushing script attributes
    
*   _port_: Port for which we are pushing script attributes
    
*   _setid_: Setid for which we are pushing script attributes
    
*   _partition ( optional )_: Partition for which we are pushing script attributes
    

MI FIFO Command Format:

#opensips-cli -x mi ds\_push\_script\_attrs '{"ping":"30000","load":"50"}' '192.168.0.107' 5091 1 main