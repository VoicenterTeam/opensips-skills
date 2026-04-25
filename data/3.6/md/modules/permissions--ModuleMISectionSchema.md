## 1.5.�Exported MI Functions

### 1.5.1.� `address_reload`

Causes permissions module to re-read the contents of the address database table into cache memory. In cache memory the entries are for performance reasons stored in two different tables: address table and subnet table depending on the value of the mask field (32 or smaller).

Parameters:

*   _partition_ - the name of the partition to be reloaded. If none specified all the partitions shall be reloaded.
    

### 1.5.2.� `address_dump`

Causes permissions module to dump contents of the address table from cache memory.

Parameters:

*   _partition_ - the name of the partition to be dumped. If none specified all the partitions shall be dumped.
    

### 1.5.3.� `subnet_dump`

Causes permissions module to dump contents of cache memory subnet table.

Parameters:

*   _partition_ - the name of the partition to be dumped. If none specified all the partitions shall be dumped.
    

### 1.5.4.� `allow_uri`

Tests if (URI, Contact) pair is allowed according to allow/deny files. The files must already have been loaded by OpenSIPS.

Parameters:

*   _basename_ - Basename from which allow and deny filenames will be created by appending contents of allow\_suffix and deny\_suffix parameters.
    
*   _URI_ - URI to be tested
    
*   _Contact_ - Contact to be tested