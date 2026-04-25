## 1.5.�Exported MI Functions

All commands understand the "-?" parameter to print a short help message. The options have to be quoted as one string to be passed to MI interface. Each option except host and new host can be wildcarded by \* (but only \* and not things like "-d prox\*").

### 1.5.1.�`cr_reload_routes`

This command reloads the routing data from the data source.

Important: When new domains have been added, a restart of the server must be done, because the mapping of the ids used in the config script cannot be updated at runtime at the moment. So a reload could result in a wrong routing behaviour, because the ids used in the script could differ from the one used internally from the server. Modifying of already existing domains is no problem.

### 1.5.2.�`cr_dump_routes`

This command prints the route rules on the command line.

### 1.5.3.�`cr_replace_host`

This command can replace the rewrite\_host of a route rule, it is only usable in file mode. Following options are possible:

*   _\-d_ - the domain containing the host
    
*   _\-p_ - the prefix containing the host
    
*   _\-h_ - the host to be replaced
    
*   _\-t_ - the new host
    

Use the "null" prefix to specify an empty prefix.

**Example�1.38.�`cr_replace_host` usage**

...
opensips-cli -x mi cr\_replace\_host "-d proxy -p 49 -h proxy1 -t proxy2"
...
		

  

### 1.5.4.�`cr_deactivate_host`

This command deactivates the specified host, i.e. it sets its status to 0. It is only usable in file mode. Following options are possible:

*   _\-d_ - the domain containing the host
    
*   _\-p_ - the prefix containing the host
    
*   _\-h_ - the host to be deactivated
    
*   _\-t_ - the new host used as backup
    

When -t (new\_host) is specified, the portion of traffic for the deactivated host is routed to the host given by -t. This is indicated in the output of dump\_routes. The backup route is deactivated if the host is activated again.

Use the "null" prefix to specify an empty prefix.

**Example�1.39.�`cr_deactivate_host` usage**

...
opensips-cli -x mi cr\_deactivate\_host "-d proxy -p 49 -h proxy1"
...
		

  

### 1.5.5.�`cr_activate_host`

This command activates the specified host, i.e. it sets its status to 1. It is only usable in file mode. Following options are possible:

*   _\-d_ - the domain containing the host
    
*   _\-p_ - the prefix containing the host
    
*   _\-h_ - the host to be activated
    

Use the "null" prefix to specify an empty prefix.

**Example�1.40.�`cr_activate_host` usage**

...
opensips-cli -x mi cr\_activate\_host "-d proxy -p 49 -h proxy1"
...
		

  

### 1.5.6.�`cr_add_host`

This command adds a route rule, it is only usable in file mode. Following options are possible:

*   _\-d_ - the domain containing the host
    
*   _\-p_ - the prefix containing the host
    
*   _\-h_ - the host to be added
    
*   _\-w_ - the weight of the rule
    
*   _\-P_ - an optional rewrite prefix
    
*   _\-S_ - an optional rewrite suffix
    
*   _\-i_ - an optional hash index
    
*   _\-s_ - an optional strip value
    

Use the "null" prefix to specify an empty prefix.

**Example�1.41.�`cr_add_host` usage**

...
opensips-cli -x mi cr\_add\_host "-d proxy -p 49 -h proxy1 -w 0.25"
...
		

  

### 1.5.7.�`cr_delete_host`

This command delete the specified hosts or rules, i.e. remove them from the route tree. It is only usable in file mode. Following options are possible:

*   _\-d_ - the domain containing the host
    
*   _\-p_ - the prefix containing the host
    
*   _\-h_ - the host to be added
    
*   _\-w_ - the weight of the rule
    
*   _\-P_ - an optional rewrite prefix
    
*   _\-S_ - an optional rewrite suffix
    
*   _\-i_ - an optional hash index
    
*   _\-s_ - an optional strip value
    

Use the "null" prefix to specify an empty prefix.

**Example�1.42.�`cr_delete_host` usage**

...
opensips-cli -x mi cr\_delete\_host "-d proxy -p 49 -h proxy1 -w 0.25"
...