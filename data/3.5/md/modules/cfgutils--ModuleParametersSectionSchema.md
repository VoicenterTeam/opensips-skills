## 1.3.�Exported Parameters

### 1.3.1.�`initial_probability` (string)

The initial value of the probability.

Default value is “10”.

**Example�1.1.�`initial_probability` parameter usage**

   
modparam("cfgutils", "initial\_probability", 15)
   

  

### 1.3.2.�`hash_file` (string)

The config file name for that a hash value should be calculated on startup.

There is no default value, is no parameter is given the hash functionality is disabled.

**Example�1.2.�`hash_file` parameter usage**

   
modparam("cfgutils", "hash\_file", "/etc/opensips/opensips.cfg")
   

  

### 1.3.3.�`shv_hash_size` (integer)

The size of the hash table used to store the shared variables ($shv).

Default value is “64”.

**Example�1.3.�`shv_hash_size` parameter usage**

modparam("cfgutils", "shv\_hash\_size", 1024)

  

### 1.3.4.�`shvset` (string)

Set the value of a shared variable ($shv(name)). The parameter can be set many times.

The value of the parameter has the format: \_name\_ '=' \_type\_ ':' \_value\_

*   \_name\_: shared variable name
    
*   \_type\_: type of the value
    
    *   “i”: integer value
        
    *   “s”: string value
        
    
*   \_value\_: value to be set
    

Default value is “NULL”.

**Example�1.4.�`shvset` parameter usage**

...
modparam("cfgutils", "shvset", "debug=i:1")
modparam("cfgutils", "shvset", "pstngw=s:sip:10.10.10.10")
...

  

### 1.3.5.�`varset` (string)

Set the value of a script variable ($var(name)). The parameter can be set many times.

The value of the parameter has the format: \_name\_ '=' \_type\_ ':' \_value\_

*   \_name\_: shared variable name
    
*   \_type\_: type of the value
    
    *   “i”: integer value
        
    *   “s”: string value
        
    
*   \_value\_: value to be set
    

Default value is “NULL”.

**Example�1.5.�`varset` parameter usage**

...
modparam("cfgutils", "varset", "init=i:1")
modparam("cfgutils", "varset", "gw=s:sip:11.11.11.11;transport=tcp")
...

  

### 1.3.6.�`lock_pool_size` (integer)

The number of dynamic script locks to be allocated at OpenSIPS startup. This number must be a power of 2. (i.e. 1, 2, 4, 8, 16, 32, 64 ...)

Note that the _lock\_pool\_size_ parameter only affects the number of dynamic locks created at startup. The pool of static locks only depends on the number of unique static strings supplied throughout the script to the set of static lock functions.

Default value is “32”.

**Example�1.6.�Setting lock\_pool\_size module parameter**

modparam("cfgutils", "lock\_pool\_size", 64)