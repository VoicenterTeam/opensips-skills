## 1.6.�Exported MI Functions

### 1.6.1.� `refresh_watchers`

Triggers sending Notify messages to watchers if a change in watchers authorization or in published state occurred.

Name: _refresh\_watchers_

Parameters:

*   presentity\_uri : the uri of the user who made the change and whose watchers should be informed
    
*   event : the event package
    
*   refresh type : it distinguishes between the two different types of events that can trigger a refresh:
    
    *   a change in watchers authentication: refresh type= 0 ;
        
    *   a statical update in published state (either through direct update in db table or by modifying the pidf manipulation document, if pidf\_manipulation parameter is set): refresh type!= 0.
        
    

MI FIFO Command Format:

opensips-cli -x mi refresh\_watchers sip:11@192.168.2.132 presence 1
	

### 1.6.2.� `cleanup`

Manually triggers the cleanup functions for watchers and presentity tables. Useful if you have set `clean_period` to zero or less.

Name: _cleanup_

Parameters: _none_

MI FIFO Command Format:

opensips-cli -x mi cleanup
	  

### 1.6.3.� `pres_phtable_list`

Lists all the presentity records.

Name: _pres\_phtable\_list_

Parameters: _none_

MI FIFO Command Format:

opensips-cli -x mi pres\_phtable\_list
	  

### 1.6.4.� `subs_phtable_list`

Lists all the subscription records, or the subscriptions for which the "To" and "From" URIs match the given parameters.

Name: _subs\_phtable\_list_

Parameters

*   _from_(optional) - wildcard for "From" URI
    
*   _to_(optional) - wildcard for "To" URI
    

MI FIFO Command Format:

opensips-cli -x mi subs\_phtable\_list sip:222@domain2.com sip:user\_1@example.com
	  

### 1.6.5.� `pres_expose`

Exposes in the script, by rasing an _E\_PRESENCE\_EXPOSED_ event, all the presentities of a specific event that match a specified filter.

Name: _pres\_expose_

Parameters:

*   _event_ - the desired presence event.
    
*   _filter_(optional) - a regular expression (REGEXP) used for filtering the presentities for that event. Only the presentities that match will be exposed. If not specified, all presentities for that event are exposed.
    

MI FIFO Command Format:

opensips-cli -x mi pres\_expose presence ^sip:10\\.0\\.5\\.\[0-9\]\*