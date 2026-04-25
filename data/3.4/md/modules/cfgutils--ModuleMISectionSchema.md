## 1.6.�Exported MI Functions

### 1.6.1.�`rand_set_prop`

Set the probability value to the given parameter.

Parameters:

*   _prob\_proc_ - the parameter should be a percent value (number from 0 to 99).
    

**Example�1.28.�`rand_set_prob` usage**

...
$ opensips-cli -x mi rand\_set\_prob 10
...

  

### 1.6.2.�`rand_reset_prob`

Reset the probability value to the inital start value.

This command don't need a parameter.

**Example�1.29.� `rand_reset_prob` usage**

...
$ opensips-cli -x mi rand\_reset\_prob
...

  

### 1.6.3.�`rand_get_prob`

Return the actual probability setting.

The function return the actual probability value.

**Example�1.30.�`rand_get_prob` usage**

...
$ opensips-cli -x mi get\_prob
The actual probability is 50 percent.
...

  

### 1.6.4.�`check_config_hash`

Check if the actual config file hash is identical to the stored one.

The function returns 200 OK if the hash values are identical, 400 if there are not identical, 404 if no file for hashing has been configured and 500 on errors. Additional a short text message is printed.

**Example�1.31.�`check_config_hash` usage**

...
$ opensips-cli -x mi check\_config\_hash
The actual config file hash is identical to the stored one.
...

  

### 1.6.5.�`get_config_hash`

Return the stored config file hash.

The function returns 200 OK and the hash value on success or 404 if no file for hashing has been configured.

**Example�1.32.�`get_config_hash` usage**

...
$ opensips-cli -x mi get\_config\_hash
1580a37104eb4de69ab9f31ce8d6e3e0
...

  

### 1.6.6.�`shv_set`

Set the value of a shared variable ($shv(name)).

Parameters:

*   _name_ : shared variable name
    
*   _type_ : type of the value
    
    *   “int”: integer value
        
    *   “str”: string value
        
    
*   _value_ : value to be set
    

**Example�1.33.�`shv_set` usage**

...
$ opensips-cli -x mi shv\_set debug int 0
...

  

### 1.6.7.�`shv_get`

Get the value of a shared variable ($shv(name)).

Parameters:

*   _name_ : shared variable name. If this parameter is missing, all shared variables are returned.
    

**Example�1.34.�`shv_get` usage**

...
$ opensips-cli -x mi shv\_get debug
$ opensips-cli -x mi shv\_get
...