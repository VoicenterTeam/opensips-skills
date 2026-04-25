## 1.4.�Exported Functions

### 1.4.1.� `sl_send_reply(code, reason)`

For the current request, a reply is sent back having the given code and text reason. The reply is sent stateless, totally independent of the Transaction module and with no retransmission for the INVITE's replies. 'code' and 'reason' can contain pseudo-variables that are replaced at runtime.

Meaning of the parameters is as follows:

*   _code (int)_ - Return code.
    
*   _reason (string)_ - Reason phrase.
    

This function can be used from REQUEST\_ROUTE, ERROR\_ROUTE.

**Example�1.2.�`sl_send_reply` usage**

...
sl\_send\_reply(404, "Not found");
...
sl\_send\_reply($err.rcode, $err.rreason);
...

  

### 1.4.2.� `sl_reply_error()`

Sends back an error reply describing the nature of the last internal error. Usually this function should be used after a script function that returned an error code.

This function can be used from REQUEST\_ROUTE.

**Example�1.3.�`sl_reply_error` usage**

...
sl\_reply\_error();
...