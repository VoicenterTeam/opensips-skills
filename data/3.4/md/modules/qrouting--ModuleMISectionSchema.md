## 1.6.�Exported MI Functions

### 1.6.1.�`qr_reload`

Reload all quality-based routing rules from the SQL database.

MI FIFO Command Format:

opensips-cli -x mi qr\_reload
		

### 1.6.2.�`qr_status`

Inspect the signaling quality statistics of the current [history\_span](#param_history_span "1.4.4.�history_span (integer)") for all drouting gateways in all partitions, with various levels of filtering.

Parameters:

*   _partition (optional)_ - a specific drouting partition to list statistics for
    
*   _rule\_id (optional)_ - a specific drouting rule database id to list statistics for
    
*   _dst\_name (optional)_ - a specific gateway or carrier name to list statistics for
    

MI FIFO Command Format:

opensips-cli -x mi qr\_status
opensips-cli -x mi qr\_status pstn
opensips-cli -x mi qr\_status pstn 11 MY-GW-3
opensips-cli -x mi qr\_status pstn 17 MY-CARR-7
		

### 1.6.3.�`qr_disable_dst`

Within a given routing rule, temporarily remove the given gateway or carrier from routing, until they are re-enabled manually. The removal effect will be lost on an OpenSIPS restart.

Parameters:

*   _partition (optional)_ - drouting partition
    
*   _rule\_id_ - database id of the drouting rule
    
*   _dst\_name_ - gateway or carrier to disable
    

MI FIFO Command Format:

opensips-cli -x mi qr\_disable\_dst 14 MY-CARR-7
opensips-cli -x mi qr\_disable\_dst pstn 81 MY-GW-3
		

### 1.6.4.�`qr_enable_dst`

Within a given routing rule, re-introduce the given gateway or carrier into the routing process.

Parameters:

*   _partition (optional)_ - drouting partition
    
*   _rule\_id_ - database id of the drouting rule
    
*   _dst\_name_ - gateway or carrier to enable
    

MI FIFO Command Format:

opensips-cli -x mi qr\_enable\_dst 14 MY-CARR-7
opensips-cli -x mi qr\_enable\_dst pstn 81 MY-GW-3