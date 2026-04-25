## 1.7.�Exported Pseudo-Variables

### 1.7.1.� `$b2b_logic.key`

This is a read-only variable that returns the b2b\_logic key of the ongoing B2B session.

The variable can be used in request route, local\_route and the dedicated routes defined through the _b2b\_entities_ and _b2b\_logic_ modules.

**Example�1.34.�`$b2b_logic.key` usage**

...
local\_route {
   ...
   if ($b2b\_logic.key) {
      xlog("request belongs to B2B session: $b2b\_logic.key\\n");
      ...
   }
   ...
}
...
	

  

### 1.7.2.� `$b2b_logic.entity(field)[idx]`

This is a read-only variable that returns information about the entities(dialogs) involved in the ongoing B2B session.

The available entity information is:

*   the Call-ID of the dialog, accessible by using the _callid_ subname;
    
*   the entity key, accessible by using the _key_ subname or no subname at all.
    
*   the entity ID, accessible by using the _id_ subname.
    
*   the From-Tag of the dialog, accessible by using the _fromtag_ subname.
    
*   the To-Tag of the dialog, accessible by using the _totag_ subname.
    

The index is used to select which entity from the B2B session to refer to. The only possible values are _0_ or _1_ and correspond to the positions of the entities in the scenario. Initially, this depends on the order in which the entities are created. In the case of the internal topology hiding scenario, _0_ is the caller and _1_ is the callee. When a further bridge action happens, the bridged entity is always placed on the _0_ index and the new entity on _1_.

If no index is provided, the variable will refer to the entity(dialog) which the current SIP message belongs to.

The variable can be used in request route, local\_route and the dedicated routes defined through the _b2b\_entities_ and _b2b\_logic_ modules.

**Example�1.35.�`$b2b_logic.entity` usage**

...
modparam("b2b\_entities", "script\_request\_route", "b2b\_request")
...
route\[b2b\_request\] {
   ...
   xlog("received request for entity: $b2b\_logic.entity\\n");
   ...
   if ($rm == "BYE" && $b2b\_logic.entity == $(b2b\_logic.entity\[1\]))
      xlog("Disconnecting callee\\n")
   ...
}
...
	

  

### 1.7.3.� `$b2b_logic.ctx(key)`

This is a read-write variable that provides access to a custom Key-Value storage(of string values) in the context of the ongoing B2B session.

The variable can be used in request route, local\_route and the dedicated routes defined through the _b2b\_entities_ and _b2b\_logic_ modules. In the main request route the variable can be used for storing a new context value even before instantiating the scenario with _b2b\_init\_request()_.

Setting the variable to _NULL_ will delete the value at the given key.

**Example�1.36.�`$b2b_logic.ctx` usage**

...
modparam("b2b\_entities", "script\_reply\_route", "b2b\_reply")
...
route {
   ...
   b2b\_init\_request("prepaid", "sip:alice@127.0.0.1");

   $b2b\_logic.ctx(my\_extra\_info) = "my\_value";
   ...
}
...
route\[b2b\_reply\] {
   ...
   xlog("my info: $b2b\_logic.ctx(my\_extra\_info)\\n");
   ...
}
...
	

  

### 1.7.4.� `$b2b_logic.scenario(key)`

This is a read-only variable that returns the scenario ID of the ongoing B2B session

The variable can be used in request route, local\_route and the dedicated routes defined through the _b2b\_entities_ and _b2b\_logic_ modules.

**Example�1.37.�`$b2b_logic.scenario` usage**

...
route\[b2b\_logic\_request\] {
   if ($b2b\_logic.scenario == "prepaid") {
      route(prepaid);
   } else {
      route(marketing);
   }
}
...