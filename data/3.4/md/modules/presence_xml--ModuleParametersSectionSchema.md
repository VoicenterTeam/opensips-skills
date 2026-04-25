## 1.3.�Exported Parameters

### 1.3.1.�`force_active` (int)

This parameter is used for permissions when handling Subscribe messages. If set to 1, subscription state is considered active and the presentity is not queried for permissions(should be set to 1 if not using an xcap server). Otherwise,the xcap server is queried and the subscription states is according to user defined permission rules. If no rules are defined for a certain watcher, the subscriptions remains in pending state and the Notify sent will have no body.

Note: When switching from one value to another, the watchers table must be emptied.

_Default value is “0”._

**Example�1.1.�Set `force_active` parameter**

...
modparam("presence\_xml", "force\_active", 1)
...

  

### 1.3.2.�`pidf_manipulation` (int)

Setting this parameter to 1 enables the features described in RFC 4827. It gives the possibility to have a permanent state notified to the users even in the case in which the phone is not online. The presence document is taken from the xcap server and aggregated together with the other presence information, if any exist, for each Notify that is sent to the watchers. It is also possible to have information notified even if not issuing any Publish (useful for services such as email, SMS, MMS).

_Default value is “0”._

**Example�1.2.�Set `pidf_manipulation` parameter**

...
modparam("presence\_xml", "pidf\_manipulation", 1)
...

  

### 1.3.3.�`xcap_server` (str)

The address of the xcap servers used for storage. This parameter is compulsory if the integrated\_xcap\_server parameter is not set. It can be set more that once, to construct an address list of trusted XCAP servers.

**Example�1.3.�Set `xcap_server` parameter**

...
modparam("presence\_xml", "xcap\_server", "xcap\_server.example.org")
modparam("presence\_xml", "xcap\_server", "xcap\_server.ag.org")
...

  

### 1.3.4.�`pres_rules_auid` (str)

This parameter should be configured if you are using the non integrated xcap mode and you need to use another pres-rules auid than the default 'pres-rules'.

**Example�1.4.�Set `pres_rules_auid` parameter**

...
modparam("presence\_xml", "pres\_rules\_auid", "org.openmobilealliance.pres-rules")
...

  

### 1.3.5.�`pres_rules_filename` (str)

This parameter should be configured if you are using the non integrated xcap mode and you need to configure another filename than the default 'index'.

**Example�1.5.�Set `pres_rules_filename` parameter**

...
modparam("presence\_xml", "pres\_rules\_filename", "pres-rules")
...

  

### 1.3.6.�`generate_offline_body` (str)

This parameter should be set to 0 if you want to prevent OpenSIPS from automatically generating a PIDF body when a publication expires or is explicitly terminated (a PUBLISH request is received with Expires: 0).

**Example�1.6.�Set `generate_offline_body` parameter**

...
modparam("presence\_xml", "generate\_offline\_body", 0)
...