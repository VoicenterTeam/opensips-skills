## 1.4.�Exported Functions

### 1.4.1.� `authservice()`

This function performs the steps of an authentication service. Before you call this function, you have to ensure that

*   the server is responsible for this request (from URI matches local SIP domain)
    
*   the sender of the request is authorized to claim the identity given in the From header field.
    

This function returns the following values:

*   \-3: Date header field does not match validity period of cert. Identity header has not been added.
    
*   \-2: message out of time (e.g. message to old), Identity header has not been added.
    
*   \-1: An error occurred.
    
*   1: everything OK, Identity header has been added.
    

This function can be used from REQUEST\_ROUTE.

**Example�1.8.�`authservice()` usage**

...
# CANCEL and ACK cannot be challenged
if (($rm=="CANCEL") || ($rm"ACK"))
{
    route(1); # forward
    exit;
}

# some clients (e.g. Kphone) do not answer, when a BYE is challenged
if ($rm=="BYE")
{
    route(1); # forward
    exit;
}

### Authentication Service ###

# check whether I am authoritative
if($fd!="mysipdomain.de")
{
    route(1); # forward
    exit;
}

if(!proxy\_authorize("mysipdomain.de","subscriber"))
{
    proxy\_challenge("mysipdomain.de",0);
    exit;
}

if ($au!=$fU)
{
    sl\_send\_reply(403, "Use From=ID");
    exit;
}
consume\_credentials();
        
authservice();
switch($retcode)
{
    case -3:
        xlog("L\_DBG" ,"authservice: Date header field does not match validity period of cert\\n");
        break;
    case -2:
        xlog("L\_DBG" ,"authservice: msg out of time (max. +- 10 minutes allowed)\\n");
        break;
    case -1:
        xlog("L\_DBG" ,"authservice: ERROR, returnvalue: -1\\n");
        break;
    case 1:
        xlog("L\_DBG" ,"authservice: everything OK\\n");
        break;
    default:
        xlog("L\_DBG" ,"unknown returnvalue of authservice\\n");
        
}

route(1); #forward with ($retcode=1) or without ($retcode!=1) Identity header
...

  

### 1.4.2.� `verifier()`

This function performs the steps of an verifier. The returned code tells you the result of the verification:

*   \-438: Signature does not correspond to the message. 438-response should be send.
    
*   \-437: Certificate cannot be validated. 437-response should be send.
    
*   \-436: Certificate is not available. 436-response should be send.
    
*   \-428: Message does not have an Identity header. 428-response should be send.
    
*   \-3: Error verifying Date header field.
    
*   \-2: Authentication service is not authoritative.
    
*   \-1: An unknown error occurred.
    
*   1: verification OK
    

This function can be used from REQUEST\_ROUTE.

**Example�1.9.�`verifier()` usage**

...
# we have to define the same exceptions as we did for the authentication service
if (($rm=="CANCEL") || ($rm"ACK")) 
{ 
    route(1); # forward
    exit;
}
    
if ($rm=="BYE")
{
    route(1); # forward
    exit;
}
   
verifier();
switch($retcode)
{
    case -438:
        xlog("L\_DBG" ,"verifier: returnvalue: -438\\n");
        sl\_send\_reply(438, "Invalid Identity Header");
        exit;
        break;
    case -437:
        xlog("L\_DBG" ,"verifier: returnvalue: -437\\n");
        sl\_send\_reply(437, "Unsupported Certificate");
        exit;
        break;
    case -436:
        xlog("L\_DBG" ,"verifier: returnvalue: -436\\n");
        sl\_send\_reply(436, "Bad Identity-Info");
        exit;
        break;
    case -428:
        xlog("L\_DBG" ,"verifier: returnvalue: -428\\n");
        sl\_send\_reply(428, "Use Identity Header");
        exit;
        break;
    case -3:
        xlog("L\_DBG" ,"verifier: error verifying Date header field\\n");
        exit;
        break;
    case -2:
        xlog("L\_DBG" ,"verifier: authentication service is not authoritative\\n");
        exit;
        break;
    case -1:
        xlog("L\_DBG" ,"verifier: ERROR, returnvalue: -1\\n");
        exit;
        break;
    case 1:
        xlog("L\_DBG" ,"verifier: verification OK\\n");
        route(1); # forward
        exit;
        break;
    default:
        xlog("L\_DBG" ,"unknown returnvalue of verifier\\n");
        exit;
}
exit;
...