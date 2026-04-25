## 1.5.�Exported Functions

### 1.5.1.� `handle_publish([sender_uri])`

The function handles PUBLISH requests. It stores and updates published information in database and calls functions to send NOTIFY messages when changes in the published information occur.

It may takes one optional string argument, the 'sender\_uri' SIP URI. The parameter was added for enabling BLA implementation. If present, Notification of a change in published state is not sent to the respective uri even though a subscription exists. It should be taken from the Sender header. It was left at the decision of the administrator whether or not to transmit the content of this header as parameter for handle\_publish, to prevent security problems.

This function can be used from REQUEST\_ROUTE.

_Return code:_

*   _1 - if success_.
    
*   _\-1 - if error_.
    

The module sends an appropriate stateless reply in all cases.

**Example�1.25.�`handle_publish` usage**

...
	if(is\_method("PUBLISH"))
	{
		if($hdr(Sender)!= NULL)
			handle\_publish($hdr(Sender));
		else
			handle\_publish();
	} 
...

  

### 1.5.2.� `handle_subscribe([force_active] [,sharing_tag])`

This function is to be used for handling SUBSCRIBE requests. It stores or updates the watcher/subscriber information in database. Additionally, in response to initial SUBSCRIBE requests (creating a new subscription session), the function also sends back the NOTIFY (with the presence information) to the wathcer/subscriber.

The function may take the following parameters:

*   _force\_active_ (int, optional) - optional parameter that controls what is the default policy (of the presentity) on accepting new subscriptions (accept or reject) - of course, this parameter makes sense only when using a presence configuration with privacy rules enabled (force\_active parameter in presence\_xml module is not set).
    
    There are scenarios where the presentity (the party you subscribe to) can not upload an XCAP document with its privacy rules (to control which watchers are allowed to subscribe to it). In such cases, from script level, you can force the presence server to consider the current subscription allowed (with Subscription-Status:active) by calling the handle\_subscribe() function with the integer parameter "1".
    
*   _sharing\_tag_ (string, optional) - optional parameter telling the owner tag (for the subscription) in clusetering scenarios where the subscription data is shared between multiple servers - see the [Section�1.2, “Presence clustering”](#presence_clustering "1.2.�Presence clustering") chapter for more details.
    

   Ex: 
	if($ru =~ "kphone@opensips.org")
		handle\_subscribe(1);
		

This function can be used from REQUEST\_ROUTE.

_Return code:_

*   _1 - if success_.
    
*   _\-1 - if error_.
    

The module sends an appropriate stateless reply in all cases.

**Example�1.26.�`handle_subscribe` usage**

...
if($rm=="SUBSCRIBE")
    handle\_subscribe();
...