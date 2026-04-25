# uac Module Reference
<!-- generated-from: data/3.6/modules/uac.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 uac module. Read this file when configuring or debugging the uac module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Configuration Examples](#configuration-examples)

## Overview

UAC (User Agent Client) module provides some basic UAC functionalities like FROM / TO header manipulation (anonymization) or client authentication.

## How It Works

If the dialog module is loaded and a dialog can be created, then the auto mode can be done more efficiently.

## Dependencies

### OpenSIPs Modules

- `Dialog` — if “force_dialog” module parameter is enabled, or a dialog is created from the configuration script (optional)
- `RR` — Record-Route Module, but only if restore mode for FROM URI is set to “auto” (optional)
- `TM` — Transaction Module
- `UAC_AUTH` — UAC Authentication Module

### External Libraries

None.

## Exported Parameters

### `force_dialog` (integer)

Force create dialog if it is not created from the configuration script.

*Default value is no.*

**Example.** Set the `force_dialog` parameter.

```opensips
modparam("uac", "force_dialog", yes)
```
### `restore_mode` (string)

There are 3 mode of restoring the original headers (FROM/TO) URI:

*   “none” - no information about original URI is stored; restoration is not possible.
    
*   “manual” - all following replies will be restored, except for the sequential requests - these must be manually updated based on original URI.
    
*   “auto” - all sequential requests and replies will be automatically updated based on stored original URI.

*Default value is auto.*

**Possible values:**

- none
- manual
- auto

**Example.** Set the `restore_mode` parameter.

```opensips
modparam("uac","restore_mode","auto")
```
### `restore_passwd` (string)

String password to be used to encrypt the RR storing parameter (when replacing the TO/FROM headers). If empty, no encryption will be used.

*Default value is empty.*

**Example.** Set the `restore_passwd` parameter.

```opensips
modparam("uac","restore_passwd","my_secret_passwd")
```
### `rr_from_store_param` (string)

Name of Record-Route header parameter that will be used to store (encoded) the original FROM URI.

*Default value is vsf.*

**Example.** Set the `rr_from_store_param` parameter.

```opensips
modparam("uac","rr_from_store_param","my_Fparam")
```
### `rr_to_store_param` (string)

Name of Record-Route header parameter that will be used to store (encoded) the original TO URI.

*Default value is vst.*

**Example.** Set the `rr_to_store_param` parameter.

```opensips
modparam("uac","rr_to_store_param","my_Tparam")
```

## Exported Functions

### `uac_auth([algorithms])`

This function can be called only from failure route and will build the authentication response header and insert it into the request without sending anything. Credentials for buiding the authentication response will be taken from the list of credentials provided by the uac_auth module (static or via AVPs). As optional parameter, the function may receive a list of auth algorithms to be considered / supported during authentication: MD5, MD5-sess, SHA-256, SHA-256-sess (may be missing, depends on lib support), SHA-512-256, SHA-512-256-sess (may be missing, depends on lib support). Note that the CSeq is automatically increased during authentication. _NOTE:_ when used without dialog support, the _uac_auth()_ function cannot be used for authenticating in-dialog requests, as there is no mechanism to store the CSeq changes that are required for ensuring the correctness of the dialog. The only exception are _BYE_ messages, which are the last messages within a call, hence no further adjustments are needed. The function can still be used for authenticating the initial INVITE though.

**Parameters:**

- `algorithms` *(string, optional)* — List of auth algorithms to be considered / supported during authentication
  - `MD5`
  - `MD5-sess`
  - `SHA-256`
  - `SHA-256-sess`
  - `SHA-512-256`
  - `SHA-512-256-sess`

**Usable from:** FAILURE_ROUTE

**Example.** .

```opensips
uac_auth();
```

**Example.** Usage in failure route with algorithm check.

```opensips
failure_route[check_auth] {
    ...
    if ($T_reply_code==407) {
        if (uac_auth("MD5,MD5-sess")) {
            # auth is succesful, just relay
            t_relay();
            exit;
        }
        # auth failed (no credentials maybe)
        # so continue handling the 407 reply
    }
    ...
}
```

### `uac_inc_cseq(cseq)`

This function can be called to increase the CSeq of an ongoing request. It receives as the _cseq_ parameter the value that the CSeq should be incremented with.

**Parameters:**

- `cseq` *(integer, required)* — The value that the CSeq should be incremented with.

**Usable from:** REQUEST_ROUTE, BRANCH_ROUTE, FAILURE_ROUTE

**Example.** .

```opensips
uac_inc_cseq(1);
```

### `uac_replace_from([display],uri)`

Replace in FROM header the _display_ name or/and the _URI_ part. Both parameters are string. The _display_ is optional. If missing, only the URI will be changed in the message. IMPORTANT: calling the function more than once per branch will lead to inconsistent changes over the request.Be sure you do the change only ONCE per branch. Note that calling the function from REQUEST ROUTE affects all the branches!, so no other change will be possible in the future. For per branch changes use BRANCH and FAILURE route.

**Parameters:**

- `display` *(string, optional)* — Display name to be replaced.
- `uri` *(string, required)* — URI part to be replaced.

**Usable from:** REQUEST_ROUTE, BRANCH_ROUTE, FAILURE_ROUTE

**Example.** replace both display and uri.

```opensips
uac_replace_from($avp(display),$avp(uri));
```

**Example.** replace only display and do not touch uri.

```opensips
uac_replace_from("batman","");
```

**Example.** remove display and replace uri.

```opensips
uac_replace_from("","sip:robin@gotham.org");
```

**Example.** remove display and do not touch uri.

```opensips
uac_replace_from("","");
```

**Example.** replace the URI without touching the display.

```opensips
uac_replace_from( , "sip:batman@gotham.org");
```

### `uac_replace_to([display],uri)`

Replace in TO header the _display_ name or/and the _URI_ part. Both parameters are string. The _display_ is optional. If missing, only the URI will be changed in the message. IMPORTANT: calling the function more than once per branch will lead to inconsistent changes over the request.Be sure you do the change only ONCE per branch. Note that calling the function from REQUEST ROUTE affects all the branches!, so no other change will be possible in the future. For per branch changes use BRANCH and FAILURE route.

**Parameters:**

- `display` *(string, optional)* — Display name to be replaced.
- `uri` *(string, required)* — URI part to be replaced.

**Usable from:** REQUEST_ROUTE, BRANCH_ROUTE, FAILURE_ROUTE

**Example.** replace both display and uri.

```opensips
uac_replace_to($avp(display),$avp(uri));
```

**Example.** replace only display and do not touch uri.

```opensips
uac_replace_to("batman","");
```

**Example.** remove display and replace uri.

```opensips
uac_replace_to("","sip:robin@gotham.org");
```

**Example.** remove display and do not touch uri.

```opensips
uac_replace_to("","");
```

**Example.** replace the URI without touching the display.

```opensips
uac_replace_to( , "sip:batman@gotham.org");
```

### `uac_restore_from()`

This function will check if the FROM URI was modified and will use the information stored in header parameter to restore the original FROM URI value. NOTE - this function should be used only if you configured MANUAL restoring of the headers (see restore_mode param). For AUTO and NONE, there is no need to use this function.

**Usable from:** REQUEST_ROUTE

**Example.** .

```opensips
uac_restore_from();
```

### `uac_restore_to()`

This function will check if the TO URI was modified and will use the information stored in header parameter to restore the original TO URI value. NOTE - this function should be used only if you configured MANUAL restoring of the headers (see restore_mode param). For AUTO and NONE, there is no need to use this function.

**Usable from:** REQUEST_ROUTE

**Example.** .

```opensips
uac_restore_to();
```

## Configuration Examples

### Set `restore_mode` parameter

Set `restore_mode` parameter

```opensips
...
modparam("uac","restore_mode","auto")
...
```
### Set `restore_passwd` parameter

Set `restore_passwd` parameter

```opensips
...
modparam("uac","restore_passwd","my_secret_passwd")
...
```
### Set `rr_from_store_param` parameter

Set `rr_from_store_param` parameter

```opensips
...
modparam("uac","rr_from_store_param","my_Fparam")
...
```
### Set `rr_to_store_param` parameter

Set `rr_to_store_param` parameter

```opensips
...
modparam("uac","rr_to_store_param","my_Tparam")
...
```
### Set `force_dialog` parameter

Set `force_dialog` parameter

```opensips
...
modparam("uac", "force_dialog", yes)
...
```
### `uac_replace_from`/`uac_replace_to` usage

`uac_replace_from`/`uac_replace_to` usage

```opensips
...
# replace both display and uri
uac_replace_from($avp(display),$avp(uri));
# replace only display and do not touch uri
uac_replace_from("batman","");
# remove display and replace uri
uac_replace_from("","sip:robin@gotham.org");
# remove display and do not touch uri
uac_replace_from("","");
# replace the URI without touching the display
uac_replace_from( , "sip:batman@gotham.org");
...
```
### `uac_restore_from`/`uac_restore_to` usage

`uac_restore_from`/`uac_restore_to` usage

```opensips
...
uac_restore_from();
...
```
### `uac_auth` usage

`uac_auth` usage

```opensips
...
uac_auth();
...
failure_route[check_auth] {
    ...
    if ($T_reply_code==407) {
        if (uac_auth("MD5,MD5-sess")) {
            # auth is succesful, just relay
            t_relay();
            exit;
        }
        # auth failed (no credentials maybe)
        # so continue handling the 407 reply
    }
    ...
}
...
```
### `uac_inc_cseq` usage

`uac_inc_cseq` usage

```opensips
...
uac_inc_cseq(1);
...
```
