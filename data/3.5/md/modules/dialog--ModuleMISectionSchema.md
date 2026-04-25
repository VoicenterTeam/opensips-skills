## 1.9.�Exported MI Functions

### 1.9.1.� `dlg_list`

Lists the description of the dialogs (calls). If no parameter is given, all dialogs will be listed. If a dialog identifier is passed as parameter (callid and fromtag), only that dialog will be listed. If a index and conter parameter is passed, it will list only a number of "counter" dialogs starting with index (as offset) - this is used to get only section of dialogs.

Name: _dlg\_list_

Parameters (with dialog idetification):

*   _callid_ (optional) - callid if a single dialog to be listed.
    
*   _from\_tag_ (optional, but cannot be present without the callid parameter) - fromtag (as per initial request) of the dialog to be listed. entry
    

Parameters (with dialog counting):

*   _index_ - offset where the dialog listing should start.
    
*   _counter_ - how many dialogs should be listed (starting from the offset)
    

MI FIFO Command Format:

		## list all ongoing dialogs
		opensips-cli -x mi dlg\_list
		## list the dialog by callid and From TAG
		opensips-cli -x mi dlg\_list callid=abcdrssfrs122444@192.168.1.1 from\_tag=AAdfeEFF33
		## list 10 dialogs, starting from the position 40
		## (in the list of all ongoing dialogs)
		opensips-cli -x mi dlg\_list index=40 counter=10
		

### 1.9.2.�`dlg_list_ctx`

The same as the “dlg\_list” but including in the dialog description the associated context from modules sitting on top of the dialog module. This function also prints the dialog's values. In case of binary values, the non-printable chars are represented in hex (e.g. \\x00)

Name: _dlg\_list\_ctx_

Parameters: _see “dlg\_list”_

MI FIFO Command Format:

		opensips-cli -x mi dlg\_list\_ctx
		

### 1.9.3.�`dlg_end_dlg`

Terminates an ongoing dialog. If dialog is established, BYEs are sent in both directions. If dialog is in unconfirmed or early state, a CANCEL will be sent to the callee side, that will trigger a 487 from the callee, which, when relayed, will also end the dialog on the caller's side.

Name: _dlg\_end\_dlg_

Parameters are:

*   _dialog\_id_ - this is an identifier of the dialog - it can be either (1) the unique ID of the dialog (as provided by dlg\_list), either (2) the SIP Call-ID of the dialog.
    
*   _extra\_hdrs_ - (optional) string containg the extra headers (full format) to be added to the BYE requests.
    

The "dialog\_id" value can be get via the "dlg\_list" MI command.

MI FIFO Command Format:

		# terminate the dialog via the internal Dialog-ID
		opensips-cli -x mi dlg\_end\_dlg 6ae.4b38d013
		# terminate the dialog via its SIP Call-ID
		opensips-cli -x mi dlg\_end\_dlg Y2IwYjQ2YmE2ZDg5MWVkNDNkZGIwZjAzNGM1ZDY
		

### 1.9.4.�`profile_get_size`

Returns the number of dialogs belonging to a profile. If the profile supports values, the check can be reinforced to take into account a specific value - how many dialogs were inserted into the profile with a specific value. If not value is passed, only simply belonging of the dialog to the profile is checked. Note that the profile does not supports values, this will be silently discarded.

Name: _profile\_get\_size_

Parameters:

*   _profile_ - name of the profile to get the value for.
    
*   _value_ (optional)- string value to toughen the check;
    

MI FIFO Command Format:

		opensips-cli -x mi profile\_get\_size inboundCalls
		

### 1.9.5.�`profile_list_dlgs`

Lists all the dialogs belonging to a profile. If the profile supports values, the check can be reinforced to take into account a specific value - list only the dialogs that were inserted into the profile with that specific value. If not value is passed, all dialogs belonging to the profile will be listed. Note that the profile does not supports values, this will be silently discarded. Also, when using shared profiles using the CacheDB interface, this command will only display the local dialogs.

Name: _profile\_list\_dlgs_

Parameters:

*   _profile_ - name of the profile to list the dialog for.
    
*   _value_ (optional)- string value to toughen the check;
    

MI FIFO Command Format:

		opensips-cli -x mi profile\_list\_dlgs inboundCalls
		

### 1.9.6.�`profile_get_values`

Lists all the values belonging to a profile along with their count. If the profile does not support values a total count will be returned. Note that this function does not work for shared profiles over the CacheDB interface.

Name: _profile\_get\_values_

Parameters:

*   _profile_ - name of the profile to list the dialog for.
    

MI FIFO Command Format:

		opensips-cli -x mi profile\_get\_values inboundCalls
		

### 1.9.7.�`profile_end_dlgs`

