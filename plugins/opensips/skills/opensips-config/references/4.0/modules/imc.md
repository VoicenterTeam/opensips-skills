# imc Module Reference
<!-- generated-from: data/4.0/modules/imc.json
     generator-version: 0.1.0
     opensips-version: 4.0
     doc-type: module -->

Reference for the OpenSIPs 4.0 imc module. Read this file when configuring or debugging the imc module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Exported MI Functions](#exported-mi-functions)
- [Exported Statistics](#exported-statistics)
- [Configuration Examples](#configuration-examples)

## Overview

This module offers support for instant message conference. It follows the architecture of IRC channels, you can send commands embedded in MESSAGE body, because there are no SIP UA clients which have GUI for IM conferencing.

## How It Works

You have to define an URI corresponding to im conferencing manager, where user can send commands to create a new conference room. Once the conference room is created, users can send commands directly to conferece's URI.

To ease the integration in the configuration file, the interpreter of the IMC commands are embeded in the module, from configuration poin of view, there is only one function which has to be executed for both messages and commands.

## Dependencies

### OpenSIPs Modules

- `mysql`
- `tm`

### External Libraries

None.

## Exported Parameters

### `db_url` (string)

The database url.

*Default value is mysql://opensips:opensipsrw@localhost/opensips.*

**Example.** dbdriver://username:password@dbhost/dbname.

```opensips
modparam("imc", "db_url", "dbdriver://username:password@dbhost/dbname")
```
### `hash_size` (integer)

The power of 2 to get the size of the hash table used for storing members and rooms.

*Default value is 4 (resultimg in hash size 16)..*

**Example.** 8.

```opensips
modparam("imc", "hash_size", 8)
```
### `imc_cmd_start_char` (string)

The character which indicates that the body of the message is a command.

*Default value is #.*

**Example.** #.

```opensips
modparam("imc", "imc_cmd_start_char", "#")
```
### `members_table` (string)

The name of the table storing IMC members.

*Default value is imc_members.*

**Example.** members.

```opensips
modparam("imc", "rooms_table", "members")
```
### `outbound_proxy` (string)

The SIP address used as next hop when sending the message. Very useful when using OpenSIPS with a domain name not in DNS, or when using a separate OpenSIPS instance for imc processing. If not set, the message will be sent to the address in destination URI.

*Default value is NULL.*

**Example.** sip:opensips.org;transport=tcp.

```opensips
modparam("imc", "outbound_proxy", "sip:opensips.org;transport=tcp")
```
### `rooms_table` (string)

The name of the table storing IMC rooms.

*Default value is imc_rooms.*

**Example.** rooms.

```opensips
modparam("imc", "rooms_table", "rooms")
```

## Exported Functions

### `imc_manager()`

Handles Message method.It detects if the body of the message is a conference command.If so it executes it, otherwise it sends the message to all the members in the room.

**Usable from:** REQUEST_ROUTE

**Example.** Usage of `imc_manager()` function.

```opensips
...
# the rooms will be named chat-xyz to avoid overlapping
# with usernames
if(is_method("MESSAGE)
        && ($ru=~ "sip:chat-[0-9]+@" || ($ru=~ "sip:chat-manager@")
    imc_manager();
...
```

## Exported MI Functions

### `imc:list_members`

Replaces obsolete MI command: _imc_list_members_.

Listing of the members in IM Conferencing rooms.

**Parameters:**

- `room` *(string, required)* — the room for which you want to list the members

**Example.** MI FIFO Command Format:

```opensips-cli
opensips-cli -x mi imc:list_members sip:chat-000@opensips.org
```

### `imc:list_rooms`

Replaces obsolete MI command: _imc_list_rooms_.

Lists of the IM Conferencing rooms.

**Example.** MI FIFO Command Format:

```opensips-cli
opensips-cli -x mi imc:list_rooms
```

## Exported Statistics

### `active_rooms`

Number of active IM Conferencing rooms.

- **Type:** gauge

## Configuration Examples

### Set `db_url` parameter

Set the database url.

```opensips
...
modparam("imc", "db_url", "dbdriver://username:password@dbhost/dbname")
...
```
### Set `rooms_table` parameter

Set the name of the table storing IMC rooms.

```opensips
...
modparam("imc", "rooms_table", "rooms")
...
```
### Set `members_table` parameter

Set the name of the table storing IMC members.

```opensips
...
modparam("imc", "rooms_table", "members")
...
```
### Set `hash_size` parameter

Set the power of 2 to get the size of the hash table used for storing members and rooms.

```opensips
...
modparam("imc", "hash_size", 8)
...
```
### Set `imc_cmd_start_char` parameter

Set the character which indicates that the body of the message is a command.

```opensips
...
modparam("imc", "imc_cmd_start_char", "#")
...
```
### Set `outbound_proxy` parameter

Set the SIP address used as next hop when sending the message.

```opensips
...
modparam("imc", "outbound_proxy", "sip:opensips.org;transport=tcp")
...
```
### Usage of `imc_manager()` function

Handle Message method and detect if the body of the message is a conference command.

```opensips
...
# the rooms will be named chat-xyz to avoid overlapping
# with usernames
if(is_method("MESSAGE)
        && ($ru=~ "sip:chat-\[0-9\]+@" || ($ru=~ "sip:chat-manager@")
    imc_manager();
...
```
