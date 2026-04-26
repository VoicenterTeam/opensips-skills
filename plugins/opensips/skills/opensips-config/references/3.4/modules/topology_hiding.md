# topology_hiding Module Reference
<!-- generated-from: data/3.4/modules/topology_hiding.json
     generator-version: 0.1.0
     opensips-version: 3.4
     doc-type: module -->

Reference for the OpenSIPs 3.4 topology_hiding module. Read this file when configuring or debugging the topology_hiding module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

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
- `TM - Transaction Module` — The following modules must be loaded before this module

### External Libraries

None.

## Exported Parameters

### `force_dialog` (integer)

If set to 1, the module will internally create the dialog ( if not already created ). This will only work for INVITE based dialogs, and the dialog module must be loaded.

*Default value is 0.*

**Example.** 1.

```opensips
modparam("topology_hiding", "force_dialog", 1)
```
### `th_callid_passwd` (string)

The string password that will be used for encoding/decoding the callid in case of topology_hiding with callid mangling.

*Default value is OpenSIPS.*

**Example.** my_topo_hiding_secret.

```opensips
modparam("topology_hiding", "th_callid_passwd", "my_topo_hiding_secret")
```
### `th_callid_prefix` (string)

The prefix that will be used for detecting callids which have been encoded by the dialog topology hiding. Make sure to change this value in case your SIP path contains multiple OpenSIPS boxes with topology hiding.

*Default value is DLGCH_.*

**Example.** MYCALLIDPREFIX_.

```opensips
modparam("topology_hiding", "th_callid_prefix", "MYCALLIDPREFIX_")
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

*Default value is empty.*

**Example.** paramname1;myparam;custom_param.

```opensips
modparam("topology_hiding", "th_passed_contact_params", "paramname1;myparam;custom_param")
```
### `th_passed_contact_uri_params` (string)

List of semicolon-separated Contact URI parameters that will be passed from one side to the other for topology hiding calls. To be used when end-to-end functionality uses such Contact URI parameters.

*Default value is empty.*

**Example.** paramname1;myparam;custom_param.

```opensips
modparam("topology_hiding", "th_passed_contact_uri_params", "paramname1;myparam;custom_param")
```

## Exported Functions

### `topology_hiding([flags])`

By calling this function on an initial request, the modules will hide the topology, meaning that it will strip and restore all the Via, Record-Route and Route headers and it will replace the contact with the IP address of the interface where the request was received. You must note however, that the detection of the future in-dialog requests(BYE, reInvite, etc.) for these dialogs on which topology hiding is applied, is not done automatically. Without topology hiding and only normal dialog, the detection was done when loose_route was called. But now, for this dialogs where topology hiding is applied, the in dialog requests reaching OpenSIPS won't have any Route headers and the RURI will point to OpenSIPS machine. So, to be able to match the in-dialog requests to the corresponding dialog, a script function must be called. It's name is topology_hiding_match and you can read it's description above. The in-dialog topology requests are requests with a to tag, RURI pointing to opensips and with a method specific to a Invite dialog. For this kind of requests you should call topology_hiding_match() function. If the request is successfully matched and fixed as according to the topology hiding logic,the function returns success. Optionally,the function also receives a string parameter, which holds string flags. Current options for the string flags are : U - Propagate the Username in the Contact header URI; D - Dialog ID (DID) is pushed into Contact username, rather than URI param. This option makes sense only when using topology hiding with dialog support.; a - Preserve the advertised Contact header advertised to the caller throughout the entire dialog.; A - Preserve the advertised Contact header advertised to the callee throughout the entire dialog.; C - Encode the callid header. There are many cases where propagating the callid towards the callee side is not a good idea, since sometimes the callid contains the IP of the actual caller side, thus revealing part of the network topology. When using the "C" flag, the callid will be automatically encoded / decoded, transparent for the script writer - inside OpenSIPS (script,MI functions, etc ) all the variables related to the callid will represent the callid value for the caller side. If the callid for the callee side is needed, refer to the $TH_callee_callid pvar. Note: Changing the callid of the call using the "C" flag is only available when doing topology_hiding with dialog support. Using this flag without dialog support will not change the callid at all!.

**Parameters:**

- `flags` *(string, optional)* — String flags controlling behavior.
  - `U`
  - `D`
  - `a`
  - `A`
  - `C`

**Return codes:**

- `1` — Success
- `-1` — Error

**Usable from:** REQUEST_ROUTE

**Related:**

- `topology_hiding_match`

**Example.** topology_hiding usage.

```opensips
...
if(!has_totag() && is_method("INVITE")) {
	topology_hiding();
}
...
...
if(!has_totag() && is_method("INVITE")) {
	topology_hiding("U");
}
...
```

### `topology_hiding_match([dlg_match_mode])`

This function is to be used to match and fix a sequential request belong to an existing topology hiding dialog. With regards to dialog matching (including the optional parameter), this function behaves identically to match_dialog(). Please see the dialog module documentation for further details regarding dialog matching options. The function returns true if a topology hiding dialog exists for the request and the request has been successfully fixed.

**Parameters:**

- `dlg_match_mode` *(int, optional)* — Optional parameter for dialog matching. Behaves identically to match_dialog().

**Return codes:**

- `true` — if a topology hiding dialog exists for the request and the request has been successfully fixed
- `false` — otherwise

**Usable from:** REQUEST_ROUTE

**Related:**

- `match_dialog`

**Example.** Calling topology_hiding_match() function for topology hiding sequential requests.

```opensips
...
if (has_totag())
        if(topology_hiding_match())
        {
                xlog("Found a request $rm belonging to an existing topology hiding dialog\n");
                route(relay);
                exit;
        }
}
...
```

**Example.** topology_hiding_match_dialog() usage.

```opensips
...
    if (has_totag()) {
        if (!topology_hiding_match() ) {
            xlog(" cannot match request to a dialog \n");
	    send_reply(404,"Not found");
        } else
		route(RELAY);
    }
