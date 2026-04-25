# SIP-I Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp6348496)

2.2. [Most recently active contributors(1) to this module](#idp6437648)

**List of Examples**

1.1. [Set `param_subfield_separator` parameter](#idp248992)

1.2. [Set `isup_mime_str` parameter](#idp165584)

1.3. [Set `default_part_headers` parameter](#idp171136)

1.4. [Set `country_code` parameter](#idp5517888)

1.5. [`add_isup_part` usage](#idp5562752)

1.6. [`isup_param` usage](#idp5591696)

1.7. [`isup_param_str` usage](#idp5601184)

1.8. [`isup_msg_type` usage](#idp5605296)

1.9. [`isup.param` usage](#idp255760)

1.10. [`isup.param.str` usage](#idp5630896)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This module offers the possibility of processing ISDN User Part(ISUP) messages encapsulated in SIP. The available operations are: reading and modifying parameters from an ISUP message, removing or adding new optional parameters, adding an ISUP part to a SIP message body. This is done explicitly via script pseudovariables and functions.

The supported ISUP message types are only the ones that can be included in a SIP message according to the SIP-I(SIP with encapsulated ISUP) protocol defined by ITU-T.

The format and specification of the ISUP messages and parameters follow the recomandations from ITU-T Rec. Q.763.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _None_.
    

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _None_.
    

## 1.3.�Parameters

### 1.3.1.�`param_subfield_separator` (str)

The character to be used as separator in the subname of the _$isup\_param_ and _$isup\_param\_str_ pseudovariables between the ISUP parameter name and subfield name.

_Default value is "|"._

**Example�1.1.�Set `param_subfield_separator` parameter**

...
modparam("sip\_i", "param\_subfield\_separator", ":")
...

  

### 1.3.2.�`isup_mime_str` (str)

The string to be used for the Content-Type header field of the ISUP MIME body when creating a new ISUP part.

_Default value is "application/ISUP;version=itu-t92+"._

**Example�1.2.�Set `isup_mime_str` parameter**

...
modparam("sip\_i", "isup\_mime\_str", "application/ISUP;base=itu-t92+;version=itu-t")
...

  

### 1.3.3.�`default_part_headers` (str)

The default set of headers (fully defined, including the header termination) to be pushed into the ISUP part together with the _Content-Type_ header.

_Default value is "Content-Disposition:signal;handling=optional\\r\\n"._

**Example�1.3.�Set `default_part_headers` parameter**

...
modparam("sip\_i", "default\_part\_headers", "Content-Disposition:signal;handling=required\\r\\n")
...

  

### 1.3.4.�`country_code` (str)

Country Code that the first part of the number from P-Asserted-Identity is tested against when trying to map the Calling Party Number ISUP parameter from SIP by default. If there is a match, the value assigned to the Nature of Address Indicator subfield is _3_(national), otherwise it is _4_(international).

_Default value is "+1"._

**Example�1.4.�Set `country_code` parameter**

...
modparam("sip\_i", "country\_code", "+4")
...

  

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
	

  

## 1.5.�Exported Pseudo-Variables

### 1.5.1.� `$(isup_param(param_name{sep}subfield_name)[byte_index])`

The ISUP parameter named _param\_name_ of a received or newly added ISUP message can be accessed through this read-write variable. For optional parameters, writing to a _param\_name_ that does not exist in this ISUP message will insert it. Assigning null to this variable will remove the optional parameter from the message or zeroize the parameter in case of a mandatory one.

The format of the subname for `$isup_param` is the following:

*   _param\_name_ - name of the ISUP parameter as it appears in ITU-T Rec. Q.763
    
*   _sep_ - separator, whitespaces allowed before/after
    
*   _subfield\_name_ - name of the subfield of the ISUP parameter as it appears in ITU-T Rec. Q.763
    

The ISUP parameter can be addressed in different ways:

*   entire parameter - by providing as subname for the varaiable only the ISUP parameter name, allowing access to the contents of the entire parameter as: a hex string(similar to a hex "dump") for read/write, a string alias for writing, or an integer value for read/write; when assigning a hex string, the hex value must be preceded by "0x"; when reading, if string aliases are supported for this parameter, an associated integer value will be returned, otherwise a hex string is returned
    
*   at subfield level - by providing as subname for the varaiable the ISUP parameter name and the subfield name, allowing access to the specific subfield as an integer value or string value(eg. telephone number for parameters such as Called Party Number) for read/write or as a string alias for writing
    
*   at byte level - by providing as subname for the variable the ISUP parameter name and an index, allowing access to the byte with the specified index as an integer value
    

Addressing at entire parameter level as a hex string and at byte level are supported for all the ISUP parameters defined in the ITU-T Rec. Q.763. Addressing at subfield level is supported only for some ISUP parameters and not all of the subfields of a parameter defined in the ITU Recommandation are supported.

String aliases are not available for all parameters or parameter subfields. Also, not all the possible values of a parameter or parameter subfield have a string alias defined.

For more information on supported subfields and aliases check [Section�1.7, “ISUP parameter subfields and string aliases”](#subfields_aliases "1.7.�ISUP parameter subfields and string aliases").

**Example�1.6.�`isup_param` usage**

...
	$isup\_param(Called Party Number | Nature of address indicator) = 3;
	...
	# use a string alias
	$isup\_param(Called Party Number | Numbering plan indicator) = "ISDN";
	...
	$isup\_param(Called Party Number | Address signal) = "99991234";
	$isup\_param(Nature of connection indicators) = "0x01"
	$isup\_param(Calling party's category) = 10;
	...
	# use a string alias
	$isup\_param(Transmission Medium Requirement) = "speech";
	...
	# access at byte level
	$(isup\_param(Forward Call Indicators)\[0\]) = 96;
	$(isup\_param(Forward Call Indicators)\[1\]) = 1;
...
	

  

### 1.5.2.� `$isup_param_str(param_name{sep}subfield_name)`

The ISUP parameter named _param\_name_ of a received or newly added ISUP message can also be accessed through this read-only variable. This variable is similar in usage with _$isup\_param_ except it will return the string alias for the value when possible.

The format of the subname for `$isup_param_str` is the following:

*   _param\_name_ - name of the ISUP parameter as it appears in ITU-T Rec. Q.763
    
*   _sep_ - separator, whitespaces allowed before/after
    
*   _subfield\_name_ - name of the subfield of the ISUP parameter as it appears in ITU-T Rec. Q.763
    

**Example�1.7.�`isup_param_str` usage**

...
	# may print: "NOA is: national"  
	xlog("NOA is: $isup\_param\_str(Called Party Number|Nature of address indicator)");
	# may print: "CpN is: 99991234"
	xlog("CpN is: $isup\_param\_str(Called Party Number|Address signal)");
	# may print: "nature of conn: 0x01"
	xlog("nature of conn: $isup\_param\_str(Nature of connection indicators)");
	# may print: "Cg cat is: ordinary"
	xlog("$isup\_param\_str(Calling party's category)");
...
	

  

### 1.5.3.� `$isup_msg_type`

Read-only variable, returns the ISUP message type as string.

**Example�1.8.�`isup_msg_type` usage**

...
	# may print: "ISUP msg is: IAM"
	xlog("ISUP msg is: $isup\_msg\_type");
...
	

  

## 1.6.�Exported script transformations

The module also provides a way for accessing the value of ISUP parameters and their subfields from an ISUP message contained in a arbitrary script variable as opposed to directly from the processed SIP (with encapsulated ISUP) message. This is done by aplying a transformation to a script variable containing the ISUP message body. The value of the original variable is not altered and a corresponding integer or string value (representing an ISUP parameter or subfield as the exact value or string alias) is returned.

### 1.6.1.� `{isup.param,param_name,[subfield_name]}`

The result of this transformation is similar to a read access of the `$isup_param` pseudovariable with the exception that byte level access is not provided.

The parameters for the transformation are:

*   _param\_name_ - name of the ISUP parameter as it appears in ITU-T Rec. Q.763
    
*   _subfield\_name_ - optional, name of the subfield of the ISUP parameter as it appears in ITU-T Rec. Q.763
    

**Example�1.9.�`isup.param` usage**

...
	# for this example, we take the ISUP body from the received SIP-I message
	$var(isup\_body) = $(rb\[1\]);

	# may print: "NOA is: 3"  
	xlog("NOA is: $(var(isup\_body){isup.param, Called Party Number, Nature of address indicator})\\n");

	# may print: "CpN is: 99991234"  
	xlog("CpN is: $(var(isup\_body){isup.param, Called Party Number, Address signal})\\n");

	# may print: "Cg cat is: 10"
	xlog("Cg cat is: $(var(isup\_body){isup.param, Calling party's category})\\n");

	# may print: "nature of conn: 0x01"
	xlog("nature of conn: $(var(isup\_body){isup.param, Nature of connection indicators})\\n");
...
		

  

### 1.6.2.� `{isup.param.str,param_name,[subfield_name]}`

The result of this transformation is similar to a read access of the `$isup_param_str` pseudovariable with the exception that byte level access is not provided.

The parameters for the transformation are:

*   _param\_name_ - name of the ISUP parameter as it appears in ITU-T Rec. Q.763
    
*   _subfield\_name_ - optional, name of the subfield of the ISUP parameter as it appears in ITU-T Rec. Q.763
    

**Example�1.10.�`isup.param.str` usage**

...
	# for this example, we take the ISUP body from the received SIP-I message
	$var(isup\_body) = $(rb\[1\]);

	# may print: "NOA is: national"  
	xlog("NOA is: $(var(isup\_body){isup.param.str, Called Party Number, Nature of address indicator})\\n");

	# may print: "CpN is: 99991234"  
	xlog("CpN is: $(var(isup\_body){isup.param.str, Called Party Number, Address signal})\\n");

	# may print: "Cg cat is: ordinary"
	xlog("Cg cat is: $(var(isup\_body){isup.param.str, Calling party's category})\\n");

	# may print: "nature of conn: 0x01"
	xlog("nature of conn: $(var(isup\_body){isup.param.str, Nature of connection indicators})\\n");
...
		

  

## 1.7.�ISUP parameter subfields and string aliases

The supported subfields for each ISUP parameter and the string aliases for their values are the following:

*   Nature of Connection Indicators
    
    *   Satellite indicator
        
        *   _no satellite_ - 0
            
        *   _one satellite_ - 1
            
        *   _two satellite_ - 2
            
        
    *   Continuity check indicator
        
        *   _not required_ - 0
            
        *   _required_ - 1
            
        *   _performed_ - 2
            
        
    *   Echo control device indicator
        
        *   _not included_ - 0
            
        *   _included_ - 1
            
        
    
*   Forward Call Indicators
    
    *   National/international call indicator
        
        *   _national_ - 0
            
        *   _international_ - 1
            
        
    *   End-to-end method indicator
        
        *   _no method_ - 0
            
        *   _pass-along_ - 1
            
        *   _SCCP_ - 2
            
        *   _pass-along and SCCP_ - 3
            
        
    *   Interworking indicator
        
        *   _no interworking_ - 0
            
        *   _interworking_ - 1
            
        
    *   End-to-end information indicator
        
        *   _no end-to-end_ - 0
            
        *   _end-to-end_ - 1
            
        
    *   ISDN user part indicator
        
        *   _not all the way_ - 0
            
        *   _all the way_ - 1
            
        
    *   ISDN user part preference indicator
        
        *   _preferred_ - 0
            
        *   _not required_ - 1
            
        *   _required_ - 2
            
        
    *   ISDN access indicator
        
        *   _non-ISDN_ - 0
            
        *   _ISDN_ - 1
            
        
    *   SCCP method indicator
        
        *   _no indication_ - 0
            
        *   _connectionless_ - 1
            
        *   _connection_ - 2
            
        *   _connectionless and connection_ - 3
            
        
    
*   Optional forward call indicators
    
    *   Closed user group call indicator
        
        *   _non-CUG_ - 0
            
        *   _outgoing allowed_ - 2
            
        *   _outgoing not allowed_ - 3
            
        
    *   Simple segmentation indicator
        
        *   _no additional information_ - 0
            
        *   _additional information_ - 1
            
        
    *   Connected line identity request indicator
        
        *   _not requested_ - 0
            
        *   _requested_ - 1
            
        
    
*   Called Party Number
    
    *   Odd/even indicator
        
        *   _even_ - 0
            
        *   _odd_ - 1
            
        
    *   Nature of address indicator
        
        *   _subscriber_ - 1
            
        *   _unknown_ - 2
            
        *   _national_ - 3
            
        *   _international_ - 4
            
        *   _network-specific_ - 5
            
        *   _network routing national_ - 6
            
        *   _network routing network-specific_ - 7
            
        *   _network routing with CDN_ - 8
            
        
    *   Internal Network Number indicator
        
        *   _allowed_ - 0
            
        *   _not allowed_ - 1
            
        
    *   Numbering plan indicator
        
        *   _ISDN_ - 1
            
        *   _Data_ - 3
            
        *   _Telex_ - 4
            
        
    *   Address signal
        
    
*   Calling Party Number
    
    *   Odd/even indicator
        
        *   _even_ - 0
            
        *   _odd_ - 1
            
        
    *   Nature of address indicator
        
        *   _subscriber_ - 1
            
        *   _unknown_ - 2
            
        *   _national_ - 3
            
        *   _international_ - 4
            
        
    *   Number Incomplete indicator
        
        *   _complete_ - 0
            
        *   _incomplete_ - 1
            
        
    *   Numbering plan indicator
        
        *   _ISDN_ - 1
            
        *   _Data_ - 3
            
        *   _Telex_ - 4
            
        
    *   Address presentation restricted indicator
        
        *   _allowed_ - 0
            
        *   _restricted_ - 1
            
        *   _not available_ - 2
            
        *   _reserved_ - 3
            
        
    *   Screening indicator
        
        *   _user_ - 0
            
        *   _network_ - 1
            
        
    *   Address signal
        
    
*   Backward Call Indicators
    
    *   Charge indicator
        
        *   _no indication_ - 0
            
        *   _no charge_ - 1
            
        
    *   Called party's status indicator
        
        *   _no indication_ - 0
            
        *   _subscriber free_ - 1
            
        *   _connect_ - 2
            
        
    *   Called party's category indicator
        
        *   _no indication_ - 0
            
        *   _ordinary subscriber_ - 1
            
        *   _payphone_ - 2
            
        
    *   End to End method indicator
        
        *   _no end-to-end_ - 0
            
        *   _pass-along_ - 1
            
        *   _SCCP_ - 2
            
        *   _pass-along and SCCP_ - 3
            
        
    *   Interworking indicator
        
        *   _no interworking_ - 0
            
        *   _interworking_ - 1
            
        
    *   End to End information indicator
        
        *   _no end-to-end_ - 0
            
        *   _end-to-end_ - 1
            
        
    *   ISDN user part indicator
        
        *   _not all the way_ - 0
            
        *   _all the way_ - 1
            
        
    *   Holding indicator
        
        *   _not requested_ - 0
            
        *   _requested_ - 1
            
        
    *   ISDN access indicator
        
        *   _non-ISDN_ - 0
            
        *   _ISDN_ - 1
            
        
    *   Echo control device indicator
        
        *   _not included_ - 0
            
        *   _included_ - 1
            
        
    *   SCCP method indicator
        
        *   _no indication_ - 0
            
        *   _connectionless_ - 1
            
        *   _connection_ - 2
            
        *   _connectionless and connection_ - 3
            
        
    
*   Optional Backward Call Indicators
    
    *   In-band information indicator
        
        *   _no indication_\- 0
            
        *   _available_ - 1
            
        
    *   Call diversion may occur indicator
        
        *   _no indication_ - 0
            
        *   _call diversion_ - 1
            
        
    *   Simple segmentation indicator
        
        *   _no additional information_ - 0
            
        *   _additional information_ - 1
            
        
    *   MLPP user indicator
        
        *   _no indication_ - 0
            
        *   _MLPP user_ - 1
            
        
    
*   Connected Number
    
    *   Odd/even indicator
        
        *   _even_ - 0
            
        *   _odd_ - 1
            
        
    *   Nature of address indicator
        
        *   _subscriber_ - 1
            
        *   _unknown_ - 2
            
        *   _national_ - 3
            
        *   _international_ - 4
            
        
    *   Numbering plan indicator
        
        *   _ISDN_ - 1
            
        *   _Data_ - 3
            
        *   _Telex_ - 4
            
        
    *   Address presentation restricted indicator
        
        *   _allowed_ - 0
            
        *   _restricted_ - 1
            
        *   _not available_ - 2
            
        
    *   Screening indicator
        
        *   _user_ - 0
            
        *   _network_ - 1
            
        
    *   Address signal
        
    
*   Original Called Number
    
    *   Odd/even indicator
        
        *   _even_ - 0
            
        *   _odd_ - 1
            
        
    *   Nature of address indicator
        
        *   _subscriber_ - 1
            
        *   _unknown_ - 2
            
        *   _national_ - 3
            
        *   _international_ - 4
            
        
    *   Numbering plan indicator
        
        *   _ISDN_ - 1
            
        *   _Data_ - 3
            
        *   _Telex_ - 4
            
        
    *   Address presentation restricted indicator
        
        *   _allowed_ - 0
            
        *   _restricted_ - 1
            
        *   _not available_ - 2
            
        *   _reserved_ - 3
            
        
    
*   Redirecting Number - same as _Original Called Number_
    
*   Redirection Number - same as _Called Party Number_
    
*   Redirection information
    
    *   Redirecting indicator
        
        *   _no redirection_ - 0
            
        *   _call rerouted_ - 1
            
        *   _call rerouted, all information restricted_ - 2
            
        *   _call diverted_ - 3
            
        *   _Call diverted, all information restricted_ - 4
            
        *   _call rerouted, redirection number restricted_ - 5
            
        *   _call diversion, redirection number restricted_ - 6
            
        
    *   Original redirection reason
        
        *   _unknown/not available_ - 0
            
        *   _user busy_ - 1
            
        *   _no reply_ - 2
            
        *   _unconditional_ - 3
            
        
    *   Redirection counter
        
        *   1
            
        *   2
            
        *   3
            
        *   4
            
        *   5
            
        
    *   Redirecting reason
        
        *   _unknown/not available_ - 0
            
        *   _user busy_ - 1
            
        *   _no reply_ - 2
            
        *   _unconditional_ - 3
            
        *   _deflection alerting_ - 4
            
        *   _deflection response_ - 5
            
        *   _mobile not reachable_ - 6
            
        
    
*   Cause Indicators
    
    *   Location
        
        *   _user_ - 0
            
        *   _LPN_ - 1
            
        *   _LN_ - 2
            
        *   _TN_ - 3
            
        *   _RLN_ - 4
            
        *   _RPN_ - 5
            
        *   _INTL_ - 7
            
        *   _BI_ - 10
            
        
    *   Coding standard
        
        *   _ITU-T_ - 0
            
        *   _ISO/IEC_ - 1
            
        *   _national_ - 2
            
        *   _location_ - 3
            
        
    *   Cause value
        
    
*   Subsequent Number
    
    *   Odd/even indicator
        
        *   _even_ - 0
            
        *   _odd_ - 1
            
        
    *   Address signal
        
    
*   Event Information
    
    *   Event indicator
        
        *   _alerting_ - 1
            
        *   _progress_ - 2
            
        *   _in-band or pattern_ - 3
            
        *   _busy_ - 4
            
        *   _no reply_ - 5
            
        *   _unconditional_ - 6
            
        
    *   Event presentation restricted indicator
        
        *   _no indication_ - 0
            
        *   _restricted_ - 1
            
        
    
*   Calling Party's Category
    
    *   _unknown_ - 0
        
    *   _french_ - 1
        
    *   _english_ - 2
        
    *   _german_ - 3
        
    *   _russian_ - 4
        
    *   _spanish_ - 5
        
    *   _ordinary_ - 10
        
    *   _priority_ - 11
        
    *   _data_ - 12
        
    *   _test_ - 13
        
    *   _payphone_ - 15
        
    
*   Transmission Medium Requirement
    
    *   _speech_ - 0
        
    *   _64 kbit/s unrestricted_ - 2
        
    *   _3.1 kHz audio_ - 3
        
    *   _64 kbit/s preferred_ - 6
        
    *   _2 x 64 kbit/s_ - 7
        
    *   _384 kbit/s_ - 8
        
    *   _1536 kbit/s_ - 9
        
    *   _1920 kbit/s_ - 10
        
    

## 1.8.�Mandatory ISUP parameters

The mandatory parameters(According to ITU-T Rec. Q.763) for each supported ISUP message that requires this are the following:

*   Initial address
    
    *   Nature of connection indicators
        
    *   Forward call indicators
        
    *   Calling party's category
        
    *   Transmission medium requirement
        
    *   Called party number
        
    
*   Address complete
    
    *   Backward call indicators
        
    
*   Connect
    
    *   Backward call indicators
        
    
*   Release
    
    *   Cause indicators
        
    
*   Call progress
    
    *   Event information
        
    
*   Facility reject
    
    *   Facility indicator
        
    
    *   Cause indicators
        
    
*   Facility accepted
    
    *   Facility indicator
        
    
*   Facility request
    
    *   Facility indicator
        
    
*   Confusion
    
    *   Cause indicators
        
    
*   Suspend
    
    *   Suspend/resume indicators
        
    
*   Resume
    
    *   Suspend/resume indicators
        
    
*   Subsequent address
    
    *   Subsequent number
        
    
*   User-to-user information
    
    *   User-to-user information
        
    

## Chapter�2.�Contributors

## 2.1.�By Commit Statistics

**Table�2.1.�Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)**

�

Name

DevScore

Commits

Lines ++

Lines --

1.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

128

44

6684

1643

2.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

11

9

21

20

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

8

6

24

31

4.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

7

5

14

15

5.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

6

4

83

11

6.

Rustam Safargalin

3

1

80

1

7.

Walter Doekes ([@wdoekes](https://github.com/wdoekes))

3

1

16

20

8.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

3

1

1

1

  

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 2.2.�By Commit Activity

**Table�2.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Mar 2018 - Jan 2025

2.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Jan 2021 - Nov 2023

3.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Feb 2017 - Jul 2021

4.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

Oct 2016 - Dec 2020

5.

Rustam Safargalin

Apr 2020 - Apr 2020

6.

Walter Doekes ([@wdoekes](https://github.com/wdoekes))

Apr 2019 - Apr 2019

7.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

8.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Apr 2018 - Jun 2018

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)).

_Documentation Copyrights:_

Copyright � 2016 [www.opensips-solutions.com](http://www.opensips-solutions.com/)