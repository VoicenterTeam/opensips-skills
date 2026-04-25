## 1.6.�Exported Parameters

### 1.6.1.�`mc_level` (int)

This parameter ranges from 1 to 9 and it specifies the level of compression you want to do. Default is 6. 9 is the best, but the longest time consuming algorithm and 1 is the worst. If, by mistake, you set a lower or a higher level, the default, 6, will be used, but you will receive a warning.

**Example�1.1.� Set `mc_level` parameter**

...
modparam("mc", "mc\_level", "3")
...