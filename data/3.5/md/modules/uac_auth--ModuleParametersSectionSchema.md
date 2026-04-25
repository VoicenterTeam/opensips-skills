## 1.3.�Exported Parameters

### 1.3.1.�`credential` (string)

Contains a multiple definition of credentials used to perform authentication.

NOTE that the password can be provided as a plain text password or as a precalculated HA1 as a hexa (lower case) string (of 32 chars) prefixed with "0x" (so a total of 34 chars).

_This parameter is required if UAC authentication is used._

**Example�1.1.�Set `credential` parameter**

...
modparam("uac\_auth","credential","username:domain:password")
modparam("uac\_auth","credential","username:domain:0xc17ba8157756f263d07e158504204629")
...
				

  

### 1.3.2.�`auth_realm_avp` (string)

The definition of an AVP that might contain the realm to be used to perform authentication.

_If you define it, you also need to define “auth\_username\_avp” ([auth\_username\_avp](#param_auth_username_avp "1.3.3.�auth_username_avp (string)")) and “auth\_password\_avp” ([auth\_password\_avp](#param_auth_password_avp "1.3.4.�auth_password_avp (string)"))._

**Example�1.2.�Set `auth_realm_avp` parameter**

...
modparam("uac\_auth","auth\_realm\_avp","$avp(10)")
...
				

  

### 1.3.3.�`auth_username_avp` (string)

The definition of an AVP that might contain the username to be used to perform authentication.

_If you define it, you also need to define “auth\_realm\_avp” ([auth\_realm\_avp](#param_auth_realm_avp "1.3.2.�auth_realm_avp (string)")) and “auth\_password\_avp” ([auth\_password\_avp](#param_auth_password_avp "1.3.4.�auth_password_avp (string)"))._

**Example�1.3.�Set `auth_username_avp` parameter**

...
modparam("uac\_auth","auth\_username\_avp","$avp(11)")
...
				

  

### 1.3.4.�`auth_password_avp` (string)

The definition of an AVP that might contain the password to be used to perform authentication. The password can be provided as a plain text password or as a precalculated HA1 as a hexa (lower case) string (of 32 chars) prefixed with "0x" (so a total of 34 chars) (for example "0xc17ba8157756f263d07e158504204629")

_If you define it, you also need to define “auth\_realm\_avp” ([auth\_realm\_avp](#param_auth_realm_avp "1.3.2.�auth_realm_avp (string)")) and “auth\_username\_avp” ([auth\_username\_avp](#param_auth_username_avp "1.3.3.�auth_username_avp (string)"))._

**Example�1.4.�Set `auth_password_avp` parameter**

...
modparam("uac\_auth","auth\_password\_avp","$avp(12)")
...