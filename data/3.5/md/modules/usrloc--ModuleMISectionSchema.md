## 1.7.�Exported MI Functions

### 1.7.1.� `ul_rm`

Deletes an entire AOR record (including its contacts).

Parameters:

*   _table\_name_ - table where the AOR is removed from (Ex: location).
    
*   _aor_ - user AOR in username\[@domain\] format (domain must be supplied only if use\_domain option is on).
    

### 1.7.2.� `ul_rm_contact`

Deletes a contact from an AOR record.

Parameters:

*   _table name_ - table where the AOR is removed from (Ex: location).
    
*   _AOR_ - user AOR in username\[@domain\] format (domain must be supplied only if use\_domain option is on).
    
*   _contact_ - exact contact to be removed
    

### 1.7.3.� `ul_dump`

Dumps the entire content of the USRLOC in memory cache

Parameters:

*   _brief_ - (optional, may not be present); if equals to string “brief”, a brief dump will be done (only AOR and contacts, with no other details)
    

### 1.7.4.� `ul_flush`

Force a flush of all pending usrloc cache changes to the database. Normally, this routine runs every [timer\_interval](#param_timer_interval "1.5.22.�timer_interval (integer)") seconds.

### 1.7.5.� `ul_add`

Adds a new contact for an user AOR.

Parameters:

*   _table name (string)_ - table where the contact will be added (Ex: "location").
    
*   _aor (string)_ \- user AOR in username\[@domain\] format (domain must be supplied only if use\_domain option is on).
    
*   _contact (string)_ - Contact URI to be added
    
*   _expires (int)_ - expires value of the contact
    
*   _q (string)_ - Q value of the contact
    
*   _flags (int)_ - internal USRLOC flags of the contact
    
*   _cflags (int)_ - per branch flags of the contact
    
*   _methods (int)_ - bitmask with supported requests of the contact. To whitelist all SIP methods, simply use the value **32767**. For a breakdown of each method's value, see the "request\_method" internal enum.
    

### 1.7.6.� `ul_show_contact`

Dumps the contacts of an user AOR.

Parameters:

*   _table\_name_ - table where the AOR resides (Ex: location).
    
*   _aor_ - user AOR in username\[@domain\] format (domain must be supplied only if use\_domain option is on).
    

### 1.7.7.� `ul_sync`

Empty the location table, then synchronize it with all contacts from memory. Note that this can not be used when no database is specified or with the DB-Only scheme.

Important: make sure that all your contacts are in memory (_ul\_dump_ MI function) before executing this command.

Parameters:

*   _table name_ - table where the AOR resides (Ex: location).
    
*   _AOR (optional)_ - only delete/sync this user AOR, not the whole table. Format: "username\[@domain\]" (_domain_ is required only if [use\_domain](#param_use_domain "1.5.20.�use_domain (integer)") option is on).
    

### 1.7.8.� `ul_cluster_sync`

This command will only take effect if the target OpenSIPS instance is paired with a hot backup instance, while running under a cluster-enabled [working\_mode\_preset](#param_working_mode_preset "1.5.26.�working_mode_preset (string)").

The current node will locate a healthy donor node within the [location\_cluster](#param_location_cluster "1.5.32.�location_cluster (integer)") and issue a sync request to it. The donor node will then proceed to push all of its user location data over to the current node, via the binary interface. The received data will be merged with existing data. Conflicting contacts (matched according to [matching\_mode](#param_matching_mode "1.5.30.�matching_mode (integer)")) are overwritten only if the sync data is newer than the current data.