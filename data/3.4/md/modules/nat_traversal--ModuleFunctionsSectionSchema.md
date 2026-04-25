## 1.5.�Exported Functions

### 1.5.1.� `client_nat_test(type)`

Check if the client is behind NAT. What tests are performed is specified by the type parameter which is an integer given by the sum of the numbers corresponding to the tests that one wishes to perform. The numbers corresponding to individual tests are shown below:

*   1 - tests if client has a private IP address (as defined by RFC1918) in the Contact field of the SIP message.
    
*   2 - tests if client has contacted OpenSIPS from an address that is different from the one in the Via field. Both the IP and port are compared by this test.
    
*   4 - tests if client has a private IP address (as defined by RFC1918) in the top Via field of the SIP message.
    
*   8 - tests if client has contacted OpenSIPS from an address that is different from the one in the Contact field. Only IP is compared by this test.
    

For example calling client\_nat\_test(3) will perform test 1 and test 2 and return true if at least one succeeds, otherwise false.

This function can be used from REQUEST\_ROUTE, ONREPLY\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE.

**Example�1.8.�Using the `client_nat_test` function**

...
if (client\_nat\_test(3)) {
    .....
}
...
        

  

### 1.5.2.� `fix_contact()`

Will replace the IP and port in the Contact header with the IP and port the SIP message was received from. Usually called after a successful call to client\_nat\_test(type)

This function can be used from REQUEST\_ROUTE, ONREPLY\_ROUTE, BRANCH\_ROUTE.

**Example�1.9.�Using the `fix_contact` function**

...
if (client\_nat\_test(3)) {
    fix\_contact();
}
...
        

  

### 1.5.3.� `nat_keepalive()`

Trigger keepalive functionality for the source address of the request. When called it only sets some internal flags, which will trigger later the addition of the endpoint to the keepalive list if a positive reply is generated/received (for REGISTER and SUBSCRIBE) or when the dialog is started/replied (for INVITEs). For this reason, it can be called early or late in the script. The only condition is to call it before replying to the request or before sending it to another proxy. If the request needs to be sent to another proxy, t\_relay() must be used to be able to intercept replies via TM or dialog callbacks. If stateless forwarding is used, the keepalive functionality will not work. Also for outgoing INVITEs, record\_route() should also be used to make sure the proxy that keeps the caller endpoint alive stays in the path. For multi-proxy setups, this function should always be called on the border proxies (the ones that received the request directly from the user agent). For more details about this function, see the _Implementation_ subsection from the _Keepalive functionality_ section.

This function can be used from REQUEST\_ROUTE.

**Example�1.10.�Using the `nat_keepalive` function**

...
if (($rm=="REGISTER" || $rm=="SUBSCRIBE" ||
    ($rm=="INVITE" && !has\_totag())) && client\_nat\_test(3))
{
    nat\_keepalive();
}
...