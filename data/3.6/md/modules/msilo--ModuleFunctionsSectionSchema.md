## 1.4.�Exported Functions

### 1.4.1.�`m_store([owner])`

The method stores certain parts of the current SIP request (it should be called when the request type is MESSAGE and the destination user is offline or his UA does not support MESSAGE requests). If the user is registered with a UA which does not support MESSAGE requests you should not use mode=“0” if you have changed the request uri with the contact address of user's UA.

Meaning of the parameters is as follows:

*   _owner_ (string, optional) - a SIP URI in whose inbox the message will be stored. If "owner" is missing, the SIP address is taken from R-URI.
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE.

**Example�1.27.�`m_store` usage**

...
m\_store();
m\_store($tu);
...

  

### 1.4.2.�`m_dump([owner], [maxmsg])`

The method sends stored messages for the SIP user that is going to register to his actual contact address. The method should be called when a REGISTER request is received and the “Expire” header has a value greater than zero.

Meaning of the parameters is as follows:

*   _owner_ (string, optional) - a SIP URI whose inbox will be dumped. If "owner" is missing, the SIP address is taken from To URI.
    
*   _maxmsg_ (int, optional) - is a maximum number of messages to be dumped.
    

This function can be used from REQUEST\_ROUTE, STARTUP\_ROUTE, TIMER\_ROUTE, EVENT\_ROUTE

**Example�1.28.�`m_dump` usage**

...
m\_dump();
m\_dump($fu);
m\_dump($fu, 10);
...