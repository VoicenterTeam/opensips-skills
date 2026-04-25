## 1.6.�Exported Functions

### 1.6.1.� `dm_send_request(app_id, cmd_code, avps_json, [rpl_avps_pv])`

Perform a blocking Diameter request over to the interconnected peer and return the Result-Code AVP value from the reply.

_Parameters_

*   _app\_id_ (integer) - ID of the application. A custom application must be defined in the dictionary.opensips Diameter configuration file before it can be recognized.
    
*   _cmd\_code_ (integer) - ID of the command. A custom command code, name and AVP requirements must be defined in the dictionary.opensips Diameter configuration file beforehand. body of the HTTP response.
    
*   _avps\_json_ (string) - A JSON Array containing the AVPs to include in the message.
    
*   _rpl\_avps\_pv_ (var, optional) - output variable which will hold all AVP names from the Diameter Answer along with their values, packed as a JSON Array string. The "json" module and its _$json_ variable could be used to iterate this array.
    

_Return Codes_

*   **1** - Success
    
*   **\-1** - Internal Error
    
*   **\-2** - Request timeout (the [answer\_timeout](#param_answer_timeout "1.5.5.�answer_timeout (integer)") was exceeded before an Answer could be processed)
    

This function can be used from any route.

**Example�1.7.�`dictionary.opensips` extended syntax**

\# Example of defining custom Diameter AVPs, Application IDs,
# Requests and Replies in the "dictionary.opensips" file

ATTRIBUTE out\_gw            232 string
ATTRIBUTE trunk\_id          233 string

ATTRIBUTE rated\_duration    234 integer
ATTRIBUTE call\_cost         235 integer

ATTRIBUTE Exponent          429 integer32
ATTRIBUTE Value-Digits      447 integer64

ATTRIBUTE Cost-Unit 424 grouped
{
	Value-Digits | REQUIRED | 1
	Exponent | OPTIONAL | 1
}

ATTRIBUTE Currency-Code     425 unsigned32

ATTRIBUTE Unit-Value  445 grouped
{
	Value-Digits | REQUIRED | 1
	Exponent | OPTIONAL | 1
}

ATTRIBUTE Cost-Information  423 grouped
{
	Unit-Value | REQUIRED | 1
	Currency-Code | REQUIRED | 1
	Cost-Unit | OPTIONAL | 1
}

APPLICATION 42 My Diameter Application

REQUEST 92001 My-Custom-Request
{
	Origin-Host | REQUIRED | 1
	Origin-Realm | REQUIRED | 1
	Destination-Realm | REQUIRED | 1
	Transaction-Id | REQUIRED | 1
	Sip-From-Tag | REQUIRED | 1
	Sip-To-Tag | REQUIRED | 1
	Acct-Session-Id | REQUIRED | 1
	Sip-Call-Duration | REQUIRED | 1
	Sip-Call-Setuptime | REQUIRED | 1
	Sip-Call-Created | REQUIRED | 1
	Sip-Call-MSDuration | REQUIRED | 1
	out\_gw | REQUIRED | 1
	call\_cost | REQUIRED | 1
	Cost-Information | OPTIONAL | 1
}

ANSWER 92001 My-Custom-Answer
{
	Origin-Host | REQUIRED | 1
	Origin-Realm | REQUIRED | 1
	Destination-Realm | REQUIRED | 1
	Transaction-Id | REQUIRED | 1
	Result-Code | REQUIRED | 1
}

  

**Example�1.8.�`dm_send_request` usage**

\# Building an sending an My-Custom-Request (92001) for the
# My Diameter Application (42)
$var(payload) = "\[
	{ \\"Origin-Host\\": \\"client.diameter.test\\" },
	{ \\"Origin-Realm\\": \\"diameter.test\\" },
	{ \\"Destination-Realm\\": \\"diameter.test\\" },
	{ \\"Sip-From-Tag\\": \\"dc93-4fba-91db\\" },
	{ \\"Sip-To-Tag\\": \\"ae12-47d6-816a\\" },
	{ \\"Acct-Session-Id\\": \\"a59c-dff0d9efd167\\" },
	{ \\"Sip-Call-Duration\\": 6 },
	{ \\"Sip-Call-Setuptime\\": 1 },
	{ \\"Sip-Call-Created\\": 1652372541 },
	{ \\"Sip-Call-MSDuration\\": 5850 },
	{ \\"out\_gw\\": \\"GW-774\\" },
	{ \\"cost\\": \\"10.84\\" },
	{ \\"Cost-Information\\": \[
		{\\"Unit-Value\\": \[{\\"Value-Digits\\": 1000}\]},
		{\\"Currency-Code\\": 35}
		\]}
\]";

$var(rc) = dm\_send\_request(42, 92001, $var(payload), $var(rpl\_avps));
xlog("rc: $var(rc), AVPs: $var(rpl\_avps)\\n");
$json(avps) := $var(rpl\_avps);

  

### 1.6.2.� `dm_send_answer(avps_json, [is_error])`

Send back a Diameter answer message to the interconnected peer in a _non-blocking_ fashion, in response to its request.

The following fields will be automatically copied over from the Diameter request when building the answer message:

*   Application ID
    
*   Command Code
    
*   Session-Id AVP, if any
    
*   Transaction-Id AVP, if any (only applies when Session-Id is not present)
    

_Parameters_

*   _avps\_json_ (string) - A JSON Array containing the AVPs to include in the answer message (example below).
    
*   _is\_error_ (boolean, default: _false_) - Set to _true_ in order to set the 'E' (error) bit in the answer message.
    

_Return Codes_

*   **1** - Success
    
*   **\-1** - Internal Error
    

This function can only be used from an _EVENT\_ROUTE_.

**Example�1.9.�`dm_send_answer()` usage**

event\_route \[E\_DM\_REQUEST\] {
  xlog("Req: $param(sess\_id) / $param(app\_id) / $param(cmd\_code)\\n");
  xlog("AVPs: $param(avps\_json)\\n");

  $json(avps) := $param(avps\_json);

  /\* ... process the data (AVPs) ... \*/

  /\* ... and reply back with more AVPs! \*/
  $var(ans\_avps) = "\[
          { \\"Vendor-Specific-Application-Id\\": \[{
                  \\"Vendor-Id\\": 0
                  }\] },

          { \\"Result-Code\\": 2001 },
          { \\"Auth-Session-State\\": 0 },
          { \\"Origin-Host\\": \\"opensips.diameter.test\\" },
          { \\"Origin-Realm\\": \\"diameter.test\\" }
  \]";

  if (!dm\_send\_answer($var(ans\_avps)))
    xlog("ERROR - failed to send Diameter answer\\n");
}