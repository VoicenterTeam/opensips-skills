## 1.4.�Exported Functions

### 1.4.1.� `cpl_run_script(type,mode)`

Starts the execution of the CPL script. The user name is fetched from new\_uri or requested uri or from To header -in this order- (for incoming execution) or from FROM header (for outgoing execution). Regarding the stateful/stateless message processing, the function is very flexible, being able to run in different modes (see below the"mode" parameter). Normally this function will end script execution. There is no guaranty that the CPL script interpretation ended when OpenSIPS script ended also (for the same INVITE ;-)) - this can happen when the CPL script does a PROXY and the script interpretation pause after proxying and it will be resume when some reply is received (this can happen in a different process of OpenSIPS).

If the function returns true to script, if value "1" is returned, the SIP server should continue with the normal behavior as if no script existed; if value (2) is returned, it means no script was found, so nothing was done.

When some error is reported (a false return code), the function itself haven't sent any SIP error reply (this can be done from script).

Meaning of the parameters is as follows:

*   _type (string)_ - which part of the script should be run; set it to "incoming" for having the incoming part of script executed (when an INVITE is received) or to "outgoing" for running the outgoing part of script (when a user is generating an INVITE - call).
    
*   _mode (string)_ - sets the interpreter mode as stateless/stateful behavior. The following modes are accepted:
    
    *   _IS\_STATELESS_ - the current INVITE has no transaction created yet. All replies (redirection or deny) will be done is a stateless way. The execution will switch to stateful only when proxy is done. So, if the function returns, will be in stateless mode.
        
    *   _IS\_STATEFUL_ - the current INVITE has already a transaction associated. All signaling operations (replies or proxy) will be done in stateful way.So, if the function returns, will be in stateful mode.
        
    *   _FORCE\_STATEFUL_ - the current INVITE has no transaction created yet. All signaling operations will be done is a stateful way (on signaling, the transaction will be created from within the interpreter). So, if the function returns, will be in stateless mode.
        
    
    _HINT_: is\_stateful is very difficult to manage from the routing script (script processing can continue in stateful mode); is\_stateless is the fastest and less resources consumer (transaction is created only if proxying is done), but there is minimal protection against retransmissions (since replies are send stateless); force\_stateful is a good compromise - all signaling is done stateful (retransmission protection) and in the same time, if returning to script, it will be in stateless mode (easy to continue the routing script execution)
    

This function can be used from REQUEST\_ROUTE.

**Example�1.16.�`cpl_run_script` usage**

...
cpl\_run\_script("incoming","force\_stateful");
...

  

### 1.4.2.� `cpl_process_register()`

This function MUST be called only for REGISTER requests. It checks if the current REGISTER request is related or not with CPL script upload/download/ remove. If it is, all the needed operation will be done. For checking if the REGISTER is CPL related, the function looks fist to "Content-Type" header. If it exists and has a the mime type set to "application/cpl+xml" means this is a CPL script upload/remove operation. The distinction between to case is made by looking at "Content-Disposition" header; id its value is "script;action=store", means it's an upload; if it's "script;action=remove", means it's a remove operation; other values are considered to be errors. If no "Content-Type" header is present, the function looks to "Accept" header and if it contains the "\*" or "application/cpl-xml" the request it will be consider one for downloading CPL scripts. The functions returns to script only if the REGISTER is not related to CPL. In other case, the function will send by itself the necessary replies (stateless - using sl), including for errors.

This function can be used from REQUEST\_ROUTE.

**Example�1.17.�`cpl_process_register` usage**

...
if ($rm=="REGISTER") {
    cpl\_process\_register();
}
...

  

### 1.4.3.� `cpl_process_register_norpl()`

Same as “cpl\_process\_register” without internally generating the reply. All information (script) is appended to the reply but without sending it out.

Main purpose of this function is to allow integration between CPL and UserLocation services via same REGISTER messages.

This function can be used from REQUEST\_ROUTE.

**Example�1.18.�`cpl_process_register_norpl` usage**

...
if ($rm=="REGISTER") {
    cpl\_process\_register();
    # continue with usrloc part
    save("location");
}
...