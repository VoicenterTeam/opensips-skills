## 1.4.�Exported Functions

Functions exported to be used in configuration file.

### 1.4.1.� `pua_xmpp_notify()`

Function that handles Notify messages addressed to a user from an xmpp domain. It requires filtering after method and domain in configuration file. If the function is successful, a 2xx reply must be sent.

This function can be used from REQUEST\_ROUTE.

**Example�1.3.�`Notify2Xmpp` usage**

...
	if( is\_method("NOTIFY") && $ru=~"sip:.+@sip-xmpp.siphub.ro")
	{
		if(Notify2Xmpp())
			t\_reply(200, "OK");
		exit;
	}
...

  

### 1.4.2.� `pua_xmpp_req_winfo(request_uri, expires)`

Function called when a Subscribe addressed to a user from a xmpp domain is received. It calls sending a Subscribe for winfo for the user, and the following Notify with dialog-info is translated into a subscription in xmpp. It also requires filtering in configuration file, after method, domain and event(only for presence).

Parameters:

*   _request\_uri_ (string)
    
*   _expires_ (int) - value of Expires header field in received Subscribe.
    

This function can be used from REQUEST\_ROUTE.

**Example�1.4.�`xmpp_send_winfo` usage**

...
	if( is\_method("SUBSCRIBE"))
	{
		handle\_subscribe();
		if($ru=~"sip:.+@sip-xmpp.siphub.ro" && $hdr(Event)== "presence")
		{
			pua\_xmpp\_req\_winfo($ruri, $hdr(Expires));
		}
		t\_release();
	}

...