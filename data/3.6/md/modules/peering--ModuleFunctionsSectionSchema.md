## 1.4.�Exported Functions

### 1.4.1.�`verify_destination()`

Function verify\_destination() queries from broker's AAA server if domain (host part) of Request URI is served by a trusted peer. AAA request contains the following attributes/values:

*   User-Name - Request-URI host
    
*   SIP-URI-User - Request-URI user
    
*   SIP-From-Tag - From tag
    
*   SIP-Call-Id - Call id
    
*   Service-Type - verify\_destination\_service\_type
    

Function returns value 1 if domain of Request URI is served by a trusted peer and -1 otherwise. In case of positive result, AAA server returns a set of SIP-AVP reply attributes. Value of each SIP-AVP is of form:

\[#\]name(:|#)value

Value of each SIP-AVP reply attribute is mapped to an OpenSIPS AVP. Prefix # in front of name or value indicates a string name or string value, respectively.

One of the SIP-AVP reply attributes contains a string that the source peer must include "as is" in a P-Request-Hash header when it sends the SIP request to the destination peer. The string value may, for example, be of form hash@timestamp, where hash contains a hash calculated by the broker based on the attributes of the query and some local information and timestamp is the time when the calculation was done.

AVP names used in reply attributes are assigned by the broker.

This function can be used from REQUEST\_ROUTE and FAILURE\_ROUTE.

**Example�1.4.�`verify_destination()` usage**

...
if (verify\_destination()) {
   append\_hf("P-Request-Hash: $avp(prh)\\r\\n");
}
...

  

### 1.4.2.�`verify_source()`

Function verify\_source() queries from broker's AAA server if SIP request was received from a trusted peer. AAA request contains the following attributes/values:

*   User-Name - Request-URI host
    
*   SIP-URI-User - Request-URI user
    
*   SIP-From-Tag - From tag
    
*   SIP-Call-Id - Call id
    
*   SIP-Request-Hash - body of P-Request-Hash header
    
*   Service-Type - verify\_source\_service\_type
    

Function returns value 1 if SIP request was received from a trusted peer and -1 otherwise. In case of positive result, AAA server may return a set of SIP-AVP reply attributes. Value of each SIP-AVP is of form:

\[#\]name(:|#)value

Value of each SIP-AVP reply attribute is mapped to an OpenSIPS AVP. Prefix # in front of name or value indicates a string name or string value, respectively.

AVP names used in reply attributes are assigned by the broker.

This function can be used from REQUEST\_ROUTE and FAILURE\_ROUTE.

**Example�1.5.�`verify_source()` usage**

...
if (is\_present\_hf("P-Request-Hash")) {
   if (verify\_source()) {
      xlog("L\_INFO", "Request came from trusted peer\\n")
   }
}
...