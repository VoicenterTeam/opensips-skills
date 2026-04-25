# mmgeoip Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5580768)

2.2. [Most recently active contributors(1) to this module](#idp5678832)

**List of Examples**

1.1. [Set “mmgeoip\_city\_db\_path” parameter](#idp162928)

1.2. [Set “cache\_type” parameter](#idp5523728)

1.3. [`mmg_lookup` usage](#idp5550336)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This module is a lightweight wrapper for the MaxMind GeoIP API. It adds IP address-to-location lookup capability to OpenSIPS scripts.

Lookups are executed against the freely-available GeoLite City database; and the non-free GeoIP City database is drop-in compatible. All lookup fields provided by the API are accessible by the script. Visit the [_MaxMind website_](https://dev.maxmind.com/geoip/) for more information on the location databases.

The module is compatible with both legacy GeoIP and the newer GeoIP2 APIs and databases.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _No dependencies on other OpenSIPS modules_.
    

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _libGeoIP_ - for the legacy GeoIP API and database;
    
*   _libmaxminddb_ - for the GeoIP2 API and database.
    

You can select which GeoIP library to use by setting the GEOIP environment variable, before compiling the module, to one of the following values:

*   _GEOIPLEGACY \*\*\*_ libGeoIP library shall be used
    
*   _GEOIP2 \*\*\*_ libmaxminddb library shall be used;
    

IMPORTANT: If the selected library is not installed the module won't compile.

NOTE: If GEOIP env is not set, the module will try to find which GeoIP library is installed, prioritizing libmaxminddb.

## 1.3.�Exported Parameters

### 1.3.1.�`mmgeoip_city_db_path` (string)

Path to either a GeoLite or GeoIP City database file.

_Mandatory parameter._

**Example�1.1.�Set “mmgeoip\_city\_db\_path” parameter**

...
modparam("mmgeoip", "mmgeoip\_city\_db\_path",
  "/usr/share/GeoIP/GeoLiteCity.dat")
...
		

  

### 1.3.2.�`cache_type` (string)

Databse memory caching options. The following options are available:

*   _STANDARD_ - Read database from file system; least memory used;
    
*   _MMAP\_CACHE_ - Load database into mmap allocated memory;
    
    _WARNING: this option will cause a segmentation fault if database file is changed at runtime!_
    
*   _MEM\_CACHE\_CHECK_ - Load database into memory; this mode checks for database updates; if database was modified, the file will be reloaded after 60 seconds; it will be slower than _MMAP\_CACHE_ but it will allow reloads;
    

Default value for this parameter is _MMAP\_CACHE_.

NOTE: If libmaxminddb is used, this parameter will be ignored as the library only supports loading the database into mmap allocated memory.

**Example�1.2.�Set “cache\_type” parameter**

...
modparam("mmgeoip", "cache\_type","MEM\_CACHE\_CHECK")
...
		

  

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
		

  

## 1.5.�Known Issues

It is not currently possible to load an updated location database without first stalling the server.

## Chapter�2.�Contributors

## 2.1.�By Commit Statistics

**Table�2.1.�Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)**

�

Name

DevScore

Commits

Lines ++

Lines --

1.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

15

5

653

238

2.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

10

8

32

24

3.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

10

8

18

9

4.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

10

8

16

38

5.

Kobi Eshun ([@ekobi](https://github.com/ekobi))

8

3

480

4

6.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

6

4

6

6

7.

Sergio Gutierrez

4

2

5

3

8.

Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita))

3

1

84

1

9.

Anca Vamanu

3

1

6

2

10.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

3

1

1

1

  

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 2.2.�By Commit Activity

**Table�2.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Oct 2022 - Feb 2023

2.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Jun 2011 - Apr 2021

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Mar 2014 - Jan 2021

4.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Apr 2019

5.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Jul 2009 - Apr 2019

6.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

7.

Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita))

May 2016 - May 2016

8.

Kobi Eshun ([@ekobi](https://github.com/ekobi))

Nov 2008 - Dec 2009

9.

Anca Vamanu

Sep 2009 - Sep 2009

10.

Sergio Gutierrez

Nov 2008 - Nov 2008

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Kobi Eshun ([@ekobi](https://github.com/ekobi)).

_Documentation Copyrights:_

Copyright � 2008 SightSpeed, Inc.