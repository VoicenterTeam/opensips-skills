# diversion Module Reference
<!-- generated-from: data/3.4/modules/diversion.json
     generator-version: 0.1.0
     opensips-version: 3.4
     doc-type: module -->

Reference for the OpenSIPs 3.4 diversion module. Read this file when configuring or debugging the diversion module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Configuration Examples](#configuration-examples)

## Overview

The module implements the Diversion extensions as per draft-levy-sip-diversion-08. The diversion extensions are useful in various scenarios involving call forwarding. Typically one needs to communicate the original recipient of the call to the PSTN gateway and this is what the diversion extensions can be used for.

### Warning

The draft-levy-sip-diversion-08 is expired!! See [IETF I-D tracker](https://datatracker.ietf.org/public/idindex.cgi?command=id_detail%E2%88%A7id=6002).

## How It Works

According to the specification new Diversion header field should be inserted as the topmost Diversion header field in the message, that means before any other existing Diversion header field in the message. In addition to that, `add_diversion` function can be called several times and each time it should insert the new Diversion header field as the topmost one.

In order to implement this, add_diversion function creates the anchor in data_lump lists as a static variable to ensure that the next call of the function will use the same anchor and would insert new Diversion headers before the one created in the previous execution. To my knowledge this is the only way of inserting the diversion header field before any other created in previous runs of the function.

The anchor kept this way is only valid for a single message and we have to invalidate it when another message is being processed. For this reason, the function also stores the id of the message in another static variable and compares the value of that variable with the id of the SIP message being processed. If they differ then the anchor will be invalidated and the function creates a new one.

The following code snippet shows the code that invalidates the anchor, new anchor will be created when the `anchor` variable is set to 0.

static inline int add_diversion_helper(struct sip_msg* msg, str* s)
{
    static struct lump* anchor = 0;
    static int msg_id = 0;

    if (msg_id != msg->id) {
        msg_id = msg->id;
        anchor = 0;
    }
...
}

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

None.

## Exported Parameters

### `suffix` (string)

The suffix to be appended to the end of the header field. You can use the parameter to specify additional parameters to be added to the header field, see the example.

**Example.** ;privacy=full.

```opensips
modparam("diversion", "suffix", ";privacy=full")
```

## Exported Functions

### `add_diversion(reason, [uri], [counter])`

The function adds a new diversion header field before any other existing Diversion header field in the message (the newly added Diversion header field will become the topmost Diversion header field). The inbound (without any modifications done by the proxy server) Request-URI will be used as the Diversion URI.

**Parameters:**

- `counter` *(int, optional)* — Diversion counter to be added to the header, as defined by the standard.
- `reason` *(string, required)* — The reason string to be added as the reason parameter
- `uri` *(string, optional)* — The URI to be added in the header. If missing the unchanged RURI from the original message will be used.

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE

**Example.** add_diversion usage.

```opensips
add_diversion("user-busy");
```

## Configuration Examples

### `suffix` usage

The suffix to be appended to the end of the header field. You can use the parameter to specify additional parameters to be added to the header field, see the example.

```opensips
modparam("diversion", "suffix", ";privacy=full")
```
### `add_diversion` usage

The function adds a new diversion header field before any other existing Diversion header field in the message (the newly added Diversion header field will become the topmost Diversion header field).

```opensips
...
add_diversion("user-busy");
...
```
