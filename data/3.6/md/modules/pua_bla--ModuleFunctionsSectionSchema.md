## 1.4.�Exported Functions

### 1.4.1.� `bla_set_flag()`

The function is used to mark REGISTER requests made to a BLA AOR. The modules subscribes to the registered contacts for dialog;sla event.

**Example�1.6.�`bla_set_flag` usage**

...
if(is\_method("REGISTER") && $tu=~"bla\_aor@opensips.org") 
	bla\_set\_flag();		
...

  

### 1.4.2.� `bla_handle_notify()`

The function handles Notify requests sent from phones on the same BLA to the server. The message is transformed in Publish request and passed to presence module for further handling. in case of a successful processing a 2xx reply should be sent.

**Example�1.7.�`bla_handle_notify` usage**

...
if(is\_method("NOTIFY") && $tu=~"bla\_aor@opensips.org") 
{
		if( bla\_handle\_notify() ) 
			t\_reply(200, "OK");
}	
...