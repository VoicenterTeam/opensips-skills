## 1.4.�Exported Functions

### 1.4.1.�h350\_sipuri\_lookup(sip\_uri)

This function performs an LDAP search query for an H.350 commObject with a SIPIdentitySIPURI of `sip_uri`. The `sip_uri` parameter first gets escaped according the rules for LDAP filter strings. The result of the LDAP search is stored internally and can be accessed either by one of the _h350\_result\*_ or one of the _ldap\_result\*_ functions from the OpenSIPS LDAP module.

The function returns `-1` (FALSE) for internal errors, and `-2` (FALSE) if no H.350 commObject was found with a matching `sip_uri`. `n` > 0 (TRUE) is returned if `n` H.350 commObjects were found.

This function can be used from REQUEST\_ROUTE, ONREPLY\_ROUTE, FAILURE\_ROUTE and BRANCH\_ROUTE.

**Function Parameters:**

sip\_uri (string)

H.350 SIPIdentitySIPURI to search for in directory.

**Return Values:**

`n` > 0 (TRUE):

*   `n` H.350 commObjects found.
    

`-1` (FALSE):

*   Internal error occurred.
    

`-2` (FALSE):

*   No H.350 commObject found.
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE, and ONREPLY\_ROUTE.

**Example�1.5.�Example Usage**

#
# H.350 lookup for callee
#

if (!h350\_sipuri\_lookup("sip:$rU@$rd"))
{
    switch ($retcode)
    {
    case -2:
        xlog("L\_INFO", 
             "h350 callee lookup: no entry found in H.350 directory");
        exit;
    case -1:
        sl\_send\_reply(500, "Internal server error");
        exit;
    }
}

# now h350\_result\* or ldap\_result\* functions can be used
            

  

### 1.4.2.�h350\_auth\_lookup(auth\_username, "username\_avp\_spec/pwd\_avp\_spec")

This function performs an LDAP search query for SIP digest authentication credentials in an H.350 directory. The H.350 directory is searched for a commObject with SIPIdentityUserName of `auth_username`. If such a commObject is found, the SIP digest authentication username and password are stored in AVPs `username_avp_spec` and `pwd_avp_spec`, respectively. _pv\_\*\_authorize_ functions from AUTH module can then be used to perform SIP digest authentication.

The function returns `1` (TRUE) if an H.350 commObject was found, `-1` (FALSE) in case of an internal error, and `-2` (FALSE) if no matching commObject was found.

This function can be used from REQUEST\_ROUTE, ONREPLY\_ROUTE, FAILURE\_ROUTE and BRANCH\_ROUTE.

**Function Parameters:**

auth\_username (string)

H.350 SIPIdentityUserName to search for in directory.

username\_avp\_spec (var)

Specification for authentication username AVP, e.g. `$avp(username)`.

pwd\_avp\_spec (var)

Specification for authentication password AVP, e.g. `$avp(pwd)`.

**Return Values:**

`1` (TRUE):

*   H.350 commObject found and SIP digest authentication credentials stored in `username_avp_spec` and `pwd_avp_spec`.
    

`-1` (FALSE):

*   Internal error occurred.
    

`-2` (FALSE):

*   No H.350 commObject found.
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE, and ONREPLY\_ROUTE.

**Example�1.6.�Example Usage**

\# -- auth params --
modparam("auth", "username\_spec", "$avp(auth\_user)")
modparam("auth", "password\_spec", "$avp(auth\_pwd)")
modparam("auth", "calculate\_ha1", 1)

# -- h350 params --
modparam("h350", "ldap\_session", "h350")
modparam("h350", "base\_dn", "ou=h350,dc=example,dc=com")
modparam("h350", "search\_scope", "one")


