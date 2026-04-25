## 1.4.�Exported Functions

### 1.4.1.� `notify_on_event(event, filter, route, timeout)`

This function creates a subscription to a given Event. A filter can be used (over the attributes of the Event) in order to filter even more the needed notifications (only Events matching the filter will be notified to this subscriber).

Upon Event notification, the given script route (usually called notification route) will be executed. No variables, SIP message, SIP transaction/dialog or any other context related to subscriber will be inherited from subscriber processing into this notification route.

The Event attributes will be exposed in the notification route via AVP variables as _$avp(attr\_name) = attr\_value_.

As an exception, in the notification route, the EBR module will make available the transaction ID from the subscriber context. Note that it's not the transaction itself, but its ID. There are some TM functions (like _t\_inject\_branches_) which can operate on transactions based on their ID. Of course, you need to have a transaction create in the subscriber processing before calling the _notify\_on\_event()_ function.

This function can be used from REQUEST\_ROUTE.

Parameters:

*   _event_ (string) -the name of the Event to subscribe for
    
*   _filter_ (var) - a AVP variable holding (as multi value array) all the filters to be applied on the event (before notification). The filter value has the format "key=value" where the "key" must match an attribute name of the Event. The "value" is the desired value for the attribute; it may be a shell wildcard pattern. Ex: "aor=bob@\*"
    
*   _route_ (string) -the name of the script route to be executed upon Event notification
    
*   _timeout_ (int) - for how long the subscription is active before expiring (integer in seconds). Note: during its lifetime, a subscription may be notified several or zero times.
    

**Example�1.1.�`notify_on_event()` usage**

...
$avp(filter) = "aor=\*@opensips.org"
notify\_on\_event("E\_UL\_AOR\_INSERT",$avp(filter),"reg\_done",60);
...
route\[reg\_done\] {
	xlog("a new user $avp(aor) registered with opensips.org domain\\n");
}