Terminate all ongoing dialogs from a specified profile, on a single dialog it performs the same operations as the command **[dlg\_end\_dlg](#mi_dlg_end_dlg "1.9.3.�dlg_end_dlg")**

Name: _profile\_end\_dlgs_

Parameters:

*   _profile_ - name of the profile that will have its dialogs termianted
    
*   _value_ - (optional) if the profile supports values terminate only the dialogs with the specified value
    

MI FIFO Command Format:

		opensips-cli -x mi profile\_end\_dlgs inboundCalls
		

### 1.9.8.�`dlg_db_sync`

Will load all the information about the dialogs from the database in the OpenSIPS internal memory. If a dialog is already found in memory and has the same/an older state, it will be updated with the values from DB. Otherwise, the newer in-memory version will not be changed.

Name: _dlg\_db\_sync_

It takes no parameters

MI FIFO Command Format:

		opensips-cli -x mi dlg\_db\_sync
		

### 1.9.9.�`dlg_cluster_sync`

This command will only take effect if dialog replication is enabled.

Fully synchronize the dialog information in memory from a suitable donor node within the [dialog\_replication\_cluster](#param_dialog_replication_cluster "1.6.47.�dialog_replication_cluster (int)"). Dialogs that already exist in memory which are not reconfirmed through syncing will be discarded. A sharing tag can be specified in order to sync only dialogs marked with that sharing tag.

Name: _dlg\_cluster\_sync_

Parameters:

*   _sharing\_tag_ - name of the sharing tag that dialogs have to be marked with in order to be synced
    

MI FIFO Command Format:

		opensips-cli -x mi dlg\_cluster\_sync vip1
		

### 1.9.10.�`dlg_restore_db`

Restores the dialog table after a potential desynchronization event. The table is truncated, then populated with CONFIRMED dialogs from memory.

Name: _dlg\_restore\_db_

It takes no parameters

MI FIFO Command Format:

		opensips-cli -x mi dlg\_restore\_db
		

### 1.9.11.�`list_all_profiles`

Lists all the dialog profiles, along with 1 or 0 if the given profile has/does not have an associated value.

Name: _list\_all\_profiles_

Parameters: _It takes no parameters_

MI FIFO Command Format:

		opensips-cli -x mi list\_all\_profiles
		

### 1.9.12.�`dlg_push_var`

Push or update a dialog value for the given list of dialog IDs / Call-IDs.

Name: _dlg\_push\_var_

Parameters: _It takes 3 or more parameters_

*   _dlg\_val\_name_ - name of the dialog value that needs to be inserted/updated
    
*   _dlg\_val\_value_ - value to be inserted/updated
    
*   _DID_ - dialog identifier. Can be either the $DLG\_did or the actual Call-ID.
    

MI FIFO Command Format:

		opensips-cli -x mi dlg\_push\_var var\_name var\_value DID1 \[ DID2 DID3 ...  DIDN \]
		

### 1.9.13.�`dlg_send_sequential`

Sends a sequential request within an ongoing dialog.

Name: _dlg\_send\_sequential_

Parameters:

*   _callid_ - the callid of the dialog you need to trigger the sequential message for.
    
*   _method_ - (optional) the method used for the sequential message. Default value is _INVITE_.
    
*   _mode_ - (optional) can be used to tune the behavior of the sequential message. Possible values for the _mode_ are:
    
    *   _caller_ - (default) sends the sequential message to the caller. This mode can be useful in high availability scenarios when you want to update the upstream's routing set, specifically the contact.
        
    *   _callee_ - same as caller, but sends the sequential message to the callee.
        
    *   _challenge_ - sends a sequential INVITE (or UPDATE) to the caller to challenge it for its advertised SDP body. When the body is received, it is forwarded to the callee. This mode is useful when trying to change both endpoints (upstream and downstream) routing set. It can also be useful when trying to trigger a re-negotiation for SDP body.
        
    *   _challenge-caller_ - same as _challenge_
        
    *   _challenge-callee_ - same as _challenge-caller_, only that it first challenges the callee, instead of the caller.
        
    
*   _body_ - (optional) can be used to specify a body for the initial sequential message. Possible values for the _body_ parameter are:
    
    *   _none_ - (default) no body added to the sequential message.
        
    *   _inbound_ - advertises in the body of the sequential message generated the last body received from its pair. For example, if the _mode=challenge-caller_, the message will contain the body sent to OpenSIPS by the callee. This is useful when you need to alter the body previously sent to the caller, because you want to re-negotiate a different media proxy for the call. This can be achieved by catching the generated request in _local\_route_, and re-engage the Media proxy.
        
    *   _outbound_ - advertises in the body of the sequential message generated the last body sent to that UAC. For example, if the _mode=challenge-caller_, the message will contain the last body sent by OpenSIPS to the caller. This is useful in a high availability scenario when trying to re-negotiate the contact of the server, but there is no need to alter the body sent earlier.
        
    *   _custom:CONTENT\_TYPE:BODY_ - this can be used to specify a specific Content-Type ehader and body for the sequential message generated.
        
    
*   _headers_ - (optional) can be used to specify some headers for the initial sequential message.
    

This functions runs asynchronously and returns the status code and reason of the last reply received for either the _challenge_ or normal mode.

MI Command Format:

			opensips-cli -x mi dlg\_send\_sequential \\
				callid=5291231-testing@127.0.0.1
		

MI Command used to trigger media re-negotiation:

			opensips-cli -x mi dlg\_send\_sequential \\
				callid=5291231-testing@127.0.0.1 \\
				mode=challenge \\
				body=inbound
		

MI Command used to UPDATE the callee's remote Contact after a server failover:

			opensips-cli -x mi dlg\_send\_sequential \\
				callid=5291231-testing@127.0.0.1 \\
				mode=challenge-callee \\
				body=outbound \\
				method=UPDATE
		

MI Command used to send REFER to the callee, and add Refer-To header:

			opensips-cli -x mi dlg\_send\_sequential \\
				callid=usR8FlGOSMfCTAIHebHCOQ.. \\
				method=REFER \\
				body=none \\
				mode=callee \\
				headers='Refer-To: sip:user@domain:50060'