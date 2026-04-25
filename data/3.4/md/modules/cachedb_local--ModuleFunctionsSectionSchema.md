## 1.5.�Exported Functions

### 1.5.1.� `cache_remove_chunk([collection,] glob)`

Remove all keys from local cache that match the _glob_ pattern corresponding to a certain _collection_ or the 'default' collection if none defined. Keep in mind that collection name is different than group name, which identifies the engine in cachedb operations.

Parameters:

*   _collection_ (string, optional)
    
*   _glob_ (string)
    

This function can be used from all routes

**Example�1.7.�`cache_remove_chunk` usage**

	...
	cache\_remove\_chunk("myinfo\_\*");
	cache\_remove\_chunk("collection1", "myinfo\_\*");
	...