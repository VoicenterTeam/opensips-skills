## 1.4.�Exported Parameters

### 1.4.1.�`sipEntityType` (String)

This parameter describes the entity type for this OpenSIPS instance, and will be used in determining what is returned for the openserSIPEntityType scalar. Valid parameters are:

_registrarServer, redirectServer, proxyServer, userAgent, other_

**Example�1.1.�Setting the `sipEntityType` parameter**

...
modparam("snmpstats", "sipEntityType", "registrarServer")
modparam("snmpstats", "sipEntityType", "proxyServer")
...
		

  

Note that as the above example shows, you can define this parameter more than once. This is of course because a given OpenSIPS instance can take on more than one role.

### 1.4.2.�`MsgQueueMinorThreshold` (Integer)

The SNMPStats module monitors the number of bytes waiting to be consumed by OpenSIPS. If the number of bytes waiting to be consumed exceeds a minor threshold, the SNMPStats module will send out an openserMsgQueueDepthMinorEvent trap to signal that an alarm condition has occurred. The minor threshold is set with the MsgQueueMinorThreshold parameter.

**Example�1.2.�Setting the `MsgQueueMinorThreshold` parameter**

...
modparam("snmpstats", "MsgQueueMinorThreshold", 2000)
...
		

  

If this parameter is not set, then there will be no minor alarm monitoring.

### 1.4.3.�`MsgQueueMajorThreshold` (Integer)

The SNMPStats module monitors the number of bytes waiting to be consumed by OpenSIPS. If the number of bytes waiting to be consumed exceeds a major threshold, the SNMPStats module will send out an openserMsgQueueDepthMajorEvent trap to signal that an alarm condition has occurred. The major threshold is set with the MsgQueueMajorThreshold parameter.

**Example�1.3.�Setting the `MsgQueueMajorThreshold` parameter**

...
modparam("snmpstats", "MsgQueueMajorThreshold", 5000)
...
		

  

If this parameter is not set, then there will be no major alarm monitoring.

### 1.4.4.�`dlg_minor_threshold` (Integer)

The SNMPStats module monitors the number of active dialogs. If the number of active dialogs exceeds a minor threshold, the SNMPStats module will send out an openserDialogLimitMinorEvent trap to signal that an alarm condition has occurred. The minor threshold is set with the dlg\_minor\_threshold parameter.

**Example�1.4.�Setting the `dlg_minor_threshold` parameter**

...
  modparam("snmpstats", "dlg\_minor\_threshold", 500)
...
		

  

If this parameter is not set, then there will be no minor alarm monitoring.

### 1.4.5.�`dlg_major_threshold` (Integer)

The SNMPStats module monitors the number of active dialogs. If the number of active dialogs exceeds a major threshold, the SNMPStats module will send out an openserDialogLimitMajorEvent trap to signal that an alarm condition has occurred. The major threshold is set with the dlg\_major\_threshold parameter.

**Example�1.5.�Setting the `dlg_major_threshold` parameter**

...
  modparam("snmpstats", "dlg\_major\_threshold", 750)
...
		

  

If this parameter is not set, then there will be no major alarm monitoring.

### 1.4.6.�`snmpgetPath` (String)

The SNMPStats module provides the openserSIPServiceStartTime scalar. This scalar requires the SNMPStats module to perform a snmpget query to the master agent. You can use this parameter to set the path to your instance of SNMP's snmpget program.

_Default value is “/usr/local/bin/”._

**Example�1.6.�Setting the `snmpgetPath` parameter**

...
modparam("snmpstats", "snmpgetPath",     "/my/custom/path/")
...
		

  

### 1.4.7.�`snmpCommunity` (String)

The SNMPStats module provides the openserSIPServiceStartTime scalar. This scalar requires the SNMPStats module to perform a snmpget query to the master agent. If you have defined a custom community string for the snmp daemon, you need to specify it with this parameter.

_Default value is “public”._

**Example�1.7.�Setting the `snmpCommunity` parameter**

...
modparam("snmpstats", "snmpCommunity", "customCommunityString")
...