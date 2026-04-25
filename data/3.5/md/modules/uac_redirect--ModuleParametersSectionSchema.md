## 1.3.�Exported Parameters

### 1.3.1.�`default_filter` (string)

The default behavior in filtering contacts. It may be “accept” or “deny”.

_The default value is “accept”._

**Example�1.1.�Set `default_filter` module parameter**

...
modparam("uac\_redirect","default\_filter","deny")
...
				

  

### 1.3.2.�`deny_filter` (string)

The regular expression for default deny filtering. It make sens to be defined on only if the `default_filter` parameter is set to “accept”. All contacts matching the `deny_filter` will be rejected; the rest of them will be accepted for redirection.

The parameter may be defined only one - multiple definition will overwrite the previous definitions. If more regular expression need to be defined, use the `set_deny_filter()` scripting function.

_This parameter is optional, it's default value being NULL._

**Example�1.2.�Set `deny_filter` module parameter**

...
modparam("uac\_redirect","deny\_filter",".\*@siphub\\.net")
...
				

  

### 1.3.3.�`accept_filter` (string)

The regular expression for default accept filtering. It make sens to be defined on only if the `default_filter` parameter is set to “deny”. All contacts matching the `accept_filter` will be accepted; the rest of them will be rejected for redirection.

The parameter may be defined only one - multiple definition will overwrite the previous definitions. If more regular expression need to be defined, use the `set_accept_filter()` scripting function.

_This parameter is optional, it's default value being NULL._

**Example�1.3.�Set `accept_filter` module parameter**

...
modparam("uac\_redirect","accept\_filter",".\*@siphub\\.net")
...