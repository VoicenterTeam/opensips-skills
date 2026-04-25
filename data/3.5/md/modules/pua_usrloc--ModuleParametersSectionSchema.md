## 1.3.�Exported Parameters

### 1.3.1.�`default_domain` (str)

The default domain to use when constructing the presentity uri if it is missing from recorded aor.

_Default value is “NULL”._

**Example�1.1.�Set `default_domain` parameter**

...
modparam("pua\_usrloc", "default\_domain", "opensips.org")
...

  

### 1.3.2.�`entity_prefix` (str)

The prefix when construstructing entity attribute to be added to presence node in xml pidf. (ex: pres:user@domain ).

_Default value is “NULL”._

**Example�1.2.�Set `presentity_prefix` parameter**

...
modparam("pua\_usrloc", "entity\_prefix", "pres")
...

  

### 1.3.3.�`presence_server` (str)

The the address of the presence server. If set, it will be used as outbound proxy when sending PUBLISH requests.

**Example�1.3.�Set `presence_server` parameter**

...
modparam("pua\_usrloc", "presence\_server", "sip:pa@opensips.org:5075")
...