...
```

## Exported Pseudo-Variables

### `$TH_callee_callid`

Read only variable that will contain the callid as it is propagated towards the callee side, in case topology_hiding("C") is called.

NULL will be returned if there is no topology hiding dialog for the request or if topology_hiding with callid encoding was not used for the current dialog.

- **Type:** string
- **Read/write:** read-only
- **Scope:** request

## Configuration Examples

### Set `th_callid_passwd` parameter

Sets the string password that will be used for encoding/decoding the callid in case of topology_hiding with callid mangling.

```opensips
...
modparam("topology_hiding", "th_callid_passwd", "my_topo_hiding_secret")
...
```
### Set `th_callid_prefix` parameter

Sets the prefix that will be used for detecting callids which have been encoded by the dialog topology hiding.

```opensips
...
modparam("topology_hiding", "th_callid_prefix", "MYCALLIDPREFIX_")
...
```
### Set `th_passed_contact_uri_params` parameter

Sets a list of semicolon-separated Contact URI parameters that will be passed from one side to the other for topology hiding calls.

```opensips
...
modparam("topology_hiding", "th_passed_contact_uri_params", "paramname1;myparam;custom_param")
...
```
### Set `th_passed_contact_params` parameter

Sets a list of semicolon-separated Contact header parameters that will be passed from one side to the other for topology hiding calls.

```opensips
...
modparam("topology_hiding", "th_passed_contact_params", "paramname1;myparam;custom_param")
...
```
### Set `force_dialog` parameter

Enables the module to internally create the dialog (if not already created).

```opensips
...
modparam("topology_hiding", "force_dialog", 1)
...
```
### Set `th_contact_encode_passwd` parameter

Sets the string password that will be used for encoding/decoding the Contact URI param when not relying on the dialog module.

```opensips
...
modparam("topology_hiding", "th_contact_encode_passwd", "my_topoh_passwd")
...
```
### Set `th_contact_encode_param` parameter

Sets the parameter name used to store information in a Contact URI param when not relying on the dialog module.

```opensips
...
modparam("topology_hiding", "th_contact_encode_param", "customparam")
...
```
### Set `th_contact_encode_scheme` parameter

Sets the encoding scheme (base64 or base32) to be used for the data stored in the Contact URI param.

```opensips
...
modparam("topology_hiding", "th_contact_encode_scheme", "base32")
...
```
### `topology_hiding` usage

Demonstrates calling the topology_hiding() function on an initial INVITE request to hide the topology, optionally with flags.

```opensips
...
if(!has_totag() && is_method("INVITE")) {
	topology_hiding();
}
...
...
if(!has_totag() && is_method("INVITE")) {
	topology_hiding("U");
}
...
```
### `Calling topology_hiding_match() function for topology hiding sequential requests`

Demonstrates calling topology_hiding_match() to match sequential requests to an existing topology hiding dialog.

```opensips
...
if (has_totag())
        if(topology_hiding_match())
        {
                xlog("Found a request $rm belonging to an existing topology hiding dialog\n");
                route(relay);
                exit;
        }
}
...
```
### `topology_hiding_match_dialog()` usage

Demonstrates using topology_hiding_match() to match and fix a sequential request belonging to an existing topology hiding dialog.

```opensips
...
    if (has_totag()) {
        if (!topology_hiding_match() ) {
            xlog(" cannot match request to a dialog \n");
	    send_reply(404,"Not found");
        } else
		route(RELAY);
    }
...
```
