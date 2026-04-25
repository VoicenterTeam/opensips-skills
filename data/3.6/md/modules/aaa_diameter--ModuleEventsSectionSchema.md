## 1.8.�Exported Events

### 1.8.1.� `E_DM_REQUEST`

This event is raised whenever the _aaa\_diameter_ module is loaded and OpenSIPS receives a Diameter request on the configured Diameter listening interface.

Parameters:

*   _app\_id (integer)_ - the Diameter Application Identifier
    
*   _cmd\_code (integer)_ - the Diameter Command Code
    
*   _sess\_id (string)_ - the value of either the _Session-Id_ AVP, _Transaction-Id_ AVP or a _NULL_ value if neither of these transaction-identifying AVPs is present in the Diameter request.
    
*   _avps\_json (string)_ - a JSON Array containing the AVPs of the request. Use the [json](json) module's **$json** variable to easily parse and work with it.
    

Note that this event is currently designed to be mainly consumed by an _event\_route_, since that is the only way to gain access to the [dm\_send\_answer()](#func_dm_send_answer "1.6.2.� dm_send_answer(avps_json, [is_error])") function in order to build custom answer messages. On the other hand, if the application does not mind the answer being always a 3001 (DIAMETER\_COMMAND\_UNSUPPORTED) error, this event can be successfully consumed through any other EVI-compatible delivery channel ☺️