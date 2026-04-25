## 1.5.�Exported Functions

### 1.5.1.� `mi(command, [ret_var [,params_avp[, vals_avp]]])`

Runs an MI command in synchronous mode, blocking until a response is available.

_IMPORTANT:_ it is highly recommended to prevent using this function for tasks that take long time, such as reloads, as the function would block until the command ends. Moreover, if the running MI _command_ is configured to run in asynchronous mode (such as _t\_uac\_dlg_ the command blocks in a busy waiting manner until the response is received.

This function can be used in any route.

The function can receive the following parameters:

*   _command(string)_ - the MI command to be run. This can be a single token, representing the MI command to run (without parameters), or can be followed by several space separated parameters (no escaping is handled). Each space separated parameter will be passed to the MI command as an indexed parameter.
    
    _NOTE:_ named parameters can not be specified using this parameter, and you will have to use the _params\_avp_ and/or the _vals\_avp_ parameters to specify named commands, in which case this parameter will only consist of the MI command.
    
*   _ret\_var(var, optional)_ - a variable used to store the return of the MI command execution. In case of success, a JSON is stored, otherwise an erorr message.
    
*   _params\_avp(avp, optional)_ - an AVP consisting of all the parameters names that will be sent to the MI command. If this parameter is used without the _vals\_avp_, all the values inside the AVP will be passed to the MI command as indexed parameters, otherwise as named parameters.
    
    _NOTE:_ if this parameter is used, the parameters specified in the _command_ parameter are ignored.
    
    _NOTE:_ the order the parameters are passed to the command is the same as the one you populate the AVPs (thus somehow reversed compared to the way AVPs are stored in memory - the first AVP added is the first parameter)
    
*   _vals\_avp(avp, optional)_ - an AVP consisting of all the parameters values that will be sent to the MI command. This parameter only makes sense if the _params\_avp_ is set, and has to contain the same number of values as there are parameters.
    
    To specify _array values_, enclose your space-separated array elements in the _\_\_array()_ pseudo-function call. For example: _"\_\_array(HEARTBEAT BACKGROUND\_JOB)"_
    

**Example�1.4.�`mi` without params**

...
mi("shm\_check");
...

  

**Example�1.5.�`mi` with params in command**

...
# this command is similar to the above
mi("cache\_remove local password\_user1");
...

  

**Example�1.6.�`mi` with return**

...
mi("ds\_list", $var(ret));
...

  

**Example�1.7.�`mi` without return but with indexed params**

...
$avp(params) = "local";
$avp(params) = "password\_user1";
mi("cache\_remove",,$avp(params));

# the following command is similar to the above
mi("cache\_remove local password\_user1");
...

  

**Example�1.8.�`mi` with return and named parameters**

...
$avp(params) = "callid";
$avp(vals) = "SEARCH\_FOR\_THIS\_CALLID";
$avp(params) = "from\_tag";
$avp(vals) = "SEARCH\_FOR\_THIS\_FROM\_TAG";
mi("dlg\_list", $var(dlg), $avp(params), $avp(vals));
...

  

**Example�1.9.�`mi` without return, with an array parameter value**

...
$avp(params) = "freeswitch\_url";
$avp(vals) = "fs://:ClueCon@192.168.20.8:8021";
$avp(params) = "events";
$avp(vals) = "\_\_array(HEARTBEAT BACKGROUND\_JOB)";
mi("fs\_subscribe", , $avp(params), $avp(vals));
...