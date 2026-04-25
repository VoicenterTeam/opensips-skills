## 1.6.�Exported Functions

### 1.6.1.� `ul_add_key(domain, aor, key_name, [key_value])`

Append a Key/Value to the Key-Value-Store of a Usrloc-Record.

Returns false, if no record is found is usrloc.

Meaning of the parameters is as follows:

*   _domain (string)_ - Domain of the AOR, e.g. "location"
    
*   _aor (string)_ - Address-of-Record, save the key for a specific (registered) user.
    
*   _key (string)_ - The name of the key to be stored.
    
*   _value (string, optional)_ - The value to be stored. Not providing the value or by providing an empty value, will delete the entry.
    

This function can be used in ANY route.

**Example�1.42.�`ul_add_key` usage**

...
ul\_add\_key("location", "$tU@$td", "service\_route", "$hdr(Service-Route)");
...

  

### 1.6.2.� `ul_get_key(domain, aor, key_name, destination)`

Retrieve a Key/Value from the Key-Value-Store of a Usrloc-Record.

Returns false, if no record is found is usrloc or no according key is found.

Meaning of the parameters is as follows:

*   _domain (string)_ - Domain of the AOR, e.g. "location"
    
*   _aor (string)_ - Address-of-Record, save the key for a specific (registered) user.
    
*   _key (string)_ - The name of the key to be retrieved.
    
*   _destination (variable)_ - A variable, where to store the retrieved key.
    

This function can be used in ANY route.

**Example�1.43.�`ul_get_key` usage**

...
if (ul\_get\_key("location", "$tU@$td", "service\_route", $avp(service\_route))) {
        append\_to\_reply("Service-Route: $avp(service\_route)\\r\\n");
}
...

  

### 1.6.3.� `ul_del_key(domain, aor, key_name)`

Deletes a Key/Value from the Key-Value-Store of a Usrloc-Record.

Returns false, if no record is found is usrloc.

Meaning of the parameters is as follows:

*   _domain (string)_ - Domain of the AOR, e.g. "location"
    
*   _aor (string)_ - Address-of-Record, save the key for a specific (registered) user.
    
*   _key (string)_ - The name of the key to be deleted.
    

This function can be used in ANY route.

**Example�1.44.�`ul_del_key` usage**

...
ul\_del\_key("location", "$tU@$td", "service\_route");
...