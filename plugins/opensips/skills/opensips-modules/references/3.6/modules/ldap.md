# ldap Module Reference
<!-- generated-from: data/3.6/modules/ldap.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 ldap module. Read this file when configuring or debugging the ldap module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Configuration Examples](#configuration-examples)

## Overview

The LDAP module implements an LDAP search interface for OpenSIPS. It exports script functions to perform an LDAP search operation and to store the search results as OpenSIPS AVPs. This allows for using LDAP directory data in the OpenSIPS SIP message routing script.

The following features are offered by the LDAP module:

*   LDAP search function taking an LDAP URL as input both synchronous and asynchronous
    
*   LDAP result parsing functions to store LDAP data as AVPs
    
*   Support for accessing multiple LDAP servers
    
*   LDAP SIMPLE authentication
    
*   LDAP server failover and automatic reconnect
    
*   Configurable LDAP connection and bind timeouts
    
*   Module API for LDAP search operations that can be used by other OpenSIPS modules
    
*   StartTLS support

## How It Works

The module implementation makes use of the open source OpenLDAP library available on most UNIX/Linux platforms. Besides LDAP server failover and automatic reconnect, this module can handle multiple LDAP sessions concurrently allowing to access data stored on different LDAP servers. Each OpenSIPS worker process maintains one LDAP TCP connection per configured LDAP server. This enables parallel execution of LDAP requests and offloads LDAP concurrency control to the LDAP server(s).

An LDAP search module API is provided that can be used by other OpenSIPS modules. A module using this API does not have to implement LDAP connection management and configuration, while still having access to the full OpenLDAP API for searching and result handling.

Since LDAP server implementations are optimized for fast read access they are a good choice to store SIP provisioning data. Performance tests have shown that this module achieves lower data access times and higher call rates than other database modules like e.g. the OpenSIPS MYSQL module.

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

- `OpenLDAP library (libldap) v2.1 or greater` — needed for compilation
- `libldap header files (libldap-dev)` — needed for compilation

## Exported Parameters

### `config_file` (string)

Full path to LDAP configuration file.

*Default value is /usr/local/etc/opensips/ldap.cfg.*

**Example.** /etc/opensips/ldap.ini.

```opensips
modparam("ldap", "config\_file", "/etc/opensips/ldap.ini")
```
### `max_async_connections` (integer)

Number of maximum asynchronous connections that will be started with the ldap server for executing asynchronous ldap\_search calls. The number of connections is per process, so if there are 8 worker processes with 20 max\_async\_connections, there will be a maximum of 160 connections to the ldap server.

*Default value is 20.*

**Example.** 50.

```opensips
modparam("ldap", "max\_async\_connections", 50)
```

## Exported Functions

### `ldap_filter_url_encode(string, avp_spec)`

This function applies the following escaping rules to `string` and stores the result in AVP `avp_spec`: **Table 1.2. ldap_filter_url_encode() escaping rules** character in `string` gets replaced with defined in * \2a RFC 4515 ( \28 RFC 4515 ) \29 RFC 4515 \ \5c RFC 4515 ? %3F RFC 4516 The string stored in AVP `avp_spec` can be safely used in an LDAP URL filter string.

**Parameters:**

- `avp_spec` *(var, required)* — AVP to store resulting RFC 4515 and URL encoded string, e.g. `$avp(ldap_search)` or `$avp(10)`
- `string` *(string, required)* — String to apply RFC 4515 and URL escpaing rules to. AVPs and pseudo variables do get expanded. Example: `"cn=$avp(name)"`

**Return codes:**

- `1` — RFC 4515 and URL encoded filter_component stored as AVP avp_name
- `-1` — Internal error

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE, ONREPLY_ROUTE

**Example.** Example Usage.

```opensips
...
if (!ldap_filter_url_encode("cn=$avp(name)", $avp(name_esc)))
{
    # RFC 4515/URL encoding failed --> silently discard request
    exit;
}

xlog("L_INFO", "encoded LDAP filter component: [$avp(name_esc)]\\n");

if (ldap_search(
     "ldap://h350/ou=commObjects,dc=example,dc=com??sub?($avp(name_esc))"))
    { ... }
...
```

### `ldap_result(ldap_attr_name, avp_spec, [avp_type], [regex_subst])`

This function converts LDAP attribute values into AVPs for later use in the message routing script. It accesses the LDAP result set fetched by the last `ldap_search` call. `ldap_attr_name` specifies the LDAP attribute name who's value should be stored in AVP `avp_spec`. Multi valued LDAP attributes generate an indexed AVP. The optional `regex_subst` parameter allows to further define what part of an attribute value should be stored as AVP. An AVP can either be of type string or integer. As default, `ldap_result` stores LDAP attribute values as AVP of type string. The optional `avp_type` parameter can be used to explicitly specify the type of the AVP. It can be either `str` for string, or `int` for integer. If `avp_type` is specified as `int` then `ldap_result` tries to convert the LDAP attribute values to integer. In this case, the values are only stored as AVP if the conversion to integer is successful.

**Parameters:**

- `avp_spec` *(var, required)* — Specification of destination AVP, e.g. `$avp(service_level)` or `$avp(12)`
- `avp_type` *(string, optional)* — Specification of destination AVP type, either `str` or `int`. If this parameter is not specified then the LDAP attribute values are stored as AVP of type string.
  - `str`
  - `int`
- `ldap_attr_name` *(string, required)* — The name of the LDAP attribute who's value should be stored, e.g. `SIPIdentityServiceLevel` or `telephonenumber`
- `regex_subst` *(string, optional)* — Regex substitution that gets applied to LDAP attribute value before storing it as AVP, e.g. `"/^sip:(.+)$/\1/"` to strip off "sip:" from the beginning of an LDAP attribute value.

**Return codes:**

- `n > 0` — LDAP attribute ldap_attr_name found in LDAP result set and n LDAP attribute values stored in avp_spec
- `-1` — No LDAP attribute ldap_attr_name found in LDAP result set
- `-2` — Internal error occurred

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE, ONREPLY_ROUTE

**Related:**

- `ldap_search`

**Example.** Example Usage.

```opensips
...

# ldap_search call
...

# save SIPIdentityServiceLevel in $avp(service_level)
if (!ldap_result("SIPIdentityServiceLevel", $avp(service_level)))
{
    switch ($retcode)
    {
    case -1:
        # no SIPIdentityServiceLevel found
        sl_send_reply(403, "Forbidden");
        exit;
    case -2:
        # internal error
        sl_send_reply(500, "Internal server error");
        exit;
    default:
        exit;
    }
}

# save SIP URI domain in $avp(10)
ldap_result("SIPIdentitySIPURI", $avp(10), "/^[^@]+@(.+)$/\\1/");
...
```

### `ldap_result_check(ldap_attr_name, string_to_match, [, regex_subst])`

This function compares `ldap_attr_name`'s value with `string_to_match` for equality. It accesses the LDAP result set fetched by the last `ldap_search` call. The optional `regex_subst` parameter allows to further define what part of the attribute value should be used for the equality match. If `ldap_attr_name` is multi valued, each value is checked against `string_to_match`. If one or more of the values do match the function returns `1` (TRUE).

**Parameters:**

- `ldap_attr_name` *(string, required)* — The name of the LDAP attribute who's value should be matched, e.g. `SIPIdentitySIPURI`
- `regex_subst` *(string, optional)* — Regex substitution that gets applied to LDAP attribute value before comparing it with string_to_match, e.g. `"/^[^@]@+(.+)$/\1/"` to extract the domain part of a SIP URI
- `string_to_match` *(string, required)* — String to be matched. Included AVPs and pseudo variabels do get expanded.

**Return codes:**

- `1` — One or more ldap_attr_name attribute values match string_to_match (after regex_subst is applied)
- `-1` — ldap_attr_name attribute not found or attribute value doesn't match string_to_match (after regex_subst is applied)
- `-2` — Internal error occurred

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE, ONREPLY_ROUTE

**Related:**

- `ldap_search`

**Example.** Example Usage.

```opensips
...
# ldap_search call
...

# check if 'sn' ldap attribute value equals username part of R-URI,
# the same could be achieved with ldap_result_check("sn/$rU")
if (!ldap_result_check("sn", $ru, "/^sip:([^@]).*$/\\1/"))
{
    switch ($retcode)
    {
    case -1:
        # R-URI username doesn't match sn
        sl_send_reply(401, "Unauthorized");
        exit;
    case -2:
        # internal error
        sl_send_reply(500, "Internal server error");
        exit;
    default:
        exit;
    }
}
...
```

### `ldap_result_next()`

An LDAP search operation can return multiple LDAP entries. This function can be used to cycle through all returned LDAP entries. It returns 1 (TRUE) if there is another LDAP entry present in the LDAP result set and causes `ldap_result*` functions to work on the next LDAP entry. The function returns -1 (FALSE) if there are no more LDAP entries in the LDAP result set.

**Return codes:**

- `1` — Another LDAP entry is present in the LDAP result set and result pointer is incremented by one
- `-1` — No more LDAP entries are available
- `-2` — Internal error

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE, ONREPLY_ROUTE

**Related:**

- `ldap_result*`

**Example.** Example Usage.

```opensips
...
# ldap_search call
...

ldap_result("telephonenumber/$avp(tel1)");
if (ldap_result_next())
{
	ldap_result("telephonenumber/$avp(tel2)");
}
if (ldap_result_next())
{
	ldap_result("telephonenumber/$avp(tel3)");
}
if (ldap_result_next())
{
	ldap_result("telephonenumber/$avp(tel4)");
}
...
```

### `ldap_search(ldap_url)`

Performs an LDAP search operation using given LDAP URL and stores result internally for later retrieval by `ldap_result*` functions. If one ore more LDAP entries are found the function returns the number of found entries which evaluates to TRUE in the OpenSIPS configuration script. It returns `-1` (`FALSE`) in case no LDAP entry was found, and `-2` (`FALSE`) if an internal error like e.g. an LDAP error occurred.

**Parameters:**

- `ldap_url` *(string, required)* — An LDAP URL defining the LDAP search operation (refer to [Section 1.1.2, “LDAP URLs”](#ldap-urls "1.1.2. LDAP URLs") for a description of the LDAP URL format). The hostport part must be one of the LDAP session names declared in the LDAP configuration script.

**Return codes:**

- `n > 0` — Found n matching LDAP entries
- `-1` — No matching LDAP entries found
- `-2` — LDAP error (e.g. LDAP server unavailable), or internal error

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE, ONREPLY_ROUTE

**Related:**

- `ldap_result*`

**Example.** Example Usage.

```opensips
...
# ldap search
if (!ldap_search("ldap://sipaccounts/ou=sip,dc=example,dc=com??one?(cn=$rU)"))
{
    switch ($retcode)
    {
    case -1:
        # no LDAP entry found
        sl_send_reply(404, "User Not Found");
        exit;
    case -2:
        # internal error
        sl_send_reply(500, "Internal server error");
        exit;
    default:
        exit;
    }
}
xlog("L_INFO", "ldap_search: found [$retcode] entries for (cn=$rU)");

# save telephone number in $avp(tel_number)
ldap_result("telephoneNumber/$avp(tel_number)");
...
```

## Configuration Examples

### `ldap_server_url` examples

```opensips
ldap_server_url = "ldap://localhost"
ldap_server_url = "ldap://ldap.example.com:7777"
ldap_server_url = "ldap://ldap1.example.com,
                   ldap://ldap2.example.com:80389"
```
### `ldap_version` example

```opensips
ldap_version = 2
```
### `ldap_bind_dn` example

```opensips
ldap_bind_dn = "cn=root,dc=example,dc=com";
```
### `ldap_bind_password` example

```opensips
ldap_bind_password = "secret";
```
### `ldap_network_timeout` example

```opensips
ldap_network_timeout = 500 ; setting TCP timeout to 500 ms
```
### `ldap_client_bind_timeout` example

```opensips
ldap_client_bind_timeout = 1000
```
### `ldap_ca_cert_file` example

```opensips
ldap_ca_cert_file = "/usr/local/CAcert.pem"
```
### `ldap_cert_file` example

```opensips
ldap_cert_file = "/usr/local/mycert.pem"
```
### `ldap_key_file` example

```opensips
ldap_key_file = "/usr/local/mykey.pem"
```
### `ldap_require_certificate` example

```opensips
ldap_require_certificate = "NEVER"
```
### Example LDAP Configuration File

The following configuration file example includes two LDAP session definitions that could be used e.g. for accessing H.350 data and do phone number to name mappings.

```opensips
# LDAP session "sipaccounts":
#
# - using LDAPv3 (default)
# - two redundant LDAP servers
#
[sipaccounts]
ldap_server_url = "ldap://h350-1.example.com, ldap://h350-2.example.com"
ldap_bind_dn = "cn=sip_proxy,ou=accounts,dc=example,dc=com"
ldap_bind_password = "pwd"
ldap_network_timeout = 500
ldap_client_bind_timeout = 500
#using StartTLS
ldap_ca_cert_file = "/ldap/path/to/ca/certificate.pem"
ldap_cert_file = "/ldap/path/to/certificate.pem"
ldap_key_file = "/ldap/path/to/key/file.pem"
ldap_require_certificate = "NEVER"

# LDAP session "campus":
#
# - using LDAPv2
# - anonymous bind
#
[campus]
ldap_version = 2
ldap_server_url = "ldap://ldap.example.com"
ldap_network_timeout = 500
ldap_client_bind_timeout = 500
```
### `config_file` parameter usage

```opensips
modparam("ldap", "config_file", "/etc/opensips/ldap.ini")
```
### `max_async_connections` parameter usage

```opensips
modparam("ldap", "max_async_connections", 50)
```
