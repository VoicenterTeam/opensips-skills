# uac Module Reference
<!-- generated-from: data/3.5/modules/uac.json
     generator-version: 0.1.0
     opensips-version: 3.5
     doc-type: module -->

Reference for the OpenSIPs 3.5 uac module. Read this file when configuring or debugging the uac module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

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

- `Dialog Module` — Required if “force_dialog” module parameter is enabled, or a dialog is created from the configuration script
- `RR` — Record-Route Module, but only if restore mode for FROM URI is set to “auto”
- `TM` — Transaction Module
- `UAC_AUTH` — UAC Authentication Module

### External Libraries

None.

## Exported Parameters

### `force_dialog` (integer)

Force create dialog if it is not created from the configuration script.

*Default value is no.*

**Notes:** Default value is no.

**Example.** yes.

```opensips
modparam("uac", "force\_dialog", yes)
```
### `restore_mode` (string)

There are 3 mode of restoring the original headers (FROM/TO) URI:

*   “none” - no information about original URI is stored; restoration is not possible.
    
*   “manual” - all following replies will be restored, except for the sequential requests - these must be manually updated based on original URI.
    
*   “auto” - all sequential requests and replies will be automatically updated based on stored original URI.

*Default value is “auto”.*

**Possible values:**

- “none”
- “manual”
- “auto”

**Notes:** This parameter is optional, it's default value being “auto”.

**Example.** auto.

```opensips
modparam("uac","restore\_mode","auto")
```
### `restore_passwd` (string)

String password to be used to encrypt the RR storing parameter (when replacing the TO/FROM headers). If empty, no encryption will be used.

*Default value is empty.*

**Notes:** Default value of this parameter is empty.

**Example.** my\_secret\_passwd.

```opensips
modparam("uac","restore\_passwd","my\_secret\_passwd")
```
### `rr_from_store_param` (string)

Name of Record-Route header parameter that will be used to store (encoded) the original FROM URI.

*Default value is “vsf”.*

**Notes:** This parameter is optional, it's default value being “vsf”.

**Example.** my\_Fparam.

```opensips
modparam("uac","rr\_from\_store\_param","my\_Fparam")
```
### `rr_to_store_param` (string)

Name of Record-Route header parameter that will be used to store (encoded) the original TO URI.

*Default value is “vst”.*

**Notes:** This parameter is optional, it's default value being “vst”.

**Example.** my\_Tparam.

```opensips
modparam("uac","rr\_to\_store\_param","my\_Tparam")
```

## Exported Functions

### `uac_auth([algorithms])`

This function can be called only from failure route and will build the authentication response header and insert it into the request without sending anything. Credentials for buiding the authentication response will be taken from the list of credentials provided by the uac_auth module (static or via AVPs). As optional parameter, the function may receive a list of auth algorithms to be considered / supported during authentication: MD5, MD5-sess, SHA-256, SHA-256-sess (may be missing, depends on lib support), SHA-512-256, SHA-512-256-sess (may be missing, depends on lib support). Note that the CSeq is automatically increased during authentication. NOTE: when used without dialog support, the uac_auth() function cannot be used for authenticating in-dialog requests, as there is no mechanism to store the CSeq changes that are required for ensuring the correctness of the dialog. The only exception are BYE messages, which are the last messages within a call, hence no further adjustments are needed. The function can still be used for authenticating the initial INVITE though.

**Parameters:**

- `algorithms` *(string, optional)* — A list of auth algorithms to be considered / supported during authentication.
  - `MD5`
  - `MD5-sess`
  - `SHA-256`
  - `SHA-256-sess`
  - `SHA-512-256`
  - `SHA-512-256-sess`

**Usable from:** FAILURE_ROUTE

**Example.** Example 1.8. uac_auth usage.

```opensips
...
uac\_auth();
...
failure\_route[check\_auth] {
    ...
    if ($T\_reply\_code==407) {
        if (uac\_auth("MD5,MD5-sess")) {
            # auth is succesful, just relay
            t\_relay();
            exit;
        }
        # auth failed (no credentials maybe)
        # so continue handling the 407 reply
    }
    ...
}
...
```

### `uac_inc_cseq(cseq)`

This function can be called to increase the CSeq of an ongoing request. It receives as the cseq parameter the value that the CSeq should be incremented with.

**Parameters:**

- `cseq` *(integer, required)* — The value that the CSeq should be incremented with.

**Usable from:** REQUEST_ROUTE, BRANCH_ROUTE, FAILURE_ROUTE

**Example.** Example 1.9. uac_inc_cseq usage.

```opensips
...
uac\_inc\_cseq(1);
...
```

### `uac_replace_from([display],uri)`

Replace in FROM header the display name or/and the URI part. Both parameters are string. The display is optional. If missing, only the URI will be changed in the message. IMPORTANT: calling the function more than once per branch will lead to inconsistent changes over the request.Be sure you do the change only ONCE per branch. Note that calling the function from REQUEST ROUTE affects all the branches!, so no other change will be possible in the future. For per branch changes use BRANCH and FAILURE route.

