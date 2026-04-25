# pua_usrloc Module Reference
<!-- generated-from: data/3.5/modules/pua_usrloc.json
     generator-version: 0.1.0
     opensips-version: 3.5
     doc-type: module -->

Reference for the OpenSIPs 3.5 pua_usrloc module. Read this file when configuring or debugging the pua_usrloc module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Configuration Examples](#configuration-examples)

## Overview

The pua_usrloc is the connector between usrloc and pua modules. It creates the environment to send PUBLISH requests for user location records, on specific events (e.g., when new record is added in usrloc, a PUBLISH with status open (online) is issued; when expires, it sends closed (offline)). Using this module, phones which have no support for presence can be seen as online/offline.

## Dependencies

### OpenSIPs Modules

- `pua`
- `usrloc`

### External Libraries

- `libxml`

## Exported Parameters

### `default_domain` (string)

The default domain to use when constructing the presentity uri if it is missing from recorded aor.

*Default value is NULL.*

**Example.** opensips.org.

```opensips
modparam("pua_usrloc", "default_domain", "opensips.org")
```
### `entity_prefix` (string)

The prefix when construstructing entity attribute to be added to presence node in xml pidf. (ex: pres:user@domain ).

*Default value is NULL.*

**Example.** pres.

```opensips
modparam("pua_usrloc", "entity_prefix", "pres")
```
### `presence_server` (string)

The the address of the presence server. If set, it will be used as outbound proxy when sending PUBLISH requests.

**Example.** sip:pa@opensips.org:5075.

```opensips
modparam("pua_usrloc", "presence_server", "sip:pa@opensips.org:5075")
```

## Exported Functions

### `pua_set_publish()`

The function is used to mark REGISTER requests that have to issue a PUBLISH. The PUBLISH is issued when REGISTER is saved in location table.

**Example.** pua_set_publish usage.

```opensips
if(is_method("REGISTER") && $fu=~"john@opensips.org") 
	pua_set_publish();
```

## Configuration Examples

### Set `default_domain` parameter

The default domain to use when constructing the presentity uri if it is missing from recorded aor.

```opensips
...
modparam("pua_usrloc", "default_domain", "opensips.org")
...
```
### Set `presentity_prefix` parameter

The prefix when construstructing entity attribute to be added to presence node in xml pidf. (ex: pres:user@domain ).

```opensips
...
modparam("pua_usrloc", "entity_prefix", "pres")
...
```
### Set `presence_server` parameter

The the address of the presence server. If set, it will be used as outbound proxy when sending PUBLISH requests.

```opensips
...
modparam("pua_usrloc", "presence_server", "sip:pa@opensips.org:5075")
...
```
### `pua_set_publish` usage

The function is used to mark REGISTER requests that have to issue a PUBLISH. The PUBLISH is issued when REGISTER is saved in location table.

```opensips
...
if(is_method("REGISTER") && $fu=~"john@opensips.org") 
	pua_set_publish();
...
```
