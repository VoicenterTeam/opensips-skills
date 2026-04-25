# domain Module Reference
<!-- generated-from: data/3.6/modules/domain.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 domain module. Read this file when configuring or debugging the domain module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Exported MI Functions](#exported-mi-functions)
- [Configuration Examples](#configuration-examples)

## Overview

Domain module implements checks that based on domain table determine if a host part of an URI is “local” or not. A “local” domain is one that the proxy is responsible for.

## How It Works

Domain module operates in caching or non-caching mode depending on value of module parameter _`db_mode`_. In caching mode domain module reads the contents of domain table into cache memory when the module is loaded. After that domain table is re-read only when module is given domain_reload fifo command. Any changes in domain table must thus be followed by “domain_reload” command in order to reflect them in module behavior. In non-caching mode domain module always queries domain table in the database. Caching is implemented using a hash table. The size of the hash table is given by HASH_SIZE constant defined in domain_mod.h. Its “factory default” value is 128.

## Dependencies

### OpenSIPs Modules

- `database` — Any database module

### External Libraries

None.

## Exported Parameters

### `attrs_col` (string)

Name of column containing attributes in domain table.

*Default value is attrs.*

**Example.** attributes.

```opensips
modparam("domain", "attrs_col", "attributes")
```
### `db_mode` (integer)

Database mode: 0 means non-caching, 1 means caching.

*Default value is 0.*

**Possible values:**

- 0
- 1

**Example.** 1.

```opensips
modparam("domain", "db_mode", 1)   # Use caching
```
### `db_url` (string)

This is URL of the database to be used.

*Default value is mysql://opensipsro:opensipsro@localhost/opensips.*

**Example.** mysql://ser:pass@db_host/ser.

```opensips
modparam("domain", "db_url", "mysql://ser:pass@db_host/ser")
```
### `domain_col` (string)

Name of column containing domains in domain table.

*Default value is domain.*

**Example.** domain_name.

```opensips
modparam("domain", "domain_col", "domain_name")
```
### `domain_table` (string)

Name of table containing names of local domains that the proxy is responsible for. Local users must have in their sip uri a host part that is equal to one of these domains.

*Default value is domain.*

**Example.** new_name.

```opensips
modparam("domain", "domain_table", "new_name")
```
### `subdomain_col` (string)

Name of the "accept_subdomain" column in the domain table. A positive value for the column means the domain accepts subdomains. A 0 value means it does not.

*Default value is accept_subdomain.*

**Example.** has_subdomain.

```opensips
modparam("domain", "subdomain_col", "has_subdomain")
```

## Exported Functions

### `is_domain_local(domain, [attrs_var])`

This function checks if the domain contained in the first parameter is local. This function is a generalized form of the is_from_local() and is_uri_host_local() functions, being able to completely replace them and also extends them by allowing the domain to be taken from any of the above mentioned sources. The following equivalences exist: is_domain_local($rd) is same as is_uri_host_local(); is_domain_local($fd) is same as is_from_local().

**Parameters:**

- `attrs_var` *(var, optional)* — A writable variable that will be populated with the attributes from the database.
- `domain` *(string, required)* — The domain to check.

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE

**Related:**

- `is_from_local`
- `is_uri_host_local`

**Example.** is_domain_local usage.

```opensips
if (is_domain_local($rd)) {
	...
};
if (is_domain_local($fd)) {
	...
};
if (is_domain_local($avp(some_avp_alias))) {
	...
};
if (is_domain_local($avp(850))) {
	...
};
if (is_domain_local($avp(some_avp))) {
	...
};
if (is_domain_local($avp(some_avp), $avp(attrs))) {
	xlog("Domain attributes are $avp(attrs)\n");
	...
};
```

### `is_from_local([attrs_var])`

Checks based on domain table if host part of From header uri is one of the local domains that the proxy is responsible for. The argument is optional and if present it should contain a writable variable that will be populated with the attributes from the database.

**Parameters:**

- `attrs_var` *(var, optional)* — A writable variable that will be populated with the attributes from the database.

**Usable from:** REQUEST_ROUTE

**Example.** is_from_local usage.

```opensips
if (is_from_local()) {
	...
};
```

**Example.** is_from_local usage.

```opensips
if (is_from_local($var(attrs))) {
	xlog("Domain attributes are $var(attrs)\n");
	...
};
```

### `is_uri_host_local([attrs_var])`

If called from route or failure route block, checks based on domain table if host part of Request-URI is one of the local domains that the proxy is responsible for. If called from branch route, the test is made on host part of URI of first branch, which thus must have been appended to the transaction before is_uri_host_local() is called. The argument is optional and if present it should contain a writable variable that will be populated with the attributes from the database.

**Parameters:**

- `attrs_var` *(var, optional)* — A writable variable that will be populated with the attributes from the database.

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE

**Example.** is_uri_host_local usage.

```opensips
if (is_uri_host_local()) {
	...
};
```

**Example.** is_uri_host_local usage.

```opensips
if (is_uri_host_local($var(attrs))) {
	xlog("Domain attributes are $var(attrs)\n");
	...
};
```

## Exported MI Functions

### `domain_dump`

Causes domain module to dump hash indexes and domain names in its cache memory.

**Example.** MI FIFO Command Format

```bash
			opensips-cli -x mi domain_dump
```

### `domain_reload`

Causes domain module to re-read the contents of domain table into cache memory.

**Example.** MI FIFO Command Format

```bash
			opensips-cli -x mi domain_reload
```

## Configuration Examples

### Setting db_url parameter

This is URL of the database to be used.

```opensips
modparam("domain", "db_url", "mysql://ser:pass@db_host/ser")
```
### db_mode example

Database mode: 0 means non-caching, 1 means caching.

```opensips
modparam("domain", "db_mode", 1)   # Use caching
```
### Setting domain_table parameter

Name of table containing names of local domains that the proxy is responsible for. Local users must have in their sip uri a host part that is equal to one of these domains.

```opensips
modparam("domain", "domain_table", "new_name")
```
### Setting domain_col parameter

Name of column containing domains in domain table.

```opensips
modparam("domain", "domain_col", "domain_name")
```
### Setting attrs_col parameter

Name of column containing attributes in domain table.

```opensips
modparam("domain", "attrs_col", "attributes")
```
### Setting subdomain_col parameter

Name of the "accept_subdomain" column in the domain table. A positive value for the column means the domain accepts subdomains. A 0 value means it does not.

```opensips
modparam("domain", "subdomain_col", "has_subdomain")
```
### is_from_local usage

Checks based on domain table if host part of From header uri is one of the local domains that the proxy is responsible for. The argument is optional and if present it should contain a writable variable that will be populated with the attributes from the database.

```opensips
...
if (is_from_local()) {
	...
};
...
if (is_from_local($var(attrs))) {
	xlog("Domain attributes are $var(attrs)\\n");
	...
};
...
```
### is_uri_host_local usage

If called from route or failure route block, checks based on domain table if host part of Request-URI is one of the local domains that the proxy is responsible for. If called from branch route, the test is made on host part of URI of first branch, which thus must have been appended to the transaction before is_uri_host_local() is called. The argument is optional and if present it should contain a writable variable that will be populated with the attributes from the database.

```opensips
...
if (is_uri_host_local()) {
	...
};
...
if (is_uri_host_local($var(attrs))) {
	xlog("Domain attributes are $var(attrs)\\n");
	...
};
```
### is_domain_local usage

This function checks if the domain contained in the first parameter is local. This function is a generalized form of the is_from_local() and is_uri_host_local() functions, being able to completely replace them and also extends them by allowing the domain to be taken from any of the above mentioned sources. The following equivalences exist: is_domain_local($rd) is same as is_uri_host_local(); is_domain_local($fd) is same as is_from_local().

```opensips
...
if (is_domain_local($rd)) {
	...
};
if (is_domain_local($fd)) {
	...
};
if (is_domain_local($avp(some_avp_alias))) {
	...
};
if (is_domain_local($avp(850))) {
	...
};
if (is_domain_local($avp(some_avp))) {
	...
};
if (is_domain_local($avp(some_avp), $avp(attrs))) {
	xlog("Domain attributes are $avp(attrs)\\n");
	...
};
...
```
