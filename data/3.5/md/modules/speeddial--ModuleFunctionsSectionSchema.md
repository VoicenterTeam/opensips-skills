## 1.4.�Exported Functions

### 1.4.1.� `sd_lookup(table [, owner])`

The function lookups the short dial number from R-URI in 'table' and replaces the R-URI with associated address.

Meaning of the parameters is as follows:

*   _table_ (string) - The name of the table storing the speed dial records.
    
*   _owner_ (string) - The SIP URI of the owner of short dialing codes. If not pressent, URI of From header is used.
    

This function can be used from REQUEST\_ROUTE.

**Example�1.9.�`sd_lookup` usage**

...
# 'speed\_dial' is the default table name created by opensips db script
if($ru=~"sip:\[0-9\]{2}@.\*")
	sd\_lookup("speed\_dial");
# use auth username
if($ru=~"sip:\[0-9\]{2}@.\*")
	sd\_lookup("speed\_dial", "sip:$au@$fd");
...