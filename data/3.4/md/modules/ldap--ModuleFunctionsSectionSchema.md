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