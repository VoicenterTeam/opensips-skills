## 1.3.�Exported Parameters

### 1.3.1.�`restore_mode` (string)

There are 3 mode of restoring the original headers (FROM/TO) URI:

*   “none” - no information about original URI is stored; restoration is not possible.
    
*   “manual” - all following replies will be restored, except for the sequential requests - these must be manually updated based on original URI.
    
*   “auto” - all sequential requests and replies will be automatically updated based on stored original URI.
    

_This parameter is optional, it's default value being “auto”._

**Example�1.1.�Set `restore_mode` parameter**

...
modparam("uac","restore\_mode","auto")
...
				

  

### 1.3.2.�`restore_passwd` (string)

String password to be used to encrypt the RR storing parameter (when replacing the TO/FROM headers). If empty, no encryption will be used.

_Default value of this parameter is empty._

**Example�1.2.�Set `restore_passwd` parameter**

...
modparam("uac","restore\_passwd","my\_secret\_passwd")
...
				

  

### 1.3.3.�`rr_from_store_param` (string)

Name of Record-Route header parameter that will be used to store (encoded) the original FROM URI.

_This parameter is optional, it's default value being “vsf”._

**Example�1.3.�Set `rr_from_store_param` parameter**

...
modparam("uac","rr\_from\_store\_param","my\_Fparam")
...
				

  

### 1.3.4.�`rr_to_store_param` (string)

Name of Record-Route header parameter that will be used to store (encoded) the original TO URI.

_This parameter is optional, it's default value being “vst”._

**Example�1.4.�Set `rr_to_store_param` parameter**

...
modparam("uac","rr\_to\_store\_param","my\_Tparam")
...
				

  

### 1.3.5.�`force_dialog` (int)

Force create dialog if it is not created from the configuration script.

Default value is no.

**Example�1.5.�Set `force_dialog` parameter**

...
modparam("uac", "force\_dialog", yes)
...