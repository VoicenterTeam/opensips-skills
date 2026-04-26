# maxfwd Module Reference
<!-- generated-from: data/4.0/modules/maxfwd.json
     generator-version: 0.1.0
     opensips-version: 4.0
     doc-type: module -->

Reference for the OpenSIPs 4.0 maxfwd module. Read this file when configuring or debugging the maxfwd module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Configuration Examples](#configuration-examples)

## Overview

The module implements all the operations regarding MaX-Forward header field, like adding it (if not present) or decrementing and checking the value of the existent one.

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

None.

## Exported Parameters

### `max_limit` (integer)

Set an upper limit for the max-forward value in the outgoing requests. If the header is present, the decremented value is not allowed to exceed this max_limits - if it does, the header value will by decreased to “max_limit”.

*Default value is 256.*

*Valid range: 1 to 256.*

**Notes:** This check is done when calling the mf_process_maxfwd_header() header.

**Example.** 32.

```opensips
...
modparam("maxfwd", "max_limit", 32)
...
```

## Exported Functions

### `is_maxfwd_lt(max_value)`

Checks if the Max-Forward header value is less then the “max_value” parameter value. It considers also the value of the new inserted header (if locally added).

**Parameters:**

- `max_value` *(int, required)* — value to check the Max-Forward.value against (as less than).

**Return codes:**

- `1` — header was found or set and its value is strictly less than “max_value”
- `-1` — the header was found or set and its value is greater or equal to “max_value”
- `-2` — header was not found or not set
- `-3` — error during processing

**Example.** is_maxfwd_lt usage.

```opensips
...
# next hope is a gateway, so make no sens to
# forward if MF is 0 (after decrement)
if ( is_maxfwd_lt(1) ) {
	sl_send_reply(483,"Too Many Hops");
	exit;
};
...
```

### `mf_process_maxfwd_header(max_value)`

If no Max-Forward header is present in the received request, a header will be added having the original value equal with “max_value”. If a Max-Forward header is already present, its value will be decremented (if not 0).

**Parameters:**

- `max_value` *(int, required)* — Value to be added if there is no Max-Forwards header field in the message.

**Return codes:**

- `2` — header was not found and a new header was successfully added
- `1` — header was found and its value was successfully decremented (had a non-0 value)
- `-1` — the header was found and its value is 0 (cannot be decremented)
- `-2` — error during processing

**Usable from:** REQUEST_ROUTE

**Example.** mx_process_maxfwd_header usage.

```opensips
...
# initial sanity checks -- messages with
# max_forwards==0, or excessively long requests
if (!mf_process_maxfwd_header(10) && $retcode==-1) {
	sl_send_reply(483,"Too Many Hops");
	exit;
};
...
```

## Configuration Examples

### Set `max_limit` parameter

Set an upper limit for the max-forward value in the outgoing requests.

```opensips
...
modparam("maxfwd", "max_limit", 32)
...
```
### `mx_process_maxfwd_header` usage

Initial sanity checks for messages with max_forwards==0, or excessively long requests.

```opensips
...
# initial sanity checks -- messages with
# max_forwards==0, or excessively long requests
if (!mf_process_maxfwd_header(10) && $retcode==-1) {
	sl_send_reply(483,"Too Many Hops");
	exit;
};
...
```
### `is_maxfwd_lt` usage

Check if Max-Forward header value is less than a specific value before forwarding.

```opensips
...
# next hope is a gateway, so make no sens to
# forward if MF is 0 (after decrement)
if ( is_maxfwd_lt(1) ) {
	sl_send_reply(483,"Too Many Hops");
	exit;
};
...
```
