## 1.5.�Exported Functions

### 1.5.1.� `pua_update_contact()`

The remote target can be updated by the Contact of a subsequent in dialog request. In the PUA watcher case (sending a SUBSCRIBE messages), this means that the remote target for the following Subscribe messages can be updated at any time by the contact of a Notify message. If this function is called on request route on receiving a Notify message, it will try to update the stored remote target.

This function can be used from REQUEST\_ROUTE.

_Return code:_

*   _1 - if success_.
    
*   _\-1 - if error_.
    

**Example�1.9.�`pua_update_contact` usage**

...
if($rm=="NOTIFY")
    pua\_update\_contact();
...