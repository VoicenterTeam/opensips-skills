## 1.4.�Exported Functions

### 1.4.1.� `add_isup_part([isup_msg_type][,extra_headers])`

Adds a new ISUP part to the SIP message body.

With the exception of some ISUP message types(IAM, REL, ACM, CPG, ANM, CON), the newly added part contains a blank ISUP message(i.e. all mandatory parameters zeroed and no optional ones) and all the required parameters should be set through $isup\_param. For the previously mentioned message types, the mandatory parameters and some optional ones are automaticaly set to default values according to basic SIP-ISUP interworking rules from ITU-T Rec. Q.1912.5. This only provides a general and simplified mapping from SIP headers and message type (request method, reply code etc.) to ISUP parameters and you should not base your SIP-ISUP interworking only on this.

Meaning of the parameters is as follows:

*   _isup\_msg\_type (string, optional)_ - name of the ISUP message to be added, exactly as it appears in ITU-T Rec. Q.763 or an abbreviation(eg. _IAM_ for "Initial address").
    
*   _extra\_headers (string, string, optional)_ - a chunk of fully defined SIP headers (including header terminatior) to be inserted into the ISUP part next to the _Content-Type_ header. It overrides the global module parameter _default\_part\_headers_. If not specified, the _default\_part\_headers_ value will be used.
    

If _isup\_msg\_type_ is not explicitly provided, it is automatically deduced from the SIP message as follows:

*   INVITE - IAM
    
*   BYE - REL
    
*   180, 183 - ACM
    
*   4xx, 5xx - REL
    
*   200 OK INVITE - ANM
    
*   200 OK BYE - RLC
    

The abbreviations that can be given as _isup\_msg\_type_ for each ISUP message type are the following:

*   Initial address - _IAM_
    
*   Address complete - _ACM_
    
*   Answer - _ANM_
    
*   Connect - _CON_
    
*   Release - _REL_
    
*   Release complete - _RLC_
    
*   Call progress - _CPG_
    
*   Facility reject - _FRJ_
    
*   Facility accepted - _FAA_
    
*   Facility request - _FAR_
    
*   Confusion - _CFN_
    
*   Suspend - _SUS_
    
*   Resume - _RES_
    
*   Subsequent address - _SAM_
    
*   Forward transfer - _FOT_
    
*   User-to-user information - _USR_
    
*   Network resource management - _NRM_
    
*   Facility - _FAC_
    
*   Identification request - _IRQ_
    
*   Identification response - _IRS_
    
*   Loop prevention - _LPR_
    
*   Application transport - _APT_
    
*   Pre-release information - _PRI_
    

This function can be used from REQUEST\_ROUTE,FAILURE\_ROUTE,ONREPLY\_ROUTE,LOCAL\_ROUTE.

**Example�1.5.�`add_isup_part` usage**

...
if ($rs == "183") {
	# Encapsulate a CPG
	add\_isup\_part("Call progress");
	# set desired parameters
	...
}
...