# sip_i Module Reference
<!-- generated-from: data/3.6/modules/sip_i.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 sip_i module. Read this file when configuring or debugging the sip_i module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Exported Pseudo-Variables](#exported-pseudo-variables)
- [Configuration Examples](#configuration-examples)

## Overview

This module offers the possibility of processing ISDN User Part(ISUP) messages encapsulated in SIP. The available operations are: reading and modifying parameters from an ISUP message, removing or adding new optional parameters, adding an ISUP part to a SIP message body. This is done explicitly via script pseudovariables and functions.

The supported ISUP message types are only the ones that can be included in a SIP message according to the SIP-I(SIP with encapsulated ISUP) protocol defined by ITU-T.

The format and specification of the ISUP messages and parameters follow the recomandations from ITU-T Rec. Q.763.

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

None.

## Exported Parameters

### `country_code` (string)

Country Code that the first part of the number from P-Asserted-Identity is tested against when trying to map the Calling Party Number ISUP parameter from SIP by default. If there is a match, the value assigned to the Nature of Address Indicator subfield is _3_(national), otherwise it is _4_(international).

*Default value is +1.*

**Example.** +4.

```opensips
...
modparam("sip_i", "country_code", "+4")
...
```
### `default_part_headers` (string)

The default set of headers (fully defined, including the header termination) to be pushed into the ISUP part together with the _Content-Type_ header.

*Default value is Content-Disposition:signal;handling=optional\r\n.*

**Example.** Content-Disposition:signal;handling=required\r\n.

```opensips
...
modparam("sip_i", "default_part_headers", "Content-Disposition:signal;handling=required\r\n")
...
```
### `isup_mime_str` (string)

The string to be used for the Content-Type header field of the ISUP MIME body when creating a new ISUP part.

*Default value is application/ISUP;version=itu-t92+.*

**Example.** application/ISUP;base=itu-t92+;version=itu-t.

```opensips
...
modparam("sip_i", "isup_mime_str", "application/ISUP;base=itu-t92+;version=itu-t")
...
```
### `param_subfield_separator` (string)

The character to be used as separator in the subname of the _$isup_param_ and _$isup_param_str_ pseudovariables between the ISUP parameter name and subfield name.

*Default value is |.*

**Example.** :.

```opensips
...
modparam("sip_i", "param_subfield_separator", ":")
...
```

## Exported Functions

### `add_isup_part([isup_msg_type][,extra_headers])`

Adds a new ISUP part to the SIP message body.

With the exception of some ISUP message types(IAM, REL, ACM, CPG, ANM, CON), the newly added part contains a blank ISUP message(i.e. all mandatory parameters zeroed and no optional ones) and all the required parameters should be set through $isup_param. For the previously mentioned message types, the mandatory parameters and some optional ones are automaticaly set to default values according to basic SIP-ISUP interworking rules from ITU-T Rec. Q.1912.5. This only provides a general and simplified mapping from SIP headers and message type (request method, reply code etc.) to ISUP parameters and you should not base your SIP-ISUP interworking only on this.

If isup_msg_type is not explicitly provided, it is automatically deduced from the SIP message as follows:

- INVITE - IAM
- BYE - REL
- 180, 183 - ACM
- 4xx, 5xx - REL
- 200 OK INVITE - ANM
- 200 OK BYE - RLC

**Parameters:**

- `extra_headers` *(string, optional)* — a chunk of fully defined SIP headers (including header terminatior) to be inserted into the ISUP part next to the Content-Type header. It overrides the global module parameter default_part_headers. If not specified, the default_part_headers value will be used.
- `isup_msg_type` *(string, optional)* — name of the ISUP message to be added, exactly as it appears in ITU-T Rec. Q.763 or an abbreviation(eg. IAM for "Initial address").
  - `IAM`
  - `ACM`
  - `ANM`
  - `CON`
  - `REL`
  - `RLC`
  - `CPG`
  - `FRJ`
  - `FAA`
  - `FAR`
  - `CFN`
  - `SUS`
  - `RES`
  - `SAM`
  - `FOT`
  - `USR`
  - `NRM`
  - `FAC`
  - `IRQ`
  - `IRS`
  - `LPR`
  - `APT`
  - `PRI`
  - `Initial address`
  - `Address complete`
  - `Answer`
  - `Connect`
  - `Release`
  - `Release complete`
  - `Call progress`
  - `Facility reject`
  - `Facility accepted`
  - `Facility request`
  - `Confusion`
  - `Suspend`
  - `Resume`
  - `Subsequent address`
  - `Forward transfer`
  - `User-to-user information`
  - `Network resource management`
  - `Facility`
  - `Identification request`
  - `Identification response`
  - `Loop prevention`
  - `Application transport`
  - `Pre-release information`

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, LOCAL_ROUTE

**Example.** add_isup_part usage.

```opensips
...
if ($rs == "183") {
	# Encapsulate a CPG
	add_isup_part("Call progress");
	# set desired parameters
	...
}
...
```

## Exported Pseudo-Variables

### `$(isup_param(param_name{sep}subfield_name)[byte_index])`

The ISUP parameter named _param_name_ of a received or newly added ISUP message can be accessed through this read-write variable. For optional parameters, writing to a _param_name_ that does not exist in this ISUP message will insert it. Assigning null to this variable will remove the optional parameter from the message or zeroize the parameter in case of a mandatory one.

The format of the subname for `$isup_param` is the following:

*   _param_name_ - name of the ISUP parameter as it appears in ITU-T Rec. Q.763
    
*   _sep_ - separator, whitespaces allowed before/after
    
*   _subfield_name_ - name of the subfield of the ISUP parameter as it appears in ITU-T Rec. Q.763

The ISUP parameter can be addressed in different ways:

*   entire parameter - by providing as subname for the varaiable only the ISUP parameter name, allowing access to the contents of the entire parameter as: a hex string(similar to a hex "dump") for read/write, a string alias for writing, or an integer value for read/write; when assigning a hex string, the hex value must be preceded by "0x"; when reading, if string aliases are supported for this parameter, an associated integer value will be returned, otherwise a hex string is returned
    
*   at subfield level - by providing as subname for the varaiable the ISUP parameter name and the subfield name, allowing access to the specific subfield as an integer value or string value(eg. telephone number for parameters such as Called Party Number) for read/write or as a string alias for writing
    
*   at byte level - by providing as subname for the variable the ISUP parameter name and an index, allowing access to the byte with the specified index as an integer value

Addressing at entire parameter level as a hex string and at byte level are supported for all the ISUP parameters defined in the ITU-T Rec. Q.763. Addressing at subfield level is supported only for some ISUP parameters and not all of the subfields of a parameter defined in the ITU Recommandation are supported.

String aliases are not available for all parameters or parameter subfields. Also, not all the possible values of a parameter or parameter subfield have a string alias defined.

For more information on supported subfields and aliases check [Section 1.7, “ISUP parameter subfields and string aliases”](#subfields_aliases "1.7. ISUP parameter subfields and string aliases").

**Example 1.6. `isup_param` usage**

...
	$isup_param(Called Party Number | Nature of address indicator) = 3;
	...
	# use a string alias
	$isup_param(Called Party Number | Numbering plan indicator) = "ISDN";
	...
	$isup_param(Called Party Number | Address signal) = "99991234";
	$isup_param(Nature of connection indicators) = "0x01"
	$isup_param(Calling party's category) = 10;
	...
	# use a string alias
	$isup_param(Transmission Medium Requirement) = "speech";
	...
	# access at byte level
	$(isup_param(Forward Call Indicators)\[0\]) = 96;
	$(isup_param(Forward Call Indicators)\[1\]) = 1;
...

- **Type:** string, integer
- **Read/write:** read-write
- **Scope:** 
### `$isup_msg_type`

Read-only variable, returns the ISUP message type as string.

**Example 1.8. `isup_msg_type` usage**

...
	# may print: "ISUP msg is: IAM"
	xlog("ISUP msg is: $isup_msg_type");
...

- **Type:** string
- **Read/write:** read-only
- **Scope:** 
### `$isup_param_str(param_name{sep}subfield_name)`

The ISUP parameter named _param_name_ of a received or newly added ISUP message can also be accessed through this read-only variable. This variable is similar in usage with _$isup_param_ except it will return the string alias for the value when possible.

The format of the subname for `$isup_param_str` is the following:

*   _param_name_ - name of the ISUP parameter as it appears in ITU-T Rec. Q.763
    
*   _sep_ - separator, whitespaces allowed before/after
    
*   _subfield_name_ - name of the subfield of the ISUP parameter as it appears in ITU-T Rec. Q.763

**Example 1.7. `isup_param_str` usage**

...
	# may print: "NOA is: national"  
	xlog("NOA is: $isup_param_str(Called Party Number|Nature of address indicator)");
	# may print: "CpN is: 99991234"
	xlog("CpN is: $isup_param_str(Called Party Number|Address signal)");
	# may print: "nature of conn: 0x01"
	xlog("nature of conn: $isup_param_str(Nature of connection indicators)");
	# may print: "Cg cat is: ordinary"
	xlog("$isup_param_str(Calling party's category)");
...

- **Type:** string
- **Read/write:** read-only
- **Scope:** 

## Configuration Examples

### Set `param_subfield_separator` parameter

The character to be used as separator in the subname of the _$isup_param_ and _$isup_param_str_ pseudovariables between the ISUP parameter name and subfield name.

```opensips
...
modparam("sip_i", "param_subfield_separator", ":")
...
```
### Set `isup_mime_str` parameter

The string to be used for the Content-Type header field of the ISUP MIME body when creating a new ISUP part.

```opensips
...
modparam("sip_i", "isup_mime_str", "application/ISUP;base=itu-t92+;version=itu-t")
...
```
### Set `default_part_headers` parameter

The default set of headers (fully defined, including the header termination) to be pushed into the ISUP part together with the _Content-Type_ header.

```opensips
...
modparam("sip_i", "default_part_headers", "Content-Disposition:signal;handling=required\\r\\n")
...
```
### Set `country_code` parameter

Country Code that the first part of the number from P-Asserted-Identity is tested against when trying to map the Calling Party Number ISUP parameter from SIP by default. If there is a match, the value assigned to the Nature of Address Indicator subfield is _3_(national), otherwise it is _4_(international).

```opensips
...
modparam("sip_i", "country_code", "+4")
...
```
### `add_isup_part` usage

Adds a new ISUP part to the SIP message body.

```opensips
...
if ($rs == "183") {
	# Encapsulate a CPG
	add_isup_part("Call progress");
	# set desired parameters
	...
}
...
```
### `isup_param` usage

The ISUP parameter named _param_name_ of a received or newly added ISUP message can be accessed through this read-write variable.

```opensips
...
	$isup_param(Called Party Number | Nature of address indicator) = 3;
	...
	# use a string alias
	$isup_param(Called Party Number | Numbering plan indicator) = "ISDN";
	...
	$isup_param(Called Party Number | Address signal) = "99991234";
	$isup_param(Nature of connection indicators) = "0x01"
	$isup_param(Calling party's category) = 10;
	...
	# use a string alias
	$isup_param(Transmission Medium Requirement) = "speech";
	...
	# access at byte level
	$(isup_param(Forward Call Indicators)\[0\]) = 96;
	$(isup_param(Forward Call Indicators)\[1\]) = 1;
...
```
### `isup_param_str` usage

The ISUP parameter named _param_name_ of a received or newly added ISUP message can also be accessed through this read-only variable.

```opensips
...
	# may print: "NOA is: national"  
	xlog("NOA is: $isup_param_str(Called Party Number|Nature of address indicator)");
	# may print: "CpN is: 99991234"
	xlog("CpN is: $isup_param_str(Called Party Number|Address signal)");
	# may print: "nature of conn: 0x01"
	xlog("nature of conn: $isup_param_str(Nature of connection indicators)");
	# may print: "Cg cat is: ordinary"
	xlog("$isup_param_str(Calling party's category)");
...
```
### `isup_msg_type` usage

Read-only variable, returns the ISUP message type as string.

```opensips
...
	# may print: "ISUP msg is: IAM"
	xlog("ISUP msg is: $isup_msg_type");
...
```
### `isup.param` usage

The result of this transformation is similar to a read access of the `$isup_param` pseudovariable with the exception that byte level access is not provided.

```opensips
...
	# for this example, we take the ISUP body from the received SIP-I message
	$var(isup_body) = $(rb\[1\]);

	# may print: "NOA is: 3"  
	xlog("NOA is: $(var(isup_body){isup.param, Called Party Number, Nature of address indicator})\\n");

	# may print: "CpN is: 99991234"  
	xlog("CpN is: $(var(isup_body){isup.param, Called Party Number, Address signal})\\n");

	# may print: "Cg cat is: 10"
	xlog("Cg cat is: $(var(isup_body){isup.param, Calling party's category})\\n");

	# may print: "nature of conn: 0x01"
	xlog("nature of conn: $(var(isup_body){isup.param, Nature of connection indicators})\\n");
...
```
### `isup.param.str` usage

The result of this transformation is similar to a read access of the `$isup_param_str` pseudovariable with the exception that byte level access is not provided.

```opensips
...
	# for this example, we take the ISUP body from the received SIP-I message
	$var(isup_body) = $(rb\[1\]);

	# may print: "NOA is: national"  
	xlog("NOA is: $(var(isup_body){isup.param.str, Called Party Number, Nature of address indicator})\\n");

	# may print: "CpN is: 99991234"  
	xlog("CpN is: $(var(isup_body){isup.param.str, Called Party Number, Address signal})\\n");

	# may print: "Cg cat is: ordinary"
	xlog("Cg cat is: $(var(isup_body){isup.param.str, Calling party's category})\\n");

	# may print: "nature of conn: 0x01"
	xlog("nature of conn: $(var(isup_body){isup.param.str, Nature of connection indicators})\\n");
...
```
