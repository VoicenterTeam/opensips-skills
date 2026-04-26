# qos Module Reference
<!-- generated-from: data/4.0/modules/qos.json
     generator-version: 0.1.0
     opensips-version: 4.0
     doc-type: module -->

Reference for the OpenSIPs 4.0 qos module. Read this file when configuring or debugging the qos module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Configuration Examples](#configuration-examples)

## Overview

The qos module provides a way to keep track of per dialog SDP session(s).

## How It Works

The qos module uses the dialog module to be notified of any new or updated dialogs. It will then look for and extract the SDP session (if present) from SIP requests and replies and keep track of it for the entire life of a dialog.

All of this happens with a properly configured dialog and qos module and setting the dialog flag and the qos flag at the time any INVITE sip message is seen. There is no config script function call required to set the SDP session tracking mechanism. See the dialog module users guide for more information.

A dialog can have one or more SDP sessions active in one of the following states:

*   _pending_ - only one end point of the SDP session is known.
    
*   _negotiated_ - both end points of the SDP session are known.

An SDP session can be established in one of the following scenarios:

*   _INVITE/200ok_ - typical "INVITE" and "200 OK" SDP exchange.
    
*   _200ok/ACK_ - "200 OK" and "ACK" SDP exchange (for calls starting with an empty INVITE).
    
*   _183/PRACK_ - early media via "183 Session Progress" and "PRACK" (see rfc3959 for more information) - not implemented yet.

## Dependencies

### OpenSIPs Modules

- `dialog` — dialog module and its decencies (tm)

### External Libraries

None.

## Exported Parameters

### `qos_flag` (string)

Keeping with OpenSIPS, the module will not do anything to any message unless instructed to do so via the config script. You must set the qos_flag value in the setflag() call of the INVITE you want the qos module to process. But before you can do that, you need to tell the qos module which flag value you are assigning to qos.

In most cases when ever you create a new dialog via create_dialog() function,you will want to set the qos flag. If create_dialog() is not called and the qos flag is set, it will not have any effect.

This parameter must be set of the module will not load.

*Default value is Not set!.*

**Example.** QOS_FLAG.

```opensips
...
modparam("qos", "qos_flag", "QOS_FLAG")
...
route {
  ...
  if ($rm=="INVITE") {
    setflag(QOS_FLAG); # Set the qos flag
	create_dialog(); # create the dialog
  }
  ...
}
```

## Configuration Examples

### Set `qos_flag` parameter

Sets the qos_flag parameter and uses it in the script.

```opensips
...
modparam("qos", "qos_flag", "QOS_FLAG")
...
route {
  ...
  if ($rm=="INVITE") {
    setflag(QOS_FLAG); # Set the qos flag
	create_dialog(); # create the dialog
  }
  ...
}
```