route\[1\]
{
    #
    # H.350 based SIP digest authentication 
    #
     
    # challenge all requests not including an Auth header
    if (!(is\_present\_hf("Authorization") || 
          is\_present\_hf("Proxy-Authorization")))
    {
        if (is\_method("REGISTER"))
        {
            www\_challenge("example.com", 0);
            exit;
        }
        proxy\_challenge("example.com", 0);
        exit;
    }

    # get digest password from H.350 using auth username ($au)
    if (!h350\_auth\_lookup($au, 
                          "$avp(auth\_user)/$avp(auth\_pwd)"))
    {
        switch ($retcode)
        {
        case -2:
            sl\_send\_reply(401, "Unauthorized");
            exit;
        case -1:
            sl\_send\_reply(500, "Internal server error");
            exit;
        }
    }

    # REGISTER requests
    if (is\_method("REGISTER"))
    {
        if (!pv\_www\_authorize("example.com"))
        {
            if ($retcode == -5)
            {
                sl\_send\_reply(500, "Internal server error");
                exit;    
            }
            else {
                www\_challenge("example.com", 0);
                exit;
            }
        }

        consume\_credentials();
        xlog("L\_INFO", 
             "REGISTER request successfully authenticated");
        return(1);
    }

    # non-REGISTER requests
    if (!pv\_proxy\_authorize("example.com"))
    {
        if ($retcode == -5)
        {
            sl\_send\_reply(500, "Internal server error");
            exit;    
        }
        else {
            proxy\_challenge("example.com", 0);
            exit;
        }
    }

    consume\_credentials();
    xlog("L\_INFO", "$rm request successfully authenticated");
    return(1);
}
            

  

### 1.4.3.�h350\_result\_call\_preferences(avp\_name\_prefix)

