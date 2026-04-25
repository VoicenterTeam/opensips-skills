## 1.8.�Exported MI Functions

### 1.8.1.�`dp_reload`

It will update the translation rules, loading the database info.

Name: _dp\_reload_

Parameters: _1_

*   _partition_ (optional) - Partition to be reloaded. If not specified, all partitions will be reloaded.
    

MI DATAGRAM Command Format:

		opensips-cli -x mi dp\_reload
		

### 1.8.2.�`dp_translate`

It will apply a translation rule identified by a dialplan id on an input string.

Name: _dp\_translate_

Parameters: _3_

*   _dpid_ - the dpid of the rule set used for match the input string
    
*   _input_ - the input string
    
*   _partition_ - (optional) the name of the partition when the dpid is located
    

MI DATAGRAM Command Format:

        opensips-cli -x mi dp\_translate 10 +40123456789
		

### 1.8.3.�`dp_show_partiton`

Display partition(s) details.

Name: _dp\_show\_partiton_

Parameters: _2_

*   _partition_ (optional) - The partition name. If no partition is specified, all known partitions will be listed.
    

MI DATAGRAM Command Format:

        opensips-cli -x mi dp\_translate default