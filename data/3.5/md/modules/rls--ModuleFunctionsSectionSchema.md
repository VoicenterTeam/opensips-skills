## 1.4.�Exported Functions

### 1.4.1.� `rls_handle_subscribe()`

This function detects if a Subscribe message should be handled by RLS. If not it replies with the configured to\_presence\_code. If it is, it extracts the dialog info and sends aggregate Notify requests with information for the list.

This function can be used from REQUEST\_ROUTE.

**Example�1.12.�`rls_handle_subscribe` usage**

...
For presence and rls on the same machine:
	modparam(rls, "to\_presence\_code", 10)

	if(is\_method("SUBSCRIBE"))
	{	
		$var(ret\_code)= rls\_handle\_subscribe();

		if($var(ret\_code)== 10)
				handle\_subscribe();

		t\_release();
	}

For rls only:
	if(is\_method("SUBSCRIBE"))
	{
		rls\_handle\_subscribe();
		t\_release();
	}

...

  

### 1.4.2.� `rls_handle_notify()`

This function has to be called for Notify messages sent by presence servers in reply to the Subscribe messages sent by RLS.

This function can be used from REQUEST\_ROUTE.

It can return 3 codes:

*   _1_ - the Notify was inside a dialog that was recognized by the RLS server and was processed successfully.
    
*   _2_ - the Notify did not belog to a dialog initiated by the RLS server.
    
*   _\-1_ - an error occurred during processing.
    

**Example�1.13.�`rls_handle_notify` usage**

...
if($rm=="NOTIFY")
    rls\_handle\_notify();
...