# mmgeoip Module Reference
<!-- generated-from: data/3.4/modules/mmgeoip.json
     generator-version: 0.1.0
     opensips-version: 3.4
     doc-type: module -->

Reference for the OpenSIPs 3.4 mmgeoip module. Read this file when configuring or debugging the mmgeoip module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Configuration Examples](#configuration-examples)

## Overview

This module is a lightweight wrapper for the MaxMind GeoIP API. It adds IP address-to-location lookup capability to OpenSIPS scripts.

Lookups are executed against the freely-available GeoLite City database; and the non-free GeoIP City database is drop-in compatible. All lookup fields provided by the API are accessible by the script. Visit the [_MaxMind website_](https://dev.maxmind.com/geoip/) for more information on the location databases.

The module is compatible with both legacy GeoIP and the newer GeoIP2 APIs and databases.

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

- `libGeoIP` — for the legacy GeoIP API and database
- `libmaxminddb` — for the GeoIP2 API and database

## Exported Parameters

### `cache_type` (string)

Databse memory caching options. The following options are available:

*   _STANDARD_ - Read database from file system; least memory used;
    
*   _MMAP_CACHE_ - Load database into mmap allocated memory;
    
    _WARNING: this option will cause a segmentation fault if database file is changed at runtime!_
    
*   _MEM_CACHE_CHECK_ - Load database into memory; this mode checks for database updates; if database was modified, the file will be reloaded after 60 seconds; it will be slower than _MMAP_CACHE_ but it will allow reloads;

*Default value is MMAP_CACHE.*

**Possible values:**

- STANDARD
- MMAP_CACHE
- MEM_CACHE_CHECK

**Notes:** NOTE: If libmaxminddb is used, this parameter will be ignored as the library only supports loading the database into mmap allocated memory.

**Example.** MEM_CACHE_CHECK.

```opensips
...
modparam("mmgeoip", "cache_type","MEM_CACHE_CHECK")
...
```
### `mmgeoip_city_db_path` (string)

Path to either a GeoLite or GeoIP City database file.

**Notes:** Mandatory parameter.

**Example.** /usr/share/GeoIP/GeoLiteCity.dat.

```opensips
...
modparam("mmgeoip", "mmgeoip_city_db_path",
  "/usr/share/GeoIP/GeoLiteCity.dat")
...
```

## Exported Functions

### `mmg_lookup([fields,]src,dst)`

Looks up information specified by `field` associated with the IP address `src`. The resulting data is loaded in _reverse_ order into the `dst` AVP.

When using the GeoIP2 library, each token from the list given in the `fields` parameter can be provided as a path to a specific key in the data structure associated with an IP. Thus, the token format is '_key_name_._key_name_[_.key_name_]*'. If a key's value is an array, instead of a subkey name, an index should be provided in order to select the appropriate value.

Example tokens: '_country.names.en_', '_continent.names.en_ ', '_subdivisions.0.iso_code_'. For more details about the available fields in the database and the key names that should be used to retrieve them, check the [_MaxMind GeoIP2 documentation_](https://dev.maxmind.com/geoip/geoip2/).

**Parameters:**

- `dst` *(var, required)* — AVP to return the information associated with the IP in.
- `fields` *(string, optional)* — a list of elements delimited by one of these separators: ':', '|', ',', '/' or ' '(space). Accepts the following tokens: _lat_, _lon_, _cont_, _cc_, _reg_, _city_, _pc_, _dma_, _ac_, _tz_. When using the GeoIP2 library, each token from the list given in the `fields` parameter can be provided as a path to a specific key in the data structure associated with an IP. Thus, the token format is '_key_name_._key_name_[_.key_name_]*'. If a key's value is an array, instead of a subkey name, an index should be provided in order to select the appropriate value.
  - `lat`
  - `lon`
  - `cont`
  - `cc`
  - `reg`
  - `city`
  - `pc`
  - `dma`
  - `ac`
  - `tz`
  - `country.names.en`
  - `continent.names.en`
  - `subdivisions.0.iso_code`
- `src` *(string, required)* — IP address

**Return codes:**

- `1` — on success
- `-1` — on failure

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE, ERROR_ROUTE, LOCAL_ROUTE

**Example.** `mmg_lookup` usage.

```opensips
...
if(mmg_lookup("lon:lat",$si,$avp(lat_lon))) {
  xlog("L_INFO","Source IP latitude:$(avp(lat_lon)[0])\n");
  xlog("L_INFO","Source IP longitude:$(avp(lat_lon)[1])\n");
};
...
# fields format only supported for GeoIP2
if(mmg_lookup("continent.names.en:country.iso_code,",$si,$avp(geodata))) {
  xlog("L_INFO","Source IP country code:$(avp(geodata)[0])\n");
  xlog("L_INFO","Source IP continent:$(avp(geodata)[1])\n");
};
...
```

## Configuration Examples

### Set “mmgeoip_city_db_path” parameter

Sets the path to the GeoLite or GeoIP City database file.

```opensips
...
modparam("mmgeoip", "mmgeoip_city_db_path",
  "/usr/share/GeoIP/GeoLiteCity.dat")
...
```
### Set “cache_type” parameter

Sets the database memory caching option.

```opensips
...
modparam("mmgeoip", "cache_type","MEM_CACHE_CHECK")
...
```
### `mmg_lookup` usage

Demonstrates how to use the mmg_lookup function to retrieve geographic data for an IP address.

```opensips
...
if(mmg_lookup("lon:lat",$si,$avp(lat_lon))) {
  xlog("L_INFO","Source IP latitude:$(avp(lat_lon)\[0\])\\n");
  xlog("L_INFO","Source IP longitude:$(avp(lat_lon)\[1\])\\n");
};
...
# fields format only supported for GeoIP2
if(mmg_lookup("continent.names.en:country.iso_code,",$si,$avp(geodata))) {
  xlog("L_INFO","Source IP country code:$(avp(geodata)\[0\])\\n");
  xlog("L_INFO","Source IP continent:$(avp(geodata)\[1\])\\n");
};
...
```
