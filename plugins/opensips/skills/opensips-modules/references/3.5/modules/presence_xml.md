# presence_xml Module Reference
<!-- generated-from: data/3.5/modules/presence_xml.json
     generator-version: 0.1.0
     opensips-version: 3.5
     doc-type: module -->

Reference for the OpenSIPs 3.5 presence_xml module. Read this file when configuring or debugging the presence_xml module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Configuration Examples](#configuration-examples)

## Overview

The module does specific handling for notify-subscribe events using xml bodies. It is used with the general event handling module, presence. It constructs and adds 3 events to it: presence, presence.winfo, dialog;sla.

This module takes the xcap permission rule documents from xcap_table. The presence permission rules are interpreted according to the specifications in RFC 4745 and RFC 5025.

## Dependencies

### OpenSIPs Modules

- `a database module`
- `presence`
- `signaling`
- `xcap`
- `xcap_client` — Only compulsory if not using an integrated xcap server (if 'integrated_xcap_server' parameter is not set)

### External Libraries

- `libxml-dev`

## Exported Parameters

### `force_active` (integer)

This parameter is used for permissions when handling Subscribe messages. If set to 1, subscription state is considered active and the presentity is not queried for permissions(should be set to 1 if not using an xcap server). Otherwise,the xcap server is queried and the subscription states is according to user defined permission rules. If no rules are defined for a certain watcher, the subscriptions remains in pending state and the Notify sent will have no body.

*Default value is 0.*

**Possible values:**

- 0
- 1

**Notes:** Note: When switching from one value to another, the watchers table must be emptied.

**Example.** Set the `force_active` parameter.

```opensips
modparam("presence_xml", "force_active", 1)
```
### `generate_offline_body` (string)

This parameter should be set to 0 if you want to prevent OpenSIPS from automatically generating a PIDF body when a publication expires or is explicitly terminated (a PUBLISH request is received with Expires: 0).

**Example.** 0.

```opensips
modparam("presence_xml", "generate_offline_body", 0)
```
### `pidf_manipulation` (integer)

Setting this parameter to 1 enables the features described in RFC 4827. It gives the possibility to have a permanent state notified to the users even in the case in which the phone is not online. The presence document is taken from the xcap server and aggregated together with the other presence information, if any exist, for each Notify that is sent to the watchers. It is also possible to have information notified even if not issuing any Publish (useful for services such as email, SMS, MMS).

*Default value is 0.*

**Possible values:**

- 0
- 1

**Example.** Set the `pidf_manipulation` parameter.

```opensips
modparam("presence_xml", "pidf_manipulation", 1)
```
### `pres_rules_auid` (string)

This parameter should be configured if you are using the non integrated xcap mode and you need to use another pres-rules auid than the default 'pres-rules'.

*Default value is pres-rules.*

**Example.** org.openmobilealliance.pres-rules.

```opensips
modparam("presence_xml", "pres_rules_auid", "org.openmobilealliance.pres-rules")
```
### `pres_rules_filename` (string)

This parameter should be configured if you are using the non integrated xcap mode and you need to configure another filename than the default 'index'.

*Default value is index.*

**Example.** pres-rules.

```opensips
modparam("presence_xml", "pres_rules_filename", "pres-rules")
```
### `xcap_server` (string)

The address of the xcap servers used for storage. This parameter is compulsory if the integrated_xcap_server parameter is not set. It can be set more that once, to construct an address list of trusted XCAP servers.

**Example.** xcap_server.example.org.

```opensips
modparam("presence_xml", "xcap_server", "xcap_server.example.org")
```

## Configuration Examples

### Set `force_active` parameter

This parameter is used for permissions when handling Subscribe messages. If set to 1, subscription state is considered active and the presentity is not queried for permissions(should be set to 1 if not using an xcap server). Otherwise,the xcap server is queried and the subscription states is according to user defined permission rules. If no rules are defined for a certain watcher, the subscriptions remains in pending state and the Notify sent will have no body. Note: When switching from one value to another, the watchers table must be emptied.

```opensips
...
modparam("presence_xml", "force_active", 1)
...
```
### Set `pidf_manipulation` parameter

Setting this parameter to 1 enables the features described in RFC 4827. It gives the possibility to have a permanent state notified to the users even in the case in which the phone is not online. The presence document is taken from the xcap server and aggregated together with the other presence information, if any exist, for each Notify that is sent to the watchers. It is also possible to have information notified even if not issuing any Publish (useful for services such as email, SMS, MMS).

```opensips
...
modparam("presence_xml", "pidf_manipulation", 1)
...
```
### Set `xcap_server` parameter

The address of the xcap servers used for storage. This parameter is compulsory if the integrated_xcap_server parameter is not set. It can be set more that once, to construct an address list of trusted XCAP servers.

```opensips
...
modparam("presence_xml", "xcap_server", "xcap_server.example.org")
modparam("presence_xml", "xcap_server", "xcap_server.ag.org")
...
```
### Set `pres_rules_auid` parameter

This parameter should be configured if you are using the non integrated xcap mode and you need to use another pres-rules auid than the default 'pres-rules'.

```opensips
...
modparam("presence_xml", "pres_rules_auid", "org.openmobilealliance.pres-rules")
...
```
### Set `pres_rules_filename` parameter

This parameter should be configured if you are using the non integrated xcap mode and you need to configure another filename than the default 'index'.

```opensips
...
modparam("presence_xml", "pres_rules_filename", "pres-rules")
...
```
### Set `generate_offline_body` parameter

This parameter should be set to 0 if you want to prevent OpenSIPS from automatically generating a PIDF body when a publication expires or is explicitly terminated (a PUBLISH request is received with Expires: 0).

```opensips
...
modparam("presence_xml", "generate_offline_body", 0)
...
```
