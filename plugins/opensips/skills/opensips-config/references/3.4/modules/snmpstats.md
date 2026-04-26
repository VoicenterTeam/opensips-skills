# snmpstats Module Reference
<!-- generated-from: data/3.4/modules/snmpstats.json
     generator-version: 0.1.0
     opensips-version: 3.4
     doc-type: module -->

Reference for the OpenSIPs 3.4 snmpstats module. Read this file when configuring or debugging the snmpstats module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Statistics](#exported-statistics)
- [Configuration Examples](#configuration-examples)

## Overview

The SNMPStats module provides an SNMP management interface to OpenSIPS. Specifically, it provides general SNMP queryable scalar statistics, table representations of more complicated data such as user and contact information, and alarm monitoring capabilities.

### 1.1.1. General Scalar Statistics

The SNMPStats module provides a number of general scalar statistics. Details are available in OPENSER-MIB, OPENSER-REG-MIB, OPENSER-SIP-COMMON-MIB, and OPENSER-SIP-SERVER-MIB. But briefly, these scalars are:

openserSIPProtocolVersion, openserSIPServiceStartTime, openserSIPEntityType, openserSIPSummaryInRequests, openserSIPSummaryOutRequest, openserSIPSummaryInResponses, openserSIPSummaryOutResponses, openserSIPSummaryTotalTransactions, openserSIPCurrentTransactions, openserSIPNumUnsupportedUris, openserSIPNumUnsupportedMethods, openserSIPOtherwiseDiscardedMsgs, openserSIPProxyStatefulness openserSIPProxyRecordRoute, openserSIPProxyAuthMethod, openserSIPNumProxyRequireFailures, openserSIPRegMaxContactExpiryDuration, openserSIPRegMaxUsers, openserSIPRegCurrentUsers, openserSIPRegDfltRegActiveInterval, openserSIPRegAcceptedRegistrations, openserSIPRegRejectedRegistrations, openserMsgQueueDepth. openserCurNumDialogs, openserCurNumDialogsInProgress, openserCurNumDialogsInSetup, openserTotalNumFailedDialogSetups

There are also scalars associated with alarms. They are as follows:

openserMsgQueueMinorThreshold, openserMsgQueueMajorThreshold, openserMsgQueueDepthAlarmStatus, openserMsgQueueDepthMinorAlarm, openserMsgQueueDepthMajorAlarm, openserDialogLimitMinorThreshold, openserDialogLimitMajorThreshold, openserDialogUsageState, openserDialogLimitAlarmStatus, openserDialogLimitMinorAlarm, openserDialogLimitMajorAlarm

### 1.1.2. SNMP Tables

The SNMPStats module provides several tables, containing more complicated data. The current available tables are:

openserSIPPortTable, openserSIPMethodSupportedTable, openserSIPStatusCodesTable, openserSIPRegUserTable, openserSIPContactTable, openserSIPRegUserLookupTable

### 1.1.3. Alarm Monitoring

If enabled, the SNMPStats module will monitor for alarm conditions. Currently, there are two alarm types defined.

1. The number of active dialogs has passed a minor or major threshold. The idea is that a network operation centre can be made aware that their SIP servers may be overloaded, without having to explicitly check for this condition.

If a minor or major condition has occurred, then a openserDialogLimitMinorEvent trap or a openserDialogLimitMajorEvent trap will be generated, respectively. The minor and major thresholds are described in the parameters section below.

2. The number of bytes waiting to be consumed across all of OpenSIPS's listening ports has passed a minor or major threshold. The idea is that a network operation centre can be made aware that a machine hosting a SIP server may be entering a degraded state, and to investigate why this is so.

If the number of bytes to be consumed passes a minor or major threshold, then a openserMsgQueueDepthMinorEvent or openserMsgQueueDepthMajorEvent trap will be sent out, respectively.

Full details of these traps can be found in the distributions OPENSER-MIB file.

## How It Works

### 1.2.1. How the SNMPStats module gets its data

The SNMPStats module uses OpenSIPSs internal statistic framework to collect most of its data. However, there are two exceptions.

1. The openserSIPRegUserTable and openserSIPContactTable rely on the usrloc modules callback system. Specifically, the SNMPStats module will receive callbacks whenever a user/contact is added to the system.

2. The SNMPStats modules openserSIPMsgQueueDepthMinorEvent and openserSIPMsgQueueDepthMajorEvent alarms rely on the OpenSIPS core to find out what interfaces, ports, and transports OpenSIPS is listening on. However,the module will actually query the proc file system to find out the number of bytes waiting to be consumed. (Currently, this will only work on systems providing the proc file system).

### 1.2.2. How data is moved from the SNMPStats module to a NOC

We have now explained how the SNMPStats module gathers its data. We still have not explained how it exports this data to a NOC (Network Operations Centre) or administrator.

The SNMPStats module expects to connect to a _Master Agent_. This would be a SNMP daemon running either on the same system as the OpenSIPS instance, or on another system. (Communication can take place over TCP, so there is no restriction that this daemon need be on the same system as OpenSIPS).

If the master agent is unavailable when OpenSIPS first starts up, the SNMPStats module will continue to run. However, you will not be able to query it. Thankfully, the SNMPStats module continually looks for its master agent. So even if the master agent is started late, or if the link to the SNMPStats module is severed due to a temporary hardware failure or crashed and restarted master agent, the link will eventually be re-established. No data should be lost, and querying can begin again.

To request for this data, you will need to query the master agent. The master agent will then redirect the request to the SNMPStats module, which will respond to the master agent, which will in turn respond to your request.

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

- `Net SNMP DEV (libsnmp-dev on debian)` — SNMP library (development files) must be installed at the time of compilation. Furthermore, there are several shared objects that must be loadable at the time SNMPStats is loaded.
- `SNMP tools(snmp on debian)` — SNMP tools package to provide the snmpget command (internally used by the SNMPStats module.

### Optional Modules

- `dialog`
- `usrloc`

## Exported Parameters

### `MsgQueueMajorThreshold` (integer)

The SNMPStats module monitors the number of bytes waiting to be consumed by OpenSIPS. If the number of bytes waiting to be consumed exceeds a major threshold, the SNMPStats module will send out an openserMsgQueueDepthMajorEvent trap to signal that an alarm condition has occurred. The major threshold is set with the MsgQueueMajorThreshold parameter.

**Notes:** If this parameter is not set, then there will be no major alarm monitoring.

**Example.** 5000.

```opensips
...
modparam("snmpstats", "MsgQueueMajorThreshold", 5000)
...
```
### `MsgQueueMinorThreshold` (integer)

The SNMPStats module monitors the number of bytes waiting to be consumed by OpenSIPS. If the number of bytes waiting to be consumed exceeds a minor threshold, the SNMPStats module will send out an openserMsgQueueDepthMinorEvent trap to signal that an alarm condition has occurred. The minor threshold is set with the MsgQueueMinorThreshold parameter.

**Notes:** If this parameter is not set, then there will be no minor alarm monitoring.

**Example.** 2000.

```opensips
...
modparam("snmpstats", "MsgQueueMinorThreshold", 2000)
...
```
### `dlg_major_threshold` (integer)

The SNMPStats module monitors the number of active dialogs. If the number of active dialogs exceeds a major threshold, the SNMPStats module will send out an openserDialogLimitMajorEvent trap to signal that an alarm condition has occurred. The major threshold is set with the dlg_major_threshold parameter.

**Notes:** If this parameter is not set, then there will be no major alarm monitoring.

**Example.** 750.

```opensips
...
  modparam("snmpstats", "dlg_major_threshold", 750)
...
```
### `dlg_minor_threshold` (integer)

The SNMPStats module monitors the number of active dialogs. If the number of active dialogs exceeds a minor threshold, the SNMPStats module will send out an openserDialogLimitMinorEvent trap to signal that an alarm condition has occurred. The minor threshold is set with the dlg_minor_threshold parameter.

**Notes:** If this parameter is not set, then there will be no minor alarm monitoring.

**Example.** 500.

```opensips
...
  modparam("snmpstats", "dlg_minor_threshold", 500)
...
```
### `sipEntityType` (string)

This parameter describes the entity type for this OpenSIPS instance, and will be used in determining what is returned for the openserSIPEntityType scalar. Valid parameters are: _registrarServer, redirectServer, proxyServer, userAgent, other_

**Possible values:**

- registrarServer
- redirectServer
- proxyServer
- userAgent
- other

**Notes:** Note that as the above example shows, you can define this parameter more than once. This is of course because a given OpenSIPS instance can take on more than one role.

**Example.** registrarServer.

```opensips
...
modparam("snmpstats", "sipEntityType", "registrarServer")
modparam("snmpstats", "sipEntityType", "proxyServer")
...
```
### `snmpCommunity` (string)

The SNMPStats module provides the openserSIPServiceStartTime scalar. This scalar requires the SNMPStats module to perform a snmpget query to the master agent. If you have defined a custom community string for the snmp daemon, you need to specify it with this parameter.

*Default value is public.*

**Example.** customCommunityString.

```opensips
...
modparam("snmpstats", "snmpCommunity", "customCommunityString")
...
```
### `snmpgetPath` (string)

The SNMPStats module provides the openserSIPServiceStartTime scalar. This scalar requires the SNMPStats module to perform a snmpget query to the master agent. You can use this parameter to set the path to your instance of SNMP's snmpget program.

*Default value is /usr/local/bin/.*

**Example.** /my/custom/path/.

```opensips
...
modparam("snmpstats", "snmpgetPath",     "/my/custom/path/")
...
```

## Exported Statistics

### `openserCurNumDialogs`

- **Type:** gauge
- **Access:** SNMP
### `openserCurNumDialogsInProgress`

- **Type:** gauge
- **Access:** SNMP
### `openserCurNumDialogsInSetup`

- **Type:** gauge
- **Access:** SNMP
### `openserDialogLimitAlarmStatus`

- **Type:** other
- **Access:** SNMP
### `openserDialogLimitMajorAlarm`

- **Type:** other
- **Access:** SNMP
### `openserDialogLimitMajorThreshold`

- **Type:** other
- **Access:** SNMP
### `openserDialogLimitMinorAlarm`

- **Type:** other
- **Access:** SNMP
### `openserDialogLimitMinorThreshold`

- **Type:** other
- **Access:** SNMP
### `openserDialogUsageState`

- **Type:** other
- **Access:** SNMP
### `openserMsgQueueDepth`

- **Type:** gauge
- **Access:** SNMP
### `openserMsgQueueDepthAlarmStatus`

- **Type:** other
- **Access:** SNMP
### `openserMsgQueueDepthMajorAlarm`

- **Type:** other
- **Access:** SNMP
### `openserMsgQueueDepthMinorAlarm`

- **Type:** other
- **Access:** SNMP
### `openserMsgQueueMajorThreshold`

- **Type:** other
- **Access:** SNMP
### `openserMsgQueueMinorThreshold`

- **Type:** other
- **Access:** SNMP
### `openserSIPCurrentTransactions`

- **Type:** gauge
- **Access:** SNMP
### `openserSIPEntityType`

- **Type:** other
- **Access:** SNMP
### `openserSIPNumProxyRequireFailures`

- **Type:** counter
- **Access:** SNMP
### `openserSIPNumUnsupportedMethods`

- **Type:** counter
- **Access:** SNMP
### `openserSIPNumUnsupportedUris`

- **Type:** counter
- **Access:** SNMP
### `openserSIPOtherwiseDiscardedMsgs`

- **Type:** counter
- **Access:** SNMP
### `openserSIPProtocolVersion`

- **Type:** other
- **Access:** SNMP
### `openserSIPProxyAuthMethod`

- **Type:** other
- **Access:** SNMP
### `openserSIPProxyRecordRoute`

- **Type:** other
- **Access:** SNMP
### `openserSIPProxyStatefulness`

- **Type:** other
- **Access:** SNMP
### `openserSIPRegAcceptedRegistrations`

- **Type:** counter
- **Access:** SNMP
### `openserSIPRegCurrentUsers`

- **Type:** gauge
- **Access:** SNMP
### `openserSIPRegDfltRegActiveInterval`

- **Type:** other
- **Access:** SNMP
### `openserSIPRegMaxContactExpiryDuration`

- **Type:** other
- **Access:** SNMP
### `openserSIPRegMaxUsers`

- **Type:** other
- **Access:** SNMP
### `openserSIPRegRejectedRegistrations`

- **Type:** counter
- **Access:** SNMP
### `openserSIPServiceStartTime`

- **Type:** other
- **Access:** SNMP
### `openserSIPSummaryInRequests`

- **Type:** counter
- **Access:** SNMP
### `openserSIPSummaryInResponses`

- **Type:** counter
- **Access:** SNMP
### `openserSIPSummaryOutRequest`

- **Type:** counter
- **Access:** SNMP
### `openserSIPSummaryOutResponses`

- **Type:** counter
- **Access:** SNMP
### `openserSIPSummaryTotalTransactions`

- **Type:** counter
- **Access:** SNMP
### `openserTotalNumFailedDialogSetups`

- **Type:** counter
- **Access:** SNMP

## Configuration Examples

### Setting the `sipEntityType` parameter

This parameter describes the entity type for this OpenSIPS instance, and will be used in determining what is returned for the openserSIPEntityType scalar. Valid parameters are: _registrarServer, redirectServer, proxyServer, userAgent, other_

```opensips
...
modparam("snmpstats", "sipEntityType", "registrarServer")
modparam("snmpstats", "sipEntityType", "proxyServer")
...
```

Note that as the above example shows, you can define this parameter more than once. This is of course because a given OpenSIPS instance can take on more than one role.
### Setting the `MsgQueueMinorThreshold` parameter

The SNMPStats module monitors the number of bytes waiting to be consumed by OpenSIPS. If the number of bytes waiting to be consumed exceeds a minor threshold, the SNMPStats module will send out an openserMsgQueueDepthMinorEvent trap to signal that an alarm condition has occurred. The minor threshold is set with the MsgQueueMinorThreshold parameter.

```opensips
...
modparam("snmpstats", "MsgQueueMinorThreshold", 2000)
...
```

If this parameter is not set, then there will be no minor alarm monitoring.
### Setting the `MsgQueueMajorThreshold` parameter

The SNMPStats module monitors the number of bytes waiting to be consumed by OpenSIPS. If the number of bytes waiting to be consumed exceeds a major threshold, the SNMPStats module will send out an openserMsgQueueDepthMajorEvent trap to signal that an alarm condition has occurred. The major threshold is set with the MsgQueueMajorThreshold parameter.

```opensips
...
modparam("snmpstats", "MsgQueueMajorThreshold", 5000)
...
```

If this parameter is not set, then there will be no major alarm monitoring.
### Setting the `dlg_minor_threshold` parameter

The SNMPStats module monitors the number of active dialogs. If the number of active dialogs exceeds a minor threshold, the SNMPStats module will send out an openserDialogLimitMinorEvent trap to signal that an alarm condition has occurred. The minor threshold is set with the dlg_minor_threshold parameter.

```opensips
...
  modparam("snmpstats", "dlg_minor_threshold", 500)
...
```

If this parameter is not set, then there will be no minor alarm monitoring.
### Setting the `dlg_major_threshold` parameter

The SNMPStats module monitors the number of active dialogs. If the number of active dialogs exceeds a major threshold, the SNMPStats module will send out an openserDialogLimitMajorEvent trap to signal that an alarm condition has occurred. The major threshold is set with the dlg_major_threshold parameter.

```opensips
...
  modparam("snmpstats", "dlg_major_threshold", 750)
...
```

If this parameter is not set, then there will be no major alarm monitoring.
### Setting the `snmpgetPath` parameter

The SNMPStats module provides the openserSIPServiceStartTime scalar. This scalar requires the SNMPStats module to perform a snmpget query to the master agent. You can use this parameter to set the path to your instance of SNMP's snmpget program. _Default value is “/usr/local/bin/”._

```opensips
...
modparam("snmpstats", "snmpgetPath",     "/my/custom/path/")
...
```
### Setting the `snmpCommunity` parameter

The SNMPStats module provides the openserSIPServiceStartTime scalar. This scalar requires the SNMPStats module to perform a snmpget query to the master agent. If you have defined a custom community string for the snmp daemon, you need to specify it with this parameter. _Default value is “public”._

```opensips
...
modparam("snmpstats", "snmpCommunity", "customCommunityString")
...
```