**Parameters:**

- `display` *(string, optional)* — The display name to replace.
- `uri` *(string, required)* — The URI to replace.

**Usable from:** REQUEST_ROUTE, BRANCH_ROUTE, FAILURE_ROUTE

**Example.** Example 1.6. uac_replace_from/uac_replace_to usage.

```opensips
...
# replace both display and uri
uac\_replace\_from($avp(display),$avp(uri));
# replace only display and do not touch uri
uac\_replace\_from("batman","");
# remove display and replace uri
uac\_replace\_from("","sip:robin@gotham.org");
# remove display and do not touch uri
uac\_replace\_from("","");
# replace the URI without touching the display
uac\_replace\_from( , "sip:batman@gotham.org");
...
```

### `uac_replace_to([display],uri)`

Replace in TO header the display name or/and the URI part. Both parameters are string. The display is optional. If missing, only the URI will be changed in the message. IMPORTANT: calling the function more than once per branch will lead to inconsistent changes over the request.Be sure you do the change only ONCE per branch. Note that calling the function from REQUEST ROUTE affects all the branches!, so no other change will be possible in the future. For per branch changes use BRANCH and FAILURE route.

**Parameters:**

- `display` *(string, optional)* — The display name to replace.
- `uri` *(string, required)* — The URI to replace.

**Usable from:** REQUEST_ROUTE, BRANCH_ROUTE, FAILURE_ROUTE

**Example.** Example 1.6. uac_replace_from/uac_replace_to usage.

```opensips
...
# replace both display and uri
uac\_replace\_from($avp(display),$avp(uri));
# replace only display and do not touch uri
uac\_replace\_from("batman","");
# remove display and replace uri
uac\_replace\_from("","sip:robin@gotham.org");
# remove display and do not touch uri
uac\_replace\_from("","");
# replace the URI without touching the display
uac\_replace\_from( , "sip:batman@gotham.org");
...
```

### `uac_restore_from()`

This function will check if the FROM URI was modified and will use the information stored in header parameter to restore the original FROM URI value. NOTE - this function should be used only if you configured MANUAL restoring of the headers (see restore_mode param). For AUTO and NONE, there is no need to use this function.

**Usable from:** REQUEST_ROUTE

**Example.** Example 1.7. uac_restore_from/uac_restore_to usage.

```opensips
...
uac\_restore\_from();
...
```

### `uac_restore_to()`

This function will check if the TO URI was modified and will use the information stored in header parameter to restore the original TO URI value. NOTE - this function should be used only if you configured MANUAL restoring of the headers (see restore_mode param). For AUTO and NONE, there is no need to use this function.

**Usable from:** REQUEST_ROUTE

**Example.** Example 1.7. uac_restore_from/uac_restore_to usage.

```opensips
...
uac\_restore\_from();
...
```

## Configuration Examples

### Set `restore_mode` parameter

Sets the restore_mode parameter to 'auto'.

```opensips
...
modparam("uac","restore\_mode","auto")
...
```
### Set `restore_passwd` parameter

Sets the restore_passwd parameter to 'my_secret_passwd'.

```opensips
...
modparam("uac","restore\_passwd","my\_secret\_passwd")
...
```
### Set `rr_from_store_param` parameter

Sets the rr_from_store_param parameter to 'my_Fparam'.

```opensips
...
modparam("uac","rr\_from\_store\_param","my\_Fparam")
...
```
### Set `rr_to_store_param` parameter

Sets the rr_to_store_param parameter to 'my_Tparam'.

```opensips
...
modparam("uac","rr\_to\_store\_param","my\_Tparam")
...
```
### Set `force_dialog` parameter

Sets the force_dialog parameter to 'yes'.

```opensips
...
modparam("uac", "force\_dialog", yes)
...
```
### `uac_replace_from`/`uac_replace_to` usage

Demonstrates various ways to replace display names and URIs in FROM/TO headers.

```opensips
...
# replace both display and uri
uac\_replace\_from($avp(display),$avp(uri));
# replace only display and do not touch uri
uac\_replace\_from("batman","");
# remove display and replace uri
uac\_replace\_from("","sip:robin@gotham.org");
# remove display and do not touch uri
uac\_replace\_from("","");
# replace the URI without touching the display
uac\_replace\_from( , "sip:batman@gotham.org");
...
```
### `uac_restore_from`/`uac_restore_to` usage

Demonstrates restoring the original FROM URI.

```opensips
...
uac\_restore\_from();
...
```
### `uac_auth` usage

Demonstrates using uac_auth in a failure route with specific algorithms.

```opensips
...
uac\_auth();
...
failure\_route\[check\_auth\] {
    ...
    if ($T\_reply\_code==407) {
        if (uac\_auth("MD5,MD5-sess")) {
            # auth is succesful, just relay
            t\_relay();
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

Demonstrates incrementing the CSeq.

```opensips
...
uac\_inc\_cseq(1);
...
```
