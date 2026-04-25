# topology_hiding Module Reference
<!-- generated-from: data/3.6/modules/topology_hiding.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 topology_hiding module. Read this file when configuring or debugging the topology_hiding module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Exported Pseudo-Variables](#exported-pseudo-variables)
- [Configuration Examples](#configuration-examples)

## Overview

This is a module which provides topology hiding capabilities. The module can work on top of the dialog module, or as a standalone module ( thus alowing topology hiding for all types of requests )

## Dependencies

### OpenSIPs Modules

- `Dialog Module` — Required if “force_dialog” module parameter is enabled, or a dialog is created from the configuration script
- `TM` — Transaction Module

### External Libraries

None.

## Exported Parameters

### `force_dialog` (integer)

If set to 1, the module will internally create the dialog ( if not already created ). This will only work for INVITE based dialogs, and the dialog module must be loaded.

*Default value is 0.*

**Example.** 1.

```opensips
modparam("topology\_hiding", "force\_dialog", 1)
```
### `th_callid_passwd` (string)

The string password that will be used for encoding/decoding the callid in case of topology\_hiding with callid mangling.

*Default value is "OpenSIPS".*

**Example.** my\_topo\_hiding\_secret.

```opensips
modparam("topology\_hiding", "th\_callid\_passwd", "my\_topo\_hiding\_secret")
```
### `th_callid_prefix` (string)

The prefix that will be used for detecting callids which have been encoded by the dialog topology hiding. Make sure to change this value in case your SIP path contains multiple OpenSIPS boxes with topology hiding.

*Default value is "DLGCH\_".*

**Example.** MYCALLIDPREFIX\_.

```opensips
modparam("topology\_hiding", "th\_callid\_prefix", "MYCALLIDPREFIX\_")
```
### `th_contact_callee_username_var` (string)

Variable used to store the value of the contact username advertised to the callee.

*Default value is _th_contact_callee_username_var_.*

**Example.** __topo_hiding_username_var__.

```opensips
modparam("topology_hiding", "th_contact_callee_username_var", "__topo_hiding_username_var__")
```
### `th_contact_caller_username_var` (string)

Variable used to store the value of the contact username advertised to the caller.

*Default value is _th_contact_caller_username_var_.*

**Example.** __topo_hiding_username_var__.

```opensips
modparam("topology_hiding", "th_contact_caller_username_var", "__topo_hiding_username_var__")
```
### `th_contact_encode_param` (string)

When not relying on the dialog module ( due to script writer preference or simply when doing topo hiding for non INVITE dialogs ), the module will store the needed information in a Contact URI param. The parameter configures the respective parameter name.

*Default value is thinfo.*

**Example.** customparam.

```opensips
modparam("topology_hiding", "th_contact_encode_param", "customparam")
```
### `th_contact_encode_passwd` (string)

When not relying on the dialog module ( due to script writer preference or simply when doing topo hiding for non INVITE dialogs ), the module will store the needed information in a Contact URI param. The parameter configures the string password that will be used for encoding/decoding that specific param .

*Default value is ToPoCtPaSS.*

**Example.** my_topoh_passwd.

```opensips
modparam("topology_hiding", "th_contact_encode_passwd", "my_topoh_passwd")
```
### `th_contact_encode_scheme` (string)

When not relying on the dialog module ( due to script writer preference or simply when doing topo hiding for non INVITE dialogs ), the module will store the needed information in a Contact URI param. This parameter configures the encoding scheme to be used for the data stored in the Contact URI param.

*Default value is base64.*

**Possible values:**

- base64
- base32

**Example.** base32.

```opensips
modparam("topology_hiding", "th_contact_encode_scheme", "base32")
```
### `th_passed_contact_params` (string)

List of semicolon-separated Contact header parameters that will be passed from one side to the other for topology hiding calls. To be used when end-to-end functionality uses such Contact header parameters.

*Default value is empty - do not pass any parameters.*

**Example.** paramname1;myparam;custom\_param.

```opensips
modparam("topology\_hiding", "th\_passed\_contact\_params", "paramname1;myparam;custom\_param")
```
### `th_passed_contact_uri_params` (string)

List of semicolon-separated Contact URI parameters that will be passed from one side to the other for topology hiding calls. To be used when end-to-end functionality uses such Contact URI parameters.

*Default value is empty - do not pass any parameters.*

**Example.** paramname1;myparam;custom\_param.

```opensips
modparam("topology\_hiding", "th\_passed\_contact\_uri\_params", "paramname1;myparam;custom\_param")
```

## Exported Functions

### `topology_hiding([flags], [contact_username])`

By calling this function on an initial request, the modules will hide the topology, meaning that it will strip and restore all the Via, Record-Route and Route headers and it will replace the contact with the IP address of the interface where the request was received.

**Parameters:**

- `contact_username` *(string, optional)* — Advertise a particular username in the Contact header URI. Format: [caller_contact_username][/callee_contact_username].
- `flags` *(string, optional)* — String flags to control topology hiding behavior.
  - `U`
  - `D`
  - `a`
  - `A`
  - `C`

**Return codes:**

- `1` — Success

**Usable from:** REQUEST_ROUTE

**Related:**

- `topology_hiding_match`

**Example.** Basic topology hiding usage on initial INVITE..

```opensips
if(!has_totag() && is_method("INVITE")) {\n\ttopology_hiding();\n}
```

**Example.** Topology hiding with 'U' flag to propagate username..

```opensips
if(!has_totag() && is_method("INVITE")) {\n\ttopology_hiding("U");\n}
```

**Example.** Set 'opensips' for both caller and callee Contact username..

```opensips
if(!has_totag() && is_method("INVITE")) {\n\ttopology_hiding("U", "opensips");\n}
```

**Example.** Set specific usernames for caller and callee legs..

```opensips
if(!has_totag() && is_method("INVITE")) {\n\ttopology_hiding("U", "/caller/callee");\n}
```

### `topology_hiding_match([dlg_match_mode])`

This function is to be used to match and fix a sequential request belong to an existing topology hiding dialog. The in-dialog topology requests are requests with a to tag, RURI pointing to opensips and with a method specific to a Invite dialog.

**Parameters:**

- `dlg_match_mode` *(string, optional)* — Dialog matching mode, behaves identically to match_dialog().

**Return codes:**

- `true` — if a topology hiding dialog exists for the request and the request has been successfully fixed.

**Usable from:** REQUEST_ROUTE

**Related:**

- `match_dialog`

**Example.** Matching sequential requests for topology hiding..

```opensips
if (has_totag()) {\n        if(topology_hiding_match())\n        {\n                xlog("Found a request $rm belonging to an existing topology hiding dialog\\n");\n                route(relay);\n                exit;\n        }\n}
```

**Example.** Handling sequential requests with error checking..

```opensips
if (has_totag()) {\n    if (!topology_hiding_match() ) {\n        xlog(" cannot match request to a dialog \\n");\n        send_reply(404,"Not found");\n    } else\n        route(RELAY);\n}
```

## Exported Pseudo-Variables

### `$TH_callee_callid`

Read only variable that will contain the callid as it is propagated towards the callee side, in case topology\_hiding("C") is called. NULL will be returned if there is no topology hiding dialog for the request or if topology\_hiding with callid encoding was not used for the current dialog.

- **Type:** string
- **Read/write:** read-only
- **Scope:** 

## Configuration Examples

### Set `th_callid_passwd` parameter

The string password that will be used for encoding/decoding the callid in case of topology_hiding with callid mangling.

```opensips
...
modparam("topology\_hiding", "th\_callid\_passwd", "my\_topo\_hiding\_secret")
...
```
### Set `th_callid_prefix` parameter

The prefix that will be used for detecting callids which have been encoded by the dialog topology hiding. Make sure to change this value in case your SIP path contains multiple OpenSIPS boxes with topology hiding.

```opensips
...
modparam("topology\_hiding", "th\_callid\_prefix", "MYCALLIDPREFIX\_")
...
```
### Set `th_passed_contact_uri_params` parameter

List of semicolon-separated Contact URI parameters that will be passed from one side to the other for topology hiding calls. To be used when end-to-end functionality uses such Contact URI parameters.

```opensips
...
modparam("topology\_hiding", "th\_passed\_contact\_uri\_params", "paramname1;myparam;custom\_param")
...
```
### Set `th_passed_contact_params` parameter

List of semicolon-separated Contact header parameters that will be passed from one side to the other for topology hiding calls. To be used when end-to-end functionality uses such Contact header parameters.

```opensips
...
modparam("topology\_hiding", "th\_passed\_contact\_params", "paramname1;myparam;custom\_param")
...
```
### Set `force_dialog` parameter

If set to 1, the module will internally create the dialog ( if not already created ). This will only work for INVITE based dialogs, and the dialog module must be loaded.

```opensips
...
modparam("topology\_hiding", "force\_dialog", 1)
...
```
### Set `th_contact_encode_passwd` parameter

When not relying on the dialog module ( due to script writer preference or simply when doing topo hiding for non INVITE dialogs ), the module will store the needed information in a Contact URI param. The parameter configures the string password that will be used for encoding/decoding that specific param .

```opensips
...
modparam("topology\_hiding", "th\_contact\_encode\_passwd", "my\_topoh\_passwd")
...
```
### Set `th_contact_encode_param` parameter

When not relying on the dialog module ( due to script writer preference or simply when doing topo hiding for non INVITE dialogs ), the module will store the needed information in a Contact URI param. The parameter configures the respective parameter name.

```opensips
...
modparam("topology\_hiding", "th\_contact\_encode\_param", "customparam")
...
```
### Set `th_contact_encode_scheme` parameter

When not relying on the dialog module ( due to script writer preference or simply when doing topo hiding for non INVITE dialogs ), the module will store the needed information in a Contact URI param. This parameter configures the encoding scheme to be used for the data stored in the Contact URI param.

```opensips
...
modparam("topology\_hiding", "th\_contact\_encode\_scheme", "base32")
...
```
### Set `th_contact_caller_username_var` parameter

Variable used to store the value of the contact username advertised to the caller.

```opensips
...
modparam("topology\_hiding", "th\_contact\_caller\_username\_var", "\_\_topo\_hiding\_username\_var\_\_")
...
```
### Set `th_contact_callee_username_var` parameter

Variable used to store the value of the contact username advertised to the callee.

```opensips
...
modparam("topology\_hiding", "th\_contact\_callee\_username\_var", "\_\_topo\_hiding\_username\_var\_\_")
...
```
### `topology_hiding` usage

By calling this function on an initial request, the modules will hide the topology, meaning that it will strip and restore all the Via, Record-Route and Route headers and it will replace the contact with the IP address of the interface where the request was received.

```opensips
...
if(!has\_totag() && is\_method("INVITE")) {
	topology\_hiding();
}
...
...
if(!has\_totag() && is\_method("INVITE")) {
	topology\_hiding("U");
}
...
# set "opensips" for both caller and the callee's Contact username
if(!has\_totag() && is\_method("INVITE")) {
	topology\_hiding("U", "opensips");
}
...
# set "caller" in the caller's Contact username
if(!has\_totag() && is\_method("INVITE")) {
	topology\_hiding("U", "/caller");
}
...
# set "callee" in the callee's Contact username
if(!has\_totag() && is\_method("INVITE")) {
	topology\_hiding("U", "//callee");
}
...
# set "caller" in the caller's Contact username and
# "callee" in the callee's Contact username
if(!has\_totag() && is\_method("INVITE")) {
	topology\_hiding("U", "/caller/callee");
}
...
```
### `Calling topology_hiding_match() function for topology hiding sequential requests`

```opensips
...
if (has\_totag())
        if(topology\_hiding\_match())
        {
                xlog("Found a request $rm belonging to an existing topology hiding dialog\n");
                route(relay);
                exit;
        }
}
...
```
### `topology_hiding_match_dialog()` usage

This function is to be used to match and fix a sequential request belong to an existing topology hiding dialog. With regards to dialog matching (including the optional parameter), this function behaves identically to match_dialog(). Please see the dialog module documentation for further details regarding dialog matching options.

```opensips
...
    if (has\_totag()) {
        if (!topology\_hiding\_match() ) {
            xlog(" cannot match request to a dialog \n");
	    send\_reply(404,"Not found");
        } else
		route(RELAY);
    }
...
```
