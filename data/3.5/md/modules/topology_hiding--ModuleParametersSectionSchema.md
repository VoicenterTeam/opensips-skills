## 1.3.�Exported Parameters

### 1.3.1.�`th_callid_passwd` (string)

The string password that will be used for encoding/decoding the callid in case of topology\_hiding with callid mangling.

_Default value is “"OpenSIPS"”_

**Example�1.1.�Set `th_callid_passwd` parameter**

...
modparam("topology\_hiding", "th\_callid\_passwd", "my\_topo\_hiding\_secret")
...

  

### 1.3.2.�`th_callid_prefix` (string)

The prefix that will be used for detecting callids which have been encoded by the dialog topology hiding. Make sure to change this value in case your SIP path contains multiple OpenSIPS boxes with topology hiding.

_Default value is “"DLGCH\_"”_

**Example�1.2.�Set `th_callid_prefix` parameter**

...
modparam("topology\_hiding", "th\_callid\_prefix", "MYCALLIDPREFIX\_")
...

  

### 1.3.3.�`th_passed_contact_uri_params` (string)

List of semicolon-separated Contact URI parameters that will be passed from one side to the other for topology hiding calls. To be used when end-to-end functionality uses such Contact URI parameters.

_Default value is “empty” - do not pass any parameters_

**Example�1.3.�Set `th_passed_contact_uri_params` parameter**

...
modparam("topology\_hiding", "th\_passed\_contact\_uri\_params", "paramname1;myparam;custom\_param")
...

  

### 1.3.4.�`th_passed_contact_params` (string)

List of semicolon-separated Contact header parameters that will be passed from one side to the other for topology hiding calls. To be used when end-to-end functionality uses such Contact header parameters.

_Default value is “empty” - do not pass any parameters_

**Example�1.4.�Set `th_passed_contact_params` parameter**

...
modparam("topology\_hiding", "th\_passed\_contact\_params", "paramname1;myparam;custom\_param")
...

  

### 1.3.5.�`force_dialog` (int)

If set to 1, the module will internally create the dialog ( if not already created ). This will only work for INVITE based dialogs, and the dialog module must be loaded.

_Default value is “0”_

**Example�1.5.�Set `force_dialog` parameter**

...
modparam("topology\_hiding", "force\_dialog", 1)
...

  

### 1.3.6.�`th_contact_encode_passwd` (string)

When not relying on the dialog module ( due to script writer preference or simply when doing topo hiding for non INVITE dialogs ), the module will store the needed information in a Contact URI param. The parameter configures the string password that will be used for encoding/decoding that specific param .

_Default value is “"ToPoCtPaSS"”_

**Example�1.6.�Set `th_contact_encode_passwd` parameter**

...
modparam("topology\_hiding", "th\_contact\_encode\_passwd", "my\_topoh\_passwd")
...

  

### 1.3.7.�`th_contact_encode_param` (string)

When not relying on the dialog module ( due to script writer preference or simply when doing topo hiding for non INVITE dialogs ), the module will store the needed information in a Contact URI param. The parameter configures the respective parameter name.

_Default value is “"thinfo"”_

**Example�1.7.�Set `th_contact_encode_param` parameter**

...
modparam("topology\_hiding", "th\_contact\_encode\_param", "customparam")
...

  

### 1.3.8.�`th_contact_encode_scheme` (string)

When not relying on the dialog module ( due to script writer preference or simply when doing topo hiding for non INVITE dialogs ), the module will store the needed information in a Contact URI param. This parameter configures the encoding scheme to be used for the data stored in the Contact URI param. Possible values are:

*   _base64_
    
*   _base32_
    

_Default value is “"base64"”_

**Example�1.8.�Set `th_contact_encode_scheme` parameter**

...
modparam("topology\_hiding", "th\_contact\_encode\_scheme", "base32")
...