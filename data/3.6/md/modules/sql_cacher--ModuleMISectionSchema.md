## 1.5.�Exported MI Functions

### 1.5.1.�`sql_cacher_reload`

Reloads the entire SQL table in cache or the single key (if key provided) in _full caching_ mode.

Reloads the given key or invalidates all the keys in cache in _on demand_ mode.

Parameters:

*   _id_ - the caching entry's id
    
*   _key_ (optional) - the specific key to be reloaded.
    

**Example�1.10.�`sql_cacher_reload` usage**

...
$ opensips-cli -x mi sql\_cacher\_reload subs\_caching
...
$ opensips-cli -x mi sql\_cacher\_reload subs\_caching alice@domain.com
...