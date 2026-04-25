## 1.7.�Exported Events

### 1.7.1.� `E_QROUTING_BAD_DST`

This event may be raised during routing, asynchronously, whenever the score of a (prefix, destination) pair falls below [event\_bad\_dst\_threshold](#param_event_bad_dst_threshold "1.4.12.�event_bad_dst_threshold (string)").

Parameters:

*   _partition_ - drouting partition name
    
*   _rule\_id_ - database id of the drouting rule
    
*   _dst\_name_ - name of the concerned gateway or carrier