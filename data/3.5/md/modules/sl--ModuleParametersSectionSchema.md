## 1.3.�Exported Parameters

### 1.3.1.�`enable_stats` (integer)

If the module should generate and export statistics to the core manager. A zero value means disabled.

SL module provides statistics about how many replies were sent ( splitted per code classes) and how many local ACKs were filtered out.

Default value is 1 (enabled).

**Example�1.1.�enable\_stats example**

modparam("sl", "enable\_stats", 0)