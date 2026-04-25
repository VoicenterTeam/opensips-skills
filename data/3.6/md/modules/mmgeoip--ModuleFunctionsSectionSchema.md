## 1.4.�Exported Functions

### 1.4.1.� `mmg_lookup([fields,]src,dst)`

Looks up information specified by `field` associated with the IP address `src`. The resulting data is loaded in _reverse_ order into the `dst` AVP.

Parameters:

*   _fields_ (string, optional) - a list of elements delimited by one of these separators: ':', '|', ',', '/' or ' '(space). Accepts the following tokens:
    
    *   _lat_ - Latitude
        
    *   _lon_ - Longitude
        
    *   _cont_ - Continent
        
    *   _cc_ - Country Code
        
    *   _reg_ - Region
        
    *   _city_ - City
        
    *   _pc_ - Postal Code
        
    *   _dma_ - DMA Code
        
    *   _ac_ - Area Code, only available in the legacy GeoIP database
        
    *   _tz_ - Time Zone
        
    
*   _src_ (string) - IP address
    
*   _dst_ (var) - AVP to return the information associated with the IP in.
    

When using the GeoIP2 library, each token from the list given in the `fields` parameter can be provided as a path to a specific key in the data structure associated with an IP. Thus, the token format is '_key\_name_._key\_name_\[_.key\_name_\]\*'. If a key's value is an array, instead of a subkey name, an index should be provided in order to select the appropriate value.

Example tokens: '_country.names.en_', '_continent.names.en_ ', '_subdivisions.0.iso\_code_'. For more details about the available fields in the database and the key names that should be used to retrieve them, check the [_MaxMind GeoIP2 documentation_](https://dev.maxmind.com/geoip/geoip2/).

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, ONREPLY\_ROUTE, BRANCH\_ROUTE,ERROR\_ROUTE, and LOCAL\_ROUTE.

**Example�1.3.�`mmg_lookup` usage**

...
if(mmg\_lookup("lon:lat",$si,$avp(lat\_lon))) {
  xlog("L\_INFO","Source IP latitude:$(avp(lat\_lon)\[0\])\\n");
  xlog("L\_INFO","Source IP longitude:$(avp(lat\_lon)\[1\])\\n");
};
...
# fields format only supported for GeoIP2
if(mmg\_lookup("continent.names.en:country.iso\_code,",$si,$avp(geodata))) {
  xlog("L\_INFO","Source IP country code:$(avp(geodata)\[0\])\\n");
  xlog("L\_INFO","Source IP continent:$(avp(geodata)\[1\])\\n");
};
...