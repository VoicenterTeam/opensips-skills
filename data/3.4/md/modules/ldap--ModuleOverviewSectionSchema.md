# LDAP Module

---

**List of Tables**

1.1. [RFC 4515 Escaping Rules](#idp30706768)

1.2. [ldap\_filter\_url\_encode() escaping rules](#idp30870784)

3.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp31425664)

3.2. [Most recently active contributors(1) to this module](#idp31554208)

**List of Examples**

1.1. [`ldap_server_url` examples](#idp30734384)

1.2. [`ldap_version` example](#idp30738544)

1.3. [`ldap_bind_dn` example](#idp30742688)

1.4. [`ldap_bind_password` example](#idp30746784)

1.5. [`ldap_network_timeout` example](#idp30750864)

1.6. [`ldap_client_bind_timeout` example](#idp30754432)

1.7. [`ldap_ca_cert_file` example](#idp30758000)

1.8. [`ldap_cert_file` example](#idp30761648)

1.9. [`ldap_key_file` example](#idp30765296)

1.10. [`ldap_require_certificate` example](#idp30769008)

1.11. [Example LDAP Configuration File](#idp30772384)

1.12. [`config_file` parameter usage](#idp30778032)

1.13. [`max_async_connections` parameter usage](#idp30782368)

1.14. [Example Usage of ldap\_url](#idp30792048)

1.15. [Example Usage](#idp30808992)

1.16. [Example Usage](#idp30835424)

1.17. [Example Usage](#idp30856464)

1.18. [Example Usage](#idp30866848)

1.19. [Example Usage](#idp30895184)

1.20. [Example Usage of ldap\_url](#idp30904480)

1.21. [Example Usage](#idp30921424)

2.1. [Example code fragment to load LDAP module API](#idp31153088)

2.2. [Example LDAP module API function call](#idp31198640)

## Chapter�1.�Admin Guide

## 1.1.�Overview

The LDAP module implements an LDAP search interface for OpenSIPS. It exports script functions to perform an LDAP search operation and to store the search results as OpenSIPS AVPs. This allows for using LDAP directory data in the OpenSIPS SIP message routing script.

The following features are offered by the LDAP module:

*   LDAP search function taking an LDAP URL as input both synchronous and asynchronous
    
*   LDAP result parsing functions to store LDAP data as AVP
    
*   Support for accessing multiple LDAP servers
    
*   LDAP SIMPLE authentication
    
*   LDAP server failover and automatic reconnect
    
*   Configurable LDAP connection and bind timeouts
    
*   Module API for LDAP search operations that can be used by other OpenSIPS modules
    
*   StartTLS support
    

The module implementation makes use of the open source OpenLDAP library available on most UNIX/Linux platforms. Besides LDAP server failover and automatic reconnect, this module can handle multiple LDAP sessions concurrently allowing to access data stored on different LDAP servers. Each OpenSIPS worker process maintains one LDAP TCP connection per configured LDAP server. This enables parallel execution of LDAP requests and offloads LDAP concurrency control to the LDAP server(s).

An LDAP search module API is provided that can be used by other OpenSIPS modules. A module using this API does not have to implement LDAP connection management and configuration, while still having access to the full OpenLDAP API for searching and result handling.

Since LDAP server implementations are optimized for fast read access they are a good choice to store SIP provisioning data. Performance tests have shown that this module achieves lower data access times and higher call rates than other database modules like e.g. the OpenSIPS MYSQL module.

### 1.1.1.�Usage Basics

First so called LDAP sessions have to be specified in an external configuration file (as described in [Section�1.3, “LDAP Configuration File”](#ldap-config "1.3.�LDAP Configuration File")). Each LDAP session includes LDAP server access parameters like server hostname or connection timeouts. Normally only a single LDAP session will be used unless there is a need to access more than one LDAP server. The LDAP session name will then be used in the OpenSIPS configuration script to refer to a specific LDAP session.

The `ldap_search` function ([Section�1.5.1, “ldap\_search(ldap\_url)”](#ldap-search-fn "1.5.1.�ldap_search(ldap_url)")) performs an LDAP search operation. It expects an LDAP URL as input which includes the LDAP session name and search parameters. [Section�1.1.2, “LDAP URLs”](#ldap-urls "1.1.2.�LDAP URLs") provides a quick overview on LDAP URLs.

The result of an LDAP search is stored internally and can be accessed with one of the `ldap_result*` functions. `ldap_result` ([Section�1.5.2, “ldap\_result(ldap\_attr\_name, avp\_spec, \[avp\_type\], \[regex\_subst\])”](#ldap-result-fn "1.5.2.�ldap_result(ldap_attr_name, avp_spec, [avp_type], [regex_subst])")) stores resulting LDAP attribute value as AVPs. `ldap_result_check` ([Section�1.5.3, “ldap\_result\_check(ldap\_attr\_name, string\_to\_match, \[, regex\_subst\])”](#ldap-result-check-fn "1.5.3.�ldap_result_check(ldap_attr_name, string_to_match, [, regex_subst])")) is a convenience function to compare a string with LDAP attribute values using regular expression matching. Finally, `ldap_result_next` ([Section�1.5.4, “ldap\_result\_next()”](#ldap-result-next-fn "1.5.4.�ldap_result_next()")) allows to handle LDAP search queries that return more than one LDAP entry.

All `ldap_result*` functions do always access the LDAP result set from the last `ldap_search` call. This should be kept in mind when calling `ldap_search` more than once in the OpenSIPS configuration script.

### 1.1.2.�LDAP URLs

`ldap_search` expects an LDAP URL as argument. This section describes the format and semantics of an LDAP URL.

RFC 4516 [\[RFC4516\]](#RFC4516 "Lightweight Directory Access Protocol (LDAP): Uniform Resource Locator") describes the format of an LDAP Uniform Resource Locator (URL). An LDAP URL represents an LDAP search operation in a compact format. The LDAP URL format is defined as follows (slightly modified, refer to section 2 of [\[RFC4516\]](#RFC4516 "Lightweight Directory Access Protocol (LDAP): Uniform Resource Locator") for ABNF notation):

> `ldap://[ldap_session_name][/dn?attrs[?scope[?filter]]]]`

_`ldap_session_name`_

An LDAP session name as defined in the LDAP configuration file.

(RFC 4516 defines this as LDAP hostport parameter)

_`dn`_

Base Distinguished Name (DN) of LDAP search or target of non-search operation, as defined in RFC 4514 [\[RFC4514\]](#RFC4514 "Lightweight Directory Access Protocol (LDAP): String Representation of Distinguished Names")

_`attrs`_

Comma separated list of LDAP attributes to be returned

_`scope`_

Scope for LDAP search, valid values are “base”, “one”, or “sub”

_`filter`_

LDAP search filter definition following rules of RFC 4515 [\[RFC4515\]](#RFC4515 "Lightweight Directory Access Protocol (LDAP): String Representation of Search Filters")

### Note

The following table lists characters that have to be escaped in LDAP search filters:

**Table�1.1.�RFC 4515 Escaping Rules**

`*`

`\2a`

`(`

`\28`

`)`

`\29`

`\`

`\5c`

  

### Note

Non-URL characters in an LDAP URL have to be escaped using percent-encoding (refer to section 2.1 of RFC 4516). In particular this means that any "?" character in an LDAP URL component must be written as "%3F", since "?" is used as a URL delimiter.

The exported function `ldap_filter_url_encode` ([Section�1.5.5, “ldap\_filter\_url\_encode(string, avp\_spec)”](#ldap-filter-url-encode-fn "1.5.5.�ldap_filter_url_encode(string, avp_spec)")) implements RFC 4515/4516 LDAP search filter and URL escaping rules.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The module depends on the following modules (the listed modules must be loaded before this module):

*   _No dependencies on other OpenSIPS modules._
    

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   OpenLDAP library (libldap) v2.1 or greater, libldap header files (libldap-dev) are needed for compilation
    

## 1.3.�LDAP Configuration File

The module reads an external confiuration file at module initialization time that includes LDAP session definitions.

### 1.3.1.�Configuration File Syntax

The configuration file follows the Windows INI file syntax, section names are enclosed in square brackets:

\[Section\_Name\]

Any section can contain zero or more configuration key assignments of the form

key = value ; comment

Values can be given enclosed with quotes. If no quotes are present, the value is understood as containing all characters between the first and the last non-blank characters. Lines starting with a hash sign and blank lines are treated as comments.

Each section describes one LDAP session that can be referred to in the OpenSIPS configuration script. Using the section name as the host part of an LDAP URL tells the module to use the LDAP session specified in the respective section. An example LDAP session specification looks like:

\[example\_ldap\]
ldap\_server\_url            = "ldap://ldap1.example.com, ldap://ldap2.example.com"
ldap\_bind\_dn               = "cn=sip\_proxy,ou=accounts,dc=example,dc=com"
ldap\_bind\_password         = "pwd"
ldap\_network\_timeout       = 500
ldap\_client\_bind\_timeout   = 500
ldap\_ca\_cert\_file		   = "/usr/share/ca-certificates/mycert.pem"
ldap\_cert\_file			   = "/var/my-certificate/certificate.pem"
ldap\_key\_file			   = "/var/my-certificate/key.pem"
ldap\_require\_certificate   = "ALLOW"

The configuration keys are explained in the following section. This LDAP session can be referred to in the routing script by using an LDAP URL like e.g.

ldap://example\_ldap/cn=admin,dc=example,dc=com

### 1.3.2.�LDAP Session Settings

ldap\_server\_url (mandatory)

LDAP URL including fully qualified domain name or IP address of LDAP server optionally followed by a colon and TCP port to connect: `ldap://<FQDN/IP>[:<port>]`. Failover LDAP servers can be added, each separated by a comma. In the event of connection errors, the module tries to connect to servers in order of appearance.

Default value: none, this is a mandatory setting

**Example�1.1.�`ldap_server_url` examples**

ldap\_server\_url = "ldap://localhost"
ldap\_server\_url = "ldap://ldap.example.com:7777"
ldap\_server\_url = "ldap://ldap1.example.com,
                   ldap://ldap2.example.com:80389"
				

  

ldap\_version (optional)

Supported LDAP versions are 2 and 3.

Default value: `3` (LDAPv3)

**Example�1.2.�`ldap_version` example**

ldap\_version = 2

  

ldap\_bind\_dn (optional)

Authentication user DN used to bind to LDAP server (module currently only supports SIMPLE\_AUTH). Empty string enables anonymous LDAP bind.

Default value: “” (empty string --> anonymous bind)

**Example�1.3.�`ldap_bind_dn` example**

ldap\_bind\_dn = "cn=root,dc=example,dc=com";

  

ldap\_bind\_password (optional)

Authentication password used to bind to LDAP server (SIMPLE\_AUTH). Empty string enables anonymous bind.

Default value: “” (empty string --> anonymous bind)

**Example�1.4.�`ldap_bind_password` example**

ldap\_bind\_password = "secret";

  

ldap\_network\_timeout (optional)

LDAP TCP connect timeout in milliseconds. Setting this parameter to a low value enables fast failover if `ldap_server_url` contains more than one LDAP server addresses.

Default value: 1000 (one second)

**Example�1.5.�`ldap_network_timeout` example**

ldap\_network\_timeout = 500 ; setting TCP timeout to 500 ms

  

ldap\_client\_bind\_timeout (optional)

LDAP bind operation timeout in milliseconds.

Default value: 1000 (one second)

**Example�1.6.�`ldap_client_bind_timeout` example**

ldap\_client\_bind\_timeout = 1000

  

ldap\_ca\_cert\_file (optional)

LDAP full path of the CA certificate file.

No default value. It is mandatory in case you wish to use StartTLS

**Example�1.7.�`ldap_ca_cert_file` example**

ldap\_ca\_cert\_file = "/usr/local/CAcert.pem"

  

ldap\_cert\_file (optional)

LDAP full path of the certificate file.

No default value. It is mandatory in case you wish to use StartTLS

**Example�1.8.�`ldap_cert_file` example**

ldap\_cert\_file = "/usr/local/mycert.pem"

  

ldap\_key\_file (optional)

LDAP full path of the key file.

No default value. It is mandatory in case you wish to use StartTLS

**Example�1.9.�`ldap_key_file` example**

ldap\_key\_file = "/usr/local/mykey.pem"

  

ldap\_require\_certificate (optional)

LDAP peer certificate checking strategy, one of "NEVER", "HARD", "DEMAND", "ALLOW", "TRY". Lower case letters are also accepted.

Default value "NEVER".

**Example�1.10.�`ldap_require_certificate` example**

ldap\_require\_certificate = "NEVER"

  

### 1.3.3.�Configuration File Example

The following configuration file example includes two LDAP session definitions that could be used e.g. for accessing H.350 data and do phone number to name mappings.

**Example�1.11.�Example LDAP Configuration File**

\# LDAP session "sipaccounts":
#
# - using LDAPv3 (default)
# - two redundant LDAP servers
#
\[sipaccounts\]
ldap\_server\_url = "ldap://h350-1.example.com, ldap://h350-2.example.com"
ldap\_bind\_dn = "cn=sip\_proxy,ou=accounts,dc=example,dc=com"
ldap\_bind\_password = "pwd"
ldap\_network\_timeout = 500
ldap\_client\_bind\_timeout = 500
#using StartTLS
ldap\_ca\_cert\_file = "/ldap/path/to/ca/certificate.pem"
ldap\_cert\_file = "/ldap/path/to/certificate.pem"
ldap\_key\_file = "/ldap/path/to/key/file.pem"
ldap\_require\_certificate = "NEVER"


# LDAP session "campus":
#
# - using LDAPv2
# - anonymous bind
#
\[campus\]
ldap\_version = 2
ldap\_server\_url = "ldap://ldap.example.com"
ldap\_network\_timeout = 500
ldap\_client\_bind\_timeout = 500
			

  

## 1.4.�Exported Parameters

### 1.4.1.�config\_file (string)

Full path to LDAP configuration file.

Default value: `/usr/local/etc/opensips/ldap.cfg`

**Example�1.12.�`config_file` parameter usage**

modparam("ldap", "config\_file", "/etc/opensips/ldap.ini")
		  

  

### 1.4.2.�max\_async\_connections (int)

Number of maximum asynchronous connections that will be started with the ldap server for executing asynchronous ldap\_search calls. The number of connections is per process, so if there are 8 worker processes with 20 max\_async\_connections, there will be a maximum of 160 connections to the ldap server.

Default value: `20`

**Example�1.13.�`max_async_connections` parameter usage**

modparam("ldap", "max\_async\_connections", 50)
		  

  

## 1.5.�Exported Functions

### 1.5.1.�ldap\_search(ldap\_url)

Performs an LDAP search operation using given LDAP URL and stores result internally for later retrieval by `ldap_result*` functions. If one ore more LDAP entries are found the function returns the number of found entries which evaluates to TRUE in the OpenSIPS configuration script. It returns `-1` (`FALSE`) in case no LDAP entry was found, and `-2` (`FALSE`) if an internal error like e.g. an LDAP error occurred.

**Function Parameters:**

_`ldap_url (string)`_

An LDAP URL defining the LDAP search operation (refer to [Section�1.1.2, “LDAP URLs”](#ldap-urls "1.1.2.�LDAP URLs") for a description of the LDAP URL format). The hostport part must be one of the LDAP session names declared in the LDAP configuration script.

**Example�1.14.�Example Usage of ldap\_url**

Search with LDAP session named `sipaccounts`, base `ou=sip,dc=example,dc=com`, `one` level deep using search filter `(cn=schlatter)` and returning all attributes:

ldap://sipaccounts/ou=sip,dc=example,dc=com??one?(cn=schlatter)

Subtree search with LDAP session named `ldap1`, base `dc=example,dc=com` using search filter `(cn=$(avp(name)))` and returning `SIPIdentityUserName` and `SIPIdentityServiceLevel` attributes

ldap://ldap\_1/dc=example,dc=com?
       SIPIdentityUserName,SIPIdentityServiceLevel?sub?(cn=$(avp(name)))
	        

  

**Return Values:**

`n` > 0 (TRUE):

*   Found `n` matching LDAP entries
    

`-1` (FALSE):

*   No matching LDAP entries found
    

`-2` (FALSE):

*   LDAP error (e.g. LDAP server unavailable), or
    
*   internal error
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE, and ONREPLY\_ROUTE.

**Example�1.15.�Example Usage**

...
# ldap search
if (!ldap\_search("ldap://sipaccounts/ou=sip,dc=example,dc=com??one?(cn=$rU)"))
{
    switch ($retcode)
    {
    case -1:
        # no LDAP entry found
        sl\_send\_reply(404, "User Not Found");
        exit;
    case -2:
        # internal error
        sl\_send\_reply(500, "Internal server error");
        exit;
    default:
        exit;
    }
}
xlog("L\_INFO", "ldap\_search: found \[$retcode\] entries for (cn=$rU)");

# save telephone number in $avp(tel\_number)
ldap\_result("telephoneNumber/$avp(tel\_number)");
...
			

  

### 1.5.2.�ldap\_result(ldap\_attr\_name, avp\_spec, \[avp\_type\], \[regex\_subst\])

This function converts LDAP attribute values into AVPs for later use in the message routing script. It accesses the LDAP result set fetched by the last `ldap_search` call. `ldap_attr_name` specifies the LDAP attribute name who's value should be stored in AVP `avp_spec`. Multi valued LDAP attributes generate an indexed AVP. The optional `regex_subst` parameter allows to further define what part of an attribute value should be stored as AVP.

An AVP can either be of type string or integer. As default, `ldap_result` stores LDAP attribute values as AVP of type string. The optional `avp_type` parameter can be used to explicitly specify the type of the AVP. It can be either `str` for string, or `int` for integer. If `avp_type` is specified as `int` then `ldap_result` tries to convert the LDAP attribute values to integer. In this case, the values are only stored as AVP if the conversion to integer is successful.

**Function Parameters:**

ldap\_attr\_name (string)

The name of the LDAP attribute who's value should be stored, e.g. `SIPIdentityServiceLevel` or `telephonenumber`

avp\_spec (var)

Specification of destination AVP, e.g. `$avp(service_level)` or `$avp(12)`

avp\_type (string, optional)

Specification of destination AVP type, either `str` or `int`. If this parameter is not specified then the LDAP attribute values are stored as AVP of type string.

regex\_subst (string)

Regex substitution that gets applied to LDAP attribute value before storing it as AVP, e.g. `"/^sip:(.+)$/\1/"` to strip off "sip:" from the beginning of an LDAP attribute value.

**Return Values:**

`n` > 0 (TRUE)

LDAP attribute `ldap_attr_name` found in LDAP result set and `n` LDAP attribute values stored in `avp_spec`

\-1 (FALSE)

No LDAP attribute `ldap_attr_name` found in LDAP result set

\-2 (FALSE)

Internal error occurred

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE, and ONREPLY\_ROUTE.

**Example�1.16.�Example Usage**

...

# ldap\_search call
...

# save SIPIdentityServiceLevel in $avp(service\_level)
if (!ldap\_result("SIPIdentityServiceLevel", $avp(service\_level)))
{
    switch ($retcode)
    {
    case -1:
        # no SIPIdentityServiceLevel found
        sl\_send\_reply(403, "Forbidden");
        exit;
    case -2:
        # internal error
        sl\_send\_reply(500, "Internal server error");
        exit;
    default:
        exit;
    }
}

# save SIP URI domain in $avp(10)
ldap\_result("SIPIdentitySIPURI", $avp(10), "/^\[^@\]+@(.+)$/\\1/");
...
			

  

### 1.5.3.�ldap\_result\_check(ldap\_attr\_name, string\_to\_match, \[, regex\_subst\])

This function compares `ldap_attr_name`'s value with `string_to_match` for equality. It accesses the LDAP result set fetched by the last `ldap_search` call. The optional `regex_subst` parameter allows to further define what part of the attribute value should be used for the equality match. If `ldap_attr_name` is multi valued, each value is checked against `string_to_match`. If one or more of the values do match the function returns `1` (TRUE).

**Function Parameters:**

ldap\_attr\_name (string)

The name of the LDAP attribute who's value should be matched, e.g. `SIPIdentitySIPURI`

string\_to\_match (string)

String to be matched. Included AVPs and pseudo variabels do get expanded.

regex\_subst (string, optional)

Regex substitution that gets applied to LDAP attribute value before comparing it with string\_to\_match, e.g. `"/^[^@]@+(.+)$/\1/"` to extract the domain part of a SIP URI

**Return Values:**

1 (TRUE)

One or more `ldap_attr_name` attribute values match `string_to_match` (after `regex_subst` is applied)

\-1 (FALSE)

`ldap_attr_name` attribute not found or attribute value doesn't match `string_to_match` (after `regex_subst` is applied)

\-2 (FALSE)

Internal error occurred

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE, and ONREPLY\_ROUTE.

**Example�1.17.�Example Usage**

...
# ldap\_search call
...

# check if 'sn' ldap attribute value equals username part of R-URI,
# the same could be achieved with ldap\_result\_check("sn/$rU")
if (!ldap\_result\_check("sn", $ru, "/^sip:(\[^@\]).\*$/\\1/"))
{
    switch ($retcode)
    {
    case -1:
        # R-URI username doesn't match sn
        sl\_send\_reply(401, "Unauthorized");
        exit;
    case -2:
        # internal error
        sl\_send\_reply(500, "Internal server error");
        exit;
    default:
        exit;
    }
}
...
			

  

### 1.5.4.�ldap\_result\_next()

An LDAP search operation can return multiple LDAP entries. This function can be used to cycle through all returned LDAP entries. It returns 1 (TRUE) if there is another LDAP entry present in the LDAP result set and causes `ldap_result*` functions to work on the next LDAP entry. The function returns -1 (FALSE) if there are no more LDAP entries in the LDAP result set.

**Return Values:**

1 (TRUE)

Another LDAP entry is present in the LDAP result set and result pointer is incremented by one

\-1 (FALSE)

No more LDAP entries are available

`-2` (FALSE)

Internal error

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE, and ONREPLY\_ROUTE.

**Example�1.18.�Example Usage**

...
# ldap\_search call
...

ldap\_result("telephonenumber/$avp(tel1)");
if (ldap\_result\_next())
{
	ldap\_result("telephonenumber/$avp(tel2)");
}
if (ldap\_result\_next())
{
	ldap\_result("telephonenumber/$avp(tel3)");
}
if (ldap\_result\_next())
{
	ldap\_result("telephonenumber/$avp(tel4)");
}
...
			

  

### 1.5.5.�ldap\_filter\_url\_encode(string, avp\_spec)

This function applies the following escaping rules to `string` and stores the result in AVP `avp_spec`:

**Table�1.2.�ldap\_filter\_url\_encode() escaping rules**

character in `string`

gets replaced with

defined in

\*

\\2a

RFC 4515

(

\\28

RFC 4515

)

\\29

RFC 4515

\\

\\5c

RFC 4515

?

%3F

RFC 4516

  

The string stored in AVP `avp_spec` can be safely used in an LDAP URL filter string.

**Function Parameters:**

_`string`_

String to apply RFC 4515 and URL escpaing rules to. AVPs and pseudo variables do get expanded. Example: `"cn=$avp(name)"`

_`avp_spec (var)`_

AVP to store resulting RFC 4515 and URL encoded string, e.g. `$avp(ldap_search)` or `$avp(10)`

**Return Values:**

`1` (TRUE)

RFC 4515 and URL encoded `filter_component` stored as AVP `avp_name`

`-1` (FALSE)

Internal error

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE, and ONREPLY\_ROUTE.

**Example�1.19.�Example Usage**

...
if (!ldap\_filter\_url\_encode("cn=$avp(name)", $avp(name\_esc)))
{
    # RFC 4515/URL encoding failed --> silently discard request
    exit;
}

xlog("L\_INFO", "encoded LDAP filter component: \[$avp(name\_esc)\]\\n");

if (ldap\_search(
     "ldap://h350/ou=commObjects,dc=example,dc=com??sub?($avp(name\_esc))"))
    { ... }
...
			

  

## 1.6.�Exported Async Functions

### 1.6.1.�ldap\_search(ldap\_url)

Performs an LDAP search operation using given LDAP URL and stores result internally for later retrieval by `ldap_result*` functions. If one ore more LDAP entries are found the function returns the number of found entries which evaluates to TRUE in the OpenSIPS configuration script. It returns `-1` (`FALSE`) in case no LDAP entry was found, and `-2` (`FALSE`) if an internal error like e.g. an LDAP error occurred.

**Function Parameters:**

_`ldap_url (string)`_

An LDAP URL defining the LDAP search operation (refer to [Section�1.1.2, “LDAP URLs”](#ldap-urls "1.1.2.�LDAP URLs") for a description of the LDAP URL format). The hostport part must be one of the LDAP session names declared in the LDAP configuration script.

**Example�1.20.�Example Usage of ldap\_url**

Search with LDAP session named `sipaccounts`, base `ou=sip,dc=example,dc=com`, `one` level deep using search filter `(cn=schlatter)` and returning all attributes:

ldap://sipaccounts/ou=sip,dc=example,dc=com??one?(cn=schlatter)

Subtree search with LDAP session named `ldap1`, base `dc=example,dc=com` using search filter `(cn=$(avp(name)))` and returning `SIPIdentityUserName` and `SIPIdentityServiceLevel` attributes

ldap://ldap\_1/dc=example,dc=com?
       SIPIdentityUserName,SIPIdentityServiceLevel?sub?(cn=$(avp(name)))
	        

  

**Return Values:**

`n` > 0 (TRUE):

*   Found `n` matching LDAP entries
    

`-1` (FALSE):

*   No matching LDAP entries found
    

`-2` (FALSE):

*   LDAP error (e.g. LDAP server unavailable), or
    
*   internal error
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE, and ONREPLY\_ROUTE.

**Example�1.21.�Example Usage**

...
# ldap search

route {
	async( ldap\_search("ldap://sipaccounts/ou=sip,dc=example,dc=com??one?(cn=$rU)"), resume);
}
....
route\[resume\] {
{
    switch ($rc)
    {
    case -1:
        # no LDAP entry found
        sl\_send\_reply(404, "User Not Found");
        exit;
    case -2:
        # internal error
        sl\_send\_reply(500, "Internal server error");
        exit;
    default:
        exit;
    }
    xlog("L\_INFO", "ldap\_search: found \[$retcode\] entries for (cn=$rU)");

    # save telephone number in $avp(tel\_number)
    ldap\_result("telephoneNumber", $avp(tel\_number)");
...
}
			

  

## 1.7.�Installation & Running

### 1.7.1.�Compiling the Module

OpenLDAP library (libldap) and header files (libldap-dev) v2.1 or greater (this module was tested with v2.1.3 and v2.3.32) are required for compiling the LDAP module. The OpenLDAP source is available at [http://www.openldap.org/](http://www.openldap.org/).

The OpenLDAP library is available pre-compiled for most UNIX/Linux flavors. On Debian/Ubuntu, the following packages must be installed:

\# apt-get install libldap2 libldap2-dev

.

## Chapter�2.�Developer Guide

## 2.1.�Overview

The LDAP module API can be used by other OpenSIPS modules to implement LDAP search functionality. This frees the module implementer from having to care about LDAP connection management and configuration.

In order to use this API, a module has to load the API using the `load_ldap_api` function which returns a pointer to a `ldap_api` structure. This structure includes pointers to the API functions described below. The LDAP module source file `api.h` includes all declarations needed to load the API, it has to be included in the file that loads the API. Loading the API is typically done inside a module's `mod_init` call as the following example shows:

**Example�2.1.�Example code fragment to load LDAP module API**

#include "../../sr\_module.h"
#include "../ldap/api.h"

/\*
 \* global pointer to ldap api
 \*/
extern ldap\_api\_t ldap\_api;

...

static int mod\_init(void)
{
    /\*
     \* load the LDAP API
     \*/
    if (load\_ldap\_api(&ldap\_api) != 0)
    {
        LM\_ERR("Unable to load LDAP API - this module requires ldap module\\n");
        return -1;
    }

    ...
}

...
		
				

  

The API functions can then be used like in the following example:

**Example�2.2.�Example LDAP module API function call**

...
	
    rc = ldap\_api.ldap\_rfc4515\_escape(str1, str2, 0);	
				
...		
		
				

  

## 2.2.�API Functions

### 2.2.1.�ldap\_params\_search

Performs an LDAP search using the parameters given as function arguments.

typedef int (\*ldap\_params\_search\_t)(int\* \_ld\_result\_count,
                                    char\* \_lds\_name,
                                    char\* \_dn,
                                    int \_scope,
                                    char\*\* \_attrs,
                                    char\* \_filter,
                                    ...);

			

**Function arguments:**

int\* \_ld\_result\_count

The function stores the number of returned LDAP entries in `_ld_result_count`.

char\* \_lds\_name

LDAP session name as configured in the LDAP module configuration file.

char\* \_dn

LDAP search DN.

int \_scope

LDAP search scope, one of `LDAP_SCOPE_ONELEVEL`, `LDAP_SCOPE_BASE`, or `LDAP_SCOPE_SUBTREE`, as defined in OpenLDAP's `ldap.h`.

char\*\* \_attrs

A null-terminated array of attribute types to return from entries. If empty (`NULL`), all attribute types are returned.

char\* \_filter

LDAP search filter string according to RFC 4515. `printf` patterns in this string do get replaced with the function arguments' values following the `_filter` argument.

**Return Values:**

\-1

Internal error.

0

Success, `_ld_result_count` includes the number of LDAP entries found.

### 2.2.2.�ldap\_url\_search

Performs an LDAP search using an LDAP URL.

typedef int (\*ldap\_url\_search\_t)(char\* \_ldap\_url,
                                 int\* \_result\_count);

			

**Function arguments:**

char\* \_ldap\_url

LDAP URL as described in [Section�1.1.2, “LDAP URLs”](#ldap-urls "1.1.2.�LDAP URLs").

int\* \_result\_count

The function stores the number of returned LDAP entries in `_ld_result_count`.

**Return Values:**

\-1

Internal error.

0

Success, `_ld_result_count` includes the number of LDAP entries found.

### 2.2.3.�ldap\_result\_attr\_vals

Retrieve the value(s) of a returned LDAP attribute. The function accesses the LDAP result returned by the last call of `ldap_params_search` or `ldap_url_search`. The `berval` structure is defined in OpenLDAP's `ldap.h`, which has to be included.

This function allocates memory to store the LDAP attribute value(s). This memory has to freed with the function `ldap_value_free_len` (see next section).

typedef int (\*ldap\_result\_attr\_vals\_t)(str\* \_attr\_name,
                                       struct berval \*\*\*\_vals);
									   
typedef struct berval {
        ber\_len\_t       bv\_len;
        char            \*bv\_val;
} BerValue;

			

**Function arguments:**

str\* \_attr\_name

`str` structure holding the LDAP attribute name.

struct berval \*\*\*\_vals

A null-terminated array of the attribute's value(s).

**Return Values:**

\-1

Internal error.

0

Success, `_vals` includes the attribute's value(s).

1

No attribute value found.

### 2.2.4.�ldap\_value\_free\_len

Function used to free memory allocated by `ldap_result_attr_vals`. The `berval` structure is defined in OpenLDAP's `ldap.h`, which has to be included.

typedef void (\*ldap\_value\_free\_len\_t)(struct berval \*\*\_vals);

typedef struct berval {
        ber\_len\_t       bv\_len;
        char            \*bv\_val;
} BerValue;

			

**Function arguments:**

struct berval \*\*\_vals

`berval` array returned by `ldap_result_attr_vals`.

### 2.2.5.�ldap\_result\_next

Increments the LDAP result pointer.

typedef int (\*ldap\_result\_next\_t)();

			

**Return Values:**

\-1

No LDAP result found, probably because `ldap_params_search` or `ldap_url_search` was not called.

0

Success, LDAP result pointer points now to next result.

1

No more results available.

### 2.2.6.�ldap\_str2scope

Converts LDAP search scope string into integer value e.g. for `ldap_params_search`.

typedef int (\*ldap\_str2scope\_t)(char\* scope\_str);

			

**Function arguments:**

char\* scope\_str

LDAP search scope string. One of "one", "onelevel", "base", "sub", or "subtree".

**Return Values:**

\-1

`scope_str` not recognized.

n >= 0

LDAP search scope integer.

### 2.2.7.�ldap\_rfc4515\_escape

Applies escaping rules described in [Section�1.5.5, “ldap\_filter\_url\_encode(string, avp\_spec)”](#ldap-filter-url-encode-fn "1.5.5.�ldap_filter_url_encode(string, avp_spec)").

typedef int (\*ldap\_rfc4515\_escape\_t)(str \*sin, str \*sout, int url\_encode);

			

**Function arguments:**

str \*sin

`str` structure holding the string to apply the escaping rules.

str \*sout

`str` structure holding the escaped string. The length of this string must be at least three times the length of `sin` plus one.

int url\_encode

Flag that specifies if a '?' character gets escaped with '%3F' or not. If `url_encode` equals `0`, '?' does not get escaped.

**Return Values:**

\-1

Internal error.

0

Success, `sout` contains escaped string.

### 2.2.8.�get\_ldap\_handle

Returns the OpenLDAP LDAP handle for a specific LDAP session. This allows a module implementor to use the OpenLDAP API functions directly, instead of using the API functions exported by the OpenSIPS LDAP module. The `LDAP` structure is defined in OpenLDAP's `ldap.h`, which has to be included.

typedef int (\*get\_ldap\_handle\_t)(char\* \_lds\_name, LDAP\*\* \_ldap\_handle);

			

**Function arguments:**

char\* \_lds\_name

LDAP session name as specified in the LDAP module configuration file.

LDAP\*\* \_ldap\_handle

OpenLDAP LDAP handle returned by this function.

**Return Values:**

\-1

Internal error.

0

Success, `_ldap_handle` contains the OpenLDAP LDAP handle.

### 2.2.9.�get\_last\_ldap\_result

Returns the OpenLDAP LDAP handle and OpenLDAP result handle of the last LDAP search operation. These handles can be used as input for OpenLDAP LDAP result API functions. `LDAP` and `LDAPMessage` structures are defined in OpenLDAP's `ldap.h`, which has to be included.

typedef void (\*get\_last\_ldap\_result\_t)
	     (LDAP\*\* \_last\_ldap\_handle, LDAPMessage\*\* \_last\_ldap\_result);

			

**Function arguments:**

LDAP\*\* \_last\_ldap\_handle

OpenLDAP LDAP handle returned by this function.

LDAPMessage\*\* \_last\_ldap\_result

OpenLDAP result handle returned by this function.

## 2.3.�Example Usage

The following example shows how this API can be used to perform an LDAP search operation. It is assumed that the API is loaded and available through the `ldap_api` pointer.

...
	
int rc, ld\_result\_count, scope = 0;
char\* sip\_username = "test";

/\*
 \* get LDAP search scope integer
 \*/
scope = ldap\_api.ldap\_str2scope("sub");
if (scope == -1)
{
    LM\_ERR("ldap\_str2scope failed\\n");
    return -1;
}

/\*
 \* perform LDAP search
 \*/

if (ldap\_api.ldap\_params\_search(
       &ld\_result\_count,
       "campus",
       "dc=example,dc=com",
       scope,
       NULL,
       "(&(objectClass=SIPIdentity)(SIPIdentityUserName=%s))",
       sip\_username)
     != 0)
{
    LM\_ERR("LDAP search failed\\n");
    return -1;
}

/\*
 \* check result count
 \*/
if (ld\_result\_count < 1)
{
    LM\_ERR("LDAP search returned no entry\\n");
    return 1;
}

/\*
 \* get password attribute value 
 \*/
 
struct berval \*\*attr\_vals = NULL;
str ldap\_pwd\_attr\_name = str\_init("SIPIdentityPassword");
str res\_password;

rc = ldap\_api.ldap\_result\_attr\_vals(&ldap\_pwd\_attr\_name, &attr\_vals);
if (rc < 0)
{
    LM\_ERR("ldap\_result\_attr\_vals failed\\n");
    ldap\_api.ldap\_value\_free\_len(attr\_vals);
    return -1;
}
if (rc == 1)
{
    LM\_INFO("No password attribute value found for \[%s\]\\n", sip\_username);
    ldap\_api.ldap\_value\_free\_len(attr\_vals);
    return 2;
}

res\_password.s = attr\_vals\[0\]->bv\_val;
res\_password.len = attr\_vals\[0\]->bv\_len;

ldap\_api.ldap\_value\_free\_len(attr\_vals);

LM\_INFO("Password for user \[%s\]: \[%s\]\\n", sip\_username, res\_password.s);

...

return 0;		

		

## Resources

\[RFC4510\] _[Lightweight Directory Access Protocol (LDAP): Technical Specification Road Map](http://tools.ietf.org/html/rfc4510)_. June 2006. Internet Engineering Task Force.

\[RFC4511\] _[Lightweight Directory Access Protocol (LDAP): The Protocol](http://tools.ietf.org/html/rfc4511)_. June 2006. Internet Engineering Task Force.

\[RFC4514\] _[Lightweight Directory Access Protocol (LDAP): String Representation of Distinguished Names](http://tools.ietf.org/html/rfc4514)_. June 2006. Internet Engineering Task Force.

\[RFC4515\] _[Lightweight Directory Access Protocol (LDAP): String Representation of Search Filters](http://tools.ietf.org/html/rfc4515)_. June 2006. Internet Engineering Task Force.

\[RFC4516\] _[Lightweight Directory Access Protocol (LDAP): Uniform Resource Locator](http://tools.ietf.org/html/rfc4516)_. June 2006. Internet Engineering Task Force.

\[RFC2617\] _[HTTP Authentication: Basic and Digest Access Authentication](http://tools.ietf.org/html/rfc2617)_. June 1999. Internet Engineering Task Force.

\[RFC3261\] _[SIP: Session Initiation Protocol](http://tools.ietf.org/html/rfc3261)_. June 2002. Internet Engineering Task Force.

\[H.350\] _[Directory Services Architecture for Multimedia Conferencing](http://www.itu.int/rec/T-REC-H.350/en)_. August 2003. ITU-T.

\[H.350.4\] _[Directory services architecture for SIP](http://www.itu.int/rec/T-REC-H.350.4/en)_. August 2003. ITU-T.

## Chapter�3.�Contributors

## 3.1.�By Commit Statistics

**Table�3.1.�Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)**

�

Name

DevScore

Commits

Lines ++

Lines --

1.

Christian Schlatter

57

6

5764

237

2.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

26

21

151

140

3.

Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita))

22

5

1359

252

4.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

17

14

62

76

5.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

13

10

19

62

6.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

12

9

84

83

7.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

12

3

155

420

8.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

5

3

5

8

9.

Razvan Pistolea

4

1

39

66

10.

Anca Vamanu

3

1

14

14

  

**All remaining contributors**: Dusan Klinec ([@ph4r05](https://github.com/ph4r05)), Petr P�sař, Henning Westerholt ([@henningw](https://github.com/henningw)), Konstantin Bokarius, Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Zero King ([@l2dy](https://github.com/l2dy)), Edson Gellert Schubert.

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 3.2.�By Commit Activity

**Table�3.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Jul 2007 - Oct 2024

2.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Mar 2014 - May 2024

3.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Feb 2023

4.

Petr P�sař

Mar 2022 - Mar 2022

5.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Jun 2011 - Jan 2021

6.

Zero King ([@l2dy](https://github.com/l2dy))

Mar 2020 - Mar 2020

7.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Apr 2019

8.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

9.

Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita))

Oct 2014 - Jan 2017

10.

Dusan Klinec ([@ph4r05](https://github.com/ph4r05))

Dec 2015 - Dec 2015

  

**All remaining contributors**: Anca Vamanu, Razvan Pistolea, Henning Westerholt ([@henningw](https://github.com/henningw)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Christian Schlatter.

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�4.�Documentation

## 4.1.�Contributors

**Last edited by:** Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Christian Schlatter.

_Documentation Copyrights:_

Copyright � 2007 University of North Carolina