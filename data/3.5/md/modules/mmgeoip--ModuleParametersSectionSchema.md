## 1.3.�Exported Parameters

### 1.3.1.�`mmgeoip_city_db_path` (string)

Path to either a GeoLite or GeoIP City database file.

_Mandatory parameter._

**Example�1.1.�Set “mmgeoip\_city\_db\_path” parameter**

...
modparam("mmgeoip", "mmgeoip\_city\_db\_path",
  "/usr/share/GeoIP/GeoLiteCity.dat")
...
		

  

### 1.3.2.�`cache_type` (string)

Databse memory caching options. The following options are available:

*   _STANDARD_ - Read database from file system; least memory used;
    
*   _MMAP\_CACHE_ - Load database into mmap allocated memory;
    
    _WARNING: this option will cause a segmentation fault if database file is changed at runtime!_
    
*   _MEM\_CACHE\_CHECK_ - Load database into memory; this mode checks for database updates; if database was modified, the file will be reloaded after 60 seconds; it will be slower than _MMAP\_CACHE_ but it will allow reloads;
    

Default value for this parameter is _MMAP\_CACHE_.

NOTE: If libmaxminddb is used, this parameter will be ignored as the library only supports loading the database into mmap allocated memory.

**Example�1.2.�Set “cache\_type” parameter**

...
modparam("mmgeoip", "cache\_type","MEM\_CACHE\_CHECK")
...