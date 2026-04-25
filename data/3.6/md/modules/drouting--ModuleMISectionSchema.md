## 1.5.�Exported MI Functions

### 1.5.1.� `dr_reload`

Command to reload routing rules from database.

*   if `use_partition` is set to 0 - all routing rules will be reloaded.
    
    *   _inherit\_state_ (optional) : whether inherit old state of the gateway , default is y.
        
        *   “n”: no inherit state
            
        *   “y”: inherit state
            
        
    
*   if `use_partition` is set to 1, the parameters are:
    
    *   _partition\_name_ (optional) - if not provided all the partitions will be reloaded, otherwise just the partition given as parameter will be reloaded.
        
    
    *   _inherit\_state_ (optional) : whether inherit old state of the gateway , default is y.
        
        *   “n”: no inherit state
            
        *   “y”: inherit state
            
        
    

MI FIFO Command Format:

		opensips-cli -x mi dr\_reload part\_1
		

### 1.5.2.�`dr_gw_status`

Gets the status (enabled or disabled) of one or multiple gateways. The function can also be used to set the status of a single gateway.

*   if `use_partitions` is set to 0, the parameters are:
    
    *   _gw\_id_ (optional) - the id of a gateway. If provided, the function will return/set (depnding if the second parameter is given) the status of that gateway, otherwise it will list all gateways along with their statuses.
        
    *   _status_ (optional) - the new status to be forced for a GW (0 - disable, 1 - enable). Only makes sense if _gw\_id_ is provided.
        
    
*   if `use_partitions` is set to 1, the parameters are:
    
    *   _partition\_name_
        
    *   _gw\_id_ (optional) - the id of a gateway. If provided, the function will return/set (depnding if the third parameter is given) the status of that gateway, otherwise it will list all gateways in the given partition along with their statuses.
        
    *   _status_ (optional) - the new status to be forced for a GW (0 - disable, 1 - enable). Only makes sense if _gw\_id_ is provided.
        
    

**Example�1.49.�`dr_gw_status` usage when `use_partitions` is set to 0**

$ opensips-cli -x mi dr\_gw\_status gw\_id=2
State:: Active
$ opensips-cli -x mi dr\_gw\_status gw\_id=2 status=0
$ opensips-cli -x mi dr\_gw\_status gw\_id=2
Enabled:: Disabled MI
$ opensips-cli -x mi dr\_gw\_status gw\_id=3
Enabled:: Inactive

  

**Example�1.50.�`dr_gw_status` usage when `use_partitions`is set to 1**

$ opensips-cli -x mi dr\_gw\_status partition\_name=part\_1 gw\_id=my\_gw
State:: Active
$ opensips-cli -x mi dr\_gw\_status partition\_name=part\_1 gw\_id=my\_gw status=0
$ opensips-cli -x mi dr\_gw\_status partition\_name=part\_1 gw\_id=my\_gw
enabled:: disabled mi
$ opensips-cli -x mi dr\_gw\_status partition\_name=partition8 status=3
enabled:: inactive

  

### 1.5.3.�`dr_carrier_status`

Gets the status (enabled or disabled) of one or multiple carriers. The function can also be used to set the status of a single carrier.

*   if `use_partitions` is set to 0, the parameters are:
    
    *   _carrier\_id_ (optional) - the id of a carrier. If provided, the function will return/set (depnding if the second parameter is given) the status of that carrier, otherwise it will list all carriers along with their statuses.
        
    *   _status_ (optional) - the new status to be forced for a carrier (0 - disable, 1 - enable). Only makes sense if _carrier\_id_ is provided.
        
    
*   if `use_partitions` is set to 1, the parameters are:
    
    *   _partition\_name_
        
    *   _carrier\_id_ (optional) - the id of a carrier. If provided, the function will return/set (depnding if the third parameter is given) the status of that carrier, otherwise it will list all carriers contained in the given partition along with their statuses.
        
    *   _status_ (optional) - the new status to be forced for a carrier (0 - disable, 1 - enable). Only makes sense if _carrier\_id_ is provided.
        
    

**Example�1.51.�`dr_carrier_status` usage when `use_partitions` is 0**

$ opensips-cli -x mi dr\_carrier\_status carrier\_id=CR1
Enabled:: no
$ opensips-cli -x mi dr\_carrier\_status carrier\_id=CR1 status=1
$ opensips-cli -x mi dr\_carrier\_status carrier\_id=CR1
Enabled:: yes

  

**Example�1.52.�`dr_carrier_status` usage when `use_partitions` is 1**

$ opensips-cli -x mi dr\_carrier\_status partition\_name=my\_partition carrier\_id=CR1
Enabled:: no
$ opensips-cli -x mi dr\_carrier\_status partition\_name=partition\_1 carrier\_id=CR1 status=1
$ opensips-cli -x mi dr\_carrier\_status partition\_name=partition\_3 carrier\_id=CR1
Enabled:: yes

  

### 1.5.4.�`dr_reload_status`

Gets the time of the last reload for any partition.

*   if `use_partition` is set to 0 - the function doesn't receive any parameter. It will list the date of the last reload for the default (and only) partition.
    
*   if `use_partition` is set to 1, the parameters are:
    
    *   _partition\_name_ (optional) - if not provided the function will list the time of the last update for every partition. Otherwise, the function will list the time of the last reload for the given partition.
        
    

**Example�1.53.�`dr_reload_status` usage when `use_partitions` is 0**

$ opensips-cli -x mi dr\_reload\_status
Date:: Tue Aug 12 12:26:00 2014

  

**Example�1.54.�`dr_reload_status` usage when `use_partitions` is 1**

$ opensips-cli -x mi dr\_reload\_status
Partition:: part\_test Date=Tue Aug 12 12:24:13 2014
Partition:: part\_2 Date=Tue Aug 12 12:24:13 2014
$ opensips-cli -x mi dr\_reload\_status part\_test
Partition:: part\_test Date=Tue Aug 12 12:24:13 2014

  

### 1.5.5.�`dr_number_routing`

Gets the matched prefix along with the list of the gateways / carriers to which a number would be routed when using the do\_routing function.

*   if `use_partition` is set to 1 the function will have 3 parameters:
    
    *   _partition\_name_
        
    *   _group\_id_ (optional) - the group id of the rules to check against
        
    *   _number_ - the number to test against
        
    
*   if `use_partition` is set to 0 the function will have 2 parameters:
    
    *   _group\_id_ (optional) - the group id of the rules to check against
        
    *   _number_ - the number to test against
        
    

MI FIFO Command Format:

		opensips-cli -x mi dr\_number\_routing partition\_name=part1 group\_id=3 number=012340987
		

### 1.5.6.� `dr_enable_probing`

Enables/disables gateway probing or returns the current gateway probing status.

Parameters:

*   _status_ (optional) - 1 - enable, 0 - disable gateway probing
    

**Example�1.55.�`dr_enable_probing` usage**

$ opensips-cli -x mi dr\_enable\_probing
Status:: 1
$ opensips-cli -x mi dr\_enable\_probing 0
$ opensips-cli -x mi dr\_enable\_probing
Status:: 0