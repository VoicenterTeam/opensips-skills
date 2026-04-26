# sl Module Reference
<!-- generated-from: data/3.4/modules/sl.json
     generator-version: 0.1.0
     opensips-version: 3.4
     doc-type: module -->

Reference for the OpenSIPs 3.4 sl module. Read this file when configuring or debugging the sl module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Exported Statistics](#exported-statistics)
- [Configuration Examples](#configuration-examples)

## Overview

The SL module allows OpenSIPS to act as a stateless UA server and generate replies to SIP requests without keeping state. That is beneficial in many scenarios, in which you wish not to burden server's memory and scale well.

## How It Works

The SL module needs to filter ACKs sent after a local stateless reply to an INVITE was generated. To recognize such ACKs, OpenSIPS adds a special "signature" in to-tags. This signature is sought for in incoming ACKs, and if included, the ACKs are absorbed.

To speed up the filtering process, the module uses a timeout mechanism. When a reply is sent, a timer is set. As time as the timeout didn't hit, the incoming ACK requests will be checked using TO tag value. Once the timer expires, all the ACK are let through - a long time passed till it sent a reply, so it does not expect any ACK that have to be blocked.

The ACK filtering may fail in some rare cases. If you think these matter to you, better use stateful processing (tm module) for INVITE processing. Particularly, the problem happens when a UA sends an INVITE which already has a to-tag in it (e.g., a re-INVITE) and OpenSIPS want to reply to it. Than, it will keep the current to-tag, which will be mirrored in ACK. OpenSIPS will not see its signature and forward the ACK downstream. Caused harm is not bad--just a useless ACK is forwarded.

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

None.

## Exported Parameters

### `enable_stats` (integer)

If the module should generate and export statistics to the core manager. A zero value means disabled.

SL module provides statistics about how many replies were sent ( splitted per code classes) and how many local ACKs were filtered out.

*Default value is 1.*

**Example.** 0.

```opensips
modparam("sl", "enable_stats", 0)
```

## Exported Functions

### `sl_reply_error()`

Sends back an error reply describing the nature of the last internal error. Usually this function should be used after a script function that returned an error code.

**Usable from:** REQUEST_ROUTE

**Example.** sl_reply_error usage.

```opensips
sl_reply_error();
```

### `sl_send_reply(code, reason)`

For the current request, a reply is sent back having the given code and text reason. The reply is sent stateless, totally independent of the Transaction module and with no retransmission for the INVITE's replies. 'code' and 'reason' can contain pseudo-variables that are replaced at runtime.

**Parameters:**

- `code` *(int, required)* — Return code.
- `reason` *(string, required)* — Reason phrase.

**Usable from:** REQUEST_ROUTE, ERROR_ROUTE

**Example.** sl_send_reply usage.

```opensips
sl_send_reply(404, "Not found");
sl_send_reply($err.rcode, $err.rreason);
```

## Exported Statistics

### `1xx_replies`

The number of 1xx_replies.

- **Type:** counter
### `2xx_replies`

The number of 2xx_replies.

- **Type:** counter
### `3xx_replies`

The number of 3xx_replies.

- **Type:** counter
### `4xx_replies`

The number of 4xx_replies.

- **Type:** counter
### `5xx_replies`

The number of 5xx_replies.

- **Type:** counter
### `6xx_replies`

The number of 6xx_replies.

- **Type:** counter
### `received_ACKs`

The number of received_ACKs.

- **Type:** counter
### `sent_err_replies`

The number of sent_err_replies.

- **Type:** counter
### `sent_replies`

The number of sent_replies.

- **Type:** counter

## Configuration Examples

### enable_stats example

Set the enable_stats parameter to 0 to disable statistics generation.

```opensips
modparam("sl", "enable_stats", 0)
```
### sl_send_reply usage

Send a stateless reply with a specific code and reason, or using pseudo-variables.

```opensips
...
sl_send_reply(404, "Not found");
...
sl_send_reply($err.rcode, $err.rreason);
...
```
### sl_reply_error usage

Send an error reply describing the last internal error.

```opensips
...
sl_reply_error();
...
```
