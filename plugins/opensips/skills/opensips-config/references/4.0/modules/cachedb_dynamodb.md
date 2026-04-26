# cachedb_dynamodb Module Reference
<!-- generated-from: data/4.0/modules/cachedb_dynamodb.json
     generator-version: 0.1.0
     opensips-version: 4.0
     doc-type: module -->

Reference for the OpenSIPs 4.0 cachedb_dynamodb module. Read this file when configuring or debugging the cachedb_dynamodb module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Configuration Examples](#configuration-examples)

## Overview

This module is an implementation of a cachedb system designed to work with Amazon DynamoDB. It uses the AWS SDK library for C++ to connect to a DynamoDB instance. It leverages the Key-Value interface exported from the core.

https://aws.amazon.com/pm/dynamodb/

## How It Works

The module provides the following functionalities:

* set - sets a key in DynamoDB using the cachedb_store function
* get - queries a key from DynamoDB using the cachedb_fetch function
* remove - removes a key from DynamoDB using the cachedb_remove function
* get_counter - queries a key with a numerical value from DynamoDB using the cachedb_counter_fetch function
* add - increments the value of a specific item with a given value using the cachedb_add function
* sub - decrements the value of a specific item with a given value using the cachedb_sub function

The following are internally used by OpenSIPS:

* map_get
* map_set
* map_remove

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

- `AWS SDK for C++` — Must be installed before running OpenSIPS with this module loaded

## Exported Parameters

### `cachedb_url` (string)

The URLs of the server groups that OpenSIPS will connect to in order to use, from script, the cache_store(), cache_fetch(), etc. operations. It may be set more than once. The prefix part of the URL will be the identifier that will be used from the script.

There are some default parameters that can appear in the URL:

*   _region_ - specifies the AWS region where the DynamoDB table is located
    
*   _key_ - specifies the table's Key column; default value is _"opensipskey"_
    
*   _val_ - specifies the table's Value column on which cache operations such as cache_store, cache_fetch, etc., will be performed; default value is _"opensipsval"_

Syntax for _cachedb_url_

*   when using a previously created table (you have to specify the key and value):
    
    *   host and port
        
        `"dynamodb://id_host:id_port/tableName?key=key1;val=val1"`
    *   region
        
        `"dynamodb:///tableName?region=regionName;key=key2;val=val2"`
    
*   when using the default key and value:
    
    *   host and port
        
        `"dynamodb://id_host:id_port/tableName"`
    *   region
        
        `"dynamodb:///tableName?region=regionName"`

**Example.** dynamodb://localhost:8000/table1.

```opensips
# single-instance URLs
modparam("cachedb_dynamodb", "cachedb_url", "dynamodb://localhost:8000/table1")
modparam("cachedb_dynamodb", "cachedb_url", "dynamodb:///table2?region=central-1")

# multi-instance URL (will perform circular **failover** on each query)
modparam("cachedb_dynamodb", "cachedb_url", 
	"dynamodb://localhost:8000/table1?key=Key;val=Val")
modparam("cachedb_dynamodb", "cachedb_url", 
	"dynamodb:///table2?region=central-1;key=Key;val=Val")
```

## Configuration Examples

### Set `cachedb_url` parameter

Demonstrates setting the cachedb_url parameter for single-instance and multi-instance URLs.

```opensips
...

# single-instance URLs
modparam("cachedb_dynamodb", "cachedb_url", "dynamodb://localhost:8000/table1")
modparam("cachedb_dynamodb", "cachedb_url", "dynamodb:///table2?region=central-1")

# multi-instance URL (will perform circular **failover** on each query)
modparam("cachedb_dynamodb", "cachedb_url", 
	"dynamodb://localhost:8000/table1?key=Key;val=Val")
modparam("cachedb_dynamodb", "cachedb_url", 
	"dynamodb:///table2?region=central-1;key=Key;val=Val")

...
```
### Use Dynamodb servers

Demonstrates script operations such as cache_store, cache_fetch, cache_remove, cache_add, and cache_sub.

```opensips
...

cache_store("dynamodb", "call1", "10");
cache_store("dynamodb", "call2", "25", 150) // expires = 150s -optional
cache_fetch("dynamodb", "call1", $var(total));
cache_remove("dynamodb", "call1");

cache_store("dynamodb", "counter1", "200");
cache_sub("dynamodb", "counter1", 4, 1000); // expires = 1000s -mandatory parameter
cache_add("dynamodb", "call2", 5, 0) // -this update will not expire  -mandatory parameter
cache_remove("dynamodb", "counter1");

...
```
