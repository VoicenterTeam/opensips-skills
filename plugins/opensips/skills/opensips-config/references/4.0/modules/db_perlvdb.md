# db_perlvdb Module Reference
<!-- generated-from: data/4.0/modules/db_perlvdb.json
     generator-version: 0.1.0
     opensips-version: 4.0
     doc-type: module -->

Reference for the OpenSIPs 4.0 db_perlvdb module. Read this file when configuring or debugging the db_perlvdb module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)

## Overview

The Perl Virtual Database (VDB) provides a virtualization framework for OpenSIPS's database access. It does not handle a particular database engine itself but lets the user relay database requests to arbitrary Perl functions.

This module cannot be used "out of the box". The user has to supply functionality dedicated to the client module. See below for options.

The module can be used in all current OpenSIPS modules that need database access. Relaying of insert, update, query and delete operations is supported.

Modules can be configured to use the db_url_parameter:

modparam("acc", "db_url", "perlvdb:OpenSIPS::VDB::Adapter::AccountingSIPtrace")

This configuration options tells acc module that it should use the db_perlvdb module which will in turn use the Perl class OpenSIPS::VDB::Adapter::AccountingSIPtrace to relay the database requests.

## How It Works

OpenSIPS uses a database API for requests of numerous different types of data. Four primary operations are supported:

*   query
    
*   insert
    
*   update
    
*   delete
    
This module relays these database requests to user implemented Perl functions.

A client module has to be configured to use the db_perlvdb module in conjunction with a Perl class to provide the functions. The configured class needs to inherit from the base class `OpenSIPS::VDB`.

Derived classes have to implement the necessary functions "query", "insert", "update" and/or "delete". The client module specifies the necessary functions. To find out which functions are called from a module, its processes may be evaluated with the `OpenSIPS::VDB::Adapter::Describe` class which will log incoming requests (without actually providing any real functionality).

While users can directly implement their desired functionality in a class derived from OpenSIPS::VDB, it is advisable to split the implementation into an Adapter that transforms the relational structured parameters into pure Perl function arguments, and add a virtual table (VTab) to provide the relaying to an underlying technology.

## Dependencies

### OpenSIPs Modules

- `perl` — Must be loaded before this module

### External Libraries

None.
