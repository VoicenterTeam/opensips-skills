## 1.4.�Exported Functions

### 1.4.1.�`add_diversion(reason, [uri], [counter])`

The function adds a new diversion header field before any other existing Diversion header field in the message (the newly added Diversion header field will become the topmost Diversion header field). The inbound (without any modifications done by the proxy server) Request-URI will be used as the Diversion URI.

Meaning of the parameters is as follows:

*   _reason_ (string) - The reason string to be added as the reason parameter
    
*   _uri_ (string, optional) - The URI to be added in the header. If missing the unchanged RURI from the original message will be used.
    
*   _counter_ (int, optional) - Diversion counter to be added to the header, as defined by the standard.
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE.

**Example�1.2.�`add_diversion` usage**

...
add\_diversion("user-busy");
...