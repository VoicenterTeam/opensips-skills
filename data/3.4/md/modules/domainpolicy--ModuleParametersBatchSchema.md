## 1.3.�Exported Parameters

### 1.3.1.�`db_url` (string)

This is URL of the database to be used.

Default value is “mysql://opensipsro:opensipsro@localhost/opensips”

**Example�1.1.�Setting db\_url parameter**

modparam("domainpolicy", "db\_url", "postgresql://user:pass@db\_host/opensips")

  

### 1.3.2.�`dp_table` (string)

Name of table containing the local support domain policy setup.

Default value is “domainpolicy”.

**Example�1.2.�Setting dp\_table parameter**

modparam("domainpolicy", "dp\_table", "supportedpolicies")

  

### 1.3.3.�`dp_col_rule` (string)

Name of column containing the domain policy rule name which is equal to the URI as published in the domain policy NAPTRs.

Default value is “rule”.

**Example�1.3.�Setting dp\_col\_rule parameter**

modparam("domainpolicy", "dp\_col\_rule", "rules")

  

### 1.3.4.�`dp_col_type` (string)

Name of column containing the domain policy rule type. In the case of federation names, this is "fed". For standard referrals according to draft-lendl-speermint-technical-policy-00, this is "std". For direct domain lookups, this is "dom".

Default value is “type”.

**Example�1.4.�Setting dp\_col\_rule parameter**

modparam("domainpolicy", "dp\_col\_type", "type")

  

### 1.3.5.�`dp_col_att` (string)

Name of column containing the AVP's name. If the rule stored in this row triggers, than dp\_can\_connect() will add an AVP with that name.

Default value is “att”.

**Example�1.5.�Setting dp\_col\_att parameter**

modparam("domainpolicy", "dp\_col\_att", "attribute")

  

### 1.3.6.�`dp_col_val` (string)

Name of column containing the value for AVPs created by dp\_can\_connect().

Default value is “val”.

**Example�1.6.�Setting dp\_col\_val parameter**

modparam("domainpolicy", "dp\_col\_val", "values")

  

### 1.3.7.�`port_override_avp` (string)

This parameter defines the name of the AVP where dp\_apply\_policy() will look for an override port number.

Default value is “portoverride”.

**Example�1.7.�Setting port\_override\_avp parameter**

\# string named AVP
modparam("domainpolicy", "port\_override\_avp", "portoverride")

  

### 1.3.8.�`transport_override_avp` (string)

Name of the AVP which contains the override transport setting.

Default value is “transportoverride”.

**Example�1.8.�Setting transport\_override\_avp parameter**

\# string named AVP
modparam("domainpolicy", "transport\_override\_avp", "transportoverride")

  

### 1.3.9.�`domain_replacement_avp` (string)

Name of the AVP which contains a domain replacement.

Default value is “domainreplacement”.

**Example�1.9.�Setting domain\_replacement\_avp parameter**

\# string named AVP
modparam("domainpolicy", "domain\_replacement\_avp", "domainreplacement")

  

### 1.3.10.�`domain_prefix_avp` (string)

Name of the AVP which contains a domain prefix.

Default value is “domainprefix”.

**Example�1.10.�Setting domain\_prefix\_avp parameter**

\# string named AVP
modparam("domainpolicy", "domain\_prefix\_avp", "domainprefix")

  

### 1.3.11.�`domain_suffix_avp` (string)

Name of the AVP which contains a domain suffix.

Default value is “domainsuffix”.

**Example�1.11.�Setting domain\_suffix\_avp parameter**

\# string named AVP
modparam("domainpolicy", "domain\_suffix\_avp", "domainsuffix")

  

### 1.3.12.�`send_socket_avp` (string)

Name of the AVP which contains a send\_socket. The format of the send socket (the payload of this AVP) must be in the format \[proto:\]ip\_address\[:port\]. The function dp\_apply\_policy will look for this AVP and if defined, it will force the send socket to its value (smilar to the force\_send\_socket core function).

Default value is “sendsocket”.

**Example�1.12.�Setting send\_socket\_avp parameter**

\# string named AVP
modparam("domainpolicy", "send\_socket\_avp", "sendsocket")