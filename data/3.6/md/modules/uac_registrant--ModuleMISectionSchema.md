## 1.5.�Exported MI Functions

### 1.5.1.�`reg_list`

Lists the registrant records and their status.

Name: _reg\_list_

Parameters:

*   _aor_ (optional) - URI defining the address of record. If provided, _contact_ and _registrar_ parameters are also required and only a specific record will be listed.
    
*   _contact_ (optional) - Contact URI. If provided, _aor_ and _registrar_ parameters are also required and only a specific record will be listed.
    
*   _registrar_ (optional) - URI pointing to the remote registrar. If provided, _aor_ and _contact_ parameters are also required and only a specific record will be listed.
    

MI FIFO Command Format:

opensips-cli -x mi reg\_list
...
opensips-cli -x mi reg\_list sip:alice@opensips.org  sip:alice@127.0.0.1:5060 sip:opensips.org
		

### 1.5.2.�`reg_reload`

Reloads the registrant records from the database.

Name: _reg\_reload_

Parameters: _none_

*   _aor_ (optional) - URI defining the address of record. If provided, _contact_ and _registrar_ parameters are also required and only a specific record will be reloaded.
    
*   _contact_ (optional) - Contact URI. If provided, _aor_ and _registrar_ parameters are also required and only a specific record will be reloaded.
    
*   _registrar_ (optional) - URI pointing to the remote registrar. If provided, _aor_ and _contact_ parameters are also required and only a specific record will be reloaded.
    

MI FIFO Command Format:

opensips-cli -x mi reg\_reload
...
opensips-cli -x mi reg\_leload sip:alice@opensips.org  sip:alice@127.0.0.1:5060 sip:opensips.org
		

### 1.5.3.�`reg_enable`

Enables a specific registrant. OpenSIPS will immediately send a REGISTER if the registrant was previously disabled and will update the state in the database.

Name: _reg\_enable_

Parameters: _none_

*   _aor_ - URI defining the address of record.
    
*   _contact_ - Contact URI.
    
*   _registrar_ - URI pointing to the remote registrar.
    

MI FIFO Command Format:

opensips-cli -x mi reg\_enable sip:alice@opensips.org  sip:alice@127.0.0.1:5060 sip:opensips.org
		

### 1.5.4.�`reg_disable`

Disables a specific registrant. OpenSIPS will immediately send an unREGISTER if the registrant was previously enabled and will update the state in the database.

Name: _reg\_disable_

Parameters: _none_

*   _aor_ - URI defining the address of record. If provided, _contact_ and _registrar_ parameters are also required and only a specific record will be disabled.
    
*   _contact_ - Contact URI. If provided, _aor_ and _registrar_ parameters are also required and only a specific record will be disabled.
    
*   _registrar_ - URI pointing to the remote registrar. If provided, _aor_ and _contact_ parameters are also required and only a specific record will be disabled.
    

MI FIFO Command Format:

opensips-cli -x mi reg\_disable sip:alice@opensips.org  sip:alice@127.0.0.1:5060 sip:opensips.org
		

### 1.5.5.�`reg_force_register`

Forces the re-registration (or registation) of a specific registrant (depending on its state). Note that the registrant must be enabled.

Name: _reg\_force\_register_

Parameters:

*   _aor_ - URI defining the address of record. If provided, _contact_ and _registrar_ parameters are also required and only a specific record will be forced to re-register.
    
*   _contact_ - Contact URI. If provided, _aor_ and _registrar_ parameters are also required and only a specific record will be forced to re-register.
    
*   _registrar_ - URI pointing to the remote registrar. If provided, _aor_ and _contact_ parameters are also required and only a specific record will be forced to re-register.
    

MI FIFO Command Format:

opensips-cli -x mi reg\_force\_register sip:alice@opensips.org  sip:alice@127.0.0.1:5060 sip:opensips.org