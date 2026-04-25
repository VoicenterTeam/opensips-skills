## 1.4.�Exported Functions

### 1.4.1.� `http2_send_response(code, [headers_json], [data])`

Sends a response for the HTTP/2 request being processed. The _":status"_ header field will be automatically included by the module as 1st header, so it must not be included in the _headers\_json_ array.

_Parameters_

*   _code_ (integer) - The HTTP/2 reply code
    
*   _headers\_json_ (string, default: _NULL_) - Optional JSON Array containing {"header": "value"} elements, denoting HTTP/2 headers and their values to be included in the response message.
    
*   _data_ (string, default: _NULL_) - Optional DATA payload to include in the response message.
    

_Return Codes_

*   **1** - Success
    
*   **\-1** - Internal Error
    

This function can only be used from an _EVENT\_ROUTE_.

**Example�1.7.�`http2_send_response()` usage**

event\_route \[E\_HTTP2\_REQUEST\] {
  xlog(":: Method:  $param(method)\\n");
  xlog(":: Path:    $param(path)\\n");
  xlog(":: Headers: $param(headers)\\n");
  xlog(":: Data:    $param(data)\\n");

  $json(hdrs) := $param(headers);
  xlog("content-type: $json(hdrs/content-type)\\n");

  $var(rpl\_headers) = "\[
	{ \\"content-type\\": \\"application/json\\" },
	{ \\"server\\": \\"OpenSIPS 3.5\\" },
	{ \\"x-current-time\\": \\"1711457142\\" },
	{ \\"x-call-cost\\": \\"0.355\\" }
  \]";

  $var(data) = "{\\"status\\": \\"success\\"}";

  if (!http2\_send\_response(200, $var(rpl\_headers), $var(data)))
    xlog("ERROR - failed to send HTTP/2 response\\n");
}