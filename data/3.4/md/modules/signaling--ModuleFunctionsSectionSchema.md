## 1.4.�Exported Functions

### 1.4.1.� `send_reply(code, reason)`

For the current request, a reply is sent back having the given code and text reason. The reply is sent stateless or statefull depending on which module is loaded and if a transaction was created, as explained above.

Meaning of the parameters is as follows:

*   _code (int)_ - Return code.
    
*   _reason (string)_ - Reason phrase.
    

This function can be used from REQUEST\_ROUTE, ERROR\_ROUTE.

**Example�1.1.�`sl_send_reply` usage**

...
send\_reply(404, "Not found");
...
send\_reply($err.rcode, $err.rreason);
...