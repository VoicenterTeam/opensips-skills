## 1.5.�Exported MI Functions

### 1.5.1.� `reload_blacklist`

Reload the internal global blacklist cache. This is necessary after the database tables for the global blacklist have been changed.

**Example�1.6.�`reload_blacklists` usage**

...
opensips-cli -x mi reload\_blacklist
...