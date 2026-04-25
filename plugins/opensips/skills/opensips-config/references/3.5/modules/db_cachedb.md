# db_cachedb Module Reference
<!-- generated-from: data/3.5/modules/db_cachedb.json
     generator-version: 0.1.0
     opensips-version: 3.5
     doc-type: module -->

Reference for the OpenSIPs 3.5 db_cachedb module. Read this file when configuring or debugging the db_cachedb module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Configuration Examples](#configuration-examples)

## Overview

The db_cachedb module will expose the same front db api, however it will run on top of a NoSQL back-end, emulating the SQL calls to the back-end specific queries. Thus, any OpenSIPS module that would regularily need a regular SQL-based database, will now be able to run over a NoSQL back-end, allowing for a much easier distribution and integration of the currently existing OpenSIPS modules in a distributed environment.

## Dependencies

### OpenSIPs Modules

- `NoSQL cachedb_* module` — Must be loaded before this module

### External Libraries

None.

## Exported Parameters

### `cachedb_url` (string)

The URL for the CacheDB back-end to be used. It can be set more than one time.

**Example.** mongodb:mycluster://127.0.0.1:27017/db.col.

```opensips
modparam("db_cachedb","cachedb_url","mongodb:mycluster://127.0.0.1:27017/db.col")
```

## Configuration Examples

### Set `cachedb_url` parameter

The URL for the CacheDB back-end to be used. It can be set more than one time.

```opensips
...
modparam("db_cachedb","cachedb_url","mongodb:mycluster://127.0.0.1:27017/db.col")
...
```
### OpenSIPS CFG Snippet for using DB_CACHEDB

In order to achieve such a setup, one would have to set the db_url parameter of the auth_db module to point to the DB_CACHEDB URL.

```opensips
loadmodule "auth_db.so"
modparam("auth_db", "load_credentials", "$avp(user_rpid)=rpid")

loadmodule "db_cachedb.so"
loadmodule "cachedb_mongodb.so"
...
modparam("db_cachedb","cachedb_url","mongodb:mycluster://127.0.0.1:27017/my_db.col")
modparam("auth_db","db_url","cachedb://mongodb:mycluster")
...
```

With such a setup, the auth_db module will load the subscribers from the MongoDB cluster, in the 'my_db' database, in the 'subscriber' collection.

The same mechanism/setup can be used to run other modules ( like usrloc, dialog, permissions, drouting, etc ) on top of a cachedb cluster.
