# sngtc Module Reference
<!-- generated-from: data/3.4/modules/sngtc.json
     generator-version: 0.1.0
     opensips-version: 3.4
     doc-type: module -->

Reference for the OpenSIPs 3.4 sngtc module. Read this file when configuring or debugging the sngtc module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Functions](#exported-functions)
- [Configuration Examples](#configuration-examples)

## Overview

The **Sangoma transcoding module** offers the possibility of performing voice transcoding with the [D-series transcoding cards manufactured by Sangoma](https://wiki.sangoma.com/display/MTC/Media+Transcoding). The module makes use of the Sangoma Transcoding API in order to manage transcoding sessions on the dedicated equipment. For the cards in the network to be detected, the Sangoma SOAP server must be up and running (_sngtc_server_ daemon).

## How It Works

The module performs several modifications in the SDP body of SIP INVITE, 200 OK and ACK messages. In all transcoding scenarios, the UAC performs early SDP negotiation, while the UAS does late negotiation. This way, OpenSIPS becomes responsible for intersecting the codec offer and answer, together with the management of transcoding sessions on the Sangoma cards.

This scenario brings about a couple of **restrictions**:

*   UACs MUST only perform early SDP negotiation
    
*   UASs MUST support late SDP negotiation (rfc 3261 requirement)

Since the _sngtc_node_ library performs several memory allocations with each newly created transcoding session, the module uses a dedicated process, responsible for the management of the above-mentioned sessions. The _sangoma_worker_ process communicates with the OpenSIPS UDP receivers through a series of pipes.

## Dependencies

### OpenSIPs Modules

- `dialog` — must be loaded before this module

### External Libraries

- `sngtc_node library` — required in order to compile this module
- `sngtc_server` — required in order for this module to properly work

## Exported Functions

### `sngtc_callee_answer([listen_if_A], [listen_if_B])`

Handles the SDP offer from 200 OK responses, intersects both offers with the capabilities of the transcoding card and creates a new transcoding session on the card **only if** necessary. It then rewrites the 200 OK SDP so that it contains the information resulted from the codec intersection.

**Parameters:**

- `listen_if_A` *(string, optional)* — the interface where the UAC (the caller) will send RTP after the call is established (IP from the 'c=' SDP line(s))
- `listen_if_B` *(string, optional)* — the interface where the UAS (the callee) will send RTP after the call is established (IP from the 'c=' SDP line(s))

**Return codes:**

- `-1` — SDP parsing error
- `-2` — failed to create transcoding session
- `-3` — internal error / no more memory

**Usable from:** REQUEST_ROUTE, ONREPLY_ROUTE

**Example.** sngtc_callee_answer usage.

```opensips
...
onreply_route[1] {
	if ($rs == 200)
		sngtc_callee_answer("11.12.13.14", "11.12.13.14");
}
...
```

### `sngtc_caller_answer()`

Attaches an SDP body to the caller's ACK request, so that it matches the late SDP negotiation done by the UAS.

**Return codes:**

- `-3` — internal error / no more memory

**Usable from:** REQUEST_ROUTE, ONREPLY_ROUTE

**Example.** sngtc_caller_answer usage.

```opensips
...
	if (has_totag()) {
		if (loose_route()) {
			...
			if (is_method("ACK"))
				sngtc_caller_answer();
		}
		...
	}
...
```

### `sngtc_offer()`

The function strips off the SDP offer from a SIP INVITE, thus asking for another SDP offer from the opposite endpoint (late negotiation).

**Return codes:**

- `-1` — SDP parsing error
- `-3` — internal error / no more memory

**Usable from:** REQUEST_ROUTE, ONREPLY_ROUTE

**Example.** sngtc_offer usage.

```opensips
...
	if (is_method("INVITE")) {
		t_newtran();
		create_dialog();
		sngtc_offer();
	}
...
```

## Configuration Examples

### `sngtc_offer` usage

Demonstrates using sngtc_offer() within an INVITE request handling block.

```opensips
...
if (is_method("INVITE")) {
	t_newtran();
	create_dialog();
	sngtc_offer();
}
...
```
### `sngtc_callee_answer` usage

Demonstrates using sngtc_callee_answer() within an onreply_route for 200 OK responses.

```opensips
...
onreply_route[1] {
	if ($rs == 200)
		sngtc_callee_answer("11.12.13.14", "11.12.13.14");
}
...
```
### `sngtc_caller_answer` usage

Demonstrates using sngtc_caller_answer() within an ACK request handling block.

```opensips
...
if (has_totag()) {
	if (loose_route()) {
		...
		if (is_method("ACK"))
			sngtc_caller_answer();
	}
	...
}
...
```
