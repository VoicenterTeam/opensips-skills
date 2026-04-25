## 1.5.�Exported MI functions

### 1.5.1.� `pua_publish`

Command parameters:

*   _presentity\_uri_ - e.g. sip:system@opensips.org
    
*   _expires_ - Relative expires time in seconds (e.g. 3600).
    
*   _event\_package_ - Event package that is target of published information (e.g. presence).
    
*   _content\_type_ (optional) - Content type of published information (e.g. application/pidf+xml). If this parameter is provided, the _body_ parameter is also required.
    
*   _etag_ (optional) - ETag that publish should match.
    
*   _extra\_headers_ (optional) - Extra headers added to PUBLISH request.
    
*   _body_ (optioanl) - The body of the publish request containing published information or missing if no published information. It has to be a single line for FIFO transport. If this parameter is provided, the _content\_type_ parameter is also required.
    

**Example�1.2.�`pua_publish` FIFO example**

...

opensips-cli -x mi pua\_publish sip:system@opensips.org 3600 presence application/pidf+xml <?xml version='1.0'?><presence xmlns='urn:ietf:params:xml:ns:pidf' xmlns:dm='urn:ietf:params:xml:ns:pidf:data-model' xmlns:rpid='urn:ietf:params:xml:ns:pidf:rpid' xmlns:c='urn:ietf:params:xml:ns:pidf:cipid' entity='system@opensips.org'><tuple id='0x81475a0'><status><basic>open</basic></status></tuple><dm:person id='pdd748945'><rpid:activities><rpid:away/>away</rpid:activities><dm:note>CPU:16 MEM:476</dm:note></dm:person></presence>

  

### 1.5.2.� `pua_subscribe`

Command parameters:

*   _presentity\_uri_ - e.g. sip:presentity@opensips.org
    
*   _watcher\_uri_ - e.g. sip:watcher@opensips.org
    
*   _event\_package_
    
*   _expires_ - Relative time in seconds for the desired validity of the subscription.
    

**Example�1.3.�`pua_subscribe` FIFO example**

...

opensips-cli -x mi pua\_subscribe sip:system@opensips.org sip:400@opensips.org presence 3600