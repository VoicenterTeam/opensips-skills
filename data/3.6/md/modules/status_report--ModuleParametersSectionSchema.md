## 1.3.�Exported Parameters

### 1.3.1.�`script_sr_group` (string)

Name of a new Status/Report group to be created and later used from script level.

This parameter may be defined multiple times, in order to define multiple groups.

**Example�1.1.�script\_sr\_group example**

modparam("status\_report", "script\_sr\_group", "security")
modparam("status\_report", "script\_sr\_group", "alarms")