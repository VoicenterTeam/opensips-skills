# freeswitch Module Reference
<!-- generated-from: data/3.6/modules/freeswitch.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 freeswitch module. Read this file when configuring or debugging the freeswitch module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Configuration Examples](#configuration-examples)

## Overview

The _"freeswitch"_ module is a C driver for the FreeSWITCH Event Socket Layer interface. It can interact with one or more FreeSWITCH servers either by issuing commands to them, or by receiving events from them.

This driver can be seen as a centralized FreeSWITCH ESL connection manager. OpenSIPS modules may use its API in order to easily establish, reference and reuse ESL connections.

A FreeSWITCH ESL URL is of the form: **fs://\[username\]:password@host\[:port\]**. The default ESL port is 8021.

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

None.

## Exported Parameters

### `esl_cmd_polling_itv` (integer)

The sleep interval used when polling for an ESL command response. Since the value of this parameter imposes a minimal duration for any ESL command, you should run OpenSIPS in debug mode in order to first determine an expected response time for an arbitrary ESL command, then tune this parameter accordingly.

*Default value is 1000.*

**Example.** 3000.

```opensips
...
modparam("freeswitch", "esl_cmd_polling_itv", 3000)
...
```
### `esl_cmd_timeout` (integer)

The maximally allowed duration for the execution of an ESL command. This interval does not include the connect duration.

*Default value is 5000.*

**Example.** 3000.

```opensips
...
modparam("freeswitch", "esl_cmd_timeout", 3000)
...
```
### `esl_connect_timeout` (integer)

The maximally allowed duration for the establishment of an ESL connection.

*Default value is 5000.*

**Example.** 3000.

```opensips
...
modparam("freeswitch", "esl_connect_timeout", 3000)
...
```
### `event_heartbeat_interval` (integer)

The expected interval between FreeSWITCH HEARTBEAT event arrivals.

*Default value is 1.*

**Example.** 20.

```opensips
...
modparam("freeswitch", "event_heartbeat_interval", 20)
...
```

## Configuration Examples

### Setting the `event_heartbeat_interval` parameter

Sets the expected interval between FreeSWITCH HEARTBEAT event arrivals.

```opensips
...
modparam("freeswitch", "event_heartbeat_interval", 20)
...
```
### Setting the `esl_connect_timeout` parameter

Sets the maximally allowed duration for the establishment of an ESL connection.

```opensips
...
modparam("freeswitch", "esl_connect_timeout", 3000)
...
```
### Setting the `esl_cmd_timeout` parameter

Sets the maximally allowed duration for the execution of an ESL command.

```opensips
...
modparam("freeswitch", "esl_cmd_timeout", 3000)
...
```
### Setting the `esl_cmd_polling_itv` parameter

Sets the sleep interval used when polling for an ESL command response.

```opensips
...
modparam("freeswitch", "esl_cmd_polling_itv", 3000)
...
```
