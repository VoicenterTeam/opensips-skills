## 1.6.�Exported MI Functions

### 1.6.1.� `cache_remove_chunk`

Removes all local cache entries that match the provided glob param.

Parameters :

*   _glob_ - keys that match glob will be removed
    
*   _collection(optional)_ - collection from which the keys shall be removed; if no collection set, the default collection will be used;
    

MI FIFO Command Format:

opensips-cli -x mi cache\_remove\_chunk "keyprefix\*" collection