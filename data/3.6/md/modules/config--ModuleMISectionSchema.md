## 1.5.�MI Commands

### 1.5.1.�**config\_reload**

Reloads all configuration variables from the database.

MI FIFO Command Format:

		## reload configuration cache from the database
		opensips-mi config\_reload
		opensips-cli -x mi config\_reload
		

### 1.5.2.�**config\_list**

Lists all config variables currently loaded in cache, printing temporary values as well. If the optional _description_ parameter is provided and different than _0_, it returns an array containing the description of the values as well.

MI FIFO Command Format:

		## list all configuration cache
		opensips-mi config\_list
		opensips-cli -x mi config\_list 1
		

### 1.5.3.�**config\_push**

Temporarily pushes a single configuration variable.

Expected parameters are:

*   _name_ – (string) the name of the variable
    
*   _value_ – (string) the value of the variable
    
*   _description_ – (string, optional) the description of the variable; if missing the description is inheritted, or a null value is used if the variable is new.
    

MI FIFO Command Format:

		## push temporarily debug\_mode configuration value
		opensips-mi config\_push debug\_mode 1 "Enable Debug mode"
		opensips-cli -x mi config\_list 1
		

### 1.5.4.�**config\_push\_bulk**

Pushes multiple temporarily configuration variables in memory.

Expected parameters are:

*   _configs_ – (json) a JSON array containing a set of variables to be pushed. Each variable should be described as a JSON object with the following keys:
    
    *   _name_ – (string) the name of the variable to be changed.
        
    *   _value_ – (string or null) the new value of the variable.
        
    *   _description_ – (string, optional) the description of the variable.
        
    

MI FIFO Command Format:

		## push bulk temporarily values to the config cache
		opensips-mi config\_push\_bulk -j '\[\[{"name":"debug\_mode","value":"1"},{"name":"debug\_level","value":"5"}\]\]'
		

The command returns the number of values successfully pushed.

### 1.5.5.�**config\_flush**

Flushes the variables from the memory to the database.

Expected parameters are:

*   _name_ – (string, optional) if present, flushes only a specific config variable in database, otherwise the entire cache.
    

MI FIFO Command Format:

		## Flush config variables to the database
		opensips-mi config\_flush
		opensips-cli -x mi config\_flush debug\_mode
		

The command returns the number of values successfully flushed.