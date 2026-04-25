## 1.3.�Exported Parameters

### 1.3.1.�`domain_suffix` (string)

The domain suffix to be added to the domain name obtained from the digits of an E164 number. Can be overridden by a parameter to enum\_query.

Default value is “e164.arpa.”

**Example�1.1.�Setting domain\_suffix module parameter**

modparam("enum", "domain\_suffix", "e1234.arpa.")

  

### 1.3.2.�`tel_uri_params` (string)

A string whose contents is appended to each new tel URI in the request as tel URI parameters.

### Note

Currently OpenSIPS does not support tel URIs. This means that at present tel\_uri\_params is appended as URI parameters to every URI.

Default value is “”

**Example�1.2.�Setting tel\_uri\_params module parameter**

modparam("enum", "tel\_uri\_params", ";npdi")

  

### 1.3.3.�`i_enum_suffix` (string)

The domain suffix to be used for i\_enum\_query() lookups. Can be overridden by a parameter to i\_enum\_query.

Default value is “e164.arpa.”

**Example�1.3.�Setting i\_enum\_suffix module parameter**

modparam("enum", "i\_enum\_suffix", "e1234.arpa.")

  

### 1.3.4.�`isn_suffix` (string)

The domain suffix to be used for isn\_query() lookups. Can be overridden by a parameter to isn\_query.

Default value is “freenum.org.”

**Example�1.4.�Setting isn\_suffix module parameter**

modparam("enum", "isn\_suffix", "freenum.org.")

  

### 1.3.5.�`branchlabel` (string)

This parameter determines which label i\_enum\_query() will use to branch off to the infrastructure ENUM tree.

Default value is “"i"”

**Example�1.5.�Setting branchlabel module parameter**

modparam("enum", "branchlabel", "i")

  

### 1.3.6.�`bl_algorithm` (string)

This parameter determines which algorithm i\_enum\_query() will use to select the position in the DNS tree where the infrastructure tree branches off the user ENUM tree.

If set to "cc", i\_enum\_query() will always inserts the label at the country-code level. Examples: i.1.e164.arpa, i.3.4.e164.arpa, i.2.5.3.e164.arpa

If set to "txt", i\_enum\_query() will look for a TXT record at \[branchlabel\].\[reverse-country-code\].\[i\_enum\_suffix\] to indicate after how many digits the label should in inserted.

**Example�1.6.�Zone file example**

i.1.e164.arpa.                     IN TXT   "4"
9.9.9.8.7.6.5.i.4.3.2.1.e164.arpa. IN NAPTR "NAPTR content for  +1 234 5678 999"

  

If set to "ebl", i\_enum\_query() will look for an EBL (ENUM Branch Label) record at \[branchlabel\].\[reverse-country-code\].\[i\_enum\_suffix\]. See http://www.ietf.org/internet-drafts/draft-lendl-enum-branch-location-record-00.txt for a description of that record and the meaning of the fields. The RR type for the EBL has not been allocated yet. This version of the code uses 65300. See resolve.h.

**Example�1.7.�Zone file example**

i.1.e164.arpa.     TYPE65300  \\# 14 (
                              04    ; position
                              01 69 ; separator
                              04 65 31 36 34 04 61 72 70 61 00 ; e164.arpa
;                               )
9.9.9.8.7.6.5.i.4.3.2.1.e164.arpa. IN NAPTR "NAPTR content for  +1 234 5678 999"

  

Default value is “cc”

**Example�1.8.�Setting the bl\_algorithm module parameter**

modparam("enum", "bl\_algorithm", "txt")