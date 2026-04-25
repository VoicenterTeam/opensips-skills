## 1.5.�Exported MI Functions

### 1.5.1.� `trie_reload`

Command to reload trie rules from database.

*   if `use_partition` is set to 0 - all routing rules will be reloaded.
    
*   if `use_partition` is set to 1, the parameters are:
    
    *   _partition\_name_ (optional) - if not provided all the partitions will be reloaded, otherwise just the partition given as parameter will be reloaded.
        
    

MI FIFO Command Format:

		opensips-cli -x mi trie\_reload part\_1
		

### 1.5.2.�`trie_reload_status`

Gets the time of the last reload for any partition.

*   if `use_partition` is set to 0 - the function doesn't receive any parameter. It will list the date of the last reload for the default (and only) partition.
    
*   if `use_partition` is set to 1, the parameters are:
    
    *   _partition\_name_ (optional) - if not provided the function will list the time of the last update for every partition. Otherwise, the function will list the time of the last reload for the given partition.
        
    

**Example�1.8.�`trie_reload_status` usage when `use_partitions` is 0**

$ opensips-cli -x mi trie\_reload\_status
Date:: Tue Aug 12 12:26:00 2014

  

### 1.5.3.�`trie_search`

Tries to match a number in the existing tries loaded from the database.

*   if `use_partition` is set to 1 the function will have 2 parameters:
    
    *   _partition\_name_
        
    *   _number_ - the number to test against
        
    
*   if `use_partition` is set to 0 the function will have 1 parameter:
    
    *   _number_ - the number to test against
        
    

MI FIFO Command Format:

		opensips-cli -x mi trie\_search partition\_name=part1 number=012340987
		

### 1.5.4.� `trie_number_delete`

Deletes individual entries in the trie, without reloading all of the data

*   if `use_partition` is set to 1 the function will have 2 parameters:
    
    *   _partition\_name_
        
    *   _number_ - the array of numbers to delete
        
    

MI FIFO Command Format:

		opensips-cli -x mi trie\_number\_delete partition\_name=part1 number=\["012340987","4858345"\]
		

### 1.5.5.� `trie_number_upsert`

Upserts ( insert if not found, update is found ) an array of numbers in the trie, without reloading all of the data

*   if `use_partition` is set to 1 the function will have 3 parameters:
    
    *   _partition\_name_
        
    *   _number_ - the array of numbers to update
        
    *   _attrs_ - the array of new attributes for the numbers
        
    

MI FIFO Command Format:

		opensips-cli -x mi trie\_number\_upsert partition\_name=part1 number=\["012340987"\] attrs=\["my\_attrs"\]