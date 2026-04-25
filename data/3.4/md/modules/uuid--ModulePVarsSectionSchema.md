## 1.4.�Exported Pseudo-Variables

### 1.4.1.�`$uuid`

The _$uuid_ variable returns a newly generated version 4 UUID based on high-quality randomness from /dev/urandom, if available. Otherwise, a version 1 UUID (based on current time and the local ethernet MAC address) will be generated.

**Example�1.1.�$uuid usage**

xlog("generated uuid: $uuid\\n");