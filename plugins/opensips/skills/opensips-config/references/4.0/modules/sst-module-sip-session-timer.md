# SST Module (SIP Session Timer) Module Reference
<!-- generated-from: data/4.0/modules/sst-module-sip-session-timer.json
     generator-version: 0.1.0
     opensips-version: 4.0
     doc-type: module -->

Reference for the OpenSIPs 4.0 SST Module (SIP Session Timer) module. Read this file when configuring or debugging the SST Module (SIP Session Timer) module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Exported Statistics](#exported-statistics)
- [Configuration Examples](#configuration-examples)

## Overview

The sst module provides a way to update the dialog expire timer based on the SIP INVITE/200 OK Session-Expires header value. You can use the sst module in an OpenSIPS proxy to allow freeing of local resources of dead (expired) calls.

You can also use the sst module to validate the MIN_SE header value and reply to any request with a "422 - Session Timer Too Small" if the value is too small for your OpenSIPS configuration.

## How It Works

The sst module uses the dialog module to be notified of any new or updated dialogs. It will then look for and extract the session-expire: header value (if there is one) and override the dialog expire timer value for the current context dialog.

You flag any call setup INVITE that you want to cause a timed session to be established. This will cause OpenSIPS to request the use of session times if the UAC does not request it.

All of this happens with a properly configured dialog and sst module and setting the dialog flag and the sst flag at the time any INVITE sip message is seen. There is no opensips.cfg script function call required to set the dialog expire timeout value. See the dialog module users guide for more information.

The sstCheckMin() script function can be used to varify the Session-expires / MIN-SE header field values are not too small for a proxy. If the SST min_se parameter value is smaller then the messages Session-Expires / MIN-SE values, the test will return true. You can also configure the function to send the 422 response for you.

The following was taken from the RFC as a call flow example:

**Example 1.1. Session timer call flow**

+-------+    +-------+       +-------+
| UAC-1 |    | PROXY |       | UAC-2 |
+-------+    +-------+       +-------+
    |(1) INVITE  |               |
    |SE: 50      |               |
    |----------->|               |
    |            |(2)sstCheckMin |
    |            |-----+         |
    |            |     |         |
    |            |<----+         |
    |(3) 422     |               |
    |MSE:1800    |               |
    |<-----------|               |
    |            |               |
    |(4)ACK      |               |
    |----------->|               |
    |            |               |
    |(5) INVITE  |               |
    |SE: 1800    |               |
    |MSE: 1800   |               |
    |----------->|               |
    |            |(6)sstCheckMin |
    |            |-----+         |
    |            |     |         |
    |            |<----+         |
    |            |(7)setflag     |
    |            |create dialog  |
    |            |Set expire     |
    |            |-----+         |
    |            |     |         |
    |            |<----+         |
    |            |               |
    |            |(8)INVITE      |
    |            |SE: 1800       |
    |            |MSE: 1800      |
    |            |-------------->|
    |            |               |
 ...

## Dependencies

### OpenSIPs Modules

- `dialog` — dialog module and its decencies. (tm)
- `sl` — stateless module.

### External Libraries

None.

## Exported Parameters

### `enable_stats` (integer)

If the statistics support should be enabled or not. Via statistic variables, the module provide information about the dialog processing. Set it to zero to disable or to non-zero to enable it.

*Default value is 1.*

**Example.** 0.

```opensips
modparam("sst", "enable_stats", 0)
```
### `min_se` (integer)

The value is used to set the proxies MIN-SE value and is used in the 422 reply as the proxies MIN-SE: header value if the sstCheckMin() flag is set to true and the check fails.

If not set and sstCheckMin() is called with the send-reply flag set to true, the default 1800 seconds will be used as the compare and the MIN-SE: header value if the 422 reply is sent.

*Default value is 1800.*

**Example.** 2400.

```opensips
modparam("sst", "min_se", 2400)
```
### `reject_to_small` (integer)

In the initial INVITE if the UAC has requested a Session-Expire: and it's value is smaller then our local policies Min-SE (see min_se above), then the PROXY has the right to reject the call by replying to the message with a 422 Session Timer Too Small and state our local Min-SE: value. The INVITE is NOT forwarded on through the PROXY.

This flag if true will tell the SST module to reject the INVITE with a 422 response. If false, the INVITE is forwarded through the PROXY with out any modifications.

*Default value is 1.*

**Example.** 0.

```opensips
modparam("sst", "reject_to_small", 0)
```
### `sst_flag` (string)

Keeping with OpenSIPS, the module will not do anything to any message unless instructed to do so via the opensips.cfg script. You must set the sst_flag value in the setflag() call of the INVITE you want the sst module to process. But before you can do that, you need to tell the sst module which flag value you are assigning to sst.

In most cases when ever you create a new dialog via create_dialog() function,you will want to set the sst flag. If create_dialog() is not called and the sst flag is set, it will not have any effect.

This parameter must be set of the module will not load.

*Default value is Not set!.*

**Example.** SST_FLAG.

```opensips
modparam("sst", "sst_flag", "SST_FLAG")
...
route {
  ...
  if ($rm=="INVITE") {
    setflag(SST_FLAG); # Set the sst flag
    create_dialog(); # and then create the dialog
  }
  ...
}
```
### `sst_interval` (integer)

The sst minimum interval in Session-Expires header if OpenSIPS request the use of session times. The used value will be the maximum value between OpenSIPS minSE, UAS minSE and this value.

Per default the interval used will be the min_se value

*Default value is 0.*

**Example.** 2400.

```opensips
modparam("sst", "sst_interval", 2400)
```

## Exported Functions

### `sstCheckMin(send_reply_flag)`

Check the current Session-Expires / MIN-SE values against the sst_min_se parameter value. If the Session-Expires or MIN-SE header value is less then modules minimum value, this function will return true.

If the fuction is called with the send_reply_flag set to true (1) and the requested Session-Expires / MIN-SE values are too small, a 422 reply will be sent for you. The 422 will carry a MIN-SE: header with the sst min_se parameter value set.

**Parameters:**

- `send_reply_flag` *(int, required)* — If the fuction is called with the send_reply_flag set to true (1) and the requested Session-Expires / MIN-SE values are too small, a 422 reply will be sent for you. The 422 will carry a MIN-SE: header with the sst min_se parameter value set.
  - `0`
  - `1`

**Return codes:**

- `true` — If the Session-Expires or MIN-SE header value is less then modules minimum value
- `false` — Otherwise

**Usable from:** REQUEST_ROUTE

**Example.** sstCheckMin usage.

```opensips
...
modparam("sst", "sst_flag", "SST_FLAG")
modparam("sst", "min_se", 2400) # Must be >= 90
...

route {
  if ($rm=="INVITE") {
	if (sstCheckMin(1)) {
		xlog("L_ERR", "422 Session Timer Too Small reply sent.\n");
		exit;
	}
	# track the session timers via the dialog module
	setflag(SST_FLAG);
	create_dialog();
  }
}
...
```

## Exported Statistics

### `expired_sst`

Number of dialogs which got expired session timer.

- **Type:** counter

## Configuration Examples

### Set `enable_stats` parameter

Set the enable_stats parameter to 0.

```opensips
...
modparam("sst", "enable_stats", 0)
...
```
### Set `min_se` parameter

Set the min_se parameter to 2400.

```opensips
...
modparam("sst", "min_se", 2400)
...
```
### Set `sst_interval` parameter

Set the sst_interval parameter to 2400.

```opensips
...
modparam("sst", "sst_interval", 2400)
...
```
### Set `reject_to_small` parameter

Set the reject_to_small parameter to 0.

```opensips
...
modparam("sst", "reject_to_small", 0)
...
```
### Set `sst_flag` parameter

Set the sst_flag parameter and usage in route block.

```opensips
...
modparam("sst", "sst_flag", "SST_FLAG")
...
route {
  ...
  if ($rm=="INVITE") {
    setflag(SST_FLAG); # Set the sst flag
    create_dialog(); # and then create the dialog
  }
  ...
}
...
```
### `sstCheckMin` usage

Usage of sstCheckMin function.

```opensips
...
modparam("sst", "sst_flag", "SST_FLAG")
modparam("sst", "min_se", 2400) # Must be >= 90
...

route {
  if ($rm=="INVITE") {
	if (sstCheckMin(1)) {
		xlog("L_ERR", "422 Session Timer Too Small reply sent.\\n");
		exit;
	}
	# track the session timers via the dialog module
	setflag(SST_FLAG);
	create_dialog();
  }
}

...
```