This function parses the callPreferenceURI attribute of an H.350 commObject, which must have been fetched through _h350\_\*\_lookup_ or _ldap\_search_. callPreferenceURI is a multi-valued attribute that stores call preference rules like e.g. forward-on-busy or forward-unconditionally. _Directory services architecture for call forwarding and preferences_ [\[H.350.6\]](#H350-6 "Directory services architecture for call forwarding and preferences") defines a format for simple call forwarding rules:

> `target_uri type[:argument]`

In a SIP environment, `target_uri` is typically the call forwarding rule's target SIP URI, although it could be any type of URI, e.g. an HTTP pointer to a CPL script. Four different values are specified for `type`: `b` for "forward on busy", `n` for "forward on no answer", `u` for "forward unconditionally", and `f` for "forward on destination not found". The optional `argument` is a string indicating the time in milliseconds after which the call forwarding should occur.

**Example�1.7.�Example H.350 callPreferenceURI simple call forwarding rules**

\# Example 1:
# forward to sip:voicemail@example.com on no answer after 15 seconds:

callPreferenceURI: sip:voicemail@example.com n:15000

# Example 2:
# unconditionally forward to sip:alice@example.com:

callPreferenceURI: sip:alice@example.com u

# Example 3:
# forward to sip:bob@example.com and sip:alice@example.com
# (forking) on destination not found:

callPreferenceURI: sip:bob@example.com f
callPreferenceURI: sip:alice@example.com f
            

  

_h350\_result\_call\_preferences_ stores these call forwarding rules as AVPs according to the following rules:

> #
> # AVP storing a forwarding rule's target URI
> #
>             
> AVP name  = avp\_name\_prefix + '\_' + type
> AVP value = target\_uri
> 
> #
> # AVP storing a forwarding rule's argument
> #
> 
> AVP name  = avp\_name\_prefix + '\_' + type + '\_t'
> AVP value = argument / 1000
>             

Example 1 from above would result in two AVPs: `$avp("prefix_n") = "sip:voicemail@example.com"` and `$avp("prefix_n_t") = 15`.

Example 2: `$avp("prefix_u") = "sip:alice@example.com"`.

Example 3: `$avp("prefix_f[1]") = "sip:bob@example.com"` and `$avp("prefix_f[2]]") = "sip:alice@example.com"`.

These AVPs can then be used to implement the desired behavior in the OpenSIPS routing script.

This function returns the number of successfully parsed simple call forwarding rules (TRUE), in case the H.350 callPreferenceURI attribute contained one or multiple values matching the simple call forwarding rule syntax described above. It returns `-1` (FALSE) for internal errors, and `-2` (FALSE) if none of the rules matched or if no callPreferenceURI attribute was found.

This function can be used from REQUEST\_ROUTE, ONREPLY\_ROUTE, FAILURE\_ROUTE and BRANCH\_ROUTE.

**Function Parameters:**

avp\_name\_prefix (string)

Name prefix for call forwarding rule AVPs, as described above.

**Return Values:**

`n` > 0 (TRUE):

*   `n` simple call forwarding rules found.
    

`-1` (FALSE):

*   Internal error occurred.
    

`-2` (FALSE):

*   No simple call forwarding rule found, or callPreferenceURI not present.
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE, and ONREPLY\_ROUTE.

**Example�1.8.�Example Usage**

#
# H.350 lookup for callee
#

... h350\_sipuri\_lookup("sip:$rU@$rd") ...

#
# store H.350 call preferences in AVP
#

if (!h350\_result\_call\_preferences("callee\_pref\_") && ($retcode == -1))
{
    sl\_send\_reply(500, "Internal server error");
    exit;
}

# $avp(callee\_pref\_u)   == CFU URI(s)
# $avp(callee\_pref\_n)   == CFNR URI(s)
# $avp(callee\_pref\_n\_t) == CFNR timeout in seconds
# $avp(callee\_pref\_b)   == CFB URI(s)
# $avp(callee\_pref\_f)   == CFOFFLINE URI(s)

#
# Example for forward-unconditionally (CFU)
#

if ($avp(callee\_pref\_u) != NULL)
{
    # push CFU URI into R-URI and additional branches
    # --> request can fork
    $ru = $avp(callee\_pref\_u);
    $avp(callee\_pref\_u) = NULL;
    while ($avp(callee\_pref\_u)!=NULL) {
        $branch = $avp(callee\_pref\_u);
        $avp(callee\_pref\_u) = NULL;
    }
    sl\_send\_reply(181, "Call is being forwarded");
    t\_relay();
    exit;
}
            

  

### 1.4.4.�h350\_result\_service\_level(avp\_name\_prefix)

_Directory services architecture for SIP_ [\[H.350.4\]](#H350-4 "Directory services architecture for SIP") defines a multi-valued LDAP attribute named SIPIdentityServiceLevel, which can be used to store SIP account service level values in an LDAP directory. This function parses the SIPIdentityServiceLevel attribute and stores all service level values as AVPs for later retrieval in the OpenSIPS routing script. The function accesses the H.350 commObject fetched by a call to _h350\_\*\_lookup_ or _ldap\_search_.

The resulting AVPs have a name of the form `avp_name_prefix + SIPIdentityServiceLevel attribute value`, and an integer value of `1`.

**Example�1.9.�Example SIPIdentityServiceLevel values and resulting AVPs**

SIPIdentityServiceLevel: longdistance
SIPIdentityServiceLevel: international
SIPIdentityServiceLevel: 900

after calling h350\_result\_service\_level("sl\_"), the following AVPs 
will be available in the routing script:

$avp("sl\_longdistance") = 1
$avp("sl\_international") = 1
$avp("sl\_900") = 1
            

  

This function returns the number of added AVPs (TRUE), `-1` (FALSE)for internal errors, and `-2` (FALSE)if no SIPIdentityServiceLevel attribute was found.

The function can be used from REQUEST\_ROUTE, ONREPLY\_ROUTE, FAILURE\_ROUTE and BRANCH\_ROUTE.

**Function Parameters:**

avp\_name\_prefix (string)

Name prefix for service level AVPs, as described above.

**Return Values:**

`n` > 0 (TRUE):

*   `n` AVPs added.
    

`-1` (FALSE):

*   Internal error occurred.
    

`-2` (FALSE):

*   No SIPIdentityServiceLevel attribute found.
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE, and ONREPLY\_ROUTE.

**Example�1.10.�Example Usage**

#
# H.350 SIP digest authentication for caller
#

... h350\_auth\_lookup("$au", ...) ...

#
# store caller's service level as AVP
#

if (!h350\_result\_service\_level("caller\_sl\_") && ($retcode == -1))
{
    sl\_send\_reply(500, "Internal server error");
    exit;
}

#
# make routing decision based on service level AVPs
#

if ($avp(caller\_sl\_international) != NULL)
{
    t\_relay();
} 
else {
    sl\_send\_reply(403, "Forbidden");    
}
exit;