## 1.5.�Exported Functions

### 1.5.1.� `qr_set_xstat(rule_id, gw_name, stat_name, inc_by, [part], [inc_total])`

Provide a new sample value for an extra statistic on a given (prefix, gateway) combination. Extra statistics may be defined using the [extra\_stats](#param_extra_stats "1.4.6.�extra_stats (string)") module parameter.

Parameters:

*   _rule\_id (integer)_ - database id of the drouting rule holding the prefix and its destinations
    
*   _gw\_name (string)_ - gateway to account the statistic for. The gateway must be part of the above rule's destinations.
    
*   _stat\_name (string)_ - statistic to account
    
*   _inc\_by (string)_ - quoted floating point number, representing the amount to add to the stat
    
*   _part (string, optional, default: 'Default')_ - the drouting partition to use
    
*   _inc\_total (string, optional, default: 1)_ - the amount to add to the total stat counter. Usually, this value should be 1, but it may make sense to set it to 0 when a custom statistic needs to be set a 2nd, 3rd, etc. time across the duration of the same established call.
    

This function can be used from any route.

**Example�1.14.�`qr_set_xstat()` usage**

\# the MoS is set exactly once per call, so we can omit "inc\_total"
$var(rule\_id) = 1574;
$var(gw\_name) = "GW-28";
$var(mos\_score) = "4.28";
qr\_set\_xstat($var(rule\_id), $var(gw\_name), "mos", $var(mos\_score));
	

  

### 1.5.2.� `qr_disable_dst(rule_id, dst_name, [part])`

Within a given routing rule, temporarily remove the given gateway or carrier from routing, until they are re-enabled via [qr\_enable\_dst()](#func_qr_enable_dst "1.5.3.� qr_enable_dst(rule_id, dst_name, [part])") or [qr\_enable\_dst](#mi_qr_enable_dst "1.6.4.�qr_enable_dst"). The removal effect will be lost on an OpenSIPS restart.

Parameters:

*   _rule\_id (integer)_ - database id of the drouting rule
    
*   _dst\_name (string)_ - gateway or carrier to disable
    
*   _part (string, optional)_ - drouting partition
    

This function can be used from any route.

**Example�1.15.�`qr_disable_dst()` usage**

\# the signaling quality for @rule\_id through @dst\_name is degrading, remove it!
event\_route \[E\_QROUTING\_BAD\_DST\]
{
	qr\_disable\_dst($param(rule\_id), $param(dst\_name), $param(partition));
}
	

  

### 1.5.3.� `qr_enable_dst(rule_id, dst_name, [part])`

Within a given routing rule, re-introduce the given gateway or carrier into the routing process.

Parameters:

*   _rule\_id (integer)_ - database id of the drouting rule
    
*   _dst\_name (string)_ - gateway or carrier to disable
    
*   _part (string, optional)_ - drouting partition
    

This function can be used from any route.

**Example�1.16.�`qr_enable_dst()` usage**

\# the ban has expired, let's re-enable this gateway and see how it behaves
qr\_enable\_dst($param(rule\_id), $param(dst\_name), $param(partition));