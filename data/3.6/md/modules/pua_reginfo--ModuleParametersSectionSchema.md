## 1.3.�Parameters

### 1.3.1.�`default_domain`(str)

The default domain for the registered users to be used when constructing the uri for the registrar callback.

_Default value is “NULL”._

**Example�1.1.�Set `default_domain` parameter**

...
modparam("pua\_reginfo", "default\_domain", "kamailio.org")
...

  

### 1.3.2.�`publish_reginfo`(int)

Whether or not to generate PUBLISH requests.

_Default value is “1” (enabled)._

**Example�1.2.�Set `publish_reginfo` parameter**

...
modparam("pua\_reginfo", "publish\_reginfo", 0)
...

  

### 1.3.3.�`outbound_proxy`(str)

The outbound\_proxy uri to be used when sending Subscribe and Publish requests.

_Default value is “NULL”._

**Example�1.3.�Set `outbound_proxy` parameter**

...
modparam("pua\_reginfo", "outbound\_proxy", "sip:proxy@kamailio.org")
...

  

### 1.3.4.�`server_address`(str)

The IP address of the server.

**Example�1.4.�Set `server_address` parameter**

...
modparam("pua\_reginfo", "server\_address", "sip:reginfo@160.34.23.12")
...

  

### 1.3.5.�`ul_domain`(str)

The domain for for querying the usrloc-database.

_Default value is “NULL” (not set)._

**Example�1.5.�Set `ul_domain` parameter**

...
modparam("pua\_reginfo", "ul\_domain", "location")
...

  

### 1.3.6.�`ul_identities_key`(str)

The Key, which may be used for retrieving multiple public identies for a user.

_Default value is “NULL” (not set)._

**Example�1.6.�Set `ul_identities_key` parameter**

...
modparam("pua\_reginfo", "ul\_identities\_key", "identities")
...
onreply\_route\[register\_reply\] {
	if (t\_check\_status("200") && $hdr(P-Associated-URI)) {
        ul\_add\_key("location", "$tU@$td", "identities", "$hdr(P-Associated-URI)");
        reginfo\_update("$tU@$td");
	}
}

...