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