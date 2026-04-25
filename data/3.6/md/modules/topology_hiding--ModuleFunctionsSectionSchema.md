## 1.4.�Exported Functions

### 1.4.1.� `topology_hiding()`

By calling this function on an initial request, the modules will hide the topology, meaning that it will strip and restore all the Via, Record-Route and Route headers and it will replace the contact with the IP address of the interface where the request was received.

You must note however, that the detection of the future in-dialog requests(BYE, reInvite, etc.) for these dialogs on which topology hiding is applied, is not done automatically. Without topology hiding and only normal dialog, the detection was done when loose\_route was called. But now, for this dialogs where topology hiding is applied, the in dialog requests reaching OpenSIPS won't have any Route headers and the RURI will point to OpenSIPS machine. So, to be able to match the in-dialog requests to the corresponding dialog, a script function must be called. It's name is _topology\_hiding\_match_ and you can read it's description above. The in-dialog topology requests are requests with a to tag, RURI pointing to opensips and with a method specific to a Invite dialog. For this kind of requests you should call topology\_hiding\_match() function. If the request is successfully matched and fixed as according to the topology hiding logic,the function returns success.

Optionally,the function also receives a string parameter, which holds string flags. Current options for the string flags are :

*   _U_ - Propagate the Username in the Contact header URI
    
*   _D_ - Dialog ID (DID) is pushed into Contact username, rather than URI param. This option makes sense only when using topology hiding with dialog support.
    
*   _a_ - Preserve the advertised Contact header advertised to the caller throughout the entire dialog.
    
*   _A_ - Preserve the advertised Contact header advertised to the callee throughout the entire dialog.
    
*   _D_ - Dialog ID (DID) is pushed into Contact username, rather than URI param. This option makes sense only when using topology hiding with dialog support.
    
*   _C_ - Encode the callid header
    
    There are many cases where propagating the callid towards the callee side is not a good idea, since sometimes the callid contains the IP of the actual caller side, thus revealing part of the network topology.
    
    When using the "C" flag, the callid will be automatically encoded / decoded, transparent for the script writer - inside OpenSIPS (script,MI functions, etc ) all the variables related to the callid will represent the callid value for the caller side. If the callid for the callee side is needed, refer to the $TH\_callee\_callid pvar.
    
    _Note:_ Changing the callid of the call using the "C" flag is only available when doing topology\_hiding with _dialog support_. Using this flag without dialog support will not change the callid at all!.
    

The second parameter can be used to advertise a particular _username_ in the Contact header URI, either on the _caller_, either on the _callee_ leg, separated by _/_. The format of the parameter is _caller\_username|/\[caller\_contact\_username\]\[/callee\_contact\_username\]_. If the separator is missing, the same contact username is advertised on both legs. If the separator is being used, you can control the username put in contact per leg.

**Example�1.11.�`topology_hiding` usage**

...
if(!has\_totag() && is\_method("INVITE")) {
	topology\_hiding();
}
...
...
if(!has\_totag() && is\_method("INVITE")) {
	topology\_hiding("U");
}
...
# set "opensips" for both caller and the callee's Contact username
if(!has\_totag() && is\_method("INVITE")) {
	topology\_hiding("U", "opensips");
}
...
# set "caller" in the caller's Contact username
if(!has\_totag() && is\_method("INVITE")) {
	topology\_hiding("U", "/caller");
}
...
# set "callee" in the callee's Contact username
if(!has\_totag() && is\_method("INVITE")) {
	topology\_hiding("U", "//callee");
}
...
# set "caller" in the caller's Contact username and
# "callee" in the callee's Contact username
if(!has\_totag() && is\_method("INVITE")) {
	topology\_hiding("U", "/caller/callee");
}
...

  

**Example�1.12.�`Calling topology_hiding_match() function for topology hiding sequential requests`**

...
if (has\_totag())
        if(topology\_hiding\_match())
        {
                xlog("Found a request $rm belonging to an existing topology hiding dialog\\n");
                route(relay);
                exit;
        }
}
...

  

### 1.4.2.� `topology_hiding_match([dlg_match_mode])`

This function is to be used to match and fix a sequential request belong to an existing topology hiding dialog.

With regards to dialog matching (including the optional parameter), this function behaves identically to match\_dialog(). Please see the dialog module documentation for further details regarding dialog matching options.

The function returns true if a topology hiding dialog exists for the request and the request has been successfully fixed.

This function can be used from REQUEST\_ROUTE.

**Example�1.13.�`topology_hiding_match_dialog()` usage**

...
    if (has\_totag()) {
        if (!topology\_hiding\_match() ) {
            xlog(" cannot match request to a dialog \\n");
	    send\_reply(404,"Not found");
        } else
		route(RELAY);
    }
...