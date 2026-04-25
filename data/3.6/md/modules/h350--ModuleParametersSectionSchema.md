## 1.3.�Exported Parameters

### 1.3.1.�ldap\_session (string)

Name of the LDAP session to be used for H.350 queries, as defined in the LDAP module configuration file.

Default value: ""

**Example�1.2.�`ldap_session` parameter usage**

modparam("h350", "ldap\_session", "h350");
            

  

### 1.3.2.�base\_dn (string)

Base LDAP DN to start LDAP search for H.350 entries. For best performance, this should be set to the direct ancestor of the H.350 objects.

Default value: ""

**Example�1.3.�`base_dn` parameter usage**

modparam("h350", "base\_dn", "ou=h350,dc=example,dc=com");
            

  

### 1.3.3.�search\_scope (string)

LDAP search scope for H.350 queries, one of "one", "base", or "sub".

Default value: "one"

**Example�1.4.�`search_scope` parameter usage**

modparam("h350", "search\_scope", "sub");