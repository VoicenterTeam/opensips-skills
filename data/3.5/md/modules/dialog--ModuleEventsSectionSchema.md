## 1.11.�Exported Events

### 1.11.1.� `E_DLG_STATE_CHANGED`

This event is raised when the dialog state is changed.

Parameters:

*   _id_ - the hex representation of the dialog id.
    
*   _db\_id_ - the integer representation of the dialog id, as it is stored in the database _dlg\_id_ field.
    
*   _callid_ - the callid.
    
*   _from\_tag_ - the From tag.
    
*   _to\_tag_ - the To tag.
    
*   _old\_state_ - the old state of the dialog.
    
*   _new\_state_ - the new state of the dialog.