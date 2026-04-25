## 1.7.�Exported Events

### 1.7.1.� `E_PRESENCE_PUBLISH`

This event is raised when the presence module receives a PUBLISH message.

Parameters:

*   _user_ - the AOR of the user
    
*   _domain_ - the domain
    
*   _event_ - the type of the event published
    
*   _expires_ - the expire value of the publish
    
*   _etag_ - the entity tag
    
*   _old\_etag_ - the entity tag to be refreshed
    
*   _body_ - the body of the PUBLISH request
    

### 1.7.2.� `E_PRESENCE_EXPOSED`

This event is raised for each presentity exposeed by the _pres\_expose_.

Parameters:

Same parameters as the _E\_PRESENCE\_PUBLISH_ event.