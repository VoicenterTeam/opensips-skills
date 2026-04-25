## 1.10.�Exported Pseudo-Variables

### 1.10.1.�`$cgr(name) / $(cgr(name)[session])`

Pseudo-variable used to set different parameters for the CGRateS command. Each name-value pair will be encoded as a _string - value_ attribute in the JSON message sent to CGRateS.

The name-values pairs are stored in the transaction (if tm module is loaded). Therefore the values are accessible in the reply.

When the _cgrates\_acc()_ function is called, all the name-value pairs are moved in the dialog. Therefore the values will be accessible along the dialog's lifetime.

This variable consists of serveral sets of name-value pairs. Each set corresponds to a session. The variable can be indexed by a _session tag_. The sets are completely indepdendent from one another. if the _session tag_ does not exist, the default (no name) one is used.

When assigned with the _:=_ operator, the value is treated as a JSON, rather than a string/integer. However, the evaluation of the JSON is late, therefore when the CGRateS request is built, if the module is unable to parse the JSON, the value is sent as a string.

**Example�1.10.�$cgr(name) simple usage**

		...
		if (!has\_totag()) {
			...
			$cgr\_opt(Tenant) = $fd; # set the From domain as a tenant
			$cgr(RequestType) = "\*prepaid"; # do prepaid accounting
			$cgr(AttributeIDs) := '\["+5551234"\]'; # treat as array
			if (!cgrates\_auth("$fU", "$rU")) {
				sl\_send\_reply(403, "Forbidden");
				exit;
			}
		}
		...
		

  

**Example�1.11.�$cgr(name) multiple sessions usage**

		...
		if (!has\_totag()) {
			...
			# first session - authorize the user
			$cgr\_opt(Tenant) = $fd; # set the From domain as a tenant
			$cgr(RequestType) = "\*prepaid"; # do prepaid accounting
			if (!cgrates\_auth("$fU", "$rU")) {
				sl\_send\_reply(403, "Forbidden");
				exit;
			}

			# second session - authorize the carrier
			$(cgr\_opt(Tenant)\[carrier\]) = $td;
			$(cgr(RequestType)\[carrier\]) = "\*postpaid";
			if (!cgrates\_auth("$tU", "$fU", "carrier")) {
				# use a different carrier
				return;
			}

			# if everything is successful start accounting on both
			cgrates\_acc("cdr", "$fU", "rU");
			cgrates\_acc("cdr", "$tU", "$fU", "carrier");
		}
		...
		

  

### 1.10.2.�`$cgr_opt(name) / $(cgr_opt(name)[session])`

Used to tune the request parameter of a CGRateS request when used in non-_compat\_mode_.

_Note:_ for all request options integer values act as boolean values: _0_ disables the feature and _1_(or different than 0 value) enables it. String variables are passed just as they are set.

Possible values at the time the documentation was written:

*   _Tenant_ - tune CGRateS Tenant.
    
*   _GetAttributes_ - requests the account attributes from the CGRateS DB.
    
*   _GetMaxUsage_ - request the maximum time the call is allowed to run.
    
*   _GetSuppliers_ - request an array with all the suppliers for that can terminate that call.
    

**Example�1.12.�$cgr\_opt(name) usage**

		...
		$cgr\_opt(Tenant) = "cgrates.org";
		$cgr\_opt(GetMaxUsage) = 1; # also retrieve the max usage
		if (!cgrates\_auth("$fU", "$rU")) {
			# call rejected
		}
		...
		

  

### 1.10.3.�`$cgr_ret(name)`

Returns the reply message of a CGRateS command in script, or when used in the non-compat mode, one of the objects within the reply.

**Example�1.13.�$cgr\_ret(name) usage**

		...
		cgrates\_auth("$fU", "$rU");

		# in compat mode
		xlog("Call is allowed to run $cgr\_ret seconds\\n");

		# in non-compat mode
		xlog("Call is allowed to run $cgr\_ret(MaxUsage) seconds\\n");
		...