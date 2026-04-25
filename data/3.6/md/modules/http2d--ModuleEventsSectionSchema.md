## 1.5.�Exported Events

### 1.5.1.� `E_HTTP2_REQUEST`

This event is raised whenever the _http2d_ module is loaded and OpenSIPS receives an HTTP/2 request on the configured listening interface(s).

Parameters:

*   _method (string)_ - value of the ":method" HTTP/2 header
    
*   _path (string)_ - value of the ":path" HTTP/2 header
    
*   _headers (string)_ - JSON Array with all headers of the request, including pseudo-headers
    
*   _data (string, default: NULL)_ - If the request included a payload, this parameter will hold its contents
    

Note that this event is currently designed to be mainly consumed by an _event\_route_, since that is the only way to gain access to the [http2\_send\_response()](#func_http2_send_response "1.4.1.� http2_send_response(code, [headers_json], [data])") function in order to build custom response messages. On the other hand, if the application does not mind the answer being always a 200 with no payload, this event can be successfully consumed through any other EVI-compatible delivery channel ☺️