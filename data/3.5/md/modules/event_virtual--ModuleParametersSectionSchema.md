## 1.5.�Exported Parameters

### 1.5.1.�`failover_timeout` (integer)

The minimum duration in seconds that a failed subscriber is skipped for further notifications. This parameter only affects the _FAILOVER_ policy.

_Default value is “30”._

**Example�1.1.�Setting the `failover_timeout` parameter**

...
modparam("event\_virtual", "failover\_timeout", 5)
...